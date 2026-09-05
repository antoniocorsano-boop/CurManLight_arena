import { readdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(process.argv[2] ?? process.cwd());
const humanDir = resolve(root, '.human');
const failures = [];
const passes = [];

function fail(message) { failures.push(message); }
function pass(message) { passes.push(message); }

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

async function readText(path) {
  return readFile(path, 'utf8');
}

let config;
try {
  config = await readJson(resolve(humanDir, 'him.config.json'));
  pass('Contract');
} catch (error) {
  fail(`Contract: ${error.message}`);
}

if (config) {
  if (!/^1\./.test(config.human_model_version ?? '')) fail('Version: human_model_version deve essere 1.x');
  if (!['HIM-L1', 'HIM-L2', 'HIM-L3'].includes(config.profile)) fail('Profile: valore non valido');
  if (!config.product?.id) fail('Product: id mancante');
  if (config.requirements?.human_task_required !== true) fail('Requirements: human_task_required deve essere true');
}

let taskFiles = [];
try {
  taskFiles = (await readdir(resolve(humanDir, 'tasks'))).filter((name) => name.endsWith('.json'));
} catch (error) {
  fail(`Human Tasks: ${error.message}`);
}

if (config?.requirements?.human_task_required && taskFiles.length === 0) {
  fail('Human Tasks: nessun task dichiarato');
}

for (const file of taskFiles) {
  try {
    const task = await readJson(resolve(humanDir, 'tasks', file));
    const required = ['id', 'actor', 'intent', 'success', 'primary_action', 'failure_states', 'recovery', 'patterns'];
    for (const key of required) if (task[key] === undefined) fail(`${file}: campo ${key} mancante`);
    if (!/^HT-[A-Z0-9][A-Z0-9_-]*$/.test(task.id ?? '')) fail(`${file}: id non conforme`);
    if (!Array.isArray(task.failure_states) || task.failure_states.length === 0) fail(`${file}: failure_states vuoto`);
    if (!Array.isArray(task.patterns) || task.patterns.length === 0) fail(`${file}: patterns vuoto`);
    if (Array.isArray(task.secondary_actions) && task.secondary_actions.length > 2) fail(`${file}: più di due azioni secondarie`);
    if (task.recovery?.required === true && (!Array.isArray(task.recovery.strategies) || task.recovery.strategies.length === 0)) {
      fail(`${file}: recovery richiesta senza strategia`);
    }
    if (task.consequential === true && task.human_authority_required !== true) {
      fail(`${file}: azione consequential senza human authority boundary`);
    }
    pass(`Task ${task.id ?? file}`);
  } catch (error) {
    fail(`${file}: ${error.message}`);
  }
}

async function validateSurfaceRegistry(contract) {
  const registryRef = config?.operational_communication?.surface_registry;
  if (!registryRef) {
    fail('CCO registry: riferimento surface_registry mancante in him.config.json');
    return;
  }

  let registry;
  try {
    registry = await readJson(resolve(root, registryRef));
  } catch (error) {
    fail(`CCO registry: impossibile leggere ${registryRef}: ${error.message}`);
    return;
  }

  if (registry.registry_id !== 'CCO-SURFACES') fail('CCO registry: registry_id deve essere CCO-SURFACES');
  if (!/^1\./.test(registry.version ?? '')) fail('CCO registry: version deve essere 1.x');
  if (registry.contract !== config?.operational_communication?.contract) {
    fail('CCO registry: riferimento al contratto non coincide con him.config.json');
  }

  const allowedStatuses = new Set(['conformant', 'migration', 'guided-setup', 'excluded']);
  const declaredStatuses = new Set(registry.status_vocabulary ?? []);
  for (const status of allowedStatuses) {
    if (!declaredStatuses.has(status)) fail(`CCO registry: status_vocabulary non contiene ${status}`);
  }

  if (!Array.isArray(registry.surfaces) || registry.surfaces.length === 0) {
    fail('CCO registry: nessuna superficie registrata');
    return;
  }

  const ids = new Set();
  const conformantPaths = new Set();
  let conformantCount = 0;

  for (const surface of registry.surfaces) {
    if (!surface.id || ids.has(surface.id)) {
      fail(`CCO registry: id superficie mancante o duplicato: ${surface.id ?? 'undefined'}`);
      continue;
    }
    ids.add(surface.id);

    if (!surface.path) {
      fail(`CCO registry ${surface.id}: path mancante`);
      continue;
    }
    if (!allowedStatuses.has(surface.status)) {
      fail(`CCO registry ${surface.id}: status non valido ${surface.status ?? 'undefined'}`);
      continue;
    }

    let source;
    try {
      source = await readText(resolve(root, surface.path));
    } catch (error) {
      fail(`CCO registry ${surface.id}: impossibile leggere ${surface.path}: ${error.message}`);
      continue;
    }

    if (surface.status === 'conformant') {
      conformantCount += 1;
      conformantPaths.add(surface.path);
      if (!Array.isArray(surface.required_tokens) || surface.required_tokens.length === 0) {
        fail(`CCO registry ${surface.id}: una superficie conforme deve dichiarare required_tokens`);
      } else {
        for (const token of surface.required_tokens) {
          if (!source.includes(token)) fail(`CCO registry ${surface.id}: token richiesto assente: ${token}`);
        }
      }
      if (!surface.operational_context || !surface.primary_task) {
        fail(`CCO registry ${surface.id}: una superficie conforme deve dichiarare operational_context e primary_task`);
      }
    }

    if (surface.status === 'migration' && !surface.migration_goal?.trim()) {
      fail(`CCO registry ${surface.id}: migration richiede migration_goal`);
    }
    if ((surface.status === 'guided-setup' || surface.status === 'excluded') && !surface.reason?.trim()) {
      fail(`CCO registry ${surface.id}: ${surface.status} richiede reason`);
    }

    pass(`CCO registry surface ${surface.id} [${surface.status}]`);
  }

  if (conformantCount === 0) fail('CCO registry: deve esistere almeno una superficie conforme');

  for (const pilot of contract.pilot_surfaces ?? []) {
    if (!conformantPaths.has(pilot.path)) {
      fail(`CCO registry: la superficie pilota ${pilot.path} deve essere registrata come conformant`);
    }
  }

  pass(`CCO registry ${registry.version ?? 'unknown'}`);
}

async function validateOperationalCommunicationContract() {
  if (config?.requirements?.operational_communication_contract_required !== true) {
    fail('CCO: operational_communication_contract_required deve essere true');
    return;
  }

  const contractRef = config?.operational_communication?.contract;
  const documentationRef = config?.operational_communication?.documentation;
  if (!contractRef) {
    fail('CCO: riferimento al contratto mancante in him.config.json');
    return;
  }
  if (!documentationRef) fail('CCO: riferimento alla documentazione mancante in him.config.json');

  let contract;
  try {
    contract = await readJson(resolve(root, contractRef));
  } catch (error) {
    fail(`CCO: impossibile leggere ${contractRef}: ${error.message}`);
    return;
  }

  if (contract.contract_id !== 'CCO') fail('CCO: contract_id deve essere CCO');
  if (!/^1\./.test(contract.version ?? '')) fail('CCO: version deve essere 1.x');

  const requiredPrinciples = [
    'structure_before_explanation',
    'state_before_explanation',
    'operational_use_must_not_depend_on_training_copy',
    'trust_through_predictability',
    'progressive_disclosure_for_learning',
    'vertical_workflows_must_be_state_progressive',
    'future_steps_must_not_compete_with_current_task',
    'completed_steps_should_compact_when_possible',
    'automatic_scroll_must_not_replace_explicit_user_progression',
    'progression_requires_real_state_transition',
    'one_visible_process_hierarchy_per_task_context',
    'secondary_navigation_must_not_interrupt_primary_flow',
    'draft_actions_must_not_claim_completion_before_commit',
  ];
  for (const principle of requiredPrinciples) {
    if (contract.principles?.[principle] !== true) fail(`CCO: principio ${principle} deve essere true`);
  }

  const operationalAnswers = contract.layers?.operational?.must_answer ?? [];
  for (const answer of ['where_am_i', 'current_state', 'next_action', 'immediate_effect']) {
    if (!operationalAnswers.includes(answer)) fail(`CCO: livello operativo non risponde a ${answer}`);
  }

  if (contract.layers?.assurance?.must_not_replace_action_label !== true) {
    fail('CCO: la rassicurazione non può sostituire il nome dell’azione');
  }
  if (contract.layers?.learning?.progressive_disclosure !== true || contract.layers?.learning?.must_not_block_primary_action !== true) {
    fail('CCO: la formazione deve usare divulgazione progressiva e non bloccare l’azione primaria');
  }

  const progression = contract.layers?.workflow_progression ?? {};
  for (const invariant of [
    'required_for_multistep_vertical_surfaces',
    'current_step_must_dominate',
    'future_step_controls_should_be_hidden_until_relevant',
    'completed_step_should_become_compact_summary_when_next_stage_is_active',
    'next_step_should_appear_as_consequence_of_completed_work',
    'partial_progress_must_remain_recoverable',
    'explicit_continue_action_must_change_active_stage',
    'scrolling_alone_is_not_a_stage_transition',
    'duplicate_progress_rails_are_forbidden',
    'secondary_filters_must_use_progressive_disclosure',
  ]) {
    if (progression[invariant] !== true) fail(`CCO: workflow_progression.${invariant} deve essere true`);
  }

  const grammar = new Set((contract.action_grammar ?? []).map((item) => item.verb));
  for (const verb of ['Esamina', 'Conferma', 'Proponi una modifica', 'Registra la modifica', 'Condividi', "Registra l'esito"]) {
    if (!grammar.has(verb)) fail(`CCO: verbo canonico mancante: ${verb}`);
  }
  const reserved = new Set(contract.reserved_authority_verbs ?? []);
  for (const verb of ['Approva', 'Adotta']) {
    if (!reserved.has(verb)) fail(`CCO: verbo di autorità non riservato: ${verb}`);
  }

  for (const boundary of [
    'personal_profile_is_not_verified_role',
    'membership_is_not_authority',
    'individual_contribution_is_not_team_outcome',
    'team_outcome_is_not_institutional_decision',
  ]) {
    if (contract.authority_boundaries?.[boundary] !== true) fail(`CCO: confine di autorità ${boundary} deve essere true`);
  }

  for (const acceptance of [
    'flow_must_survive_training_copy_removal',
    'full_explanation_must_remain_reachable',
    'downstream_controls_must_not_be_fully_active_before_prerequisite',
    'completion_must_produce_visible_consequence',
    'incomplete_required_input_must_not_count_as_completed_work',
    'stage_transition_must_change_rendered_task_context',
    'no_duplicate_progress_hierarchies',
    'secondary_filters_under_progressive_disclosure',
    'draft_requires_explicit_commit',
  ]) {
    if (contract.acceptance?.[acceptance] !== true) fail(`CCO: acceptance.${acceptance} deve essere true`);
  }

  if (!Array.isArray(contract.pilot_surfaces) || contract.pilot_surfaces.length === 0) {
    fail('CCO: nessuna superficie pilota dichiarata');
  } else {
    for (const surface of contract.pilot_surfaces) {
      if (!surface.path || !Array.isArray(surface.required_tokens) || surface.required_tokens.length === 0) {
        fail('CCO: superficie pilota incompleta');
        continue;
      }
      try {
        const source = await readText(resolve(root, surface.path));
        for (const token of surface.required_tokens) {
          if (!source.includes(token)) fail(`CCO: ${surface.path} non contiene il token richiesto: ${token}`);
        }
        pass(`CCO surface ${surface.path}`);
      } catch (error) {
        fail(`CCO: impossibile leggere ${surface.path}: ${error.message}`);
      }
    }
  }

  await validateSurfaceRegistry(contract);

  if (documentationRef) {
    try {
      const docs = await readText(resolve(root, documentationRef));
      if (!docs.includes('Contratto di comunicazione operativa di Arena')) fail('CCO: documentazione canonica non riconosciuta');
      if (!docs.includes('contesto → stato → prossima azione → conseguenza immediata → approfondimento')) {
        fail('CCO: gerarchia comunicativa canonica assente dalla documentazione');
      }
      if (!docs.includes('Registro delle superfici')) fail('CCO: documentazione priva del Registro delle superfici');
      if (!docs.includes('una vera transizione di stato')) fail('CCO: documentazione priva del vincolo di vera transizione di stato');
      if (!docs.includes('Registra la modifica')) fail('CCO: documentazione priva della distinzione tra bozza e registrazione della modifica');
      pass('CCO documentation');
    } catch (error) {
      fail(`CCO: impossibile leggere la documentazione: ${error.message}`);
    }
  }

  pass(`CCO ${contract.version ?? 'unknown'}`);
}

await validateOperationalCommunicationContract();

for (const item of passes) console.log(`PASS ${item}`);
for (const item of failures) console.error(`FAIL ${item}`);

if (failures.length > 0) {
  console.error(`\nHUMAN_INTERACTION_FAIL (${failures.length})`);
  process.exit(1);
}

console.log('\nHUMAN_INTERACTION_PASS');
