import { CML_BACKUP_SCHEMA, type CmlBackupManifest } from './contract';

export const CML_BACKUP_PACKAGE_MAGIC = 'CML_BACKUP_PACKAGE_V1\n' as const;

export interface DecodedCmlBackupPackage {
  manifest: CmlBackupManifest;
  payload: Uint8Array;
}

const encoder = new TextEncoder();
const decoder = new TextDecoder();
const magicBytes = encoder.encode(CML_BACKUP_PACKAGE_MAGIC);
const UINT32_BYTES = 4;

function assertManifestShape(value: unknown): asserts value is CmlBackupManifest {
  if (!value || typeof value !== 'object') throw new Error('BACKUP_PACKAGE_MANIFEST_INVALID');
  const manifest = value as Partial<CmlBackupManifest>;
  if (manifest.schema !== CML_BACKUP_SCHEMA) throw new Error('BACKUP_SCHEMA_UNSUPPORTED');
  if (typeof manifest.backupId !== 'string' || !manifest.backupId.trim()) {
    throw new Error('BACKUP_ID_REQUIRED');
  }
  if (manifest.product !== 'CurManLight Arena') throw new Error('BACKUP_PRODUCT_INVALID');
  if (typeof manifest.contentHash !== 'string') throw new Error('BACKUP_CONTENT_HASH_INVALID');
}

/**
 * Binary envelope used by outbound backup providers.
 *
 * Layout:
 *   MAGIC UTF-8
 *   uint32 big-endian manifest byte length
 *   manifest JSON UTF-8
 *   canonical snapshot payload bytes
 *
 * The manifest hash always refers to the raw canonical payload, not to this envelope.
 */
export function encodeCmlBackupPackage(
  manifest: CmlBackupManifest,
  payload: Uint8Array,
): Uint8Array {
  const manifestBytes = encoder.encode(JSON.stringify(manifest));
  if (manifestBytes.byteLength > 0xffffffff) throw new Error('BACKUP_MANIFEST_TOO_LARGE');

  const output = new Uint8Array(
    magicBytes.byteLength + UINT32_BYTES + manifestBytes.byteLength + payload.byteLength,
  );
  let offset = 0;
  output.set(magicBytes, offset);
  offset += magicBytes.byteLength;
  new DataView(output.buffer).setUint32(offset, manifestBytes.byteLength, false);
  offset += UINT32_BYTES;
  output.set(manifestBytes, offset);
  offset += manifestBytes.byteLength;
  output.set(payload, offset);
  return output;
}

export function decodeCmlBackupPackage(packageBytes: Uint8Array): DecodedCmlBackupPackage {
  const minimumLength = magicBytes.byteLength + UINT32_BYTES;
  if (packageBytes.byteLength < minimumLength) throw new Error('BACKUP_PACKAGE_TRUNCATED');

  const candidateMagic = packageBytes.subarray(0, magicBytes.byteLength);
  if (candidateMagic.some((byte, index) => byte !== magicBytes[index])) {
    throw new Error('BACKUP_PACKAGE_MAGIC_INVALID');
  }

  const manifestLength = new DataView(
    packageBytes.buffer,
    packageBytes.byteOffset + magicBytes.byteLength,
    UINT32_BYTES,
  ).getUint32(0, false);
  const manifestStart = minimumLength;
  const manifestEnd = manifestStart + manifestLength;
  if (manifestEnd > packageBytes.byteLength) throw new Error('BACKUP_PACKAGE_MANIFEST_TRUNCATED');

  let parsed: unknown;
  try {
    parsed = JSON.parse(decoder.decode(packageBytes.subarray(manifestStart, manifestEnd)));
  } catch {
    throw new Error('BACKUP_PACKAGE_MANIFEST_INVALID_JSON');
  }
  assertManifestShape(parsed);

  return {
    manifest: parsed,
    payload: packageBytes.slice(manifestEnd),
  };
}
