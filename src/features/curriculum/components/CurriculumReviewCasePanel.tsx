import { useMemo, useState } from 'react';
import {
  buildCurriculumReviewCase,
  evaluateCurriculumReviewCaseReadiness,
  reviewCaseMatchesCurrentUnit,
} from '../../../domain/curriculum/reviewCase';
import { resolveCurriculumUnitReference } from '../../../domain/curriculum/didacticBinding';
import { useCurriculumStore } from '../../../store/useCurriculumStore';
import type { Proposal, RevisionTrigger, SchoolOrder } from '../../../types/curriculum';

type CurriculumReviewCasePanelProps = {
  order: SchoolOrder;
  targetClass: string;
  discipline: string;
  proposals: Proposal[];
  actorId?: string;
  roleContext?: string;
};

const triggerLabel = (trigger: RevisionTrigger): string => {
  if (trigger.triggerType === 'EXTERNAL_NORMATIVE') return 'Nuova norma o circolare';
  if (trigger.triggerType === 'INSTITUTE_NEED') return 'Esigenza dell’Istituto';
  if (trigger.triggerType === 'PERIODIC_REVIEW') return 'Riesame periodico';
  return 'Segnale dalla pratica';
};

const triggerReason = (trigger: RevisionTrigger): string => {
  if (trigger.triggerType === 'EXTERNAL_NORMATIVE') return trigger.originOrSource.applicabilityAssessment;
  if (trigger.triggerType === 'INSTITUTE_NEED') return trigger.originOrSource.needStatement;
  if (trigger.triggerType === 'PERIODIC_REVIEW') return trigger.professionalReason;
  if (trigger.professionalReason) return trigger.professionalReason;
  if (trigger.potentialCurriculumScope.signal) return `Segnale ricorrente: ${trigger.potentialCurriculumScope.signal}`;
  return 'Motivo dalla pratica qualificato sulla stessa unità curricolare.';
};

export function CurriculumReviewCasePanel({
  order,
  targetClass,
  discipline,
  proposals,
  actorId,
  roleContext,
}: CurriculumReviewCasePanelProps) {
  const revisionTriggers = useCurriculumStore((state) => state.revisionTriggers ?? []);
  const curriculumReviewCases = useCurriculumStore((state) => state.curriculumReviewCases ?? []);
  const [selectedByTrigger, setSelectedByTrigger] = useState<Record<string, string[]>>({});
  const [reasonByTrigger, setReasonByTrigger] = useState<Record<string, string>>({});
  const [feedbackByTrigger, setFeedbackByTrigger] = useState<Record<string, string>>({});

  const curriculumUnit = useMemo(() => resolveCurriculumUnitReference({
    order,
    targetClass,
    disciplineOrField: discipline,
  }), [discipline, order, targetClass]);

  const availableProposalRefs = useMemo(() => proposals.map((proposal) => proposal.id), [proposals]);
  const relevantTriggers = useMemo(() => revisionTriggers.filter((trigger) => (
    trigger.potentialCurriculumScope.curriculumUnitKey === curriculumUnit.unitKey
    && trigger.applicability.order === curriculumUnit.order
    && trigger.applicability.classOrAgeBand === curriculumUnit.classOrAgeBand
    && trigger.applicability.disciplineOrField === curriculumUnit.disciplineOrField
  )), [curriculumUnit, revisionTriggers]);
  const relevantCases = useMemo(() => curriculumReviewCases.filter((reviewCase) => (
    reviewCaseMatchesCurrentUnit(reviewCase, curriculumUnit)
  )), [curriculumReviewCases, curriculumUnit]);

  if (relevantTriggers.length === 0 && relevantCases.length === 0) return null;

  const toggleProposal = (triggerId: string, proposalRef: string) => {
    setFeedbackByTrigger((current) => ({ ...current, [triggerId]: '' }));
    setSelectedByTrigger((current) => {
      const selected = current[triggerId] ?? [];
      return {
        ...current,
        [triggerId]: selected.includes(proposalRef)
          ? selected.filter((candidate) => candidate !== proposalRef)
          : [...selected, proposalRef],
      };
    });
  };

  const openCase = (trigger: RevisionTrigger) => {
    const selectedProposalRefs = selectedByTrigger[trigger.id] ?? [];
    const scopeReason = reasonByTrigger[trigger.id] ?? '';
    try {
      const reviewCase = buildCurriculumReviewCase({
        trigger,
        curriculumUnit,
        availableProposalRefs,
        selectedProposalRefs,
        scopeReason,
        existingCases: curriculumReviewCases,
        actorId,
        roleContext,
      });
      useCurriculumStore.setState((state) => ({
        curriculumReviewCases: [...(state.curriculumReviewCases ?? []), reviewCase],
      }));
      setFeedbackByTrigger((current) => ({
        ...current,
        [trigger.id]: 'Caso mirato aperto. Rientra dal quadro applicabile; la validazione professionale del nuovo caso non è stata ancora avviata.',
      }));
    } catch (error) {
      const code = error instanceof Error ? error.message : String(error);
      setFeedbackByTrigger((current) => ({
        ...current,
        [trigger.id]: code.startsWith('REVIEW_CASE_NOT_READY')
          ? 'Il caso non è ancora pronto: completa selezione delle schede e motivazione del perimetro.'
          : code === 'REVIEW_CASE_ALREADY_OPEN_FOR_TRIGGER'
            ? 'Esiste già un caso aperto per questo motivo e questa versione del master.'
            : 'Non è possibile aprire il caso con i dati correnti.',
      }));
    }
  };

  return (
    <section
      className="rounded-2xl border border-indigo-200 bg-white p-4 shadow-sm"
      data-curriculum-review-case-panel
      data-hcm-level="2"
      aria-labelledby="targeted-review-case-title"
    >
      <h2 id="targeted-review-case-title" className="text-sm font-extrabold text-slate-900">Apri solo il riesame necessario</h2>
      <p className="mt-1 text-xs leading-5 text-slate-600">
        Un motivo qualificato non riapre automaticamente il curricolo. Seleziona esplicitamente le schede realmente interessate e registra perché devono essere riesaminate.
      </p>

      <div className="mt-4 space-y-3">
        {relevantTriggers.map((trigger) => {
          const existingCase = relevantCases.find((reviewCase) => reviewCase.originTriggerSnapshot.id === trigger.id);
          const selectedProposalRefs = selectedByTrigger[trigger.id] ?? [];
          const scopeReason = reasonByTrigger[trigger.id] ?? '';
          const readiness = evaluateCurriculumReviewCaseReadiness({
            trigger,
            curriculumUnit,
            availableProposalRefs,
            selectedProposalRefs,
            scopeReason,
          });

          return (
            <article key={trigger.id} className="rounded-xl border border-slate-200 bg-slate-50/60 p-3" data-review-trigger-case-candidate={trigger.id}>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wide text-indigo-700">{triggerLabel(trigger)}</span>
                  <p className="mt-1 text-sm font-bold leading-5 text-slate-900">{triggerReason(trigger)}</p>
                  <p className="mt-1 text-[11px] text-slate-500">Master {trigger.currentMaster.version} · ambito {trigger.applicability.classOrAgeBand}</p>
                </div>
                <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-800">Motivo qualificato</span>
              </div>

              {existingCase ? (
                <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3" data-open-curriculum-review-case={existingCase.id}>
                  <strong className="block text-sm text-emerald-950">Caso mirato aperto</strong>
                  <p className="mt-1 text-xs leading-5 text-emerald-900">
                    {existingCase.targetedProposalRefs.length} schede · rientro da Quadro applicabile · validazione professionale non ancora avviata.
                  </p>
                  <p className="mt-2 text-xs leading-5 text-slate-700"><strong>Perimetro:</strong> {existingCase.scopeReason}</p>
                  <ul className="mt-2 space-y-1 text-xs text-slate-600">
                    {existingCase.targetedProposalRefs.map((proposalRef) => (
                      <li key={proposalRef}>• {proposals.find((proposal) => proposal.id === proposalRef)?.focus ?? proposalRef}</li>
                    ))}
                  </ul>
                  <p className="mt-2 text-[11px] leading-5 text-emerald-900">
                    Nessuna scelta precedente viene riutilizzata automaticamente e nessun esito, decisione istituzionale o aggiornamento del master viene prodotto dall’apertura del caso.
                  </p>
                </div>
              ) : (
                <div className="mt-3 space-y-3">
                  <fieldset>
                    <legend className="text-xs font-bold text-slate-800">Quali schede devono essere realmente riaperte?</legend>
                    <div className="mt-2 grid gap-2">
                      {proposals.map((proposal) => (
                        <label key={proposal.id} className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 bg-white p-3 text-xs leading-5 text-slate-700">
                          <input
                            type="checkbox"
                            checked={selectedProposalRefs.includes(proposal.id)}
                            onChange={() => toggleProposal(trigger.id, proposal.id)}
                            className="mt-0.5 h-4 w-4 shrink-0"
                          />
                          <span><strong className="block text-slate-900">{proposal.focus}</strong>{proposal.scopeLabel && <span className="text-slate-500">{proposal.scopeLabel}</span>}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  <div>
                    <label htmlFor={`case-scope-${trigger.id}`} className="text-xs font-bold text-slate-800">Perché proprio queste schede?</label>
                    <textarea
                      id={`case-scope-${trigger.id}`}
                      value={scopeReason}
                      onChange={(event) => {
                        setReasonByTrigger((current) => ({ ...current, [trigger.id]: event.target.value }));
                        setFeedbackByTrigger((current) => ({ ...current, [trigger.id]: '' }));
                      }}
                      rows={3}
                      maxLength={1200}
                      className="mt-2 w-full rounded-xl border border-slate-300 bg-white p-3 text-sm leading-6 text-slate-800"
                      placeholder="Delimita il perimetro del caso; non ripetere soltanto il motivo generale del trigger…"
                    />
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-3" data-review-case-readiness={readiness.state}>
                    <strong className="text-xs text-slate-800">Prontezza all’apertura</strong>
                    <ul className="mt-2 grid gap-1 text-[11px] leading-5 text-slate-600 sm:grid-cols-2">
                      <li>{readiness.checks.qualifiedTrigger ? '✓' : '○'} motivo qualificato</li>
                      <li>{readiness.checks.currentMasterMatch ? '✓' : '○'} stesso master/versione</li>
                      <li>{readiness.checks.curriculumUnitScopeMatch ? '✓' : '○'} stessa unità curricolare</li>
                      <li>{readiness.checks.targetedProposalSelection && readiness.checks.targetedProposalsKnown ? '✓' : '○'} almeno una scheda valida</li>
                      <li>{readiness.checks.explicitScopeReason ? '✓' : '○'} perimetro motivato</li>
                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={() => openCase(trigger)}
                    disabled={readiness.state !== 'READY_TO_OPEN'}
                    data-human-next-action="open-targeted-review-case"
                    className="min-h-11 w-full rounded-xl bg-indigo-700 px-4 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
                  >
                    Apri il caso mirato
                  </button>

                  {feedbackByTrigger[trigger.id] && (
                    <p role="status" className="rounded-lg bg-white p-3 text-xs leading-5 text-slate-700">{feedbackByTrigger[trigger.id]}</p>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </div>

      <p className="mt-4 border-t border-slate-100 pt-3 text-[11px] leading-5 text-slate-500">
        RevisionTrigger ≠ CurriculumReviewCase ≠ ProfessionalContribution. L’apertura del caso congela soltanto il perimetro da riesaminare e non riutilizza automaticamente contributi o decisioni precedenti.
      </p>
    </section>
  );
}
