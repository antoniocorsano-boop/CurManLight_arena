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
const currentSourcePanel = readText('src/features/documents/components/InstituteCurrentSourcePanel.tsx');
const fontiWorkspace = readText('src/features/documents/components/FontiWorkspace.tsx');
const technologyPilotDomain = readText('src/domain/curriculum/validation/technologyClass1Review.ts');
const teamReviewDomain = readText('src/domain/revision/teamReview.ts');
const teamWorkspace = readText('src/features/beta/TeamReviewWorkspace.tsx');

assert(registry.registry_id === 'REG-CURR-00', 'registry_id inatteso');
assert(registry.version === '1.10.0', 'versione registro inattesa');

const master = registry.drive?.current_curriculum_master;
assert(master?.title === 'CAN-CURR-MASTER-00_Curricolo_verticale_integrale_unificato_3-14_2026-2027', 'master corrente inatteso');
assert(master?.file_id === '12eWTPUZBJxZixd6-p8drNAaW5_eL8qWpXZUSDyZZAv4', 'Drive ID master inatteso');
assert(master?.version === '1.1', 'versione master inattesa');
assert(master?.materialization === 'COMPLETE', 'master non materializzato integralmente');
assert(master?.human_professional_validation === 'OPEN', 'validazione umana anticipata');
assert(master?.ready_for_collegio === 'NOT_YET', 'READY_FOR_COLLEGIO anticipato');
assert(master?.curriculum_in_force === false, 'master non può risultare vigente');
assert(master?.continuity_rule === 'UPDATE_SAME_MASTER_AFTER_VALIDATED_OUTCOME', 'regola di continuità mancante');

const normativeMatrix = registry.drive?.normative_compliance_matrix;
assert(normativeMatrix?.title === 'MATR-CURR-MASTER-01_Matrice_conformita_normativa_IN2025_e_atti_collegati_2026-2027', 'matrice normativa inattesa');
assert(normativeMatrix?.file_id === '1Wiw8Wsifls1-wr_GPYuqIAoB8GnwXMChO8Mz_kwiLKY', 'Drive ID matrice normativa inatteso');
assert(normativeMatrix?.role === 'CONTROL_ATTACHMENT_NOT_CURRICULUM_BASELINE', 'la matrice normativa non deve diventare baseline');
assert(normativeMatrix?.identified_curricular_gaps === 6, 'numero lacune normative individuate inatteso');
assert(normativeMatrix?.materialized_curricular_gaps === 6, 'lacune normative non interamente materializzate nel master');

const provenance = registry.drive?.primary_corrected_source;
assert(provenance?.title === 'CURRICOLO_VERTICALE_CORRETTO_PROPOSTA_2026-09-03.docx', 'provenienza corretta inattesa');
assert(provenance?.file_id === '1DPdK_EIZsE3lI-LIzTJG776cU1PcAcnf', 'Drive ID provenienza inatteso');
assert(/^[a-f0-9]{64}$/.test(provenance?.sha256 ?? ''), 'SHA provenienza non valido');
assert(provenance?.role === 'PRIMARY_CORRECTED_PROVENANCE', 'la fonte del 3 settembre non deve essere baseline corrente');

for (const token of [master.title, master.file_id, master.version, normativeMatrix.title, normativeMatrix.file_id, provenance.title, provenance.file_id, provenance.sha256]) {
  assert(currentSourceDomain.includes(token), `contratto curricolare privo di ${token}`);
}
assert(currentSourceDomain.includes("lifecycleState: 'CANONICAL_BASELINE_PENDING_HUMAN_VALIDATION'"), 'lifecycle master inatteso');
assert(currentSourceDomain.includes("materializationState: 'COMPLETE'"), 'materializzazione non registrata nel dominio');
assert(currentSourceDomain.includes('curriculumInForce: false'), 'non vigenza non protetta nel dominio');
assert(currentSourceDomain.includes("role: 'PRIMARY_CORRECTED_PROVENANCE'"), 'provenienza primaria non qualificata');
assert(currentSourceDomain.includes("role: 'HISTORICAL_TECHNICAL_BASELINE'"), 'storico v3 non preservato');
assert(currentSourceDomain.includes('canonicalPromotionAuthorized: false'), 'promozione automatica non vietata');
assert(currentSourceDomain.includes("status: 'GAPS_MATERIALIZED_PENDING_HUMAN_VALIDATION'"), 'stato audit normativo non registrato nel dominio');

assert(fontiWorkspace.includes('<InstituteCurrentSourcePanel />'), 'Fonti non monta la baseline corrente');
assert(!fontiWorkspace.includes('<InstituteSourceReviewPanel />'), 'Fonti riapre il vecchio workbench');
for (const token of ['Baseline corrente', 'Materializzazione 3–14 completa', 'Fonti e tracciabilità', 'non è più la rappresentazione corrente del curricolo']) {
  assert(currentSourcePanel.includes(token), `pannello Fonti privo di: ${token}`);
}

const curriculumProcess = registry.curriculum_process;
assert(curriculumProcess?.path_coverage_metric === 'DEPRECATED_FOR_COMPLETENESS', 'vecchia metrica non deprecata');
assert(curriculumProcess?.master_materialization === 'COMPLETE', 'materializzazione master incompleta');
for (const key of ['ordinary_curriculum_3_14','infanzia_3_4_5','primaria_i_v','secondaria_i_iii','irc_i_v_and_i_iii','latino_lel_ii_iii','educazione_civica_3_14','ai_literacy_3_14']) {
  assert(curriculumProcess?.[key] === 'MATERIALIZED', `segmento non materializzato: ${key}`);
}
assert(curriculumProcess?.normative_alignment === 'GAPS_MATERIALIZED_PENDING_HUMAN_VALIDATION', 'allineamento normativo non registrato');
assert(curriculumProcess?.normative_gaps_identified === 6, 'conteggio lacune normative inatteso');
assert(curriculumProcess?.normative_gaps_materialized === 6, 'lacune normative non materializzate');
assert(curriculumProcess?.human_professional_validation === 'OPEN', 'validazione complessiva non aperta');
assert(curriculumProcess?.verticality_final_review === 'OPEN', 'revisione verticale non aperta');
assert(curriculumProcess?.ready_for_collegio === 'NOT_YET', 'pronto per Collegio non autorizzato');
assert(curriculumProcess?.collegiate_approval === 'NOT_YET', 'approvazione collegiale non autorizzata');
assert(curriculumProcess?.canonical_curriculum_promotion === 'NOT_AUTHORIZED', 'promozione curricolare non autorizzata');

for (const key of ['current_master_must_match_across_drive_and_repo','primary_corrected_source_must_remain_provenance','no_parallel_curriculum_baselines','accepted_change_must_update_same_master','normative_matrix_is_control_attachment_not_baseline','normative_gap_closure_requires_same_master_update']) {
  assert(registry.alignment_rules?.[key] === true, `regola di allineamento mancante: ${key}`);
}

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
assert(registry.next_authorized_phase === 'PROFESSIONAL_VALIDATION_ON_CANONICAL_MASTER_1_1', 'fase successiva inattesa');

for (const token of ['Versione:** 1.10', master.title, master.file_id, 'versione `1.1`', normativeMatrix.title, normativeMatrix.file_id, 'MATERIALIZZAZIONE COMPLETA', 'fonte primaria di provenienza', 'non genera un nuovo curricolo parallelo']) {
  assert(mirror.includes(token), `mirror non allineato: ${token}`);
}

console.log('REG-CURR-00_ALIGNMENT_PASS');
