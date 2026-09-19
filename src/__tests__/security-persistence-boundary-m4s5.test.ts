import { describe, expect, it } from 'vitest';
import appSource from '../App.tsx?raw';
import workspaceStateSource from '../features/workspace/hooks/useWorkspaceState.ts?raw';
import startupSource from '../features/session/hooks/useAppStartupEffects.ts?raw';
import sessionAutoSaveSource from '../features/workspace/hooks/useSessionAutoSave.ts?raw';
import legacyWorkspaceStoreSource from '../stores/useWorkspaceStore.ts?raw';
import supportVerificationSource from '../features/session/components/SupportVerificationView.tsx?raw';

describe('M4-S5 persistence security boundary', () => {
  it('keeps legacy Google OAuth credentials memory-only in the active runtime', () => {
    expect(workspaceStateSource).not.toContain("safeLocalStorageGetItem('curman_workspaceAccessToken'");
    expect(workspaceStateSource).not.toContain("safeLocalStorageGetItem('curman_workspaceTokenExpiry'");
    expect(workspaceStateSource).not.toContain("safeLocalStorageGetItem('curman_isWorkspaceLoggedIn'");
    expect(workspaceStateSource).toContain("const [workspaceAccessToken, setWorkspaceAccessToken] = useState('')");
    expect(workspaceStateSource).toContain('const [workspaceTokenExpiry, setWorkspaceTokenExpiry] = useState(0)');
    expect(workspaceStateSource).toContain('LEGACY_WORKSPACE_CREDENTIAL_KEYS');
  });

  it('does not write OAuth token, expiry or logged-in authority markers after callback', () => {
    expect(startupSource).not.toContain("safeLocalStorageSetItem('curman_workspaceAccessToken'");
    expect(startupSource).not.toContain("safeLocalStorageSetItem('curman_workspaceTokenExpiry'");
    expect(startupSource).not.toContain("safeLocalStorageSetItem('curman_isWorkspaceLoggedIn'");
    expect(startupSource).toContain("safeLocalStorageRemoveItem(key)");
  });

  it('keeps active emergency backup credentials-free', () => {
    const payloadBuilder = sessionAutoSaveSource
      .split('const toEmergencyBackupPayload')[1]
      ?.split('export const useSessionAutoSave')[0] ?? '';
    expect(payloadBuilder).not.toContain('workspaceAccessToken');
    expect(payloadBuilder).not.toContain('workspaceTokenExpiry');
    expect(payloadBuilder).not.toContain('isWorkspaceLoggedIn');
  });

  it('prevents the legacy Zustand workspace store from rehydrating credentials', () => {
    expect(legacyWorkspaceStoreSource).toContain('partialize:');
    expect(legacyWorkspaceStoreSource).toContain('accessToken: null');
    expect(legacyWorkspaceStoreSource).toContain('refreshToken: null');
    expect(legacyWorkspaceStoreSource).not.toContain('partialize: (state) => state');
  });

  it('does not mount the obsolete full-workspace autosave in the product runtime', () => {
    expect(appSource).not.toContain('useAutoSave');
  });

  it('makes the bounded persistence limitation visible to the user', () => {
    expect(supportVerificationSource).toContain('Persistenza e portabilità');
    expect(supportVerificationSource).toContain('ARENA_M4_PERSISTENCE_POLICY');
    expect(supportVerificationSource).toContain('non migra automaticamente');
  });
});
