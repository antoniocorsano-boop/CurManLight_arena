import type { SupabaseClient } from '@supabase/supabase-js';
import type { WorkspaceActorContext } from '../../domain/institution/sharedWorkspacePort';
import type { OperationalGroupCode } from '../../domain/institution/operationalGroups';
import {
  sharedRowToCurriculumReviewCase,
  type SharedCurriculumReviewCase,
  type SharedReviewCaseRow,
} from '../../domain/curriculum/sharedReviewCase';
import type { CurriculumReviewCase } from '../../types/curriculum';

export interface SharedReviewCaseScope {
  workspaceId: string;
  academicYear: string;
  groupCode: OperationalGroupCode;
  discipline: string;
}

export interface PublishSharedReviewCaseInput extends SharedReviewCaseScope {
  reviewCase: CurriculumReviewCase;
}

export interface PublishSharedReviewCaseReceipt {
  reviewCase: SharedCurriculumReviewCase;
  assignmentCount: number;
}

const assertContext = (context: WorkspaceActorContext, workspaceId: string): void => {
  if (context.assurance !== 'authenticated-workspace') throw new Error('SHARED_REVIEW_CASE_AUTHORITY_UNAVAILABLE');
  if (context.membership.workspaceId !== workspaceId || context.membership.status !== 'active') {
    throw new Error('Il caso non appartiene a una membership attiva del workspace corrente.');
  }
};

const assertScope = (scope: SharedReviewCaseScope): void => {
  if (!/^\d{4}\/\d{4}$/.test(scope.academicYear)) throw new Error('Anno scolastico non valido.');
  if (!scope.discipline.trim()) throw new Error('Disciplina non valida.');
};

const sharedError = (message: string): Error => {
  if (message.includes('SHARED_REVIEW_CASE_ASSIGN_REQUIRED')) {
    return new Error('Solo una membership verificata di Dipartimento o Referente può assegnare il caso al gruppo.');
  }
  if (message.includes('OPERATIONAL_DISCIPLINE_MEMBERSHIP_REQUIRED')) {
    return new Error('La tua appartenenza operativa non copre questa disciplina.');
  }
  if (message.includes('SHARED_REVIEW_CASE_NO_ELIGIBLE_ASSIGNEES')) {
    return new Error('Non risultano partecipanti attivi e competenti a cui assegnare questo caso.');
  }
  if (message.includes('SHARED_REVIEW_CASE_ID_REUSE_MISMATCH')) {
    return new Error('Esiste già un caso condiviso con lo stesso identificativo ma con un perimetro diverso.');
  }
  return new Error(message);
};

const parseRows = (value: unknown): SharedCurriculumReviewCase[] => {
  if (!Array.isArray(value)) throw new Error('Il server non ha restituito un elenco di casi assegnati valido.');
  return value.map((item) => sharedRowToCurriculumReviewCase(item as SharedReviewCaseRow));
};

export class SupabaseSharedCurriculumReviewCaseRepository {
  constructor(private readonly client: SupabaseClient) {}

  async publishCase(
    context: WorkspaceActorContext,
    input: PublishSharedReviewCaseInput,
  ): Promise<PublishSharedReviewCaseReceipt> {
    assertContext(context, input.workspaceId);
    assertScope(input);
    const reviewCase = input.reviewCase;
    if (reviewCase.kind !== 'CURRICULUM_REVIEW_CASE' || !reviewCase.targetScopeFrozen) {
      throw new Error('Solo un CurriculumReviewCase aperto e con perimetro congelato può essere assegnato.');
    }
    if (reviewCase.currentMaster.id !== 'CAN-CURR-MASTER-00') throw new Error('Master del caso non valido.');
    if (reviewCase.curriculumUnit.disciplineOrField !== input.discipline) throw new Error('Disciplina del caso non coerente con il gruppo.');
    if (reviewCase.targetedProposalRefs.length === 0) throw new Error('Il caso non contiene schede da assegnare.');

    const { data, error } = await this.client.rpc('publish_curriculum_review_case_v1', {
      p_workspace_id: input.workspaceId,
      p_academic_year: input.academicYear,
      p_group_code: input.groupCode,
      p_discipline: input.discipline,
      p_case_id: reviewCase.id,
      p_school_order: reviewCase.curriculumUnit.order,
      p_class_or_age_band: reviewCase.curriculumUnit.classOrAgeBand,
      p_curriculum_unit_key: reviewCase.curriculumUnit.unitKey,
      p_master_id: reviewCase.currentMaster.id,
      p_master_drive_file_id: reviewCase.currentMaster.driveFileId,
      p_master_version: reviewCase.currentMaster.version,
      p_trigger_id: reviewCase.originTriggerSnapshot.id,
      p_trigger_type: reviewCase.originTriggerSnapshot.triggerType,
      p_qualification_basis: reviewCase.originTriggerSnapshot.qualificationBasis,
      p_trigger_recorded_at: reviewCase.originTriggerSnapshot.recordedAt,
      p_targeted_proposal_refs: reviewCase.targetedProposalRefs,
      p_scope_reason: reviewCase.scopeReason,
      p_opened_at: reviewCase.openedAt,
      p_opened_by_user_id: reviewCase.openedBy.actorId ?? null,
      p_opened_by_role: reviewCase.openedBy.roleContext ?? null,
    });
    if (error) throw sharedError(error.message);
    if (!data || typeof data !== 'object') throw new Error('Il server non ha restituito la ricevuta di assegnazione del caso.');
    const payload = data as { review_case?: SharedReviewCaseRow; assignment_count?: number };
    if (!payload.review_case || !Number.isInteger(payload.assignment_count) || (payload.assignment_count ?? 0) <= 0) {
      throw new Error('Ricevuta di assegnazione del caso incompleta.');
    }
    const shared = sharedRowToCurriculumReviewCase({
      ...payload.review_case,
      assignment_count: payload.assignment_count as number,
      assignment_state: 'ASSIGNED',
    });
    return { reviewCase: shared, assignmentCount: payload.assignment_count as number };
  }

  async listMyAssignedCases(
    context: WorkspaceActorContext,
    scope: SharedReviewCaseScope,
  ): Promise<SharedCurriculumReviewCase[]> {
    assertContext(context, scope.workspaceId);
    assertScope(scope);
    const { data, error } = await this.client.rpc('list_my_assigned_curriculum_review_cases_v1', {
      p_workspace_id: scope.workspaceId,
      p_academic_year: scope.academicYear,
      p_group_code: scope.groupCode,
      p_discipline: scope.discipline,
    });
    if (error) throw sharedError(error.message);
    return parseRows(data ?? []);
  }
}
