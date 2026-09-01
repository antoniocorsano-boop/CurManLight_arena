import type { RevisionArchive, RevisionProposalStatus } from '../revision/types';

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
  proposalReadyForDecision: number;
  decisionsRecordedLocal: number;
  disciplineCoverageAvailable: false;
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

/**
 * Read-only aggregate for the Referente Home.
 *
 * This selector deliberately refuses to calculate curriculum coverage by
 * discipline/order because RevisionProposal does not currently bind those
 * dimensions as canonical mandatory fields. Target labels are not a safe
 * substitute for structured scope.
 */
export function deriveReferenteControlTowerSnapshot(
  sources: readonly ReferenteSourceSignal[],
  archive: RevisionArchive,
): ReferenteControlTowerSnapshot {
  return {
    sourceTotal: sources.length,
    sourcePendingVerification: sources.filter((source) => source.authorityStatus !== 'LOCAL_VERIFIED').length,
    sourceLocalEvidence: sources.filter((source) => source.evidenceEligibility === 'LOCAL_EVIDENCE').length,
    proposalTotal: archive.proposals.length,
    proposalActive: archive.proposals.filter((proposal) => !CLOSED_PROPOSAL_STATUSES.has(proposal.status)).length,
    proposalInReview: archive.proposals.filter((proposal) => REVIEW_PROPOSAL_STATUSES.has(proposal.status)).length,
    proposalReadyForDecision: archive.proposals.filter((proposal) => proposal.status === 'accepted-for-decision').length,
    decisionsRecordedLocal: archive.decisions.filter((decision) => decision.status === 'recorded-local').length,
    disciplineCoverageAvailable: false,
    scopeNote: 'Il registro corrente consente una vista di processo su fonti e revisioni, ma non una percentuale affidabile di copertura per disciplina/ordine.',
  };
}
