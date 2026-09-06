import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const readJson = (p) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const readText = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const assert = (condition, message) => {
  if (!condition) {
    console.error(`REG-CURR-00_ALIGNMENT_FAIL: ${message}`);
    process.exit(1);
  }
};

const registry = readJson('docs/curriculum/REG-CURR-00.registry.json');
const cco = readJson('.human/operational-communication.contract.json');
const surfaces = readJson('.human/operational-communication.surfaces.json');
const him = readJson('.human/him.config.json');
const mirror = readText('docs/curriculum/REG-CURR-00_MASTER_ALIGNMENT.md');
const currentSourceDomain = readText('src/domain/curriculum/institute/currentSource.ts');
const sourceRegisterDomain = readText('src/domain/curriculum/institute/sourceRegister.ts');
const currentSourcePanel = readText('src/features/documents/components/InstituteCurrentSourcePanel.tsx');
const sourceRegisterPanel = readText('src/features/documents/components/InstituteCurriculumSourceRegisterPanel.tsx');
const fontiWorkspace = readText('src/features/documents/components/FontiWorkspace.tsx');
const technologyPilotDomain = readText('src/domain/curriculum/validation/technologyClass1Review.ts');
const teamReviewDomain = readText('src/domain/revision/teamReview.ts');
const teamWorkspace = readText('src/features/beta/TeamReviewWorkspace.tsx');

assert(registry.registry_id === 'REG-CURR-00', 'registry_id inatteso');
assert(registry.version === '1.12.0', 'versione registro inattesa');

const master = registry.drive?.current_curriculum_master;
assert(master?.title === 'CAN-CURR-MASTER-00_Curricolo_verticale_integrale_unificato_3-14_2026-2027', 'master corrente inatteso');
assert(master?.file_id === '12eWTPUZBJxZixd6-p8drNAaW5_eL8qWpXZUSDyZZAv4', 'Drive ID master inatteso');
assert(master?.version === '1.2', 'versione master inattesa');
assert(master?.materialization === 'COMPLETE', 'master non materializzato integralmente');
assert(master?.human_professional_validation === 'OPEN', 'validazione umana anticipata');
assert(master?.ready_for_collegio === 'NOT_YET', 'READY_FOR_COLLEGIO anticipato');
assert(master?.curriculum_in_force === false, 'master non può risultare vigente');
assert(master?.continuity_rule === 'UPDATE_SAME_MASTER_AFTER_VALIDATED_OUTCOME', 'regola di continuità mancante');

const normativeMatrix = registry.drive?.normative_compliance_matrix;
assert(normativeMatrix?.title === 'MATR-CURR-MASTER-01_Matrice_conformita_normativa_IN2025_e_atti_collegati_2026-2027', 'matrice normativa inattesa');
assert(normativeMatrix?.file_id === '1Wiw8Wsifls1-wr_GPYuqIAoB8GnwXMChO8Mz_kwiLKY', 'Drive ID matrice normativa inatteso');
assert(normativeMatrix?.role === 'CONTROL_ATTACHMENT_NOT_CURRICULUM_BASELINE', 'la matrice normativa non deve diventare baseline');
assert(normativeMatrix?.identified_curricular_gaps === 6, 'numero lacune normative iniziali inatteso');
assert(normativeMatrix?.materialized_curricular_gaps === 6, 'lacune normative iniziali non interamente materializzate');
assert(normativeMatrix?.osa_one_to_one_gate === 'IN_PROGRESS', 'gate OSA dichiarato chiuso prematuramente');
assert(normativeMatrix?.osa_verified_integrations_materialized_in_master_1_2 === true, 'integrazioni OSA verificate non registrate nel master 1.2');
assert(normativeMatrix?.osa_completion_claim_authorized === false, 'claim di copertura OSA completa autorizzato prematuramente');

const sourceRepertory = registry.drive?.source_repertory;
assert(sourceRepertory?.title === 'ALL-CURR-A_Repertorio_fonti_normative_e_istituzionali_2026-2027', 'repertorio fonti inatteso');
assert(sourceRepertory?.file_id === '1MBZKbis6i6xg50z6fKgbh9yUianJXdhZ5jsK4r852PQ', 'Drive ID repertorio fonti inatteso');
assert(sourceRepertory?.version === '1.1', 'versione repertorio fonti inattesa');
assert(sourceRepertory?.role === 'INSTRUCTIONAL_SOURCE_REPERTORY', 'il repertorio fonti non deve essere una baseline curricolare');
assert(sourceRepertory?.status === 'CURRENT_ALIGNED_TO_MASTER_1_2', 'repertorio fonti non allineato al master 1.2');

const provenance = registry.drive?.primary_corrected_source;
assert(provenance?.title === 'CURRICOLO_VERTICALE_CORRETTO_PROPOSTA_2026-09-03.docx', 'provenienza corretta inattesa');
assert(provenance?.file_id === '1DPdK_EIZsE3lI-LIzTJG776cU1PcAcnf', 'Drive ID provenienza inatteso');
assert(/^[a-f0-9]{64}$/.test(provenance?.sha256 ?? ''), 'SHA provenienza non valido');
assert(provenance?.role === 'PRIMARY_CORRECTED_PROVENANCE', 'la fonte del 3 settembre non deve essere baseline corrente');

for (const token of [master.title, master.file_id, master.version, normativeMatrix.title, normativeMatrix.file_id, sourceRepertory.title, sourceRepertory.file_id, sourceRepertory.version, provenance.title, provenance.file_id, provenance.sha256]) {
  assert(currentSourceDomain.includes(token) || sourceRegisterDomain.includes(token), `contratto curricolare privo di ${token}`);
}
assert(currentSourceDomain.includes("sourceVersion: '1.2'"), 'dominio curricolare non punta al master 1.2');
assert(currentSourceDomain.includes("lifecycleState: 'CANONICAL_BASELINE_PENDING_HUMAN_VALIDATION'"), 'lifecycle master inatteso');
assert(currentSourceDomain.includes("materializationState: 'COMPLETE'"), 'materializzazione non registrata nel dominio');
assert(currentSourceDomain.includes('curriculumInForce: false'), 'non vigenza non protetta nel dominio');
assert(currentSourceDomain.includes("role: 'PRIMARY_CORRECTED_PROVENANCE'"), 'provenienza primaria non qualificata');
assert(currentSourceDomain.includes("role: 'HISTORICAL_TECHNICAL_BASELINE'"), 'storico v3 non preservato');
assert(currentSourceDomain.includes('canonicalPromotionAuthorized: false'), 'promozione automatica non vietata');
assert(currentSourceDomain.includes("osaOneToOneGate: 'IN_PROGRESS'"), 'gate OSA non registrato nel dominio');
assert(currentSourceDomain.includes('osaVerifiedIntegrationsMaterializedInMaster12: true'), 'materializzazione integrazioni OSA non registrata nel dominio');
assert(currentSourceDomain.includes('osaCompletionClaimAuthorized: false'), 'dominio consente claim OSA completo prematuro');
assert(currentSourceDomain.includes("alignmentState: 'ALIGNED_TO_MASTER_1_2'"), 'master non collegato al repertorio fonti 1.2');
assert(currentSourceDomain.includes("primary: 'NATIONAL_BENCHMARKS_END_III_AND_V_WITH_INSTITUTE_ANNUALIZATION'"), 'semantica benchmark Primaria assente');
assert(currentSourceDomain.includes("lowerSecondary: 'NATIONAL_BENCHMARK_END_III_WITH_INSTITUTE_ANNUALIZATION'"), 'semantica benchmark Secondaria assente');
assert(currentSourceDomain.includes('noRetroactiveRewriteOf2012Cohorts: true'), 'protezione coorti transitorie assente');

assert(sourceRegisterDomain.includes("repertoryId: 'ALL-CURR-A'"), 'registro macchina fonti privo di ALL-CURR-A');
assert(sourceRegisterDomain.includes("version: '1.2'"), 'catena documentale non punta al master 1.2');
assert(sourceRegisterDomain.includes("authorityInferenceFromPresence: false"), 'autorità delle fonti inferita dalla presenza');
assert(sourceRegisterDomain.includes("locatorKind: 'INSTITUTIONAL_MIRROR'"), 'manca distinzione per copia istituzionale');
assert(sourceRegisterDomain.includes("verificationState: 'ACT_VERIFIED_INSTITUTIONAL_MIRROR'"), 'manca stato di verifica della copia istituzionale');
assert(sourceRegisterDomain.includes('INSTITUTE_CURRICULUM_AUTHORITATIVE_SOURCE_COUNT'), 'manca conteggio fonti applicate');

assert(fontiWorkspace.includes('<InstituteCurrentSourcePanel />'), 'Fonti non monta la baseline corrente');
assert(fontiWorkspace.includes('<InstituteCurriculumSourceRegisterPanel />'), 'Fonti non monta il repertorio istituzionale');
assert(fontiWorkspace.indexOf('<InstituteCurrentSourcePanel />') < fontiWorkspace.indexOf('<InstituteCurriculumSourceRegisterPanel />'), 'repertorio fonti precede impropriamente il master');
assert(fontiWorkspace.indexOf('<InstituteCurriculumSourceRegisterPanel />') < fontiWorkspace.indexOf('<SourceRegistry {...props} />'), 'archivio locale precede impropriamente le fonti istituzionali');
assert(!fontiWorkspace.includes('<InstituteSourceReviewPanel />'), 'Fonti riapre il vecchio workbench');
for (const token of ['Baseline corrente', 'Materializzazione 3–14 completa', 'Fonti e tracciabilità', 'non è più la rappresentazione corrente del curricolo']) {
  assert(currentSourcePanel.includes(token), `pannello Fonti privo di: ${token}`);
}
for (const token of ['Fonti normative e istituzionali del curricolo', 'Apri la fonte ufficiale', 'Apri la copia istituzionale di trasmissione', 'Applicabilità:', 'Ultima verifica:', 'Verifica della fonte ≠ validazione del contenuto curricolare ≠ decisione istituzionale ≠ curricolo vigente.']) {
  assert(sourceRegisterPanel.includes(token), `pannello repertorio fonti privo di: ${token}`);
}

const curriculumProcess = registry.curriculum_process;
assert(curriculumProcess?.path_coverage_metric === 'DEPRECATED_FOR_COMPLETENESS', 'vecchia metrica non deprecata');
assert(curriculumProcess?.master_materialization === 'COMPLETE', 'materializzazione master incompleta');
for (const key of ['ordinary_curriculum_3_14','infanzia_3_4_5','primaria_i_v','secondaria_i_iii','irc_i_v_and_i_iii','latino_lel_ii_iii','educazione_civica_3_14','ai_literacy_3_14']) {
  assert(curriculumProcess?.[key] === 'MATERIALIZED', `segmento non materializzato: ${key}`);
}
assert(curriculumProcess?.normative_alignment === 'OSA_ONE_TO_ONE_GATE_IN_PROGRESS', 'allineamento normativo/OSA inatteso');
assert(curriculumProcess?.normative_gaps_identified === 6, 'conteggio lacune normative iniziali inatteso');
assert(curriculumProcess?.normative_gaps_materialized === 6, 'lacune normative iniziali non materializzate');
assert(curriculumProcess?.osa_one_to_one_gate === 'IN_PROGRESS', 'processo dichiara gate OSA chiuso prematuramente');
assert(curriculumProcess?.osa_verified_integrations_materialized_in_master_1_2 === true, 'processo non registra integrazioni OSA nel master 1.2');
assert(curriculumProcess?.osa_completion_claim_authorized === false, 'processo autorizza claim OSA completo prematuro');
assert(curriculumProcess?.national_benchmark_semantics?.annual_class_osa_inference_forbidden === true, 'annualizzazioni locali possono essere confuse con OSA nazionali');
assert(curriculumProcess?.national_benchmark_semantics?.retroactive_rewrite_of_2012_cohorts_forbidden === true, 'manca protezione non retroattività coorti 2012');
assert(curriculumProcess?.source_repertory === 'ALL-CURR-A@1.1', 'repertorio fonti non registrato nel processo');
assert(curriculumProcess?.source_traceability === 'ALIGNED_TO_MASTER_1_2', 'tracciabilità fonti non allineata al master 1.2');
assert(curriculumProcess?.authoritative_sources_applied === 11, 'conteggio fonti applicate inatteso');
assert(curriculumProcess?.document_chain_entries === 4, 'catena documentale inattesa');
assert(curriculumProcess?.human_professional_validation === 'OPEN', 'validazione complessiva non aperta');
assert(curriculumProcess?.verticality_final_review === 'OPEN', 'revisione verticale non aperta');
assert(curriculumProcess?.ready_for_collegio === 'NOT_YET', 'pronto per Collegio non autorizzato');
assert(curriculumProcess?.collegiate_approval === 'NOT_YET', 'approvazione collegiale non autorizzata');
assert(curriculumProcess?.canonical_curriculum_promotion === 'NOT_AUTHORIZED', 'promozione curricolare non autorizzata');

for (const key of ['current_master_must_match_across_drive_and_repo','primary_corrected_source_must_remain_provenance','no_parallel_curriculum_baselines','accepted_change_must_update_same_master','normative_matrix_is_control_attachment_not_baseline','normative_gap_closure_requires_same_master_update','osa_gate_must_not_claim_complete_without_full_mapping','osa_annualization_must_not_be_misrepresented_as_national_benchmark','transitional_2012_cohorts_must_not_be_rewritten_retroactively','source_repertory_must_match_drive_and_runtime','source_presence_never_implies_authority','source_locator_kind_must_be_explicit','institutional_mirror_must_not_be_presented_as_official']) {
  assert(registry.alignment_rules?.[key] === true, `regola di allineamento mancante: ${key}`);
}

const sourceLogic = registry.source_logic;
assert(sourceLogic?.source_repertory_contract === 'src/domain/curriculum/institute/sourceRegister.ts', 'contratto repertorio fonti inatteso');
assert(sourceLogic?.source_repertory_surface === 'src/features/documents/components/InstituteCurriculumSourceRegisterPanel.tsx', 'superficie repertorio fonti inattesa');
assert(sourceLogic?.source_repertory_version === '1.1', 'versione runtime repertorio inattesa');
assert(sourceLogic?.authoritative_source_count === 11, 'conteggio runtime fonti inatteso');
assert(sourceLogic?.document_chain_count === 4, 'catena runtime fonti inattesa');
assert(sourceLogic?.source_locator_policy === 'OFFICIAL_OR_EXPLICIT_INSTITUTIONAL_MIRROR', 'policy localizzatori inattesa');
assert(sourceLogic?.source_authority_inferred_from_presence === false, 'runtime inferisce autorità dalla presenza');
assert(sourceLogic?.source_traceability_status === 'ALIGNED_TO_MASTER_1_2', 'runtime fonti non allineato al master 1.2');

const baseline = registry.arena_product_baseline;
assert(baseline?.pr === 198 && baseline?.branch === 'feature/team-meeting-workspace', 'baseline prodotto inattesa');
assert(baseline?.cco_version === cco.version, 'CCO disallineato');
assert(baseline?.cco_surfaces_version === surfaces.version, 'superfici CCO disallineate');

const pilot = registry.active_validation_pilot;
assert(pilot?.pilot_id === 'TEC-SEC1-2026-01' && pilot?.revision === 2, 'pilot R2 inatteso');
assert(pilot?.canonical_promotion === 'NOT_AUTHORIZED', 'pilot non può promuovere il curricolo');
assert(pilot?.decision_carry_forward === 'NOT_AUTHORIZED', 'carry-forward R1→R2 non autorizzato');
assert(pilot?.source?.role === 'PRIMARY_CORRECTED_PROVENANCE', 'fonte pilot non qualificata come provenienza');
assert(pilot?.proposal?.file_id === '19nPCsAj_ItBscUwwcHwrVhxDbBy-MXIJ', 'proposta R2 inattesa');
assert(pilot?.vertical_matrix?.file_id === '1CMSESN73HCi_2jM_tZYhN9hd6oWzyHgK', 'matrice R2 inattesa');
assert(pilot?.validation_gate?.file_id === '1rxKy2IDD5V7l4Nc1LfJeLr407ltfa_vbt_EFK54s7mU', 'gate R2 inatteso');
assert(pilot?.decision_register?.file_id === '1KmnrgWrNxVDUjOvdPo0oibqTvr1lQ72QepBE8KNsdZA', 'registro decisioni inatteso');
assert(technologyPilotDomain.includes('revision: 2'), 'dominio pilot non dichiara R2');
assert(technologyPilotDomain.includes('decisionCarryForwardAuthorized: false'), 'dominio pilot non vieta carry-forward');

assert(teamWorkspace.includes("['dipartimento', 'referente'].includes(selectedMembership.role)"), 'esito team non riservato ai ruoli previsti');
assert(teamReviewDomain.includes('expectedContributorCount >= 2'), 'manca protezione sul singolo contributore');
assert(teamWorkspace.includes('item.coverageComplete'), 'manca copertura completa');
assert(teamWorkspace.includes('recordTeamOutcome'), 'manca registrazione esplicita esito team');
assert(teamWorkspace.includes('proposalFingerprint'), 'esito team non vincolato alla proposta');
assert(cco.authority_boundaries?.individual_contribution_is_not_team_outcome === true, 'CCO non separa contributo ed esito');
assert(cco.authority_boundaries?.team_outcome_is_not_institutional_decision === true, 'CCO non separa esito e decisione istituzionale');

const driveRegisterId = registry.drive?.master_register?.file_id;
assert(driveRegisterId === '1IMKwWWukefIDIOsbHQByiXLN7YuU7He0V5b01tjitG4', 'registro Drive inatteso');
assert(him.requirements?.curriculum_alignment_registry_required === true, 'HIM non richiede REG-CURR-00');
assert(him.curriculum_alignment?.registry === 'docs/curriculum/REG-CURR-00.registry.json', 'HIM non punta al registro macchina');
assert(him.curriculum_alignment?.documentation === 'docs/curriculum/REG-CURR-00_MASTER_ALIGNMENT.md', 'HIM non punta al mirror');
assert(him.curriculum_alignment?.drive_register_id === driveRegisterId, 'HIM e Drive non concordano sul registro');

const downstream = registry.downstream_draft_stacks ?? [];
assert(downstream.length === 2, 'catene Draft non registrate');
assert(downstream[0]?.status === 'DRAFT_BETA_CANDIDATE_NOT_CANONICAL', '#199–#201 devono restare Draft non canoniche');
assert(downstream[1]?.status === 'NOT_CANONICAL_UNTIL_REALIGNED', '#202–#207 non possono essere canoniche');
assert(registry.next_authorized_phase === 'OSA_ONE_TO_ONE_GATE_ON_CANONICAL_MASTER_1_2', 'fase successiva inattesa');

for (const token of ['Versione:** 1.12', master.title, master.file_id, 'versione `1.2`', normativeMatrix.title, normativeMatrix.file_id, sourceRepertory.title, sourceRepertory.file_id, 'ALL-CURR-A@1.1', 'OSA_ONE_TO_ONE_GATE = IN_PROGRESS', 'OSA_COMPLETION_CLAIM_AUTHORIZED = FALSE', 'MATERIALIZZAZIONE COMPLETA', 'fonte primaria di provenienza', 'non genera un nuovo curricolo parallelo']) {
  assert(mirror.includes(token), `mirror non allineato: ${token}`);
}

console.log('REG-CURR-00_ALIGNMENT_PASS');
