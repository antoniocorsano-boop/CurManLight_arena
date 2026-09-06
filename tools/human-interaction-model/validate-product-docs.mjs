import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const readText = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const readJson = (p) => JSON.parse(readText(p));
const failures = [];
const passes = [];
const fail = (m) => failures.push(m);
const pass = (m) => passes.push(m);
const assert = (condition, message) => condition ? pass(message) : fail(message);

const him = readJson('.human/him.config.json');
const registryPath = him.product_documentation?.registry;
if (!registryPath) fail('product_documentation.registry mancante in him.config.json');

let registry;
try {
  registry = readJson(registryPath);
} catch (error) {
  fail(`impossibile leggere il registro documentazione prodotto: ${error.message}`);
}

if (registry) {
  assert(registry.registry_id === 'ARENA-PRODUCT-DOCS', 'registry_id prodotto corretto');
  assert(registry.version === '1.0.2', 'versione registro prodotto 1.0.2');
  assert(registry.product_vision?.id === 'ARENA-PRODUCT-VISION', 'vision id canonico');
  assert(registry.product_vision?.version === '1.0.0', 'vision version canonica');
  assert(registry.product_vision?.drive_file_id === '1s17jJCslSIJIXQfiTEzyRcD5q-Baopj6-l14aaFEWik', 'Drive ID vision canonica');
  assert(registry.lifecycle_contract?.id === 'CURRICULUM_LIFECYCLE', 'lifecycle id canonico');
  assert(registry.lifecycle_contract?.version === '1.1.0', 'lifecycle version canonica');

  const lifecycle = readJson(registry.lifecycle_contract.path);
  assert(lifecycle.version === registry.lifecycle_contract.version, 'lifecycle version allineata al registro');
  assert(him.curriculum_lifecycle?.version === lifecycle.version, 'HIM allineato alla versione lifecycle');
  assert(lifecycle.canonical_curriculum?.version === '1.3', 'lifecycle punta al master 1.3');
  assert(lifecycle.derived_objects?.includes('RevisionTrigger'), 'RevisionTrigger presente nel lifecycle');
  assert(lifecycle.revision_triggers?.automatic_curriculum_change_forbidden === true, 'RevisionTrigger non modifica automaticamente il curricolo');
  assert(lifecycle.revision_triggers?.parallel_curriculum_baseline_creation_forbidden === true, 'RevisionTrigger non crea baseline parallele');

  const canonical = registry.canonical_documents ?? [];
  const requiredRoles = ['PRODUCT_VISION', 'INFORMATION_ARCHITECTURE', 'NAVIGATION_MODEL', 'CRITICAL_USER_FLOWS', 'OPERATIONAL_COMMUNICATION'];
  for (const role of requiredRoles) assert(canonical.some((d) => d.role === role), `documento canonico presente: ${role}`);
  for (const doc of canonical) {
    try {
      readText(doc.path);
      pass(`documento leggibile: ${doc.path}`);
    } catch {
      fail(`documento mancante: ${doc.path}`);
    }
  }

  const vision = readText('docs/04_product_experience/00_VISION.md');
  for (const token of [
    'ARENA-PRODUCT-VISION',
    'RevisionTrigger',
    'CurriculumUnit',
    'TeamProfessionalOutcome',
    'DidacticBinding',
    'ImplementationObservation',
    'IL MIO LAVORO · CURRICOLO · PROGETTAZIONE · RIESAME',
    'nuova norma o circolare può riaprire il ciclo',
    '1s17jJCslSIJIXQfiTEzyRcD5q-Baopj6-l14aaFEWik',
    'curriculum-lifecycle.contract.json@1.1.0'
  ]) assert(vision.includes(token), `vision contiene: ${token}`);

  const ia = readText('docs/04_product_experience/01_INFORMATION_ARCHITECTURE.md');
  for (const token of ['CURRICULUM_LIFECYCLE@1.1.0', 'CurriculumUnit', 'CurriculumWorkSession', 'RevisionTrigger', 'DidacticBinding', 'Fascicolo', 'TeamProfessionalOutcome']) {
    assert(ia.includes(token), `IA contiene: ${token}`);
  }

  const nav = readText('docs/04_product_experience/02_NAVIGATION_MODEL.md');
  for (const token of ['CURRICULUM_LIFECYCLE@1.1.0', 'IL MIO LAVORO · CURRICOLO · PROGETTAZIONE · RIESAME', 'FASCICOLO', 'ESAMINA → CONDIVIDI → CONFRONTA → REGISTRA L\'ESITO', 'Azioni istituzionali proiettate']) {
    assert(nav.includes(token), `navigazione contiene: ${token}`);
  }

  const flows = readText('docs/04_product_experience/09_USER_FLOWS.md');
  for (const token of ['CURRICULUM_LIFECYCLE@1.1.0', 'Nuova norma, linea guida, nota o circolare', "Esigenza dell'Istituto", 'RevisionTrigger', 'DidacticBinding', 'ImplementationObservation']) {
    assert(flows.includes(token), `user flow contiene: ${token}`);
  }

  const forbiddenStale = [
    '6 ruoli utente',
    'file .cml dipartimentale',
    'Revisione (Gap 2025)',
    'votare ogni raccordo come approvato/rifiutato/personalizzato'
  ];
  for (const stale of forbiddenStale) {
    for (const p of [
      'docs/04_product_experience/00_VISION.md',
      'docs/04_product_experience/01_INFORMATION_ARCHITECTURE.md',
      'docs/04_product_experience/02_NAVIGATION_MODEL.md',
      'docs/04_product_experience/09_USER_FLOWS.md'
    ]) assert(!readText(p).includes(stale), `nessun concetto legacy canonico in ${p}: ${stale}`);
  }

  const rules = registry.update_rules ?? {};
  for (const key of [
    'product_governance_change_requires_vision_review',
    'lifecycle_change_requires_vision_ia_navigation_flows_review',
    'primary_navigation_change_requires_navigation_and_flows_update',
    'canonical_object_change_requires_vision_ia_flows_update',
    'authority_boundary_change_requires_vision_ia_flows_and_cco_review',
    'didactic_binding_change_requires_vision_ia_and_flows_update',
    'revision_trigger_change_requires_vision_ia_and_flows_update',
    'implementation_snapshot_never_overrides_product_direction',
    'drive_and_repo_product_vision_identity_must_match',
    'ci_must_fail_on_canonical_document_drift'
  ]) assert(rules[key] === true, `regola manutenzione documentale attiva: ${key}`);

  const state = registry.implementation_state ?? {};
  assert(state.vision_defined === true, 'visione definita');
  assert(state.lifecycle_contract_validated === true, 'lifecycle validato');
  assert(state.revision_trigger_governance_defined === true, 'governo RevisionTrigger definito');
  assert(state.curriculum_work_session_convergence_started === true, 'convergenza CurriculumWorkSession registrata');
  assert(state.curriculum_work_session_single_progression_implemented === true, 'progressione unica CurriculumWorkSession registrata');
  assert(state.legacy_revision_tabs_removed_from_primary_flow === true, 'tab legacy rimossi dal flusso primario');
  assert(state.coordinator_personal_contribution_precedes_team_comparison === true, 'contributo personale del coordinatore precede il confronto');
  assert(state.target_ui_fully_implemented === false, 'la documentazione non simula UI target già implementata');
  assert(state.human_end_to_end_pilot_complete === false, 'la documentazione non simula pilota umano concluso');
}

for (const item of passes) console.log(`PASS ${item}`);
if (failures.length) {
  for (const item of failures) console.error(`PRODUCT_DOCUMENTATION_FAIL: ${item}`);
  process.exit(1);
}
console.log('PRODUCT_DOCUMENTATION_PASS');
