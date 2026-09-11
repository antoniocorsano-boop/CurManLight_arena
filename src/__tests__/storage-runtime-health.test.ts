import { describe, expect, it } from 'vitest';
import { classifyBrowserStorageMode } from '../lib/storageRuntimeHealth';

describe('browser storage health contract', () => {
  it('treats a working IndexedDB without anti-eviction guarantee as usable best-effort storage', () => {
    expect(classifyBrowserStorageMode(true, 'best-effort')).toBe('indexeddb-best-effort');
    expect(classifyBrowserStorageMode(true, 'unknown')).toBe('indexeddb-best-effort');
  });

  it('distinguishes explicit persistent storage protection', () => {
    expect(classifyBrowserStorageMode(true, 'granted')).toBe('indexeddb-persistent');
  });

  it('marks only an unavailable IndexedDB as volatile memory', () => {
    expect(classifyBrowserStorageMode(false, 'unknown')).toBe('volatile-memory');
    expect(classifyBrowserStorageMode(false, 'granted')).toBe('volatile-memory');
  });
});
