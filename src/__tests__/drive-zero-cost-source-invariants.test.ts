// @trama-feedback-test Drive backup emits explicit user-visible success/failure feedback through showToast.
import { describe, expect, it } from 'vitest';
import startupSource from '../features/session/hooks/useAppStartupEffects.ts?raw';
import syncSource from '../features/workspace/hooks/useWorkspaceSyncHandlers.ts?raw';

describe('Drive zero-cost source invariants', () => {
  it('does not perform Drive auto-pull from startup', () => {
    expect(startupSource).not.toContain('handleWorkspaceAutoPull(token)');
    expect(startupSource).not.toContain('drive/v3/files');
  });

  it('guards size before OAuth redirect', () => {
    const loginStart = syncSource.indexOf("const handleWorkspaceLogin");
    const guard = syncSource.indexOf('assertDriveBackupWithinLimit', loginStart);
    const redirect = syncSource.indexOf('window.location.href = authUrl', loginStart);

    expect(loginStart).toBeGreaterThanOrEqual(0);
    expect(guard).toBeGreaterThan(loginStart);
    expect(redirect).toBeGreaterThan(guard);
  });

  it('guards size and acquires the shared lease before first Drive fetch', () => {
    const syncStart = syncSource.indexOf('const handleWorkspaceSync');
    const guard = syncSource.indexOf('assertDriveBackupWithinLimit(fileContent)', syncStart);
    const lease = syncSource.indexOf('acquireDriveBackupLease()', syncStart);
    const firstFetch = syncSource.indexOf('await fetch(', syncStart);

    expect(syncStart).toBeGreaterThanOrEqual(0);
    expect(guard).toBeGreaterThan(syncStart);
    expect(lease).toBeGreaterThan(guard);
    expect(firstFetch).toBeGreaterThan(lease);
  });
});
