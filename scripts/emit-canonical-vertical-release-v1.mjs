import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createServer } from 'vite';
import {
  archiveCanonicalReleaseBytes, recoverCanonicalReleaseFromArchive, releaseSha256,
} from './archive-canonical-vertical-release-v1.mjs';

function requiredOption(name) {
  const index = process.argv.indexOf(name);
  const value = index >= 0 ? process.argv[index + 1] : undefined;
  if (!value || value.startsWith('--')) throw new Error(`${name} is required`);
  return value;
}

function assertPathIsOutsideRepository(filePath, purpose) {
  const relative = path.relative(process.cwd(), filePath);
  if (!relative.startsWith('..') && !path.isAbsolute(relative)) {
    throw new Error(`${purpose} must be outside the repository to avoid committing canonical source text`);
  }
}

async function main() {
  const inputPath = path.resolve(requiredOption('--input'));
  const outputPath = path.resolve(requiredOption('--output'));
  const archiveDir = path.resolve(requiredOption('--archive-dir'));
  const revisionId = requiredOption('--revision-id');
  const institutionId = requiredOption('--institution-id');
  const targetInstitutionId = requiredOption('--target-institution-id');
  assertPathIsOutsideRepository(inputPath, 'canonical source input');
  assertPathIsOutsideRepository(outputPath, 'release output');
  assertPathIsOutsideRepository(archiveDir, 'immutable archive directory');
  // Fail BEFORE any archive write when the requested output is occupied.
  try {
    await access(outputPath);
    throw new Error('release output already exists and must never be overwritten');
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
  }

  const content = await readFile(inputPath, 'utf8');
  if (institutionId !== targetInstitutionId) {
    throw new Error('canonical artifact institution does not match explicit target institution identity');
  }

  // Reuse the same exact original bytes for a previously emitted version.
  // Do not regenerate an issuedAt-dependent JSON with a different SHA.
  const existing = await recoverCanonicalReleaseFromArchive({
    archiveDir, institutionId, schoolYearRef: '2026/2027',
    masterVersion: '1.3', revisionId, sourceContent: content,
  });
  if (existing) {
    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, existing.bytes, { mode: 0o600, flag: 'wx' });
    console.log(JSON.stringify({
      status: 'PROVISIONAL_RELEASE_REUSED',
      contract: existing.receipt.releaseContract,
      institutionId: existing.receipt.institutionId,
      schoolYearRef: existing.receipt.schoolYearRef,
      sourceMasterVersion: existing.receipt.masterVersion,
      sourceRevisionId: existing.receipt.revisionId,
      authorityState: existing.receipt.authorityState,
      curricoloVigente: existing.receipt.curricoloVigente,
      expectedScopes: existing.receipt.scopeCount,
      sourceContentFootprint: existing.receipt.sourceFootprint,
      structuralFootprint: existing.receipt.structuralFootprint,
      sha256: existing.receipt.sha256,
      bytes: existing.receipt.bytes,
      archiveStatus: 'IMMUTABLE_PRIMARY_VERIFIED',
      archiveReceiptPath: existing.receiptPath,
      driveBackupStatus: 'OPTIONAL_NOT_CONFIRMED',
    }));
    return;
  }
  const server = await createServer({
    logLevel: 'error',
    server: { middlewareMode: true },
    appType: 'custom',
  });

  let release;
  try {
    const artifactModule = await server.ssrLoadModule('/src/domain/transfer/curricoloVerticaleArtifactV1.ts');
    const bridgeModule = await server.ssrLoadModule('/src/domain/transfer/curricoloVerticaleCanonicalBridgeV1.ts');

    const artifact = artifactModule.createCurricoloVerticaleArtifactV1({
      institutionId,
      schoolYearRef: '2026/2027',
      sourceMaster: {
        masterId: 'CAN-CURR-MASTER-00',
        driveFileId: '12eWTPUZBJxZixd6-p8drNAaW5_eL8qWpXZUSDyZZAv4',
        masterVersion: '1.3',
        revisionId,
        materializationState: 'COMPLETE',
        humanProfessionalValidation: 'OPEN',
        curricoloVigente: false,
        authority: 'INSTITUTE_CANONICAL_WORKING_BASELINE',
      },
      sourceSnapshot: { format: 'text/plain', content },
    });

    release = bridgeModule.createCompleteVerticalReleaseFromCanonicalArtifactV1({
      artifact,
      sourceSnapshot: { format: 'text/plain', content },
      expectedTargetInstitutionId: targetInstitutionId,
      expectedRevisionId: revisionId,
    });
  } finally {
    await server.close();
  }

  const releaseBytes = Buffer.from(JSON.stringify(release, null, 2) + '\n', 'utf8');
  const digest = releaseSha256(releaseBytes);
  // Make the independent immutable archive before reporting an emission.
  // A failed archival step cannot yield a nominally successful release.
  const archive = await archiveCanonicalReleaseBytes({
    bytes: releaseBytes,
    archiveDir,
    expectedSha256: digest,
  });
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, releaseBytes, { mode: 0o600, flag: 'wx' });

  // Only metadata is printed. The complete private master remains in the
  // caller-controlled output file; no repository artifact or remote upload.
  console.log(JSON.stringify({
    status: 'PROVISIONAL_RELEASE_EMITTED',
    contract: release.contract,
    institutionId: release.institutionId,
    schoolYearRef: release.schoolYearRef,
    sourceMasterVersion: release.sourceMaster.masterVersion,
    sourceRevisionId: release.sourceMaster.revisionId,
    authorityState: release.authority.state,
    curricoloVigente: release.sourceMaster.curricoloVigente,
    expectedScopes: release.manifest.expected.length,
    sourceContentFootprint: release.sourceSnapshot.contentFootprint.hash,
    structuralFootprint: release.structuralFootprint.hash,
    sha256: digest,
    bytes: releaseBytes.byteLength,
    archiveStatus: 'IMMUTABLE_PRIMARY_VERIFIED',
    archiveReceiptPath: archive.receiptPath,
    driveBackupStatus: 'OPTIONAL_NOT_CONFIRMED',
  }));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
