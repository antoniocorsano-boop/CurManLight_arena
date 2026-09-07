import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const readText = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const readJson = (p) => JSON.parse(readText(p));
const fail = (message) => {
  console.error(`PRACTICE_REVIEW_FAIL: ${message}`);
  process.exit(1);
};
const assert = (condition, message) => { if (!condition) fail(message); };

const contract = readJson('.human/curriculum-lifecycle.contract.json');
assert(contract.version === '1.2.0', 'versione lifecycle inattesa');
const practice = contract.practice_review ?? {};
assert(practice.student_personal_data_required === false, 'il riesame dalla pratica richiede dati personali degli alunni');
assert(practice.automatic_curriculum_change_forbidden === true, 'le osservazioni possono modificare automaticamente il curricolo');
assert(practice.aggregation_may_create_targeted_review_case === true, 'l’aggregazione non può alimentare un riesame mirato');
assert(practice.aggregation_may_create_practice_revision_trigger === true, 'l’aggregazione non può alimentare un RevisionTrigger');
assert(JSON.stringify(practice.allowed_signals) === JSON.stringify([
  'ADEQUATE',
  'TOO_EARLY',
  'TOO_LATE',
  'DUPLICATED',
  'MISSING_PREREQUISITE',
  'WEAK_EVIDENCE',
  'UNSUSTAINABLE_LOAD',
  'EFFECTIVE_VERTICAL_LINK',
  'OTHER',
]), 'insieme dei segnali professionali inatteso');

const types = readText('src/types/curriculum.ts');
for (const token of [
  "kind: 'IMPLEMENTATION_OBSERVATION'",
  "personalDataDeclaration: 'DECLARED_ABSENT'",
  'containsStudentPersonalData: false',
  'automaticCurriculumChange: false',
  "reviewState: 'RECORDED_FOR_AGGREGATION'",
  'implementationObservations?: ImplementationObservation[]',
]) assert(types.includes(token), `tipizzazione osservazione mancante: ${token}`);

const domain = readText('src/domain/curriculum/implementationObservation.ts');
for (const token of [
  'MISSING_DIDACTIC_BINDING',
  'PERSONAL_DATA_ABSENCE_NOT_CONFIRMED',
  'OTHER_SIGNAL_REQUIRES_NOTE',
  'didacticBindingId: binding.id',
  'curriculumUnit: { ...binding.curriculumUnit }',
  "personalDataDeclaration: 'DECLARED_ABSENT'",
  'containsStudentPersonalData: false',
  'automaticCurriculumChange: false',
  "reviewState: 'RECORDED_FOR_AGGREGATION'",
  'countImplementationSignals',
]) assert(domain.includes(token), `dominio ImplementationObservation non presidiato: ${token}`);

const persistence = readText('src/features/progettazione/hooks/useImplementationObservationRecorder.ts');
assert(persistence.includes('buildImplementationObservation(input)'), 'persistence non usa il costruttore governato');
assert(persistence.includes('implementationObservations:'), 'osservazione non salvata con la UDA');
assert(persistence.includes('useCurriculumStore.setState'), 'persistenza non usa lo store della progettazione');
assert(persistence.includes('savedUda: state.savedUda.map'), 'UDA persistita non aggiornata in modo mirato');

const panel = readText('src/features/progettazione/components/ImplementationObservationPanel.tsx');
for (const token of [
  'data-implementation-observation-panel',
  'Riesame dalla pratica',
  'L’osservazione non modifica il curricolo e non valuta il docente.',
  'Confermo che questa osservazione non contiene nomi, voti, diagnosi o altri dati personali degli alunni.',
  'Registra per il riesame',
  'non viene aperto automaticamente',
  "signal !== 'OTHER' || note.trim().length > 0",
  'personalDataAbsentConfirmed',
]) assert(panel.includes(token), `superficie riesame dalla pratica non presidiata: ${token}`);

const udaDetail = readText('src/features/progettazione/components/UdaModals.tsx');
assert(udaDetail.includes('<ImplementationObservationPanel uda={selectedUda} onUdaUpdated={setSelectedUda} />'), 'ImplementationObservation non collegata al dettaglio UDA');

const docsRegistry = readJson('docs/04_product_experience/PRODUCT_DOCS.registry.json');
const state = docsRegistry.implementation_state ?? {};
for (const key of [
  'implementation_observation_domain_model_implemented',
  'implementation_observation_persisted_with_uda',
  'implementation_observation_requires_curriculum_binding',
  'implementation_observation_requires_personal_data_absence_confirmation',
  'implementation_observation_never_changes_curriculum_automatically',
  'practice_signal_aggregation_available',
]) assert(state[key] === true, `stato prodotto non registra ${key}`);
assert(state.revision_trigger_ux_implemented === false, 'ImplementationObservation anticipa impropriamente la UX RevisionTrigger');

console.log('PRACTICE_REVIEW_PASS');
