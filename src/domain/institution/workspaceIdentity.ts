import {
  createMetadata,
  isValidActorReference,
  isValidEntityId,
  isValidMetadata,
  touchMetadata,
  type EntityMetadata,
  type EntityId,
} from '../curriculum/identity';
import type { InstitutionalRole } from '../curriculum/types';
import { DECLARED_INSTITUTIONAL_ROLES } from './vocabularies';
import {
  isValidInstituteReference,
  isValidInstitutionalReference,
} from './validators';
import type {
  AcademicYearReference,
  DeclaredActorReference,
  InstituteReference,
  InstituteSiteReference,
} from './types';

export const WORKSPACE_OPERATING_MODES = [
  'public-consultation',
  'personal-local',
  'institutional-local',
] as const;

export type WorkspaceOperatingMode = (typeof WORKSPACE_OPERATING_MODES)[number];
export type DeclaredRole = Exclude<InstitutionalRole, 'non-dichiarato'>;

export interface WorkspaceIdentity {
  readonly id: EntityId;
  readonly institutionRef: InstituteReference;
  readonly activeSiteRef?: InstituteSiteReference;
  readonly academicYearRef: AcademicYearReference;
  readonly declaredActor?: DeclaredActorReference;
  readonly declaredRole?: DeclaredRole;
  readonly operatingMode: WorkspaceOperatingMode;
  readonly metadata: EntityMetadata;
}

export interface CreateWorkspaceIdentityInput {
  institutionRef: InstituteReference;
  activeSiteRef?: InstituteSiteReference;
  academicYearRef: AcademicYearReference;
  declaredActor?: DeclaredActorReference;
  declaredRole?: DeclaredRole;
  operatingMode: WorkspaceOperatingMode;
}

export type WorkspaceIdentityErrorCode =
  | 'WORKSPACE_IDENTITY_INVALID'
  | 'WORKSPACE_ID_INVALID'
  | 'WORKSPACE_INSTITUTION_REQUIRED'
  | 'WORKSPACE_INSTITUTION_REFERENCE_INVALID'
  | 'WORKSPACE_SITE_REFERENCE_INVALID'
  | 'WORKSPACE_ACADEMIC_YEAR_INVALID'
  | 'WORKSPACE_ACTOR_REFERENCE_INVALID'
  | 'WORKSPACE_DECLARED_ROLE_INVALID'
  | 'WORKSPACE_OPERATING_MODE_INVALID'
  | 'WORKSPACE_METADATA_INVALID';

export interface WorkspaceIdentityValidationError {
  code: WorkspaceIdentityErrorCode;
  message: string;
  path?: string;
}

export interface WorkspaceIdentityValidationResult {
  valid: boolean;
  errors: WorkspaceIdentityValidationError[];
}

export interface WorkspaceIdentityDeserializationResult {
  success: boolean;
  data?: WorkspaceIdentity;
  errors: WorkspaceIdentityValidationError[];
}

const AUTHORIZATION_FIELDS = ['permissions', 'capabilities', 'grants', 'policy', 'accessLevel'] as const;

function error(code: WorkspaceIdentityErrorCode, message: string, path?: string): WorkspaceIdentityValidationError {
  return { code, message, path };
}

function isWorkspaceOperatingMode(value: unknown): value is WorkspaceOperatingMode {
  return typeof value === 'string' && WORKSPACE_OPERATING_MODES.includes(value as WorkspaceOperatingMode);
}

function isDeclaredRole(value: unknown): value is DeclaredRole {
  return typeof value === 'string' && DECLARED_INSTITUTIONAL_ROLES.includes(value as InstitutionalRole);
}

export function validateWorkspaceIdentity(value: unknown): WorkspaceIdentityValidationResult {
  const errors: WorkspaceIdentityValidationError[] = [];
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return { valid: false, errors: [error('WORKSPACE_IDENTITY_INVALID', 'Identità workspace non valida.')] };
  }

  const candidate = value as Record<string, unknown>;
  for (const field of AUTHORIZATION_FIELDS) {
    if (field in candidate) errors.push(error('WORKSPACE_DECLARED_ROLE_INVALID', 'Il ruolo dichiarato non contiene autorizzazioni.', field));
  }
  if (!isValidEntityId(candidate.id)) errors.push(error('WORKSPACE_ID_INVALID', 'Identificativo workspace non valido.', 'id'));
  if (!candidate.institutionRef) errors.push(error('WORKSPACE_INSTITUTION_REQUIRED', 'L’istituto del workspace è obbligatorio.', 'institutionRef'));
  else if (!isValidInstituteReference(candidate.institutionRef)) errors.push(error('WORKSPACE_INSTITUTION_REFERENCE_INVALID', 'Riferimento istituto non valido.', 'institutionRef'));
  if (!isValidInstitutionalReference(candidate.academicYearRef, 'academic-year')) errors.push(error('WORKSPACE_ACADEMIC_YEAR_INVALID', 'Riferimento anno scolastico non valido.', 'academicYearRef'));
  if (candidate.activeSiteRef !== undefined && !isValidInstitutionalReference(candidate.activeSiteRef, 'institute-site')) errors.push(error('WORKSPACE_SITE_REFERENCE_INVALID', 'Riferimento sede non valido.', 'activeSiteRef'));
  if (candidate.declaredActor !== undefined && (!isValidActorReference(candidate.declaredActor) || candidate.declaredActor.assertion !== 'self-declared')) errors.push(error('WORKSPACE_ACTOR_REFERENCE_INVALID', 'Attore dichiarato non valido.', 'declaredActor'));
  if (candidate.declaredRole !== undefined && !isDeclaredRole(candidate.declaredRole)) errors.push(error('WORKSPACE_DECLARED_ROLE_INVALID', 'Ruolo dichiarato non valido.', 'declaredRole'));
  if (!isWorkspaceOperatingMode(candidate.operatingMode)) errors.push(error('WORKSPACE_OPERATING_MODE_INVALID', 'Modalità operativa non valida.', 'operatingMode'));
  if (!isValidMetadata(candidate.metadata)) errors.push(error('WORKSPACE_METADATA_INVALID', 'Metadati workspace non validi.', 'metadata'));

  return { valid: errors.length === 0, errors };
}

export function createWorkspaceIdentity(input: CreateWorkspaceIdentityInput, now = new Date().toISOString()): WorkspaceIdentity {
  const metadata = createMetadata('teacher', input.declaredActor, now);
  const identity: WorkspaceIdentity = {
    id: metadata.id,
    institutionRef: { ...input.institutionRef },
    ...(input.activeSiteRef ? { activeSiteRef: { ...input.activeSiteRef } } : {}),
    academicYearRef: { ...input.academicYearRef },
    ...(input.declaredActor ? { declaredActor: { ...input.declaredActor } } : {}),
    ...(input.declaredRole ? { declaredRole: input.declaredRole } : {}),
    operatingMode: input.operatingMode,
    metadata,
  };
  const validation = validateWorkspaceIdentity(identity);
  if (!validation.valid) throw new Error(validation.errors.map(item => item.message).join(' '));
  return identity;
}

function updateIdentity(identity: WorkspaceIdentity, changes: Partial<Omit<WorkspaceIdentity, 'id' | 'metadata'>>, now: string): WorkspaceIdentity {
  const next: WorkspaceIdentity = {
    ...identity,
    ...changes,
    metadata: touchMetadata(identity.metadata, changes.declaredActor ?? identity.declaredActor, now),
  };
  const validation = validateWorkspaceIdentity(next);
  if (!validation.valid) throw new Error(validation.errors.map(item => item.message).join(' '));
  return next;
}

export function updateWorkspaceAcademicYear(identity: WorkspaceIdentity, academicYearRef: AcademicYearReference, now = new Date().toISOString()): WorkspaceIdentity {
  return updateIdentity(identity, { academicYearRef: { ...academicYearRef } }, now);
}

export function updateWorkspaceSite(identity: WorkspaceIdentity, activeSiteRef: InstituteSiteReference | undefined, now = new Date().toISOString()): WorkspaceIdentity {
  return updateIdentity(identity, activeSiteRef ? { activeSiteRef: { ...activeSiteRef } } : { activeSiteRef: undefined }, now);
}

export function updateDeclaredActor(identity: WorkspaceIdentity, declaredActor: DeclaredActorReference | undefined, now = new Date().toISOString()): WorkspaceIdentity {
  return updateIdentity(identity, declaredActor ? { declaredActor: { ...declaredActor } } : { declaredActor: undefined }, now);
}

export function removeDeclaredActor(identity: WorkspaceIdentity, now = new Date().toISOString()): WorkspaceIdentity {
  return updateDeclaredActor(identity, undefined, now);
}

export function updateDeclaredRole(identity: WorkspaceIdentity, declaredRole: DeclaredRole | undefined, now = new Date().toISOString()): WorkspaceIdentity {
  return updateIdentity(identity, declaredRole ? { declaredRole } : { declaredRole: undefined }, now);
}

export function updateWorkspaceOperatingMode(identity: WorkspaceIdentity, operatingMode: WorkspaceOperatingMode, now = new Date().toISOString()): WorkspaceIdentity {
  return updateIdentity(identity, { operatingMode }, now);
}

export function serializeWorkspaceIdentity(identity: WorkspaceIdentity): string {
  const validation = validateWorkspaceIdentity(identity);
  if (!validation.valid) throw new Error(validation.errors.map(item => item.message).join(' '));
  return JSON.stringify(identity);
}

export function deserializeWorkspaceIdentity(json: string): WorkspaceIdentityDeserializationResult {
  try {
    const value: unknown = JSON.parse(json);
    const validation = validateWorkspaceIdentity(value);
    return validation.valid ? { success: true, data: value as WorkspaceIdentity, errors: [] } : { success: false, errors: validation.errors };
  } catch {
    return { success: false, errors: [error('WORKSPACE_IDENTITY_INVALID', 'Identità workspace non deserializzabile.')] };
  }
}
