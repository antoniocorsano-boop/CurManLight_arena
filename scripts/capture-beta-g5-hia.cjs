const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const baseUrl = process.env.BETA_BASE_URL || 'http://127.0.0.1:4173/CurManLight_arena';
const revisionUrl = `${baseUrl.replace(/\/$/, '')}/revisione`;
const outputDir = path.resolve(process.env.HIA_OUTPUT_DIR || 'artifacts/hia');
fs.mkdirSync(outputDir, { recursive: true });

const humanTaskBudgets = {
  maxHorizontalOverflowPx: 1,
  primaryActionMaxViewport: 1,
  maxVisiblePrimaryActions: 1,
  maxVisibleSupportActions: 2,
  focusedMobileTargetViewports: 3,
  focusedMobileHardMaxViewports: 4,
  maxTechnicalTokensAboveFold: 0,
};

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

async function openHandoffDetails(panel) {
  const details = panel.locator('details[data-hia-handoff-details]').first();
  if (await details.count()) {
    const isOpen = await details.evaluate((element) => element.open);
    if (!isOpen) await details.locator('summary').click();
  }
}

async function inspectHumanTaskSurface(page) {
  return page.evaluate(() => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const documentElement = document.documentElement;
    const scrollWidth = documentElement.scrollWidth;
    const documentHeight = Math.max(documentElement.scrollHeight, document.body.scrollHeight);

    const isRendered = (element) => {
      const style = window.getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.display !== 'none'
        && style.visibility !== 'hidden'
        && Number(style.opacity || '1') > 0
        && rect.width > 0
        && rect.height > 0;
    };

    const visibleBrokenImages = Array.from(document.images)
      .filter((image) => {
        const rect = image.getBoundingClientRect();
        const visible = isRendered(image) && rect.bottom >= 0 && rect.top <= viewportHeight;
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

    const primaryActions = Array.from(document.querySelectorAll('[data-hia-primary-action]'))
      .filter(isRendered)
      .map((element) => {
        const rect = element.getBoundingClientRect();
        const absoluteTop = rect.top + window.scrollY;
        return {
          name: element.getAttribute('data-hia-primary-action') || '',
          text: element.textContent?.trim() || '',
          topPx: Math.round(absoluteTop),
          viewportIndex: Number((absoluteTop / viewportHeight).toFixed(2)),
          initiallyVisible: rect.top >= 0 && rect.bottom <= viewportHeight,
        };
      });

    const supportActions = Array.from(document.querySelectorAll('[data-hia-support-action]'))
      .filter(isRendered)
      .length;

    const firstViewportText = Array.from(document.querySelectorAll('h1,h2,h3,p,strong,span,button,summary,label'))
      .filter((element) => {
        if (!isRendered(element)) return false;
        const rect = element.getBoundingClientRect();
        return rect.bottom > 0 && rect.top < viewportHeight;
      })
      .map((element) => element.textContent?.trim() || '')
      .join(' ');

    const technicalPatterns = [
      /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/gi,
      /\bCML_[A-Z0-9_]+\b/g,
      /\blegacy-gap:[^\s]+/gi,
      /\blocal-baseline:[^\s]+/gi,
    ];
    const technicalTokensAboveFold = technicalPatterns.flatMap((pattern) => firstViewportText.match(pattern) || []);

    return {
      viewportWidth,
      viewportHeight,
      scrollWidth,
      documentHeight,
      scrollViewports: Number((documentHeight / viewportHeight).toFixed(2)),
      horizontalOverflowPx: Math.max(0, scrollWidth - viewportWidth),
      visibleBrokenImages,
      overflowCandidates,
      primaryActions,
      visiblePrimaryActionCount: primaryActions.length,
      visibleSupportActionCount: supportActions,
      technicalTokensAboveFold,
    };
  });
}

function attachPageTelemetry(page, target) {
  page.on('pageerror', (error) => target.pageErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') target.consoleErrors.push(message.text());
  });
  page.on('response', (response) => {
    if (response.status() >= 400) {
      const request = response.request();
      target.httpErrors.push({
        status: response.status(),
        url: response.url(),
        resourceType: request.resourceType(),
      });
    }
  });
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: 'it-IT' });
  const page = await context.newPage();
  const telemetry = { pageErrors: [], consoleErrors: [], httpErrors: [] };
  const captures = [];
  const taskMetrics = {};
  let decisionRpcCalls = 0;

  attachPageTelemetry(page, telemetry);
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
    // Fresh mobile entry: measure the real first task before the desktop journey mutates local state.
    const mobileEntryContext = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'it-IT' });
    const mobileEntryPage = await mobileEntryContext.newPage();
    const mobileEntryTelemetry = { pageErrors: [], consoleErrors: [], httpErrors: [] };
    attachPageTelemetry(mobileEntryPage, mobileEntryTelemetry);

    const mobileEntryResponse = await mobileEntryPage.goto(revisionUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    check('fresh mobile revision entry responds', Boolean(mobileEntryResponse));
    await dismissKnownNonTaskDialogs(mobileEntryPage, 1800);
    await expectVisibleText(mobileEntryPage, 'Revisione del Curricolo: Gap 2025');
    taskMetrics.mobileEntry = await inspectHumanTaskSurface(mobileEntryPage);

    check(
      'fresh mobile entry has exactly one marked primary action',
      taskMetrics.mobileEntry.visiblePrimaryActionCount === humanTaskBudgets.maxVisiblePrimaryActions,
    );
    check(
      'fresh mobile primary action is inside first viewport',
      taskMetrics.mobileEntry.primaryActions[0]?.viewportIndex <= humanTaskBudgets.primaryActionMaxViewport,
    );
    check(
      'fresh mobile entry has no technical tokens above fold',
      taskMetrics.mobileEntry.technicalTokensAboveFold.length <= humanTaskBudgets.maxTechnicalTokensAboveFold,
    );
    check(
      'fresh mobile entry has no horizontal overflow',
      taskMetrics.mobileEntry.horizontalOverflowPx <= humanTaskBudgets.maxHorizontalOverflowPx,
    );

    await capture(mobileEntryPage, '00-revision-entry-mobile.png', 'revision-entry-mobile', captures);

    const entryPrimary = mobileEntryPage.locator('[data-hia-primary-action]').first();
    await entryPrimary.click();
    const firstLocalChoice = mobileEntryPage.getByRole('button', { name: 'Usa testo 2025' }).first();
    await firstLocalChoice.waitFor({ state: 'visible', timeout: 3000 });
    check('fresh mobile reaches the first real local choice in one tap', await firstLocalChoice.isVisible());
    await mobileEntryContext.close();

    // Desktop journey.
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
      await openHandoffDetails(handoffPanel);
      await handoffPanel.scrollIntoViewIfNeeded();
      await capture(page, '05-planning-handoff-desktop.png', 'planning-handoff-desktop', captures);
    }

    // True mobile re-entry into the consequential state.
    await page.setViewportSize({ width: 390, height: 844 });
    const mobileResponse = await page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 });
    check('mobile re-entry responds after viewport change', Boolean(mobileResponse));
    await dismissKnownNonTaskDialogs(page, 1800);
    await expectVisibleText(page, 'Revisione del Curricolo: Gap 2025');

    const mobileDecisionPanel = await waitForDecisionPanel(page);
    await mobileDecisionPanel.scrollIntoViewIfNeeded();
    check('decision state remains reachable after true mobile re-entry', await mobileDecisionPanel.isVisible());

    await page.evaluate(() => window.scrollTo(0, 0));
    taskMetrics.mobileDecisionFocused = await inspectHumanTaskSurface(page);
    check(
      'mobile decision surface has no horizontal overflow',
      taskMetrics.mobileDecisionFocused.horizontalOverflowPx <= humanTaskBudgets.maxHorizontalOverflowPx,
    );
    check(
      'mobile decision surface has no visible broken images',
      taskMetrics.mobileDecisionFocused.visibleBrokenImages.length === 0,
    );
    check(
      'mobile decision surface meets focused 3 viewport target',
      taskMetrics.mobileDecisionFocused.scrollViewports <= humanTaskBudgets.focusedMobileTargetViewports,
    );
    check(
      'mobile decision surface remains below 4 viewport hard stop',
      taskMetrics.mobileDecisionFocused.scrollViewports <= humanTaskBudgets.focusedMobileHardMaxViewports,
    );
    check(
      'mobile decision surface has no technical tokens above fold',
      taskMetrics.mobileDecisionFocused.technicalTokensAboveFold.length <= humanTaskBudgets.maxTechnicalTokensAboveFold,
    );
    check(
      'mobile focused surface exposes at most two marked support actions',
      taskMetrics.mobileDecisionFocused.visibleSupportActionCount <= humanTaskBudgets.maxVisibleSupportActions,
    );

    if (taskMetrics.mobileDecisionFocused.overflowCandidates.length > 0) {
      console.log(`HIA_MOBILE_OVERFLOW_DIAGNOSTICS ${JSON.stringify(taskMetrics.mobileDecisionFocused.overflowCandidates)}`);
    }

    await mobileDecisionPanel.scrollIntoViewIfNeeded();
    await capture(page, '06-decision-authority-block-mobile.png', 'decision-authority-block-mobile', captures);

    const mobileHandoffPanel = page.getByRole('region', { name: 'Anteprima passaggio alla progettazione' }).first();
    if (await mobileHandoffPanel.isVisible({ timeout: 1500 }).catch(() => false)) {
      await openHandoffDetails(mobileHandoffPanel);
      await mobileHandoffPanel.scrollIntoViewIfNeeded();
      await capture(page, '07-planning-handoff-mobile.png', 'planning-handoff-mobile', captures);
    }

    check('no uncaught page errors during evidence capture', telemetry.pageErrors.length === 0);
    check('no consequential RPC during non-authorized HIA capture', decisionRpcCalls === 0);

    for (const item of telemetry.httpErrors) {
      console.log(`HIA_HTTP_ERROR status=${item.status} resource=${item.resourceType} url=${item.url}`);
    }

    const summary = {
      schemaVersion: 2,
      gate: 'BETA-G5',
      status: 'AUTOMATED_EVIDENCE_ONLY',
      generatedAt: new Date().toISOString(),
      baseUrl,
      humanReviewRequired: true,
      humanTaskMetricContract: 'docs/04_product_experience/GOVUK_HUMAN_TASK_METRICS.md',
      humanTaskBudgets,
      taskMetrics,
      mobileCaptureMode: 'fresh-entry-plus-viewport-change-reload-reentry',
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
      pageErrors: telemetry.pageErrors,
      consoleErrors: telemetry.consoleErrors,
      httpErrors: telemetry.httpErrors,
      decisionRpcCalls,
    };
    fs.writeFileSync(path.join(outputDir, 'summary.json'), JSON.stringify(summary, null, 2));

    const failed = checks.filter((item) => !item.passed);
    if (failed.length > 0) process.exitCode = 1;
  } catch (error) {
    const failure = {
      schemaVersion: 2,
      gate: 'BETA-G5',
      status: 'AUTOMATED_CAPTURE_FAILED',
      generatedAt: new Date().toISOString(),
      baseUrl,
      error: error instanceof Error ? error.message : String(error),
      captures,
      checks,
      pageErrors: telemetry.pageErrors,
      consoleErrors: telemetry.consoleErrors,
      httpErrors: telemetry.httpErrors,
      decisionRpcCalls,
      humanTaskBudgets,
      taskMetrics,
      humanReviewRequired: true,
    };
    fs.writeFileSync(path.join(outputDir, 'summary.json'), JSON.stringify(failure, null, 2));
    console.error(error);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();
