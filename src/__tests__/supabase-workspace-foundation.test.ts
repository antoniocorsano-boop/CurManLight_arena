import { describe, expect, it, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { resolveSupabasePublicConfig } from '../infrastructure/supabase/config';
import { SupabaseSharedWorkspaceRepository } from '../infrastructure/supabase/sharedWorkspaceRepository';
import type { WorkspaceActorContext } from '../domain/institution/sharedWorkspacePort';

const fakeClient = (result: { data: unknown; error: { message: string } | null }): SupabaseClient => {
  const maybeSingle = vi.fn().mockResolvedValue(result);
  const secondEq = vi.fn().mockReturnValue({ maybeSingle });
  const firstEq = vi.fn().mockReturnValue({ eq: secondEq });
  const select = vi.fn().mockReturnValue({ eq: firstEq });
  const from = vi.fn().mockReturnValue({ select });

  return { from } as unknown as SupabaseClient;
};

const context = (role: WorkspaceActorContext['membership']['role']): WorkspaceActorContext => ({
  assurance: 'authenticated-workspace',
  membership: {
    workspaceId: '11111111-1111-1111-1111-111111111111',
    userId: '22222222-2222-2222-2222-222222222222',
    role,
    status: 'active',
  },
});

describe('Supabase public configuration', () => {
  it('resta disattivata quando entrambe le variabili sono assenti', () => {
    expect(resolveSupabasePublicConfig({})).toEqual({ status: 'disabled' });
  });

  it('fallisce chiusa quando la configurazione è parziale', () => {
    const resolution = resolveSupabasePublicConfig({
      VITE_SUPABASE_URL: 'https://example.supabase.co',
    });

    expect(resolution.status).toBe('invalid');
  });

  it('rifiuta un endpoint non HTTPS', () => {
    const resolution = resolveSupabasePublicConfig({
      VITE_SUPABASE_URL: 'http://example.supabase.co',
      VITE_SUPABASE_PUBLISHABLE_KEY: 'public-key',
    });

    expect(resolution.status).toBe('invalid');
  });

  it('accetta soltanto una configurazione pubblica completa', () => {
    const resolution = resolveSupabasePublicConfig({
      VITE_SUPABASE_URL: 'https://example.supabase.co',
      VITE_SUPABASE_PUBLISHABLE_KEY: 'public-key',
    });

    expect(resolution).toEqual({
      status: 'configured',
      config: {
        url: 'https://example.supabase.co',
        publishableKey: 'public-key',
      },
    });
  });
});

describe('Supabase shared workspace repository', () => {
  it('legge una membership valida dal backend', async () => {
    const repository = new SupabaseSharedWorkspaceRepository(
      fakeClient({
        data: {
          workspace_id: '11111111-1111-1111-1111-111111111111',
          user_id: '22222222-2222-2222-2222-222222222222',
          role: 'referente',
          status: 'active',
        },
        error: null,
      })
    );

    await expect(
      repository.getMembership(
        '11111111-1111-1111-1111-111111111111',
        '22222222-2222-2222-2222-222222222222'
      )
    ).resolves.toEqual({
      workspaceId: '11111111-1111-1111-1111-111111111111',
      userId: '22222222-2222-2222-2222-222222222222',
      role: 'referente',
      status: 'active',
    });
  });

  it('non si fida del ruolo presente nel contesto se il backend restituisce un ruolo diverso', async () => {
    const repository = new SupabaseSharedWorkspaceRepository(
      fakeClient({
        data: {
          workspace_id: '11111111-1111-1111-1111-111111111111',
          user_id: '22222222-2222-2222-2222-222222222222',
          role: 'docente',
          status: 'active',
        },
        error: null,
      })
    );

    await expect(repository.can(context('collegio'), 'REVISION_DECIDE')).resolves.toBe(false);
  });

  it('consente una capability solo se la membership backend attiva la sostiene', async () => {
    const repository = new SupabaseSharedWorkspaceRepository(
      fakeClient({
        data: {
          workspace_id: '11111111-1111-1111-1111-111111111111',
          user_id: '22222222-2222-2222-2222-222222222222',
          role: 'collegio',
          status: 'active',
        },
        error: null,
      })
    );

    await expect(repository.can(context('collegio'), 'REVISION_DECIDE')).resolves.toBe(true);
  });

  it('blocca membership sospese o revocate', async () => {
    const repository = new SupabaseSharedWorkspaceRepository(
      fakeClient({
        data: {
          workspace_id: '11111111-1111-1111-1111-111111111111',
          user_id: '22222222-2222-2222-2222-222222222222',
          role: 'collegio',
          status: 'revoked',
        },
        error: null,
      })
    );

    await expect(repository.can(context('collegio'), 'REVISION_DECIDE')).resolves.toBe(false);
  });

  it('rifiuta righe backend con ruolo non canonico', async () => {
    const repository = new SupabaseSharedWorkspaceRepository(
      fakeClient({
        data: {
          workspace_id: '11111111-1111-1111-1111-111111111111',
          user_id: '22222222-2222-2222-2222-222222222222',
          role: 'superuser',
          status: 'active',
        },
        error: null,
      })
    );

    await expect(
      repository.getMembership(
        '11111111-1111-1111-1111-111111111111',
        '22222222-2222-2222-2222-222222222222'
      )
    ).resolves.toBeNull();
  });

  it('propaga un errore di lettura invece di concedere accesso per fallback', async () => {
    const repository = new SupabaseSharedWorkspaceRepository(
      fakeClient({
        data: null,
        error: { message: 'RLS denied' },
      })
    );

    await expect(
      repository.getMembership(
        '11111111-1111-1111-1111-111111111111',
        '22222222-2222-2222-2222-222222222222'
      )
    ).rejects.toThrow('Impossibile verificare la membership');
  });
});
