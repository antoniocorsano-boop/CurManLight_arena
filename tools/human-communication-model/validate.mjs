import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(process.argv[2] ?? process.cwd());
const configPath = resolve(root, '.human', 'hcm.config.json');
const failures = [];
const passes = [];

function fail(message) { failures.push(message); }
function pass(message) { passes.push(message); }

let config;
try {
  config = JSON.parse(await readFile(configPath, 'utf8'));
  pass('Contract');
} catch (error) {
  fail(`Contract: ${error.message}`);
}

if (config) {
  if (!/^1\./.test(config.human_communication_model_version ?? '')) {
    fail('Version: human_communication_model_version deve essere 1.x');
  }
  if (!['HCM-L1', 'HCM-L2', 'HCM-L3'].includes(config.profile)) {
    fail('Profile: valore non valido');
  }
  if (!config.product?.id) fail('Product: id mancante');
  if (!config.product?.default_locale) fail('Product: default_locale mancante');

  const requiredPrinciples = [
    'role_aware_language',
    'task_phase_aware_tone',
    'progressive_terminology',
    'memory_is_context_not_authority',
    'canonical_state_independent_from_copy',
  ];
  for (const key of requiredPrinciples) {
    if (config.principles?.[key] !== true) fail(`Principles: ${key} deve essere true`);
  }

  if (!config.roles?.default?.label) fail('Roles: default.label mancante');
  const roleTones = new Set(['plain', 'operational', 'facilitative', 'formal', 'technical']);
  for (const [roleId, role] of Object.entries(config.roles ?? {})) {
    if (!role?.label) fail(`Roles: ${roleId}.label mancante`);
    if (!roleTones.has(role?.tone)) fail(`Roles: ${roleId}.tone non valido`);
  }

  const expectedPhases = {
    ORIENT: 'plain',
    EXPLORE: 'descriptive',
    ACT: 'operational',
    REVIEW: 'precise',
    DECIDE: 'formal',
    RECOVER: 'recovery',
    COMPLETE: 'confirmatory',
  };
  for (const [phase, expectedTone] of Object.entries(expectedPhases)) {
    if (config.task_phases?.[phase] !== expectedTone) {
      fail(`Task phases: ${phase} deve usare ${expectedTone}`);
    }
  }

  if (config.terminology?.primary_layer !== 'human') {
    fail('Terminology: primary_layer deve essere human');
  }
  if (config.terminology?.technical_layer !== 'progressive-disclosure') {
    fail('Terminology: technical_layer deve essere progressive-disclosure');
  }
  if (!Array.isArray(config.terminology?.forbidden_primary_patterns) || config.terminology.forbidden_primary_patterns.length === 0) {
    fail('Terminology: forbidden_primary_patterns deve contenere almeno un pattern');
  }

  const rememberable = new Set(config.memory?.rememberable ?? []);
  const canonical = new Set(config.memory?.canonical_source_required ?? []);
  if (config.memory?.canonical_records_are_not_memory !== true) {
    fail('Memory: canonical_records_are_not_memory deve essere true');
  }
  for (const item of rememberable) {
    if (canonical.has(item)) fail(`Memory: ${item} non può essere sia rememberable sia canonical_source_required`);
  }
  for (const required of ['membership', 'decision-authority', 'institutional-decision', 'receipt']) {
    if (!canonical.has(required)) fail(`Memory: ${required} deve richiedere fonte canonica`);
  }

  if (config.authority?.role_never_implies_authority !== true) {
    fail('Authority: role_never_implies_authority deve essere true');
  }
  if (config.authority?.copy_never_grants_capability !== true) {
    fail('Authority: copy_never_grants_capability deve essere true');
  }
  if (config.authority?.verified_authority_must_come_from_domain !== true) {
    fail('Authority: verified_authority_must_come_from_domain deve essere true');
  }

  if (config.compatibility?.domain_state_remains_authoritative !== true) {
    fail('Compatibility: domain_state_remains_authoritative deve essere true');
  }

  if (failures.length === 0) pass(`Profile ${config.profile}`);
}

for (const item of passes) console.log(`PASS ${item}`);
for (const item of failures) console.error(`FAIL ${item}`);

if (failures.length > 0) {
  console.error(`\nHUMAN_COMMUNICATION_FAIL (${failures.length})`);
  process.exit(1);
}

console.log('\nHUMAN_COMMUNICATION_PASS');
