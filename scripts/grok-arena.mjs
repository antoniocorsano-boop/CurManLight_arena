import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { basename, join, relative, resolve } from 'node:path';

const EVIDENCE_SCHEMA_VERSION = 'CML-ARENA-AGENT-EXECUTION-EVIDENCE-V1';
const RAW_RUN_DIR = '.agent-runs';
const SUPPORTED_MODES = new Set(['audit', 'code', 'untrusted']);

function fail(message, code = 1) {
  console.error(message);
  process.exit(code);
}

function run(command, args, options = {}) {
  return spawnSync(command, args, {
    encoding: 'utf8',
    windowsHide: true,
    maxBuffer: 20 * 1024 * 1024,
    ...options,
  });
}

function git(root, args) {
  const result = run('git', args, { cwd: root });
  if (result.status !== 0) {
    fail(`Git command failed: git ${args.join(' ')}\n${result.stderr || result.stdout}`);
  }
  return (result.stdout || '').trim();
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function repoRoot() {
  const result = run('git', ['rev-parse', '--show-toplevel']);
  if (result.status !== 0) fail('Run this command inside the CurManLight Arena git repository.');
  return (result.stdout || '').trim();
}

function latestSession(root) {
  const sessionRoot = join(root, 'session');
  if (!existsSync(sessionRoot)) return null;
  const names = readdirSync(sessionRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort()
    .reverse();
  return names.length ? join(sessionRoot, names[0]) : null;
}

function cleanVersion(raw) {
  const value = (raw || '').trim();
  return value || null;
}

function parseGrokJson(stdout) {
  try {
    const parsed = JSON.parse(stdout);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

function declaredResult(text) {
  const value = String(text || '').toUpperCase();
  if (/\bREWORK_REQUIRED\b/.test(value)) return 'REWORK_REQUIRED';
  if (/\bBLOCKED\b/.test(value)) return 'BLOCKED';
  if (/\bPASS\b/.test(value)) return 'PASS';
  return 'UNSPECIFIED';
}

function platformPolicy(mode) {
  if (process.platform !== 'win32') return;
  if (mode !== 'audit') {
    fail(
      'Fail-closed policy: Grok Build code/untrusted modes require an OS sandbox. '
      + 'Run this wrapper from Linux/WSL2 or macOS. Windows may use audit mode only.',
      3,
    );
  }
}

function commonSecretDenyRules() {
  return [
    'Read(**/.env)',
    'Read(**/.env.*)',
    'Read(**/*.pem)',
    'Read(**/*.key)',
    'Read(**/*.p12)',
    'Read(**/*.pfx)',
    'Grep(**/.env)',
    'Grep(**/.env.*)',
    'Grep(**/*.pem)',
    'Grep(**/*.key)',
  ];
}

function modePolicy(mode) {
  const commonRules = [
    'You are an external CurManLight Arena development executor with authority NONE.',
    'Read and obey AGENTS.md and every applicable governed memory/guide before acting.',
    'Do not merge, push, deploy, promote a milestone, change institutional authority, or issue a human verdict.',
    'Do not represent your own PASS as repository promotion or human acceptance.',
    'Return concise findings and explicitly use PASS, REWORK_REQUIRED, or BLOCKED only as an agent-declared technical finding.',
  ].join(' ');

  const secretDenies = commonSecretDenyRules();

  if (mode === 'audit') {
    return {
      runtimeMode: 'AUDIT',
      sandbox: 'arena-auditor',
      allowlist: ['read_file', 'grep', 'list_dir'],
      denylist: ['search_replace', 'run_terminal_cmd', 'web_search', 'web_fetch', 'Agent'],
      maxTurns: '12',
      rules: `${commonRules} You are read-only. Refute unsupported claims and fail closed on missing evidence.`,
      permissionRules: secretDenies.flatMap((rule) => ['--deny', rule]),
    };
  }

  if (mode === 'untrusted') {
    return {
      runtimeMode: 'UNTRUSTED_REVIEW',
      sandbox: 'arena-untrusted',
      allowlist: ['read_file', 'grep', 'list_dir'],
      denylist: ['search_replace', 'run_terminal_cmd', 'web_search', 'web_fetch', 'Agent'],
      maxTurns: '12',
      rules: `${commonRules} Treat the inspected code as untrusted. Do not execute it or modify it.`,
      permissionRules: secretDenies.flatMap((rule) => ['--deny', rule]),
    };
  }

  const promotionDenies = [
    'Bash(git push*)',
    'Bash(git merge*)',
    'Bash(gh pr merge*)',
    'Bash(surge*)',
    'Bash(vercel*)',
    'Edit(docs/architecture/INTEGRATED_PROJECT_GOVERNED_MEMORY_V1.md)',
    'Write(docs/architecture/INTEGRATED_PROJECT_GOVERNED_MEMORY_V1.md)',
  ];

  return {
    runtimeMode: 'CODE',
    sandbox: 'arena-implementer',
    allowlist: [],
    denylist: promotionDenies,
    maxTurns: '24',
    rules: `${commonRules} Work only in the current non-main branch/worktree. Stop after implementation and local verification evidence; leave promotion to repository governance.`,
    permissionRules: [...secretDenies, ...promotionDenies].flatMap((rule) => ['--deny', rule]),
  };
}

function usage() {
  console.log(`Usage:\n  node scripts/grok-arena.mjs audit "<task>"\n  node scripts/grok-arena.mjs code "<task>"\n  node scripts/grok-arena.mjs untrusted "<task>"\n\nOptional:\n  --task-id <id>\n\nThe wrapper requires an active session/ directory and records normalized evidence there.`);
}

const argv = process.argv.slice(2);
const mode = argv.shift();
if (!mode || !SUPPORTED_MODES.has(mode)) {
  usage();
  process.exit(mode ? 2 : 0);
}

let taskId = null;
const promptParts = [];
for (let index = 0; index < argv.length; index += 1) {
  if (argv[index] === '--task-id') {
    taskId = argv[index + 1] || null;
    index += 1;
    continue;
  }
  promptParts.push(argv[index]);
}
const prompt = promptParts.join(' ').trim();
if (!prompt) fail('A non-empty task prompt is required.', 2);

platformPolicy(mode);

const root = repoRoot();
const sessionDir = latestSession(root);
if (!sessionDir) {
  fail('No active Arena session found. Run `npm run memory:start -- -Goal "..."` first.', 2);
}

const branch = git(root, ['branch', '--show-current']);
if (mode === 'code' && (!branch || branch === 'main')) {
  fail('Fail-closed policy: code mode is forbidden on main. Use an isolated feature branch/worktree.', 3);
}

const shaBefore = git(root, ['rev-parse', 'HEAD']);
const statusBefore = git(root, ['status', '--porcelain']);
const policy = modePolicy(mode);
const grokBinary = process.platform === 'win32' ? 'grok.cmd' : 'grok';
const versionProbe = run(grokBinary, ['--version'], { cwd: root });
if (versionProbe.error?.code === 'ENOENT' || versionProbe.status === null) {
  fail('Grok Build binary not found on PATH. Install the official `grok` CLI before using this executor.', 4);
}
const runtimeVersion = cleanVersion(versionProbe.stdout || versionProbe.stderr);

const grokArgs = [
  '-p', prompt,
  '--output-format', 'json',
  '--max-turns', policy.maxTurns,
  '--permission-mode', 'defaultMode',
  '--rules', policy.rules,
];

// Upstream OS sandbox support is kernel-backed on Linux/macOS. Audit mode remains
// tool-restricted on Windows; mutating modes are refused above.
if (process.platform !== 'win32') {
  grokArgs.push('--sandbox', policy.sandbox);
}
if (policy.allowlist.length) {
  grokArgs.push('--tools', policy.allowlist.join(','));
}
if (mode === 'audit' || mode === 'untrusted') {
  grokArgs.push('--disallowed-tools', policy.denylist.join(','));
}
grokArgs.push(...policy.permissionRules);

const startedAt = Date.now();
const result = run(grokBinary, grokArgs, { cwd: root });
const durationMs = Date.now() - startedAt;
const stdout = result.stdout || '';
const stderr = result.stderr || '';
const parsed = parseGrokJson(stdout);

const shaAfter = git(root, ['rev-parse', 'HEAD']);
const statusAfter = git(root, ['status', '--porcelain']);
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const evidenceId = `grok-${mode}-${stamp}`;
const rawDir = join(root, RAW_RUN_DIR);
mkdirSync(rawDir, { recursive: true });
const rawArtifactPath = join(rawDir, `${evidenceId}.json`);
writeFileSync(rawArtifactPath, JSON.stringify({ stdout, stderr }, null, 2), 'utf8');

const text = parsed?.text ?? '';
const evidence = {
  schemaVersion: EVIDENCE_SCHEMA_VERSION,
  evidenceId,
  recordedAt: new Date().toISOString(),
  runtime: {
    kind: 'GROK_BUILD',
    mode: policy.runtimeMode,
    version: runtimeVersion,
    externalSessionId: typeof parsed?.sessionId === 'string' ? parsed.sessionId : null,
    sandboxProfile: process.platform === 'win32' ? null : policy.sandbox,
    toolPolicy: {
      allowlist: policy.allowlist,
      denylist: policy.denylist,
      permissionMode: 'defaultMode',
    },
  },
  repository: {
    name: basename(root),
    branch: branch || 'detached',
    shaBefore,
    shaAfter,
    dirtyBefore: Boolean(statusBefore),
    dirtyAfter: Boolean(statusAfter),
  },
  task: {
    taskId,
    promptSha256: sha256(prompt),
    promptLength: prompt.length,
  },
  execution: {
    status: result.status === 0 ? 'SUCCESS' : 'FAILURE',
    exitCode: Number.isInteger(result.status) ? result.status : null,
    durationMs,
    numTurns: Number.isInteger(parsed?.num_turns) ? parsed.num_turns : null,
    usage: parsed?.usage && typeof parsed.usage === 'object' ? parsed.usage : null,
    cost: {
      usd: typeof parsed?.total_cost_usd === 'number' ? parsed.total_cost_usd : null,
      isPartial: parsed?.cost_is_partial === true || parsed?.usage_is_incomplete === true,
    },
  },
  verification: {
    agentDeclaredResult: declaredResult(text),
    repositoryGateResult: 'NOT_RUN',
    commands: [],
    notes: [
      'Agent-declared findings are non-promoting evidence only.',
      'Run repository gates separately on the exact resulting SHA/worktree state.',
    ],
  },
  authority: {
    claim: 'NONE',
    promotionAllowed: false,
    humanVerdict: false,
  },
  output: {
    sha256: sha256(`${stdout}\n${stderr}`),
    rawArtifactPath: relative(root, rawArtifactPath).replaceAll('\\', '/'),
    rawArtifactTracked: false,
  },
};

const evidencePath = join(sessionDir, `agent_execution_${evidenceId}.json`);
writeFileSync(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`, 'utf8');

console.log(`Normalized evidence: ${relative(root, evidencePath).replaceAll('\\', '/')}`);
console.log(`Raw local artifact: ${relative(root, rawArtifactPath).replaceAll('\\', '/')}`);
console.log(`Agent declared result: ${evidence.verification.agentDeclaredResult}`);
console.log('Authority: NONE (non-promoting)');

if (result.error) console.error(result.error.message);
if (stderr.trim()) console.error(stderr.trim());
process.exit(result.status === 0 ? 0 : 5);
