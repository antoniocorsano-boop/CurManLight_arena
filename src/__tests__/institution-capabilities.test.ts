import { describe, expect, it } from 'vitest';
import {
  canUseCapability,
  getRoleCapabilities,
  resolveCapabilityAccess,
} from '../domain/institution/capabilities';
import { isActiveWorkspaceActor } from '../domain/institution/sharedWorkspacePort';

describe('institution capability boundary', () => {
  it('non attribuisce capacità a un ruolo non dichiarato', () => {
    expect(getRoleCapabilities('non-dichiarato')).toEqual([]);
    expect(canUseCapability('non-dichiarato', 'CURRICULUM_READ', 'self-declared')).toBe(false);
  });

  it('consente al docente locale attività personali senza attribuire autorità istituzionale', () => {
    expect(canUseCapability('docente', 'CURRICULUM_PROPOSE', 'self-declared')).toBe(true);
    expect(canUseCapability('docente', 'DOCUMENT_PREPARE', 'self-declared')).toBe(true);
  });

  it('impedisce una decisione collegiale quando il ruolo è soltanto autodichiarato', () => {
    const decision = resolveCapabilityAccess('collegio', 'REVISION_DECIDE', 'self-declared');

    expect(decision.allowed).toBe(false);
    expect(decision.reason).toContain('non attribuisce autorità istituzionale');
  });

  it('consente la decisione al collegio soltanto con membership autenticata', () => {
    expect(canUseCapability('collegio', 'REVISION_DECIDE', 'authenticated-workspace')).toBe(true);
  });

  it('non rende il dirigente un superutente didattico', () => {
    expect(canUseCapability('dirigente', 'REVISION_DECIDE', 'authenticated-workspace')).toBe(false);
    expect(canUseCapability('dirigente', 'WORKSPACE_ADMIN', 'authenticated-workspace')).toBe(false);
  });

  it('separa amministrazione del workspace e decisione curricolare', () => {
    expect(canUseCapability('amministratore', 'WORKSPACE_ADMIN', 'authenticated-workspace')).toBe(true);
    expect(canUseCapability('amministratore', 'REVISION_DECIDE', 'authenticated-workspace')).toBe(false);
  });

  it('considera attivo solo un contesto workspace autenticato con membership attiva', () => {
    expect(
      isActiveWorkspaceActor({
        assurance: 'authenticated-workspace',
        membership: {
          workspaceId: 'workspace-1',
          userId: 'user-1',
          role: 'referente',
          status: 'active',
        },
      })
    ).toBe(true);

    expect(
      isActiveWorkspaceActor({
        assurance: 'authenticated-workspace',
        membership: {
          workspaceId: 'workspace-1',
          userId: 'user-1',
          role: 'referente',
          status: 'revoked',
        },
      })
    ).toBe(false);
  });
});
