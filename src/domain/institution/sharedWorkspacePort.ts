import type { InstitutionalRole } from '../curriculum/types';
import type { ArenaCapability, RoleAssurance } from './capabilities';

export type WorkspaceMemberRole = Exclude<InstitutionalRole, 'non-dichiarato'>;
export type WorkspaceMembershipStatus = 'active' | 'suspended' | 'revoked';

export interface WorkspaceMembership {
  workspaceId: string;
  userId: string;
  role: WorkspaceMemberRole;
  status: WorkspaceMembershipStatus;
}

export interface WorkspaceActorContext {
  membership: WorkspaceMembership;
  assurance: Extract<RoleAssurance, 'authenticated-workspace'>;
}

export interface SharedWorkspaceRepository {
  /** Returns the authenticated membership or null. Never falls back to a self-declared role. */
  getMembership(workspaceId: string, userId: string): Promise<WorkspaceMembership | null>;

  /** Verifies access using server-backed membership data before a shared mutation. */
  can(
    context: WorkspaceActorContext,
    capability: ArenaCapability
  ): Promise<boolean>;
}

/**
 * Local mode and shared mode remain distinct.
 * A self-declared local role can shape presentation but can never be converted
 * into WorkspaceActorContext without authenticated membership evidence.
 */
export const isActiveWorkspaceActor = (
  context: WorkspaceActorContext | null | undefined
): context is WorkspaceActorContext =>
  Boolean(context && context.membership.status === 'active');
