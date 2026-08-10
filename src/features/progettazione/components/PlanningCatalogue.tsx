import { ArrowRight, FilePlus2, FileText } from 'lucide-react';
import type { PlanningCatalogueEntry } from '../../../domain/planning';

interface PlanningCatalogueProps {
  entries: PlanningCatalogueEntry[];
  onContinue: (entry: PlanningCatalogueEntry) => void;
  onNew: () => void;
  disciplineLabel: (discipline: string) => string;
}

const orderLabel: Record<PlanningCatalogueEntry['context']['schoolOrder'], string> = {
  infanzia: 'Scuola dell’infanzia',
  primaria: 'Scuola primaria',
  secondaria: 'Secondaria I grado',
};

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Data non disponibile' : date.toLocaleDateString('it-IT');
}

function PlanningCard({ entry, onContinue, disciplineLabel }: {
  entry: PlanningCatalogueEntry;
  onContinue: (entry: PlanningCatalogueEntry) => void;
  disciplineLabel: (discipline: string) => string;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-black text-slate-800">{entry.title}</h3>
          <p className="mt-1 text-xs font-semibold text-slate-500">
            {disciplineLabel(entry.context.discipline)} · {entry.context.classLabel ? `Classe ${entry.context.classLabel}` : orderLabel[entry.context.schoolOrder]}
          </p>
          <p className="text-xs font-semibold text-slate-400">{orderLabel[entry.context.schoolOrder]}</p>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${entry.status === 'ready' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
          {entry.statusLabel}
        </span>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 border-t border-slate-100 pt-3 text-[11px] font-semibold text-slate-500">
        <span>Riferimenti curricolari: {entry.curriculumReferenceCount}</span>
        <span>Ultimo aggiornamento: {formatDate(entry.updatedAt)}</span>
      </div>

      {entry.reconstruction === 'partial' && (
        <p className="text-[11px] font-semibold text-slate-500">Compatibilità parziale: alcuni dati potranno essere completati.</p>
      )}

      <div className="flex flex-wrap items-center gap-2 pt-1">
        <button type="button" onClick={() => onContinue(entry)} aria-label={`Continua ${entry.title}`} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-black text-white transition hover:bg-indigo-700">
          Continua <ArrowRight className="h-3.5 w-3.5" />
        </button>
        {entry.derivedArtifact && (
          <button type="button" aria-label={`Apri UDA ${entry.derivedArtifact.title}`} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-black text-slate-700 transition hover:border-indigo-300 hover:text-indigo-700">
            <FileText className="h-3.5 w-3.5" /> Apri UDA
          </button>
        )}
      </div>
    </article>
  );
}

export default function PlanningCatalogue({ entries, onContinue, onNew, disciplineLabel }: PlanningCatalogueProps) {
  const inProgress = entries.filter(entry => entry.status === 'in_progress');
  const ready = entries.filter(entry => entry.status === 'ready');

  return (
    <section aria-labelledby="planning-catalogue-title" className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-indigo-600">Lavoro professionale</p>
          <h2 id="planning-catalogue-title" className="text-xl font-black text-slate-900">Progettazioni</h2>
          <p className="mt-1 max-w-2xl text-sm font-semibold text-slate-500">Riprendi una progettazione o iniziane una nuova. Le UDA prodotte restano artefatti distinti.</p>
        </div>
        <button type="button" onClick={onNew} aria-label="Nuova progettazione" className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-black text-white transition hover:bg-slate-700">
          <FilePlus2 className="h-4 w-4" /> Nuova progettazione
        </button>
      </div>

      {inProgress.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase tracking-[0.16em] text-slate-700">In corso</h3>
          <div className="grid gap-4 lg:grid-cols-2">{inProgress.map(entry => <PlanningCard key={entry.id} entry={entry} onContinue={onContinue} disciplineLabel={disciplineLabel} />)}</div>
        </div>
      )}

      {ready.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase tracking-[0.16em] text-slate-700">Pronte / completate</h3>
          <div className="grid gap-4 lg:grid-cols-2">{ready.map(entry => <PlanningCard key={entry.id} entry={entry} onContinue={onContinue} disciplineLabel={disciplineLabel} />)}</div>
        </div>
      )}

      {entries.length === 0 && <div className="rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center text-sm font-semibold text-slate-500">Non hai ancora progettazioni da riprendere.</div>}
    </section>
  );
}
