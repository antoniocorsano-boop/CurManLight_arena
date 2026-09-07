import { useEffect, useMemo, useState } from 'react';
import type { WorkspaceActorContext } from '../../domain/institution/sharedWorkspacePort';
import {
  buildVerticalReviewOutcomeDraft,
  type VerticalReviewCandidate,
  type VerticalReviewMasterReference,
  type VerticalReviewOutcomeReceipt,
  type VerticalReviewOutcomeState,
} from '../../domain/revision/verticalReview';
import { INSTITUTE_CURRICULUM_CURRENT_SOURCE } from '../../domain/curriculum/institute/currentSource';
import { SupabaseVerticalReviewRepository } from '../../infrastructure/supabase/verticalReviewRepository';
import { useTeamWorkspaceContext } from './useTeamWorkspaceContext';

interface Props {
  discipline: string;
  onClose: () => void;
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

const verticalOutcomeLabel = (outcome: VerticalReviewOutcomeState): string => {
  if (outcome === 'COHERENT') return 'Raccordo coerente';
  if (outcome === 'ISSUES_FOUND') return 'Criticità rilevate';
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
  return message;
};

export function VerticalReviewPanel({ discipline, onClose }: Props) {
  const team = useTeamWorkspaceContext();
  const [candidates, setCandidates] = useState<VerticalReviewCandidate[]>([]);
  const [history, setHistory] = useState<VerticalReviewOutcomeReceipt[]>([]);
  const [previousId, setPreviousId] = useState('');
  const [nextId, setNextId] = useState('');
  const [linkReview, setLinkReview] = useState('');
  const [gap, setGap] = useState('');
  const [duplication, setDuplication] = useState('');
  const [missingPrerequisite, setMissingPrerequisite] = useState('');
  const [openQuestion, setOpenQuestion] = useState('');
  const [rationale, setRationale] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
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

  const previewOutcome: VerticalReviewOutcomeState = (
    selectedPrevious?.teamOutcome === 'defer'
    || selectedNext?.teamOutcome === 'defer'
    || Boolean(openQuestion.trim())
  )
    ? 'DEFERRED'
    : gap.trim() || duplication.trim() || missingPrerequisite.trim()
      ? 'ISSUES_FOUND'
      : 'COHERENT';

  const writeAuthorized = canRecordVerticalReview(team.selectedMembership?.role);
  const canSubmit = writeAuthorized
    && Boolean(selectedPrevious && selectedNext)
    && Boolean(linkReview.trim())
    && Boolean(rationale.trim())
    && !submitting;

  useEffect(() => {
    if (!team.client || !team.session || !team.selectedMembership || !discipline.trim()) {
      setCandidates([]);
      setHistory([]);
      return;
    }

    let active = true;
    setLoading(true);
    setMessage(null);
    const repository = new SupabaseVerticalReviewRepository(team.client);
    const context: WorkspaceActorContext = {
      assurance: 'authenticated-workspace',
      membership: team.selectedMembership,
    };

    void Promise.all([
      repository.listCandidates(context, team.selectedMembership.workspaceId, CURRENT_MASTER, discipline),
      repository.listOutcomes(context, team.selectedMembership.workspaceId, CURRENT_MASTER),
    ]).then(([nextCandidates, nextHistory]) => {
      if (!active) return;
      setCandidates(nextCandidates);
      setHistory(nextHistory);
      setLoading(false);
    }).catch((error: unknown) => {
      if (!active) return;
      setCandidates([]);
      setHistory([]);
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
        gap,
        duplication,
        missingPrerequisite,
        openQuestion,
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
          <button
            type="button"
            onClick={onClose}
            className="min-h-10 shrink-0 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700"
          >
            Torna al Riesame
          </button>
        </div>
        <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-950" data-vertical-review-authority-boundary>
          <strong>Confine di autorità.</strong> Questo esito resta professionale: non crea una decisione istituzionale, non genera una ricevuta di adozione e non rende vigente il curricolo.
        </div>
      </section>

      {!team.configured && (
        <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          Il riesame verticale condiviso richiede il workspace scolastico configurato.
        </section>
      )}

      {team.configured && !team.session && !team.loading && (
        <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          Accedi con un account del workspace per leggere gli esiti professionali registrati.
        </section>
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
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
              {loading ? 'Lettura…' : `${candidates.length} esiti`}
            </span>
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
                <select
                  value={previousId}
                  onChange={(event) => {
                    setPreviousId(event.target.value);
                    setNextId('');
                  }}
                  className="min-h-11 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-normal text-slate-900"
                >
                  <option value="">Seleziona un esito del gruppo</option>
                  {candidates.map((candidate) => (
                    <option key={candidate.teamOutcomeId} value={candidate.teamOutcomeId}>{candidateLabel(candidate)}</option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1.5 text-sm font-bold text-slate-800">
                Unità successiva
                <select
                  value={nextId}
                  onChange={(event) => setNextId(event.target.value)}
                  disabled={!selectedPrevious}
                  className="min-h-11 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-normal text-slate-900 disabled:bg-slate-100"
                >
                  <option value="">Seleziona un esito del gruppo</option>
                  {targetCandidates.map((candidate) => (
                    <option key={candidate.teamOutcomeId} value={candidate.teamOutcomeId}>{candidateLabel(candidate)}</option>
                  ))}
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
                <textarea
                  value={linkReview}
                  onChange={(event) => setLinkReview(event.target.value)}
                  maxLength={1200}
                  rows={3}
                  placeholder="Descrivi che cosa prosegue, cambia o richiede attenzione nel passaggio tra le due unità."
                  className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-normal text-slate-900"
                />
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1.5 text-xs font-bold text-slate-700">
                  Salto nella progressione
                  <textarea value={gap} onChange={(event) => setGap(event.target.value)} maxLength={1200} rows={2} className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-normal text-slate-900" />
                </label>
                <label className="grid gap-1.5 text-xs font-bold text-slate-700">
                  Duplicazione
                  <textarea value={duplication} onChange={(event) => setDuplication(event.target.value)} maxLength={1200} rows={2} className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-normal text-slate-900" />
                </label>
                <label className="grid gap-1.5 text-xs font-bold text-slate-700">
                  Prerequisito mancante
                  <textarea value={missingPrerequisite} onChange={(event) => setMissingPrerequisite(event.target.value)} maxLength={1200} rows={2} className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-normal text-slate-900" />
                </label>
                <label className="grid gap-1.5 text-xs font-bold text-slate-700">
                  Questione ancora aperta
                  <textarea value={openQuestion} onChange={(event) => setOpenQuestion(event.target.value)} maxLength={1200} rows={2} className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-normal text-slate-900" />
                </label>
              </div>

              <label className="grid gap-1.5 text-sm font-bold text-slate-800">
                Motivazione dell’esito <span className="font-normal text-slate-500">obbligatoria</span>
                <textarea
                  value={rationale}
                  onChange={(event) => setRationale(event.target.value)}
                  maxLength={4000}
                  rows={3}
                  className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-normal text-slate-900"
                />
              </label>

              <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wide text-slate-500">Esito risultante</span>
                  <strong className="mt-1 block text-sm text-slate-950">{verticalOutcomeLabel(previewOutcome)}</strong>
                </div>
                {writeAuthorized ? (
                  <button
                    type="button"
                    onClick={() => void recordOutcome()}
                    disabled={!canSubmit}
                    data-human-next-action="record-vertical-review-outcome"
                    className="min-h-11 rounded-xl bg-indigo-700 px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    {submitting ? 'Registrazione…' : 'Registra il riesame verticale'}
                  </button>
                ) : (
                  <p className="max-w-md text-xs leading-5 text-slate-600">
                    Il ruolo verificato corrente può consultare gli esiti, ma non registrare H3. La registrazione è riservata ai ruoli con responsabilità di riesame.
                  </p>
                )}
              </div>
            </div>
          )}
        </section>
      )}

      {message && (
        <section aria-live="polite" className="rounded-2xl border border-indigo-200 bg-indigo-50 p-3 text-sm text-indigo-950">{message}</section>
      )}

      {receipt && (
        <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4" data-vertical-review-receipt>
          <strong className="block text-sm text-emerald-950">{verticalOutcomeLabel(receipt.outcome)}</strong>
          <p className="mt-1 text-xs leading-5 text-emerald-900">
            Ricevuta server registrata su due unità del master {receipt.master.version}. Nessuna decisione istituzionale o adozione è stata generata.
          </p>
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
              </article>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
