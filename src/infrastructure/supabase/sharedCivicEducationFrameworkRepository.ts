import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  CivicEducationAnnualFramework,
} from '../../domain/curriculum/civicEducationFramework';
import { validateCivicEducationAnnualFramework } from '../../domain/curriculum/civicEducationFramework';
import type {
  CivicEducationApprovedSnapshot,
  CivicEducationInstitutionalApprovalCommand,
  CivicEducationInstitutionalApprovalReceipt,
  SharedCivicEducationFrameworkRepository,
} from '../../domain/curriculum/civicEducationWorkspace';
import type {
  SharedWorkspaceRepository,
  WorkspaceActorContext,
} from '../../domain/institution/sharedWorkspacePort';
import { SupabaseSharedWorkspaceRepository } from './sharedWorkspaceRepository';

const SCHOOL_ORDERS = ['infanzia', 'primaria', 'secondaria'] as const;

const assertContextWorkspace = (
  context: WorkspaceActorContext,
  workspaceId: string,
): void => {
  if (context.assurance !== 'authenticated-workspace') {
    throw new Error('CIVIC_APPROVAL_AUTHENTICATED_WORKSPACE_REQUIRED');
  }
  if (context.membership.status !== 'active') {
    throw new Error('CIVIC_APPROVAL_ACTIVE_MEMBERSHIP_REQUIRED');
  }
  if (context.membership.workspaceId !== workspaceId) {
    throw new Error('CIVIC_APPROVAL_WORKSPACE_MISMATCH');
  }
};

const assertScope = (
  institutionId: string,
  academicYear: CivicEducationAnnualFramework['academicYear'],
  schoolOrder: CivicEducationAnnualFramework['schoolOrder'],
): void => {
  if (!institutionId.trim()) throw new Error('CIVIC_INSTITUTION_REQUIRED');
  if (
    !Number.isInteger(academicYear.startYear)
    || !Number.isInteger(academicYear.endYear)
    || academicYear.endYear !== academicYear.startYear + 1
  ) {
    throw new Error('CIVIC_ACADEMIC_YEAR_INVALID');
  }
  if (!SCHOOL_ORDERS.includes(schoolOrder)) {
    throw new Error('CIVIC_SCHOOL_ORDER_INVALID');
  }
};

const asReceipt = (value: unknown): CivicEducationInstitutionalApprovalReceipt => {
  const row = value as Partial<CivicEducationInstitutionalApprovalReceipt> | null;
  if (
    !row
    || row.schemaVersion !== 1
    || typeof row.id !== 'string'
    || typeof row.workspaceId !== 'string'
    || typeof row.institutionId !== 'string'
    || typeof row.frameworkId !== 'string'
    || typeof row.curriculumVersionId !== 'string'
    || !row.academicYear
    || !Number.isInteger(row.academicYear.startYear)
    || !Number.isInteger(row.academicYear.endYear)
    || row.academicYear.endYear !== row.academicYear.startYear + 1
    || !SCHOOL_ORDERS.includes(row.schoolOrder as (typeof SCHOOL_ORDERS)[number])
    || typeof row.approvedByUserId !== 'string'
    || row.approvedByRole !== 'collegio'
    || typeof row.approvedAt !== 'string'
    || !Number.isFinite(Date.parse(row.approvedAt))
    || row.status !== 'APPROVED'
    || (row.previousApprovedFrameworkId != null && typeof row.previousApprovedFrameworkId !== 'string')
  ) {
    throw new Error('Il server ha restituito una ricevuta EC-01 non valida.');
  }
  return row as CivicEducationInstitutionalApprovalReceipt;
};

const asFramework = (value: unknown): CivicEducationAnnualFramework & { status: 'approved' } => {
  const framework = value as CivicEducationAnnualFramework | null;
  if (!framework || framework.status !== 'approved') {
    throw new Error('Il server non ha restituito un quadro EC-01 approved.');
  }
  let issues: ReturnType<typeof validateCivicEducationAnnualFramework>;
  try {
    issues = validateCivicEducationAnnualFramework(framework);
  } catch {
    throw new Error('Il server ha restituito un quadro EC-01 strutturalmente non valido.');
  }
  if (issues.some(issue => issue.severity === 'error')) {
    throw new Error('Il server ha restituito un quadro EC-01 strutturalmente non valido.');
  }
  if (!framework.approvedAt || framework.approvedByRole !== 'collegio') {
    throw new Error('Il quadro EC-01 approved non contiene evidenza di approvazione.');
  }
  return framework as CivicEducationAnnualFramework & { status: 'approved' };
};

const asSnapshot = (value: unknown): CivicEducationApprovedSnapshot => {
  const row = value as { framework?: unknown; receipt?: unknown } | null;
  if (!row) throw new Error('Il server non ha restituito lo snapshot EC-01.');
  const framework = asFramework(row.framework);
  const receipt = asReceipt(row.receipt);

  if (
    framework.id !== receipt.frameworkId
    || framework.institutionId !== receipt.institutionId
    || framework.curriculumVersionId !== receipt.curriculumVersionId
    || framework.schoolOrder !== receipt.schoolOrder
    || framework.academicYear.startYear !== receipt.academicYear.startYear
    || framework.academicYear.endYear !== receipt.academicYear.endYear
    || framework.approvedAt !== receipt.approvedAt
    || framework.approvedByRole !== receipt.approvedByRole
  ) {
    throw new Error('Snapshot e ricevuta EC-01 restituiti dal server non sono coerenti.');
  }

  const previous = framework.previousFrameworkId;
  if ((previous ?? undefined) !== (receipt.previousApprovedFrameworkId ?? undefined)) {
    throw new Error('La catena di supersession EC-01 non coincide con la ricevuta.');
  }

  return { framework, receipt };
};

const assertCommand = (command: CivicEducationInstitutionalApprovalCommand): void => {
  if (!command.workspaceId.trim()) throw new Error('CIVIC_APPROVAL_WORKSPACE_REQUIRED');
  if (!command.clientRequestId.trim()) throw new Error('CIVIC_APPROVAL_REQUEST_ID_REQUIRED');
  if (command.candidate.status !== 'proposed-to-collegio') {
    throw new Error('CIVIC_APPROVAL_CANDIDATE_NOT_PROPOSED');
  }
  if (
    command.expectedCurrentApprovedFrameworkId != null
    && !command.expectedCurrentApprovedFrameworkId.trim()
  ) {
    throw new Error('CIVIC_APPROVAL_EXPECTED_HEAD_INVALID');
  }
};

export class SupabaseSharedCivicEducationFrameworkRepository
implements SharedCivicEducationFrameworkRepository {
  private readonly workspaceRepository: SharedWorkspaceRepository;

  constructor(
    private readonly client: SupabaseClient,
    workspaceRepository?: SharedWorkspaceRepository,
  ) {
    this.workspaceRepository = workspaceRepository ?? new SupabaseSharedWorkspaceRepository(client);
  }

  async getCurrentApproved(
    context: WorkspaceActorContext,
    institutionId: string,
    academicYear: CivicEducationAnnualFramework['academicYear'],
    schoolOrder: CivicEducationAnnualFramework['schoolOrder'],
  ): Promise<CivicEducationApprovedSnapshot | null> {
    assertContextWorkspace(context, context.membership.workspaceId);
    assertScope(institutionId, academicYear, schoolOrder);

    if (!(await this.workspaceRepository.can(context, 'CURRICULUM_READ'))) {
      throw new Error('CURRICULUM_READ_REQUIRED');
    }

    const { data, error } = await this.client.rpc('get_current_civic_education_framework_v1', {
      p_workspace_id: context.membership.workspaceId,
      p_expected_context_user_id: context.membership.userId,
      p_institution_id: institutionId.trim(),
      p_academic_start_year: academicYear.startYear,
      p_academic_end_year: academicYear.endYear,
      p_school_order: schoolOrder,
    });

    if (error) throw new Error(`Quadro EC-01 approvato non leggibile: ${error.message}`);
    return data == null ? null : asSnapshot(data);
  }

  async approve(
    context: WorkspaceActorContext,
    command: CivicEducationInstitutionalApprovalCommand,
  ): Promise<CivicEducationApprovedSnapshot> {
    assertContextWorkspace(context, command.workspaceId);
    assertCommand(command);

    if (!(await this.workspaceRepository.can(context, 'REVISION_DECIDE'))) {
      throw new Error('REVISION_DECIDE_REQUIRED');
    }

    const { data, error } = await this.client.rpc('approve_civic_education_framework_v1', {
      p_workspace_id: command.workspaceId,
      p_expected_context_user_id: context.membership.userId,
      p_expected_current_approved_framework_id: command.expectedCurrentApprovedFrameworkId,
      p_candidate: command.candidate,
      p_client_request_id: command.clientRequestId,
    });

    if (error) throw new Error(`Quadro EC-01 non approvato: ${error.message}`);
    const snapshot = asSnapshot(data);
    if (snapshot.receipt.workspaceId !== command.workspaceId) {
      throw new Error('Il server ha restituito un workspace EC-01 incoerente.');
    }
    if (snapshot.receipt.approvedByUserId !== context.membership.userId) {
      throw new Error('Il server non ha vincolato l’approvazione EC-01 al principal autenticato.');
    }
    if (
      (snapshot.receipt.previousApprovedFrameworkId ?? null)
      !== command.expectedCurrentApprovedFrameworkId
    ) {
      throw new Error('Il server non ha rispettato la baseline CAS EC-01 richiesta.');
    }
    return snapshot;
  }
}
