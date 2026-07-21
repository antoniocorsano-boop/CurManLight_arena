// Storage helpers with QuotaExceededError notification.
// Pattern: on quota failure, dispatch STORAGE_QUOTA_EVENT; the App listens and shows a toast.

export const STORAGE_QUOTA_EVENT = 'curman:storage-quota';

export const isQuotaExceededError = (e: unknown): boolean => {
 if (e instanceof DOMException) return e.name === 'QuotaExceededError' || e.code === 22;
 // Legacy browsers may throw a plain Error with code 22 instead of DOMException
 if (typeof e === 'object' && e !== null && 'code' in e) return (e as { code: number }).code === 22;
 return false;
};

export const dispatchStorageQuotaEvent = (): void => {
 try { window.dispatchEvent(new CustomEvent(STORAGE_QUOTA_EVENT)); } catch { /* noop */ }
};

// For large/raw payloads: writes directly WITHOUT consolidated-state duplication.
// Returns true on success, false on failure (never throws).
export const safeLocalStorageSetLarge = (key: string, serializedValue: string): boolean => {
 try {
  localStorage.setItem(key, serializedValue);
  return true;
 } catch (e) {
  console.warn("Storage write failed:", e);
  if (isQuotaExceededError(e)) dispatchStorageQuotaEvent();
  return false;
 }
};

// ─── Throttled write for high-frequency backup ──────────────────────────────

const THROTTLED_KEY_PREFIX = 'curman_throttle_ts_';

export const throttledSetLarge = (key: string, value: string, minIntervalMs = 60_000): boolean => {
 const tsKey = THROTTLED_KEY_PREFIX + key;
 try {
  const lastStr = localStorage.getItem(tsKey);
  const last = lastStr ? Number(lastStr) : 0;
  if (Date.now() - last < minIntervalMs) return false;
  localStorage.setItem(tsKey, String(Date.now()));
 } catch { /* quota or security error — proceed with write anyway */ }
 return safeLocalStorageSetLarge(key, value);
};

// ─── Consolidated blob pruning ──────────────────────────────────────────────

const CONSOLIDATED_STATE_KEY = 'curmanlight_stato_consolidato';
const STALE_THRESHOLD_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

interface ConsolidatedEntry {
 value: string;
 ts?: number; // timestamp when last written (optional for backward compat)
}

/**
 * Prune stale entries from the consolidated state blob.
 * Called once on app startup. Keys without a `ts` field are kept (backward compat).
 */
export const pruneStaleConsolidatedEntries = (): number => {
 try {
  const raw = localStorage.getItem(CONSOLIDATED_STATE_KEY);
  if (!raw) return 0;
  const state: Record<string, string | ConsolidatedEntry> = JSON.parse(raw);
  const now = Date.now();
  let removed = 0;
  for (const [k, v] of Object.entries(state)) {
   if (typeof v === 'object' && v !== null && 'ts' in v) {
    if (now - (v as ConsolidatedEntry).ts! > STALE_THRESHOLD_MS) {
     delete state[k];
     removed++;
    }
   }
  }
  if (removed > 0) {
   localStorage.setItem(CONSOLIDATED_STATE_KEY, JSON.stringify(state));
  }
  return removed;
 } catch {
  return 0;
 }
};

// ─── Storage usage estimation ───────────────────────────────────────────────

const USAGE_WARN_THRESHOLD_BYTES = 4 * 1024 * 1024; // 4 MB (out of 5 MB limit)

/**
 * Estimate total localStorage usage in bytes. Returns { bytes, overThreshold }.
 * Uses JSON serialized length as a rough proxy.
 */
export const getStorageUsage = (): { bytes: number; overThreshold: boolean } => {
 try {
  let total = 0;
  for (let i = 0; i < localStorage.length; i++) {
   const key = localStorage.key(i);
   if (key) {
    total += key.length;
    const val = localStorage.getItem(key);
    if (val) total += val.length;
   }
  }
  // Each char ~2 bytes in UTF-16
  const bytes = total * 2;
  return { bytes, overThreshold: bytes > USAGE_WARN_THRESHOLD_BYTES };
 } catch {
  return { bytes: 0, overThreshold: false };
 }
};
