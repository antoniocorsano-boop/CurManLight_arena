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

  const grammar = new Set((contract.action_grammar ?? []).map((item) => item.verb));
  for (const verb of ['Esamina', 'Conferma', 'Proponi una modifica', 'Condividi', "Registra l'esito"]) {
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

  if (contract.acceptance?.flow_must_survive_training_copy_removal !== true) {
    fail('CCO: il flusso deve restare comprensibile senza testo formativo');
  }
  if (contract.acceptance?.full_explanation_must_remain_reachable !== true) {
    fail('CCO: la spiegazione completa deve restare raggiungibile');
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

  if (documentationRef) {
    try {
      const docs = await readText(resolve(root, documentationRef));
      if (!docs.includes('Contratto di comunicazione operativa di Arena')) fail('CCO: documentazione canonica non riconosciuta');
      if (!docs.includes('contesto → stato → prossima azione → conseguenza immediata → approfondimento')) {
        fail('CCO: gerarchia comunicativa canonica assente dalla documentazione');
      }
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
