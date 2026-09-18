import type { CurriculumMap } from '../../session';
import { buildInfanziaNativeRuntimeView } from '../../../domain/curriculum/infanzia/infanziaNativeRuntime';

export interface InfanziaNativeCurriculumPanelProps {
  localCurriculum: CurriculumMap;
  mode?: 'consultation' | 'population-blocked';
}

export function InfanziaNativeCurriculumPanel({
  localCurriculum,
  mode = 'consultation',
}: InfanziaNativeCurriculumPanelProps) {
  const runtime = buildInfanziaNativeRuntimeView(localCurriculum);

  return (
    <div className="space-y-4" data-testid="infanzia-native-runtime">
      <div className="rounded-2xl border border-indigo-200 bg-indigo-50/40 p-4 text-left">
        <span className="block text-[9px] font-black uppercase tracking-wider text-indigo-700">
          Struttura nativa D.M. 221/2025
        </span>
        <h3 className="mt-1 text-sm font-black text-slate-800">
          Cinque campi di esperienza — nessuna proiezione disciplinare
        </h3>
        <p className="mt-2 text-[11px] font-semibold leading-relaxed text-slate-600">
          Arena usa i campi di esperienza come identità curricolari autonome. I dati ancora presenti
          nelle vecchie chiavi disciplinari sono mostrati soltanto come candidati di migrazione e non
          vengono attribuiti automaticamente a un campo.
        </p>
        {mode === 'population-blocked' && (
          <p className="mt-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-[10px] font-bold leading-relaxed text-amber-900">
            Il popolamento tramite assistente o CSV della struttura legacy è disabilitato per l’infanzia:
            prima occorre una migrazione semantica esplicita verso nodi nativi dei cinque campi.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {runtime.fields.map(field => (
          <section
            key={field.fieldId}
            className="rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm"
            data-infanzia-field-id={field.fieldId}
            data-infanzia-segment-id={field.segmentId}
          >
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-2">
              <div>
                <span className="block text-[8px] font-black uppercase tracking-wider text-indigo-600">
                  Campo di esperienza
                </span>
                <h4 className="mt-1 text-xs font-extrabold leading-tight text-slate-800">{field.label}</h4>
              </div>
              <span className="rounded-full border border-indigo-100 bg-indigo-50 px-2 py-1 text-[7px] font-black uppercase tracking-wider text-indigo-700">
                nativo
              </span>
            </div>

            <dl className="mt-3 space-y-2 text-[10px] text-slate-600">
              <div>
                <dt className="font-black uppercase tracking-wider text-slate-400">Identità canonica</dt>
                <dd className="mt-0.5 break-all font-semibold">{field.segmentId}</dd>
              </div>
              <div>
                <dt className="font-black uppercase tracking-wider text-slate-400">Contenuto d’istituto</dt>
                <dd className="mt-0.5 font-semibold">Non ancora materializzato in nodi nativi.</dd>
              </div>
            </dl>

            {field.legacyCandidateCount > 0 ? (
              <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
                <p className="text-[9px] font-black uppercase tracking-wider text-amber-800">
                  {field.legacyCandidateCount} candidato/i legacy rilevato/i
                </p>
                <ul className="mt-2 space-y-1 text-[9px] font-semibold text-amber-900">
                  {field.legacyCandidates.filter(candidate => candidate.populated).map(candidate => (
                    <li key={candidate.legacyKey}>
                      <code>{candidate.legacyKey}</code>: {candidate.traguardiCount} traguardi, {candidate.obiettiviCount} obiettivi, {candidate.evidenzeCount} evidenze — non promossi
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="mt-3 rounded-xl border border-slate-100 bg-slate-50 p-3 text-[9px] font-semibold text-slate-500">
                Nessun contenuto legacy popolato rilevato per questo campo.
              </p>
            )}
          </section>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-[10px] font-semibold leading-relaxed text-slate-600">
        <strong>Confine di autorità:</strong> questa vista corregge l’identità runtime, ma non adotta
        alcun curricolo d’istituto e non trasforma i candidati legacy in contenuti canonici.
      </div>
    </div>
  );
}
