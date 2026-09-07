import type { OperationalSchoolOrder } from '../institution/operationalGroups';
import type { WorkspaceActorContext, WorkspaceMemberRole } from '../institution/sharedWorkspacePort';
import type { TeamReviewOutcome } from './teamReview';

export type VerticalReviewFindingKind =
  | 'PROGRESSION_LINK'
  | 'GAP'
  | 'DUPLICATION'
  | 'MISSING_PREREQUISITE'
  | 'OPEN_QUESTION';

export type VerticalReviewOutcomeState = 'COHERENT' | 'ISSUES_FOUND' | 'DEFERRED';

export interface VerticalReviewMasterReference {
  id: 'CAN-CURR-MASTER-00';
  driveFileId: string;
  version: string;
}

export interface VerticalReviewCandidate {
  teamOutcomeId: string;
  workspaceId: string;
  reviewCaseId: string;
  academicYear: string;
  groupCode: string;
  discipline: string;
  schoolOrder: OperationalSchoolOrder;
  classOrAgeBand: string;
  curriculumUnitKey: string;
  masterId: 'CAN-CURR-MASTER-00';
  masterDriveFileId: string;
  masterVersion: string;
  proposalRef: string;
  proposalFingerprint: string;
  teamOutcome: TeamReviewOutcome;
  sharedText: string | null;
  teamRationale: string;
  teamOutcomeRecordedAt: string;
  scopeReason: string;
}

export interface VerticalReviewFinding {
  kind: VerticalReviewFindingKind;
  fromUnitKey: string;
  toUnitKey: string;
  note: string;
}

export interface VerticalReviewSourceSnapshot {
  teamOutcomeId: string;
  reviewCaseId: string;
  curriculumUnitKey: string;
  schoolOrder: OperationalSchoolOrder;
  classOrAgeBand: string;
  discipline: string;
  proposalRef: string;
  proposalFingerprint: string;
  teamOutcome: TeamReviewOutcome;
  teamOutcomeRecordedAt: string;
}

export interface RecordVerticalReviewOutcomeInput {
  workspaceId: string;
  master: VerticalReviewMasterReference;
  sourceTeamOutcomeIds: [string, string];
  outcome: VerticalReviewOutcomeState;
  findings: VerticalReviewFinding[];
  rationale: string;
  clientRequestId: string;
}

export interface VerticalReviewOutcomeReceipt {
  id: string;
  kind: 'VERTICAL_REVIEW_OUTCOME';
  workspaceId: string;
  master: VerticalReviewMasterReference;
  sourceTeamOutcomeIds: [string, string];
  sourceTeamOutcomes: VerticalReviewSourceSnapshot[];
  reviewedUnitKeys: [string, string];
  outcome: VerticalReviewOutcomeState;
  findings: VerticalReviewFinding[];
  rationale: string;
  recordedByUserId: string;
  recordedByRole: Extract<WorkspaceMemberRole, 'dipartimento' | 'referente' | 'dirigente'>;
  recordedAt: string;
  clientRequestId: string;
  institutionalDecisionCreated: false;
  adoptionReceiptCreated: false;
  curriculumInForceChanged: false;
  automaticMasterPromotion: false;
}

export interface VerticalReviewRepository {
  listCandidates(
    context: WorkspaceActorContext,
    workspaceId: string,
    master: VerticalReviewMasterReference,
    discipline: string,
  ): Promise<VerticalReviewCandidate[]>;

  recordOutcome(
    context: WorkspaceActorContext,
    input: RecordVerticalReviewOutcomeInput,
  ): Promise<VerticalReviewOutcomeReceipt>;

  listOutcomes(
    context: WorkspaceActorContext,
    workspaceId: string,
    master: VerticalReviewMasterReference,
  ): Promise<VerticalReviewOutcomeReceipt[]>;
}

export interface BuildVerticalReviewOutcomeDraftInput {
  workspaceId: string;
  master: VerticalReviewMasterReference;
  previous: VerticalReviewCandidate;
  next: VerticalReviewCandidate;
  linkReview: string;
  gap?: string;
  duplication?: string;
  missingPrerequisite?: string;
  openQuestion?: string;
  rationale: string;
  clientRequestId: string;
}

const normalizeRequiredText = (value: string, field: string, maxLength: number): string => {
  const normalized = value.trim().replace(/\s+/g, ' ');
  if (!normalized || normalized.length > maxLength) throw new Error(`${field}_INVALID`);
  return normalized;
};

const normalizeOptionalText = (value: string | undefined, maxLength: number): string | null => {
  const normalized = value?.trim().replace(/\s+/g, ' ') ?? '';
  if (!normalized) return null;
  if (normalized.length > maxLength) throw new Error('VERTICAL_REVIEW_FINDING_TOO_LONG');
  return normalized;
};

const candidateMatchesMaster = (
  candidate: VerticalReviewCandidate,
  master: VerticalReviewMasterReference,
): boolean => candidate.masterId === master.id
  && candidate.masterDriveFileId === master.driveFileId
  && candidate.masterVersion === master.version;

export function buildVerticalReviewOutcomeDraft({
  workspaceId,
  master,
  previous,
  next,
  linkReview,
  gap,
  duplication,
  missingPrerequisite,
  openQuestion,
  rationale,
  clientRequestId,
}: BuildVerticalReviewOutcomeDraftInput): RecordVerticalReviewOutcomeInput {
  if (!workspaceId || previous.workspaceId !== workspaceId || next.workspaceId !== workspaceId) {
    throw new Error('VERTICAL_REVIEW_WORKSPACE_MISMATCH');
  }
  if (previous.teamOutcomeId === next.teamOutcomeId) throw new Error('VERTICAL_REVIEW_SOURCES_MUST_DIFFER');
  if (previous.curriculumUnitKey === next.curriculumUnitKey) throw new Error('VERTICAL_REVIEW_UNITS_MUST_DIFFER');
  if (previous.discipline !== next.discipline) throw new Error('VERTICAL_REVIEW_DISCIPLINE_MISMATCH');
  if (!candidateMatchesMaster(previous, master) || !candidateMatchesMaster(next, master)) {
    throw new Error('VERTICAL_REVIEW_MASTER_MISMATCH');
  }

  const fromUnitKey = previous.curriculumUnitKey;
  const toUnitKey = next.curriculumUnitKey;
  const findings: VerticalReviewFinding[] = [{
    kind: 'PROGRESSION_LINK',
    fromUnitKey,
    toUnitKey,
    note: normalizeRequiredText(linkReview, 'VERTICAL_REVIEW_LINK', 1200),
  }];

  const optionalFindings: Array<[VerticalReviewFindingKind, string | null]> = [
    ['GAP', normalizeOptionalText(gap, 1200)],
    ['DUPLICATION', normalizeOptionalText(duplication, 1200)],
    ['MISSING_PREREQUISITE', normalizeOptionalText(missingPrerequisite, 1200)],
    ['OPEN_QUESTION', normalizeOptionalText(openQuestion, 1200)],
  ];
  optionalFindings.forEach(([kind, note]) => {
    if (note) findings.push({ kind, fromUnitKey, toUnitKey, note });
  });

  const hasOpenQuestion = findings.some((finding) => finding.kind === 'OPEN_QUESTION');
  const hasIssue = findings.some((finding) => (
    finding.kind === 'GAP'
    || finding.kind === 'DUPLICATION'
    || finding.kind === 'MISSING_PREREQUISITE'
  ));
  const sourceDeferred = previous.teamOutcome === 'defer' || next.teamOutcome === 'defer';
  const outcome: VerticalReviewOutcomeState = sourceDeferred || hasOpenQuestion
    ? 'DEFERRED'
    : hasIssue
      ? 'ISSUES_FOUND'
      : 'COHERENT';

  return {
    workspaceId,
    master: { ...master },
    sourceTeamOutcomeIds: [previous.teamOutcomeId, next.teamOutcomeId],
    outcome,
    findings,
    rationale: normalizeRequiredText(rationale, 'VERTICAL_REVIEW_RATIONALE', 4000),
    clientRequestId: normalizeRequiredText(clientRequestId, 'VERTICAL_REVIEW_CLIENT_REQUEST_ID', 120),
  };
}
