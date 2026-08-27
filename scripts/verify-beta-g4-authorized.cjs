const { chromium } = require('playwright');
const { randomBytes } = require('node:crypto');
const fs = require('node:fs');

const baseUrl = process.env.BETA_BASE_URL || 'http://127.0.0.1:4173/CurManLight_arena';
const runId = process.env.GITHUB_RUN_ID || String(Date.now());
const email = `cml-g4-${runId}-${randomBytes(4).toString('hex')}@example.com`;
const password = `G4!${randomBytes(24).toString('base64url')}aA1`;

let userId = null;
let workspaceId = null;
let receiptId = null;

const evidence = {
  schema: 'CML_ARENA_BETA_G4_AUTHORIZED_REHEARSAL_V1',
  gate: 'BETA-G4',
  observedAt: new Date().toISOString(),
  backendProject: 'ysgaokenrutmgzkhcxvy',
  accountCreation: 'SUPABASE_AUTH_SIGNUP_VIA_BETA_UI',
  authorityProvisioning: 'EXTERNAL_PRIVILEGED_MEMBERSHIP_GRANT',
  membershipRole: 'collegio',
  outcome: 'return-for-revision',
  checks: [],
  cleanupRequired: true,
};

function record(label, condition, detail) {
  const passed = Boolean(condition);
  evidence.checks.push({ label, passed, ...(detail ? { detail } : {}) });
  console.log(`${passed ? '✓' : '✗'} ${label}${detail ? ` — ${detail}` : ''}`);
  if (!passed) throw new Error(`G4 check failed: ${label}`);
}

async function closeLocalProfileIfPresent(page) {
  await page.waitForTimeout(600);
  const dialog = page.locator('[role="dialog"][aria-modal="true"]');
  if (!(await dialog.isVisible({ timeout: 700 }).catch(() => false))) return;
  const closeButton = dialog.locator('button').first();
  if (await closeButton.isVisible({ timeout: 500 }).catch(() => false)) {
    await closeButton.click();
    await dialog.waitFor({ state: 'hidden', timeout: 2500 }).catch(() => undefined);
  }
}

async function ensureAuthenticatedSession(page) {
  const identityUrl = `${baseUrl.replace(/\/$/, '')}/beta-identity`;
  await page.goto(identityUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await closeLocalProfileIfPresent(page);

  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Crea account Beta' }).click();

  const sessionHeading = page.getByRole('heading', { name: 'Sessione autenticata' });
  await sessionHeading.waitFor({ state: 'visible', timeout: 12000 }).catch(() => undefined);
  if (!(await sessionHeading.isVisible().catch(() => false))) {
    throw new Error('BETA_SIGNUP_REQUIRES_EMAIL_CONFIRMATION_OR_DID_NOT_CREATE_SESSION');
  }

  userId = (await page.locator('dl code').first().textContent())?.trim() || null;
  record('1. Account is created through Beta signUp and browser session is active', /^[0-9a-f-]{36}$/i.test(userId || ''));
  evidence.userId = userId;
  console.log(`BETA_G4_AUTH_USER_ID=${userId}`);
}

async function waitForExternalAuthorityGrant(page) {
  console.log('BETA_G4_WAITING_FOR_EXTERNAL_COLLEGIO_GRANT');
  for (let attempt = 1; attempt <= 120; attempt += 1) {
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 });
    await closeLocalProfileIfPresent(page);
    const body = await page.locator('body').innerText();
    const activeCollegio = body.includes('ruolo collegio') && body.includes('stato active');
    if (activeCollegio) {
      const match = body.match(/workspace\s+([0-9a-f-]{36})\s+·\s+ruolo\s+collegio\s+·\s+stato\s+active/i);
      workspaceId = match?.[1] || null;
      record('2. Browser resolves an intentionally granted active collegio membership', Boolean(workspaceId));
      evidence.workspaceId = workspaceId;
      console.log(`BETA_G4_WORKSPACE_ID=${workspaceId}`);
      return;
    }
    if (attempt % 6 === 0) console.log(`BETA_G4_STILL_WAITING attempt=${attempt}`);
    await page.waitForTimeout(5000);
  }
  throw new Error('BETA_G4_EXTERNAL_AUTHORITY_GRANT_TIMEOUT');
}

async function createProposalAndReachDecision(page) {
  const revisionUrl = `${baseUrl.replace(/\/$/, '')}/revisione`;
  await page.goto(revisionUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await closeLocalProfileIfPresent(page);
  await page.getByText('Revisione del Curricolo: Gap 2025', { exact: false }).first().waitFor({ state: 'visible', timeout: 8000 });

  const localChoice = page.getByRole('button', { name: 'Usa testo 2025' }).first();
  await localChoice.waitFor({ state: 'visible', timeout: 8000 });
  await localChoice.click();

  const starter = page.getByRole('region', { name: 'Avvio proposta strutturata Beta' });
  await starter.waitFor({ state: 'visible', timeout: 5000 });
  await starter.locator('select').selectOption({ index: 1 });
  await starter.locator('textarea').fill('Rehearsal BETA-G4: proposta strutturata destinata esclusivamente alla verifica del boundary istituzionale.');
  await starter.getByRole('button', { name: 'Crea proposta strutturata' }).click();

  const prepareButton = page.getByRole('button', { name: 'Prepara per revisione' }).first();
  await prepareButton.waitFor({ state: 'visible', timeout: 5000 });
  await prepareButton.click();
  await page.getByRole('button', { name: 'Invia', exact: true }).first().click();
  await page.getByRole('button', { name: 'Prendi in carico' }).first().click();
  await page.getByRole('button', { name: 'Ammetti alla decisione' }).first().click();

  const panel = page.getByRole('region', { name: 'Decisione istituzionale Beta' }).first();
  await panel.waitFor({ state: 'visible', timeout: 8000 });
  const panelText = await panel.innerText();
  record('3. Authorized institutional decision panel is reachable', panelText.includes('Membership verificata: collegio'));
  return panel;
}

async function recordInstitutionalDecision(page, panel) {
  let rpcCalls = 0;
  page.on('request', request => {
    if (request.url().includes('/rpc/record_institutional_revision_decision')) rpcCalls += 1;
  });

  await panel.getByLabel('Esito proposto').selectOption('return-for-revision');
  await panel.getByLabel('Motivazione della decisione').fill(
    'La proposta viene restituita per revisione nel rehearsal BETA-G4; nessuna modifica del curricolo deve essere applicata automaticamente.'
  );
  await panel.getByRole('button', { name: 'Rivedi prima di registrare' }).click();
  const preview = panel.getByText('Anteprima della conseguenza', { exact: false });
  await preview.waitFor({ state: 'visible', timeout: 5000 });
  const fingerprintText = await panel.locator('code.break-all').first().textContent().catch(() => null);
  if (fingerprintText && /^[a-f0-9]{64}$/.test(fingerprintText.trim())) {
    evidence.proposalVersionFingerprint = fingerprintText.trim();
  }

  await panel.getByRole('checkbox').check();
  await panel.getByRole('button', { name: 'Conferma e registra decisione' }).click();
  await panel.getByText('Decisione istituzionale registrata', { exact: false }).waitFor({ state: 'visible', timeout: 10000 });
  record('4. Exactly one consequential decision RPC is emitted', rpcCalls === 1, `rpcCalls=${rpcCalls}`);

  await panel.getByText('Ricevuta istituzionale già presente', { exact: false }).waitFor({ state: 'visible', timeout: 10000 });
  const panelText = await panel.innerText();
  const receiptMatch = panelText.match(/Ricevuta:\s*([0-9a-f-]{36})/i);
  receiptId = receiptMatch?.[1] || null;
  record('5. Browser receives a persisted institutional receipt', Boolean(receiptId));
  record('6. Receipt displays the returned-for-revision outcome', panelText.includes('Restituisce per revisione'));
  record('7. Receipt fingerprint matches the currently displayed proposal version', panelText.includes('L’impronta corrisponde alla versione attualmente mostrata.'));
  evidence.receiptId = receiptId;
}

async function verifyRefreshReentry(page) {
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 });
  await closeLocalProfileIfPresent(page);
  const panel = page.getByRole('region', { name: 'Decisione istituzionale Beta' }).first();
  await panel.waitFor({ state: 'visible', timeout: 8000 });
  await panel.getByText('Ricevuta istituzionale già presente', { exact: false }).waitFor({ state: 'visible', timeout: 10000 });
  const text = await panel.innerText();
  record('8. Refresh/re-entry reloads the same real institutional receipt', Boolean(receiptId) && text.includes(receiptId));
  record('9. Proposal remains in decision workflow; receipt does not auto-mutate curriculum', await page.getByText('In attesa di decisione istituzionale autenticata', { exact: false }).first().isVisible());
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: 'it-IT' });
  const page = await context.newPage();
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));

  try {
    console.log('=== BETA-G4 AUTHORIZED REAL-MEMBERSHIP REHEARSAL ===');
    await ensureAuthenticatedSession(page);
    await waitForExternalAuthorityGrant(page);
    const panel = await createProposalAndReachDecision(page);
    await recordInstitutionalDecision(page, panel);
    await verifyRefreshReentry(page);
    record('10. No uncaught browser errors occurred', pageErrors.length === 0, `pageErrors=${pageErrors.length}`);
    evidence.result = 'PASS';
  } catch (error) {
    evidence.result = 'FAIL';
    evidence.error = error instanceof Error ? error.message : String(error);
    console.error(error);
    process.exitCode = 1;
  } finally {
    fs.mkdirSync('artifacts', { recursive: true });
    fs.writeFileSync('artifacts/beta-g4-authorized-evidence.json', JSON.stringify(evidence, null, 2));
    await browser.close();
  }
})();
