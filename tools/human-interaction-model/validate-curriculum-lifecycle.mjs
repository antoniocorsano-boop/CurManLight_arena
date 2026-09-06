import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const readJson = (p) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const fail = (message) => {
  console.error(`CURRICULUM_LIFECYCLE_FAIL: ${message}`);
  process.exit(1);
};
const assert = (condition, message) => { if (!condition) fail(message); };

const him = readJson('.human/him.config.json');
assert(him.requirements?.curriculum_lifecycle_contract_required === true, 'HIM non richiede il contratto del ciclo curricolare');
const contractPath = him.curriculum_lifecycle?.contract;
assert(contractPath === '.human/curriculum-lifecycle.contract.json', 'riferimento al contratto curricolare inatteso');
const contract = readJson(contractPath);

assert(contract.contract_id === 'CURRICULUM_LIFECYCLE', 'contract_id inatteso');
assert(/^1\./.test(contract.version ?? ''), 'versione contratto non 1.x');
assert(contract.institutional_source?.drive_file_id === '1M8LriHG1zASUq7jE2xiyJfvX4gVnnmZNmYBrrfYS7fE', 'ARENA-UX-01 non collegato');
assert(contract.canonical_curriculum?.id === 'CAN-CURR-MASTER-00', 'master canonico inatteso');
assert(contract.canonical_curriculum?.version === '1.3', 'contratto non allineato al master 1.3');
assert(contract.canonical_curriculum?.curriculum_in_force === false, 'il contratto non può dichiarare il curricolo vigente');
assert(contract.canonical_curriculum?.human_professional_validation === 'OPEN', 'validazione professionale anticipata');

const expectedPhases = [
  'H1_APPLICABLE_CURRICULUM',
  'H2_PROFESSIONAL_VALIDATION',
  'H3_VERTICAL_REVIEW',
  'H4_INSTITUTIONAL_PROCESS',
  'H5_DIDACTIC_USE',
  'H6_PRACTICE_REVIEW',
];
assert(Array.isArray(contract.human_cycle), 'human_cycle mancante');
assert(JSON.stringify(contract.human_cycle.map((phase) => phase.id)) === JSON.stringify(expectedPhases), 'le sei fasi umane non coincidono con il ciclo canonico');
for (const phase of contract.human_cycle) {
  assert(Boolean(phase.label), `label mancante per ${phase.id}`);
  assert(Boolean(phase.human_question), `domanda umana mancante per ${phase.id}`);
  assert(Boolean(phase.output), `output mancante per ${phase.id}`);
}

assert(contract.navigation_invariants?.sources_are_not_a_primary_human_phase === true, 'le fonti possono tornare fase primaria');
assert(contract.navigation_invariants?.institutional_decision_is_role_and_state_projected_not_universal_navigation === true, 'decisione istituzionale esposta universalmente');
assert(contract.navigation_invariants?.technical_pipeline_ids_forbidden_at_teacher_level_1 === true, 'pipeline tecnica esponibile al livello docente');
assert(JSON.stringify(contract.primary_navigation) === JSON.stringify(['IL_MIO_LAVORO', 'CURRICOLO', 'PROGETTAZIONE', 'RIESAME']), 'navigazione primaria non canonica');
assert(Array.isArray(contract.secondary_navigation) && contract.secondary_navigation.includes('FASCICOLO'), 'Fascicolo non subordinato');

for (const boundary of [
  'individual_contribution_is_not_team_outcome',
  'team_professional_outcome_is_not_institutional_decision',
  'institutional_decision_is_not_adoption_until_recorded',
  'technical_pass_never_advances_human_or_institutional_state',
]) {
  assert(contract.authority_boundaries?.[boundary] === true, `confine di autorità mancante: ${boundary}`);
}

assert(contract.derived_objects?.includes('TeamProfessionalOutcome'), 'esito professionale del team non modellato esplicitamente');
assert(contract.derived_objects?.includes('DidacticBinding'), 'DidacticBinding mancante');
assert(contract.derived_objects?.includes('ImplementationObservation'), 'ImplementationObservation mancante');

const work = contract.work_session ?? {};
assert(work.name === 'CurriculumWorkSession', 'sessione curricolare unificata non definita');
assert(JSON.stringify(work.progression) === JSON.stringify(['EXAMINE', 'SHARE', 'COMPARE', 'RECORD_TEAM_OUTCOME']), 'progressione della sessione non canonica');
for (const key of ['single_dominant_stage', 'completed_stage_compacts', 'future_stage_hidden_until_relevant', 'scrolling_is_not_progression', 'duplicate_progress_hierarchies_forbidden']) {
  assert(work[key] === true, `invariante sessione mancante: ${key}`);
}

const binding = contract.didactic_binding ?? {};
assert(binding.must_reference_curriculum_unit_identity_and_version === true, 'binding didattico non vincolato a identità/versione');
assert(binding.must_not_copy_curriculum_as_new_source_of_truth === true, 'la progettazione può duplicare la verità curricolare');
assert(binding.planning_coverage_is_not_teacher_performance_score === true, 'copertura pianificazione interpretabile come scoring docente');
assert(binding.educazione_civica_hours_require_real_activity_binding === true, 'ore Educazione civica non vincolate ad attività reali');
assert(binding.ai_literacy_counts_as_civic_only_with_explicit_civic_result === true, 'AI literacy confusa con ore civiche');

const practice = contract.practice_review ?? {};
assert(practice.student_personal_data_required === false, 'riesame curricolare richiede impropriamente dati personali degli alunni');
assert(practice.automatic_curriculum_change_forbidden === true, 'osservazioni dalla pratica possono modificare automaticamente il curricolo');
assert(practice.aggregation_may_create_targeted_review_case === true, 'riesame dalla pratica non alimenta revisioni mirate');

assert(contract.quality_metrics?.pedagogical_quality_score_forbidden === true, 'scoring pedagogico automatico non vietato');
assert(contract.quality_metrics?.teacher_ranking_forbidden === true, 'ranking docenti non vietato');
assert(contract.promotion?.design_contract_is_not_institutional_curriculum_validation === true, 'contratto prodotto confuso con validazione curricolare');
assert(contract.promotion?.design_contract_is_not_curriculum_adoption === true, 'contratto prodotto confuso con adozione');
assert(contract.promotion?.beta_promotion_requires_human_pilot === true, 'promozione Beta non richiede pilota umano');

console.log('CURRICULUM_LIFECYCLE_PASS');
