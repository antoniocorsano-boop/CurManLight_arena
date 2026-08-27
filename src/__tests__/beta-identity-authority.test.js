import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { resolveCapabilityAccess } from '../domain/institution/capabilities';
import { isActiveWorkspaceActor } from '../domain/institution/sharedWorkspacePort';
import { SupabaseSharedWorkspaceRepository } from '../infrastructure/supabase/sharedWorkspaceRepository';

const makeClient = (row) => {
  const maybeSingle = async () => ({ data: row, error: null });
  const secondEq = () => ({ maybeSingle });
  const firstEq = () => ({ eq: secondEq });
  const select = () => ({ eq: firstEq });
  return { from: () => ({ select }) };
};

const actor = (role, status = 'active') => ({
  assurance: 'authenticated-workspace',
  membership: {
    workspaceId: 'workspace-1',
    userId: 'user-1',
    role,
    status,
  },
});

describe('BETA-G3 identity and authority', () => {
  it('does not promote self-declared roles into institutional authority', () => {
    expect(resolveCapabilityAccess('collegio', 'REVISION_DECIDE', 'self-declared').allowed).toBe(false);
    expect(resolveCapabilityAccess('amministratore', 'WORKSPACE_ADMIN', 'self-declared').allowed).toBe(false);
  });

  it('allows authenticated high-authority capabilities only when the role owns them', () => {
    expect(resolveCapabilityAccess('collegio', 'REVISION_DECIDE', 'authenticated-workspace').allowed).toBe(true);
    expect(resolveCapabilityAccess('docente', 'REVISION_DECIDE', 'authenticated-workspace').allowed).toBe(false);
  });

  it('treats only active memberships as active workspace actors', () => {
    expect(isActiveWorkspaceActor(actor('docente', 'active'))).toBe(true);
    expect(isActiveWorkspaceActor(actor('docente', 'suspended'))).toBe(false);
    expect(isActiveWorkspaceActor(actor('docente', 'revoked'))).toBe(false);
  });

  it('re-checks server-backed membership instead of trusting the role carried by the caller', async () => {
    const repository = new SupabaseSharedWorkspaceRepository(makeClient({
      workspace_id: 'workspace-1',
      user_id: 'user-1',
      role: 'docente',
      status: 'active',
    }));

    await expect(repository.can(actor('collegio'), 'REVISION_DECIDE')).resolves.toBe(false);
  });

  it('denies capabilities after membership suspension or revocation', async () => {
    for (const status of ['suspended', 'revoked']) {
      const repository = new SupabaseSharedWorkspaceRepository(makeClient({
        workspace_id: 'workspace-1',
        user_id: 'user-1',
        role: 'collegio',
        status,
      }));
      await expect(repository.can(actor('collegio'), 'REVISION_DECIDE')).resolves.toBe(false);
    }
  });

  it('fails closed when no authenticated membership exists', async () => {
    const repository = new SupabaseSharedWorkspaceRepository(makeClient(null));
    await expect(repository.can(actor('collegio'), 'REVISION_DECIDE')).resolves.toBe(false);
  });

  it('keeps RLS scoped to own membership and active workspace access with no client-side mutation policies', () => {
    const sql = readFileSync('supabase/migrations/20260824070000_h2b_workspace_foundation.sql', 'utf8').toLowerCase();

    expect(sql).toContain('alter table public.workspaces enable row level security');
    expect(sql).toContain('alter table public.workspace_memberships enable row level security');
    expect(sql).toContain('auth.uid() = user_id');
    expect(sql).toContain("membership.status = 'active'");
    expect(sql).not.toMatch(/for\s+insert/);
    expect(sql).not.toMatch(/for\s+update/);
    expect(sql).not.toMatch(/for\s+delete/);
  });
});
