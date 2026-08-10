import type { ReactNode } from 'react';
import type { UdaModel } from '../../../types/curriculum';

interface UdaArtifactViewProps {
  uda: UdaModel;
  onBackToPlanning: () => void;
}

const listOrFallback = (items: string[] | undefined) => items?.filter(item => item.trim()).length ? items!.filter(item => item.trim()) : ['Nessun contenuto registrato'];

export default function UdaArtifactView({ uda, onBackToPlanning }: UdaArtifactViewProps) {
  return (
    <section className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 text-left shadow-sm" aria-label="UDA professionale">
      <header className="border-b border-slate-100 pb-5">
        <span className="text-[9px] font-black uppercase tracking-wider text-indigo-600">PLAN-03 · UDA</span>
        <h2 className="mt-1 text-xl font-black text-slate-900">{uda.title}</h2>
        <p className="mt-2 text-xs font-semibold text-slate-500">
          {uda.discipline} · {uda.order} · {uda.period} · {uda.hours} ore
        </p>
      </header>

      <div className="grid gap-5 md:grid-cols-2">
        <ArtifactSection title="Riferimenti curricolari">
          {uda.curriculumReferences?.length ? uda.curriculumReferences.map(reference => (
            <div key={`${reference.nodeId}-${reference.curriculumVersionRef.id}`} className="rounded-xl bg-slate-50 p-3 text-xs text-slate-700">
              <p className="font-bold">{reference.snapshot}</p>
              <p className="mt-1 text-[10px] text-slate-500">Versione {reference.curriculumVersionRef.id} · {reference.provenance.qualification}</p>
            </div>
          )) : <p className="text-xs text-slate-500">Nessun riferimento curricolare registrato</p>}
        </ArtifactSection>

        <ArtifactSection title="Obiettivi"><ItemList items={uda.obiettivi} /></ArtifactSection>
        <ArtifactSection title="Attività"><ItemList items={uda.activities} fallback={uda.realTask} /></ArtifactSection>
        <ArtifactSection title="Valutazione"><ItemList items={uda.assessment} /></ArtifactSection>
        <ArtifactSection title="Materiali"><ItemList items={uda.materials} /></ArtifactSection>
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
        <p className="text-[10px] font-semibold text-slate-500">
          Derivata dalla progettazione {uda.sourcePlanningRef ? String(uda.sourcePlanningRef.id) : 'storica'}
        </p>
        <button type="button" onClick={onBackToPlanning} className="rounded-xl border border-indigo-200 px-4 py-2 text-[10px] font-black uppercase tracking-wide text-indigo-700 hover:bg-indigo-50">
          Torna alla progettazione
        </button>
      </footer>
    </section>
  );
}

function ArtifactSection({ title, children }: { title: string; children: ReactNode }) {
  return <section className="space-y-2"><h3 className="text-[10px] font-black uppercase tracking-wider text-slate-500">{title}</h3>{children}</section>;
}

function ItemList({ items, fallback }: { items?: string[]; fallback?: string }) {
  const values = listOrFallback(items);
  if (values[0] === 'Nessun contenuto registrato' && fallback?.trim()) values[0] = fallback;
  return <ul className="space-y-1 text-xs text-slate-700">{values.map((item, index) => <li key={`${item}-${index}`} className="rounded-xl bg-slate-50 p-3">{item}</li>)}</ul>;
}
