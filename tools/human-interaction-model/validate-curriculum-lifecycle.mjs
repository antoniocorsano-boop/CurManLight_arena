import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const readJson = (p) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const readText = (p) => fs.readFileSync(path.join(root, p), 'utf8');
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
assert(contract.version === '1.1.1', 'versione contratto lifecycle inattesa');
assert(him.curriculum_lifecycle?.version === contract.version, 'HIM e lifecycle non hanno la stessa versione');
assert(contract.institutional_source?.drive_file_id === '1M8LriHG1zASUq7jE2xiyJfvX4gVnnmZNmYBrrfYS7fE', 'ARENA-UX-01 non collegato');
assert(contract.institutional_source?.product_vision_drive_file_id === '1s17jJCslSIJIXQfiTEzyRcD5q-Baopj6-l14aaFEWik', 'visione Drive non collegata al lifecycle');
assert(contract.canonical_curriculum?.id === 'CAN-CURR-MASTER-00', 'master canonico inatteso');
assert(contract.canonical_curriculum?.version === '1.3', 'contratto non allineato al master 1.3');
assert(contract.canonical_curriculum?.curriculum_in_force === false, 'il contratto non può dichiarare il curricolo vigente');
assert(contract.canonical_curriculum?.human_professional_validation === 'OPEN', 'validazione professionale anticipata');

const expectedPhases = ['H1_APPLICABLE_CURRICULUM','H2_PROFESSIONAL_VALIDATION','H3_VERTICAL_REVIEW','H4_INSTITUTIONAL_PROCESS','H5_DIDACTIC_USE','H6_PRACTICE_REVIEW'];
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

for (const boundary of ['individual_contribution_is_not_team_outcome','team_professional_outcome_is_not_institutional_decision','institutional_decision_is_not_adoption_until_recorded','technical_pass_never_advances_human_or_institutional_state']) {
  assert(contract.authority_boundaries?.[boundary] === true, `confine di autorità mancante: ${boundary}`);
}
for (const object of ['TeamProfessionalOutcome', 'DidacticBinding', 'ImplementationObservation', 'RevisionTrigger']) {
  assert(contract.derived_objects?.includes(object), `${object} mancante`);
}

const triggers = contract.revision_triggers ?? {};
assert(JSON.stringify(triggers.allowed_types) === JSON.stringify(['EXTERNAL_NORMATIVE', 'INSTITUTE_NEED', 'PRACTICE_SIGNAL', 'PERIODIC_REVIEW']), 'tipi RevisionTrigger inattesi');
for (const key of ['external_normative_requires_source_qualification','external_normative_requires_applicability_assessment','institute_need_must_remain_explicitly_non_national','practice_signal_requires_aggregation_or_explicit_professional_reason','periodic_review_must_not_reopen_stable_units_without_reason','must_reference_current_master_identity_and_version','may_open_targeted_review_cases','automatic_curriculum_change_forbidden','parallel_curriculum_baseline_creation_forbidden']) {
  assert(triggers[key] === true, `invariante RevisionTrigger mancante: ${key}`);
}
assert(triggers.cycle_reentry_phase === 'H1_APPLICABLE_CURRICULUM', 'RevisionTrigger non rientra dal Quadro applicabile');

const work = contract.work_session ?? {};
assert(work.name === 'CurriculumWorkSession', 'sessione curricolare unificata non definita');
assert(JSON.stringify(work.progression) === JSON.stringify(['EXAMINE', 'SHARE', 'COMPARE', 'RECORD_TEAM_OUTCOME']), 'progressione della sessione non canonica');
for (const key of [
  'single_dominant_stage',
  'completed_stage_compacts',
  'future_stage_hidden_until_relevant',
  'scrolling_is_not_progression',
  'duplicate_progress_hierarchies_forbidden',
  'share_completion_requires_persisted_current_professional_contribution',
  'persisted_share_must_match_current_proposal_fingerprint',
  'persisted_share_must_match_current_personal_orientation',
  'persisted_custom_text_must_match_current_personal_text',
  'local_personal_change_invalidates_share_completion',
  'compare_stage_fail_closed_without_current_persisted_share',
]) assert(work[key] === true, `invariante sessione mancante: ${key}`);

const workSessionSource = readText('src/features/beta/RevisionWorkspace.tsx');
assert(workSessionSource.includes('data-curriculum-work-session'), 'RevisionWorkspace non espone la CurriculumWorkSession');
assert(workSessionSource.includes("type CurriculumWorkSessionStage = 'EXAMINE' | 'SHARE' | 'COMPARE' | 'RECORD_TEAM_OUTCOME';"), 'stadi della CurriculumWorkSession non espliciti');
assert(!workSessionSource.includes('role="tablist"'), 'la revisione è tornata a tab concorrenti invece di una sessione progressiva');
for (const label of ['Esamina', 'Condividi', 'Confronta', 'Esito del gruppo']) assert(workSessionSource.includes(label), `passaggio visibile mancante: ${label}`);
assert(workSessionSource.includes('Anche il coordinatore completa prima il proprio contributo personale.'), 'il coordinatore può saltare il contributo personale');
assert(workSessionSource.includes('data-persisted-share-ready={sharePersistence.complete'), 'la sessione non espone lo stato di condivisione persistita');
assert(workSessionSource.includes("(stage === 'COMPARE' || stage === 'RECORD_TEAM_OUTCOME') && !sharePersistence.complete"), 'COMPARE/RECORD non tornano fail-closed quando manca la condivisione corrente');
assert(workSessionSource.includes('isCoordinator && !sharePersistence.complete'), 'il confronto non mostra il blocco quando la condivisione non è verificata');
assert(workSessionSource.includes('isCoordinator && sharePersistence.complete'), 'il confronto non è vincolato alla condivisione verificata');
assert(workSessionSource.includes('Apri il confronto del gruppo'), 'azione di confronto mancante dopo la verifica');
assert(workSessionSource.includes('data-revision-stage="compare"'), 'COMPARE non è uno stato realmente renderizzato');
assert(workSessionSource.includes('data-revision-stage="team-outcome"'), 'RECORD_TEAM_OUTCOME non è uno stato realmente renderizzato');
assert(workSessionSource.includes('mode="status"'), 'il docente dopo SHARE non riceve una proiezione di solo stato');
assert(workSessionSource.includes('mode="compare"'), 'il confronto non è proiettato nella sessione');
assert(workSessionSource.includes('mode="record"'), 'la registrazione esito non è proiettata nella sessione');
assert(workSessionSource.includes('data-curriculum-work-session-complete'), 'manca la conseguenza visibile della chiusura degli esiti correnti');
assert(!workSessionSource.includes('Ho condiviso: apri il confronto del gruppo'), 'una dichiarazione utente può ancora simulare la condivisione');
assert(workSessionSource.includes('Il tuo contributo è condiviso'), 'stato terminale del docente dopo persistenza mancante');

const coordinationSource = readText('src/features/beta/TeamCoordinationWorkspace.tsx');
assert(coordinationSource.includes("export type TeamCoordinationMode = 'status' | 'compare' | 'record'"), 'coordinamento non espone modalità subordinate alla sessione');
assert(coordinationSource.includes('data-team-coordination-mode="status"'), 'modalità stato mancante');
assert(coordinationSource.includes('data-team-coordination-mode="compare"'), 'modalità confronto mancante');
assert(coordinationSource.includes('data-team-coordination-mode="record"'), 'modalità registrazione esito mancante');
assert(coordinationSource.includes('Porta questo punto all’esito'), 'transizione umana confronto→esito mancante');
assert(coordinationSource.includes('repository.recordTeamOutcome'), 'registrazione esito non usa il repository condiviso governato');
assert(coordinationSource.includes("['dipartimento', 'referente'].includes(team.selectedMembership.role)"), 'autorità di coordinamento non verificata');
assert(coordinationSource.includes('hasDisciplineCompetence'), 'competenza disciplinare non richiesta per registrare esito');

const publisherSource = readText('src/features/beta/TeamContributionPublisher.tsx');
assert(publisherSource.includes('onPersistenceStateChange'), 'publisher non comunica lo stato persistito alla sessione');
assert(publisherSource.includes('data-contribution-persistence-complete'), 'publisher non espone lo stato di persistenza');
assert(publisherSource.includes('data-professional-contribution-persisted'), 'publisher non rende riconoscibile la condivisione verificata');
assert(publisherSource.includes('contribution.proposalFingerprint'), 'publisher non verifica il fingerprint corrente');
assert(publisherSource.includes('contribution.orientation !== expectedOrientation'), 'publisher non confronta l’orientamento persistito con quello corrente');
assert(publisherSource.includes('normalizeText(contribution.customText) === normalizeText(customTexts[contribution.proposalRef])'), 'publisher non confronta il testo custom persistito con quello corrente');
assert(publisherSource.includes('complete: proposals.length > 0 && count === proposals.length'), 'completezza di persistenza non richiede tutte le schede');

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
assert(practice.aggregation_may_create_practice_revision_trigger === true, 'pratica non può generare RevisionTrigger');

assert(contract.acceptance?.future_normative_change_can_reopen_targeted_review === true, 'nuova norma non può riaprire riesame mirato');
assert(contract.acceptance?.institute_need_can_reopen_targeted_review_without_becoming_national_source === true, 'esigenza Istituto non modellata correttamente');
assert(contract.acceptance?.revision_trigger_never_changes_curriculum_automatically === true, 'RevisionTrigger può modificare automaticamente il curricolo');
assert(contract.quality_metrics?.pedagogical_quality_score_forbidden === true, 'scoring pedagogico automatico non vietato');
assert(contract.quality_metrics?.teacher_ranking_forbidden === true, 'ranking docenti non vietato');
assert(contract.promotion?.design_contract_is_not_institutional_curriculum_validation === true, 'contratto prodotto confuso con validazione curricolare');
assert(contract.promotion?.design_contract_is_not_curriculum_adoption === true, 'contratto prodotto confuso con adozione');
assert(contract.promotion?.beta_promotion_requires_human_pilot === true, 'promozione Beta non richiede pilota umano');

console.log('CURRICULUM_LIFECYCLE_PASS');
