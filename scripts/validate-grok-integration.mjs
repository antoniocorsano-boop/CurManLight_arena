import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];

function read(path) {
  try {
    return readFileSync(join(root, path), 'utf8');
  } catch (error) {
    errors.push(`missing/unreadable ${path}: ${error.message}`);
    return '';
  }
}

function parseJson(path) {
  const text = read(path);
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch (error) {
    errors.push(`invalid JSON ${path}: ${error.message}`);
    return null;
  }
}

function expect(condition, message) {
  if (!condition) errors.push(message);
}

const decisionPath = 'docs/architecture/ARENA_GROK_BUILD_EXTERNAL_EXECUTOR_DECISION_V1.md';
const schemaPath = 'docs/architecture/CML_ARENA_AGENT_EXECUTION_EVIDENCE_SCHEMA_V1.json';
const registryPath = 'docs/architecture/CML_ARENA_AGENT_EXECUTOR_REGISTRY_V1.json';
const runbookPath = 'docs/GROK_BUILD_ARENA_RUNBOOK.md';
const sandboxPath = '.grok/sandbox.toml';
const wrapperPath = 'scripts/grok-arena.mjs';
const benchmarkPath = 'scripts/agent-benchmark.mjs';
const workflowPath = '.github/workflows/agent-executor-contract.yml';

const decision = read(decisionPath);
const schema = parseJson(schemaPath);
const registry = parseJson(registryPath);
const runbook = read(runbookPath);
const sandbox = read(sandboxPath);
const wrapper = read(wrapperPath);
const benchmark = read(benchmarkPath);
const workflow = read(workflowPath);
const gitignore = read('.gitignore');
const pkg = parseJson('package.json');

expect(decision.includes('DEVELOPMENT_TOOLING_ONLY'), 'decision must classify Grok Build as development tooling only');
expect(decision.includes('authority.claim = "NONE"'), 'decision must freeze authority NONE');
expect(decision.includes('cannot close S3'), 'decision must preserve the current S3 human gate');

const authorityProperties = schema?.properties?.authority?.properties;
expect(schema?.properties?.schemaVersion?.const === 'CML-ARENA-AGENT-EXECUTION-EVIDENCE-V1', 'evidence schema version must be frozen');
expect(authorityProperties?.claim?.const === 'NONE', 'evidence schema must force authority.claim NONE');
expect(authorityProperties?.promotionAllowed?.const === false, 'evidence schema must force promotionAllowed=false');
expect(authorityProperties?.humanVerdict?.const === false, 'evidence schema must force humanVerdict=false');
expect(schema?.properties?.output?.properties?.rawArtifactTracked?.const === false, 'raw agent artifact must be structurally non-tracked');

expect(registry?.authorityModel?.externalExecutorAuthority === 'NONE', 'executor registry must grant no external authority');
expect(registry?.authorityModel?.promotionAllowed === false, 'executor registry must deny promotion');
expect(Array.isArray(registry?.executors) && registry.executors.length >= 3, 'executor registry must define auditor, implementer and untrusted profiles');
for (const executor of registry?.executors || []) {
  expect(executor.mayMerge === false, `${executor.id}: mayMerge must be false`);
  expect(executor.mayDeploy === false, `${executor.id}: mayDeploy must be false`);
  expect(executor.mayPromote === false, `${executor.id}: mayPromote must be false`);
  expect(executor.mayIssueHumanVerdict === false, `${executor.id}: mayIssueHumanVerdict must be false`);
}
const implementer = (registry?.executors || []).find((item) => item.id === 'GROK_BUILD_IMPLEMENTER');
expect(implementer?.requiresNonMainBranch === true, 'GROK_BUILD_IMPLEMENTER must require a non-main branch');

for (const profile of ['arena-auditor', 'arena-implementer', 'arena-untrusted']) {
  expect(sandbox.includes(`[profiles.${profile}]`), `sandbox profile missing: ${profile}`);
}
for (const deniedSecret of ['**/.env', '**/*.pem', '**/*.key']) {
  expect(sandbox.includes(`"${deniedSecret}"`), `sandbox secret deny missing: ${deniedSecret}`);
}

for (const invariant of [
  "authority: {\n    claim: 'NONE'",
  "branch === 'main'",
  "Bash(git push*)",
  "Bash(git merge*)",
  "Bash(gh pr merge*)",
  "Bash(surge*)",
  "Bash(vercel*)",
  'platformPolicy(mode)',
  'RAW_RUN_DIR',
]) {
  expect(wrapper.includes(invariant), `governed wrapper invariant missing: ${invariant}`);
}

expect(gitignore.split(/\r?\n/).includes('.agent-runs/'), '.agent-runs/ must be gitignored');
expect(runbook.includes('npm run agent:grok:audit'), 'runbook must expose the governed audit command');
expect(runbook.includes('npm run agent:grok:code'), 'runbook must expose the governed code command');
expect(benchmark.includes('CML-ARENA-AGENT-EXECUTION-EVIDENCE-V1'), 'benchmark must consume normalized v1 evidence');

expect(pkg?.scripts?.['agent:grok:audit'] === 'node scripts/grok-arena.mjs audit', 'package script agent:grok:audit missing or changed');
expect(pkg?.scripts?.['agent:grok:code'] === 'node scripts/grok-arena.mjs code', 'package script agent:grok:code missing or changed');
expect(pkg?.scripts?.['agent:grok:untrusted'] === 'node scripts/grok-arena.mjs untrusted', 'package script agent:grok:untrusted missing or changed');
expect(pkg?.scripts?.['agent:benchmark'] === 'node scripts/agent-benchmark.mjs', 'package script agent:benchmark missing or changed');
expect(pkg?.scripts?.['agent:integration:verify'] === 'node scripts/validate-grok-integration.mjs', 'package script agent:integration:verify missing or changed');
expect(!Object.keys(pkg?.dependencies || {}).some((name) => /grok|xai/i.test(name)), 'Grok Build must not become a product runtime dependency');

expect(workflow.includes('node scripts/validate-grok-integration.mjs'), 'CI workflow must execute the agent integration validator');
expect(workflow.includes('pull_request:'), 'agent integration contract must run on pull requests');

if (errors.length) {
  console.error('ARENA_AGENT_EXECUTOR_CONTRACT_FAIL');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('ARENA_AGENT_EXECUTOR_CONTRACT_PASS');
