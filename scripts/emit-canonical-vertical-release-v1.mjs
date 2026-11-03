import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createServer } from 'vite';

function requiredOption(name) {
  const index = process.argv.indexOf(name);
  const value = index >= 0 ? process.argv[index + 1] : undefined;
  if (!value || value.startsWith('--')) throw new Error(`${name} is required`);
  return value;
}

function assertOutputIsOutsideRepository(outputPath) {
  const relative = path.relative(process.cwd(), outputPath);
  if (!relative.startsWith('..') && !path.isAbsolute(relative)) {
    throw new Error('release output must be outside the repository to avoid committing canonical source text');
  }
}

async function main() {
  const inputPath = path.resolve(requiredOption('--input'));
  const outputPath = path.resolve(requiredOption('--output'));
  const revisionId = requiredOption('--revision-id');
  const institutionId = requiredOption('--institution-id');
  const targetInstitutionId = requiredOption('--target-institution-id');
  assertOutputIsOutsideRepository(outputPath);

  const content = await readFile(inputPath, 'utf8');
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

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, JSON.stringify(release, null, 2) + '\n', {
    encoding: 'utf8',
    mode: 0o600,
    flag: 'wx',
  });

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
    structuralFootprint: release.structuralFootprint.hash,
  }));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
