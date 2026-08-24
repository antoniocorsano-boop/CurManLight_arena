import type { SupabaseClient } from '@supabase/supabase-js';
import type { InstitutionalRole } from '../../domain/curriculum/types';
import {
  resolveCapabilityAccess,
  type ArenaCapability,
} from '../../domain/institution/capabilities';
import type {
  SharedWorkspaceRepository,
  WorkspaceActorContext,
  WorkspaceMemberRole,
  WorkspaceMembership,
  WorkspaceMembershipStatus,
} from '../../domain/institution/sharedWorkspacePort';

const VALID_ROLES: readonly WorkspaceMemberRole[] = [
  'docente',
  'dipartimento',
  'referente',
  'collegio',
  'dirigente',
  'amministratore',
];

const VALID_STATUSES: readonly WorkspaceMembershipStatus[] = [
  'active',
  'suspended',
  'revoked',
];

interface MembershipRow {
  workspace_id: string;
  user_id: string;
  role: string;
  status: string;
}

const isWorkspaceMemberRole = (role: string): role is WorkspaceMemberRole =>
  VALID_ROLES.includes(role as WorkspaceMemberRole);

const isMembershipStatus = (status: string): status is WorkspaceMembershipStatus =>
  VALID_STATUSES.includes(status as WorkspaceMembershipStatus);

const toMembership = (row: MembershipRow): WorkspaceMembership | null => {
  if (!isWorkspaceMemberRole(row.role) || !isMembershipStatus(row.status)) {
    return null;
  }

  return {
    workspaceId: row.workspace_id,
    userId: row.user_id,
    role: row.role,
    status: row.status,
  };
};

export class SupabaseSharedWorkspaceRepository implements SharedWorkspaceRepository {
  constructor(private readonly client: SupabaseClient) {}

  async getMembership(
    workspaceId: string,
    userId: string
  ): Promise<WorkspaceMembership | null> {
    const { data, error } = await this.client
      .from('workspace_memberships')
      .select('workspace_id,user_id,role,status')
      .eq('workspace_id', workspaceId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      throw new Error(`Impossibile verificare la membership del workspace: ${error.message}`);
    }

    if (!data) {
      return null;
    }

    return toMembership(data as MembershipRow);
  }

  async can(
    context: WorkspaceActorContext,
    capability: ArenaCapability
  ): Promise<boolean> {
    const currentMembership = await this.getMembership(
      context.membership.workspaceId,
      context.membership.userId
    );

    if (!currentMembership || currentMembership.status !== 'active') {
      return false;
    }

    const decision = resolveCapabilityAccess(
      currentMembership.role as InstitutionalRole,
      capability,
      'authenticated-workspace'
    );

    return decision.allowed;
  }
}
