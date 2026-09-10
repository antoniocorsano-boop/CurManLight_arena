import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const readText = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const readJson = (p) => JSON.parse(readText(p));
const failures = [];
const assert = (condition, message) => { if (!condition) failures.push(message); };

const cco = readJson('.human/operational-communication.contract.json');
const surfaces = readJson('.human/operational-communication.surfaces.json');
const visualAcceptance = readJson('docs/04_product_experience/evidence/HUMAN_VISUAL_RETEST_R1_1_2026-09-07.json');
const ccoDocs = readText('docs/04_product_experience/11_OPERATIONAL_COMMUNICATION_CONTRACT.md');
const ia = readText('docs/04_product_experience/01_INFORMATION_ARCHITECTURE.md');
const flows = readText('docs/04_product_experience/09_USER_FLOWS.md');

assert(cco.version === '1.5.1', 'CCO deve essere 1.5.1 dopo la remediation G5 del Riesame');
assert(surfaces.version === '1.6.2', 'CCO-SURFACES deve essere 1.6.2 dopo la remediation G5 del Riesame');
assert(visualAcceptance.human_verdict === 'PASS', 'il precedente retest visivo umano R1.1 deve restare PASS per le superfici che ha effettivamente coperto');
assert(visualAcceptance.governance_effect?.new_status === 'conformant', 'il retest R1.1 deve continuare ad autorizzare le superfici da esso coperte');
const visualChecks = visualAcceptance.acceptance_checks ?? {};
for (const key of [
  'return_to_general_context_starts_at_top',
  'one_dominant_current_task_in_general_review',
  'personal_contribution_and_targeted_review_are_explicit_non_stacked_entries',
  'assigned_cases_are_subordinate_support',
  'process_rail_is_single_and_non_competing',
  'primary_action_is_not_obscured_by_mobile_navigation',
  'technical_traceability_is_not_in_default_level_1',
]) assert(visualChecks[key] === true, `controllo visivo non superato: ${key}`);
assert(
  visualChecks.previous_r1_general_return_failure_reproduced === false,
  'il difetto R1 di rientro generale non deve riprodursi',
);

for (const principle of [
  'process_awareness_is_part_of_operational_usability',
  'future_process_orientation_may_remain_visible_without_future_controls',
  'process_context_must_survive_stage_transition',
  'viewport_continuity_must_preserve_process_orientation',
  'completion_must_be_acknowledged_before_context_exit',
  'layer_boundaries_must_be_structural',
]) assert(cco.principles?.[principle] === true, `principio UX mancante: ${principle}`);

const awareness = cco.process_awareness ?? {};
assert(awareness.required === true, 'process_awareness deve essere required');
assert(JSON.stringify(awareness.canonical_progression) === JSON.stringify(['ESAMINA','CONDIVIDI','CONFRONTA','REGISTRA_L_ESITO']), 'progressione comunicativa non canonica');
for (const key of [
  'future_steps_may_be_visible_as_noninteractive_orientation',
  'future_controls_must_remain_hidden_until_relevant',
  'past_steps_must_compact_not_disappear_without_context',
  'single_progress_indicator',
  'technical_objects_must_not_be_required_to_understand_process',
  'authority_boundary_must_be_expressed_in_professional_language',
  'completion_must_be_acknowledged_in_same_workframe_before_exit',
  'return_to_general_context_after_completion_must_be_explicit',
  'lifecycle_future_stage_hidden_rule_applies_to_controls_and_task_content_not_noninteractive_orientation_labels',
]) assert(awareness[key] === true, `process_awareness.${key} deve essere true`);

const progression = cco.layers?.workflow_progression ?? {};
for (const key of [
  'future_step_labels_may_remain_visible_for_orientation',
  'future_step_labels_must_not_be_interactive',
  'viewport_anchor_must_remain_stable_across_stage_changes',
  'stage_change_must_not_land_midpage',
  'completion_must_render_in_same_workframe_before_exit',
  'return_to_general_context_after_completion_requires_explicit_action',
]) assert(progression[key] === true, `workflow_progression.${key} deve essere true`);

const viewport = cco.viewport_stability ?? {};
assert(viewport.reference_mobile_viewport === '390x844', 'viewport mobile di riferimento inatteso');
for (const key of [
  'page_scroll_must_not_encode_stage_progression',
  'page_viewport_anchor_must_not_jump_on_stage_transition',
  'internal_workframe_may_reset_to_start_only_after_real_stage_transition',
  'primary_action_must_not_be_obscured_by_mobile_navigation',
  'terminal_state_must_be_visible_before_context_replacement',
]) assert(viewport[key] === true, `viewport_stability.${key} deve essere true`);

for (const key of [
  'process_position_must_be_visible_at_level_1',
  'future_orientation_labels_must_not_be_future_controls',
  'technical_traceability_must_be_absent_from_default_level_1',
  'stage_transition_must_preserve_viewport_orientation',
  'completion_must_be_acknowledged_before_return_to_general_context',
  'return_to_general_context_after_completion_must_be_explicit',
]) assert(cco.acceptance?.[key] === true, `acceptance.${key} deve essere true`);

const promotedCaseScopedSurfaceIds = [
  'case-aware-revision-surface',
  'case-scoped-experience-shell',
  'case-scoped-work-session-content',
  'case-scoped-team-contribution-publisher',
  'case-scoped-team-coordination-workspace',
];
const promotedFromEvidence = new Set(visualAcceptance.governance_effect?.cco_surfaces_registry_promoted ?? []);
const byId = new Map((surfaces.surfaces ?? []).map((surface) => [surface.id, surface]));
for (const id of promotedCaseScopedSurfaceIds) {
  const surface = byId.get(id);
  assert(surface, `superficie case-scoped non registrata: ${id}`);
  assert(promotedFromEvidence.has(id), `superficie ${id} non coperta dalla prova visiva R1.1`);
  assert(surface?.status === 'conformant', `superficie ${id} deve restare conformant dopo l'accettazione visiva R1.1`);
  assert(Boolean(surface?.operational_context?.trim()), `superficie ${id} priva di operational_context`);
  assert(Boolean(surface?.primary_task?.trim()), `superficie ${id} priva di primary_task`);
  assert(Array.isArray(surface?.required_tokens) && surface.required_tokens.length > 0, `superficie ${id} priva di required_tokens`);
}
assert(byId.get('shared-review-case-inbox')?.status === 'conformant', 'SharedReviewCaseInbox deve restare conformant');
assert(byId.get('mobile-primary-navigation')?.status === 'conformant', 'mobile-primary-navigation deve restare conformant');

const shell = readText('src/features/beta/CaseScopedExperienceShell.tsx');
for (const token of [
  'data-case-ux-consolidated-shell',
  'data-ux-layering="L1-L2-L3"',
  'data-case-ux-workframe',
  'data-viewport-anchor="stable-current-task"',
  'data-case-ux-process-rail',
  'data-case-ux-process-step={step.id}',
  'Passo ${stageIndex + 1} di ${STAGES.length}',
  'data-case-professional-completion-acknowledgement',
  'data-human-next-action="return-to-general-review-after-completion"',
  'Riesame professionale concluso',
  'Torna a Riesame',
  'Verifica e tracciabilità',
]) assert(shell.includes(token), `shell UX priva del marker di consolidamento: ${token}`);

const caseAware = readText('src/features/beta/CaseAwareRevisionSurface.tsx');
for (const token of [
  "reviewCase.workSession?.sessionState === 'COMPLETE'",
  "reviewCase.caseState === 'PROFESSIONAL_REVIEW_COMPLETE'",
  'completionAcknowledgementKey',
  'window.sessionStorage.setItem',
  'data-case-completion-awaiting-acknowledgement',
  'data-general-review-primary-work',
  'data-general-review-assignment-support',
  'returnToGeneralRequested',
  "window.scrollTo({ top: 0, left: 0, behavior: 'auto' })",
  'data-general-return-anchor',
  'UX_CONSOLIDATION_R1_2',
  'data-vertical-review-entry',
]) assert(caseAware.includes(token), `CaseAwareRevisionSurface priva del presidio UX: ${token}`);
assert(caseAware.indexOf('<RevisionWorkspace') < caseAware.indexOf('<SharedReviewCaseInbox'), 'il lavoro generale deve precedere il supporto di assegnazione');

const generalWorkspace = readText('src/features/beta/RevisionWorkspace.tsx');
for (const token of [
  "type ExamineSurface = 'OVERVIEW' | 'PERSONAL_REVIEW' | 'REOPEN_CASE'",
  'data-examine-surface=',
  'data-general-review-overview',
  'data-human-next-action="open-personal-review"',
  'data-human-secondary-action="open-targeted-review-tools"',
  "examineSurface === 'PERSONAL_REVIEW'",
  "examineSurface === 'REOPEN_CASE'",
  'data-targeted-review-tools',
  'data-targeted-review-disclosure',
  'Torna all’inizio del riesame',
  'Adesso pensa soltanto al tuo parere. I passaggi successivi si aprono quando servono.',
]) assert(generalWorkspace.includes(token), `Riesame generale privo del consolidamento verticale: ${token}`);
assert(
  generalWorkspace.indexOf("examineSurface === 'REOPEN_CASE'") < generalWorkspace.indexOf('<RevisionTriggerQualificationPanel'),
  'gli strumenti di riapertura devono essere subordinati a una scelta esplicita',
);

const sessionUi = readText('src/features/beta/CaseScopedCurriculumWorkSession.tsx');
for (const token of [
  'data-case-content-hierarchy="CURRENT_TASK_ONLY"',
  'data-case-review-examine',
  'Concludi il riesame professionale',
]) assert(sessionUi.includes(token), `sessione interna priva della gerarchia corrente: ${token}`);
for (const forbidden of ['Avanzamento del riesame mirato', 'data-case-active-identity']) {
  assert(!sessionUi.includes(forbidden), `seconda gerarchia non ammessa nella sessione interna: ${forbidden}`);
}

const contributionUi = readText('src/features/beta/CaseScopedTeamContributionPublisher.tsx');
for (const token of [
  'data-ux-layering="L1-L3"',
  'data-case-contribution-professional-status',
  'data-case-contribution-technical-layer',
  'Verifica e tracciabilità della condivisione',
]) assert(contributionUi.includes(token), `condivisione priva di separazione L1/L3: ${token}`);

const css = readText('src/features/beta/CaseScopedExperienceShell.css');
for (const forbidden of [
  '[data-case-scoped-curriculum-work-session] > section:first-child',
  '[data-case-team-contribution-publisher] > div:first-child > p',
  '[data-case-team-comparison] > div:first-child',
]) assert(!css.includes(forbidden), `gerarchia affidata a occultamento CSS: ${forbidden}`);

for (const token of [
  'CCO-R7 — consapevolezza del processo e continuità percettiva',
  'Una etichetta di orientamento non è un controllo di fase',
  'Arena nasconde la complessità tecnica, non il senso del processo.',
  '390×844',
]) assert(ccoDocs.includes(token), `documento CCO privo della scelta: ${token}`);

for (const token of [
  'Consapevolezza del processo e continuità percettiva',
  'etichette non interattive',
  'stesso workframe',
  '390×844',
]) assert(ia.includes(token), `IA priva della scelta: ${token}`);

for (const token of [
  'Regola trasversale di consapevolezza del processo e continuità del workframe',
  "Esamina → Condividi → Confronta → Registra l'esito",
  'il futuro può comparire soltanto come etichetta non interattiva di orientamento',
  'ritorno al contesto generale **Riesame** dopo la conclusione richiede un gesto esplicito',
  'Il pilot umano multi-attore è concluso',
]) assert(flows.includes(token), `User flows privi della scelta: ${token}`);

if (failures.length) {
  for (const failure of failures) console.error(`UX_PROCESS_AWARENESS_FAIL: ${failure}`);
  process.exit(1);
}

console.log('UX_PROCESS_AWARENESS_PASS');
