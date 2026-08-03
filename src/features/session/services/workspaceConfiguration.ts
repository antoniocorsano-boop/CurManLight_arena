import { validateWorkspaceIdentity, type WorkspaceIdentity, type WorkspaceIdentityValidationError } from '../../../domain/institution';
import { requireCapability, type ProtectedActionResult, type ResolvedWorkspaceRole } from '../../../domain/permissions';

export type WorkspaceConfigurationPersistence = {
  setWorkspaceIdentity: (identity: WorkspaceIdentity) => void;
  resetWorkspaceIdentity: () => void;
};

export type WorkspaceConfigurationContext = {
  currentIdentity: WorkspaceIdentity | undefined;
};

export type WorkspaceConfigurationSuccess = {
  identity: WorkspaceIdentity;
  mode: 'BOOTSTRAP_LOCAL' | 'CONFIGURED';
};

export type WorkspaceConfigurationError = {
  ok: false;
  reason: 'WORKSPACE_IDENTITY_INVALID';
  errors: WorkspaceIdentityValidationError[];
};

export function configureWorkspace(
  resolution: ResolvedWorkspaceRole,
  identity: WorkspaceIdentity,
  context: WorkspaceConfigurationContext,
  persistence: WorkspaceConfigurationPersistence,
): ProtectedActionResult<WorkspaceConfigurationSuccess, WorkspaceConfigurationError> {
  const validation = validateWorkspaceIdentity(identity);
  if (!validation.valid) return { ok: false, reason: 'WORKSPACE_IDENTITY_INVALID', errors: validation.errors };

  if (context.currentIdentity) {
    const guard = requireCapability(resolution, 'workspace.configure');
    if (!guard.ok) return guard;
  }

  persistence.setWorkspaceIdentity(identity);
  return { ok: true, value: { identity, mode: context.currentIdentity ? 'CONFIGURED' : 'BOOTSTRAP_LOCAL' } };
}

export function resetWorkspaceConfiguration(
  resolution: ResolvedWorkspaceRole,
  context: WorkspaceConfigurationContext,
  persistence: WorkspaceConfigurationPersistence,
): ProtectedActionResult<void, WorkspaceConfigurationError> {
  if (!context.currentIdentity) return { ok: true, value: undefined };
  const guard = requireCapability(resolution, 'workspace.configure');
  if (!guard.ok) return guard;
  persistence.resetWorkspaceIdentity();
  return { ok: true, value: undefined };
}
