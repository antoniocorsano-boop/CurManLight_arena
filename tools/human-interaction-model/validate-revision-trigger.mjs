import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const readText = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const readJson = (p) => JSON.parse(readText(p));
const fail = (message) => {
  console.error(`REVISION_TRIGGER_FAIL: ${message}`);
  process.exit(1);
};
const assert = (condition, message) => { if (!condition) fail(message); };

const contract = readJson('.human/curriculum-lifecycle.contract.json');
assert(contract.version === '1.2.0', 'versione lifecycle inattesa');
const triggers = contract.revision_triggers ?? {};
assert(JSON.stringify(triggers.allowed_types) === JSON.stringify([
  'EXTERNAL_NORMATIVE',
  'INSTITUTE_NEED',
  'PRACTICE_SIGNAL',
  'PERIODIC_REVIEW',
]), 'tipi RevisionTrigger inattesi');
assert(triggers.external_normative_requires_source_qualification === true, 'EXTERNAL_NORMATIVE non richiede fonte qualificata');
assert(triggers.external_normative_requires_applicability_assessment === true, 'EXTERNAL_NORMATIVE non richiede valutazione di applicabilità');
assert(triggers.institute_need_must_remain_explicitly_non_national === true, 'INSTITUTE_NEED può confondersi con una fonte nazionale');
assert(triggers.practice_signal_requires_aggregation_or_explicit_professional_reason === true, 'PRACTICE_SIGNAL non richiede ricorrenza o motivazione esplicita');
assert(triggers.periodic_review_must_not_reopen_stable_units_without_reason === true, 'PERIODIC_REVIEW può riaprire unità stabili senza motivo');
assert(triggers.must_reference_current_master_identity_and_version === true, 'RevisionTrigger non vincolato al master corrente');
assert(triggers.may_open_targeted_review_cases === true, 'RevisionTrigger non può alimentare casi mirati');
assert(triggers.automatic_curriculum_change_forbidden === true, 'RevisionTrigger può modificare automaticamente il curricolo');
assert(triggers.parallel_curriculum_baseline_creation_forbidden === true, 'RevisionTrigger può creare una baseline parallela');
assert(triggers.cycle_reentry_phase === 'H1_APPLICABLE_CURRICULUM', 'rientro del ciclo non fissato a H1');

const types = readText('src/types/curriculum.ts');
for (const token of [
  "kind: 'REVISION_TRIGGER'",
  "triggerType: 'PRACTICE_SIGNAL'",
  "triggerType: 'EXTERNAL_NORMATIVE'",
  "triggerType: 'INSTITUTE_NEED'",
  "triggerType: 'PERIODIC_REVIEW'",
  "kind: 'PRACTICE_OBSERVATIONS'",
  "kind: 'EXTERNAL_NORMATIVE_SOURCE'",
  "sourceQualification: 'QUALIFIED'",
  "kind: 'INSTITUTE_NEED'",
  'nationalSource: false',
  "kind: 'PERIODIC_REVIEW'",
  "qualificationState: 'QUALIFIED_FOR_TARGETED_REVIEW'",
  "cycleReentryPhase: 'H1_APPLICABLE_CURRICULUM'",
  'automaticCurriculumChange: false',
  'automaticReviewCaseOpening: false',
  'parallelCurriculumBaselineCreation: false',
  'revisionTriggers: RevisionTrigger[]',
]) assert(types.includes(token), `tipizzazione RevisionTrigger mancante: ${token}`);

const domain = readText('src/domain/curriculum/revisionTrigger.ts');
for (const token of [
  "'TOO_EARLY'",
  "'TOO_LATE'",
  "'DUPLICATED'",
  "'MISSING_PREREQUISITE'",
  "'WEAK_EVIDENCE'",
  "'UNSUSTAINABLE_LOAD'",
  "'OTHER'",
  'recurringCount >= 2',
  "basis: 'AGGREGATED_PRACTICE_SIGNAL'",
  "basis: 'EXPLICIT_PROFESSIONAL_REASON'",
  'PRACTICE_SIGNAL_NOT_QUALIFIED',
  'MIXED_CURRICULUM_SCOPE',
  "triggerType: 'PRACTICE_SIGNAL'",
  'buildExternalNormativeRevisionTrigger',
  'EXTERNAL_NORMATIVE_SOURCE_NOT_QUALIFIED',
  'EXTERNAL_NORMATIVE_APPLICABILITY_REQUIRED',
  "triggerType: 'EXTERNAL_NORMATIVE'",
  "qualificationBasis: 'QUALIFIED_EXTERNAL_NORMATIVE_SOURCE'",
  'buildInstituteNeedRevisionTrigger',
  'INSTITUTE_NEED_MUST_REMAIN_NON_NATIONAL',
  "triggerType: 'INSTITUTE_NEED'",
  'nationalSource: false',
  "qualificationBasis: 'EXPLICIT_INSTITUTE_NEED'",
  'buildPeriodicReviewRevisionTrigger',
  'PERIODIC_REVIEW_REASON_REQUIRED',
  "triggerType: 'PERIODIC_REVIEW'",
  "qualificationBasis: 'PERIODIC_REVIEW_WITH_EXPLICIT_REASON'",
  'assertCurrentMasterReference',
  "qualificationState: 'QUALIFIED_FOR_TARGETED_REVIEW'",
  "cycleReentryPhase: 'H1_APPLICABLE_CURRICULUM'",
  'automaticCurriculumChange: false',
  'automaticReviewCaseOpening: false',
  'parallelCurriculumBaselineCreation: false',
]) assert(domain.includes(token), `dominio RevisionTrigger non presidiato: ${token}`);
assert(!domain.match(/PRACTICE_TRIGGER_ELIGIBLE_SIGNALS[\s\S]*?'ADEQUATE'/), 'ADEQUATE non deve generare automaticamente un trigger problematico');
assert(!domain.match(/PRACTICE_TRIGGER_ELIGIBLE_SIGNALS[\s\S]*?'EFFECTIVE_VERTICAL_LINK'/), 'EFFECTIVE_VERTICAL_LINK non deve generare automaticamente un trigger problematico');

const didacticBinding = readText('src/domain/curriculum/didacticBinding.ts');
for (const token of [
  'resolveCurriculumUnitReference',
  "masterId: 'CAN-CURR-MASTER-00'",
  "identityKind: 'ARENA_MASTER_CONTEXT_KEY'",
  "resolutionState: 'CONTEXT_BOUND'",
]) assert(didacticBinding.includes(token), `identità CurriculumUnit condivisa non presidiata: ${token}`);

const hook = readText('src/features/progettazione/hooks/usePracticeRevisionTrigger.ts');
for (const token of [
  'qualifyPracticeSignal(allObservations, unitKey)',
  'buildPracticeRevisionTrigger',
  'revisionTriggers: [...state.revisionTriggers, trigger]',
  "trigger.triggerType === 'PRACTICE_SIGNAL'",
  'trigger.currentMaster.version === masterVersion',
]) assert(hook.includes(token), `hook PRACTICE_SIGNAL non presidiato: ${token}`);

const store = readText('src/store/useCurriculumStore.ts');
assert(store.includes("'revisionTriggers',"), 'revisionTriggers non inclusi nel boundary persistito');
assert(store.includes('revisionTriggers: []'), 'revisionTriggers non inizializzati');
assert(store.includes('savedUda: [], revisionTriggers: []'), 'reset non azzera i trigger insieme al lavoro locale');

const practicePanel = readText('src/features/progettazione/components/PracticeRevisionTriggerPanel.tsx');
for (const token of [
  'Valuta un possibile riesame',
  'Queste osservazioni meritano un riesame del curricolo?',
  'Arena non apre revisioni in automatico.',
  'Perché ritieni necessario il riesame?',
  'Registra il motivo di riesame',
  'Motivo di riesame qualificato',
  'Questo passaggio non apre ancora una revisione e non modifica il curricolo.',
  'Motivo di riesame ≠ caso di revisione ≠ modifica del master.',
]) assert(practicePanel.includes(token), `superficie qualificazione PRACTICE_SIGNAL non presidiata: ${token}`);

const udaDetail = readText('src/features/progettazione/components/UdaModals.tsx');
assert(udaDetail.includes('<PracticeRevisionTriggerPanel uda={selectedUda} />'), 'qualificazione PRACTICE_SIGNAL non integrata nella UDA');

const qualificationPanel = readText('src/features/curriculum/components/RevisionTriggerQualificationPanel.tsx');
for (const token of [
  'data-revision-trigger-qualification',
  'Nuova norma o circolare',
  'Esigenza dell’Istituto',
  'Riesame periodico',
  'INSTITUTE_CURRICULUM_AUTHORITATIVE_SOURCES',
  "sourceQualification: 'QUALIFIED'",
  'applicabilityAssessment',
  'declaredNonNational: true',
  'il semplice decorso del tempo non riapre unità stabili',
  'Motivo qualificato ≠ caso di riesame ≠ modifica del master ≠ decisione istituzionale.',
]) assert(qualificationPanel.includes(token), `superficie unica RevisionTrigger non presidiata: ${token}`);
assert(!qualificationPanel.includes('customKbDocs'), 'una fonte personale non deve qualificare EXTERNAL_NORMATIVE');

const revisionWorkspace = readText('src/features/beta/RevisionWorkspace.tsx');
assert(revisionWorkspace.includes('<RevisionTriggerQualificationPanel'), 'qualificazione delle cause non integrata nel Riesame esistente');
assert(revisionWorkspace.includes('data-curriculum-work-session'), 'integrazione trigger ha sostituito la CurriculumWorkSession');

const sourceRegister = readText('src/features/documents/components/InstituteCurriculumSourceRegisterPanel.tsx');
for (const token of [
  'data-source-review-action',
  'Valuta l’impatto sul curricolo',
  'requestNormativeReview(source.code)',
  'non crea automaticamente un caso e non modifica il master',
]) assert(sourceRegister.includes(token), `ingresso fonte normativa non presidiato: ${token}`);

const normativeIntent = readText('src/features/documents/lib/normativeReviewIntent.ts');
for (const token of [
  "NORMATIVE_REVIEW_REQUEST_EVENT = 'arena:normative-review-request'",
  'window.dispatchEvent(new CustomEvent',
  'detail: { sourceCode: normalizedSourceCode }',
  'readNormativeReviewRequest',
]) assert(normativeIntent.includes(token), `intento Fascicolo → Riesame non presidiato: ${token}`);

const appViews = readText('src/features/session/components/AppViewsLayer.tsx');
for (const token of [
  'window.addEventListener(NORMATIVE_REVIEW_REQUEST_EVENT, handleNormativeReviewRequest)',
  'readNormativeReviewRequest(event)',
  'setNormativeReviewSourceCode(sourceCode)',
  "props.handleTabSwitch('revisione')",
  'initialNormativeSourceCode={normativeReviewSourceCode}',
]) assert(appViews.includes(token), `instradamento Fascicolo → Riesame non presidiato: ${token}`);
for (const forbiddenRoute of ["'revision-trigger'", "'normative-review'", "'periodic-review'"]) {
  assert(!appViews.includes(forbiddenRoute), `nuova superficie primaria non autorizzata: ${forbiddenRoute}`);
}

const docs = readJson('docs/04_product_experience/PRODUCT_DOCS.registry.json');
const state = docs.implementation_state ?? {};
for (const key of [
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
  'institute_need_trigger_domain_implemented',
  'institute_need_trigger_remains_explicitly_non_national',
  'periodic_review_trigger_domain_implemented',
  'periodic_review_trigger_requires_explicit_reason',
  'all_revision_trigger_origins_share_current_master_scope_and_no_automatic_consequences',
  'external_normative_trigger_ux_implemented',
  'external_normative_trigger_reuses_fascicolo_to_revision_flow',
  'institute_need_trigger_ux_implemented',
  'institute_need_trigger_reuses_revision_surface',
  'periodic_review_trigger_ux_implemented',
  'periodic_review_trigger_reuses_revision_surface',
  'revision_trigger_single_existing_surface_integration_implemented',
  'revision_trigger_ux_implemented',
]) assert(state[key] === true, `stato prodotto non registra ${key}`);
assert(docs.version === '1.0.13', 'versione registro documentazione prodotto inattesa');
assert(state.curriculum_review_case_domain_model_implemented === true, 'il successivo caso mirato non risulta implementato');
assert(state.curriculum_review_case_professional_validation_not_auto_started === true, 'l’apertura del caso non deve avviare automaticamente H2');
assert(state.targeted_review_case_work_session_case_scoping_implemented === true, 'la sessione case-scoped deve risultare implementata');
assert(state.shared_review_case_discovery_implemented === true, 'la discovery condivisa dei casi deve risultare implementata');
assert(state.shared_review_case_hydration_never_starts_h2_automatically === true, 'la discovery non deve avviare automaticamente H2');
assert(state.revision_trigger_new_primary_surface_created === false, 'l’incremento non deve creare una nuova superficie primaria');
assert(state.target_ui_fully_implemented === false, 'implementazione RevisionTrigger non deve dichiarare completa la UI target');
assert(state.human_end_to_end_pilot_complete === false, 'implementazione RevisionTrigger non deve dichiarare concluso il pilota umano');

console.log('REVISION_TRIGGER_PASS');
