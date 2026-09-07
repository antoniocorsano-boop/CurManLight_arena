import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const readText = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const readJson = (p) => JSON.parse(readText(p));
const fail = (message) => {
  console.error(`SHARED_REVIEW_CASE_FAIL: ${message}`);
  process.exit(1);
};
const assert = (condition, message) => { if (!condition) fail(message); };

const domain = readText('src/domain/curriculum/sharedReviewCase.ts');
for (const token of [
  "source: 'SERVER_ASSIGNMENT'",
  'sharedRowToCurriculumReviewCase',
  "caseState: 'OPEN_AT_APPLICABLE_CURRICULUM'",
  "currentHumanPhase: 'H1_APPLICABLE_CURRICULUM'",
  "professionalValidationState: 'NOT_STARTED'",
  'workSession: existing.workSession',
  'SHARED_REVIEW_CASE_SNAPSHOT_MISMATCH',
]) assert(domain.includes(token), `dominio shared case non presidiato: ${token}`);

const repository = readText('src/infrastructure/supabase/sharedCurriculumReviewCaseRepository.ts');
for (const token of [
  "rpc('publish_curriculum_review_case_v1'",
  "rpc('list_my_assigned_curriculum_review_cases_v1'",
  'SHARED_REVIEW_CASE_ASSIGN_REQUIRED',
  'assignmentCount',
]) assert(repository.includes(token), `repository shared case non presidiato: ${token}`);

const inbox = readText('src/features/beta/SharedReviewCaseInbox.tsx');
for (const token of [
  'Casi assegnati al mio gruppo',
  'Condividi e assegna al gruppo',
  'Ricevere un caso non avvia automaticamente la validazione',
  'data-human-next-action="start-assigned-review-case"',
  'data-human-next-action="assign-review-case-to-team"',
  'mergeAssignedReviewCases',
  'buildCaseScopedCurriculumWorkSession',
]) assert(inbox.includes(token), `UI shared case non presidiata: ${token}`);

const wrapper = readText('src/features/beta/RevisionWorkspaceCaseAware.tsx');
for (const token of [
  "reviewCase.workSession?.sessionState === 'ACTIVE'",
  '<CaseScopedCurriculumWorkSession',
  '<SharedReviewCaseInbox',
  '<GeneralRevisionWorkspace',
]) assert(wrapper.includes(token), `convergenza Riesame non presidiata: ${token}`);

const betaIndex = readText('src/features/beta/index.ts');
assert(betaIndex.includes("export { RevisionWorkspace } from './RevisionWorkspaceCaseAware';"), 'AppViews non instradato al wrapper case-aware');

const migration = readText('supabase/migrations/20260907064000_shared_curriculum_review_case_discovery.sql');
for (const token of [
  'create table if not exists public.shared_curriculum_review_cases',
  'create table if not exists public.shared_curriculum_review_case_assignments',
  'publish_curriculum_review_case_v1',
  'list_my_assigned_curriculum_review_cases_v1',
  "v_workspace_role not in ('dipartimento','referente')",
  'SHARED_REVIEW_CASE_ASSIGN_REQUIRED',
  'SHARED_REVIEW_CASE_OPENING_ACTOR_MISMATCH',
  'OPERATIONAL_DISCIPLINE_MEMBERSHIP_REQUIRED',
  "membership.role in ('docente','dipartimento','referente')",
  'p_discipline = any(operational.disciplines)',
  'assignment.assigned_user_id = v_user',
  'SHARED_REVIEW_CASE_ID_REUSE_MISMATCH',
  'SHARED_REVIEW_CASE_NO_ELIGIBLE_ASSIGNEES',
  'revoke all on public.shared_curriculum_review_cases from public, anon, authenticated',
  'revoke all on public.shared_curriculum_review_case_assignments from public, anon, authenticated',
]) assert(migration.includes(token), `migrazione shared case non presidiata: ${token}`);

const docs = readJson('docs/04_product_experience/PRODUCT_DOCS.registry.json');
assert(docs.version === '1.0.13', 'versione registro prodotto inattesa');
const state = docs.implementation_state ?? {};
for (const key of [
  'shared_review_case_discovery_implemented',
  'shared_review_case_assignment_server_derived',
  'shared_review_case_assignment_requires_verified_coordinator_authority',
  'shared_review_case_assignment_requires_operational_discipline_competence',
  'shared_review_case_hydration_never_starts_h2_automatically',
  'shared_review_case_snapshot_conflict_fails_closed',
  'shared_review_case_discovery_reuses_revision_surface',
  'case_scoped_session_single_dominant_progression_implemented',
]) assert(state[key] === true, `stato prodotto non registra ${key}`);
assert(state.target_ui_fully_implemented === false, 'la discovery non deve dichiarare completa tutta la UI target');
assert(state.human_end_to_end_pilot_complete === false, 'la discovery non conclude da sola il pilota umano');

const flows = readText('docs/04_product_experience/09_USER_FLOWS.md');
for (const token of [
  'Proiezione corrente della discovery e assegnazione condivisa dei CurriculumReviewCase',
  'Condividi e assegna al gruppo',
  'assignment != H2 start',
  'stesso caso e stesso perimetro congelato',
  'nessuna nuova route o superficie primaria',
]) assert(flows.includes(token), `flow shared case non presidiato: ${token}`);

console.log('SHARED_REVIEW_CASE_PASS');
