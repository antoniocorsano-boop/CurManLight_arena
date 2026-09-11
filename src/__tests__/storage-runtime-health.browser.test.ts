import { describe, expect, it } from 'vitest';
import { verifyBrowserStorage } from '../lib/storageRuntimeHealth';

describe('browser storage runtime health', () => {
  it('proves IndexedDB with a real write/read/delete round-trip', async () => {
    const result = await verifyBrowserStorage();

    expect(result.indexedDbOperational, result.reason).toBe(true);
    expect(result.mode).not.toBe('volatile-memory');
    expect(['indexeddb-persistent', 'indexeddb-best-effort']).toContain(result.mode);
  });
});
