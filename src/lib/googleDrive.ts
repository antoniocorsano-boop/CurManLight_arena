interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
}

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_DRIVE_API = 'https://www.googleapis.com/drive/v3';
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const REDIRECT_URI = import.meta.env.VITE_GOOGLE_REDIRECT_URI || window.location.origin;

export function googleAuth(redirectUri = REDIRECT_URI): string {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: 'token',
    scope: 'https://www.googleapis.com/auth/drive.file',
    prompt: 'consent',
  });
  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

export async function exchangeCode(code: string, redirectUri = REDIRECT_URI): Promise<TokenResponse> {
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: CLIENT_ID,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });
  if (!response.ok) throw new Error('Token exchange failed');
  return response.json();
}

export async function uploadToDrive(token: string, fileName: string, content: string, folderId?: string): Promise<DriveFile> {
  const metadata = {
    name: fileName,
    mimeType: 'application/json',
    ...(folderId ? { parents: [folderId] } : {}),
  };

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', new Blob([content], { type: 'application/json' }));

  const response = await fetch(
    `${GOOGLE_DRIVE_API}/upload/files?uploadType=multipart`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    }
  );
  if (!response.ok) throw new Error('Upload failed');
  return response.json();
}

export async function downloadFromDrive(token: string, fileId: string): Promise<string> {
  const response = await fetch(`${GOOGLE_DRIVE_API}/files/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Download failed');
  return response.text();
}

export async function listFiles(token: string, query?: string): Promise<DriveFile[]> {
  const q = query ? `?q=${encodeURIComponent(query)}` : '';
  const response = await fetch(`${GOOGLE_DRIVE_API}/files${q}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('List files failed');
  const data = await response.json();
  return data.files || [];
}
