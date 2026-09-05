import { describe, expect, it, vi } from 'vitest';
import {
  CML_BACKUP_SCHEMA,
  decodeCmlBackupPackage,
  type CmlBackupManifest,
} from '../domain/backup';
import {
  CML_BACKUP_MIME_TYPE,
  GoogleDriveBackupSink,
  buildGoogleDriveBackupFileName,
} from '../infrastructure/googleDrive/googleDriveBackupSink';

async function sha256Hex(payload: Uint8Array): Promise<string> {
  const bytes = payload.slice();
  const digest = await crypto.subtle.digest('SHA-256', bytes.buffer);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function manifestFor(payload: Uint8Array): Promise<CmlBackupManifest> {
  return {
    schema: CML_BACKUP_SCHEMA,
    backupId: 'backup:source-registry/01',
    product: 'CurManLight Arena',
    createdAt: '2026-09-05T06:00:00.000Z',
    contentHash: await sha256Hex(payload),
    sourceRegistrySchemaVersion: 1,
    objectCounts: {
      sources: 3,
      sourceVersions: 3,
      curriculumVersions: 0,
      revisions: 0,
      workspaces: 0,
      documents: 0,
    },
  };
}

describe('CML-DRIVE-01 GoogleDriveBackupSink', () => {
  it('uploads one exact package through a resumable outbound session and returns a no-authority receipt', async () => {
    const payload = new TextEncoder().encode('{"snapshot":"canonical"}');
    const manifest = await manifestFor(payload);
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(null, {
        status: 200,
        headers: {
          Location: 'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&upload_id=test-1',
        },
      }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: 'drive-file-123', name: 'backup.cml-backup' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }));
    const tokenProvider = vi.fn().mockResolvedValue('short-lived-token');
    const sink = new GoogleDriveBackupSink({
      accessTokenProvider: tokenProvider,
      folderId: 'drive-folder-1',
      fetchImpl: fetchMock as unknown as typeof fetch,
      now: () => '2026-09-05T06:01:00.000Z',
    });

    const receipt = await sink.writeSnapshot(manifest, payload);

    expect(tokenProvider).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const [startUrl, startInit] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(startUrl).toContain('uploadType=resumable');
    expect(startInit.method).toBe('POST');
    const metadata = JSON.parse(String(startInit.body));
    expect(metadata.parents).toEqual(['drive-folder-1']);
    expect(metadata.appProperties.cmlDirection).toBe('outbound-backup');
    expect(metadata.appProperties.cmlAuthorityEffect).toBe('none');
    expect(metadata.name).toBe(buildGoogleDriveBackupFileName(manifest));

    const [, uploadInit] = fetchMock.mock.calls[1] as [string, RequestInit];
    expect(uploadInit.method).toBe('PUT');
    expect((uploadInit.headers as Record<string, string>)['Content-Type']).toBe(CML_BACKUP_MIME_TYPE);
    const packageBlob = uploadInit.body as Blob;
    const decoded = decodeCmlBackupPackage(new Uint8Array(await packageBlob.arrayBuffer()));
    expect(decoded.manifest).toEqual(manifest);
    expect(Array.from(decoded.payload)).toEqual(Array.from(payload));

    expect(receipt).toEqual({
      backupId: manifest.backupId,
      provider: 'google-drive',
      remoteObjectId: 'drive-file-123',
      contentHash: manifest.contentHash,
      exportedAt: '2026-09-05T06:01:00.000Z',
      direction: 'outbound-backup',
      authorityEffect: 'none',
    });
    expect('readSnapshot' in sink).toBe(false);
    expect('sync' in sink).toBe(false);
  });

  it('rejects a manifest/payload hash mismatch before obtaining credentials or contacting Drive', async () => {
    const payload = new TextEncoder().encode('changed payload');
    const manifest: CmlBackupManifest = {
      ...(await manifestFor(new TextEncoder().encode('original payload'))),
    };
    const fetchMock = vi.fn();
    const tokenProvider = vi.fn().mockResolvedValue('unused-token');
    const sink = new GoogleDriveBackupSink({
      accessTokenProvider: tokenProvider,
      fetchImpl: fetchMock as unknown as typeof fetch,
    });

    await expect(sink.writeSnapshot(manifest, payload)).rejects.toThrow('BACKUP_CONTENT_HASH_MISMATCH');
    expect(tokenProvider).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects an untrusted resumable upload location instead of sending the token or payload elsewhere', async () => {
    const payload = new TextEncoder().encode('canonical');
    const manifest = await manifestFor(payload);
    const fetchMock = vi.fn().mockResolvedValueOnce(new Response(null, {
      status: 200,
      headers: { Location: 'https://example.invalid/upload/session' },
    }));
    const sink = new GoogleDriveBackupSink({
      accessTokenProvider: async () => 'short-lived-token',
      fetchImpl: fetchMock as unknown as typeof fetch,
    });

    await expect(sink.writeSnapshot(manifest, payload)).rejects.toThrow('DRIVE_BACKUP_RESUMABLE_LOCATION_UNTRUSTED');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
