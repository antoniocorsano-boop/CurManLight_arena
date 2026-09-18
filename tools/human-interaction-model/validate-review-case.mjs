import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const readText = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const readJson = (p) => JSON.parse(readText(p));
const fail = (message) => {
  console.error(`CURRICULUM_REVIEW_CASE_FAIL: ${message}`);
  process.exit(1);
};
const assert = (condition, message) => { if (!condition) fail(message); };

const lifecycle = readJson('.human/curriculum-lifecycle.contract.json');
assert(lifecycle.version === '1.2.0', 'versione lifecycle inattesa');
assert(lifecycle.derived_objects?.includes('CurriculumReviewCase'), 'CurriculumReviewCase non presente tra gli oggetti derivati');
assert(lifecycle.revision_triggers?.may_open_targeted_review_cases === true, 'i trigger qualificati non possono alimentare casi mirati');
assert(lifecycle.revision_triggers?.automatic_curriculum_change_forbidden === true, 'il trigger può modificare automaticamente il curricolo');
assert(lifecycle.revision_triggers?.cycle_reentry_phase === 'H1_APPLICABLE_CURRICULUM', 'rientro lifecycle non fissato a H1');

const types = readText('src/types/curriculum.ts');
for (const token of [
  "kind: 'CURRICULUM_REVIEW_CASE'",
  "state: 'READY_TO_OPEN' | 'BLOCKED'",
  "caseState: 'OPEN_AT_APPLICABLE_CURRICULUM' | 'PROFESSIONAL_VALIDATION_IN_PROGRESS' | 'PROFESSIONAL_REVIEW_COMPLETE'",
  "professionalValidationState: 'NOT_STARTED' | 'IN_PROGRESS' | 'TEAM_OUTCOMES_RECORDED'",
  "currentHumanPhase: 'H1_APPLICABLE_CURRICULUM' | 'H2_PROFESSIONAL_VALIDATION'",
  'explicitHumanOpening: true',
  'automaticProfessionalContributionReuse: false',
  'decisionCarryForwardFromPreviousReview: false',
  'automaticCurriculumChange: false',
  'automaticTeamOutcome: false',
  'automaticInstitutionalDecision: false',
  'automaticMasterPromotion: false',
  'parallelCurriculumBaselineCreation: false',
  'curriculumReviewCases: CurriculumReviewCase[]',
]) assert(types.includes(token), `tipizzazione CurriculumReviewCase non presidiata: ${token}`);

const domain = readText('src/domain/curriculum/reviewCase.ts');
for (const token of [
  'evaluateCurriculumReviewCaseReadiness',
  'isQualifiedRevisionTrigger(trigger)',
  'CURRENT_MASTER_MISMATCH',
  'CURRICULUM_UNIT_SCOPE_MISMATCH',
  'NO_TARGETED_PROPOSALS',
  'UNKNOWN_TARGETED_PROPOSAL',
  'CASE_SCOPE_REASON_REQUIRED',
  'REVIEW_CASE_ALREADY_OPEN_FOR_TRIGGER',
  "state: blockers.length === 0 ? 'READY_TO_OPEN' : 'BLOCKED'",
  'targetedProposalRefs',
  'targetScopeFrozen: true',
  "caseState: 'OPEN_AT_APPLICABLE_CURRICULUM'",
  "cycleReentryPhase: 'H1_APPLICABLE_CURRICULUM'",
  "currentHumanPhase: 'H1_APPLICABLE_CURRICULUM'",
  "professionalValidationState: 'NOT_STARTED'",
  'explicitHumanOpening: true',
  'automaticProfessionalContributionReuse: false',
  'decisionCarryForwardFromPreviousReview: false',
  'automaticCurriculumChange: false',
  'automaticTeamOutcome: false',
  'automaticInstitutionalDecision: false',
  'automaticMasterPromotion: false',
  'parallelCurriculumBaselineCreation: false',
]) assert(domain.includes(token), `dominio CurriculumReviewCase non presidiato: ${token}`);

const store = readText('src/store/useCurriculumStore.ts');
assert(store.includes("'curriculumReviewCases',"), 'curriculumReviewCases non incluso nel boundary persistito');
assert(store.includes('curriculumReviewCases: [],'), 'curriculumReviewCases non inizializzato');
assert(store.includes('revisionTriggers: [], curriculumReviewCases: []'), 'reset non azzera trigger e casi insieme');

const panel = readText('src/features/curriculum/components/CurriculumReviewCasePanel.tsx');
for (const token of [
  'Apri solo il riesame necessario',
  'Quali schede devono essere realmente riaperte?',
  'Perché proprio queste schede?',
  'Prontezza all’apertura',
  'data-review-case-readiness',
  'data-human-next-action="open-targeted-review-case"',
  'Apri il caso mirato',
  'validazione non avviata',
  'Nessuna scelta o condivisione precedente viene importata.',
  'buildCurriculumReviewCase',
  'curriculumReviewCases: [...(state.curriculumReviewCases ?? []), reviewCase]',
  'data-human-next-action="start-case-scoped-work-session"',
  'Avvia il riesame mirato',
]) assert(panel.includes(token), `superficie CurriculumReviewCase non presidiata: ${token}`);
assert(!panel.includes('setDecision('), 'l’apertura del caso non deve scrivere decisioni personali legacy');
assert(!panel.includes('TeamContributionPublisher'), 'il pannello di apertura del caso non deve riusare il publisher generale');

const workspace = readText('src/features/beta/RevisionWorkspace.tsx');
assert(workspace.includes('<CurriculumReviewCasePanel'), 'CurriculumReviewCase non integrato nel Riesame esistente');
assert(workspace.includes('data-curriculum-work-session'), 'integrazione del caso ha sostituito la CurriculumWorkSession generale');

const caseAware = readText('src/features/beta/CaseAwareRevisionSurface.tsx');
assert(caseAware.includes('<SharedReviewCaseInbox'), 'discovery dei casi non integrata nella superficie Riesame');
assert(caseAware.includes('<CaseScopedCurriculumWorkSession'), 'sessione case-scoped non proiettata come percorso dominante');

const docs = readJson('docs/04_product_experience/PRODUCT_DOCS.registry.json');
assert(docs.version === '1.0.13', 'versione registro documentazione prodotto inattesa');
const state = docs.implementation_state ?? {};
for (const key of [
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
  'curriculum_review_case_reuses_revision_surface',
  'targeted_review_case_work_session_case_scoping_implemented',
  'shared_review_case_discovery_implemented',
  'shared_review_case_hydration_never_starts_h2_automatically',
]) assert(state[key] === true, `stato prodotto non registra ${key}`);
assert(state.target_ui_fully_implemented === false, 'il caso mirato non completa la UI target');
assert(state.human_end_to_end_pilot_complete === true, 'il pilot umano multi-attore deve risultare concluso dopo la prova reale');

const flows = readText('docs/04_product_experience/09_USER_FLOWS.md');
for (const token of [
  "Proiezione corrente dell'apertura mirata di CurriculumReviewCase",
  'readiness fail-closed',
  'OPEN_AT_APPLICABLE_CURRICULUM',
  'professionalValidationState = NOT_STARTED',
  'contributi personali e decisioni di riesami precedenti non vengono riportati automaticamente',
  'RevisionTrigger qualificato != CurriculumReviewCase aperto != nuova CurriculumWorkSession case-scoped',
  'Proiezione corrente della CurriculumWorkSession case-scoped',
  'Proiezione corrente della discovery e assegnazione condivisa dei CurriculumReviewCase',
]) assert(flows.includes(token), `flow casi mirati non presidiato: ${token}`);

console.log('CURRICULUM_REVIEW_CASE_PASS');