const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const baseUrl = process.env.BETA_BASE_URL || 'http://127.0.0.1:4173/CurManLight_arena';
const revisionUrl = `${baseUrl.replace(/\/$/, '')}/revisione`;
const outputDir = path.resolve(process.env.HIA_OUTPUT_DIR || 'artifacts/hia');
fs.mkdirSync(outputDir, { recursive: true });

async function dismissKnownNonTaskDialogs(page, settleMs = 1400) {
  const deadline = Date.now() + settleMs;
  do {
    await page.waitForTimeout(200);

    const onboarding = page
      .locator('[role="dialog"][aria-modal="true"]')
      .filter({ hasText: 'Profilo personale locale' })
      .first();
    if (await onboarding.isVisible({ timeout: 150 }).catch(() => false)) {
      await onboarding.locator('button').first().click({ timeout: 2000 });
      await onboarding.waitFor({ state: 'hidden', timeout: 3000 }).catch(() => undefined);
      console.log('HIA_DISMISS known-dialog=local-profile');
      continue;
    }

    const motto = page
      .locator('[role="dialog"][aria-modal="true"]')
      .filter({ hasText: 'Motto e Metodo Operativo' })
      .first();
    if (await motto.isVisible({ timeout: 150 }).catch(() => false)) {
      const understood = motto.getByRole('button', { name: 'Ho capito', exact: true });
      if (await understood.isVisible({ timeout: 150 }).catch(() => false)) {
        await understood.click({ timeout: 2000 });
        await motto.waitFor({ state: 'hidden', timeout: 3000 }).catch(() => undefined);
        console.log('HIA_DISMISS known-dialog=motto');
        continue;
      }
    }
  } while (Date.now() < deadline);
}

async function expectVisibleText(root, text, timeout = 8000) {
  const locator = root.getByText(text, { exact: false }).first();
  await locator.waitFor({ state: 'visible', timeout });
  return locator;
}

async function capture(page, fileName, label, captures) {
  await dismissKnownNonTaskDialogs(page);
  const filePath = path.join(outputDir, fileName);
  await page.screenshot({ path: filePath, fullPage: true });
  captures.push({ label, file: fileName, url: page.url(), viewport: page.viewportSize() });
  console.log(`HIA_CAPTURE ${label} ${fileName}`);
}

async function waitForDecisionPanel(page) {
  const panel = page.getByRole('region', { name: 'Decisione istituzionale Beta' }).first();
  await panel.waitFor({ state: 'visible', timeout: 8000 });
  await expectVisibleText(panel, 'Nessuna identità Beta autenticata');
  return panel;
}

async function inspectMobileLayout(page) {
  return page.evaluate(() => {
    const viewportWidth = window.innerWidth;
    const scrollWidth = document.documentElement.scrollWidth;
    const visibleBrokenImages = Array.from(document.images)
      .filter((image) => {
        const rect = image.getBoundingClientRect();
        const visible = rect.width > 0 && rect.height > 0 && rect.bottom >= 0 && rect.top <= window.innerHeight;
        return visible && (!image.complete || image.naturalWidth === 0);
      })
      .map((image) => ({ src: image.currentSrc || image.src, alt: image.alt || '' }));

    const overflowCandidates = Array.from(document.querySelectorAll('body *'))
      .map((element) => {
        const rect = element.getBoundingClientRect();
        const overflowRight = Math.max(0, rect.right - viewportWidth);
        const overflowLeft = Math.max(0, -rect.left);
        return {
          tag: element.tagName.toLowerCase(),
          className: typeof element.className === 'string' ? element.className.slice(0, 160) : '',
          overflowPx: Math.max(overflowRight, overflowLeft),
          width: Math.round(rect.width),
        };
      })
      .filter((entry) => entry.overflowPx > 1)
      .sort((a, b) => b.overflowPx - a.overflowPx)
      .slice(0, 12);

    return {
      viewportWidth,
      scrollWidth,
      horizontalOverflowPx: Math.max(0, scrollWidth - viewportWidth),
      visibleBrokenImages,
      overflowCandidates,
    };
  });
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: 'it-IT' });
  const page = await context.newPage();
  const pageErrors = [];
  const consoleErrors = [];
  const httpErrors = [];
  const captures = [];
  let decisionRpcCalls = 0;
  let mobileLayout = null;

  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('response', (response) => {
    if (response.status() >= 400) {
      const request = response.request();
      httpErrors.push({
        status: response.status(),
        url: response.url(),
        resourceType: request.resourceType(),
      });
    }
  });
  page.on('request', (request) => {
    if (request.url().includes('/rpc/record_institutional_revision_decision')) decisionRpcCalls += 1;
  });

  const checks = [];
  const check = (label, condition) => {
    const passed = Boolean(condition);
    checks.push({ label, passed });
    console.log(`${passed ? '✓' : '✗'} ${label}`);
  };

  try {
    const response = await page.goto(revisionUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    check('published-style revision route responds', Boolean(response));
    await dismissKnownNonTaskDialogs(page, 1800);
    await expectVisibleText(page, 'Revisione del Curricolo: Gap 2025');
    await capture(page, '01-revision-entry-desktop.png', 'revision-entry-desktop', captures);

    const localChoice = page.getByRole('button', { name: 'Usa testo 2025' }).first();
    await localChoice.waitFor({ state: 'visible', timeout: 8000 });
    await localChoice.click();

    const starter = page.getByRole('region', { name: 'Avvio proposta strutturata Beta' });
    await starter.waitFor({ state: 'visible', timeout: 5000 });
    await capture(page, '02-structured-proposal-entry-desktop.png', 'structured-proposal-entry-desktop', captures);

    await starter.locator('select').selectOption({ index: 1 });
    await starter.locator('textarea').fill('Evidenza HIA: la motivazione deve essere comprensibile prima del passaggio alla revisione formale.');
    await starter.getByRole('button', { name: 'Crea proposta strutturata' }).click();

    const prepareButton = page.getByRole('button', { name: 'Prepara per revisione' }).first();
    await prepareButton.waitFor({ state: 'visible', timeout: 5000 });
    await capture(page, '03-proposal-ready-desktop.png', 'proposal-ready-desktop', captures);

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

    const decisionPanel = await waitForDecisionPanel(page);
    check('consequential decision is visibly blocked without authority', true);
    check('blocked HIA capture performs no institutional decision write', decisionRpcCalls === 0);
    await capture(page, '04-decision-authority-block-desktop.png', 'decision-authority-block-desktop', captures);

    const handoffPanel = page.getByRole('region', { name: 'Anteprima passaggio alla progettazione' }).first();
    if (await handoffPanel.isVisible({ timeout: 1500 }).catch(() => false)) {
      await handoffPanel.scrollIntoViewIfNeeded();
      await capture(page, '05-planning-handoff-desktop.png', 'planning-handoff-desktop', captures);
    }

    // Mobile evidence must be a real responsive re-entry, not a desktop render merely resized in place.
    await page.setViewportSize({ width: 390, height: 844 });
    const mobileResponse = await page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 });
    check('mobile re-entry responds after viewport change', Boolean(mobileResponse));
    await dismissKnownNonTaskDialogs(page, 1800);
    await expectVisibleText(page, 'Revisione del Curricolo: Gap 2025');

    const mobileDecisionPanel = await waitForDecisionPanel(page);
    await mobileDecisionPanel.scrollIntoViewIfNeeded();
    check('decision state remains reachable after true mobile re-entry', await mobileDecisionPanel.isVisible());

    mobileLayout = await inspectMobileLayout(page);
    check('mobile document has no horizontal overflow', mobileLayout.horizontalOverflowPx <= 1);
    check('mobile viewport has no visible broken images', mobileLayout.visibleBrokenImages.length === 0);
    if (mobileLayout.overflowCandidates.length > 0) {
      console.log(`HIA_MOBILE_OVERFLOW_DIAGNOSTICS ${JSON.stringify(mobileLayout.overflowCandidates)}`);
    }
    if (mobileLayout.visibleBrokenImages.length > 0) {
      console.log(`HIA_BROKEN_IMAGES ${JSON.stringify(mobileLayout.visibleBrokenImages)}`);
    }

    await capture(page, '06-decision-authority-block-mobile.png', 'decision-authority-block-mobile', captures);

    const mobileHandoffPanel = page.getByRole('region', { name: 'Anteprima passaggio alla progettazione' }).first();
    if (await mobileHandoffPanel.isVisible({ timeout: 1500 }).catch(() => false)) {
      await mobileHandoffPanel.scrollIntoViewIfNeeded();
      await capture(page, '07-planning-handoff-mobile.png', 'planning-handoff-mobile', captures);
    }

    check('no uncaught page errors during evidence capture', pageErrors.length === 0);
    check('no consequential RPC during non-authorized HIA capture', decisionRpcCalls === 0);

    for (const item of httpErrors) {
      console.log(`HIA_HTTP_ERROR status=${item.status} resource=${item.resourceType} url=${item.url}`);
    }

    const summary = {
      schemaVersion: 1,
      gate: 'BETA-G5',
      status: 'AUTOMATED_EVIDENCE_ONLY',
      generatedAt: new Date().toISOString(),
      baseUrl,
      humanReviewRequired: true,
      mobileCaptureMode: 'viewport-change-plus-reload-reentry',
      mobileLayout,
      humanReviewNotAutomated: [
        'task comprehensibility',
        'visual hierarchy',
        'domain-language clarity',
        'recovery intelligibility',
        'desktop comfort',
        'mobile comfort',
      ],
      captures,
      checks,
      pageErrors,
      consoleErrors,
      httpErrors,
      decisionRpcCalls,
    };
    fs.writeFileSync(path.join(outputDir, 'summary.json'), JSON.stringify(summary, null, 2));

    const failed = checks.filter((item) => !item.passed);
    if (failed.length > 0) process.exitCode = 1;
  } catch (error) {
    const failure = {
      schemaVersion: 1,
      gate: 'BETA-G5',
      status: 'AUTOMATED_CAPTURE_FAILED',
      generatedAt: new Date().toISOString(),
      baseUrl,
      error: error instanceof Error ? error.message : String(error),
      captures,
      checks,
      pageErrors,
      consoleErrors,
      httpErrors,
      decisionRpcCalls,
      mobileLayout,
      humanReviewRequired: true,
    };
    fs.writeFileSync(path.join(outputDir, 'summary.json'), JSON.stringify(failure, null, 2));
    console.error(error);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();
