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
const teamWorkspace = readText('src/features/beta/TeamReviewWorkspace.tsx');

assert(registry.registry_id === 'REG-CURR-00', 'registry_id deve essere REG-CURR-00');
assert(registry.version === '1.6.0', 'versione del registro inattesa');

const source = registry.drive?.current_curriculum_source;
assert(source?.title === 'CURRICOLO_VERTICALE_CORRETTO_PROPOSTA_2026-09-03.docx', 'fonte curricolare corrente non canonica');
assert(source?.file_id === '1DPdK_EIZsE3lI-LIzTJG776cU1PcAcnf', 'Drive file ID della fonte corrente inatteso');
assert(/^[a-f0-9]{64}$/.test(source?.sha256 ?? ''), 'SHA-256 della fonte corrente mancante o invalido');
assert(source?.status === 'PROPOSTA_D_ISTITUTO_DA_VALIDARE', 'la fonte corretta non deve essere promossa implicitamente');
assert(currentSourceDomain.includes(source.title), 'il dominio non usa il titolo della fonte corrente');
assert(currentSourceDomain.includes(source.file_id), 'il dominio non usa il Drive file ID della fonte corrente');
assert(currentSourceDomain.includes(source.sha256), 'il dominio non usa lo SHA-256 della fonte corrente');
assert(currentSourceDomain.includes("lifecycleState: 'PROPOSAL_PENDING_HUMAN_VALIDATION'"), 'la fonte deve restare proposta in attesa di validazione umana');
assert(currentSourceDomain.includes("role: 'HISTORICAL_TECHNICAL_BASELINE'"), 'la ricostruzione v3 deve restare storico tecnico');
assert(currentSourceDomain.includes('canonicalPromotionAuthorized: false'), 'il dominio non può autorizzare promozione canonica automatica');
assert(canonicalFontiWorkspace.includes('<InstituteCurrentSourcePanel />'), 'Fonti deve mostrare la fonte corrente');
assert(!canonicalFontiWorkspace.includes('<InstituteSourceReviewPanel />'), 'Fonti non deve riaprire il vecchio workbench di remediation');

const baseline = registry.arena_product_baseline;
assert(baseline?.pr === 198, 'baseline Arena non identificata');
assert(baseline?.branch === 'feature/team-meeting-workspace', 'branch baseline Arena inatteso');
assert(baseline?.product_head === '2317b57fef35695f0c8373208d5b5f4898671478', 'product head funzionale R2 inatteso');
assert(baseline?.cco_version === cco.version, 'versione CCO disallineata');
assert(baseline?.cco_surfaces_version === surfaces.version, 'versione superfici CCO disallineata');

const pilot = registry.active_validation_pilot;
assert(pilot?.pilot_id === 'TEC-SEC1-2026-01', 'pilot Tecnologia non registrato');
assert(pilot?.revision === 2, 'revisione attiva del pilot diversa da R2');
assert(pilot?.discipline === 'Tecnologia' && pilot?.order === 'secondaria' && pilot?.class_label === 'Classe prima', 'contesto pilot inatteso');
assert(pilot?.status === 'READY_FOR_TEAM_COMPARISON', 'dopo il contributo 5/5 il pilot deve essere pronto al confronto del team');
assert(pilot?.human_outcome === 'OPEN', 'l’esito umano del gruppo non può essere simulato');
assert(pilot?.review_card_count === 5, 'il pilot deve mantenere cinque decisioni R2');
assert(pilot?.canonical_promotion === 'NOT_AUTHORIZED', 'il pilot non può autorizzare promozione canonica');
assert(pilot?.decision_carry_forward === 'NOT_AUTHORIZED', 'le decisioni R1 non possono essere trasferite alla R2');
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
assert(JSON.stringify(pilot?.active_proposal_ids) === JSON.stringify(activeR2Ids), 'ID attivi R2 disallineati');
assert(pilot?.previous_revision?.revision === 1, 'R1 deve restare registrata');
assert(pilot?.previous_revision?.status === 'SUPERSEDED_INSTRUCTIONAL_TEXT_PRESERVED', 'R1 deve restare storico semantico');
assert(JSON.stringify(pilot?.previous_revision?.proposal_ids) === JSON.stringify(historicalR1Ids), 'ID storici R1 disallineati');
assert(pilot?.previous_revision?.decision_semantics === 'PRESERVED_AS_HISTORY_ONLY', 'decisioni R1 devono restare soltanto storiche');

const audit = pilot?.instructional_audit;
assert(audit?.audit_id === 'AUD-CURR-TEC-SEC1-01', 'audit Tecnologia non registrato');
assert(audit?.file_id === '1SZ_lmaYXNF2Fx8ro1C-hTh5iUH-riECcqyZtRx9JRPM', 'Drive file ID audit inatteso');
assert(audit?.status === 'CORRECTIONS_APPLIED', 'correzioni audit non recepite');
assert(audit?.human_outcome === 'OPEN', 'audit istruttorio non può chiudere esito umano');
assert(audit?.canonical_promotion === 'NOT_AUTHORIZED', 'audit non può autorizzare promozione canonica');
assert(Array.isArray(audit?.corrections_applied) && audit.corrections_applied.length === 4, 'quattro correzioni istruttorie devono restare registrate');

const expectedPilotBindings = {
  source: '1DPdK_EIZsE3lI-LIzTJG776cU1PcAcnf',
  proposal: '19nPCsAj_ItBscUwwcHwrVhxDbBy-MXIJ',
  vertical_matrix: '1CMSESN73HCi_2jM_tZYhN9hd6oWzyHgK',
  validation_gate: '1rxKy2IDD5V7l4Nc1LfJeLr407ltfa_vbt_EFK54s7mU',
  decision_register: '1KmnrgWrNxVDUjOvdPo0oibqTvr1lQ72QepBE8KNsdZA',
};
for (const [key, expectedId] of Object.entries(expectedPilotBindings)) {
  assert(pilot?.[key]?.file_id === expectedId, `binding Drive inatteso: ${key}`);
  assert(technologyPilotDomain.includes(expectedId), `dominio pilot privo del binding ${key}`);
}
assert(pilot?.proposal?.revision === '1.1' && pilot?.proposal?.updated_in_place === true, 'proposta R2 Drive disallineata');
assert(pilot?.vertical_matrix?.revision === '1.1' && pilot?.vertical_matrix?.updated_in_place === true, 'matrice R2 Drive disallineata');
assert(pilot?.work_manifest?.file_id === '1s2qZf53O6BqjgyrtzcXuL5lSdafoAmtAUEFv-4mwcog', 'manifesto operativo inatteso');
assert(pilot?.work_manifest?.revision === '1.2', 'manifesto operativo deve registrare il passaggio al team');

const contribution = pilot?.individual_contribution;
assert(contribution?.contribution_id === 'CONTR-CURR-TEC-SEC1-R2-01', 'contributo individuale R2 non registrato');
assert(contribution?.file_id === '17dnvfLP3YPghJlwT7FUwgO5p9J499Lw5kZVIAnXlvyk', 'Drive ID del contributo individuale inatteso');
assert(contribution?.status === 'COMPLETE_5_OF_5', 'contributo individuale deve risultare 5/5 completo');
assert(contribution?.authority === 'INDIVIDUAL_PROFESSIONAL_CONTRIBUTION', 'autorità del contributo individuale inattesa');
assert(contribution?.team_outcome === 'NOT_INFERRED', 'il contributo individuale non può inferire esito del team');
assert(Object.keys(contribution?.decisions ?? {}).length === 5, 'il contributo individuale deve contenere cinque decisioni');
for (const id of activeR2Ids) {
  assert(contribution?.decisions?.[id] === 'CONFIRM', `decisione individuale R2 inattesa per ${id}`);
}

const team = pilot?.team_comparison;
assert(team?.package_id === 'TEAM-CURR-TEC-SEC1-R2-01', 'pacchetto di confronto Dipartimento non registrato');
assert(team?.file_id === '1V-yit_LYow1P5jLY5wSrbsrKzxgJF0WfHncV6BJyR-g', 'Drive ID del pacchetto team inatteso');
assert(team?.status === 'READY_TO_START', 'confronto Dipartimento deve essere pronto ad avviarsi');
assert(team?.team_outcome === 'OPEN', 'esito del team deve restare aperto');
assert(JSON.stringify(team?.team_outcome_authorized_roles) === JSON.stringify(['dipartimento', 'referente']), 'ruoli autorizzati all’esito del team inattesi');
assert(team?.complete_workspace_coverage_required_for_shared_bucket === true, 'un punto condiviso deve richiedere copertura completa');
assert(team?.explicit_team_outcome_required === true, 'l’esito del team deve richiedere registrazione esplicita');

assert(technologyPilotDomain.includes('revision: 2'), 'dominio pilot non dichiara R2');
assert(technologyPilotDomain.includes('decisionCarryForwardAuthorized: false'), 'dominio pilot non vieta carry-forward R1→R2');
for (const cardId of activeR2Ids) assert(technologyPilotDomain.includes(`id: '${cardId}'`), `scheda R2 mancante: ${cardId}`);
for (const cardId of historicalR1Ids) assert(technologyPilotDomain.includes(`id: '${cardId}'`), `scheda R1 storica mancante: ${cardId}`);
assert(technologyPilotDomain.includes('funzionamento essenziale di un sistema informatico'), 'N4 R2 non recepisce la correzione strutturale');
assert(technologyPilotDomain.includes('Internet, Web e servizi'), 'N4 R2 non distingue Internet, Web e servizi');
assert(progressHook.includes('resolveOperationalReviewProposals(discipline, order, fallbackCurrent)'), 'Revisione non usa il resolver del pilot');
assert(revisionSurface.includes('current.sourceRefs'), 'Revisione non espone provenienza su richiesta');

assert(teamWorkspace.includes("['dipartimento', 'referente'].includes(selectedMembership.role)"), 'registrazione esito team non riservata a Dipartimento/referente');
assert(teamWorkspace.includes('expectedContributorCount === 1'), 'workspace team non protegge il caso con un solo componente attivo');
assert(teamWorkspace.includes('item.coverageComplete'), 'workspace team non richiede copertura completa per i punti condivisi');
assert(teamWorkspace.includes('recordTeamOutcome'), 'workspace team privo di registrazione esplicita dell’esito');
assert(teamWorkspace.toLocaleLowerCase('it-IT').includes('approvazione istituzionale'), 'workspace team non distingue esito del gruppo e approvazione istituzionale');

assert(registry.alignment_rules?.instructional_audit_must_not_be_promoted_as_human_outcome === true, 'audit istruttorio deve restare separato da esito umano');
assert(registry.alignment_rules?.individual_contribution_must_not_be_promoted_as_team_outcome === true, 'contributo individuale deve restare separato da esito team');
assert(registry.alignment_rules?.team_outcome_requires_authorized_membership === true, 'esito team deve richiedere membership autorizzata');
assert(registry.alignment_rules?.team_shared_requires_complete_coverage === true, 'punto condiviso deve richiedere copertura completa');
assert(registry.alignment_rules?.proposal_text_change_requires_new_proposal_identity === true, 'testo modificato deve avere nuova identità');
assert(registry.alignment_rules?.previous_decision_carry_forward_requires_explicit_authority === true, 'carry-forward richiede autorità esplicita');

assert(cco.principles?.recognition_before_interpretation === true, 'CCO deve mantenere recognition_before_interpretation');
assert(cco.principles?.one_dominant_object_per_task_context === true, 'CCO deve mantenere un solo oggetto dominante');
assert(cco.layers?.workflow_progression?.scrolling_alone_is_not_a_stage_transition === true, 'CCO deve vietare lo scroll come falsa transizione');
assert(cco.acceptance?.draft_requires_explicit_commit === true, 'bozza richiede registrazione esplicita');

const driveRegisterId = registry.drive?.master_register?.file_id;
assert(driveRegisterId === '1IMKwWWukefIDIOsbHQByiXLN7YuU7He0V5b01tjitG4', 'registro maestro Drive inatteso');
assert(him.requirements?.curriculum_alignment_registry_required === true, 'HIM deve richiedere REG-CURR-00');
assert(him.curriculum_alignment?.registry === 'docs/curriculum/REG-CURR-00.registry.json', 'HIM non punta al registro macchina');
assert(him.curriculum_alignment?.documentation === 'docs/curriculum/REG-CURR-00_MASTER_ALIGNMENT.md', 'HIM non punta al mirror');
assert(him.curriculum_alignment?.drive_register_id === driveRegisterId, 'HIM e REG-CURR-00 non concordano sul registro Drive');

const downstream = registry.downstream_draft_stacks ?? [];
assert(downstream.length === 2, 'le due catene Draft successive devono restare registrate');
for (const stack of downstream) {
  assert(stack.status === 'NOT_CANONICAL_UNTIL_REALIGNED', `catena PR ${stack.prs?.join('–')} non può essere canonica`);
}

assert(registry.curriculum_process?.human_professional_validation === 'OPEN', 'validazione professionale complessiva non può essere chiusa');
assert(registry.curriculum_process?.ready_for_collegio === 'NOT_YET', 'READY_FOR_COLLEGIO non è autorizzato');
assert(registry.curriculum_process?.canonical_curriculum_promotion === 'NOT_AUTHORIZED', 'promozione canonica non autorizzata');
assert(registry.next_authorized_phase === 'SECONDARY_DEPARTMENT_TEAM_COMPARISON_R2', 'fase successiva autorizzata inattesa');

assert(mirror.includes('Versione:** 1.6'), 'mirror non dichiara REG-CURR-00 1.6');
assert(mirror.includes(source.title), 'mirror non richiama la fonte corrente');
assert(mirror.includes(source.sha256), 'mirror non richiama lo SHA-256 della fonte');
assert(mirror.includes(contribution.contribution_id), 'mirror non richiama il contributo individuale');
assert(mirror.includes(contribution.file_id), 'mirror non richiama il Drive ID del contributo');
assert(mirror.includes(team.package_id), 'mirror non richiama il pacchetto del Dipartimento');
assert(mirror.includes(team.file_id), 'mirror non richiama il Drive ID del pacchetto team');
assert(mirror.includes('COMPLETE_5_OF_5'), 'mirror non registra il completamento individuale');
assert(mirror.includes('TEAM_OUTCOME'), 'mirror non esplicita il confine dell’esito del team');
assert(mirror.includes('NOT_AUTHORIZED'), 'mirror deve rendere visibile il blocco di promozione canonica');

console.log('REG-CURR-00_ALIGNMENT_PASS');
console.log(`Curriculum source: ${source.title}`);
console.log(`Arena product baseline: PR #${baseline.pr} @ ${baseline.product_head}`);
console.log(`Active pilot: ${pilot.pilot_id} R${pilot.revision} — ${pilot.status}`);
console.log(`Individual contribution: ${contribution.status}; team outcome: ${team.team_outcome}`);
console.log(`Team package: ${team.package_id} — ${team.status}`);
console.log(`CCO: ${cco.version}; surfaces: ${surfaces.version}`);
console.log(`Drive register: ${driveRegisterId}`);
