import type { StructuralFootprint } from './types';

/** Non-cryptographic canonical JSON serializer with recursive key sorting. */
export function canonicalSerialize(value: unknown): string {
  return JSON.stringify(canonicalize(value));
}

function canonicalize(value: unknown): unknown {
  if (value === undefined) {
    throw new Error('Cannot canonicalize undefined values');
  }
  if (typeof value === 'function') {
    throw new Error('Cannot canonicalize function values');
  }
  if (value === null) return null;
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return value;
  if (typeof value === 'boolean') return value;
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(canonicalize);
  if (typeof value === 'object') {
    const sorted: Record<string, unknown> = {};
    for (const key of Object.keys(value as Record<string, unknown>).sort()) {
      sorted[key] = canonicalize((value as Record<string, unknown>)[key]);
    }
    return sorted;
  }
  throw new Error(`Cannot canonicalize value of type ${typeof value}`);
}

/** Non-cryptographic deterministic hash — FNV-1a 32-bit, hex output. */
export function fnv1a(str: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

/**
 * Compute a structural footprint for a payload.
 * NON-CRYPTOGRAPHIC — this is a structural fingerprint, not a security hash.
 */
export function computeStructuralFootprint(
  payload: Record<string, unknown>,
  excludedFields?: string[],
): StructuralFootprint {
  const toHash = { ...payload };
  for (const field of excludedFields ?? []) {
    delete toHash[field];
  }
  const canonical = canonicalSerialize(toHash);
  return {
    algorithm: 'fnv1a',
    version: 1,
    hash: fnv1a(canonical),
    computedAt: new Date().toISOString(),
  };
}

/**
 * Validate that a payload matches a previously computed footprint.
 * NON-CRYPTOGRAPHIC verification.
 */
export function validateStructuralFootprint(
  payload: Record<string, unknown>,
  footprint: StructuralFootprint,
): boolean {
  const recompute = computeStructuralFootprint(payload);
  return recompute.hash === footprint.hash;
}
