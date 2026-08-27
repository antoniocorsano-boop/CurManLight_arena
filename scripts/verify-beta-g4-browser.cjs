const { chromium } = require('playwright');

const baseUrl = process.env.BETA_BASE_URL || 'http://127.0.0.1:4173/CurManLight_arena';
const revisionUrl = `${baseUrl.replace(/\/$/, '')}/revisione`;

async function closeLocalProfileIfPresent(page) {
  await page.waitForTimeout(1200);
  const dialog = page.locator('[role="dialog"][aria-modal="true"]');
  if (!(await dialog.isVisible({ timeout: 800 }).catch(() => false))) return;

  // The first button in the local-profile modal is the close action in its header.
  const closeButton = dialog.locator('button').first();
  if (await closeButton.isVisible({ timeout: 500 }).catch(() => false)) {
    await closeButton.click();
    await dialog.waitFor({ state: 'hidden', timeout: 3000 }).catch(() => undefined);
  }
}

async function expectVisibleText(page, text, timeout = 8000) {
  const locator = page.getByText(text, { exact: false }).first();
  await locator.waitFor({ state: 'visible', timeout });
  return locator;
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    locale: 'it-IT',
  });
  const page = await context.newPage();
  const pageErrors = [];
  let decisionRpcCalls = 0;

  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('request', (request) => {
    if (request.url().includes('/rpc/record_institutional_revision_decision')) {
      decisionRpcCalls += 1;
    }
  });

  const checks = [];
  const check = (label, condition) => {
    checks.push({ label, condition: Boolean(condition) });
    console.log(`${condition ? '✓' : '✗'} ${label}`);
  };

  try {
    console.log('=== BETA-G4 BROWSER — BLOCKED INSTITUTIONAL DECISION JOURNEY ===');

    await page.goto(revisionUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await closeLocalProfileIfPresent(page);

    await expectVisibleText(page, 'Revisione del Curricolo: Gap 2025');
    check('1. /revisione renders the actual revision workspace', page.url().includes('/revisione'));

    const localChoice = page.getByRole('button', { name: 'Usa testo 2025' }).first();
    await localChoice.waitFor({ state: 'visible', timeout: 8000 });
    await localChoice.click();

    const starter = page.getByRole('region', { name: 'Avvio proposta strutturata Beta' });
    await starter.waitFor({ state: 'visible', timeout: 5000 });
    check('2. A local comparison choice exposes the structured-proposal bridge', true);

    const proposalSelect = starter.locator('select');
    await proposalSelect.selectOption({ index: 1 });
    const proposalRationale = starter.locator('textarea');
    await proposalRationale.fill('La modifica chiarisce il raccordo curricolare e merita una revisione formale nel percorso Beta.');
    await starter.getByRole('button', { name: 'Crea proposta strutturata' }).click();

    const prepareButton = page.getByRole('button', { name: 'Prepara per revisione' }).first();
    await prepareButton.waitFor({ state: 'visible', timeout: 5000 });
    check('3. Local choice becomes a structured proposal without becoming a decision', true);

    await prepareButton.click();
    const submitButton = page.getByRole('button', { name: 'Invia', exact: true }).first();
    await submitButton.waitFor({ state: 'visible', timeout: 3000 });
    await submitButton.click();

    const takeOverButton = page.getByRole('button', { name: 'Prendi in carico' }).first();
    await takeOverButton.waitFor({ state: 'visible', timeout: 3000 });
    await takeOverButton.click();

    const admitButton = page.getByRole('button', { name: 'Ammetti alla decisione' }).first();
    await admitButton.waitFor({ state: 'visible', timeout: 3000 });
    await admitButton.click();

    const decisionPanel = page.getByRole('region', { name: 'Decisione istituzionale Beta' }).first();
    await decisionPanel.waitFor({ state: 'visible', timeout: 5000 });
    await expectVisibleText(decisionPanel, 'Nessuna identità Beta autenticata');
    check('4. Consequential decision is blocked without an authenticated Beta identity', true);
    check('5. No institutional-decision RPC is called while blocked', decisionRpcCalls === 0);

    // Give the IndexedDB-backed Zustand persistence time to flush before re-entry.
    await page.waitForTimeout(1200);
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 });
    await closeLocalProfileIfPresent(page);

    await expectVisibleText(page, 'Revisione del Curricolo: Gap 2025');
    const reenteredPanel = page.getByRole('region', { name: 'Decisione istituzionale Beta' }).first();
    await reenteredPanel.waitFor({ state: 'visible', timeout: 8000 });
    await expectVisibleText(reenteredPanel, 'Nessuna identità Beta autenticata');
    check('6. Refresh/re-entry preserves the proposal state and the authority block', true);
    check('7. Refresh/re-entry still performs no institutional write', decisionRpcCalls === 0);

    await page.setViewportSize({ width: 390, height: 844 });
    await reenteredPanel.scrollIntoViewIfNeeded();
    check('8. Blocked decision state remains reachable at a mobile viewport', await reenteredPanel.isVisible());

    check('9. No uncaught page errors in the bounded journey', pageErrors.length === 0);
    if (pageErrors.length > 0) {
      pageErrors.forEach((error) => console.error(`PAGE ERROR: ${error}`));
    }

    const failed = checks.filter((item) => !item.condition);
    console.log(`=== RESULT: ${checks.length - failed.length}/${checks.length} checks passed ===`);
    if (failed.length > 0) process.exitCode = 1;
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();
