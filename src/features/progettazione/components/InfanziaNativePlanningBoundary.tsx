import type { CurriculumMap } from '../../session';
import { buildInfanziaNativeRuntimeView } from '../../../domain/curriculum/infanzia/infanziaNativeRuntime';

export interface InfanziaNativePlanningBoundaryProps {
  localCurriculum: CurriculumMap;
}

export function InfanziaNativePlanningBoundary({ localCurriculum }: InfanziaNativePlanningBoundaryProps) {
  const runtime = buildInfanziaNativeRuntimeView(localCurriculum);
  const legacyCandidates = runtime.fields.reduce((total, field) => total + field.legacyCandidateCount, 0);

  return (
    <div className="space-y-5 fade-in text-left" data-testid="infanzia-native-planning-boundary">
      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <span className="block text-[9px] font-black uppercase tracking-wider text-amber-800">
          R7C4 — confine di progettazione
        </span>
        <h2 className="mt-1 text-sm font-black text-slate-900">
          Progettazione dell’infanzia sospesa sul percorso legacy
        </h2>
        <p className="mt-2 text-xs font-semibold leading-relaxed text-slate-700">
          Arena non usa più una disciplina come sostituto di un campo di esperienza. Prima di generare
          UDA o programmazioni per l’infanzia devono esistere nodi curricolari d’istituto nativi,
          collegati ai cinque campi di esperienza e sottoposti a validazione umana.
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
          Struttura runtime attiva
        </h3>
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {runtime.fields.map(field => (
            <div key={field.fieldId} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-[10px] font-extrabold text-slate-800">{field.label}</p>
              <p className="mt-1 break-all text-[8px] font-semibold text-slate-500">{field.segmentId}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-[10px] font-semibold leading-relaxed text-slate-600">
        Sono stati rilevati <strong>{legacyCandidates}</strong> gruppi di contenuti legacy potenzialmente
        pertinenti. Restano candidati di migrazione: non vengono copiati, uniti o usati per generare
        progettazione didattica. <strong>Effetto di autorità: nessuno.</strong>
      </section>
    </div>
  );
}
