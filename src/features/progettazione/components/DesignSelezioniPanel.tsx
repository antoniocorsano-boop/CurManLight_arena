import { Layers, AlertTriangle, ChevronDown, Clock } from 'lucide-react';
import { useCurriculumStore } from '../../../store/useCurriculumStore';
import { listSelectionsForDesign } from '../../../domain/design/archive';
import { DESIGN_QUALIFICATION_LABELS } from '../../../domain/design/types';
import type { DesignCurriculumSelection } from '../../../domain/design/types';

function SourceStateLabel({ state }: { state?: string }) {
  if (!state) return null;
  const labels: Record<string, { text: string; color: string }> = {
    'source-current': { text: 'Sorgente aggiornata', color: 'text-emerald-600' },
    'source-updated': { text: 'Sorgente modificata', color: 'text-amber-600' },
    'source-unavailable': { text: 'Sorgente non disponibile', color: 'text-rose-600' },
    'source-legacy': { text: 'Sorgente legacy', color: 'text-slate-500' },
  };
  const label = labels[state] ?? { text: state, color: 'text-slate-500' };
  return <span className={`text-[10px] font-semibold ${label.color}`}>{label.text}</span>;
}

function SelectionCard({ selection }: { selection: DesignCurriculumSelection }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden text-left" role="region" aria-label={`Selezione curricolare: ${DESIGN_QUALIFICATION_LABELS[selection.qualification]}`}>
      <div className="bg-slate-50 border-b border-slate-100 px-3 py-2 flex items-center justify-between text-xs">
        <span className="flex items-center space-x-2">
          <span className="bg-indigo-100 text-indigo-700 text-[10px] font-extrabold px-1.5 py-0.5 rounded uppercase">
            {selection.sourceArea}
          </span>
          <span className="font-semibold text-slate-700">
            {DESIGN_QUALIFICATION_LABELS[selection.qualification]}
          </span>
        </span>
        <div className="flex items-center space-x-2">
          <SourceStateLabel state={selection.comparisonState} />
          <span className="text-slate-400 text-[10px] flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>{selection.transferredAt.slice(0, 10)}</span>
          </span>
        </div>
      </div>

      <div className="p-3 text-xs leading-relaxed">
        <p className="text-slate-600 italic">"{selection.selectedTextSnapshot}"</p>
      </div>

      {selection.warnings.length > 0 && (
        <div className="px-3 pb-2">
          <details>
            <summary className="text-[10px] text-amber-600 cursor-pointer hover:text-amber-700 flex items-center space-x-1">
              <AlertTriangle className="w-3 h-3" />
              <span>{selection.warnings.length} avvisi</span>
              <ChevronDown className="w-3 h-3" />
            </summary>
            <div className="mt-1 space-y-0.5 ml-4">
              {selection.warnings.map((w, i) => (
                <p key={i} className="text-[10px] text-amber-700">• {w.message}</p>
              ))}
            </div>
          </details>
        </div>
      )}

      {selection.sourceRefs.length > 0 && (
        <div className="px-3 pb-2">
          <span className="text-[10px] text-slate-400">Fonti: {selection.sourceRefs.map(r => r.snapshotLabel || r.id).join(', ')}</span>
        </div>
      )}
    </div>
  );
}

export function DesignSelezioniPanel() {
  const { designArchive, savedUda } = useCurriculumStore();

  // Use latest UDA as the design context
  const latestUda = savedUda.length > 0 ? savedUda[savedUda.length - 1] : undefined;
  const selections = latestUda
    ? listSelectionsForDesign(designArchive, latestUda.id)
    : designArchive.selections;

  return (
    <div className="space-y-3" role="region" aria-label="Selezioni curricolari">
      <h3 className="text-sm font-extrabold text-slate-800 flex items-center space-x-2">
        <Layers className="w-4 h-4 text-indigo-500" />
        <span>Selezioni curricolari</span>
        {selections.length > 0 && (
          <span className="text-[10px] font-normal text-slate-500">— {selections.length} selezioni</span>
        )}
      </h3>

      {selections.length === 0 ? (
        <p className="text-xs text-slate-400 italic">
          Nessuna selezione curricolare trasferita. Usa "Usa nella progettazione" dalla consultazione o revisione del curricolo per aggiungere contenuti qui.
        </p>
      ) : (
        <div className="space-y-2">
          {selections.map(s => (
            <SelectionCard key={s.id} selection={s} />
          ))}
        </div>
      )}
    </div>
  );
}