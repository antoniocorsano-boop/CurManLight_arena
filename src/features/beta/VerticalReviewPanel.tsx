import { useEffect, useMemo, useState } from 'react';
import type { WorkspaceActorContext } from '../../domain/institution/sharedWorkspacePort';
import {
  buildVerticalReviewOutcomeDraft,
  type VerticalReviewCandidate,
  type VerticalReviewMasterReference,
  type VerticalReviewOutcomeReceipt,
  type VerticalReviewOutcomeState,
} from '../../domain/revision/verticalReview';
import {
  canPrepareInstitutionalReviewHandoff,
  type InstitutionalReviewHandoffReceipt,
} from '../../domain/revision/institutionalReviewHandoff';
import { INSTITUTE_CURRICULUM_CURRENT_SOURCE } from '../../domain/curriculum/institute/currentSource';
import { SupabaseVerticalReviewRepository } from '../../infrastructure/supabase/verticalReviewRepository';
import { SupabaseInstitutionalReviewHandoffRepository } from '../../infrastructure/supabase/institutionalReviewHandoffRepository';
import { H3BoundInstitutionalDecisionPanel } from './H3BoundInstitutionalDecisionPanel';
import { useTeamWorkspaceContext } from './useTeamWorkspaceContext';

interface Props {
  discipline: string;
  onClose: () => void;
}

type FindingAssessment = 'unreviewed' | 'absent' | 'present';

interface FindingAssessmentFieldProps {
  label: string;
  assessment: FindingAssessment;
  detail: string;
  onAssessmentChange: (value: FindingAssessment) => void;
  onDetailChange: (value: string) => void;
  placeholder: string;
}

const CURRENT_MASTER: VerticalReviewMasterReference = {
  id: 'CAN-CURR-MASTER-00',
  driveFileId: INSTITUTE_CURRICULUM_CURRENT_SOURCE.driveFileId,
  version: INSTITUTE_CURRICULUM_CURRENT_SOURCE.sourceVersion,
};

const canRecordVerticalReview = (role: string | undefined): boolean =>
  role === 'dipartimento' || role === 'referente' || role === 'dirigente';

const schoolOrderLabel = (order: VerticalReviewCandidate['schoolOrder']): string =>
  order === 'primaria' ? 'Scuola primaria' : 'Scuola secondaria di primo grado';

const teamOutcomeLabel = (outcome: VerticalReviewCandidate['teamOutcome']): string => {
  if (outcome === 'accept-proposal') return 'proposta confermata';
  if (outcome === 'keep-previous') return 'testo precedente mantenuto';
  if (outcome === 'shared-text') return 'testo condiviso';
  return 'rinviato';
};

const verticalOutcomeLabel = (outcome: VerticalReviewOutcomeState | null): string => {
  if (outcome === 'COHERENT') return 'Raccordo coerente';
  if (outcome === 'ISSUES_FOUND') return 'Criticità rilevate';
  if (outcome === 'DEFERRED') return 'Da completare';
  return 'Da completare';
};

const candidateLabel = (candidate: VerticalReviewCandidate): string =>
  `${schoolOrderLabel(candidate.schoolOrder)} · ${candidate.classOrAgeBand} · ${teamOutcomeLabel(candidate.teamOutcome)} · ${candidate.proposalRef}`;

const explainError = (error: unknown): string => {
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes('VERTICAL_REVIEW_SOURCES_MUST_DIFFER')) return 'Seleziona due esiti professionali diversi.';
  if (message.includes('VERTICAL_REVIEW_UNITS_MUST_DIFFER')) return 'Il riesame verticale richiede due unità curricolari diverse.';
  if (message.includes('VERTICAL_REVIEW_DISCIPLINE_MISMATCH')) return 'Le due unità devono appartenere alla stessa disciplina o campo.';
  if (message.includes('VERTICAL_REVIEW_MASTER_MISMATCH')) return 'Gli esiti selezionati non appartengono alla stessa versione del master corrente.';
  if (message.includes('VERTICAL_REVIEW_H2_UNRESOLVED')) return 'Un esito H2 selezionato è ancora rinviato: il riesame verticale può essere registrato solo come da completare.';
  if (message.includes('VERTICAL_REVIEW_STALE_TEAM_OUTCOME')) return 'Uno degli esiti H2 è stato superato da un esito più recente. Ricarica e usa quello corrente.';
  if (message.includes('VERTICAL_REVIEW_REVIEW_REQUIRED')) return 'Il ruolo verificato corrente non può registrare un riesame verticale.';
  if (message.includes('VERTICAL_REVIEW_HANDOFF_STALE_H2_SOURCE')) return 'Il riesame verticale usa un esito H2 superato. Registra prima un nuovo H3 sulle fonti correnti.';
  if (message.includes('VERTICAL_REVIEW_HANDOFF_H2_CONTINUATION_OPEN')) return 'Un punto H2 è stato riaperto: il passaggio istituzionale resta bloccato fino al nuovo esito professionale.';
  if (message.includes('VERTICAL_REVIEW_HANDOFF_STALE_H3')) return 'Esiste un riesame verticale più recente sullo stesso raccordo. Usa l’ultimo H3 registrato.';
  if (message.includes('VERTICAL_REVIEW_DEFERRED_NOT_ELIGIBLE')) return 'Un riesame verticale rinviato non può essere preparato per l’iter istituzionale.';
  return message;
};

function FindingAssessmentField({
  label,
  assessment,
  detail,
  onAssessmentChange,
  onDetailChange,
  placeholder,
}: FindingAssessmentFieldProps) {
  return (
    <fieldset className="grid gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3" data-h3-finding-assessment>
      <legend className="px-1 text-xs font-bold text-slate-800">{label}</legend>
      <label className="grid gap-1 text-[11px] font-semibold text-slate-600">
        Verifica
        <select
          value={assessment}
          onChange={(event) => {
            const next = event.target.value as FindingAssessment;
            onAssessmentChange(next);
            if (next !== 'present') onDetailChange('');
          }}
          className="min-h-10 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-normal text-slate-900"
        >
          <option value="unreviewed">Da verificare</option>
          <option value="absent">Nessuna criticità rilevata</option>
          <option value="present">Criticità presente</option>
        </select>
      </label>
      {assessment === 'present' && (
        <label className="grid gap-1 text-[11px] font-semibold text-slate-600">
          Evidenza professionale
          <textarea
            value={detail}
            onChange={(event) => onDetailChange(event.target.value)}
            maxLength={1200}
            rows={2}
            placeholder={placeholder}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-normal text-slate-900"
          />
        </label>
      )}
      {assessment === 'absent' && (
        <p className="text-[11px] leading-5 text-slate-600">Assenza verificata esplicitamente. Non viene creato alcun finding di criticità.</p>
      )}
    </fieldset>
  );
}

export function VerticalReviewPanel({ discipline, onClose }: Props) {
  const team = useTeamWorkspaceContext();
  const [candidates, setCandidates] = useState<VerticalReviewCandidate[]>([]);
  const [history, setHistory] = useState<VerticalReviewOutcomeReceipt[]>([]);
  const [handoffs, setHandoffs] = useState<InstitutionalReviewHandoffReceipt[]>([]);
  const [previousId, setPreviousId] = useState('');
  const [nextId, setNextId] = useState('');
  const [linkReview, setLinkReview] = useState('');
  const [gapAssessment, setGapAssessment] = useState<FindingAssessment>('unreviewed');
  const [gap, setGap] = useState('');
  const [duplicationAssessment, setDuplicationAssessment] = useState<FindingAssessment>('unreviewed');
  const [duplication, setDuplication] = useState('');
  const [missingPrerequisiteAssessment, setMissingPrerequisiteAssessment] = useState<FindingAssessment>('unreviewed');
  const [missingPrerequisite, setMissingPrerequisite] = useState('');
  const [openQuestionAssessment, setOpenQuestionAssessment] = useState<FindingAssessment>('unreviewed');
  const [openQuestion, setOpenQuestion] = useState('');
  const [rationale, setRationale] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [handoffSubmittingId, setHandoffSubmittingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<VerticalReviewOutcomeReceipt | null>(null);

  const selectedPrevious = useMemo(
    () => candidates.find((candidate) => candidate.teamOutcomeId === previousId) ?? null,
    [candidates, previousId],
  );
  const selectedNext = useMemo(
    () => candidates.find((candidate) => candidate.teamOutcomeId === nextId) ?? null,
    [candidates, nextId],
  );
  const targetCandidates = useMemo(() => candidates.filter((candidate) => (
    candidate.teamOutcomeId !== selectedPrevious?.teamOutcomeId
    && candidate.curriculumUnitKey !== selectedPrevious?.curriculumUnitKey
  )), [candidates, selectedPrevious]);
  const handoffByVerticalReviewId = useMemo(
    () => new Map(handoffs.map((handoff) => [handoff.verticalReviewOutcomeId, handoff])),
    [handoffs],
  );

  const assessments = [gapAssessment, duplicationAssessment, missingPrerequisiteAssessment, openQuestionAssessment];
  const allAssessmentsReviewed = assessments.every((assessment) => assessment !== 'unreviewed');
  const findingDetailMissing = (
    (gapAssessment === 'present' && !gap.trim())
    || (duplicationAssessment === 'present' && !duplication.trim())
    || (missingPrerequisiteAssessment === 'present' && !missingPrerequisite.trim())
    || (openQuestionAssessment === 'present' && !openQuestion.trim())
  );

  const previewOutcome: VerticalReviewOutcomeState | null = !allAssessmentsReviewed || findingDetailMissing
    ? null
    : selectedPrevious?.teamOutcome === 'defer'
      || selectedNext?.teamOutcome === 'defer'
      || openQuestionAssessment === 'present'
      ? 'DEFERRED'
      : gapAssessment === 'present'
        || duplicationAssessment === 'present'
        || missingPrerequisiteAssessment === 'present'
        ? 'ISSUES_FOUND'
        : 'COHERENT';

  const writeAuthorized = canRecordVerticalReview(team.selectedMembership?.role);
  const canSubmit = writeAuthorized
    && Boolean(selectedPrevious && selectedNext)
    && Boolean(linkReview.trim())
    && Boolean(rationale.trim())
    && allAssessmentsReviewed
    && !findingDetailMissing
    && Boolean(previewOutcome)
    && !submitting;

  useEffect(() => {
    if (!team.client || !team.session || !team.selectedMembership || !discipline.trim()) {
      setCandidates([]);
      setHistory([]);
      setHandoffs([]);
      return;
    }

    let active = true;
    setLoading(true);
    setMessage(null);
    const repository = new SupabaseVerticalReviewRepository(team.client);
    const handoffRepository = new SupabaseInstitutionalReviewHandoffRepository(team.client);
    const context: WorkspaceActorContext = {
      assurance: 'authenticated-workspace',
      membership: team.selectedMembership,
    };

    void Promise.all([
      repository.listCandidates(context, team.selectedMembership.workspaceId, CURRENT_MASTER, discipline),
      repository.listOutcomes(context, team.selectedMembership.workspaceId, CURRENT_MASTER),
      handoffRepository.list(context, team.selectedMembership.workspaceId, CURRENT_MASTER),
    ]).then(([nextCandidates, nextHistory, nextHandoffs]) => {
      if (!active) return;
      setCandidates(nextCandidates);
      setHistory(nextHistory);
      setHandoffs(nextHandoffs);
      setLoading(false);
    }).catch((error: unknown) => {
      if (!active) return;
      setCandidates([]);
      setHistory([]);
      setHandoffs([]);
      setLoading(false);
      setMessage(explainError(error));
    });

    return () => { active = false; };
  }, [discipline, team.client, team.session?.user.id, team.selectedMembership?.workspaceId]);

  useEffect(() => {
    if (selectedPrevious && selectedNext && selectedPrevious.curriculumUnitKey === selectedNext.curriculumUnitKey) {
      setNextId('');
    }
  }, [selectedPrevious, selectedNext]);

  const recordOutcome = async () => {
    if (!team.client || !team.session || !team.selectedMembership || !selectedPrevious || !selectedNext || !canSubmit) return;
    setSubmitting(true);
    setMessage(null);
    setReceipt(null);
    const repository = new SupabaseVerticalReviewRepository(team.client);
    const context: WorkspaceActorContext = {
      assurance: 'authenticated-workspace',
      membership: team.selectedMembership,
    };

    try {
      const input = buildVerticalReviewOutcomeDraft({
        workspaceId: team.selectedMembership.workspaceId,
        master: CURRENT_MASTER,
        previous: selectedPrevious,
        next: selectedNext,
        linkReview,
        gap: gapAssessment === 'present' ? gap : undefined,
        duplication: duplicationAssessment === 'present' ? duplication : undefined,
        missingPrerequisite: missingPrerequisiteAssessment === 'present' ? missingPrerequisite : undefined,
        openQuestion: openQuestionAssessment === 'present' ? openQuestion : undefined,
        rationale,
        clientRequestId: globalThis.crypto.randomUUID(),
      });
      const saved = await repository.recordOutcome(context, input);
      const nextHistory = await repository.listOutcomes(context, team.selectedMembership.workspaceId, CURRENT_MASTER);
      setReceipt(saved);
      setHistory(nextHistory);
      setMessage('Riesame verticale registrato e riletto dal server.');
    } catch (error) {
      setMessage(explainError(error));
    } finally {
      setSubmitting(false);
    }
  };

  const prepareInstitutionalHandoff = async (outcome: VerticalReviewOutcomeReceipt) => {
    if (!team.client || !team.session || !team.selectedMembership || !writeAuthorized) return;
    setHandoffSubmittingId(outcome.id);
    setMessage(null);
    const repository = new SupabaseInstitutionalReviewHandoffRepository(team.client);
    const context: WorkspaceActorContext = {
      assurance: 'authenticated-workspace',
      membership: team.selectedMembership,
    };
    try {
      await repository.prepare(context, outcome, globalThis.crypto.randomUUID());
      const nextHandoffs = await repository.list(context, team.selectedMembership.workspaceId, CURRENT_MASTER);
      setHandoffs(nextHandoffs);
      setMessage('Passaggio verso l’iter istituzionale preparato e riletto dal server. Nessuna decisione istituzionale è stata creata.');
    } catch (error) {
      setMessage(explainError(error));
    } finally {
      setHandoffSubmittingId(null);
    }
  };

  const renderInstitutionalHandoff = (outcome: VerticalReviewOutcomeReceipt, showH4Decision = true) => {
    const existing = handoffByVerticalReviewId.get(outcome.id);
    if (existing) {
      return (
        <>
          <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs leading-5 text-emerald-950" data-institutional-review-handoff-ready>
            <strong className="block">Pronto per l’iter istituzionale</strong>
            <span className="block">Ricevuta H3: <code>{outcome.id}</code></span>
            <span className="block">Autorità richiesta per H4: Collegio.</span>
            <span className="block">Nessuna decisione istituzionale, adozione o modifica del curricolo è stata generata.</span>
          </div>
          {showH4Decision && team.client && team.selectedMembership && (
            <H3BoundInstitutionalDecisionPanel
              client={team.client}
              context={{ assurance: 'authenticated-workspace', membership: team.selectedMembership }}
              handoff={existing}
            />
          )}
        </>
      );
    }
    if (!canPrepareInstitutionalReviewHandoff(outcome)) {
      return (
        <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-950">
          Questo H3 è rinviato e non è eleggibile per l’iter istituzionale.
        </p>
      );
    }
    if (!writeAuthorized) return null;
    return (
      <div className="mt-3 rounded-xl border border-indigo-200 bg-indigo-50 p-3" data-institutional-review-handoff-action>
        <p className="text-xs leading-5 text-indigo-950">
          Il riesame professionale può essere consegnato all’iter istituzionale con un gesto esplicito. Il passaggio non decide, non adotta e non rende vigente il curricolo.
        </p>
        <button
          type="button"
          disabled={handoffSubmittingId === outcome.id}
          onClick={() => void prepareInstitutionalHandoff(outcome)}
          data-human-next-action="prepare-institutional-review-handoff"
          className="mt-2 min-h-11 w-full rounded-xl bg-indigo-700 px-4 py-3 text-sm font-bold text-white disabled:bg-slate-300 sm:w-auto"
        >
          {handoffSubmittingId === outcome.id ? 'Preparazione…' : 'Prepara per l’iter istituzionale'}
        </button>
      </div>
    );
  };

  return (
    <main className="space-y-4 pb-24 md:pb-0" data-vertical-review-workspace data-human-phase="H3_VERTICAL_REVIEW">
      <section className="rounded-2xl border border-indigo-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wide text-indigo-600">Riesame verticale</span>
            <h2 className="mt-1 text-lg font-black text-slate-950">Verifica un raccordo della progressione</h2>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
              Confronta due unità diverse usando esclusivamente esiti professionali del gruppo già registrati sul master corrente. Il confronto riguarda continuità, salti, duplicazioni e prerequisiti.
            </p>
          </div>
          <button type="button" onClick={onClose} className="min-h-10 shrink-0 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700">
            Torna al Riesame
          </button>
        </div>
        <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-950" data-vertical-review-authority-boundary>
          <strong>Confine di autorità.</strong> Questo esito resta professionale: non crea una decisione istituzionale, non genera una ricevuta di adozione e non rende vigente il curricolo.
        </div>
      </section>

      {!team.configured && (
        <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">Il riesame verticale condiviso richiede il workspace scolastico configurato.</section>
      )}
      {team.configured && !team.session && !team.loading && (
        <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">Accedi con un account del workspace per leggere gli esiti professionali registrati.</section>
      )}
      {team.message && (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">{team.message}</section>
      )}

      {team.session && team.selectedMembership && (
        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm" aria-label="Confronto verticale">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <strong className="block text-sm text-slate-950">Esiti H2 disponibili</strong>
              <p className="mt-1 text-xs text-slate-500">Master {CURRENT_MASTER.version} · {discipline}</p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">{loading ? 'Lettura…' : `${candidates.length} esiti`}</span>
          </div>

          {!loading && candidates.length < 2 && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-700">
              Non ci sono ancora almeno due esiti H2 su unità diverse utilizzabili per un raccordo verticale. H3 resta quindi aperto senza produrre alcun avanzamento istituzionale.
            </div>
          )}

          {candidates.length >= 2 && (
            <div className="grid gap-4">
              <label className="grid gap-1.5 text-sm font-bold text-slate-800">
                Unità precedente
                <select value={previousId} onChange={(event) => { setPreviousId(event.target.value); setNextId(''); }} className="min-h-11 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-normal text-slate-900">
                  <option value="">Seleziona un esito del gruppo</option>
                  {candidates.map((candidate) => <option key={candidate.teamOutcomeId} value={candidate.teamOutcomeId}>{candidateLabel(candidate)}</option>)}
                </select>
              </label>

              <label className="grid gap-1.5 text-sm font-bold text-slate-800">
                Unità successiva
                <select value={nextId} onChange={(event) => setNextId(event.target.value)} disabled={!selectedPrevious} className="min-h-11 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-normal text-slate-900 disabled:bg-slate-100">
                  <option value="">Seleziona un esito del gruppo</option>
                  {targetCandidates.map((candidate) => <option key={candidate.teamOutcomeId} value={candidate.teamOutcomeId}>{candidateLabel(candidate)}</option>)}
                </select>
              </label>

              {selectedPrevious && selectedNext && (
                <div className="grid gap-2 rounded-xl border border-indigo-100 bg-indigo-50/60 p-3 text-xs leading-5 text-slate-700" data-vertical-review-selected-link>
                  <div><strong>Da:</strong> {schoolOrderLabel(selectedPrevious.schoolOrder)} · {selectedPrevious.classOrAgeBand}</div>
                  <div><strong>A:</strong> {schoolOrderLabel(selectedNext.schoolOrder)} · {selectedNext.classOrAgeBand}</div>
                  <div><strong>Esiti del gruppo:</strong> {teamOutcomeLabel(selectedPrevious.teamOutcome)} → {teamOutcomeLabel(selectedNext.teamOutcome)}</div>
                </div>
              )}

              <label className="grid gap-1.5 text-sm font-bold text-slate-800">
                Raccordo precedente → successivo <span className="font-normal text-slate-500">obbligatorio</span>
                <textarea value={linkReview} onChange={(event) => setLinkReview(event.target.value)} maxLength={1200} rows={3} placeholder="Descrivi che cosa prosegue, cambia o richiede attenzione nel passaggio tra le due unità." className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-normal text-slate-900" />
              </label>

              <div className="grid gap-3 sm:grid-cols-2" data-h3-explicit-findings>
                <FindingAssessmentField label="Salto nella progressione" assessment={gapAssessment} detail={gap} onAssessmentChange={setGapAssessment} onDetailChange={setGap} placeholder="Descrivi il salto rilevato." />
                <FindingAssessmentField label="Duplicazione" assessment={duplicationAssessment} detail={duplication} onAssessmentChange={setDuplicationAssessment} onDetailChange={setDuplication} placeholder="Descrivi la duplicazione rilevata." />
                <FindingAssessmentField label="Prerequisito mancante" assessment={missingPrerequisiteAssessment} detail={missingPrerequisite} onAssessmentChange={setMissingPrerequisiteAssessment} onDetailChange={setMissingPrerequisite} placeholder="Descrivi il prerequisito mancante." />
                <FindingAssessmentField label="Questione ancora aperta" assessment={openQuestionAssessment} detail={openQuestion} onAssessmentChange={setOpenQuestionAssessment} onDetailChange={setOpenQuestion} placeholder="Descrivi la questione che richiede un ulteriore riesame." />
              </div>

              <label className="grid gap-1.5 text-sm font-bold text-slate-800">
                Motivazione dell’esito <span className="font-normal text-slate-500">obbligatoria</span>
                <textarea value={rationale} onChange={(event) => setRationale(event.target.value)} maxLength={4000} rows={3} className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-normal text-slate-900" />
              </label>

              <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wide text-slate-500">Esito risultante</span>
                  <strong className="mt-1 block text-sm text-slate-950">{verticalOutcomeLabel(previewOutcome)}</strong>
                  {!allAssessmentsReviewed && <span className="mt-1 block text-[11px] text-slate-600">Completa esplicitamente le quattro verifiche di criticità.</span>}
                  {findingDetailMissing && <span className="mt-1 block text-[11px] text-slate-600">Descrivi ogni criticità indicata come presente.</span>}
                </div>
                {writeAuthorized ? (
                  <button type="button" onClick={() => void recordOutcome()} disabled={!canSubmit} data-human-next-action="record-vertical-review-outcome" className="min-h-11 rounded-xl bg-indigo-700 px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-300">
                    {submitting ? 'Registrazione…' : 'Registra il riesame verticale'}
                  </button>
                ) : (
                  <p className="max-w-md text-xs leading-5 text-slate-600">Il ruolo verificato corrente può consultare gli esiti, ma non registrare H3. La registrazione è riservata ai ruoli con responsabilità di riesame.</p>
                )}
              </div>
            </div>
          )}
        </section>
      )}

      {message && <section aria-live="polite" className="rounded-2xl border border-indigo-200 bg-indigo-50 p-3 text-sm text-indigo-950">{message}</section>}

      {receipt && (
        <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4" data-vertical-review-receipt>
          <strong className="block text-sm text-emerald-950">{verticalOutcomeLabel(receipt.outcome)}</strong>
          <p className="mt-1 text-xs leading-5 text-emerald-900">Ricevuta server registrata su due unità del master {receipt.master.version}. Nessuna decisione istituzionale o adozione è stata generata.</p>
          {renderInstitutionalHandoff(receipt, false)}
        </section>
      )}

      {history.length > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm" aria-label="Esiti verticali registrati">
          <strong className="block text-sm text-slate-950">Riesami verticali già registrati</strong>
          <div className="mt-3 grid gap-2">
            {history.slice(0, 5).map((item) => (
              <article key={item.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-700">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <strong className="text-slate-950">{verticalOutcomeLabel(item.outcome)}</strong>
                  <span>{new Date(item.recordedAt).toLocaleString('it-IT')}</span>
                </div>
                <p className="mt-1">{item.rationale}</p>
                {renderInstitutionalHandoff(item, true)}
              </article>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
