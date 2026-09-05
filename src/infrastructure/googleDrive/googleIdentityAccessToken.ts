export const GOOGLE_DRIVE_FILE_SCOPE = 'https://www.googleapis.com/auth/drive.file' as const;
const GOOGLE_IDENTITY_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';
const GOOGLE_IDENTITY_SCRIPT_ID = 'cml-google-identity-services';

export type GoogleDriveBackupClientConfig =
  | { status: 'available'; clientId: string }
  | { status: 'unconfigured'; reason: string };

type GoogleTokenResponse = {
  access_token?: string;
  error?: string;
  error_description?: string;
};

type GoogleTokenClient = {
  requestAccessToken(options?: { prompt?: string }): void;
};

export type GoogleOAuth2Api = {
  initTokenClient(config: {
    client_id: string;
    scope: string;
    callback: (response: GoogleTokenResponse) => void;
    error_callback?: (error: unknown) => void;
  }): GoogleTokenClient;
};

type GoogleIdentityWindow = Window & {
  google?: {
    accounts?: {
      oauth2?: GoogleOAuth2Api;
    };
  };
};

export interface GoogleDriveAccessTokenProviderOptions {
  clientId: string;
  oauth2Loader?: () => Promise<GoogleOAuth2Api>;
}

export function resolveGoogleDriveBackupClientConfig(
  env: Record<string, unknown> = import.meta.env as Record<string, unknown>,
  runtimeClientId?: string,
): GoogleDriveBackupClientConfig {
  const specific = typeof env.VITE_GOOGLE_DRIVE_BACKUP_CLIENT_ID === 'string'
    ? env.VITE_GOOGLE_DRIVE_BACKUP_CLIENT_ID.trim()
    : '';
  const runtime = runtimeClientId?.trim() ?? '';
  const legacy = typeof env.VITE_GOOGLE_CLIENT_ID === 'string'
    ? env.VITE_GOOGLE_CLIENT_ID.trim()
    : '';
  const clientId = specific || runtime || legacy;

  if (!clientId) {
    return {
      status: 'unconfigured',
      reason: 'Configura un ID client Google OAuth pubblico per abilitare il backup Drive.',
    };
  }

  return { status: 'available', clientId };
}

function getLoadedGoogleOAuth2(): GoogleOAuth2Api | null {
  if (typeof window === 'undefined') return null;
  return (window as GoogleIdentityWindow).google?.accounts?.oauth2 ?? null;
}

function loadGoogleIdentityServices(): Promise<GoogleOAuth2Api> {
  const loaded = getLoadedGoogleOAuth2();
  if (loaded) return Promise.resolve(loaded);
  if (typeof document === 'undefined') return Promise.reject(new Error('GOOGLE_IDENTITY_BROWSER_REQUIRED'));

  return new Promise((resolve, reject) => {
    const existing = document.getElementById(GOOGLE_IDENTITY_SCRIPT_ID) as HTMLScriptElement | null;
    const script = existing ?? document.createElement('script');
    let settled = false;

    const finish = () => {
      if (settled) return;
      settled = true;
      const oauth2 = getLoadedGoogleOAuth2();
      if (!oauth2) {
        reject(new Error('GOOGLE_IDENTITY_API_UNAVAILABLE'));
        return;
      }
      resolve(oauth2);
    };

    const fail = () => {
      if (settled) return;
      settled = true;
      reject(new Error('GOOGLE_IDENTITY_SCRIPT_LOAD_FAILED'));
    };

    script.addEventListener('load', finish, { once: true });
    script.addEventListener('error', fail, { once: true });

    if (!existing) {
      script.id = GOOGLE_IDENTITY_SCRIPT_ID;
      script.src = GOOGLE_IDENTITY_SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    const oauth2 = getLoadedGoogleOAuth2();
    if (oauth2) finish();
  });
}

export function createGoogleDriveBackupAccessTokenProvider(
  options: GoogleDriveAccessTokenProviderOptions,
): () => Promise<string> {
  const clientId = options.clientId.trim();
  if (!clientId) throw new Error('GOOGLE_DRIVE_CLIENT_ID_REQUIRED');
  const oauth2Loader = options.oauth2Loader ?? loadGoogleIdentityServices;

  return async () => {
    const oauth2 = await oauth2Loader();
    return new Promise<string>((resolve, reject) => {
      const tokenClient = oauth2.initTokenClient({
        client_id: clientId,
        scope: GOOGLE_DRIVE_FILE_SCOPE,
        callback: (response) => {
          if (response.error) {
            reject(new Error(`GOOGLE_DRIVE_TOKEN_FAILED:${response.error}`));
            return;
          }
          const token = response.access_token?.trim();
          if (!token) {
            reject(new Error('GOOGLE_DRIVE_TOKEN_MISSING'));
            return;
          }
          resolve(token);
        },
        error_callback: () => reject(new Error('GOOGLE_DRIVE_TOKEN_INTERACTION_FAILED')),
      });

      // Called only from the explicit human backup action. No background request is made.
      tokenClient.requestAccessToken({ prompt: '' });
    });
  };
}
