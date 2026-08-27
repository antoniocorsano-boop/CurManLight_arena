const { chromium } = require('playwright');
const { createClient } = require('@supabase/supabase-js');
const { randomBytes, randomUUID } = require('node:crypto');
const fs = require('node:fs');

const baseUrl = process.env.BETA_BASE_URL || 'http://127.0.0.1:4173/CurManLight_arena';
const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const runId = process.env.GITHUB_RUN_ID || String(Date.now());

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.');
}

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const email = `cml-g4-${runId}-${randomBytes(4).toString('hex')}@example.com`;
const password = `G4!${randomBytes(24).toString('base64url')}aA1`;
const workspaceId = randomUUID();
let userId = null;
let receiptId = null;
let membershipProvisioned = false;
let workspaceProvisioned = false;

const evidence = {
  schema: 'CML_ARENA_BETA_G4_AUTHORIZED_REHEARSAL_V1',
  gate: 'BETA-G4',
  observedAt: new Date().toISOString(),
  backendProject: 'ysgaokenrutmgzkhcxvy',
  accountCreation: 'SUPABASE_AUTH_SIGNUP_VIA_BETA_UI',
  authorityProvisioning: 'PRIVILEGED_SERVER_SIDE_MEMBERSHIP',
  membershipRole: 'collegio',
  workspaceId,
  outcome: 'return-for-revision',
  checks: [],
  cleanup: {
    membershipStatus: 'pending',
    workspaceStatus: 'pending',
    identityRetainedForReceiptFk: true,
  },
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

async function findCreatedUser() {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (error) throw error;
    const found = data.users.find(user => user.email === email);
    if (found) return found;
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  return null;
}

async function ensureAuthenticatedSession(page) {
  const identityUrl = `${baseUrl.replace(/\/$/, '')}/beta-identity`;
  await page.goto(identityUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await closeLocalProfileIfPresent(page);

  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Crea account Beta' }).click();

  const createdUser = await findCreatedUser();
  record('1. Account is created through the Beta signUp flow', Boolean(createdUser));
  userId = createdUser.id;

  const sessionHeading = page.getByRole('heading', { name: 'Sessione autenticata' });
  if (!(await sessionHeading.isVisible({ timeout: 2500 }).catch(() => false))) {
    const { error: confirmError } = await admin.auth.admin.updateUserById(userId, { email_confirm: true });
    if (confirmError) throw confirmError;
    await page.getByRole('button', { name: 'Accedi' }).click();
  }

  await sessionHeading.waitFor({ state: 'visible', timeout: 8000 });
  const pageUserId = (await page.locator('dl code').first().textContent())?.trim();
  record('2. Normal email/password session is active in the browser', pageUserId === userId);
}

async function provisionAuthority(page) {
  const { error: workspaceError } = await admin.from('workspaces').insert({
    id: workspaceId,
    name: `BETA-G4 authorized rehearsal ${runId}`,
    status: 'active',
    created_by: userId,
  });
  if (workspaceError) throw workspaceError;
  workspaceProvisioned = true;

  const { error: membershipError } = await admin.from('workspace_memberships').insert({
    workspace_id: workspaceId,
    user_id: userId,
    role: 'collegio',
    status: 'active',
  });
  if (membershipError) throw membershipError;
  membershipProvisioned = true;

  await page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 });
  await closeLocalProfileIfPresent(page);
  await page.getByText('ruolo collegio', { exact: false }).waitFor({ state: 'visible', timeout: 8000 });
  await page.getByText('stato active', { exact: false }).waitFor({ state: 'visible', timeout: 8000 });
  record('3. Browser resolves an active server-backed collegio membership', true);
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
  await panel.getByText('Membership verificata:', { exact: false }).waitFor({ state: 'visible', timeout: 8000 });
  record('4. Authorized institutional decision panel is reachable', (await panel.innerText()).includes('collegio'));
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
  await panel.getByText('Anteprima della conseguenza', { exact: false }).waitFor({ state: 'visible', timeout: 5000 });
  await panel.getByRole('checkbox').check();
  await panel.getByRole('button', { name: 'Conferma e registra decisione' }).click();
  await panel.getByText('Decisione istituzionale registrata', { exact: false }).waitFor({ state: 'visible', timeout: 10000 });

  record('5. Exactly one consequential decision RPC is emitted', rpcCalls === 1, `rpcCalls=${rpcCalls}`);

  const { data: rows, error } = await admin
    .from('institutional_revision_decisions')
    .select('id,workspace_id,outcome,authority_role,decided_by,proposal_ref,proposal_version_ref,proposal_version_fingerprint')
    .eq('workspace_id', workspaceId)
    .eq('decided_by', userId)
    .order('decided_at', { ascending: false })
    .limit(1);
  if (error) throw error;
  const receipt = rows?.[0];
  record('6. Server persisted one append-only institutional receipt', Boolean(receipt));
  record('7. Persisted receipt is bound to collegio and return-for-revision', receipt?.authority_role === 'collegio' && receipt?.outcome === 'return-for-revision');
  record('8. Persisted receipt carries a SHA-256 proposal-version fingerprint', /^[a-f0-9]{64}$/.test(receipt?.proposal_version_fingerprint || ''));
  receiptId = receipt.id;
  evidence.receiptId = receipt.id;
  evidence.proposalRef = receipt.proposal_ref;
  evidence.proposalVersionRef = receipt.proposal_version_ref;
  evidence.proposalVersionFingerprint = receipt.proposal_version_fingerprint;
}

async function verifyRefreshReentry(page) {
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 });
  await closeLocalProfileIfPresent(page);
  const panel = page.getByRole('region', { name: 'Decisione istituzionale Beta' }).first();
  await panel.waitFor({ state: 'visible', timeout: 8000 });
  await panel.getByText('Ricevuta istituzionale già presente', { exact: false }).waitFor({ state: 'visible', timeout: 10000 });
  const text = await panel.innerText();
  record('9. Refresh/re-entry reloads the real institutional receipt', text.includes(receiptId));
  record('10. Proposal remains in decision workflow; receipt does not auto-mutate curriculum', await page.getByText('In attesa di decisione istituzionale autenticata', { exact: false }).first().isVisible());
}

async function cleanupAuthority() {
  if (membershipProvisioned) {
    const { error } = await admin
      .from('workspace_memberships')
      .update({ status: 'revoked', updated_at: new Date().toISOString() })
      .eq('workspace_id', workspaceId)
      .eq('user_id', userId);
    if (error) throw error;
    evidence.cleanup.membershipStatus = 'revoked';
  }
  if (workspaceProvisioned) {
    const { error } = await admin
      .from('workspaces')
      .update({ status: 'archived', updated_at: new Date().toISOString() })
      .eq('id', workspaceId);
    if (error) throw error;
    evidence.cleanup.workspaceStatus = 'archived';
  }
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
    await provisionAuthority(page);
    const panel = await createProposalAndReachDecision(page);
    await recordInstitutionalDecision(page, panel);
    await verifyRefreshReentry(page);
    record('11. No uncaught browser errors occurred', pageErrors.length === 0, `pageErrors=${pageErrors.length}`);
    evidence.result = 'PASS';
  } catch (error) {
    evidence.result = 'FAIL';
    evidence.error = error instanceof Error ? error.message : String(error);
    console.error(error);
    process.exitCode = 1;
  } finally {
    try {
      await cleanupAuthority();
    } catch (cleanupError) {
      evidence.cleanup.error = cleanupError instanceof Error ? cleanupError.message : String(cleanupError);
      evidence.result = 'FAIL';
      process.exitCode = 1;
    }
    fs.mkdirSync('artifacts', { recursive: true });
    fs.writeFileSync('artifacts/beta-g4-authorized-evidence.json', JSON.stringify(evidence, null, 2));
    await browser.close();
  }
})();
