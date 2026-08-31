import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';

const SCHEMA_VERSION = 'CML-ARENA-AGENT-EXECUTION-EVIDENCE-V1';

function fail(message, code = 1) {
  console.error(message);
  process.exit(code);
}

function latestSession(root) {
  const sessionRoot = join(root, 'session');
  if (!existsSync(sessionRoot)) return null;
  const dirs = readdirSync(sessionRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort()
    .reverse();
  return dirs.length ? join(sessionRoot, dirs[0]) : null;
}

function readEvidence(path) {
  let value;
  try {
    value = JSON.parse(readFileSync(path, 'utf8'));
  } catch (error) {
    fail(`Cannot parse evidence ${path}: ${error.message}`, 2);
  }
  if (value.schemaVersion !== SCHEMA_VERSION) {
    fail(`Unsupported evidence schema in ${path}: ${value.schemaVersion || 'missing'}`, 2);
  }
  if (value.authority?.claim !== 'NONE' || value.authority?.promotionAllowed !== false || value.authority?.humanVerdict !== false) {
    fail(`Authority invariant violated by ${path}`, 3);
  }
  return { path, value };
}

function tokens(usage) {
  if (!usage || typeof usage !== 'object') return null;
  if (typeof usage.total_tokens === 'number') return usage.total_tokens;
  const input = typeof usage.input_tokens === 'number' ? usage.input_tokens : 0;
  const cached = typeof usage.cache_read_input_tokens === 'number' ? usage.cache_read_input_tokens : 0;
  const created = typeof usage.cache_creation_input_tokens === 'number' ? usage.cache_creation_input_tokens : 0;
  const output = typeof usage.output_tokens === 'number' ? usage.output_tokens : 0;
  const total = input + cached + created + output;
  return total || null;
}

const root = resolve(process.cwd());
let files = process.argv.slice(2).filter((arg) => !arg.startsWith('--'));
if (!files.length) {
  const sessionDir = latestSession(root);
  if (!sessionDir) fail('No session directory found and no evidence paths were supplied.', 2);
  files = readdirSync(sessionDir)
    .filter((name) => name.startsWith('agent_execution_') && name.endsWith('.json'))
    .map((name) => join(sessionDir, name))
    .sort();
}
if (!files.length) fail('No normalized agent execution evidence found.', 2);

const evidence = files.map((path) => readEvidence(resolve(path)));
const promptHashes = new Set(evidence.map(({ value }) => value.task.promptSha256));
const startingShas = new Set(evidence.map(({ value }) => value.repository.shaBefore));
const comparable = promptHashes.size === 1 && startingShas.size === 1;

console.log(`# Arena agent execution comparison`);
console.log('');
console.log(`Comparability: **${comparable ? 'SAME_TASK_AND_SHA' : 'NON_COMPARABLE_INPUTS'}**`);
if (!comparable) {
  console.log('Evidence uses different prompt hashes and/or starting SHAs. Do not rank executors from this set.');
}
console.log('');
console.log('| Evidence | Runtime | Mode | Status | Agent finding | Duration ms | Turns | Tokens | Cost USD | Dirty after |');
console.log('| --- | --- | --- | --- | --- | ---: | ---: | ---: | ---: | --- |');
for (const { path, value } of evidence) {
  const totalTokens = tokens(value.execution.usage);
  const cost = value.execution.cost?.usd;
  console.log(`| ${basename(path)} | ${value.runtime.kind} | ${value.runtime.mode} | ${value.execution.status} | ${value.verification.agentDeclaredResult} | ${value.execution.durationMs} | ${value.execution.numTurns ?? '-'} | ${totalTokens ?? '-'} | ${typeof cost === 'number' ? cost.toFixed(6) : '-'} | ${value.repository.dirtyAfter ? 'yes' : 'no'} |`);
}
console.log('');
console.log('Authority: **NONE for every row**. This comparison is evidence only and cannot merge, deploy, promote, close S3 or replace human acceptance.');
