/**
 * BioSphere living-planet engine.
 *
 * Pure, deterministic functions power every endpoint. A species is a function
 * of its seed: the same seed and variables always produce the same range,
 * population trajectory, trophic links, and extinction envelope. That property
 * makes the living atlas reproducible and the whole system testable without a
 * database.
 */

import { randomUUID } from 'node:crypto';

import {
  ACTIONS,
  CATEGORIES,
  ENTITIES,
  METRICS,
  PRODUCT,
  REGIONS,
  STATUSES,
  STATUS_RISK,
  analyticsSummarySchema,
  chatResponseSchema,
  entityDetailSchema,
  shareLinkSchema,
  simulationResultSchema,
  type AnalyticsSummary,
  type CatalogEntity,
  type CatalogQuery,
  type ChatRequest,
  type ChatResponse,
  type EntityDetail,
  type ShareLink,
  type SimulationRequest,
  type SimulationResult
} from '@biosphere/shared';

export class ApiError extends Error {
  readonly statusCode: number;
  readonly code: string;

  constructor(message: string, statusCode = 400, code = 'REQUEST_ERROR') {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

/** FNV-1a hash, used to derive a stable seed from any request. */
export function hashSeed(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** Mulberry32 PRNG — tiny, fast, deterministic. */
export function createRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function round(value: number, digits = 1): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function clamp(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, value));
}

function findEntity(id: string): CatalogEntity | undefined {
  return ENTITIES.find((entity) => entity.id === id);
}

/** Deterministic risk score: status sets the baseline, the seed adds spread. */
export function riskScore(entity: CatalogEntity): number {
  const base = STATUS_RISK[entity.status] ?? 18;
  return round(clamp(base + (hashSeed(entity.id) % 100) / 5 - 10), 1);
}

export interface CatalogPage {
  items: CatalogEntity[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

export function listEntities(query: CatalogQuery): CatalogPage {
  const search = query.q?.toLowerCase();
  const filtered = ENTITIES.filter((entity) => {
    if (query.category && entity.category !== query.category) return false;
    if (query.region && entity.region !== query.region) return false;
    if (query.status && entity.status !== query.status) return false;
    if (search) {
      const haystack = [entity.name, entity.summary, entity.category, entity.region, ...entity.tags]
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    return true;
  });

  if (query.sort === 'risk') {
    filtered.sort((a, b) => riskScore(b) - riskScore(a) || a.name.localeCompare(b.name));
  } else {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  }

  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / query.pageSize));
  const page = Math.min(query.page, pageCount);
  const start = (page - 1) * query.pageSize;

  return {
    items: filtered.slice(start, start + query.pageSize),
    total,
    page,
    pageSize: query.pageSize,
    pageCount
  };
}

export function getEntityDetail(id: string): EntityDetail {
  const entity = findEntity(id);
  if (!entity) {
    throw new ApiError(`No ${PRODUCT.entitySingular} matches "${id}"`, 404, 'ENTITY_NOT_FOUND');
  }

  const tracked = METRICS[1] ?? METRICS[0];
  const metricKey = tracked?.key ?? 'habitability';
  const base = entity.metrics[metricKey] ?? 50;
  const rng = createRng(hashSeed(`${entity.id}:history`));

  const history = Array.from({ length: 12 }, (_, index) => ({
    period: `T-${11 - index}`,
    value: round(clamp(base + Math.sin(index / 2) * 6 + (rng() - 0.5) * 8), 1)
  }));

  const sameCategory = ENTITIES.filter((candidate) => candidate.id !== entity.id && candidate.category === entity.category);
  const rest = ENTITIES.filter((candidate) => candidate.id !== entity.id && candidate.category !== entity.category);
  const related = [...sameCategory, ...rest].slice(0, 3);

  return entityDetailSchema.parse({
    entity,
    riskScore: riskScore(entity),
    history,
    related
  });
}

export function analyticsSummary(): AnalyticsSummary {
  const byStatus: Record<string, number> = Object.fromEntries(STATUSES.map((status) => [status, 0]));
  const byCategory: Record<string, number> = Object.fromEntries(CATEGORIES.map((category) => [category, 0]));
  let riskTotal = 0;

  for (const entity of ENTITIES) {
    byStatus[entity.status] = (byStatus[entity.status] ?? 0) + 1;
    byCategory[entity.category] = (byCategory[entity.category] ?? 0) + 1;
    riskTotal += riskScore(entity);
  }

  const topRisks = [...ENTITIES]
    .map((entity) => ({
      id: entity.id,
      name: entity.name,
      category: entity.category,
      risk: riskScore(entity)
    }))
    .sort((a, b) => b.risk - a.risk)
    .slice(0, 5);

  return analyticsSummarySchema.parse({
    total: ENTITIES.length,
    byStatus,
    byCategory,
    averageRisk: round(riskTotal / Math.max(1, ENTITIES.length)),
    topRisks
  });
}

const SEVERITY_WEIGHT: Record<string, number> = {
  low: 10,
  medium: 25,
  high: 45,
  critical: 70
};

const RECOMMENDATIONS: Record<string, string[]> = {
  habitat_loss: [
    'Protect the last unfragmented core before restoring the matrix between patches.',
    'Model carrying capacity at half the current range so the extinction debt is visible.',
    'Secure a stepping-stone corridor before the isolation threshold is crossed.'
  ],
  climate_shift: [
    'Compare range velocity with dispersal ability; a fast shift is not a rescue if the species cannot follow.',
    'Identify microrefugia that stay cooler than the surrounding matrix.',
    'Protect the leading edge from new land conversion while the trailing edge contracts.'
  ],
  invasive_species: [
    'Map the generalist competitor against native nesting and forage sites first.',
    'Stage removal at the invasion front, not in the saturated core.',
    'Monitor the trophic cascade for at least three breeding cycles after control.'
  ],
  poaching_surge: [
    'Raise patrol coverage where adult survival has the largest effect on population growth.',
    'Protect recruitment as well as adults; removing either can invert the trend.',
    'Run a population viability projection before and after every enforcement change.'
  ],
  corridor_restore: [
    'Reconnect the narrowest pinch point before widening the whole corridor.',
    'Measure gene flow after two generations, not after one season.',
    'Keep crossing structures dark, vegetated, and free of human activity at peak movement.'
  ],
  rewilding: [
    'Confirm that the missing keystone has a viable founder group and prey base.',
    'Stage the return behind a monitored fence or island to learn before release.',
    'Track the cascade across three trophic levels, not just the reintroduced species.'
  ]
};

export function simulate(request: SimulationRequest): SimulationResult {
  const action = ACTIONS.find((candidate) => candidate.id === request.action);
  if (!action) {
    throw new ApiError(`Unknown action "${request.action}"`, 400, 'UNKNOWN_ACTION');
  }

  const target = findEntity(request.targetId);
  if (!target) {
    throw new ApiError(`No ${PRODUCT.entitySingular} matches "${request.targetId}"`, 404, 'ENTITY_NOT_FOUND');
  }

  const rng = createRng(hashSeed(`${request.action}:${target.id}:${request.horizonHours}`));
  const severity = SEVERITY_WEIGHT[action.severity] ?? 25;
  const impactScore = round(clamp(severity + request.intensity * 28 + (rng() * 8 - 4)), 1);

  const timeline = Array.from({ length: 7 }, (_, index) => {
    const fraction = index / 6;
    const hour = Math.round(fraction * request.horizonHours);
    const noise = rng() * 6 - 3;
    return {
      hour,
      availability: round(clamp(100 - impactScore * fraction * 0.9 + noise), 1),
      load: round(clamp(25 + impactScore * fraction * 0.8 + noise), 1),
      risk: round(clamp(impactScore * fraction + noise), 1)
    };
  });

  const sameCategory = ENTITIES.filter(
    (candidate) => candidate.id !== target.id && candidate.category === target.category
  );
  const affected = sameCategory.slice(0, 3).map((candidate, index) => {
    const adjusted = impactScore - index * 12;
    const level = adjusted >= 70 ? 'critical' : adjusted >= 45 ? 'high' : adjusted >= 20 ? 'medium' : 'low';
    return {
      id: candidate.id,
      name: candidate.name,
      category: candidate.category,
      severity: level as 'low' | 'medium' | 'high' | 'critical'
    };
  });

  return simulationResultSchema.parse({
    id: randomUUID(),
    action: request.action,
    actionLabel: action.label,
    targetId: target.id,
    targetName: target.name,
    impactScore,
    affected,
    timeline,
    recommendations: RECOMMENDATIONS[request.action] ?? RECOMMENDATIONS[ACTIONS[0]?.id ?? 'habitat_loss'] ?? [],
    createdAt: new Date().toISOString()
  });
}

function summaryAnswer(): string {
  const summary = analyticsSummary();
  const worst = summary.topRisks[0];
  return [
    `${PRODUCT.name} is tracking ${summary.total} ${PRODUCT.entityLabel} across ${CATEGORIES.length} categories.`,
    `Average risk is ${summary.averageRisk}/100.`,
    worst ? `The highest-risk ${PRODUCT.entitySingular} right now is ${worst.name} at ${worst.risk}/100.` : '',
    `Ask me to focus ${PRODUCT.entityArticle} ${PRODUCT.entitySingular}, open its dossier, or simulate an ecological event.`
  ]
    .filter(Boolean)
    .join(' ');
}

export function respondToChat(request: ChatRequest): ChatResponse {
  const lower = request.message.toLowerCase();
  const entity = ENTITIES.find(
    (candidate) => lower.includes(candidate.name.toLowerCase()) || lower.includes(candidate.id)
  );
  const action = ACTIONS.find((candidate) => lower.includes(candidate.label.toLowerCase()));
  const category = CATEGORIES.find((candidate) => lower.includes(candidate.toLowerCase()));
  const wantsRisk = /risk|worst|critical|danger|threat/.test(lower);
  const wantsSeed = /seed|determin/.test(lower);

  const actions: ChatResponse['actions'] = [];
  let message: string;

  if (entity) {
    actions.push({ type: 'focus_entity', label: `Open ${entity.name}`, params: { entityId: entity.id } });
    if (action) {
      actions.push({
        type: 'run_simulation',
        label: `Simulate ${action.label}`,
        params: { action: action.id, targetId: entity.id }
      });
      message = `${entity.name} is a ${entity.category.toLowerCase()} ${PRODUCT.entitySingular} in ${entity.region}, currently ${entity.status}. ${action.label} has been queued as a simulation target.`;
    } else {
      actions.push({ type: 'open_page', label: 'Open simulator', params: { page: 'simulator' } });
      message = `${entity.name} is a ${entity.category.toLowerCase()} ${PRODUCT.entitySingular} in ${entity.region}, currently ${entity.status}. ${entity.summary}`;
    }
  } else if (wantsSeed) {
    message =
      'Every species is a pure function of its 32-bit seed. The seed deterministically drives range, population, migration, genetic diversity, and trophic links — so the same seed always reconstructs the same living planet, down to the last seedling. Fork a seed when you want a parallel biosphere without losing the original.';
    actions.push({ type: 'open_page', label: 'Open the atlas', params: { page: 'catalog' } });
  } else if (wantsRisk) {
    const summary = analyticsSummary();
    message = `${summary.topRisks.map((item) => `${item.name} (${item.risk}/100)`).join(', ')} are the current risk leaders. ${summary.byStatus.endangered ?? 0} ${PRODUCT.entityLabel} are flagged endangered.`;
    actions.push({ type: 'open_page', label: 'Open risk-ranked species', params: { page: 'catalog', sort: 'risk' } });
  } else if (category) {
    const members = ENTITIES.filter((candidate) => candidate.category === category);
    message = `${members.length} ${PRODUCT.entityLabel} are classified as ${category}: ${members
      .slice(0, 4)
      .map((member) => member.name)
      .join(', ')}.`;
    actions.push({ type: 'open_page', label: `Show ${category}`, params: { page: 'catalog', category } });
  } else if (action) {
    message = `${action.label}: ${action.description} Pick ${PRODUCT.entityArticle} ${PRODUCT.entitySingular} and I can run it in the simulator.`;
    actions.push({ type: 'open_page', label: 'Open simulator', params: { page: 'simulator', action: action.id } });
  } else if (/help|what can|how do/.test(lower)) {
    message = `I can focus ${PRODUCT.entityArticle} ${PRODUCT.entitySingular}, filter the catalogue, explain the deterministic seed, or run a simulation. Try "Which species are most at risk?" or "Simulate habitat loss on Bengal Tiger".`;
    actions.push({ type: 'answer', label: 'Show me the catalogue', params: { page: 'catalog' } });
  } else {
    message = summaryAnswer();
    actions.push({ type: 'open_page', label: 'Explore the catalogue', params: { page: 'catalog' } });
  }

  return chatResponseSchema.parse({
    message,
    conversationId: request.conversationId ?? randomUUID(),
    actions,
    metadata: {
      model: request.model,
      tokensUsed: Math.max(16, Math.ceil((request.message.length + message.length) / 4)),
      latencyMs: 30 + (hashSeed(lower) % 120)
    }
  });
}

export function encodeShareLink(payload: ShareLink): string {
  const validated = shareLinkSchema.parse(payload);
  return Buffer.from(JSON.stringify(validated), 'utf8').toString('base64url');
}

export function decodeShareLink(token: string): ShareLink {
  const json = Buffer.from(token, 'base64url').toString('utf8');
  try {
    return shareLinkSchema.parse(JSON.parse(json));
  } catch {
    throw new ApiError('Share link is not valid', 400, 'INVALID_SHARE_LINK');
  }
}

/** Aggregate counts used by the overview and the capabilities endpoint. */
export function capabilities() {
  return {
    product: PRODUCT.name,
    tagline: PRODUCT.tagline,
    entityLabel: PRODUCT.entityLabel,
    entitySingular: PRODUCT.entitySingular,
    categories: CATEGORIES,
    regions: REGIONS,
    statuses: STATUSES,
    metrics: METRICS,
    actions: ACTIONS
  };
}
