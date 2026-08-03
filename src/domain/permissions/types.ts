export type WorkspaceRole =
  | 'teacher'
  | 'department_member'
  | 'department_coordinator'
  | 'curriculum_referent'
  | 'school_leader'
  | 'workspace_admin';

export type WorkspaceCapability =
  | 'workspace.view'
  | 'workspace.configure'
  | 'curriculum.consult'
  | 'design.create'
  | 'document.create'
  | 'document.preview'
  | 'document.export'
  | 'proposal.create'
  | 'document.review'
  | 'department.consolidate'
  | 'curriculum.validate'
  | 'institution.validate';

export type RoleTrust = 'self-declared' | 'unknown';

export type ResolvedWorkspaceRole =
  | { status: 'resolved'; role: WorkspaceRole; trust: 'self-declared' }
  | { status: 'neutral'; trust: 'unknown' }
  | { status: 'unknown'; declaredRole: string; trust: 'unknown' };

export type CapabilityGranted<T> = { ok: true; value: T };

export type CapabilityDenial = {
  ok: false;
  reason: 'CAPABILITY_NOT_GRANTED';
  requiredCapability: WorkspaceCapability;
  resolution: ResolvedWorkspaceRole;
};

export type CapabilityCheck = { ok: true } | CapabilityDenial;

export type ProtectedActionResult<T, E> = CapabilityGranted<T> | CapabilityDenial | E;
