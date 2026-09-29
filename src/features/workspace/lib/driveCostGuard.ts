export const DRIVE_BACKUP_MAX_BYTES = 25 * 1024 * 1024;
const DRIVE_BACKUP_LOCK_NAME = 'curmanlight-drive-backup';
const DRIVE_BACKUP_LEASE_KEY = 'curmanlight-drive-backup-lease';
const DRIVE_BACKUP_LEASE_MS = 5 * 60 * 1000;

export class DriveBackupBusyError extends Error {
  constructor() {
    super('Un altro caricamento Drive è già in corso.');
    this.name = 'DriveBackupBusyError';
  }
}

export class DriveBackupTooLargeError extends Error {
  readonly bytes: number;

  constructor(bytes: number) {
    super('La copia supera il limite tecnico di 25 MiB.');
    this.name = 'DriveBackupTooLargeError';
    this.bytes = bytes;
  }
}

export function measureUtf8Bytes(value: string): number {
  return new TextEncoder().encode(value).byteLength;
}

export function assertDriveBackupWithinLimit(value: string): number {
  const bytes = measureUtf8Bytes(value);
  if (bytes > DRIVE_BACKUP_MAX_BYTES) {
    throw new DriveBackupTooLargeError(bytes);
  }
  return bytes;
}

function randomOwner(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function acquireLocalStorageLease(): () => void {
  if (typeof localStorage === 'undefined') {
    throw new DriveBackupBusyError();
  }

  const now = Date.now();
  const owner = randomOwner();
  const currentRaw = localStorage.getItem(DRIVE_BACKUP_LEASE_KEY);

  if (currentRaw) {
    try {
      const current = JSON.parse(currentRaw) as { owner?: string; expiresAt?: number };
      if (typeof current.expiresAt === 'number' && current.expiresAt > now) {
        throw new DriveBackupBusyError();
      }
    } catch (error) {
      if (error instanceof DriveBackupBusyError) throw error;
    }
  }

  const lease = JSON.stringify({ owner, expiresAt: now + DRIVE_BACKUP_LEASE_MS });
  localStorage.setItem(DRIVE_BACKUP_LEASE_KEY, lease);

  const confirmedRaw = localStorage.getItem(DRIVE_BACKUP_LEASE_KEY);
  if (!confirmedRaw) throw new DriveBackupBusyError();

  const confirmed = JSON.parse(confirmedRaw) as { owner?: string };
  if (confirmed.owner !== owner) throw new DriveBackupBusyError();

  return () => {
    try {
      const latestRaw = localStorage.getItem(DRIVE_BACKUP_LEASE_KEY);
      if (!latestRaw) return;
      const latest = JSON.parse(latestRaw) as { owner?: string };
      if (latest.owner === owner) {
        localStorage.removeItem(DRIVE_BACKUP_LEASE_KEY);
      }
    } catch {
      // Lease cleanup is best-effort. The finite expiry prevents a permanent lock.
    }
  };
}

export async function withDriveBackupLock<T>(operation: () => Promise<T>): Promise<T> {
  const locks = typeof navigator !== 'undefined' ? navigator.locks : undefined;

  if (locks?.request) {
    return locks.request(
      DRIVE_BACKUP_LOCK_NAME,
      { ifAvailable: true },
      async (lock) => {
        if (!lock) throw new DriveBackupBusyError();
        return operation();
      }
    );
  }

  const release = acquireLocalStorageLease();
  try {
    return await operation();
  } finally {
    release();
  }
}
