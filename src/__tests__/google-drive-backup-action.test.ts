import { describe, expect, it, vi } from 'vitest';
import {
  createGoogleDriveBackupAccessTokenProvider,
  GOOGLE_DRIVE_FILE_SCOPE,
  resolveGoogleDriveBackupClientConfig,
  type GoogleOAuth2Api,
} from '../infrastructure/googleDrive/googleIdentityAccessToken';
import backupActionSource from '../features/documents/components/SourceRegistryDriveBackupAction.tsx?raw';
import appViewsSource from '../features/session/components/AppViewsLayer.tsx?raw';
import tokenProviderSource from '../infrastructure/googleDrive/googleIdentityAccessToken.ts?raw';

const PUBLIC_CLIENT_ID = '123456789-example.apps.googleusercontent.com';

describe('CML-DRIVE-01 explicit Google Drive backup action', () => {
  it('stays disabled by configuration when no public OAuth client id is available', () => {
    expect(resolveGoogleDriveBackupClientConfig({})).toEqual({
      status: 'unconfigured',
      reason: 'Configura VITE_GOOGLE_DRIVE_BACKUP_CLIENT_ID per abilitare il backup Drive.',
    });
    expect(resolveGoogleDriveBackupClientConfig({ VITE_GOOGLE_DRIVE_BACKUP_CLIENT_ID: PUBLIC_CLIENT_ID })).toEqual({
      status: 'available',
      clientId: PUBLIC_CLIENT_ID,
    });
  });

  it('requests only the drive.file scope from an injected GIS token client after invocation', async () => {
    let callback: ((response: { access_token?: string; error?: string }) => void) | undefined;
    const requestAccessToken = vi.fn(() => callback?.({ access_token: 'temporary-access-token' }));
    const initTokenClient = vi.fn((config: Parameters<GoogleOAuth2Api['initTokenClient']>[0]) => {
      callback = config.callback;
      return { requestAccessToken };
    });
    const oauth2: GoogleOAuth2Api = { initTokenClient };
    const oauth2Loader = vi.fn(async () => oauth2);

    const provider = createGoogleDriveBackupAccessTokenProvider({
      clientId: PUBLIC_CLIENT_ID,
      oauth2Loader,
    });

    expect(oauth2Loader).not.toHaveBeenCalled();
    await expect(provider()).resolves.toBe('temporary-access-token');
    expect(initTokenClient).toHaveBeenCalledWith(expect.objectContaining({
      client_id: PUBLIC_CLIENT_ID,
      scope: GOOGLE_DRIVE_FILE_SCOPE,
    }));
    expect(requestAccessToken).toHaveBeenCalledWith({ prompt: '' });
  });

  it('keeps token handling ephemeral and the visible action outbound-only', () => {
    expect(tokenProviderSource).not.toContain('localStorage');
    expect(tokenProviderSource).not.toContain('sessionStorage');
    expect(tokenProviderSource).not.toContain('refresh_token');
    expect(tokenProviderSource).not.toContain('downloadFromDrive');
    expect(tokenProviderSource).not.toContain('listFiles');

    expect(backupActionSource).toContain('data-backup-direction="outbound-only"');
    expect(backupActionSource).toContain('Backup su Google Drive');
    expect(backupActionSource).toContain('Il token resta in memoria');
    expect(backupActionSource).toContain('Drive non acquisisce alcuna autorità');
    expect(backupActionSource).not.toContain('Ripristina');
    expect(appViewsSource).toContain('<SourceRegistryDriveBackupAction');
  });
});
