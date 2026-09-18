import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const assert = (condition, message) => {
  if (!condition) {
    console.error(`CURRICULUM_LEGACY_BOUNDARY_FAIL: ${message}`);
    process.exit(1);
  }
};

const runtime = read('src/lib/curriculumBaseline.ts');
const currentMaster = read('src/domain/curriculum/institute/currentSource.ts');
const migrationMatrix = read('docs/foundation/CML_633C_CURRICULUMKB_MIGRATION_MATRIX.md');

const masterTitle = 'CAN-CURR-MASTER-00_Curricolo_verticale_integrale_unificato_3-14_2026-2027';
const masterDriveId = '12eWTPUZBJxZixd6-p8drNAaW5_eL8qWpXZUSDyZZAv4';

assert(currentMaster.includes(masterTitle), 'il dominio non identifica il master corrente');
assert(currentMaster.includes(masterDriveId), 'il dominio non identifica il Drive ID del master');
assert(runtime.includes('getCanonicalCurriculumMasterIdentity'), 'il runtime non espone l’identità del master');
assert(runtime.includes('NON è la baseline curricolare canonica'), 'la copia legacy non è declassata esplicitamente');
assert(runtime.includes('LEGACY_CURRICULUM_KB_PROVENANCE'), 'la copia legacy non conserva provenienza fail-closed');
assert(runtime.includes('Non aggiorna CAN-CURR-MASTER-00'), 'le mutazioni locali non sono separate dal master');
assert(migrationMatrix.includes('non è una baseline curricolare autorevole'), 'la matrice legacy attribuisce ancora autorità alla KB');
assert(migrationMatrix.includes(masterTitle), 'la matrice legacy non rinvia al master corrente');
assert(migrationMatrix.includes(masterDriveId), 'la matrice legacy non rinvia al Drive ID del master');
assert(!migrationMatrix.includes('remains the only authoritative archive'), 'è ricomparsa la vecchia pretesa di autorità della KB');

console.log('CURRICULUM_LEGACY_BOUNDARY_PASS');
