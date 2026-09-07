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
  assert(registry.version === '1.0.11', 'versione registro prodotto 1.0.11');
  assert(registry.product_vision?.id === 'ARENA-PRODUCT-VISION', 'vision id canonico');
  assert(registry.product_vision?.version === '1.0.0', 'vision version canonica');
  assert(registry.product_vision?.drive_file_id === '1s17jJCslSIJIXQfiTEzyRcD5q-Baopj6-l14aaFEWik', 'Drive ID vision canonica');
  assert(registry.lifecycle_contract?.id === 'CURRICULUM_LIFECYCLE', 'lifecycle id canonico');
  assert(registry.lifecycle_contract?.version === '1.2.0', 'lifecycle version canonica');

  const lifecycle = readJson(registry.lifecycle_contract.path);
  assert(lifecycle.version === registry.lifecycle_contract.version, 'lifecycle version allineata al registro');
  assert(him.curriculum_lifecycle?.version === lifecycle.version, 'HIM allineato alla versione lifecycle');
  assert(lifecycle.canonical_curriculum?.version === '1.3', 'lifecycle punta al master 1.3');
  assert(lifecycle.derived_objects?.includes('RevisionTrigger'), 'RevisionTrigger presente nel lifecycle');
  assert(lifecycle.derived_objects?.includes('CurriculumReviewCase'), 'CurriculumReviewCase presente nel lifecycle');
  assert(lifecycle.derived_objects?.includes('DidacticBinding'), 'DidacticBinding presente nel lifecycle');
  assert(lifecycle.derived_objects?.includes('ImplementationObservation'), 'ImplementationObservation presente nel lifecycle');
  assert(lifecycle.revision_triggers?.practice_signal_requires_aggregation_or_explicit_professional_reason === true, 'PRACTICE_SIGNAL richiede aggregazione o motivazione esplicita');
  assert(lifecycle.revision_triggers?.external_normative_requires_source_qualification === true, 'EXTERNAL_NORMATIVE richiede fonte qualificata');
  assert(lifecycle.revision_triggers?.external_normative_requires_applicability_assessment === true, 'EXTERNAL_NORMATIVE richiede applicabilità');
  assert(lifecycle.revision_triggers?.institute_need_must_remain_explicitly_non_national === true, 'INSTITUTE_NEED resta non nazionale');
  assert(lifecycle.revision_triggers?.periodic_review_must_not_reopen_stable_units_without_reason === true, 'PERIODIC_REVIEW richiede una ragione');
  assert(lifecycle.revision_triggers?.may_open_targeted_review_cases === true, 'RevisionTrigger può alimentare casi mirati');
  assert(lifecycle.revision_triggers?.automatic_curriculum_change_forbidden === true, 'RevisionTrigger non modifica automaticamente il curricolo');
  assert(lifecycle.revision_triggers?.parallel_curriculum_baseline_creation_forbidden === true, 'RevisionTrigger non crea baseline parallele');
  assert(lifecycle.work_session?.share_completion_requires_persisted_current_professional_contribution === true, 'lifecycle vincola SHARE alla persistenza corrente');
  assert(lifecycle.work_session?.compare_stage_fail_closed_without_current_persisted_share === true, 'lifecycle chiude COMPARE in assenza di share corrente');
  assert(JSON.stringify(lifecycle.work_session?.progression) === JSON.stringify(['EXAMINE','SHARE','COMPARE','RECORD_TEAM_OUTCOME']), 'lifecycle conserva i quattro stadi della CurriculumWorkSession');
  assert(lifecycle.didactic_binding?.current_master_not_in_force_requires_draft_planning_reference === true, 'lifecycle qualifica il master non vigente nella progettazione');
  assert(lifecycle.didactic_binding?.copied_curriculum_text_never_inherits_canonical_authority === true, 'lifecycle mantiene non autoritativa la copia didattica');
  assert(lifecycle.practice_review?.student_personal_data_required === false, 'riesame dalla pratica non richiede dati personali degli alunni');
  assert(lifecycle.practice_review?.automatic_curriculum_change_forbidden === true, 'riesame dalla pratica non modifica automaticamente il curricolo');

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
    'CurriculumReviewCase',
    'TeamProfessionalOutcome',
    'DidacticBinding',
    'ImplementationObservation',
    'IL MIO LAVORO · CURRICOLO · PROGETTAZIONE · RIESAME',
    'nuova norma o circolare può riaprire il ciclo',
    '1s17jJCslSIJIXQfiTEzyRcD5q-Baopj6-l14aaFEWik',
    'curriculum-lifecycle.contract.json@1.2.0',
    'ProfessionalContribution` persistito corrisponde alla scheda/versione corrente',
    'riferimento di lavoro per una bozza di progettazione',
    'non acquisiscono autorità canonica'
  ]) assert(vision.includes(token), `vision contiene: ${token}`);

  const ia = readText('docs/04_product_experience/01_INFORMATION_ARCHITECTURE.md');
  for (const token of ['CURRICULUM_LIFECYCLE@1.2.0', 'CurriculumUnit', 'CurriculumReviewCase', 'CurriculumWorkSession', 'RevisionTrigger', 'DidacticBinding', 'ImplementationObservation', 'Fascicolo', 'TeamProfessionalOutcome', "una dichiarazione locale dell'utente non può simulare una condivisione avvenuta", 'DRAFT_PLANNING_REFERENCE', 'snapshot di lavoro']) {
    assert(ia.includes(token), `IA contiene: ${token}`);
  }

  const nav = readText('docs/04_product_experience/02_NAVIGATION_MODEL.md');
  for (const token of ['CURRICULUM_LIFECYCLE@1.2.0', 'IL MIO LAVORO · CURRICOLO · PROGETTAZIONE · RIESAME', 'FASCICOLO', "ESAMINA → CONDIVIDI → CONFRONTA → REGISTRA L'ESITO", 'Azioni istituzionali proiettate', "nessun pulsante di conferma locale può simulare l'avvenuta condivisione", 'FASCICOLO_NAVIGATION_CONVERGENCE', '/fascicolo', '/fonti', 'Riferimento di lavoro', 'DIDACTIC_BINDING']) {
    assert(nav.includes(token), `navigazione contiene: ${token}`);
  }

  const flows = readText('docs/04_product_experience/09_USER_FLOWS.md');
  for (const token of [
    'CURRICULUM_LIFECYCLE@1.2.0',
    'Nuova norma, linea guida, nota o circolare',
    "Esigenza dell'Istituto",
    'Riesame periodico',
    'RevisionTrigger',
    'CurriculumReviewCase',
    'DidacticBinding',
    'ImplementationObservation',
    'la precedente condivisione non abilita più il passaggio successivo',
    'Proiezione corrente del Fascicolo',
    '/fascicolo',
    '/fonti',
    'DRAFT_PLANNING_REFERENCE',
    'DidacticBinding != AdoptionReceipt',
    'Proiezione corrente della qualificazione PRACTICE_SIGNAL',
    'almeno due segnali problematici dello stesso tipo',
    'motivazione professionale esplicita',
    'automaticReviewCaseOpening = false',
    'parallelCurriculumBaselineCreation = false',
    'Proiezione corrente delle altre cause RevisionTrigger',
    'Valuta l’impatto sul curricolo',
    'una fonte personale o soltanto verificata localmente non può essere promossa implicitamente a fonte normativa',
    'il semplice decorso del tempo non riapre unità stabili',
    'non viene introdotta alcuna nuova route o superficie primaria',
    "Proiezione corrente dell'apertura mirata di CurriculumReviewCase",
    'readiness fail-closed',
    'professionalValidationState = NOT_STARTED',
    'contributi personali e decisioni di riesami precedenti non vengono riportati automaticamente',
    'RevisionTrigger qualificato != CurriculumReviewCase aperto != nuova CurriculumWorkSession case-scoped'
  ]) assert(flows.includes(token), `user flow contiene: ${token}`);

  const ccoDocs = readText('docs/04_product_experience/11_OPERATIONAL_COMMUNICATION_CONTRACT.md');
  for (const token of ['Versione:** 1.4.1', 'CURRICULUM_LIFECYCLE@1.2.0', 'Registro superfici:** 1.5.1', 'CCO-R5 — condivisione persistita prima del confronto', 'CCO-R6 — confronto ed esito come stadi distinti della stessa sessione']) {
    assert(ccoDocs.includes(token), `CCO docs contiene: ${token}`);
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
  const requiredTrueStates = [
    'vision_defined',
    'lifecycle_contract_validated',
    'revision_trigger_governance_defined',
    'target_information_architecture_defined',
    'target_navigation_defined',
    'critical_flows_defined',
    'curriculum_work_session_convergence_started',
    'curriculum_work_session_single_progression_implemented',
    'legacy_revision_tabs_removed_from_primary_flow',
    'coordinator_personal_contribution_precedes_team_comparison',
    'persisted_current_professional_contribution_gates_comparison',
    'local_personal_change_invalidates_previous_share_completion',
    'team_contribution_publisher_integrated_with_work_session_state',
    'team_comparison_integrated_with_work_session_state',
    'team_outcome_recording_is_distinct_work_session_stage',
    'team_coordination_workspace_no_longer_primary_competing_surface',
    'teacher_after_share_sees_status_not_coordination_actions',
    'fascicolo_secondary_navigation_implemented',
    'fonti_removed_from_primary_navigation',
    'mobile_primary_navigation_excludes_fascicolo',
    'fascicolo_public_route_is_canonical',
    'legacy_fonti_and_settings_routes_remain_compatibility_aliases',
    'home_journey_does_not_model_sources_or_institutional_decision_as_universal_stages',
    'didactic_binding_domain_model_implemented',
    'didactic_binding_context_key_used_until_native_unit_id_resolution',
    'annual_planning_binding_persisted',
    'uda_binding_persisted',
    'didactic_binding_authority_boundary_visible',
    'working_master_binding_is_draft_reference_not_adoption',
    'implementation_observation_domain_model_implemented',
    'implementation_observation_persisted_with_uda',
    'implementation_observation_requires_curriculum_binding',
    'implementation_observation_requires_personal_data_absence_confirmation',
    'implementation_observation_never_changes_curriculum_automatically',
    'practice_signal_aggregation_available',
    'practice_revision_trigger_qualification_implemented',
    'practice_revision_trigger_persisted_in_arena_state',
    'practice_revision_trigger_requires_aggregation_or_explicit_reason',
    'practice_revision_trigger_references_current_master_and_unit',
    'practice_revision_trigger_reenters_at_applicable_curriculum',
    'practice_revision_trigger_never_opens_review_case_automatically',
    'practice_revision_trigger_never_changes_curriculum_automatically',
    'practice_revision_trigger_never_creates_parallel_baseline',
    'external_normative_trigger_domain_implemented',
    'external_normative_trigger_requires_qualified_source_and_applicability',
    'external_normative_trigger_ux_implemented',
    'external_normative_trigger_reuses_fascicolo_to_revision_flow',
    'institute_need_trigger_domain_implemented',
    'institute_need_trigger_remains_explicitly_non_national',
    'institute_need_trigger_ux_implemented',
    'institute_need_trigger_reuses_revision_surface',
    'periodic_review_trigger_domain_implemented',
    'periodic_review_trigger_requires_explicit_reason',
    'periodic_review_trigger_ux_implemented',
    'periodic_review_trigger_reuses_revision_surface',
    'all_revision_trigger_origins_share_current_master_scope_and_no_automatic_consequences',
    'revision_trigger_single_existing_surface_integration_implemented',
    'revision_trigger_ux_implemented',
    'curriculum_review_case_domain_model_implemented',
    'curriculum_review_case_persisted_in_arena_state',
    'curriculum_review_case_requires_qualified_trigger',
    'curriculum_review_case_requires_current_master_and_unit_match',
    'curriculum_review_case_requires_explicit_target_selection',
    'curriculum_review_case_requires_explicit_scope_reason',
    'curriculum_review_case_target_scope_frozen',
    'curriculum_review_case_reenters_at_applicable_curriculum',
    'curriculum_review_case_professional_validation_not_auto_started',
    'curriculum_review_case_previous_contributions_not_reused',
    'curriculum_review_case_previous_decisions_not_carried_forward',
    'curriculum_review_case_never_changes_curriculum_automatically',
    'curriculum_review_case_never_creates_team_outcome_automatically',
    'curriculum_review_case_never_creates_institutional_decision_automatically',
    'curriculum_review_case_never_promotes_master_automatically',
    'curriculum_review_case_never_creates_parallel_baseline',
    'curriculum_review_case_ux_implemented',
    'curriculum_review_case_reuses_revision_surface'
  ];
  for (const key of requiredTrueStates) assert(state[key] === true, `stato prodotto attivo: ${key}`);
  assert(state.revision_trigger_new_primary_surface_created === false, 'nessuna nuova superficie primaria per RevisionTrigger');
  assert(state.targeted_review_case_work_session_case_scoping_implemented === false, 'la nuova sessione case-scoped non deve essere anticipata');
  assert(state.target_ui_fully_implemented === false, 'la documentazione non simula UI target già implementata');
  assert(state.human_end_to_end_pilot_complete === false, 'la documentazione non simula pilota umano concluso');
}

for (const item of passes) console.log(`PASS ${item}`);
if (failures.length) {
  for (const item of failures) console.error(`PRODUCT_DOCUMENTATION_FAIL: ${item}`);
  process.exit(1);
}
console.log('PRODUCT_DOCUMENTATION_PASS');