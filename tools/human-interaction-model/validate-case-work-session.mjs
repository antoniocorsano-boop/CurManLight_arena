import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const readText = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const readJson = (p) => JSON.parse(readText(p));
const failures = [];
const assert = (condition, message) => { if (!condition) failures.push(message); };

const lifecycle = readJson('.human/curriculum-lifecycle.contract.json');
assert(lifecycle.derived_objects?.includes('CurriculumReviewCase'), 'CurriculumReviewCase mancante nel lifecycle');
assert(JSON.stringify(lifecycle.work_session?.progression) === JSON.stringify(['EXAMINE','SHARE','COMPARE','RECORD_TEAM_OUTCOME']), 'progressione CurriculumWorkSession inattesa');
assert(lifecycle.work_session?.compare_stage_fail_closed_without_current_persisted_share === true, 'COMPARE non è fail-closed sul contributo corrente');
assert(lifecycle.authority_boundaries?.individual_contribution_is_not_team_outcome === true, 'confine contributo individuale/team mancante');
assert(lifecycle.authority_boundaries?.team_professional_outcome_is_not_institutional_decision === true, 'confine esito professionale/decisione istituzionale mancante');

const types = readText('src/types/curriculum.ts');
for (const token of [
  "kind: 'CURRICULUM_WORK_SESSION'",
  'reviewCaseId: string',
  "sessionState: 'ACTIVE' | 'PAUSED' | 'COMPLETE'",
  'targetedProposalRefs: string[]',
  'targetScopeFrozen: true',
  'previousDecisionCarryForward: false',
  'previousProfessionalContributionReuse: false',
  'sharedContributionMustMatchReviewCase: true',
  "currentHumanPhase: 'H1_APPLICABLE_CURRICULUM' | 'H2_PROFESSIONAL_VALIDATION'",
]) assert(types.includes(token), `tipizzazione case-scoped mancante: ${token}`);

const domain = readText('src/domain/curriculum/caseWorkSession.ts');
for (const token of [
  'buildCaseScopedCurriculumWorkSession',
  'CASE_WORK_SESSION_SCOPE_NOT_RESOLVABLE',
  'decisions: {}',
  'customTexts: {}',
  'previousDecisionCarryForward: false',
  'previousProfessionalContributionReuse: false',
  'CASE_WORK_SESSION_PROPOSAL_OUT_OF_SCOPE',
  'CASE_PERSONAL_REVIEW_INCOMPLETE',
  'CASE_CURRENT_SHARE_REQUIRED',
  'CASE_WORK_SESSION_ACTOR_MISMATCH',
]) assert(domain.includes(token), `dominio CurriculumWorkSession case-scoped non presidiato: ${token}`);

const continuationDomain = readText('src/domain/curriculum/deferredCaseContinuation.ts');
for (const token of [
  'buildDeferredCaseContinuationWorkSession',
  'DEFERRED_CONTINUATION_PROPOSAL_OUT_OF_CASE_SCOPE',
  'targetedProposalRefs: [proposalRef]',
  "caseState: 'OPEN_AT_APPLICABLE_CURRICULUM'",
  "professionalValidationState: 'NOT_STARTED'",
  'DEFERRED_CONTINUATION_CARRY_FORWARD_FORBIDDEN',
]) assert(continuationDomain.includes(token), `continuazione H2 rinviata non presidiata: ${token}`);

const caseTeamDomain = readText('src/domain/revision/caseScopedTeamReview.ts');
for (const token of [
  'CaseScopedTeamReviewScope',
  'reviewCaseId: string',
  'fingerprintCaseScopedTeamReviewProposal',
  'reviewCaseId: input.reviewCaseId',
  'REVIEW_CASE_ID_NOT_CANONICAL',
]) assert(caseTeamDomain.includes(token), `identità team case-scoped non presidiata: ${token}`);

const migration = readText('supabase/migrations/20260907043000_team_review_case_scope.sql');
for (const token of [
  'add column if not exists review_case_id text',
  'team_review_contributions_general_identity_uidx',
  'team_review_contributions_case_identity_uidx',
  'upsert_team_review_contribution_v3',
  'record_team_review_outcome_v3',
  'and contribution.review_case_id = p_review_case_id',
  "coalesce(v_existing.review_case_id, '') <> p_review_case_id",
  'A case-scoped contribution never satisfies another case.',
]) assert(migration.includes(token), `migrazione case-scoped non presidiata: ${token}`);

const continuationMigration = readText('supabase/migrations/20260910090000_team_review_deferred_continuation.sql');
for (const token of [
  'team_review_deferred_continuations',
  'team_review_contribution_history',
  'resume_deferred_team_review_item_v1',
  'DEFERRED_CONTINUATION_REQUIRES_DEFER',
  'DEFERRED_CONTINUATION_ALREADY_OPEN',
  'list_case_scoped_team_review_outcomes_v2',
  'VERTICAL_REVIEW_H2_CONTINUATION_OPEN',
]) assert(continuationMigration.includes(token), `migrazione continuazione H2 non presidiata: ${token}`);

const repository = readText('src/infrastructure/supabase/caseScopedTeamReviewRepository.ts');
for (const token of [
  "'upsert_team_review_contribution_v3'",
  "'record_team_review_outcome_v3'",
  "'list_case_scoped_team_review_outcomes_v2'",
  'p_review_case_id: input.reviewCaseId',
  'p_review_case_id: scope.reviewCaseId',
]) assert(repository.includes(token), `repository case-scoped non presidiato: ${token}`);

const panel = readText('src/features/curriculum/components/CurriculumReviewCasePanel.tsx');
for (const token of [
  'buildCaseScopedCurriculumWorkSession',
  'resumeCaseWorkSession',
  'data-human-next-action="start-case-scoped-work-session"',
  'Avvia il riesame mirato',
]) assert(panel.includes(token), `avvio umano del caso non presidiato: ${token}`);

const surface = readText('src/features/beta/CaseAwareRevisionSurface.tsx');
for (const token of [
  'data-revision-surface-mode="CASE_SCOPED"',
  "reviewCase.workSession?.sessionState === 'ACTIVE'",
  "reviewCase.workSession?.sessionState === 'COMPLETE'",
  "reviewCase.caseState === 'PROFESSIONAL_REVIEW_COMPLETE'",
  'data-case-completion-awaiting-acknowledgement',
  'recordCompletionAcknowledgement',
  '<CaseScopedExperienceShell',
  '<CaseScopedCurriculumWorkSession',
  'data-revision-surface-mode="GENERAL"',
  'data-general-review-primary-work',
  'data-general-review-assignment-support',
  '<SharedReviewCaseInbox',
  '<RevisionWorkspace',
  'data-ux-consolidation="UX_CONSOLIDATION_R1_1"',
]) assert(surface.includes(token), `superficie dominante non presidiata: ${token}`);
assert(surface.indexOf('<RevisionWorkspace') < surface.indexOf('<SharedReviewCaseInbox'), 'nel contesto generale il lavoro corrente deve precedere il supporto dei casi assegnati');

const betaIndex = readText('src/features/beta/index.ts');
assert(betaIndex.includes("export { CaseAwareRevisionSurface as RevisionWorkspace } from './CaseAwareRevisionSurface';"), 'Riesame reale non instradato alla superficie case-aware');

const sessionUi = readText('src/features/beta/CaseScopedCurriculumWorkSession.tsx');
for (const token of [
  'data-case-scoped-curriculum-work-session',
  'data-case-content-hierarchy="CURRENT_TASK_ONLY"',
  'data-case-review-examine',
  'data-hcm-level="1"',
  '<CaseScopedTeamContributionPublisher',
  '<CaseScopedTeamCoordinationWorkspace',
  'Concludi il riesame professionale',
  'data-human-next-action="complete-case-professional-review"',
  "caseState: 'PROFESSIONAL_REVIEW_COMPLETE'",
  "professionalValidationState: 'TEAM_OUTCOMES_RECORDED'",
]) assert(sessionUi.includes(token), `UI CurriculumWorkSession case-scoped non presidiata: ${token}`);
for (const forbidden of [
  'Riesame mirato · caso attivo',
  'Avanzamento del riesame mirato',
  'data-case-active-identity',
  'Le decisioni della sessione generale non vengono importate.',
]) assert(!sessionUi.includes(forbidden), `seconda gerarchia ancora presente nella sessione interna: ${forbidden}`);

const uxShell = readText('src/features/beta/CaseScopedExperienceShell.tsx');
for (const token of [
  'data-case-ux-consolidated-shell',
  'data-ux-layering="L1-L2-L3"',
  'data-hcm-level="1"',
  'data-hcm-level="2"',
  'data-hcm-level="3"',
  'data-case-ux-workframe',
  'data-viewport-anchor="stable-current-task"',
  'workframeRef.current.scrollTop = 0',
  'data-case-ux-process-rail',
  'data-case-ux-process-step={step.id}',
  'Passo ${stageIndex + 1} di ${STAGES.length}',
  'data-case-professional-completion-acknowledgement',
  'data-human-next-action="return-to-general-review-after-completion"',
  'Riesame professionale concluso',
  'Torna a Riesame',
  'Perché questo riesame?',
  'Verifica e tracciabilità',
]) assert(uxShell.includes(token), `UX_CONSOLIDATION_R1 case shell non presidiato: ${token}`);

const uxCss = readText('src/features/beta/CaseScopedExperienceShell.css');
for (const token of [
  '[data-case-ux-workframe]',
  'overflow-y: auto',
  'scrollbar-gutter: stable',
  'scroll-padding-bottom: 5.5rem',
  '[data-case-ux-process-step-state="future"]',
]) assert(uxCss.includes(token), `stabilità viewport case-scoped non presidiata: ${token}`);
for (const forbidden of [
  '[data-case-scoped-curriculum-work-session] > section:first-child',
  '[data-case-team-contribution-publisher] > div:first-child > p',
  '[data-case-team-comparison] > div:first-child',
]) assert(!uxCss.includes(forbidden), `occultamento CSS non più ammesso dalla gerarchia strutturale: ${forbidden}`);

const contributionUi = readText('src/features/beta/CaseScopedTeamContributionPublisher.tsx');
for (const token of [
  'data-ux-layering="L1-L3"',
  'data-hcm-level="1"',
  'data-hcm-level="3"',
  'data-case-contribution-professional-status',
  'Verifica e tracciabilità della condivisione',
  'Il tuo contributo professionale non equivale all’esito del gruppo né a una decisione istituzionale.',
]) assert(contributionUi.includes(token), `condivisione case-scoped non separa L1 e L3: ${token}`);

const sharedInbox = readText('src/features/beta/SharedReviewCaseInbox.tsx');
for (const token of [
  'data-ux-layering="L1-L2-L3"',
  'data-hcm-level="1"',
  'data-hcm-level="2"',
  'data-hcm-level="3"',
  'Casi assegnati al mio gruppo',
  'Ricevere un caso non avvia automaticamente la validazione.',
  'Riprendi il punto rinviato',
  'Partecipa al nuovo confronto',
  'Come funziona l’assegnazione',
  'Verifica e tracciabilità',
]) assert(sharedInbox.includes(token), `layering shared case non presidiato: ${token}`);

const mobileNav = readText('src/features/navigation/components/MobileBottomNav.tsx');
for (const token of [
  'Il mio lavoro',
  'Curricolo',
  "handleTabSwitch('progetta-annuale')",
  'Riesame',
  'data-secondary-navigation-entry="hamburger"',
]) assert(mobileNav.includes(token), `navigazione mobile canonica non presidiata: ${token}`);

const docs = readJson('docs/04_product_experience/PRODUCT_DOCS.registry.json');
const state = docs.implementation_state ?? {};
assert(docs.version === '1.0.13', 'versione registro prodotto inattesa per case-scoped session');
for (const key of [
  'targeted_review_case_work_session_case_scoping_implemented',
  'case_scoped_curriculum_work_session_domain_implemented',
  'case_scoped_curriculum_work_session_reuses_revision_surface',
  'case_scoped_session_uses_only_frozen_case_proposals',
  'case_scoped_session_starts_without_decision_carry_forward',
  'case_scoped_session_single_dominant_progression_implemented',
  'case_scoped_professional_contributions_require_review_case_identity',
  'case_scoped_professional_contribution_fingerprint_includes_review_case',
  'case_scoped_team_outcomes_require_same_review_case_coverage',
  'case_scoped_server_receipts_preserve_general_review_history',
  'shared_review_case_discovery_implemented',
]) assert(state[key] === true, `stato prodotto non registra ${key}`);
assert(state.human_end_to_end_pilot_complete === true, 'il pilot umano multi-attore deve risultare concluso dopo la prova reale');
assert(state.target_ui_fully_implemented === false, 'UX_CONSOLIDATION_R1 non deve dichiarare completata tutta la UI target');

if (failures.length) {
  for (const failure of failures) console.error(`CASE_WORK_SESSION_FAIL: ${failure}`);
  process.exit(1);
}
console.log('CASE_WORK_SESSION_PASS');
