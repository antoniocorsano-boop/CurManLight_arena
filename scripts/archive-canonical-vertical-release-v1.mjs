import { hash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// @trama-write: explicit, user/operator-initiated immutable archive creation.
// @trama-feedback: CLI emits machine-readable success, or an error on stderr.
// @trama-persistent-feedback: receipt.json is read back and verified before success.
const ARCHIVE_RECEIPT_CONTRACT = 'ARENA_CANONICAL_RELEASE_ARCHIVE_RECEIPT_V1';
const RELEASE_CONTRACT = 'TRAMA_CURRICOLO_VERTICALE_RELEASE_V1';
const MAX_RELEASE_BYTES = 2_000_000;
const SCRIPT_ENTRY = fileURLToPath(import.meta.url);

function requireOption(name) {
  const index = process.argv.indexOf(name);
  const value = index >= 0 ? process.argv[index + 1] : undefined;
  if (!value || value.startsWith('--')) throw new Error(name + ' is required');
  return value;
}

function assertOutsideRepository(target, label) {
  const resolved = path.resolve(target);
  const relative = path.relative(process.cwd(), resolved);
  if (!relative.startsWith('..' + path.sep) && relative !== '..') {
    throw new Error(label + ' must be outside the repository');
  }
  return resolved;
}

export function releaseSha256(bytes) {
  return hash('sha256', bytes, 'hex');
}

export function inspectReleaseBytes(bytes, expectedSha256) {
  if (!Buffer.isBuffer(bytes) || bytes.byteLength === 0 || bytes.byteLength > MAX_RELEASE_BYTES) {
    throw new Error('archive refuses empty or oversized release bytes');
  }
  if (!/^[a-f0-9]{64}$/.test(expectedSha256)) {
    throw new Error('archive expected SHA-256 must have 64 lowercase hex characters');
  }
  const actualSha256 = releaseSha256(bytes);
  if (actualSha256 !== expectedSha256) {
    throw new Error('archive release SHA-256 does not match the attested source');
  }
  let release;
  try {
    release = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
  } catch {
    throw new Error('archive release must contain a valid UTF-8 JSON document');
  }
  if (release?.contract !== RELEASE_CONTRACT
    || release?.sourceMaster?.masterId !== 'CAN-CURR-MASTER-00'
    || typeof release?.sourceMaster?.masterVersion !== 'string'
    || typeof release?.sourceMaster?.revisionId !== 'string'
    || release?.authority?.state !== 'PROVISIONAL_COMPLETE'
    || release?.sourceMaster?.curricoloVigente !== false
    || release?.manifest?.expected?.length !== 113
    || release?.manifest?.coverageStatus !== 'SATISFIED') {
    throw new Error('archive refuses a non-canonical, incomplete or purportedly approved release');
  }
  return {
    contract: ARCHIVE_RECEIPT_CONTRACT,
    releaseContract: RELEASE_CONTRACT,
    sha256: actualSha256,
    bytes: bytes.byteLength,
    institutionId: release.institutionId,
    schoolYearRef: release.schoolYearRef,
    masterId: release.sourceMaster.masterId,
    masterVersion: release.sourceMaster.masterVersion,
    revisionId: release.sourceMaster.revisionId,
    sourceFootprint: release.sourceSnapshot?.contentFootprint?.hash,
    structuralFootprint: release.structuralFootprint?.hash,
    scopeCount: release.manifest.expected.length,
    authorityState: release.authority.state,
    curricoloVigente: release.sourceMaster.curricoloVigente,
  };
}

async function writeImmutableOrVerify(filename, bytes) {
  try {
    await writeFile(filename, bytes, { flag: 'wx', mode: 0o600 });
  } catch (error) {
    if (error?.code !== 'EEXIST') throw error;
    const existing = await readFile(filename);
    if (!existing.equals(bytes)) {
      throw new Error('archive collision or tampered existing file: ' + path.basename(filename));
    }
  }
  const stored = await readFile(filename);
  if (!stored.equals(bytes)) throw new Error('archive readback differs from supplied bytes');
}

/**
 * Caller-selected, durable, non-Drive storage is the *independent primary*
 * archive. The digest directory prevents replacing an existing version.
 * The receipt contains metadata only, never the complete master.
 */
export async function archiveCanonicalReleaseBytes({ bytes, archiveDir, expectedSha256 }) {
  const directory = assertOutsideRepository(archiveDir, 'primary archive directory');
  const receipt = inspectReleaseBytes(bytes, expectedSha256);
  const destination = path.join(directory, receipt.sha256);
  const releasePath = path.join(destination, 'release.json');
  const receiptPath = path.join(destination, 'receipt.json');
  const receiptBytes = Buffer.from(JSON.stringify(receipt, null, 2) + '\n', 'utf8');
  await mkdir(destination, { recursive: true, mode: 0o700 });
  await writeImmutableOrVerify(releasePath, bytes);
  await writeImmutableOrVerify(receiptPath, receiptBytes);
  inspectReleaseBytes(await readFile(releasePath), expectedSha256);
  return { receipt, releasePath, receiptPath };
}

export async function archiveCanonicalReleaseFile({ inputPath, archiveDir, expectedSha256 }) {
  const input = assertOutsideRepository(inputPath, 'release input');
  const bytes = await readFile(input);
  return archiveCanonicalReleaseBytes({ bytes, archiveDir, expectedSha256 });
}

async function main() {
  const result = await archiveCanonicalReleaseFile({
    inputPath: requireOption('--input'),
    archiveDir: requireOption('--archive-dir'),
    expectedSha256: requireOption('--expected-sha256'),
  });
  // No private content in CI, stdout or repository. Drive is an OPTIONAL,
  // independent backup destination handled by an authorized connector.
  console.log(JSON.stringify({
    status: 'IMMUTABLE_RELEASE_ARCHIVED',
    ...result.receipt,
    archiveReleasePath: result.releasePath,
    archiveReceiptPath: result.receiptPath,
  }));
}

if (process.argv[1] && path.resolve(process.argv[1]) === SCRIPT_ENTRY) {
  main().catch(error => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
