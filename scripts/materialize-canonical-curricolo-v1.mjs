import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createServer } from 'vite';

function readOption(name) {
  const index = process.argv.indexOf(name);
  if (index < 0 || !process.argv[index + 1] || process.argv[index + 1].startsWith('--')) {
    throw new Error(`${name} is required`);
  }
  return process.argv[index + 1];
}

async function main() {
  const inputPath = path.resolve(readOption('--input'));
  const revisionId = readOption('--revision-id');
  const outputPath = path.resolve(readOption('--output'));
  const content = await readFile(inputPath, 'utf8');

  const server = await createServer({
    logLevel: 'error',
    server: { middlewareMode: true },
    appType: 'custom',
  });

  try {
    const module = await server.ssrLoadModule('/src/domain/transfer/curricoloVerticaleArtifactV1.ts');
    const artifact = module.createCurricoloVerticaleArtifactV1({
      institutionId: 'ics-lorenzo-milani',
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
      sourceSnapshot: {
        format: 'text/plain',
        content,
      },
    });
    const serialized = module.serializeCurricoloVerticaleArtifactV1(artifact);
    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, serialized, 'utf8');
  } finally {
    await server.close();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
