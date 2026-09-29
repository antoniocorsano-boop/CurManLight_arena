import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
  DRIVE_BACKUP_MAX_BYTES,
  DriveBackupBusyError,
  DriveBackupTooLargeError,
  assertDriveBackupWithinLimit,
  withDriveBackupLock,
} from '../features/workspace/lib/driveCostGuard';

describe('Drive zero-cost guard', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('accepts a payload at the 25 MiB boundary', () => {
    const value = 'a'.repeat(DRIVE_BACKUP_MAX_BYTES);
    expect(assertDriveBackupWithinLimit(value)).toBe(DRIVE_BACKUP_MAX_BYTES);
  });

  it('fails closed above the 25 MiB boundary', () => {
    const value = 'a'.repeat(DRIVE_BACKUP_MAX_BYTES + 1);
    expect(() => assertDriveBackupWithinLimit(value)).toThrow(DriveBackupTooLargeError);
  });

  it('rejects a concurrent fallback lease', async () => {
    const first = withDriveBackupLock(async () => {
      await new Promise((resolve) => setTimeout(resolve, 25));
      return 'first';
    });

    await new Promise((resolve) => setTimeout(resolve, 0));

    await expect(withDriveBackupLock(async () => 'second')).rejects.toBeInstanceOf(
      DriveBackupBusyError
    );

    await expect(first).resolves.toBe('first');
  });

  it('releases the fallback lease after failure', async () => {
    await expect(
      withDriveBackupLock(async () => {
        throw new Error('boom');
      })
    ).rejects.toThrow('boom');

    await expect(withDriveBackupLock(async () => 'ok')).resolves.toBe('ok');
  });
});
