import {
  CML_BACKUP_SCHEMA,
  calculateCmlBackupContentHash,
  createBackupReceipt,
  encodeCmlBackupPackage,
  type BackupReceipt,
  type BackupSink,
  type CmlBackupManifest,
} from '../../domain/backup';

export const CML_BACKUP_MIME_TYPE = 'application/vnd.curmanlight.backup' as const;
const DRIVE_RESUMABLE_CREATE_URL = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&fields=id%2Cname';
const SHA256_HEX = /^[0-9a-f]{64}$/;

export interface GoogleDriveBackupSinkOptions {
  /**
   * Supplies a short-lived OAuth access token at the moment the human starts a backup.
   * The sink never persists or returns the token.
   */
  accessTokenProvider: () => Promise<string>;
  /** Optional destination folder. Presence in this folder has no authority effect. */
  folderId?: string;
  /** Injectable for deterministic tests. Defaults to global fetch. */
  fetchImpl?: typeof fetch;
  /** Injectable clock for receipt tests. */
  now?: () => string;
}

type DriveUploadResult = {
  id?: unknown;
  name?: unknown;
};

function toSafeFileSegment(value: string): string {
  const safe = value.trim().replace(/[^a-zA-Z0-9._-]+/g, '_').replace(/^_+|_+$/g, '');
  return safe || 'backup';
}

function assertManifestReadyForOutboundBackup(manifest: CmlBackupManifest): void {
  if (manifest.schema !== CML_BACKUP_SCHEMA) throw new Error('BACKUP_SCHEMA_UNSUPPORTED');
  if (manifest.product !== 'CurManLight Arena') throw new Error('BACKUP_PRODUCT_INVALID');
  if (!manifest.backupId.trim()) throw new Error('BACKUP_ID_REQUIRED');
  if (!manifest.createdAt.trim()) throw new Error('BACKUP_CREATED_AT_REQUIRED');
  if (!SHA256_HEX.test(manifest.contentHash)) throw new Error('BACKUP_CONTENT_HASH_INVALID');
  if (!Number.isInteger(manifest.sourceRegistrySchemaVersion) || manifest.sourceRegistrySchemaVersion < 1) {
    throw new Error('BACKUP_SOURCE_REGISTRY_SCHEMA_INVALID');
  }
}

export function buildGoogleDriveBackupFileName(manifest: CmlBackupManifest): string {
  const timestamp = manifest.createdAt.replace(/[:]/g, '-').replace(/[^0-9TZ.+-]/g, '_');
  return `CurManLight_Arena_${timestamp}_${toSafeFileSegment(manifest.backupId)}.cml-backup`;
}

function assertTrustedResumableLocation(value: string | null): string {
  if (!value) throw new Error('DRIVE_BACKUP_RESUMABLE_LOCATION_MISSING');

  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error('DRIVE_BACKUP_RESUMABLE_LOCATION_INVALID');
  }

  const trustedHost = parsed.hostname === 'www.googleapis.com'
    || parsed.hostname.endsWith('.googleapis.com')
    || parsed.hostname.endsWith('.googleusercontent.com');
  if (parsed.protocol !== 'https:' || !trustedHost) {
    throw new Error('DRIVE_BACKUP_RESUMABLE_LOCATION_UNTRUSTED');
  }
  return parsed.toString();
}

async function parseDriveUploadResult(response: Response): Promise<{ id: string; name?: string }> {
  let result: DriveUploadResult;
  try {
    result = await response.json() as DriveUploadResult;
  } catch {
    throw new Error('DRIVE_BACKUP_RESPONSE_INVALID');
  }
  if (typeof result.id !== 'string' || !result.id.trim()) {
    throw new Error('DRIVE_BACKUP_REMOTE_ID_MISSING');
  }
  return {
    id: result.id,
    name: typeof result.name === 'string' ? result.name : undefined,
  };
}

/**
 * Outbound-only Google Drive adapter for CML-DRIVE-01.
 *
 * This class deliberately implements only BackupSink. It has no list/read/watch/sync
 * methods and cannot import Drive state into Arena.
 */
export class GoogleDriveBackupSink implements BackupSink {
  private readonly accessTokenProvider: () => Promise<string>;
  private readonly folderId?: string;
  private readonly fetchImpl: typeof fetch;
  private readonly now: () => string;

  constructor(options: GoogleDriveBackupSinkOptions) {
    this.accessTokenProvider = options.accessTokenProvider;
    this.folderId = options.folderId?.trim() || undefined;
    this.fetchImpl = options.fetchImpl ?? globalThis.fetch.bind(globalThis);
    this.now = options.now ?? (() => new Date().toISOString());
  }

  async writeSnapshot(manifest: CmlBackupManifest, payload: Uint8Array): Promise<BackupReceipt> {
    assertManifestReadyForOutboundBackup(manifest);
    const recomputedHash = await calculateCmlBackupContentHash(payload);
    if (recomputedHash !== manifest.contentHash) {
      throw new Error('BACKUP_CONTENT_HASH_MISMATCH');
    }

    const accessToken = (await this.accessTokenProvider()).trim();
    if (!accessToken) throw new Error('DRIVE_BACKUP_ACCESS_TOKEN_REQUIRED');

    const packageBytes = encodeCmlBackupPackage(manifest, payload);
    const fileName = buildGoogleDriveBackupFileName(manifest);
    const metadata = {
      name: fileName,
      mimeType: CML_BACKUP_MIME_TYPE,
      ...(this.folderId ? { parents: [this.folderId] } : {}),
      appProperties: {
        cmlBackupSchema: manifest.schema,
        cmlBackupId: manifest.backupId,
        cmlContentHash: manifest.contentHash,
        cmlDirection: 'outbound-backup',
        cmlAuthorityEffect: 'none',
      },
    };

    const startResponse = await this.fetchImpl(DRIVE_RESUMABLE_CREATE_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json; charset=UTF-8',
        'X-Upload-Content-Type': CML_BACKUP_MIME_TYPE,
        'X-Upload-Content-Length': String(packageBytes.byteLength),
      },
      body: JSON.stringify(metadata),
    });
    if (!startResponse.ok) {
      throw new Error(`DRIVE_BACKUP_INIT_FAILED:${startResponse.status}`);
    }

    const resumableLocation = assertTrustedResumableLocation(startResponse.headers.get('Location'));
    const packageBuffer = packageBytes.buffer.slice(
      packageBytes.byteOffset,
      packageBytes.byteOffset + packageBytes.byteLength,
    ) as ArrayBuffer;
    const uploadResponse = await this.fetchImpl(resumableLocation, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': CML_BACKUP_MIME_TYPE,
      },
      body: new Blob([packageBuffer], { type: CML_BACKUP_MIME_TYPE }),
    });
    if (!uploadResponse.ok) {
      throw new Error(`DRIVE_BACKUP_UPLOAD_FAILED:${uploadResponse.status}`);
    }

    const uploaded = await parseDriveUploadResult(uploadResponse);
    return createBackupReceipt({
      manifest,
      provider: 'google-drive',
      remoteObjectId: uploaded.id,
      exportedAt: this.now(),
    });
  }
}
