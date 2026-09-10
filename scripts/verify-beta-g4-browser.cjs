const { chromium } = require('playwright');

const baseUrl = process.env.BETA_BASE_URL || 'http://127.0.0.1:4173/CurManLight_arena';
const normalizedBaseUrl = baseUrl.replace(/\/$/, '');
const identityQueryUrl = `${normalizedBaseUrl}/?betaIdentity=1`;
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

async function openPersonalReview(page) {
  const overview = page.locator('[data-general-review-overview]').first();
  await overview.waitFor({ state: 'visible', timeout: 8000 });
  const action = page.locator('[data-human-next-action="open-personal-review"]').first();
  await action.waitFor({ state: 'visible', timeout: 8000 });
  await action.click();
  await page.locator('[data-general-personal-review]').first().waitFor({ state: 'visible', timeout: 8000 });
}

async function readPlanningHandoffState(page) {
  const handoff = page.getByRole('region', { name: 'Passaggio alla progettazione' }).first();
  await handoff.waitFor({ state: 'visible', timeout: 8000 });
  const text = await handoff.innerText();
  const blocked = text.includes('Il passaggio non è ancora pronto');
  const validPreview = text.includes('Docente OS') && text.includes('Accettazione docente');
  const automaticSyncActionCount = await handoff.getByRole('button', { name: /sincronizza/i }).count();
  return { handoff, text, blocked, validPreview, automaticSyncActionCount };
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: 'it-IT' });
  const page = await context.newPage();
  const pageErrors = [];
  let decisionRpcCalls = 0;
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('request', (request) => {
    if (request.url().includes('/rpc/record_institutional_revision_decision')) decisionRpcCalls += 1;
  });

  const checks = [];
  const check = (label, condition) => {
    checks.push({ label, condition: Boolean(condition) });
    console.log(`${condition ? '✓' : '✗'} ${label}`);
  };

  try {
    console.log('=== BETA-G4 BROWSER — REVISION WITHOUT SIMULATED APPROVAL ===');

    await page.goto(identityQueryUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    const returnToRevision = await expectVisibleText(page, 'Torna alla revisione');
    await returnToRevision.click();
    await page.waitForURL((url) => url.pathname.endsWith('/revisione') && !url.searchParams.has('betaIdentity'), { timeout: 8000 });
    await closeLocalProfileIfPresent(page);
    await expectVisibleText(page, 'Rivedi il curricolo con i colleghi');
    check('0. betaIdentity query entry exits through live Router navigation', page.url().includes('/revisione') && !page.url().includes('betaIdentity=1'));

    const initialResponse = await gotoWorkspace(page, revisionUrl, 'Rivedi il curricolo con i colleghi');
    const overview = page.locator('[data-general-review-overview]').first();
    await overview.waitFor({ state: 'visible', timeout: 8000 });
    check('1. /revisione renders the compact teacher review overview', Boolean(initialResponse) && page.url().includes('/revisione'));
    check('2. General review exposes one explicit entry into the personal task', await page.locator('[data-human-next-action="open-personal-review"]').count() === 1);

    await openPersonalReview(page);
    const personalAssurance = page.locator('[data-revision-assurance-on-demand]').first();
    await personalAssurance.waitFor({ state: 'attached', timeout: 3000 });
    const personalMarkerVisible = await personalAssurance.getByText('Contributo personale', { exact: true }).isVisible();
    const personalAssuranceText = ((await personalAssurance.textContent()) || '').toLocaleLowerCase('it-IT');
    check(
      '3. Personal contribution boundary stays reachable on demand without occupying the overview',
      personalMarkerVisible && personalAssuranceText.includes('la decisione del gruppo è un passaggio distinto'),
    );

    const localChoice = page.getByRole('button', { name: 'Conferma la proposta', exact: true }).first();
    await localChoice.waitFor({ state: 'visible', timeout: 8000 });
    await localChoice.click();
    await expectVisibleText(page, 'Proposta confermata');
    check('4. A teacher can record a professional orientation through the recognition-first action', true);

    const forbidden = ['Crea proposta strutturata', 'Prepara per revisione', 'Invia', 'Prendi in carico', 'Ammetti alla decisione'];
    for (const label of forbidden) {
      check(`No simulated action: ${label}`, await page.getByRole('button', { name: label, exact: true }).count() === 0);
    }
    check('10. Institutional decision panel is absent from teacher surface', await page.getByRole('region', { name: 'Decisione istituzionale Beta' }).count() === 0);

    const refreshResponse = await page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 });
    await closeLocalProfileIfPresent(page);
    await expectVisibleText(page, 'Rivedi il curricolo con i colleghi');
    await page.locator('[data-general-review-overview]').first().waitFor({ state: 'visible', timeout: 8000 });
    await openPersonalReview(page);
    await expectVisibleText(page, 'Proposta confermata');
    check('11. Refresh preserves the teacher orientation without creating an institutional workflow', Boolean(refreshResponse));
    check('12. No institutional-decision RPC is called by local review or refresh', decisionRpcCalls === 0);

    await gotoWorkspace(page, documentsUrl, 'Documenti del curricolo');
    const handoff = await readPlanningHandoffState(page);
    check('13. Planning handoff remains observable', handoff.validPreview || handoff.blocked);
    check('14. Planning handoff exposes no automatic synchronization action', handoff.automaticSyncActionCount === 0);

    await page.setViewportSize({ width: 390, height: 844 });
    await handoff.handoff.scrollIntoViewIfNeeded();
    check('15. Planning handoff remains reachable on mobile', await handoff.handoff.isVisible());

    await gotoWorkspace(page, revisionUrl, 'Rivedi il curricolo con i colleghi');
    const mobileOverview = page.locator('[data-general-review-overview]').first();
    await mobileOverview.waitFor({ state: 'visible', timeout: 8000 });
    check('16. Compact teacher review overview remains reachable on mobile', await mobileOverview.isVisible());
    check('17. No uncaught page errors in the bounded journey', pageErrors.length === 0);

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
