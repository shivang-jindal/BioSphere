import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Download, MapPinned, Search } from 'lucide-react';
import { apiGet, apiPost } from '../lib/api';
import { downloadJson } from '../lib/format';
import { ErrorNote, Panel, SectionHeading, StatCard } from '../components/ui';

type Project = { id: string; name: string };
type Result = { query: Record<string, unknown>; taxon: { key: number; scientificName: string; rank: string }; total: number; returned: number; fetchedAt: string; records: Array<{ id: string; scientificName: string; eventDate: string | null; year: number | null; latitude: number | null; longitude: number | null; basisOfRecord: string; datasetKey: string | null; datasetName: string | null; issues: string[] }>; source: { name: string; url: string; docs: string; citation: string }; interpretation: string };
const initial = { name: 'Panthera tigris', minLatitude: '5', maxLatitude: '30', minLongitude: '65', maxLongitude: '105', yearFrom: '', yearTo: '' };

export function ObservationsPage() {
  const [form, setForm] = useState(initial); const [projectId, setProjectId] = useState('');
  const projects = useQuery({ queryKey: ['workspaces'], queryFn: () => apiGet<{ projects: Project[] }>('/workspaces') });
  const search = useMutation({ mutationFn: () => apiPost<{ result: Result; saved: boolean }>('/observations/search', { name: form.name, minLatitude: Number(form.minLatitude), maxLatitude: Number(form.maxLatitude), minLongitude: Number(form.minLongitude), maxLongitude: Number(form.maxLongitude), ...(form.yearFrom ? { yearFrom: Number(form.yearFrom) } : {}), ...(form.yearTo ? { yearTo: Number(form.yearTo) } : {}), ...(projectId ? { projectId } : {}) }) });
  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const result = search.data?.result;
  return <div className="space-y-5">
    <SectionHeading eyebrow="GBIF occurrence records" title="Search species observations" description="Resolve a scientific name, then find georeferenced occurrence records inside a bounded area and optional year range." />
    <Panel title="Search scope" description="The first page is capped at 100 records. Keep the area focused for practical field planning.">
      <form className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" onSubmit={(event) => { event.preventDefault(); search.mutate(); }}>
        <label className="label sm:col-span-2">Scientific name<input className="input mt-1" required minLength={2} maxLength={120} value={form.name} onChange={(event) => update('name', event.target.value)} placeholder="Panthera tigris" /></label>
        <label className="label">Minimum latitude<input className="input mt-1" type="number" min="-90" max="90" step="any" required value={form.minLatitude} onChange={(event) => update('minLatitude', event.target.value)} /></label>
        <label className="label">Maximum latitude<input className="input mt-1" type="number" min="-90" max="90" step="any" required value={form.maxLatitude} onChange={(event) => update('maxLatitude', event.target.value)} /></label>
        <label className="label">Minimum longitude<input className="input mt-1" type="number" min="-180" max="180" step="any" required value={form.minLongitude} onChange={(event) => update('minLongitude', event.target.value)} /></label>
        <label className="label">Maximum longitude<input className="input mt-1" type="number" min="-180" max="180" step="any" required value={form.maxLongitude} onChange={(event) => update('maxLongitude', event.target.value)} /></label>
        <label className="label">Year from<input className="input mt-1" type="number" min="1800" max={new Date().getFullYear()} value={form.yearFrom} onChange={(event) => update('yearFrom', event.target.value)} placeholder="Any" /></label>
        <label className="label">Year to<input className="input mt-1" type="number" min="1800" max={new Date().getFullYear()} value={form.yearTo} onChange={(event) => update('yearTo', event.target.value)} placeholder="Any" /></label>
        <label className="label sm:col-span-2">Save in field plan<select className="input mt-1" value={projectId} onChange={(event) => setProjectId(event.target.value)}><option value="">Do not save</option>{projects.data?.projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select></label>
        <div className="flex items-end"><button className="btn btn-primary w-full" disabled={search.isPending}><Search className="h-4 w-4" />{search.isPending ? 'Searching GBIF…' : 'Search occurrence records'}</button></div>
      </form>
    </Panel>
    {search.isError ? <ErrorNote message={(search.error as Error).message} onRetry={() => search.mutate()} /> : null}
    {result ? <>
      <div className="grid gap-3 md:grid-cols-3"><StatCard label="Matched taxon" value={result.taxon.scientificName} hint={`${result.taxon.rank} · GBIF key ${result.taxon.key}`} icon={<MapPinned className="h-4 w-4" />} /><StatCard label="Matching records" value={result.total.toLocaleString()} hint="Provider total for this query" /><StatCard label="Displayed records" value={result.returned} hint={`Fetched ${new Date(result.fetchedAt).toLocaleString()}`} /></div>
      <Panel title="Georeferenced occurrences" description={`Query: ${result.taxon.scientificName}`} actions={<button className="btn text-xs" onClick={() => downloadJson(`gbif-occurrences-${result.taxon.key}.json`, result)}><Download className="h-3.5 w-3.5" />Export JSON</button>}>
        <div className="mb-4 rounded-lg border border-amber-300/20 bg-amber-300/5 p-3 text-xs text-amber-100/80">{result.interpretation}</div>
        <div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead className="text-ink-faint"><tr><th className="p-2">Date</th><th className="p-2">Coordinates</th><th className="p-2">Record basis</th><th className="p-2">Dataset</th><th className="p-2">GBIF record</th></tr></thead><tbody>{result.records.map((record) => <tr key={record.id} className="border-t border-line"><td className="p-2">{record.eventDate ?? record.year ?? '—'}</td><td className="p-2 font-mono">{record.latitude !== null && record.longitude !== null ? `${record.latitude}, ${record.longitude}` : '—'}</td><td className="p-2">{record.basisOfRecord}</td><td className="p-2">{record.datasetName ?? record.datasetKey ?? '—'}</td><td className="p-2"><a className="text-brand-300 underline" href={`https://www.gbif.org/occurrence/${encodeURIComponent(record.id)}`} target="_blank" rel="noreferrer">{record.id || 'Open'}</a></td></tr>)}</tbody></table></div>
        <p className="mt-3 flex flex-wrap gap-3 text-xs"><a className="text-brand-300 underline" href={result.source.docs} target="_blank" rel="noreferrer">API documentation</a><a className="text-brand-300 underline" href={result.source.citation} target="_blank" rel="noreferrer">GBIF citation guidance</a></p>
      </Panel>
    </> : <Panel><p className="py-6 text-center text-sm text-ink-muted">Search GBIF to find recorded observations. The legacy species atlas and scenario model are illustrative and do not represent live ecological measurements.</p></Panel>}
  </div>;
}
