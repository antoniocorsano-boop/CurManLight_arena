import { useEffect, useMemo, useState } from 'react';
import {
  buildExternalNormativeRevisionTrigger,
  buildInstituteNeedRevisionTrigger,
  buildPeriodicReviewRevisionTrigger,
} from '../../../domain/curriculum/revisionTrigger';
import { resolveCurriculumUnitReference } from '../../../domain/curriculum/didacticBinding';
import {
  INSTITUTE_CURRICULUM_AUTHORITATIVE_SOURCES,
  type CurriculumSourceRecord,
} from '../../../domain/curriculum/institute/sourceRegister';
import { useCurriculumStore } from '../../../store/useCurriculumStore';
import type {
  ExternalNormativeSourceType,
  RevisionTrigger,
  SchoolOrder,
} from '../../../types/curriculum';

type QualificationMode = 'EXTERNAL_NORMATIVE' | 'INSTITUTE_NEED' | 'PERIODIC_REVIEW';

type RevisionTriggerQualificationPanelProps = {
  order: SchoolOrder;
  targetClass: string;
  discipline: string;
  initialNormativeSourceCode?: string | null;
  onInitialNormativeSourceConsumed?: () => void;
};

const sourceTypeFor = (source: CurriculumSourceRecord): ExternalNormativeSourceType => {
  const title = source.title.trim().toLowerCase();
  if (title.startsWith('legge ')) return 'LAW';
  if (title.startsWith('nota ')) return 'NOTE';
  if (title.startsWith('circolare ')) return 'CIRCULAR';
  if (title.startsWith('raccomandazione ') || title.includes('linee guida')) return 'GUIDELINE';
  if (title.startsWith('d.m.') || title.startsWith('d.p.r.') || title.startsWith('d.lgs.')) return 'DECREE';
  return 'OTHER';
};

const triggerSignature = (trigger: RevisionTrigger): string => {
  const common = [
    trigger.triggerType,
    trigger.potentialCurriculumScope.curriculumUnitKey,
    trigger.currentMaster.version,
  ];
  if (trigger.triggerType === 'EXTERNAL_NORMATIVE') {
    return JSON.stringify([...common, trigger.originOrSource.sourceReference, trigger.originOrSource.applicabilityAssessment]);
  }
  if (trigger.triggerType === 'INSTITUTE_NEED') {
    return JSON.stringify([...common, trigger.originOrSource.needReference, trigger.originOrSource.needStatement]);
  }
  if (trigger.triggerType === 'PERIODIC_REVIEW') {
    return JSON.stringify([...common, trigger.originOrSource.reviewCycle, trigger.professionalReason]);
  }
  return JSON.stringify([...common, trigger.qualificationBasis, trigger.professionalReason ?? '']);
};

const errorMessage = (error: unknown): string => {
  const code = error instanceof Error ? error.message : String(error);
  if (code === 'EXTERNAL_NORMATIVE_APPLICABILITY_REQUIRED') return 'Indica perché la fonte incide sull’ambito curricolare corrente.';
  if (code === 'EXTERNAL_NORMATIVE_SOURCE_REQUIRED') return 'Seleziona una fonte già qualificata nel Fascicolo.';
  if (code === 'INSTITUTE_NEED_REFERENCE_REQUIRED') return 'Indica da quale sede o atto interno nasce l’esigenza.';
  if (code === 'INSTITUTE_NEED_REQUIRED') return 'Descrivi l’esigenza dell’Istituto che richiede il riesame.';
  if (code === 'PERIODIC_REVIEW_REASON_REQUIRED') return 'La scadenza da sola non basta: registra una ragione concreta per riesaminare questo ambito.';
  return 'Completa i dati richiesti per qualificare il motivo di riesame.';
};

export function RevisionTriggerQualificationPanel({
  order,
  targetClass,
  discipline,
  initialNormativeSourceCode,
  onInitialNormativeSourceConsumed,
}: RevisionTriggerQualificationPanelProps) {
  const revisionTriggers = useCurriculumStore((state) => state.revisionTriggers);
  const [mode, setMode] = useState<QualificationMode | null>(null);
  const [sourceCode, setSourceCode] = useState(initialNormativeSourceCode ?? '');
  const [applicabilityAssessment, setApplicabilityAssessment] = useState('');
  const [needReference, setNeedReference] = useState('');
  const [needStatement, setNeedStatement] = useState('');
  const [reviewCycle, setReviewCycle] = useState<'ANNUAL' | 'MULTIYEAR' | 'OTHER'>('ANNUAL');
  const [reviewReason, setReviewReason] = useState('');
  const [feedback, setFeedback] = useState<{ kind: 'success' | 'error'; message: string } | null>(null);

  const curriculumUnit = useMemo(() => resolveCurriculumUnitReference({
    order,
    targetClass,
    disciplineOrField: discipline,
  }), [discipline, order, targetClass]);

  const selectedSource = INSTITUTE_CURRICULUM_AUTHORITATIVE_SOURCES.find((source) => source.code === sourceCode) ?? null;

  useEffect(() => {
    if (!initialNormativeSourceCode) return;
    if (!INSTITUTE_CURRICULUM_AUTHORITATIVE_SOURCES.some((source) => source.code === initialNormativeSourceCode)) return;
    setSourceCode(initialNormativeSourceCode);
    setMode('EXTERNAL_NORMATIVE');
    setFeedback(null);
  }, [initialNormativeSourceCode]);

  const persistTrigger = (trigger: RevisionTrigger) => {
    const signature = triggerSignature(trigger);
    const alreadyRecorded = revisionTriggers.find((candidate) => triggerSignature(candidate) === signature);
    if (!alreadyRecorded) {
      useCurriculumStore.setState((state) => ({
        revisionTriggers: [...state.revisionTriggers, trigger],
      }));
    }
    setFeedback({
      kind: 'success',
      message: alreadyRecorded
        ? 'Questo motivo di riesame era già registrato per lo stesso ambito e la stessa versione del master.'
        : 'Motivo di riesame qualificato e registrato. Non è stato aperto alcun caso e il curricolo non è stato modificato.',
    });
  };

  const qualifyExternalNormative = () => {
    if (!selectedSource) {
      setFeedback({ kind: 'error', message: 'Seleziona una fonte già qualificata nel Fascicolo.' });
      return;
    }
    try {
      persistTrigger(buildExternalNormativeRevisionTrigger({
        curriculumUnit,
        sourceReference: `${selectedSource.code} · ${selectedSource.title}`,
        sourceType: sourceTypeFor(selectedSource),
        sourceQualification: 'QUALIFIED',
        applicabilityAssessment,
      }));
      onInitialNormativeSourceConsumed?.();
    } catch (error) {
      setFeedback({ kind: 'error', message: errorMessage(error) });
    }
  };

  const qualifyInstituteNeed = () => {
    try {
      persistTrigger(buildInstituteNeedRevisionTrigger({
        curriculumUnit,
        needReference,
        needStatement,
        declaredNonNational: true,
      }));
    } catch (error) {
      setFeedback({ kind: 'error', message: errorMessage(error) });
    }
  };

  const qualifyPeriodicReview = () => {
    try {
      persistTrigger(buildPeriodicReviewRevisionTrigger({
        curriculumUnit,
        reviewCycle,
        reviewReason,
      }));
    } catch (error) {
      setFeedback({ kind: 'error', message: errorMessage(error) });
    }
  };

  const selectMode = (nextMode: QualificationMode) => {
    setMode(nextMode);
    setFeedback(null);
  };

  return (
    <details
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
      data-revision-trigger-qualification
      data-hcm-level="2"
      open={Boolean(initialNormativeSourceCode) || undefined}
    >
      <summary className="cursor-pointer list-none marker:content-none">
        <span className="block text-sm font-extrabold text-slate-900">Perché riaprire il riesame?</span>
        <span className="mt-1 block text-xs leading-5 text-slate-600">
          Registra un motivo qualificato solo quando esiste una causa concreta. Il motivo non apre automaticamente un caso e non modifica il master.
        </span>
      </summary>

      <div className="mt-4 space-y-4 border-t border-slate-100 pt-4">
        <section className="rounded-xl bg-slate-50 p-3" aria-label="Ambito curricolare del motivo di riesame">
          <strong className="text-xs text-slate-800">Ambito corrente</strong>
          <p className="mt-1 text-xs leading-5 text-slate-600">
            {order} · {curriculumUnit.classOrAgeBand.replace(/-/g, ' ')} · {discipline} · master {curriculumUnit.masterVersion}
          </p>
        </section>

        <div className="grid gap-2 sm:grid-cols-3" aria-label="Origine del motivo di riesame">
          <button
            type="button"
            onClick={() => selectMode('EXTERNAL_NORMATIVE')}
            data-revision-trigger-origin="EXTERNAL_NORMATIVE"
            className={`min-h-11 rounded-xl border px-3 py-2.5 text-left text-xs font-bold ${mode === 'EXTERNAL_NORMATIVE' ? 'border-indigo-300 bg-indigo-50 text-indigo-900' : 'border-slate-200 bg-white text-slate-700'}`}
          >
            Nuova norma o circolare
          </button>
          <button
            type="button"
            onClick={() => selectMode('INSTITUTE_NEED')}
            data-revision-trigger-origin="INSTITUTE_NEED"
            className={`min-h-11 rounded-xl border px-3 py-2.5 text-left text-xs font-bold ${mode === 'INSTITUTE_NEED' ? 'border-indigo-300 bg-indigo-50 text-indigo-900' : 'border-slate-200 bg-white text-slate-700'}`}
          >
            Esigenza dell’Istituto
          </button>
          <button
            type="button"
            onClick={() => selectMode('PERIODIC_REVIEW')}
            data-revision-trigger-origin="PERIODIC_REVIEW"
            className={`min-h-11 rounded-xl border px-3 py-2.5 text-left text-xs font-bold ${mode === 'PERIODIC_REVIEW' ? 'border-indigo-300 bg-indigo-50 text-indigo-900' : 'border-slate-200 bg-white text-slate-700'}`}
          >
            Riesame periodico
          </button>
        </div>

        <p className="text-xs leading-5 text-slate-500">
          Il segnale dalla pratica resta qualificato dalla UDA collegata al curricolo, dove sono disponibili le osservazioni di attuazione.
        </p>

        {mode === 'EXTERNAL_NORMATIVE' && (
          <section className="space-y-3 rounded-xl border border-indigo-100 bg-indigo-50/30 p-3" data-trigger-form="EXTERNAL_NORMATIVE">
            <div>
              <label htmlFor="revision-trigger-source" className="text-xs font-bold text-slate-800">Fonte già qualificata nel Fascicolo</label>
              <select
                id="revision-trigger-source"
                value={sourceCode}
                onChange={(event) => {
                  setSourceCode(event.target.value);
                  setApplicabilityAssessment('');
                  setFeedback(null);
                }}
                className="mt-2 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
              >
                <option value="">Seleziona una fonte verificata</option>
                {INSTITUTE_CURRICULUM_AUTHORITATIVE_SOURCES.map((source) => (
                  <option key={source.code} value={source.code}>{source.code} · {source.title}</option>
                ))}
              </select>
            </div>
            {selectedSource && (
              <div className="rounded-lg bg-white p-3 text-xs leading-5 text-slate-600" data-selected-qualified-source>
                <p><strong className="text-slate-800">Applicabilità registrata nel Fascicolo:</strong> {selectedSource.applicability}</p>
                <p className="mt-1"><strong className="text-slate-800">Stato fonte:</strong> qualificata e verificata nel repertorio corrente.</p>
              </div>
            )}
            <div>
              <label htmlFor="revision-trigger-applicability" className="text-xs font-bold text-slate-800">Perché incide su questo ambito?</label>
              <textarea
                id="revision-trigger-applicability"
                value={applicabilityAssessment}
                onChange={(event) => setApplicabilityAssessment(event.target.value)}
                rows={3}
                maxLength={1200}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white p-3 text-sm leading-6 text-slate-800"
                placeholder="Descrivi l’impatto concreto su ordine, classe/fascia e disciplina/campo correnti…"
              />
            </div>
            <button
              type="button"
              onClick={qualifyExternalNormative}
              className="min-h-11 w-full rounded-xl bg-indigo-700 px-4 py-2.5 text-sm font-bold text-white sm:w-auto"
            >
              Registra il motivo di riesame
            </button>
            <p className="text-xs leading-5 text-slate-500">Una fonte non presente nel repertorio qualificato deve essere verificata nel Fascicolo prima di poter attivare questo passaggio.</p>
          </section>
        )}

        {mode === 'INSTITUTE_NEED' && (
          <section className="space-y-3 rounded-xl border border-indigo-100 bg-indigo-50/30 p-3" data-trigger-form="INSTITUTE_NEED">
            <div>
              <label htmlFor="revision-trigger-institute-reference" className="text-xs font-bold text-slate-800">Da dove nasce l’esigenza?</label>
              <input
                id="revision-trigger-institute-reference"
                value={needReference}
                onChange={(event) => setNeedReference(event.target.value)}
                maxLength={800}
                className="mt-2 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
                placeholder="Es. Dipartimento, commissione, Collegio, referente…"
              />
            </div>
            <div>
              <label htmlFor="revision-trigger-institute-need" className="text-xs font-bold text-slate-800">Esigenza da sottoporre a riesame</label>
              <textarea
                id="revision-trigger-institute-need"
                value={needStatement}
                onChange={(event) => setNeedStatement(event.target.value)}
                rows={3}
                maxLength={1200}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white p-3 text-sm leading-6 text-slate-800"
                placeholder="Descrivi la necessità dell’Istituto e il motivo per cui interessa questo ambito…"
              />
            </div>
            <p className="rounded-lg bg-white p-3 text-xs leading-5 text-amber-800" data-institute-need-non-national>
              Questa origine è registrata come esigenza dell’Istituto e non come prescrizione nazionale.
            </p>
            <button
              type="button"
              onClick={qualifyInstituteNeed}
              className="min-h-11 w-full rounded-xl bg-indigo-700 px-4 py-2.5 text-sm font-bold text-white sm:w-auto"
            >
              Registra il motivo di riesame
            </button>
          </section>
        )}

        {mode === 'PERIODIC_REVIEW' && (
          <section className="space-y-3 rounded-xl border border-indigo-100 bg-indigo-50/30 p-3" data-trigger-form="PERIODIC_REVIEW">
            <div>
              <label htmlFor="revision-trigger-cycle" className="text-xs font-bold text-slate-800">Ciclo di verifica</label>
              <select
                id="revision-trigger-cycle"
                value={reviewCycle}
                onChange={(event) => setReviewCycle(event.target.value as 'ANNUAL' | 'MULTIYEAR' | 'OTHER')}
                className="mt-2 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
              >
                <option value="ANNUAL">Annuale</option>
                <option value="MULTIYEAR">Pluriennale</option>
                <option value="OTHER">Altro ciclo previsto</option>
              </select>
            </div>
            <div>
              <label htmlFor="revision-trigger-periodic-reason" className="text-xs font-bold text-slate-800">Quale ragione concreta richiede il riesame?</label>
              <textarea
                id="revision-trigger-periodic-reason"
                value={reviewReason}
                onChange={(event) => setReviewReason(event.target.value)}
                rows={3}
                maxLength={1200}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white p-3 text-sm leading-6 text-slate-800"
                placeholder="Indica la questione da verificare; il semplice decorso del tempo non riapre unità stabili…"
              />
            </div>
            <button
              type="button"
              onClick={qualifyPeriodicReview}
              className="min-h-11 w-full rounded-xl bg-indigo-700 px-4 py-2.5 text-sm font-bold text-white sm:w-auto"
            >
              Registra il motivo di riesame
            </button>
          </section>
        )}

        {feedback && (
          <p
            role="status"
            data-revision-trigger-feedback={feedback.kind}
            className={`rounded-xl px-3 py-2.5 text-xs font-semibold leading-5 ${feedback.kind === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-900'}`}
          >
            {feedback.message}
          </p>
        )}

        <p className="border-t border-slate-100 pt-3 text-xs leading-5 text-slate-500">
          Motivo qualificato ≠ caso di riesame ≠ modifica del master ≠ decisione istituzionale.
        </p>
      </div>
    </details>
  );
}
