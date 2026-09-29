import { describe, expect, it } from 'vitest';
import startupSource from '../features/session/hooks/useAppStartupEffects.ts?raw';
import syncSource from '../features/workspace/hooks/useWorkspaceSyncHandlers.ts?raw';

describe('Drive OAuth security regression', () => {
  it('does not persist the OAuth access token during startup handling', () => {
    expect(startupSource).not.toContain("safeLocalStorageSetItem('curman_workspaceAccessToken'");
    expect(startupSource).not.toContain("localStorage.setItem('curman_workspaceAccessToken'");
  });

  it('does not perform autonomous Drive reads after OAuth return', () => {
    expect(startupSource).not.toContain('handleWorkspaceAutoPull(token)');
    expect(startupSource).not.toContain('drive/v3/files');
  });

  it('preflights backup size before sending the user to OAuth', () => {
    const loginStart = syncSource.indexOf('const handleWorkspaceLogin');
    const guard = syncSource.indexOf('assertDriveBackupWithinLimit', loginStart);
    const oauthRedirect = syncSource.indexOf('window.location.href = authUrl', loginStart);

    expect(loginStart).toBeGreaterThanOrEqual(0);
    expect(guard).toBeGreaterThan(loginStart);
    expect(oauthRedirect).toBeGreaterThan(guard);
  });

  it('never stores refresh tokens in the workspace sync handler', () => {
    expect(syncSource).not.toContain('refresh_token');
    expect(syncSource).not.toContain('workspaceRefreshToken');
  });
});
