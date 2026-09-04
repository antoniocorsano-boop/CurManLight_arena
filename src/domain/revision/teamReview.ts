import type {
  OperationalGroupCode,
  OperationalGroupMemberRole,
  OperationalGroupStatus,
  OperationalSchoolOrder,
} from '../institution/operationalGroups';
import type { WorkspaceActorContext, WorkspaceMemberRole } from '../institution/sharedWorkspacePort';

export type TeamReviewOrientation =
  | 'confirm-proposal'
  | 'propose-change'
  | 'keep-previous';

export type TeamReviewBucket =
  | 'shared'
  | 'change-proposed'
  | 'divergent'
  | 'needs-clarification';

export type TeamReviewOutcome =
  | 'accept-proposal'
  | 'keep-previous'
  | 'shared-text'
  | 'defer';

export interface TeamReviewScope {
  academicYear: string;
  order: OperationalSchoolOrder;
  groupCode: OperationalGroupCode;
  discipline: string;
}

export interface TeamReviewProposalDescriptor extends TeamReviewScope {
  proposalRef: string;
  focus: string;
  proposalFingerprint: string;
}

export interface TeamReviewContribution extends TeamReviewScope {
  workspaceId: string;
  proposalRef: string;
  proposalFingerprint: string;
  contributorUserId: string;
  contributorRole: WorkspaceMemberRole;
  orientation: TeamReviewOrientation;
  customText: string | null;
  updatedAt: string;
}

export interface TeamReviewItemSummary extends TeamReviewScope {
  proposalRef: string;
  focus: string;
  proposalFingerprint: string;
  bucket: TeamReviewBucket;
  contributionCount: number;
  expectedContributorCount: number | null;
  coverageComplete: boolean;
  staleContributionCount: number;
  counts: Record<TeamReviewOrientation, number>;
  proposedTexts: string[];
  contributions: TeamReviewContribution[];
}

export interface TeamReviewSummary {
  total: number;
  shared: number;
  changeProposed: number;
  divergent: number;
  needsClarification: number;
  expectedContributorCount: number | null;
  items: TeamReviewItemSummary[];
}

export interface OperationalGroupMembership {
  userId: string;
  academicYear: string;
  schoolOrder: OperationalSchoolOrder;
  groupCode: OperationalGroupCode;
  memberRole: OperationalGroupMemberRole;
  membershipState: OperationalGroupStatus;
  disciplines: string[];
}

export interface UpsertTeamReviewContributionInput extends TeamReviewScope {
  workspaceId: string;
  proposalRef: string;
  proposalFingerprint: string;
  orientation: TeamReviewOrientation;
  customText?: string | null;
}

export interface RecordTeamReviewOutcomeInput extends TeamReviewScope {
  workspaceId: string;
  proposalRef: string;
  proposalFingerprint: string;
  outcome: TeamReviewOutcome;
  sharedText?: string | null;
  rationale: string;
  clientRequestId: string;
}

export interface TeamReviewOutcomeReceipt extends TeamReviewScope {
  id: string;
  workspaceId: string;
  proposalRef: string;
  proposalFingerprint: string;
  outcome: TeamReviewOutcome;
  sharedText: string | null;
  rationale: string;
  recordedByUserId: string;
  recordedByRole: Extract<WorkspaceMemberRole, 'docente' | 'dipartimento' | 'referente'>;
  recordedByOperationalRole: Extract<OperationalGroupMemberRole, 'coordinatore'>;
  authorityState: OperationalGroupStatus;
  recordedAt: string;
  clientRequestId: string;
}

export interface SharedTeamReviewRepository {
  upsertContribution(
    context: WorkspaceActorContext,
    input: UpsertTeamReviewContributionInput,
  ): Promise<TeamReviewContribution>;

  listContributions(
    context: WorkspaceActorContext,
    workspaceId: string,
    scope: TeamReviewScope,
  ): Promise<TeamReviewContribution[]>;

  /**
   * Counts only active workspace users who belong to the operational group and
   * declared competence for the exact discipline. Identities are never exposed.
   */
  getEligibleContributorCount(
    context: WorkspaceActorContext,
    workspaceId: string,
    scope: TeamReviewScope,
  ): Promise<number | null>;

  getMyOperationalMembership(
    context: WorkspaceActorContext,
    scope: TeamReviewScope,
  ): Promise<OperationalGroupMembership | null>;

  recordTeamOutcome(
    context: WorkspaceActorContext,
    input: RecordTeamReviewOutcomeInput,
  ): Promise<TeamReviewOutcomeReceipt>;

  listTeamOutcomes(
    context: WorkspaceActorContext,
    workspaceId: string,
    scope: TeamReviewScope,
  ): Promise<TeamReviewOutcomeReceipt[]>;
}

const emptyCounts = (): Record<TeamReviewOrientation, number> => ({
  'confirm-proposal': 0,
  'propose-change': 0,
  'keep-previous': 0,
});

const normalizeText = (value: string | null | undefined): string => value?.trim().replace(/\s+/g, ' ') ?? '';

const sameScope = (a: TeamReviewScope, b: TeamReviewScope): boolean =>
  a.academicYear === b.academicYear
  && a.order === b.order
  && a.groupCode === b.groupCode
  && a.discipline === b.discipline;

export function classifyTeamReviewItem(
  proposal: TeamReviewProposalDescriptor,
  contributions: TeamReviewContribution[],
  expectedContributorCount: number | null,
): TeamReviewItemSummary {
  const related = contributions.filter((item) =>
    item.proposalRef === proposal.proposalRef && sameScope(item, proposal));
  const current = related.filter((item) => item.proposalFingerprint === proposal.proposalFingerprint);
  const currentContributorCount = new Set(current.map((item) => item.contributorUserId)).size;
  const staleContributionCount = related.length - current.length;
  const coverageComplete = expectedContributorCount !== null
    && expectedContributorCount > 0
    && currentContributorCount >= expectedContributorCount;
  const counts = emptyCounts();
  current.forEach((item) => { counts[item.orientation] += 1; });

  const distinctOrientations = (Object.entries(counts) as [TeamReviewOrientation, number][])
    .filter(([, count]) => count > 0)
    .map(([orientation]) => orientation);
  const proposedTexts = Array.from(new Set(
    current
      .filter((item) => item.orientation === 'propose-change')
      .map((item) => normalizeText(item.customText))
      .filter(Boolean),
  ));

  let bucket: TeamReviewBucket;
  if (current.length === 0 || staleContributionCount > 0) {
    bucket = 'needs-clarification';
  } else if (distinctOrientations.length > 1) {
    bucket = 'divergent';
  } else if (distinctOrientations[0] === 'propose-change') {
    bucket = proposedTexts.length === 1 && current.every((item) => normalizeText(item.customText).length > 0)
      ? 'change-proposed'
      : 'divergent';
  } else if (!coverageComplete) {
    bucket = 'needs-clarification';
  } else {
    bucket = 'shared';
  }

  return {
    academicYear: proposal.academicYear,
    order: proposal.order,
    groupCode: proposal.groupCode,
    discipline: proposal.discipline,
    proposalRef: proposal.proposalRef,
    focus: proposal.focus,
    proposalFingerprint: proposal.proposalFingerprint,
    bucket,
    contributionCount: currentContributorCount,
    expectedContributorCount,
    coverageComplete,
    staleContributionCount,
    counts,
    proposedTexts,
    contributions: current,
  };
}

export function deriveTeamReviewSummary(
  proposals: TeamReviewProposalDescriptor[],
  contributions: TeamReviewContribution[],
  expectedContributorCount: number | null,
): TeamReviewSummary {
  const items = proposals.map((proposal) => classifyTeamReviewItem(proposal, contributions, expectedContributorCount));
  return {
    total: items.length,
    shared: items.filter((item) => item.bucket === 'shared').length,
    changeProposed: items.filter((item) => item.bucket === 'change-proposed').length,
    divergent: items.filter((item) => item.bucket === 'divergent').length,
    needsClarification: items.filter((item) => item.bucket === 'needs-clarification').length,
    expectedContributorCount,
    items,
  };
}

export async function fingerprintTeamReviewProposal(input: {
  academicYear: string;
  order: OperationalSchoolOrder;
  groupCode: OperationalGroupCode;
  discipline: string;
  proposalRef: string;
  focus: string;
  oldText: string;
  newText: string;
}): Promise<string> {
  const canonical = JSON.stringify({
    academicYear: input.academicYear,
    order: input.order,
    groupCode: input.groupCode,
    discipline: input.discipline,
    proposalRef: input.proposalRef,
    focus: input.focus.trim(),
    oldText: input.oldText.trim(),
    newText: input.newText.trim(),
  });
  const bytes = new TextEncoder().encode(canonical);
  const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}
