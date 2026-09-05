import { useEffect, useMemo, useState } from 'react';
import type { Session, SupabaseClient } from '@supabase/supabase-js';
import type {
  WorkspaceMemberRole,
  WorkspaceMembership,
} from '../../domain/institution/sharedWorkspacePort';
import { getOptionalSupabaseBrowserClient } from '../../infrastructure/supabase/client';

interface MembershipRow {
  workspace_id: string;
  user_id: string;
  role: string;
  status: string;
}

interface WorkspaceRow {
  id: string;
  name: string;
  status: string;
}

export interface TeamWorkspaceMembershipView extends WorkspaceMembership {
  workspaceName: string;
}

const VALID_ROLES: readonly WorkspaceMemberRole[] = [
  'docente',
  'dipartimento',
  'referente',
  'collegio',
  'dirigente',
  'amministratore',
];

const isWorkspaceMemberRole = (value: string): value is WorkspaceMemberRole =>
  VALID_ROLES.includes(value as WorkspaceMemberRole);

const toMembership = (row: MembershipRow, workspaceName: string): TeamWorkspaceMembershipView | null => {
  if (!isWorkspaceMemberRole(row.role) || !['active', 'suspended', 'revoked'].includes(row.status)) return null;
  return {
    workspaceId: row.workspace_id,
    workspaceName,
    userId: row.user_id,
    role: row.role,
    status: row.status as WorkspaceMembership['status'],
  };
};

export interface TeamWorkspaceContextState {
  client: SupabaseClient | null;
  session: Session | null;
  activeMemberships: TeamWorkspaceMembershipView[];
  selectedMembership: TeamWorkspaceMembershipView | null;
  workspaceId: string;
  setWorkspaceId: (workspaceId: string) => void;
  configured: boolean;
  loading: boolean;
  message: string | null;
}

export function useTeamWorkspaceContext(): TeamWorkspaceContextState {
  const optional = useMemo(() => getOptionalSupabaseBrowserClient(), []);
  const client = optional.client;
  const [session, setSession] = useState<Session | null>(null);
  const [memberships, setMemberships] = useState<TeamWorkspaceMembershipView[]>([]);
  const [workspaceId, setWorkspaceId] = useState('');
  const [loading, setLoading] = useState(Boolean(client));
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!client) {
      setLoading(false);
      return;
    }

    let active = true;

    const refresh = async (nextSession: Session | null) => {
      if (!active) return;
      setSession(nextSession);
      setMessage(null);

      if (!nextSession) {
        setMemberships([]);
        setWorkspaceId('');
        setLoading(false);
        return;
      }

      setLoading(true);
      const { data: membershipData, error: membershipError } = await client
        .from('workspace_memberships')
        .select('workspace_id,user_id,role,status')
        .eq('user_id', nextSession.user.id);

      if (!active) return;
      if (membershipError) {
        setMemberships([]);
        setWorkspaceId('');
        setLoading(false);
        setMessage(`Non riesco a verificare i team associati a questo account: ${membershipError.message}`);
        return;
      }

      const membershipRows = (membershipData ?? []) as MembershipRow[];
      const workspaceIds = Array.from(new Set(membershipRows.map((row) => row.workspace_id)));
      let workspaceNames = new Map<string, string>();

      if (workspaceIds.length > 0) {
        const { data: workspaceData, error: workspaceError } = await client
          .from('workspaces')
          .select('id,name,status')
          .in('id', workspaceIds);

        if (!active) return;
        if (workspaceError) {
          setMessage(`Team verificati, ma i nomi dei workspace non sono leggibili: ${workspaceError.message}`);
        } else {
          workspaceNames = new Map(
            ((workspaceData ?? []) as WorkspaceRow[])
              .filter((workspace) => workspace.status === 'active')
              .map((workspace) => [workspace.id, workspace.name]),
          );
        }
      }

      const resolved = membershipRows
        .map((row) => toMembership(row, workspaceNames.get(row.workspace_id) ?? 'Team scolastico'))
        .filter((membership): membership is TeamWorkspaceMembershipView => Boolean(membership));

      setMemberships(resolved);
      const activeMemberships = resolved.filter((membership) => membership.status === 'active');
      const preferred = activeMemberships.find((membership) => membership.role === 'dipartimento')
        ?? activeMemberships.find((membership) => membership.role === 'referente')
        ?? activeMemberships.find((membership) => membership.role === 'docente')
        ?? activeMemberships[0];
      setWorkspaceId((current) => current && activeMemberships.some((membership) => membership.workspaceId === current)
        ? current
        : preferred?.workspaceId ?? '');
      setLoading(false);
    };

    void client.auth.getSession().then(({ data }) => refresh(data.session));
    const { data: subscription } = client.auth.onAuthStateChange((_event, nextSession) => {
      void refresh(nextSession);
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, [client]);

  const activeMemberships = memberships.filter((membership) => membership.status === 'active');
  const selectedMembership = activeMemberships.find((membership) => membership.workspaceId === workspaceId) ?? null;

  return {
    client,
    session,
    activeMemberships,
    selectedMembership,
    workspaceId,
    setWorkspaceId,
    configured: optional.config.status === 'configured' && Boolean(client),
    loading,
    message,
  };
}
