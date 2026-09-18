import type { CurriculumReviewCase, CurriculumUnitReference } from '../../types/curriculum';

export type SharedReviewCaseAssignmentState = 'ASSIGNED';

export interface SharedReviewCaseContext {
  source: 'SERVER_ASSIGNMENT';
  workspaceId: string;
  academicYear: string;
  groupCode: string;
  discipline: string;
  publishedAt: string;
  publishedByUserId: string;
  publishedByRole: 'dipartimento' | 'referente';
  assignmentState: SharedReviewCaseAssignmentState;
  assignmentCount: number;
}

export interface SharedReviewCaseRow {
  case_id: string;
  workspace_id: string;
  academic_year: string;
  group_code: string;
  discipline: string;
  school_order: 'primaria' | 'secondaria';
  class_or_age_band: string;
  curriculum_unit_key: string;
  master_id: 'CAN-CURR-MASTER-00';
  master_drive_file_id: string;
  master_version: string;
  trigger_id: string;
  trigger_type: CurriculumReviewCase['originTriggerSnapshot']['triggerType'];
  qualification_basis: CurriculumReviewCase['originTriggerSnapshot']['qualificationBasis'];
  trigger_recorded_at: string;
  targeted_proposal_refs: string[];
  scope_reason: string;
  opened_at: string;
  opened_by_user_id: string;
  opened_by_role: string;
  published_by_user_id: string;
  published_by_role: 'dipartimento' | 'referente';
  published_at: string;
  assignment_state: SharedReviewCaseAssignmentState;
  assignment_count: number;
}

export type SharedCurriculumReviewCase = CurriculumReviewCase & {
  sharedContext: SharedReviewCaseContext;
};

const canonicalText = (value: string): string => value.trim().replace(/\s+/g, ' ');

export function getSharedReviewCaseContext(reviewCase: CurriculumReviewCase): SharedReviewCaseContext | null {
  return (reviewCase as CurriculumReviewCase & { sharedContext?: SharedReviewCaseContext }).sharedContext ?? null;
}

export function isSharedReviewCase(reviewCase: CurriculumReviewCase): reviewCase is SharedCurriculumReviewCase {
  return Boolean(getSharedReviewCaseContext(reviewCase));
}

export function sharedRowToCurriculumReviewCase(row: SharedReviewCaseRow): SharedCurriculumReviewCase {
  if (!row.case_id?.startsWith('CRC:')) throw new Error('SHARED_REVIEW_CASE_ID_INVALID');
  if (!/^\d{4}\/\d{4}$/.test(row.academic_year)) throw new Error('SHARED_REVIEW_CASE_ACADEMIC_YEAR_INVALID');
  if (!Array.isArray(row.targeted_proposal_refs) || row.targeted_proposal_refs.length === 0) {
    throw new Error('SHARED_REVIEW_CASE_EMPTY_SCOPE');
  }
  if (new Set(row.targeted_proposal_refs).size !== row.targeted_proposal_refs.length) {
    throw new Error('SHARED_REVIEW_CASE_DUPLICATE_PROPOSAL');
  }
  if (!canonicalText(row.scope_reason)) throw new Error('SHARED_REVIEW_CASE_SCOPE_REASON_REQUIRED');
  if (!Number.isInteger(row.assignment_count) || row.assignment_count <= 0) {
    throw new Error('SHARED_REVIEW_CASE_ASSIGNMENT_COUNT_INVALID');
  }

  const curriculumUnit: CurriculumUnitReference = {
    masterId: row.master_id,
    masterDriveFileId: row.master_drive_file_id,
    masterVersion: row.master_version,
    unitKey: row.curriculum_unit_key,
    identityKind: 'ARENA_MASTER_CONTEXT_KEY',
    order: row.school_order,
    classOrAgeBand: row.class_or_age_band,
    disciplineOrField: row.discipline,
    resolutionState: 'CONTEXT_BOUND',
  };

  return {
    id: row.case_id,
    kind: 'CURRICULUM_REVIEW_CASE',
    originTriggerSnapshot: {
      id: row.trigger_id,
      triggerType: row.trigger_type,
      qualificationBasis: row.qualification_basis,
      recordedAt: row.trigger_recorded_at,
    },
    openedAt: row.opened_at,
    openedBy: {
      actorId: row.opened_by_user_id,
      roleContext: row.opened_by_role,
      identityState: 'AUTHENTICATED_SESSION',
      institutionalAuthorityInferred: false,
    },
    curriculumUnit,
    currentMaster: {
      id: row.master_id,
      driveFileId: row.master_drive_file_id,
      version: row.master_version,
    },
    targetedProposalRefs: [...row.targeted_proposal_refs],
    scopeReason: canonicalText(row.scope_reason),
    targetScopeFrozen: true,
    readinessAtOpening: {
      state: 'READY_TO_OPEN',
      checks: {
        qualifiedTrigger: true,
        currentMasterMatch: true,
        curriculumUnitScopeMatch: true,
        targetedProposalSelection: true,
        targetedProposalsKnown: true,
        explicitScopeReason: true,
      },
      blockers: [],
    },
    caseState: 'OPEN_AT_APPLICABLE_CURRICULUM',
    cycleReentryPhase: 'H1_APPLICABLE_CURRICULUM',
    currentHumanPhase: 'H1_APPLICABLE_CURRICULUM',
    professionalValidationState: 'NOT_STARTED',
    explicitHumanOpening: true,
    automaticProfessionalContributionReuse: false,
    decisionCarryForwardFromPreviousReview: false,
    automaticCurriculumChange: false,
    automaticTeamOutcome: false,
    automaticInstitutionalDecision: false,
    automaticMasterPromotion: false,
    parallelCurriculumBaselineCreation: false,
    sharedContext: {
      source: 'SERVER_ASSIGNMENT',
      workspaceId: row.workspace_id,
      academicYear: row.academic_year,
      groupCode: row.group_code,
      discipline: row.discipline,
      publishedAt: row.published_at,
      publishedByUserId: row.published_by_user_id,
      publishedByRole: row.published_by_role,
      assignmentState: row.assignment_state,
      assignmentCount: row.assignment_count,
    },
  };
}

export function sameReviewCaseOpeningSnapshot(a: CurriculumReviewCase, b: CurriculumReviewCase): boolean {
  return a.id === b.id
    && a.originTriggerSnapshot.id === b.originTriggerSnapshot.id
    && a.originTriggerSnapshot.triggerType === b.originTriggerSnapshot.triggerType
    && a.originTriggerSnapshot.qualificationBasis === b.originTriggerSnapshot.qualificationBasis
    && a.currentMaster.id === b.currentMaster.id
    && a.currentMaster.driveFileId === b.currentMaster.driveFileId
    && a.currentMaster.version === b.currentMaster.version
    && a.curriculumUnit.unitKey === b.curriculumUnit.unitKey
    && a.curriculumUnit.order === b.curriculumUnit.order
    && a.curriculumUnit.classOrAgeBand === b.curriculumUnit.classOrAgeBand
    && a.curriculumUnit.disciplineOrField === b.curriculumUnit.disciplineOrField
    && canonicalText(a.scopeReason) === canonicalText(b.scopeReason)
    && JSON.stringify(a.targetedProposalRefs) === JSON.stringify(b.targetedProposalRefs);
}

export function mergeAssignedReviewCases(
  localCases: CurriculumReviewCase[],
  assignedCases: SharedCurriculumReviewCase[],
): CurriculumReviewCase[] {
  const merged = [...localCases];
  for (const assigned of assignedCases) {
    const index = merged.findIndex((candidate) => candidate.id === assigned.id);
    if (index < 0) {
      merged.push(assigned);
      continue;
    }
    const existing = merged[index];
    if (!sameReviewCaseOpeningSnapshot(existing, assigned)) throw new Error('SHARED_REVIEW_CASE_SNAPSHOT_MISMATCH');
    merged[index] = {
      ...existing,
      ...(assigned as CurriculumReviewCase),
      workSession: existing.workSession,
      caseState: existing.workSession ? existing.caseState : assigned.caseState,
      currentHumanPhase: existing.workSession ? existing.currentHumanPhase : assigned.currentHumanPhase,
      professionalValidationState: existing.workSession ? existing.professionalValidationState : assigned.professionalValidationState,
      sharedContext: assigned.sharedContext,
    } as CurriculumReviewCase;
  }
  return merged;
}
