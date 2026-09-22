/**
 * EC-01/Arena-F2 — Workspace persistente controllato per Educazione civica.
 *
 * Regola di autorità:
 * - LOCAL_DEVICE conserva soltanto lavoro preparatorio non autorevole;
 * - SHARED_INSTITUTIONAL è l'unico piano che può produrre un quadro approved.
 */

import type { WorkspaceActorContext } from '../institution/sharedWorkspacePort';
import type {
  CivicEducationAnnualFramework,
  CivicEducationApprovalGateResult,
  CivicEducationCurriculumBindingContext,
} from './civicEducationFramework';
import {
  evaluateCivicEducationApprovalGate,
  validateCivicEducationAnnualFramework,
  validateCivicEducationCurriculumBindings,
} from './civicEducationFramework';
import { canTransitionVersionStatus } from './validation-legacy';

export const CIVIC_EDUCATION_DRAFT_ARCHIVE_SCHEMA_VERSION = 1 as const;

export type CivicEducationLocalDraftStatus =
  | 'draft'
  | 'under-review'
  | 'proposed-to-collegio';

export interface CivicEducationDraftArchive {
  schemaVersion: typeof CIVIC_EDUCATION_DRAFT_ARCHIVE_SCHEMA_VERSION;
  updatedAt: string;
  frameworks: CivicEducationAnnualFramework[];
}

export interface CivicEducationDraftArchiveIssue {
  code: string;
  message: string;
  frameworkId?: string;
}

export interface CivicEducationDraftArchiveValidationResult {
  valid: boolean;
  errors: CivicEducationDraftArchiveIssue[];
  warnings: CivicEducationDraftArchiveIssue[];
}

export type CivicEducationDraftArchiveOperationResult =
  | { success: true; archive: CivicEducationDraftArchive; framework?: CivicEducationAnnualFramework }
  | { success: false; errors: CivicEducationDraftArchiveIssue[] };

export interface CivicEducationInstitutionalApprovalCommand {
  workspaceId: string;
  clientRequestId: string;
  expectedCurrentApprovedFrameworkId: string | null;
  candidate: CivicEducationAnnualFramework;
}

export interface CivicEducationInstitutionalApprovalReceipt {
  schemaVersion: 1;
  id: string;
  workspaceId: string;
  institutionId: string;
  frameworkId: string;
  curriculumVersionId: string;
  academicYear: CivicEducationAnnualFramework['academicYear'];
  schoolOrder: CivicEducationAnnualFramework['schoolOrder'];
  approvedByUserId: string;
  approvedByRole: 'collegio';
  approvedAt: string;
  previousApprovedFrameworkId?: string;
  status: 'APPROVED';
}

export interface CivicEducationApprovedSnapshot {
  framework: CivicEducationAnnualFramework & { status: 'approved' };
  receipt: CivicEducationInstitutionalApprovalReceipt;
}

export interface SharedCivicEducationFrameworkRepository {
  getCurrentApproved(
    context: WorkspaceActorContext,
    institutionId: string,
    academicYear: CivicEducationAnnualFramework['academicYear'],
    schoolOrder: CivicEducationAnnualFramework['schoolOrder'],
  ): Promise<CivicEducationApprovedSnapshot | null>;

  approve(
    context: WorkspaceActorContext,
    command: CivicEducationInstitutionalApprovalCommand,
  ): Promise<CivicEducationApprovedSnapshot>;
}

export interface PrepareCivicEducationApprovalCommandInput {
  workspaceId: string;
  clientRequestId: string;
  expectedCurrentApprovedFrameworkId: string | null;
}

const LOCAL_DRAFT_STATUSES: readonly CivicEducationLocalDraftStatus[] = [
  'draft',
  'under-review',
  'proposed-to-collegio',
] as const;

const cloneFramework = (
  framework: CivicEducationAnnualFramework,
): CivicEducationAnnualFramework => JSON.parse(JSON.stringify(framework)) as CivicEducationAnnualFramework;

export function createEmptyCivicEducationDraftArchive(
  now = new Date().toISOString(),
): CivicEducationDraftArchive {
  return {
    schemaVersion: CIVIC_EDUCATION_DRAFT_ARCHIVE_SCHEMA_VERSION,
    updatedAt: now,
    frameworks: [],
  };
}

export function cloneCivicEducationDraftArchive(
  archive: CivicEducationDraftArchive,
): CivicEducationDraftArchive {
  return {
    schemaVersion: CIVIC_EDUCATION_DRAFT_ARCHIVE_SCHEMA_VERSION,
    updatedAt: archive.updatedAt,
    frameworks: archive.frameworks.map(cloneFramework),
  };
}

export function isLocalCivicEducationDraftStatus(
  status: CivicEducationAnnualFramework['status'],
): status is CivicEducationLocalDraftStatus {
  return LOCAL_DRAFT_STATUSES.includes(status as CivicEducationLocalDraftStatus);
}

export function validateCivicEducationDraftArchive(
  value: unknown,
): CivicEducationDraftArchiveValidationResult {
  const errors: CivicEducationDraftArchiveIssue[] = [];
  const warnings: CivicEducationDraftArchiveIssue[] = [];

  if (!value || typeof value !== 'object') {
    return {
      valid: false,
      errors: [{ code: 'CIVIC_DRAFT_ARCHIVE_INVALID', message: 'Archivio locale non valido.' }],
      warnings,
    };
  }

  const archive = value as Partial<CivicEducationDraftArchive>;
  if (archive.schemaVersion !== CIVIC_EDUCATION_DRAFT_ARCHIVE_SCHEMA_VERSION) {
    errors.push({
      code: 'CIVIC_DRAFT_ARCHIVE_SCHEMA_UNSUPPORTED',
      message: 'Versione schema archivio Educazione civica non supportata.',
    });
  }
  if (!Array.isArray(archive.frameworks)) {
    errors.push({
      code: 'CIVIC_DRAFT_ARCHIVE_FRAMEWORKS_REQUIRED',
      message: 'L’archivio deve contenere un elenco di quadri.',
    });
    return { valid: false, errors, warnings };
  }
  if (!archive.updatedAt || !Number.isFinite(Date.parse(archive.updatedAt))) {
    errors.push({
      code: 'CIVIC_DRAFT_ARCHIVE_INVALID_UPDATED_AT',
      message: 'L’archivio deve avere una data di aggiornamento valida.',
    });
  }

  const ids = new Set<string>();
  for (const framework of archive.frameworks) {
    if (ids.has(framework.id)) {
      errors.push({
        code: 'CIVIC_DRAFT_ARCHIVE_DUPLICATE_ID',
        message: `Quadro duplicato nell’archivio: ${framework.id}.`,
        frameworkId: framework.id,
      });
    }
    ids.add(framework.id);

    if (!isLocalCivicEducationDraftStatus(framework.status)) {
      errors.push({
        code: 'CIVIC_LOCAL_AUTHORITY_FORBIDDEN',
        message: 'Lo stato locale non può rappresentare un quadro approved o superseded.',
        frameworkId: framework.id,
      });
    }

    if (framework.approvedAt || framework.approvedByRole) {
      errors.push({
        code: 'CIVIC_LOCAL_APPROVAL_EVIDENCE_FORBIDDEN',
        message: 'Il dispositivo locale non può conservare evidenza che trasformi una bozza in approvazione istituzionale.',
        frameworkId: framework.id,
      });
    }

    for (const issue of validateCivicEducationAnnualFramework(framework)) {
      const target = issue.severity === 'error' ? errors : warnings;
      target.push({
        code: issue.code,
        message: issue.message,
        frameworkId: framework.id,
      });
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}

export function listCivicEducationDrafts(
  archive: CivicEducationDraftArchive,
  filter?: Partial<Pick<CivicEducationAnnualFramework, 'institutionId' | 'schoolOrder'>>,
): CivicEducationAnnualFramework[] {
  return archive.frameworks
    .filter(framework =>
      (!filter?.institutionId || framework.institutionId === filter.institutionId)
      && (!filter?.schoolOrder || framework.schoolOrder === filter.schoolOrder)
    )
    .map(cloneFramework)
    .sort((left, right) => left.id.localeCompare(right.id));
}

export function getCivicEducationDraft(
  archive: CivicEducationDraftArchive,
  id: string,
): CivicEducationAnnualFramework | undefined {
  const framework = archive.frameworks.find(candidate => candidate.id === id);
  return framework ? cloneFramework(framework) : undefined;
}

export function saveCivicEducationDraft(
  archive: CivicEducationDraftArchive,
  framework: CivicEducationAnnualFramework,
  context: CivicEducationCurriculumBindingContext,
  now = new Date().toISOString(),
): CivicEducationDraftArchiveOperationResult {
  const structural = validateCivicEducationAnnualFramework(framework);
  const bindings = validateCivicEducationCurriculumBindings(framework, context);
  const errors = [...structural, ...bindings]
    .filter(issue => issue.severity === 'error')
    .map(issue => ({ code: issue.code, message: issue.message, frameworkId: framework.id }));

  if (!isLocalCivicEducationDraftStatus(framework.status)) {
    errors.push({
      code: 'CIVIC_LOCAL_AUTHORITY_FORBIDDEN',
      message: 'Un quadro approved o superseded non può essere salvato come autorità locale.',
      frameworkId: framework.id,
    });
  }

  if (framework.approvedAt || framework.approvedByRole) {
    errors.push({
      code: 'CIVIC_LOCAL_APPROVAL_EVIDENCE_FORBIDDEN',
      message: 'Una bozza locale non può contenere evidenza di approvazione istituzionale.',
      frameworkId: framework.id,
    });
  }

  const existing = archive.frameworks.find(candidate => candidate.id === framework.id);
  if (
    existing
    && existing.status !== framework.status
    && !canTransitionVersionStatus(existing.status, framework.status)
  ) {
    errors.push({
      code: 'CIVIC_LOCAL_INVALID_STATUS_TRANSITION',
      message: `Transizione locale non consentita: ${existing.status} → ${framework.status}.`,
      frameworkId: framework.id,
    });
  }

  if (errors.length > 0) return { success: false, errors };

  const next = cloneCivicEducationDraftArchive(archive);
  const copy = cloneFramework(framework);
  const index = next.frameworks.findIndex(candidate => candidate.id === copy.id);
  if (index >= 0) next.frameworks[index] = copy;
  else next.frameworks.push(copy);
  next.updatedAt = now;

  return { success: true, archive: next, framework: cloneFramework(copy) };
}

export function removeCivicEducationDraft(
  archive: CivicEducationDraftArchive,
  id: string,
  now = new Date().toISOString(),
): CivicEducationDraftArchiveOperationResult {
  const existing = archive.frameworks.find(candidate => candidate.id === id);
  if (!existing) {
    return {
      success: false,
      errors: [{ code: 'CIVIC_DRAFT_NOT_FOUND', message: `Quadro locale non trovato: ${id}.`, frameworkId: id }],
    };
  }

  const next = cloneCivicEducationDraftArchive(archive);
  next.frameworks = next.frameworks.filter(candidate => candidate.id !== id);
  next.updatedAt = now;
  return { success: true, archive: next };
}

export function prepareCivicEducationInstitutionalApprovalCommand(
  framework: CivicEducationAnnualFramework,
  context: CivicEducationCurriculumBindingContext,
  sharedFrameworkSet: CivicEducationAnnualFramework[],
  input: PrepareCivicEducationApprovalCommandInput,
): { success: true; command: CivicEducationInstitutionalApprovalCommand; gate: CivicEducationApprovalGateResult }
  | { success: false; errors: CivicEducationDraftArchiveIssue[]; gate?: CivicEducationApprovalGateResult } {
  const errors: CivicEducationDraftArchiveIssue[] = [];

  if (framework.status !== 'proposed-to-collegio') {
    errors.push({
      code: 'CIVIC_APPROVAL_CANDIDATE_NOT_PROPOSED',
      message: 'Solo un quadro proposed-to-collegio può essere preparato per l’approvazione istituzionale.',
      frameworkId: framework.id,
    });
  }

  if (!input.workspaceId.trim()) {
    errors.push({
      code: 'CIVIC_APPROVAL_WORKSPACE_REQUIRED',
      message: 'Il workspace istituzionale è obbligatorio.',
      frameworkId: framework.id,
    });
  }
  if (!input.clientRequestId.trim()) {
    errors.push({
      code: 'CIVIC_APPROVAL_REQUEST_ID_REQUIRED',
      message: 'L’identificativo idempotente della richiesta è obbligatorio.',
      frameworkId: framework.id,
    });
  }

  const gate = evaluateCivicEducationApprovalGate(framework, context, sharedFrameworkSet);
  if (!gate.approvable) {
    errors.push(...gate.issues
      .filter(issue => issue.severity === 'error')
      .map(issue => ({ code: issue.code, message: issue.message, frameworkId: framework.id })));
  }

  if (errors.length > 0) return { success: false, errors, gate };

  return {
    success: true,
    command: {
      workspaceId: input.workspaceId,
      clientRequestId: input.clientRequestId,
      expectedCurrentApprovedFrameworkId: input.expectedCurrentApprovedFrameworkId,
      candidate: cloneFramework(framework),
    },
    gate,
  };
}

export function assertCivicEducationSharedApprovalActor(
  context: WorkspaceActorContext,
  workspaceId: string,
): void {
  if (context.assurance !== 'authenticated-workspace') {
    throw new Error('CIVIC_APPROVAL_AUTHENTICATED_WORKSPACE_REQUIRED');
  }
  if (context.membership.status !== 'active') {
    throw new Error('CIVIC_APPROVAL_ACTIVE_MEMBERSHIP_REQUIRED');
  }
  if (context.membership.workspaceId !== workspaceId) {
    throw new Error('CIVIC_APPROVAL_WORKSPACE_MISMATCH');
  }
  if (context.membership.role !== 'collegio') {
    throw new Error('CIVIC_APPROVAL_COLLEGIO_REQUIRED');
  }
}
