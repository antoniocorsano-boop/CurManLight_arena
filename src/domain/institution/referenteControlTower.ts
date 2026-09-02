import type { CurriculumMap } from '../../features/session/types/appViewContracts';
import type { DecisionOutcome, RevisionArchive, RevisionProposalStatus } from '../revision/types';
import {
  computeCurriculumStructuralFindings,
  getWholeSchoolCurriculumScope,
  summarizeCurriculumFindings,
} from './curriculumAnalysis';

export interface ReferenteSourceSignal {
  authorityStatus: string;
  evidenceEligibility?: string;
}

export interface ReferenteControlTowerSnapshot {
  sourceTotal: number;
  sourcePendingVerification: number;
  sourceLocalEvidence: number;
  proposalTotal: number;
  proposalActive: number;
  proposalInReview: number;
  proposalAcceptedForDecision: number;
  proposalReadyForDecision: number | null;
  decisionReceiptCoverageAvailable: boolean;
  decisionsRecordedLocal: number;
  disciplineCoverageAvailable: boolean;
  curriculumTargetTotal: number | null;
  curriculumCoverageTargets: number | null;
  curriculumGapTargets: number | null;
  curriculumDiscontinuityTargets: number | null;
  curriculumOverlapTargets: number | null;
  scopeNote: string;
}

const CLOSED_PROPOSAL_STATUSES = new Set<RevisionProposalStatus>([
  'archived',
  'legacy',
  'rejected',
  'withdrawn',
]);

const REVIEW_PROPOSAL_STATUSES = new Set<RevisionProposalStatus>([
  'ready-for-review',
  'submitted',
  'under-review',
  'changes-requested',
]);

const TERMINAL_DECISION_OUTCOMES = new Set<DecisionOutcome>([
  'approve',
  'approve-with-changes',
  'reject',
]);

/**
 * Read-only aggregate for the Referente Home.
 *
 * `terminalInstitutionalProposalRefs` is deliberately nullable. `null` means
 * the runtime has not authoritatively read the institutional receipt store,
 * so an accepted-for-decision proposal cannot be presented as certainly
 * still ready merely because the local RevisionArchive has no terminal
 * decision for it.
 *
 * Curriculum coverage is calculated only when the caller supplies the real
 * CurriculumMap. The calculation uses the canonical D.M. 221 discipline/order
 * scope and reports structural presence/gaps only; it never upgrades baseline
 * authority or infers semantic correctness from labels or free text.
 */
export function deriveReferenteControlTowerSnapshot(
  sources: readonly ReferenteSourceSignal[],
  archive: RevisionArchive,
  terminalInstitutionalProposalRefs: ReadonlySet<string> | null = null,
  curriculum: CurriculumMap | null = null,
): ReferenteControlTowerSnapshot {
  const acceptedForDecision = archive.proposals.filter((proposal) => proposal.status === 'accepted-for-decision');
  const localTerminalProposalRefs = new Set(
    archive.decisions
      .filter((decision) => decision.status === 'recorded-local' && TERMINAL_DECISION_OUTCOMES.has(decision.outcome))
      .map((decision) => decision.proposalRef.id),
  );
  const unresolvedAfterLocal = acceptedForDecision.filter((proposal) => !localTerminalProposalRefs.has(proposal.id));
  const receiptCoverageRequired = unresolvedAfterLocal.length > 0;
  const decisionReceiptCoverageAvailable = !receiptCoverageRequired || terminalInstitutionalProposalRefs !== null;
  const proposalReadyForDecision = decisionReceiptCoverageAvailable
    ? unresolvedAfterLocal.filter((proposal) => !terminalInstitutionalProposalRefs?.has(proposal.id)).length
    : null;

  const curriculumSummary = curriculum
    ? summarizeCurriculumFindings(computeCurriculumStructuralFindings(curriculum, getWholeSchoolCurriculumScope()))
    : null;

  return {
    sourceTotal: sources.length,
    sourcePendingVerification: sources.filter((source) => source.authorityStatus !== 'LOCAL_VERIFIED').length,
    sourceLocalEvidence: sources.filter((source) => source.evidenceEligibility === 'LOCAL_EVIDENCE').length,
    proposalTotal: archive.proposals.length,
    proposalActive: archive.proposals.filter((proposal) => !CLOSED_PROPOSAL_STATUSES.has(proposal.status)).length,
    proposalInReview: archive.proposals.filter((proposal) => REVIEW_PROPOSAL_STATUSES.has(proposal.status)).length,
    proposalAcceptedForDecision: acceptedForDecision.length,
    proposalReadyForDecision,
    decisionReceiptCoverageAvailable,
    decisionsRecordedLocal: archive.decisions.filter((decision) => decision.status === 'recorded-local').length,
    disciplineCoverageAvailable: curriculumSummary !== null,
    curriculumTargetTotal: curriculumSummary?.totalTargets ?? null,
    curriculumCoverageTargets: curriculumSummary?.coverageTargets ?? null,
    curriculumGapTargets: curriculumSummary?.gapTargets ?? null,
    curriculumDiscontinuityTargets: curriculumSummary?.discontinuityTargets ?? null,
    curriculumOverlapTargets: curriculumSummary?.overlapTargets ?? null,
    scopeNote: curriculumSummary
      ? 'Copertura strutturale calcolata deterministicamente sul perimetro canonico disciplina/ordine. I conteggi non attestano da soli correttezza semantica o adozione istituzionale.'
      : 'La copertura disciplina/ordine resta indisponibile finché la vista non riceve una CurriculumMap concreta; etichette e proposte non vengono usate come sostituti.',
  };
}