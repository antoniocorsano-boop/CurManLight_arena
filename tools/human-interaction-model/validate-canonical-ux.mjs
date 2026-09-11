import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const readText = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const readJson = (p) => JSON.parse(readText(p));
const failures = [];
const assert = (condition, message) => { if (!condition) failures.push(message); };

const contract = readJson('.human/arena-ux.contract.json');
const registry = readJson('docs/04_product_experience/PRODUCT_DOCS.registry.json');
const doc = readText('docs/04_product_experience/12_CANONICAL_UX_CONTRACT.md');
const vision = readText('docs/04_product_experience/00_VISION.md');
const navigation = readText('docs/04_product_experience/02_NAVIGATION_MODEL.md');

assert(contract.contract_id === 'ARENA_UX_CONTRACT', 'contract_id UX inatteso');
assert(contract.version === '1.0.0', 'versione ARENA_UX_CONTRACT inattesa');
assert(contract.status === 'CANONICAL_UX_CONTRACT', 'stato UX non canonico');

const primaryIds = (contract.primary_navigation ?? []).map((item) => item.id);
const primaryLabels = (contract.primary_navigation ?? []).map((item) => item.label);
assert(JSON.stringify(primaryIds) === JSON.stringify(['my_work', 'curriculum', 'planning', 'review']), 'navigazione primaria UX non canonica');
assert(JSON.stringify(primaryLabels) === JSON.stringify(['Il mio lavoro', 'Curricolo', 'Progettazione', 'Riesame']), 'etichette navigazione primaria UX non canoniche');
assert(vision.includes('IL MIO LAVORO · CURRICOLO · PROGETTAZIONE · RIESAME'), 'Visione non allineata alla navigazione primaria');
assert(navigation.includes('IL MIO LAVORO · CURRICOLO · PROGETTAZIONE · RIESAME'), 'Navigation Model non allineato alla navigazione primaria');

const global = contract.global_invariants ?? {};
for (const key of [
  'one_environment_one_intent',
  'one_control_one_meaning',
  'one_dominant_object_per_context',
  'one_primary_action_per_task_context',
  'preserve_context_across_handoffs',
  'document_is_subordinate_projection',
  'technical_traceability_not_level_1',
  'authority_fails_closed',
  'back_restores_previous_context',
  'no_duplicate_user_facing_surface_for_same_task',
  'implementation_snapshot_never_overrides_canonical_ux',
]) assert(global[key] === true, `invariante UX mancante: ${key}`);

const curriculum = contract.curriculum ?? {};
assert(curriculum.intent === 'consultation', 'Curricolo non fissato alla consultazione');
assert(curriculum.default_projection === 'explore', 'Esplora non è la proiezione predefinita');
assert(JSON.stringify(curriculum.projections) === JSON.stringify(['explore', 'trama', 'document']), 'proiezioni Curricolo inattese');
assert(curriculum.annuality_selector_semantics === 'changes_only_the_consulted_annuality', 'selettore annualità non univoco');
assert(curriculum.review_state_must_not_select_annuality === true, 'stato Riesame può ancora selezionare annualità Curricolo');
assert(curriculum.review_availability_must_not_disable_annuality === true, 'disponibilità Riesame può ancora disabilitare annualità Curricolo');
assert(curriculum.selectors_must_derive_from_canonical_curriculum_data === true, 'selettori Curricolo non vincolati ai dati canonici');
assert(curriculum.hardcoded_discipline_to_section_mapping_forbidden_as_target_architecture === true, 'mappa disciplina→sezione hard-coded non vietata come target');
assert(curriculum.ordinary_mobile_consultation_must_not_depend_on_horizontal_tables === true, 'consultazione mobile può dipendere da tabelle orizzontali');

const expectedActions = {
  trama: 'Vedi nella Trama',
  planning: 'Usa in Progettazione',
  review: 'Segnala per il Riesame',
  source: 'Vedi fonte',
  document: 'Apri Documento',
};
assert(JSON.stringify(curriculum.contextual_actions) === JSON.stringify(expectedActions), 'azioni contestuali CurriculumUnit non canoniche');
for (const label of Object.values(expectedActions)) assert(doc.includes(label), `contratto umano non documenta: ${label}`);

const trama = contract.trama ?? {};
assert(trama.editor === false, 'Trama non deve essere un editor');
assert(trama.inference_engine === false, 'Trama non deve essere un motore libero di inferenza');
assert(trama.relations_must_be_typed_and_traceable === true, 'relazioni Trama non vincolate a tipo/provenienza');
assert(trama.unknown_relations_fail_closed === true, 'Trama non è fail-closed');
assert(trama.mobile_requires_pan_zoom === false, 'Trama mobile richiede pan/zoom');
assert(trama.mobile_vertical_fallback_required === true, 'fallback verticale Trama non richiesto');

const review = contract.review ?? {};
assert(review.separate_from_curriculum_consultation === true, 'Riesame non separato dalla consultazione');
assert(review.entry_requires_explicit_intent === true, 'ingresso Riesame non richiede intenzione esplicita');
assert(review.review_case_availability_must_not_change_curriculum_readability === true, 'disponibilità caso Riesame altera la leggibilità Curricolo');

const mobile = contract.mobile ?? {};
assert(JSON.stringify(mobile.primary_navigation) === JSON.stringify(['my_work', 'curriculum', 'planning', 'review']), 'bottom navigation mobile non canonica');
assert(mobile.curriculum_explore_uses_semantic_cards === true, 'Esplora mobile non vincolato a schede semantiche');
assert(mobile.page_level_horizontal_overflow_forbidden === true, 'overflow orizzontale pagina non vietato');
assert(Number(mobile.touch_target_min_px) >= 44, 'target touch minimo inferiore a 44px');
assert(mobile.trama_must_be_understandable_without_pan_zoom === true, 'Trama mobile non garantita senza pan/zoom');
assert(mobile.desktop_compression_is_not_an_acceptable_mobile_strategy === true, 'desktop compresso ancora ammesso come strategia mobile');

const registryUx = registry.ux_contract ?? {};
assert(registryUx.id === 'ARENA_UX_CONTRACT', 'registro prodotto non punta al contratto UX');
assert(registryUx.version === '1.0.0', 'registro prodotto non punta alla versione UX 1.0.0');
assert(registryUx.path === '.human/arena-ux.contract.json', 'path macchina UX non registrato');
assert(registryUx.human_path === 'docs/04_product_experience/12_CANONICAL_UX_CONTRACT.md', 'path umano UX non registrato');
assert(registryUx.status === 'CANONICAL_UX_CONTRACT', 'stato UX nel registro non canonico');
assert((registry.canonical_documents ?? []).some((item) => item.role === 'CANONICAL_UX_CONTRACT' && item.path === registryUx.human_path), 'documento UX non registrato tra i canonici');
assert(registry.update_rules?.ux_contract_change_requires_navigation_and_flows_review === true, 'manca regola manutenzione contratto UX');
assert(registry.update_rules?.curriculum_interaction_change_requires_ux_contract_review === true, 'manca regola review UX per cambi interazione Curricolo');
assert(registry.implementation_state?.canonical_ux_contract_defined === true, 'stato prodotto non registra contratto UX canonico');
assert(registry.implementation_state?.canonical_ux_contract_machine_readable === true, 'stato prodotto non registra contratto UX macchina');
assert(registry.implementation_state?.curriculum_explore_trama_must_conform_to_ux_contract === true, 'Esplora+Trama non subordinata al contratto UX');

const prohibited = contract.implementation_prohibitions ?? [];
for (const rule of [
  'do_not_use_review_target_class_to_choose_curriculum_annuality',
  'do_not_disable_curriculum_annuality_because_review_is_unavailable',
  'do_not_hardcode_target_discipline_catalog_from_document_section_numbers',
  'do_not_make_document_sequence_the_default_curriculum_navigation',
  'do_not_expose_internal_governance_codes_in_level_1_teacher_copy',
  'do_not_create_graph_edges_without_recorded_or_validated_relation_evidence',
  'do_not_duplicate_review_controls_inside_curriculum_consultation',
  'do_not_use_technical_pass_as_human_acceptance',
]) assert(prohibited.includes(rule), `divieto implementativo UX mancante: ${rule}`);

for (const scenario of ['UX-CURR-01', 'UX-CURR-02', 'UX-CURR-03', 'UX-CURR-04']) {
  assert((contract.acceptance_scenarios ?? []).some((item) => item.id === scenario), `scenario di accettazione UX mancante: ${scenario}`);
  assert(doc.includes(scenario), `contratto umano non documenta scenario ${scenario}`);
}

if (failures.length) {
  for (const failure of failures) console.error(`CANONICAL_UX_FAIL: ${failure}`);
  process.exit(1);
}

console.log('CANONICAL_UX_PASS');
