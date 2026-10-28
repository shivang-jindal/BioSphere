import { z } from 'zod';

const taxonSchema = z.object({ usageKey: z.number().int().positive().optional(), scientificName: z.string().optional(), rank: z.string().optional() }).passthrough();
const occurrenceSchema = z.object({ count: z.number().int().nonnegative().default(0), results: z.array(z.object({ gbifID: z.string().optional(), key: z.number().int().optional(), scientificName: z.string().optional(), eventDate: z.string().optional(), year: z.number().int().optional(), decimalLatitude: z.number().optional(), decimalLongitude: z.number().optional(), basisOfRecord: z.string().optional(), datasetKey: z.string().optional(), datasetName: z.string().optional(), issues: z.array(z.string()).optional() }).passthrough()).default([]) }).passthrough();
const root = 'https://api.gbif.org/v1';
async function getJson(url: URL): Promise<unknown> {
  let response: Response;
  try { response = await fetch(url, { signal: AbortSignal.timeout(12_000), redirect: 'error', headers: { accept: 'application/json' } }); }
  catch (error) { throw Object.assign(new Error(error instanceof Error && error.name === 'TimeoutError' ? 'GBIF request timed out.' : 'GBIF could not be reached.'), { statusCode: 503, code: 'GBIF_UNAVAILABLE' }); }
  if (!response.ok) throw Object.assign(new Error(`GBIF returned HTTP ${response.status}.`), { statusCode: 502, code: 'GBIF_PROVIDER_ERROR' });
  const raw = await response.text();
  if (raw.length > 4_000_000) throw Object.assign(new Error('GBIF response exceeded the 4 MB safety limit.'), { statusCode: 502, code: 'GBIF_RESPONSE_TOO_LARGE' });
  try { return JSON.parse(raw) as unknown; } catch { throw Object.assign(new Error('GBIF returned invalid JSON.'), { statusCode: 502, code: 'GBIF_INVALID_RESPONSE' }); }
}
export async function searchOccurrences(input: { name: string; minLatitude: number; maxLatitude: number; minLongitude: number; maxLongitude: number; yearFrom?: number; yearTo?: number; offset?: number }) {
  const taxonUrl = new URL(`${root}/species/match`); taxonUrl.searchParams.set('name', input.name); taxonUrl.searchParams.set('verbose', 'false');
  const taxon = taxonSchema.safeParse(await getJson(taxonUrl));
  if (!taxon.success || !taxon.data.usageKey) throw Object.assign(new Error('GBIF could not resolve that scientific name to a usable taxon.'), { statusCode: 404, code: 'GBIF_TAXON_NOT_FOUND' });
  const url = new URL(`${root}/occurrence/search`);
  url.searchParams.set('taxonKey', String(taxon.data.usageKey)); url.searchParams.set('hasCoordinate', 'true');
  url.searchParams.set('decimalLatitude', `${input.minLatitude},${input.maxLatitude}`); url.searchParams.set('decimalLongitude', `${input.minLongitude},${input.maxLongitude}`);
  if (input.yearFrom !== undefined || input.yearTo !== undefined) {
    url.searchParams.set('year', `${input.yearFrom ?? 1800},${input.yearTo ?? new Date().getUTCFullYear()}`);
  }
  const offset = input.offset ?? 0;
  url.searchParams.set('limit', '100'); url.searchParams.set('offset', String(offset));
  const result = occurrenceSchema.safeParse(await getJson(url));
  if (!result.success) throw Object.assign(new Error('GBIF occurrence response did not match the expected format.'), { statusCode: 502, code: 'GBIF_INVALID_RESPONSE' });
  return { query: input, taxon: { key: taxon.data.usageKey, scientificName: taxon.data.scientificName ?? input.name, rank: taxon.data.rank ?? 'unknown' }, total: result.data.count, offset, limit: 100, returned: result.data.results.length, fetchedAt: new Date().toISOString(),
    records: result.data.results.map((row) => ({ id: row.gbifID ?? String(row.key ?? ''), scientificName: row.scientificName ?? taxon.data.scientificName ?? input.name, eventDate: row.eventDate ?? null, year: row.year ?? null, latitude: row.decimalLatitude ?? null, longitude: row.decimalLongitude ?? null, basisOfRecord: row.basisOfRecord ?? 'unknown', datasetKey: row.datasetKey ?? null, datasetName: row.datasetName ?? null, issues: row.issues ?? [] })),
    source: { name: 'GBIF Occurrence API', url: url.toString(), docs: 'https://techdocs.gbif.org/en/openapi/v1/occurrence', citation: 'https://www.gbif.org/citation-guidelines' }, interpretation: 'These are digitized occurrence records, not a census, abundance estimate, or evidence that a species is absent where no record appears. Sampling effort, reporting, georeferencing, and taxonomic coverage vary.' };
}
