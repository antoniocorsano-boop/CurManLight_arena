import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function readText(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function assert(condition, message) {
  if (!condition) {
    console.error(`REG-CURR-00_ALIGNMENT_FAIL: ${message}`);
    process.exit(1);
  }
}

const registry = readJson('docs/curriculum/REG-CURR-00.registry.json');
const cco = readJson('.human/operational-communication.contract.json');
const surfaces = readJson('.human/operational-communication.surfaces.json');
const mirror = readText('docs/curriculum/REG-CURR-00_MASTER_ALIGNMENT.md');

assert(registry.registry_id === 'REG-CURR-00', 'registry_id deve essere REG-CURR-00');
assert(registry.version === '1.0.0', 'versione iniziale del registro inattesa');

const source = registry.drive?.current_curriculum_source;
assert(source, 'fonte curricolare corrente assente');
assert(
  source.title === 'CURRICOLO_VERTICALE_CORRETTO_PROPOSTA_2026-09-03.docx',
  'titolo della fonte curricolare corrente non canonico',
);
assert(
  source.file_id === '1DPdK_EIZsE3lI-LIzTJG776cU1PcAcnf',
  'Drive file ID della fonte curricolare corrente inatteso',
);
assert(
  /^[a-f0-9]{64}$/.test(source.sha256),
  'SHA-256 della fonte curricolare corrente mancante o invalido',
);
assert(
  source.status === 'PROPOSTA_D_ISTITUTO_DA_VALIDARE',
  'la fonte corretta non deve essere promossa implicitamente oltre lo stato di proposta da validare',
);

const baseline = registry.arena_product_baseline;
assert(baseline?.pr === 198, 'la baseline operativa corrente deve restare esplicitamente identificata');
assert(
  baseline?.branch === 'feature/team-meeting-workspace',
  'branch della baseline Arena inatteso',
);
assert(
  baseline?.product_head === 'b0b67b645dc87f568c38ccc5ddff46a0e20623cc',
  'product head registrato non coincide con la baseline funzionale congelata',
);
assert(
  baseline?.cco_version === cco.version,
  `CCO disallineato: REG-CURR-00=${baseline?.cco_version} repository=${cco.version}`,
);
assert(
  baseline?.cco_surfaces_version === surfaces.version,
  `registro superfici CCO disallineato: REG-CURR-00=${baseline?.cco_surfaces_version} repository=${surfaces.version}`,
);

assert(
  cco.principles?.recognition_before_interpretation === true,
  'CCO deve mantenere recognition_before_interpretation',
);
assert(
  cco.principles?.one_dominant_object_per_task_context === true,
  'CCO deve mantenere un solo oggetto dominante per contesto',
);
assert(
  cco.layers?.workflow_progression?.scrolling_alone_is_not_a_stage_transition === true,
  'CCO deve vietare lo scroll come falsa transizione di stadio',
);
assert(
  cco.acceptance?.draft_requires_explicit_commit === true,
  'una bozza non può risultare completata senza registrazione esplicita',
);

const downstream = registry.downstream_draft_stacks ?? [];
assert(downstream.length === 2, 'le due catene Draft successive devono restare esplicitamente registrate');
for (const stack of downstream) {
  assert(
    stack.status === 'NOT_CANONICAL_UNTIL_REALIGNED',
    `la catena PR ${stack.prs?.join('–')} non può essere trattata come canonica prima del riallineamento`,
  );
}

assert(
  registry.curriculum_process?.human_professional_validation === 'OPEN',
  'la validazione professionale non può essere chiusa senza esito umano registrato',
);
assert(
  registry.curriculum_process?.ready_for_collegio === 'NOT_YET',
  'READY_FOR_COLLEGIO non è autorizzato nella baseline corrente',
);
assert(
  registry.curriculum_process?.canonical_curriculum_promotion === 'NOT_AUTHORIZED',
  'la promozione canonica del curricolo non è autorizzata',
);

const driveRegisterId = registry.drive?.master_register?.file_id;
assert(
  driveRegisterId === '1IMKwWWukefIDIOsbHQByiXLN7YuU7He0V5b01tjitG4',
  'registro maestro Drive inatteso',
);
assert(mirror.includes(driveRegisterId), 'il mirror Markdown non richiama il registro maestro Drive');
assert(mirror.includes(source.title), 'il mirror Markdown non richiama la fonte curricolare corrente');
assert(mirror.includes(source.sha256), 'il mirror Markdown non richiama l’impronta della fonte corrente');
assert(mirror.includes(`CCO \`1.3.0\``), 'il mirror Markdown non dichiara la versione CCO corrente');
assert(mirror.includes('NOT_AUTHORIZED'), 'il mirror Markdown deve rendere visibile il blocco di promozione canonica');

console.log('REG-CURR-00_ALIGNMENT_PASS');
console.log(`Curriculum source: ${source.title}`);
console.log(`Arena product baseline: PR #${baseline.pr} @ ${baseline.product_head}`);
console.log(`CCO: ${cco.version}; surfaces: ${surfaces.version}`);
