import type { DeclaredRole } from '../institution/workspaceIdentity';
import { can } from './matrix';
import type {
  CapabilityCheck,
  ResolvedWorkspaceRole,
  WorkspaceCapability,
  WorkspaceRole,
} from './types';

const DECLARED_ROLE_MAP: Readonly<Record<DeclaredRole, WorkspaceRole | undefined>> = Object.freeze({
  docente: 'teacher',
  dipartimento: 'department_member',
  referente: 'curriculum_referent',
  collegio: undefined,
  dirigente: 'school_leader',
  amministratore: 'workspace_admin',
});

export function resolveOperationalRole(declaredRole: string | undefined): ResolvedWorkspaceRole {
  if (!declaredRole || declaredRole === 'non-dichiarato') return { status: 'neutral', trust: 'unknown' };
  if (!Object.prototype.hasOwnProperty.call(DECLARED_ROLE_MAP, declaredRole)) {
    return { status: 'unknown', declaredRole, trust: 'unknown' };
  }
  const role = DECLARED_ROLE_MAP[declaredRole as DeclaredRole];
  return role ? { status: 'resolved', role, trust: 'self-declared' } : { status: 'unknown', declaredRole, trust: 'unknown' };
}

export function requireCapability(
  resolution: ResolvedWorkspaceRole,
  capability: WorkspaceCapability,
): CapabilityCheck {
  if (resolution.status === 'resolved' && can(resolution.role, capability)) return { ok: true };
  return { ok: false, reason: 'CAPABILITY_NOT_GRANTED', requiredCapability: capability, resolution };
}
