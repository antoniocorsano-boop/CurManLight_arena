import { useMemo } from 'react';
import type { WorkspaceIdentity } from '../../../domain/institution';
import { resolveOperationalRole, can, getCapabilities } from '../../../domain/permissions';
import type { WorkspaceCapability, WorkspaceRole, ResolvedWorkspaceRole } from '../../../domain/permissions';
import { useCurriculumStore } from '../../../store/useCurriculumStore';

export interface WorkspaceCapabilitiesReadModel {
  resolution: ResolvedWorkspaceRole;
  can: (capability: WorkspaceCapability) => boolean;
  capabilities: readonly WorkspaceCapability[];
}

export function deriveWorkspaceCapabilities(identity: WorkspaceIdentity | undefined): WorkspaceCapabilitiesReadModel {
  const resolution = resolveOperationalRole(identity?.declaredRole);
  const role = resolution.status === 'resolved' ? resolution.role : undefined;
  return {
    resolution,
    can: (capability) => role !== undefined && can(role, capability),
    capabilities: role ? getCapabilities(role) : [],
  };
}

export function useWorkspaceCapabilities(): WorkspaceCapabilitiesReadModel {
  const workspaceIdentity = useCurriculumStore(state => state.workspaceIdentity);
  return useMemo(() => deriveWorkspaceCapabilities(workspaceIdentity), [workspaceIdentity]);
}

export type { WorkspaceCapability, WorkspaceRole, ResolvedWorkspaceRole };
