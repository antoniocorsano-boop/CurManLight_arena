import type { FC } from 'react';
import type {
  ArenaHumanTaskProjection,
  HumanTaskCognitiveReceipt,
  HumanTaskStakeholder,
} from '../humanTask';

interface HumanTaskSummaryProps {
  projection: ArenaHumanTaskProjection;
  receipt: HumanTaskCognitiveReceipt;
  className?: string;
}

const STAKEHOLDER_LABELS: Record<HumanTaskStakeholder, string> = {
  'non-dichiarato': 'Ruolo non dichiarato',
  docente: 'Docente',
  dipartimento: 'Dipartimento',
  referente: 'Referente',
  collegio: 'Collegio',
  dirigente: 'Dirigente',
  amministratore: 'Amministratore',
  sistema: 'Sistema',
};

export const HumanTaskSummary: FC<HumanTaskSummaryProps> = ({
  projection,
  receipt,
  className,
}) => {
  const blocked = receipt.status === 'BLOCKED';

  return (
    <section
      className={`border-b px-4 py-3 ${
        blocked ? 'border-amber-200 bg-amber-50/60' : 'border-indigo-100 bg-indigo-50/40'
      } ${className ?? ''}`}
      aria-label="Prossimo compito"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wide text-slate-500">
              Adesso
            </span>
            <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-slate-700 border border-slate-200">
              {projection.stateLabel}
            </span>
          </div>
          <p className="text-xs font-semibold leading-relaxed text-slate-800">
            {projection.goal}
          </p>
          {blocked && (
            <p className="text-[11px] font-semibold text-amber-800">
              Prima di proseguire completa le informazioni necessarie.
            </p>
          )}
        </div>

        <div className="shrink-0 rounded-xl border border-indigo-200 bg-white px-3 py-2 sm:max-w-[220px]">
          <div className="text-[9px] font-extrabold uppercase tracking-wide text-indigo-500">
            Prossimo compito
          </div>
          <div className="mt-0.5 text-xs font-extrabold text-slate-800">
            {projection.primaryAction.label}
          </div>
          <div className="mt-0.5 text-[10px] text-slate-500">
            Responsabile: {STAKEHOLDER_LABELS[projection.primaryAction.responsibleStakeholder]}
          </div>
        </div>
      </div>

      <details className="mt-2 text-[10px] text-slate-600">
        <summary className="cursor-pointer font-bold text-slate-500 hover:text-slate-700">
          Come viene usata questa proposta
        </summary>
        <div className="mt-2 grid gap-2 md:grid-cols-2">
          <div>
            <strong className="block text-slate-700">Chi deve comprenderla</strong>
            <ul className="mt-1 space-y-1">
              {projection.stakeholderRequirements.map((requirement) => (
                <li key={requirement.stakeholder}>
                  <span className="font-bold">{STAKEHOLDER_LABELS[requirement.stakeholder]}:</span>{' '}
                  {requirement.responsibility}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <strong className="block text-slate-700">Provenienza e continuità</strong>
            <p className="mt-1">
              {projection.sourceRefs.length} riferimento/i canonico/i collegato/i. La proiezione non sostituisce il curricolo o la proposta originale.
            </p>
            {projection.nextStepLabel && (
              <p className="mt-1">
                <span className="font-bold">Dopo:</span> {projection.nextStepLabel}
              </p>
            )}
          </div>
        </div>
      </details>
    </section>
  );
};
