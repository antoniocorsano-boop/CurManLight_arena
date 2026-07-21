import { describe, it, expect, vi, afterEach } from 'vitest';
import {
 safeLocalStorageSetLarge,
 isQuotaExceededError,
 STORAGE_QUOTA_EVENT,
 throttledSetLarge,
 pruneStaleConsolidatedEntries,
 getStorageUsage,
} from '../lib/storage';

describe('safeLocalStorageSetLarge', () => {
 afterEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
 });

 it('writes to localStorage and returns true on success', () => {
  const result = safeLocalStorageSetLarge('test-key', '{"a":1}');
  expect(result).toBe(true);
  expect(localStorage.getItem('test-key')).toBe('{"a":1}');
 });

 it('overwrites existing values', () => {
  safeLocalStorageSetLarge('k', 'v1');
  safeLocalStorageSetLarge('k', 'v2');
  expect(localStorage.getItem('k')).toBe('v2');
 });

 it('returns false on QuotaExceededError and dispatches quota event', () => {
  const dispatchSpy = vi.spyOn(window, 'dispatchEvent');
  const quotaError = new DOMException('Quota exceeded', 'QuotaExceededError');
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw quotaError; });

  const result = safeLocalStorageSetLarge('test', 'value');

  expect(result).toBe(false);
  expect(dispatchSpy).toHaveBeenCalledWith(
   expect.objectContaining({ type: STORAGE_QUOTA_EVENT })
  );
 });

 it('returns false on QuotaExceededError with code 22 (legacy browsers)', () => {
  const dispatchSpy = vi.spyOn(window, 'dispatchEvent');
  // Legacy browsers used code 22 with a non-DOMException error
  const quotaError = { name: 'InvalidStateError', code: 22, message: 'Quota exceeded' } as unknown as DOMException;
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw quotaError; });

  const result = safeLocalStorageSetLarge('test', 'value');

  expect(result).toBe(false);
  expect(dispatchSpy).toHaveBeenCalled();
 });

 it('returns false on non-quota errors WITHOUT dispatching quota event', () => {
  const dispatchSpy = vi.spyOn(window, 'dispatchEvent');
  const otherError = new Error('SecurityError');
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw otherError; });

  const result = safeLocalStorageSetLarge('test', 'value');

  expect(result).toBe(false);
  expect(dispatchSpy).not.toHaveBeenCalled();
 });
});

describe('isQuotaExceededError', () => {
 it('returns true for QuotaExceededError DOMException', () => {
  expect(isQuotaExceededError(new DOMException('x', 'QuotaExceededError'))).toBe(true);
 });

 it('returns true for error with code 22', () => {
  // Legacy browsers used code 22 with a non-DOMException error
  const err = { name: 'InvalidStateError', code: 22 } as unknown as DOMException;
  expect(isQuotaExceededError(err)).toBe(true);
 });

 it('returns false for regular Error', () => {
  expect(isQuotaExceededError(new Error('nope'))).toBe(false);
 });

 it('returns false for null/undefined', () => {
  expect(isQuotaExceededError(null)).toBe(false);
  expect(isQuotaExceededError(undefined)).toBe(false);
 });
});

describe('throttledSetLarge', () => {
 afterEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
 });

 it('writes on first call', () => {
  const result = throttledSetLarge('throttle-key', 'value', 60_000);
  expect(result).toBe(true);
  expect(localStorage.getItem('throttle-key')).toBe('value');
 });

 it('skips write within minIntervalMs', () => {
  throttledSetLarge('tk', 'v1', 60_000);
  const result = throttledSetLarge('tk', 'v2', 60_000);
  expect(result).toBe(false);
  expect(localStorage.getItem('tk')).toBe('v1');
 });

 it('allows write after minIntervalMs', () => {
  throttledSetLarge('tk2', 'v1', 100);
  // Simulate time passing
  vi.useFakeTimers();
  vi.advanceTimersByTime(150);
  const result = throttledSetLarge('tk2', 'v2', 100);
  expect(result).toBe(true);
  expect(localStorage.getItem('tk2')).toBe('v2');
  vi.useRealTimers();
 });
});

describe('pruneStaleConsolidatedEntries', () => {
 afterEach(() => {
  localStorage.clear();
 });

 it('removes entries older than 30 days', () => {
  const oldTs = Date.now() - 31 * 24 * 60 * 60 * 1000;
  const freshTs = Date.now();
  const blob = JSON.stringify({
   oldKey: { value: 'stale', ts: oldTs },
   freshKey: { value: 'fresh', ts: freshTs },
  });
  localStorage.setItem('curmanlight_stato_consolidato', blob);

  const removed = pruneStaleConsolidatedEntries();
  expect(removed).toBe(1);

  const result = JSON.parse(localStorage.getItem('curmanlight_stato_consolidato')!);
  expect(result.oldKey).toBeUndefined();
  expect(result.freshKey.value).toBe('fresh');
 });

 it('keeps entries without ts (backward compat)', () => {
  const blob = JSON.stringify({ legacyKey: 'legacy-value' });
  localStorage.setItem('curmanlight_stato_consolidato', blob);

  const removed = pruneStaleConsolidatedEntries();
  expect(removed).toBe(0);

  const result = JSON.parse(localStorage.getItem('curmanlight_stato_consolidato')!);
  expect(result.legacyKey).toBe('legacy-value');
 });

 it('returns 0 when no consolidated blob exists', () => {
  expect(pruneStaleConsolidatedEntries()).toBe(0);
 });
});

describe('getStorageUsage', () => {
 afterEach(() => localStorage.clear());

 it('returns zero for empty localStorage', () => {
  const { bytes, overThreshold } = getStorageUsage();
  expect(bytes).toBe(0);
  expect(overThreshold).toBe(false);
 });

 it('estimates usage from stored keys', () => {
  localStorage.setItem('k1', 'hello');
  const { bytes } = getStorageUsage();
  expect(bytes).toBeGreaterThan(0);
 });
});
