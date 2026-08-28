const fs = require('fs');
const path = require('path');

const outputDir = path.resolve(process.env.HIA_OUTPUT_DIR || 'artifacts/hia');
const summaryPath = path.join(outputDir, 'summary.json');

if (!fs.existsSync(summaryPath)) {
  throw new Error(`BETA-G5 evidence summary missing: ${summaryPath}`);
}

const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
if (summary.status !== 'AUTOMATED_EVIDENCE_ONLY') {
  throw new Error(`BETA-G5 evidence is not complete: status=${String(summary.status)}`);
}

if (!Array.isArray(summary.captures)) {
  throw new Error('BETA-G5 evidence captures must be an array');
}

const requiredCaptures = new Map([
  ['planning-handoff-desktop', '05-planning-handoff-desktop.png'],
  ['planning-handoff-mobile', '07-planning-handoff-mobile.png'],
]);

for (const [label, file] of requiredCaptures) {
  const entry = summary.captures.find((capture) => capture && capture.label === label && capture.file === file);
  if (!entry) {
    throw new Error(`BETA-G5 required human-task evidence missing from summary: ${label}`);
  }
  const filePath = path.join(outputDir, file);
  if (!fs.existsSync(filePath)) {
    throw new Error(`BETA-G5 required screenshot missing: ${file}`);
  }
  const stat = fs.statSync(filePath);
  if (!stat.isFile() || stat.size === 0) {
    throw new Error(`BETA-G5 required screenshot is empty or invalid: ${file}`);
  }
}

const failedChecks = Array.isArray(summary.checks)
  ? summary.checks.filter((check) => check && check.passed === false)
  : [];
if (failedChecks.length > 0) {
  throw new Error(`BETA-G5 summary contains failed checks: ${failedChecks.map((check) => check.label).join(', ')}`);
}

console.log('BETA_G5_HIA_ARTIFACT_COMPLETE');
