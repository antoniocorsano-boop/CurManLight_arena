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
const him = readJson('.human/him.config.json');
const mirror = readText('docs/curriculum/REG-CURR-00_MASTER_ALIGNMENT.md');
const currentSourceDomain = readText('src/domain/curriculum/institute/currentSource.ts');
const canonicalFontiWorkspace = readText('src/features/documents/components/FontiWorkspace.tsx');
const technologyPilotDomain = readText('src/domain/curriculum/validation/technologyClass1Review.ts');
const revisionSurface = readText('src/features/curriculum/components/RevisioneTab.tsx');
const progressHook = readText('src/features/curriculum/hooks/useCurriculumProgressStats.ts');

assert(registry.registry_id === 'REG-CURR-00', 'registry_id deve essere REG-CURR-00');
assert(registry.version === '1.4.0', 'versione del registro inattesa');

const source = registry.drive?.current_curriculum_source;
assert(source, 'fonte curricolare corrente assente');
assert(source.title === 'CURRICOLO_VERTICALE_CORRETTO_PROPOSTA_2026-09-03.docx', 'titolo della fonte curricolare corrente non canonico');
assert(source.file_id === '1DPdK_EIZsE3lI-LIzTJG776cU1PcAcnf', 'Drive file ID della fonte curricolare corrente inatteso');
assert(/^[a-f0-9]{64}$/.test(source.sha256), 'SHA-256 della fonte curricolare corrente mancante o invalido');
assert(source.status === 'PROPOSTA_D_ISTITUTO_DA_VALIDARE', 'la fonte corretta non deve essere promossa implicitamente oltre lo stato di proposta da validare');

assert(currentSourceDomain.includes(source.title), 'il dominio non usa il titolo della fonte curricolare corrente');
assert(currentSourceDomain.includes(source.file_id), 'il dominio non usa il Drive file ID della fonte corrente');
assert(currentSourceDomain.includes(source.sha256), 'il dominio non usa lo SHA-256 della fonte corrente');
assert(currentSourceDomain.includes("lifecycleState: 'PROPOSAL_PENDING_HUMAN_VALIDATION'"), 'il dominio deve mantenere la fonte corrente come proposta in attesa di validazione umana');
assert(currentSourceDomain.includes("role: 'HISTORICAL_TECHNICAL_BASELINE'"), 'la ricostruzione v3 deve restare soltanto precedente tecnico storico');
assert(currentSourceDomain.includes('canonicalPromotionAuthorized: false'), 'il dominio non può autorizzare promozione canonica automatica');
assert(canonicalFontiWorkspace.includes('<InstituteCurrentSourcePanel />'), 'Fonti deve mostrare la fonte curricolare corrente');
assert(!canonicalFontiWorkspace.includes('<InstituteSourceReviewPanel />'), 'Fonti non deve riaprire il vecchio workbench di remediation come flusso canonico');
assert(!canonicalFontiWorkspace.includes('<InstituteSourceChangeTracePanel />'), 'Fonti non deve presentare la traccia locale v3 come stato corrente della fonte');
assert(registry.source_logic?.status === 'ALIGNED_TO_CORRECTED_SOURCE', 'REG-CURR-00 deve dichiarare la logica sorgente allineata alla fonte corretta');
assert(registry.source_logic?.historical_remediation_workbench_active_in_canonical_surface === false, 'il vecchio workbench di remediation non può essere attivo nella superficie canonica');

const baseline = registry.arena_product_baseline;
assert(baseline?.pr === 198, 'la baseline operativa corrente deve restare esplicitamente identificata');
assert(baseline?.branch === 'feature/team-meeting-workspace', 'branch della baseline Arena inatteso');
assert(baseline?.product_head === '2317b57fef35695f0c8373208d5b5f4898671478', 'product head registrato non coincide con la baseline funzionale R2 del pilota Tecnologia');
assert(baseline?.cco_version === cco.version, `CCO disallineato: REG-CURR-00=${baseline?.cco_version} repository=${cco.version}`);
assert(baseline?.cco_surfaces_version === surfaces.version, `registro superfici CCO disallineato: REG-CURR-00=${baseline?.cco_surfaces_version} repository=${surfaces.version}`);

const pilot = registry.active_validation_pilot;
assert(pilot?.pilot_id === 'TEC-SEC1-2026-01', 'pilot Tecnologia non registrato');
assert(pilot?.revision === 2, 'la revisione attiva del pilot deve essere R2');
assert(pilot?.discipline === 'Tecnologia' && pilot?.order === 'secondaria' && pilot?.class_label === 'Classe prima', 'contesto del pilot Tecnologia inatteso');
assert(pilot?.status === 'READY_FOR_HUMAN_DISCIPLINE_REVIEW', 'il pilot deve essere pronto per il riesame umano');
assert(pilot?.human_outcome === 'OPEN', 'un esito umano non può essere simulato dal repository');
assert(pilot?.review_card_count === 5, 'il pilot Tecnologia deve esporre cinque decisioni reali');
assert(pilot?.canonical_promotion === 'NOT_AUTHORIZED', 'il pilot non può autorizzare promozione canonica');
assert(pilot?.decision_carry_forward === 'NOT_AUTHORIZED', 'le decisioni R1 non possono essere trasferite automaticamente alla R2');
assert(pilot?.implementation_head === baseline.product_head, 'pilot e baseline funzionale devono usare lo stesso implementation head');

const activeR2Ids = [
  'tec-sec1-2026-r2-n1',
  'tec-sec1-2026-r2-n2',
  'tec-sec1-2026-r2-n3',
  'tec-sec1-2026-r2-n4',
  'tec-sec1-2026-r2-verticalita',
];
const historicalR1Ids = [
  'tec-sec1-2026-n1',
  'tec-sec1-2026-n2',
  'tec-sec1-2026-n3',
  'tec-sec1-2026-n4',
  'tec-sec1-2026-verticalita',
];
assert(JSON.stringify(pilot?.active_proposal_ids) === JSON.stringify(activeR2Ids), 'gli ID attivi R2 del pilot non coincidono con REG-CURR-00');
assert(pilot?.previous_revision?.revision === 1, 'la revisione R1 deve restare registrata come precedente');
assert(pilot?.previous_revision?.status === 'SUPERSEDED_INSTRUCTIONAL_TEXT_PRESERVED', 'la R1 deve restare preservata come storico semantico');
assert(JSON.stringify(pilot?.previous_revision?.proposal_ids) === JSON.stringify(historicalR1Ids), 'gli ID storici R1 non coincidono con REG-CURR-00');
assert(pilot?.previous_revision?.decision_semantics === 'PRESERVED_AS_HISTORY_ONLY', 'le decisioni R1 devono restare soltanto storiche');

const audit = pilot?.instructional_audit;
assert(audit?.audit_id === 'AUD-CURR-TEC-SEC1-01', 'audit istruttorio Tecnologia non registrato');
assert(audit?.file_id === '1SZ_lmaYXNF2Fx8ro1C-hTh5iUH-riECcqyZtRx9JRPM', 'Drive file ID dell’audit Tecnologia inatteso');
assert(audit?.status === 'CORRECTIONS_APPLIED', 'le correzioni dell’audit devono risultare recepite nella R2');
assert(audit?.instructional_outcome === 'R2_READY_FOR_NEW_HUMAN_REVIEW', 'esito istruttorio R2 inatteso');
assert(audit?.human_outcome === 'OPEN', 'l’audit istruttorio non può chiudere un esito umano');
assert(audit?.canonical_promotion === 'NOT_AUTHORIZED', 'l’audit non può autorizzare promozione canonica');
assert(Array.isArray(audit?.corrections_applied) && audit.corrections_applied.length === 4, 'le quattro correzioni istruttorie recepite devono restare registrate');

const expectedPilotBindings = {
  source: '1DPdK_EIZsE3lI-LIzTJG776cU1PcAcnf',
  proposal: '19nPCsAj_ItBscUwwcHwrVhxDbBy-MXIJ',
  vertical_matrix: '1CMSESN73HCi_2jM_tZYhN9hd6oWzyHgK',
  validation_gate: '1rxKy2IDD5V7l4Nc1LfJeLr407ltfa_vbt_EFK54s7mU',
  decision_register: '1KmnrgWrNxVDUjOvdPo0oibqTvr1lQ72QepBE8KNsdZA',
};
for (const [key, expectedId] of Object.entries(expectedPilotBindings)) {
  assert(pilot?.[key]?.file_id === expectedId, `binding Drive del pilot inatteso: ${key}`);
  assert(technologyPilotDomain.includes(expectedId), `il dominio del pilot non contiene il binding Drive ${key}`);
}
assert(pilot?.proposal?.revision === '1.1' && pilot?.proposal?.updated_in_place === true, 'la proposta Drive corretta deve restare legata alla revisione 1.1 nello stesso file');
assert(pilot?.vertical_matrix?.revision === '1.1' && pilot?.vertical_matrix?.updated_in_place === true, 'la matrice Drive corretta deve restare legata alla revisione 1.1 nello stesso file');
assert(pilot?.work_manifest?.file_id === '1s2qZf53O6BqjgyrtzcXuL5lSdafoAmtAUEFv-4mwcog', 'manifesto operativo Drive del pilot inatteso');
assert(pilot?.work_manifest?.revision === '1.1', 'manifesto operativo del pilot non aggiornato alla R2');

assert(technologyPilotDomain.includes('revision: 2'), 'il dominio del pilot non dichiara la revisione R2');
assert(technologyPilotDomain.includes('decisionCarryForwardAuthorized: false'), 'il dominio deve vietare il carry-forward delle decisioni R1');
assert(technologyPilotDomain.includes("status: 'SUPERSEDED_INSTRUCTIONAL_TEXT_PRESERVED'"), 'il dominio non preserva la R1 come storico');
for (const cardId of activeR2Ids) {
  assert(technologyPilotDomain.includes(`id: '${cardId}'`), `scheda attiva R2 mancante: ${cardId}`);
}
for (const cardId of historicalR1Ids) {
  assert(technologyPilotDomain.includes(`id: '${cardId}'`), `scheda storica R1 mancante: ${cardId}`);
}
assert(technologyPilotDomain.includes('funzionamento essenziale di un sistema informatico'), 'N4 R2 non recepisce il funzionamento strutturale del sistema informatico');
assert(technologyPilotDomain.includes('Internet, Web e servizi'), 'N4 R2 non distingue Internet, Web e servizi');
assert(technologyPilotDomain.includes('Non costituisce un quarto nucleo nazionale autonomo'), 'N4 R2 non esplicita il confine di autorità dei nuclei');
assert(progressHook.includes('resolveOperationalReviewProposals(discipline, order, fallbackCurrent)'), 'la Revisione non usa il resolver del pilot per il contesto corrente');
assert(revisionSurface.includes('current.sourceRefs'), 'la superficie Revisione non espone la provenienza su richiesta');
assert(revisionSurface.includes("current.keepLabel || 'Mantieni precedente'"), 'la superficie non usa l’azione di mantenimento contestuale');

assert(registry.alignment_rules?.instructional_audit_must_not_be_promoted_as_human_outcome === true, 'il registro deve separare audit istruttorio ed esito umano');
assert(registry.alignment_rules?.proposal_text_change_requires_new_proposal_identity === true, 'un testo modificato deve avere una nuova identità di proposta');
assert(registry.alignment_rules?.previous_decision_carry_forward_requires_explicit_authority === true, 'il carry-forward di una decisione precedente deve richiedere autorità esplicita');
assert(cco.principles?.recognition_before_interpretation === true, 'CCO deve mantenere recognition_before_interpretation');
assert(cco.principles?.one_dominant_object_per_task_context === true, 'CCO deve mantenere un solo oggetto dominante per contesto');
assert(cco.layers?.workflow_progression?.scrolling_alone_is_not_a_stage_transition === true, 'CCO deve vietare lo scroll come falsa transizione di stadio');
assert(cco.acceptance?.draft_requires_explicit_commit === true, 'una bozza non può risultare completata senza registrazione esplicita');

const driveRegisterId = registry.drive?.master_register?.file_id;
assert(driveRegisterId === '1IMKwWWukefIDIOsbHQByiXLN7YuU7He0V5b01tjitG4', 'registro maestro Drive inatteso');
assert(him.requirements?.curriculum_alignment_registry_required === true, 'HIM deve richiedere esplicitamente il registro di allineamento curricolare');
assert(him.curriculum_alignment?.registry === 'docs/curriculum/REG-CURR-00.registry.json', 'HIM non punta al registro macchina REG-CURR-00');
assert(him.curriculum_alignment?.documentation === 'docs/curriculum/REG-CURR-00_MASTER_ALIGNMENT.md', 'HIM non punta al mirror documentale REG-CURR-00');
assert(him.curriculum_alignment?.drive_register_id === driveRegisterId, 'HIM e REG-CURR-00 non concordano sul registro maestro Drive');

const downstream = registry.downstream_draft_stacks ?? [];
assert(downstream.length === 2, 'le due catene Draft successive devono restare esplicitamente registrate');
for (const stack of downstream) {
  assert(stack.status === 'NOT_CANONICAL_UNTIL_REALIGNED', `la catena PR ${stack.prs?.join('–')} non può essere trattata come canonica prima del riallineamento`);
}

assert(registry.curriculum_process?.human_professional_validation === 'OPEN', 'la validazione professionale non può essere chiusa senza esito umano registrato');
assert(registry.curriculum_process?.ready_for_collegio === 'NOT_YET', 'READY_FOR_COLLEGIO non è autorizzato nella baseline corrente');
assert(registry.curriculum_process?.canonical_curriculum_promotion === 'NOT_AUTHORIZED', 'la promozione canonica del curricolo non è autorizzata');

assert(mirror.includes(driveRegisterId), 'il mirror Markdown non richiama il registro maestro Drive');
assert(mirror.includes(source.title), 'il mirror Markdown non richiama la fonte curricolare corrente');
assert(mirror.includes(source.sha256), 'il mirror Markdown non richiama l’impronta della fonte corrente');
assert(mirror.includes('REG-CURR-00 — Registro maestro'), 'il mirror Markdown non è quello canonico');
assert(mirror.includes('Versione:** 1.4'), 'il mirror Markdown non dichiara la versione REG-CURR-00 1.4');
assert(mirror.includes('TEC-SEC1-2026-01'), 'il mirror Markdown non richiama il pilot Tecnologia');
assert(mirror.includes('Revisione R2'), 'il mirror Markdown non descrive la revisione R2');
assert(mirror.includes('decisioni R1'), 'il mirror Markdown non preserva esplicitamente le decisioni R1 come storico');
assert(mirror.includes(audit.audit_id), 'il mirror Markdown non richiama l’audit istruttorio Tecnologia');
assert(mirror.includes(audit.file_id), 'il mirror Markdown non richiama il file Drive dell’audit Tecnologia');
assert(mirror.includes(`CCO \`1.3.0\``), 'il mirror Markdown non dichiara la versione CCO corrente');
assert(mirror.includes('NOT_AUTHORIZED'), 'il mirror Markdown deve rendere visibile il blocco di promozione canonica');

console.log('REG-CURR-00_ALIGNMENT_PASS');
console.log(`Curriculum source: ${source.title}`);
console.log(`Arena product baseline: PR #${baseline.pr} @ ${baseline.product_head}`);
console.log(`Active pilot: ${pilot.pilot_id} R${pilot.revision} — ${pilot.status} — human outcome ${pilot.human_outcome}`);
console.log(`Instructional audit: ${audit.audit_id} — ${audit.status} — human outcome ${audit.human_outcome}`);
console.log(`CCO: ${cco.version}; surfaces: ${surfaces.version}`);
console.log(`Drive register: ${driveRegisterId}`);
