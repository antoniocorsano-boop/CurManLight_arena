import type { ArenaCapability } from './capabilities';
import type {
  SharedWorkspaceRepository,
  WorkspaceActorContext,
  WorkspaceMembership,
} from './sharedWorkspacePort';
import type { AuthenticatedWorkspaceIdentity, WorkspaceSessionPort } from './workspaceSessionPort';

export type WorkspaceAccessResolution =
  | { status: 'unauthenticated' }
  | { status: 'membership-missing'; identity: AuthenticatedWorkspaceIdentity }
  | {
      status: 'membership-inactive';
      identity: AuthenticatedWorkspaceIdentity;
      membership: WorkspaceMembership;
    }
  | {
      status: 'ready';
      identity: AuthenticatedWorkspaceIdentity;
      context: WorkspaceActorContext;
    };

/**
 * Resolves identity and membership as two separate trust steps.
 * A logged-in user without active membership is not a workspace actor.
 */
export const resolveWorkspaceAccess = async (
  workspaceId: string,
  session: WorkspaceSessionPort,
  repository: SharedWorkspaceRepository
): Promise<WorkspaceAccessResolution> => {
  const identity = await session.getIdentity();

  if (!identity) {
    return { status: 'unauthenticated' };
  }

  const membership = await repository.getMembership(workspaceId, identity.userId);

  if (!membership) {
    return { status: 'membership-missing', identity };
  }

  if (membership.status !== 'active') {
    return { status: 'membership-inactive', identity, membership };
  }

  return {
    status: 'ready',
    identity,
    context: {
      assurance: 'authenticated-workspace',
      membership,
    },
  };
};

export interface WorkspaceCapabilityResolution {
  access: WorkspaceAccessResolution;
  allowed: boolean;
  capability: ArenaCapability;
}

export const resolveCurrentWorkspaceCapability = async (
  workspaceId: string,
  capability: ArenaCapability,
  session: WorkspaceSessionPort,
  repository: SharedWorkspaceRepository
): Promise<WorkspaceCapabilityResolution> => {
  const access = await resolveWorkspaceAccess(workspaceId, session, repository);

  if (access.status !== 'ready') {
    return { access, allowed: false, capability };
  }

  const allowed = await repository.can(access.context, capability);
  return { access, allowed, capability };
};
