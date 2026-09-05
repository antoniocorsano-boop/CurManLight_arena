import type { Proposal, SchoolOrder } from '../../types/curriculum';
import type { TeamReviewContribution, TeamReviewItemSummary } from './teamReview';

export type TeamDiscussionReasonCode =
  | 'no-current-contributions'
  | 'stale-contributions'
  | 'coverage-incomplete'
  | 'divergent-orientations'
  | 'alternative-text-proposed'
  | 'shared';

export interface TeamDiscussionReason {
  code: TeamDiscussionReasonCode;
  title: string;
  detail: string;
}

export type TeamReviewSourceStatus = 'verified' | 'partial' | 'unlinked';

export interface TeamReviewSourceDescriptor {
  label: string;
  status: TeamReviewSourceStatus;
  reference?: string;
}

export interface TeamReviewProvenanceView {
  proposalRef: string;
  discipline: string;
  order: SchoolOrder;
  previousSource: TeamReviewSourceDescriptor;
  proposedSource: TeamReviewSourceDescriptor;
  versionLabel: string;
  technicalVersionRef: string;
  sourceStatus: TeamReviewSourceStatus;
}

const ORDER_LABELS: Record<SchoolOrder, string> = {
  infanzia: 'Scuola dell’infanzia',
  primaria: 'Scuola primaria',
  secondaria: 'Scuola secondaria di primo grado',
};

export function deriveTeamDiscussionReason(item: TeamReviewItemSummary): TeamDiscussionReason {
  if (item.staleContributionCount > 0) {
    return {
      code: 'stale-contributions',
      title: 'Versione da riallineare',
      detail: `${item.staleContributionCount} ${item.staleContributionCount === 1 ? 'contributo si riferisce' : 'contributi si riferiscono'} a una versione precedente della scheda e non ${item.staleContributionCount === 1 ? 'viene' : 'vengono'} conteggiato nella sintesi corrente.`,
    };
  }

  if (item.contributionCount === 0) {
    return {
      code: 'no-current-contributions',
      title: 'Mancano contributi correnti',
      detail: 'Nessun contributo autenticato è ancora disponibile per la versione corrente della scheda.',
    };
  }

  if (item.bucket === 'divergent') {
    return {
      code: 'divergent-orientations',
      title: 'Orientamenti diversi',
      detail: 'Il punto entra nel confronto perché i contributi correnti non esprimono lo stesso orientamento o propongono formulazioni differenti.',
    };
  }

  if (item.bucket === 'change-proposed') {
    return {
      code: 'alternative-text-proposed',
      title: 'È stata proposta una modifica',
      detail: 'Il punto entra nel confronto perché i contributi correnti propongono una formulazione alternativa da esaminare insieme.',
    };
  }

  if (!item.coverageComplete) {
    const expected = item.expectedContributorCount;
    const coverage = expected === null
      ? `${item.contributionCount} contributi correnti; copertura complessiva non verificabile`
      : `${item.contributionCount}/${expected} contributi correnti`;
    return {
      code: 'coverage-incomplete',
      title: 'Copertura incompleta',
      detail: `${coverage}. Il punto resta aperto perché non sono ancora presenti tutti i contributi attesi del team.`,
    };
  }

  return {
    code: 'shared',
    title: 'Punto condiviso',
    detail: 'Gli orientamenti correnti sono concordi e la copertura del team è completa.',
  };
}

export function buildTeamReviewProvenance(
  proposal: Proposal,
  discipline: string,
  order: SchoolOrder,
  proposalFingerprint: string,
): TeamReviewProvenanceView {
  return {
    proposalRef: proposal.id,
    discipline,
    order,
    previousSource: {
      label: 'Testo precedente presente nel dataset curricolare Arena',
      status: 'unlinked',
    },
    proposedSource: {
      label: 'Proposta aggiornata presente nel dataset curricolare Arena',
      status: 'unlinked',
    },
    versionLabel: 'Versione corrente verificata rispetto al contenuto visibile',
    technicalVersionRef: proposalFingerprint,
    sourceStatus: 'unlinked',
  };
}

export function teamReviewContextLabel(discipline: string, order: SchoolOrder): string {
  const normalized = discipline.trim();
  const disciplineLabel = normalized ? normalized.charAt(0).toUpperCase() + normalized.slice(1) : 'Disciplina non specificata';
  return `${disciplineLabel} · ${ORDER_LABELS[order]}`;
}

export function contributionOriginLabel(contribution: TeamReviewContribution, currentUserId: string | null): string {
  if (currentUserId && contribution.contributorUserId === currentUserId) return 'Il tuo contributo';
  if (contribution.contributorRole === 'dipartimento') return 'Coordinatore di dipartimento';
  if (contribution.contributorRole === 'referente') return 'Referente';
  return 'Docente';
}

export function contributionOrientationLabel(contribution: TeamReviewContribution): string {
  if (contribution.orientation === 'confirm-proposal') return 'Conferma la proposta';
  if (contribution.orientation === 'keep-previous') return 'Mantiene il testo precedente';
  return 'Propone una modifica';
}
