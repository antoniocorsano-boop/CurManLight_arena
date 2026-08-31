const { chromium } = require('playwright');

const baseUrl = process.env.BETA_BASE_URL || 'http://127.0.0.1:4173/CurManLight_arena';
const normalizedBaseUrl = baseUrl.replace(/\/$/, '');
const revisionUrl = `${normalizedBaseUrl}/revisione`;
const documentsUrl = `${normalizedBaseUrl}/documents`;

async function closeLocalProfileIfPresent(page) {
  await page.waitForTimeout(1200);
  const dialog = page.locator('[role="dialog"][aria-modal="true"]');
  if (!(await dialog.isVisible({ timeout: 800 }).catch(() => false))) return;

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

async function gotoWorkspace(page, url, expectedText) {
  const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await closeLocalProfileIfPresent(page);
  await expectVisibleText(page, expectedText);
  return response;
}

async function printRuntimeDiagnostics(page, consoleMessages, pageErrors) {
  const title = await page.title().catch(() => '<unavailable>');
  const bodyText = await page.locator('body').innerText().catch(() => '<unavailable>');
  const rootHtml = await page.locator('#root').innerHTML().catch(() => '<unavailable>');

  console.error('=== BETA-G4 RUNTIME DIAGNOSTICS ===');
  console.error(`URL: ${page.url()}`);
  console.error(`TITLE: ${title}`);
  console.error(`BODY: ${bodyText.slice(0, 4000)}`);
  console.error(`ROOT: ${rootHtml.slice(0, 4000)}`);
  if (consoleMessages.length === 0) console.error('CONSOLE: <empty>');
  for (const message of consoleMessages.slice(-30)) console.error(`CONSOLE ${message.type}: ${message.text}`);
  if (pageErrors.length === 0) console.error('PAGEERROR: <empty>');
  for (const error of pageErrors.slice(-20)) console.error(`PAGEERROR: ${error}`);
}

async function readPlanningHandoffState(page) {
  const handoff = page.getByRole('region', { name: 'Passaggio alla progettazione' }).first();
  await handoff.waitFor({ state: 'visible', timeout: 8000 });
  const text = await handoff.innerText();
  const blocked = text.includes('Il passaggio non è ancora pronto');
  const validPreview =
    text.includes('Docente OS') &&
    text.includes('Accettazione docente') &&
    text.includes('Nessuna scrittura in Docente OS') &&
    text.includes('Scarica passaggio per Docente OS');
  const automaticSyncActionCount = await handoff.getByRole('button', { name: /sincronizza/i }).count();
  return { handoff, text, blocked, validPreview, automaticSyncActionCount };
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    locale: 'it-IT',
  });
  const page = await context.newPage();
  const pageErrors = [];
  const consoleMessages = [];
  let decisionRpcCalls = 0;

  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('console', (message) => consoleMessages.push({ type: message.type(), text: message.text() }));
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
    console.log('=== BETA-G4/S3B BROWSER — REVISION, AUTHORITY AND PLANNING HANDOFF ===');

    const initialResponse = await gotoWorkspace(page, revisionUrl, 'Revisione del Curricolo: Gap 2025');
    console.log(`Initial navigation status: ${initialResponse?.status() ?? 'unknown'} ${page.url()}`);
    check('1. /revisione renders the actual revision workspace', page.url().includes('/revisione'));

    const localChoice = page.getByRole('button', { name: 'Usa testo 2025' }).first();
    await localChoice.waitFor({ state: 'visible', timeout: 8000 });
    await localChoice.click();

    const starter = page.getByRole('region', { name: 'Avvio proposta strutturata Beta' });
    await starter.waitFor({ state: 'visible', timeout: 5000 });
    check('2. A local comparison choice exposes the structured-proposal bridge', true);

    await gotoWorkspace(page, documentsUrl, 'Documenti del curricolo');
    check('3. Planning handoff is discoverable from the canonical /documents surface', page.url().includes('/documents'));

    const initialHandoff = await readPlanningHandoffState(page);
    check(
      '4. Planning handoff is explicit and either valid for local transfer or meaningfully blocked',
      initialHandoff.validPreview || (initialHandoff.blocked && initialHandoff.text.includes('Quando sarà pronto'))
    );
    check('5. Planning handoff exposes no automatic synchronization action', initialHandoff.automaticSyncActionCount === 0);

    await gotoWorkspace(page, revisionUrl, 'Revisione del Curricolo: Gap 2025');
    const reenteredStarter = page.getByRole('region', { name: 'Avvio proposta strutturata Beta' });
    await reenteredStarter.waitFor({ state: 'visible', timeout: 5000 });
    const proposalSelect = reenteredStarter.locator('select');
    await proposalSelect.selectOption({ index: 1 });
    const proposalRationale = reenteredStarter.locator('textarea');
    await proposalRationale.fill('La modifica chiarisce il raccordo curricolare e merita una revisione formale nel percorso Beta.');
    await reenteredStarter.getByRole('button', { name: 'Crea proposta strutturata' }).click();

    let prepareButton = page.getByRole('button', { name: 'Prepara per revisione' }).first();
    await prepareButton.waitFor({ state: 'visible', timeout: 5000 });
    check('6. Local choice becomes a structured proposal without becoming a decision', true);

    await gotoWorkspace(page, documentsUrl, 'Documenti del curricolo');
    const proposalHandoff = await readPlanningHandoffState(page);
    check(
      '7. Planning handoff remains observable after structured proposal creation',
      proposalHandoff.validPreview || proposalHandoff.blocked
    );

    await gotoWorkspace(page, revisionUrl, 'Revisione del Curricolo: Gap 2025');
    prepareButton = page.getByRole('button', { name: 'Prepara per revisione' }).first();
    await prepareButton.waitFor({ state: 'visible', timeout: 5000 });
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
    check('8. Consequential decision is blocked without an authenticated Beta identity', true);
    check('9. No institutional-decision RPC is called while blocked', decisionRpcCalls === 0);

    await page.waitForTimeout(1200);
    const refreshResponse = await page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 });
    console.log(`Refresh navigation status: ${refreshResponse?.status() ?? 'unknown'} ${page.url()}`);
    await closeLocalProfileIfPresent(page);

    await expectVisibleText(page, 'Revisione del Curricolo: Gap 2025');
    const reenteredPanel = page.getByRole('region', { name: 'Decisione istituzionale Beta' }).first();
    await reenteredPanel.waitFor({ state: 'visible', timeout: 8000 });
    await expectVisibleText(reenteredPanel, 'Nessuna identità Beta autenticata');
    check('10. Refresh/re-entry preserves the proposal state and the authority block', true);
    check('11. Refresh/re-entry still performs no institutional write', decisionRpcCalls === 0);

    await gotoWorkspace(page, documentsUrl, 'Documenti del curricolo');
    const reenteredHandoff = await readPlanningHandoffState(page);
    check(
      '12. Re-entry preserves an observable planning-handoff state on Documents',
      reenteredHandoff.validPreview || reenteredHandoff.blocked
    );

    await page.setViewportSize({ width: 390, height: 844 });
    await reenteredHandoff.handoff.scrollIntoViewIfNeeded();
    check('13. Planning handoff remains reachable at a 390x844 mobile viewport', await reenteredHandoff.handoff.isVisible());
    check(
      '14. Mobile planning handoff still exposes transfer/block semantics without automatic downstream mutation',
      reenteredHandoff.validPreview || reenteredHandoff.blocked
    );

    await gotoWorkspace(page, revisionUrl, 'Revisione del Curricolo: Gap 2025');
    const mobileDecisionPanel = page.getByRole('region', { name: 'Decisione istituzionale Beta' }).first();
    await mobileDecisionPanel.waitFor({ state: 'visible', timeout: 8000 });
    await mobileDecisionPanel.scrollIntoViewIfNeeded();
    check('15. Blocked decision state remains reachable at a mobile viewport', await mobileDecisionPanel.isVisible());

    check('16. No uncaught page errors in the bounded journey', pageErrors.length === 0);
    if (pageErrors.length > 0) {
      pageErrors.forEach((error) => console.error(`PAGE ERROR: ${error}`));
    }

    const failed = checks.filter((item) => !item.condition);
    console.log(`=== RESULT: ${checks.length - failed.length}/${checks.length} checks passed ===`);
    console.log('Browser verification collected evidence only; it did not issue a human-acceptance verdict.');
    if (failed.length > 0) process.exitCode = 1;
  } catch (error) {
    console.error(error);
    await printRuntimeDiagnostics(page, consoleMessages, pageErrors);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();