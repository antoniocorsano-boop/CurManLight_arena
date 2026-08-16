import { useEffect, useState, type ReactNode } from 'react';
import type { UdaModel } from '../../../types/curriculum';

interface UdaArtifactViewProps {
  uda: UdaModel;
  onSave?: (uda: UdaModel) => void;
  onBackToPlanning: () => void;
}

const splitLines = (value: string | undefined) => (value ?? '').split('\n').map(item => item.trim()).filter(Boolean);

export default function UdaArtifactView({ uda, onSave, onBackToPlanning }: UdaArtifactViewProps) {
  const [draft, setDraft] = useState<UdaModel>(uda);
  useEffect(() => setDraft(uda), [uda]);
  const update = <K extends keyof UdaModel>(field: K, value: UdaModel[K]) => setDraft(current => ({ ...current, [field]: value }));
  const save = () => onSave?.({ ...draft, updatedAt: new Date().toISOString(), obiettivi: splitLines(draft.obiettivi.join('\n')), activities: splitLines(draft.activities?.join('\n')), assessment: splitLines(draft.assessment?.join('\n')), materials: splitLines(draft.materials?.join('\n')) });

  return (
    <section className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 text-left shadow-sm" aria-label="UDA professionale">
      <header className="border-b border-slate-100 pb-5">
        <span className="text-[9px] font-black uppercase tracking-wider text-indigo-600">PLAN-03 · UDA</span>
        {onSave ? <input aria-label="Titolo UDA" value={draft.title} onChange={event => update('title', event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xl font-black text-slate-900" /> : <h2 className="mt-1 text-xl font-black text-slate-900">{draft.title}</h2>}
        <p className="mt-2 text-xs font-semibold text-slate-500">{draft.discipline} · {draft.order} · {draft.period} · {draft.hours} ore</p>
      </header>
      <div className="grid gap-5 md:grid-cols-2">
        <ArtifactSection title="Riferimenti curricolari">{draft.curriculumReferences?.length ? draft.curriculumReferences.map(reference => <div key={`${reference.nodeId}-${reference.curriculumVersionRef.id}`} className="rounded-xl bg-slate-50 p-3 text-xs text-slate-700"><p className="font-bold">{reference.snapshot}</p><p className="mt-1 text-[10px] text-slate-500">Versione {reference.curriculumVersionRef.id} · {reference.provenance.qualification}</p></div>) : <p className="text-xs text-slate-500">Nessun riferimento curricolare registrato</p>}</ArtifactSection>
        {onSave ? <>
          <EditorField label="Obiettivi" value={draft.obiettivi.join('\n')} onChange={value => update('obiettivi', splitLines(value))} />
          <EditorField label="Attività" value={(draft.activities ?? []).join('\n')} onChange={value => update('activities', splitLines(value))} />
          <EditorField label="Valutazione" value={(draft.assessment ?? []).join('\n')} onChange={value => update('assessment', splitLines(value))} />
          <EditorField label="Materiali" value={(draft.materials ?? []).join('\n')} onChange={value => update('materials', splitLines(value))} />
          <EditorField label="Compito autentico" value={draft.realTask} onChange={value => update('realTask', value)} />
          <EditorField label="Note" value={draft.notes} onChange={value => update('notes', value)} />
        </> : <>
          <ArtifactSection title="Obiettivi"><ItemList items={draft.obiettivi} /></ArtifactSection><ArtifactSection title="Attività"><ItemList items={draft.activities} fallback={draft.realTask} /></ArtifactSection><ArtifactSection title="Valutazione"><ItemList items={draft.assessment} /></ArtifactSection><ArtifactSection title="Materiali"><ItemList items={draft.materials} /></ArtifactSection>
        </>}
      </div>
      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5"><p className="text-[10px] font-semibold text-slate-500">Derivata dalla progettazione {draft.sourcePlanningRef ? String(draft.sourcePlanningRef.id) : 'storica'}</p><div className="flex gap-2">{onSave && <button type="button" onClick={save} className="rounded-xl bg-indigo-600 px-4 py-2 text-[10px] font-black uppercase tracking-wide text-white hover:bg-indigo-700">Salva UDA</button>}<button type="button" onClick={onBackToPlanning} className="rounded-xl border border-indigo-200 px-4 py-2 text-[10px] font-black uppercase tracking-wide text-indigo-700 hover:bg-indigo-50">Torna alla progettazione</button></div></footer>
    </section>
  );
}

function EditorField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="space-y-1"><span className="text-[10px] font-black uppercase tracking-wider text-slate-500">{label}</span><textarea aria-label={label} value={value} onChange={event => onChange(event.target.value)} rows={3} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-700" /></label>;
}

function ArtifactSection({ title, children }: { title: string; children: ReactNode }) { return <section className="space-y-2"><h3 className="text-[10px] font-black uppercase tracking-wider text-slate-500">{title}</h3>{children}</section>; }
function ItemList({ items, fallback }: { items?: string[]; fallback?: string }) { const values = items?.filter(item => item.trim()) ?? []; const display = values.length ? values : (fallback?.trim() ? [fallback] : ['Nessun contenuto registrato']); return <ul className="space-y-1 text-xs text-slate-700">{display.map((item, index) => <li key={`${item}-${index}`} className="rounded-xl bg-slate-50 p-3">{item}</li>)}</ul>; }
