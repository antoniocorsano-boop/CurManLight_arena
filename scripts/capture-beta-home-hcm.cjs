const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const baseUrl = process.env.BETA_BASE_URL || 'http://127.0.0.1:4173/CurManLight_arena';
const homeUrl = `${baseUrl.replace(/\/$/, '')}/`;
const outputDir = path.resolve(process.env.HIA_OUTPUT_DIR || 'artifacts/hia');
fs.mkdirSync(outputDir, { recursive: true });

const budgets = {
  maxHorizontalOverflowPx: 1,
  primaryActionMaxViewport: 1,
  maxVisiblePrimaryActions: 1,
  homeMobileTargetViewports: 3,
  homeMobileHardMaxViewports: 4,
  maxTechnicalTokensAboveFold: 0,
};

async function dismissKnownDialogs(page) {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    await page.waitForTimeout(180);
    const dialog = page.locator('[role="dialog"][aria-modal="true"]').first();
    if (!(await dialog.isVisible({ timeout: 100 }).catch(() => false))) return;

    const understood = dialog.getByRole('button', { name: 'Ho capito', exact: true });
    if (await understood.isVisible({ timeout: 100 }).catch(() => false)) {
      await understood.click();
      continue;
    }

    const firstButton = dialog.locator('button').first();
    if (await firstButton.isVisible({ timeout: 100 }).catch(() => false)) {
      await firstButton.click();
    }
  }
}

async function inspect(page) {
  return page.evaluate(() => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const doc = document.documentElement;
    const documentHeight = Math.max(doc.scrollHeight, document.body.scrollHeight);

    const isRendered = (element) => {
      const style = window.getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.display !== 'none'
        && style.visibility !== 'hidden'
        && Number(style.opacity || '1') > 0
        && rect.width > 0
        && rect.height > 0;
    };

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
        };
      });

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
      /\b(?:WCAG|AgID|GDPR|IndexedDB|Dexie(?:\.js)?|PWA|Service Worker|JSON|CSV|Merger|Wizard)\b/gi,
      /\.cml\b/gi,
    ];

    const technicalTokensAboveFold = technicalPatterns.flatMap((pattern) => firstViewportText.match(pattern) || []);
    const openTechnicalDetails = document.querySelectorAll('details[data-hcm-technical-details][open]').length;
    const visibleBrokenImages = Array.from(document.images).filter((image) => {
      const rect = image.getBoundingClientRect();
      return isRendered(image)
        && rect.bottom >= 0
        && rect.top <= viewportHeight
        && (!image.complete || image.naturalWidth === 0);
    }).length;

    return {
      viewportWidth,
      viewportHeight,
      documentHeight,
      scrollViewports: Number((documentHeight / viewportHeight).toFixed(2)),
      horizontalOverflowPx: Math.max(0, doc.scrollWidth - viewportWidth),
      primaryActions,
      visiblePrimaryActionCount: primaryActions.length,
      technicalTokensAboveFold,
      openTechnicalDetails,
      visibleBrokenImages,
      role: document.querySelector('[data-hcm-home-role]')?.getAttribute('data-hcm-home-role') || null,
      homeSurfaceCount: document.querySelectorAll('[data-hcm-surface="home"]').length,
    };
  });
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'it-IT' });
  const page = await context.newPage();
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  const checks = [];
  const check = (label, condition) => {
    const passed = Boolean(condition);
    checks.push({ label, passed });
    console.log(`${passed ? '✓' : '✗'} ${label}`);
  };

  try {
    const response = await page.goto(homeUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    check('mobile Home responds', Boolean(response));
    await dismissKnownDialogs(page);
    await page.locator('[data-hcm-surface="home"]').waitFor({ state: 'visible', timeout: 8000 });

    const metrics = await inspect(page);
    check('Home renders exactly one HCM role projection', metrics.homeSurfaceCount === 1);
    check('fresh Home does not imply a user role', metrics.role === 'non-dichiarato');
    check('fresh Home exposes exactly one marked primary action', metrics.visiblePrimaryActionCount === budgets.maxVisiblePrimaryActions);
    check('Home primary action is inside the first viewport', metrics.primaryActions[0]?.viewportIndex <= budgets.primaryActionMaxViewport);
    check('fresh Home primary action is context setup', metrics.primaryActions[0]?.name === 'home-set-context');
    check('Home has no technical terminology above fold', metrics.technicalTokensAboveFold.length <= budgets.maxTechnicalTokensAboveFold);
    check('Home technical details start closed', metrics.openTechnicalDetails === 0);
    check('Home has no horizontal overflow', metrics.horizontalOverflowPx <= budgets.maxHorizontalOverflowPx);
    check('Home has no visible broken images', metrics.visibleBrokenImages === 0);
    check('Home meets the 3 viewport target', metrics.scrollViewports <= budgets.homeMobileTargetViewports);
    check('Home remains below the 4 viewport hard stop', metrics.scrollViewports <= budgets.homeMobileHardMaxViewports);
    check('Home capture has no uncaught page errors', pageErrors.length === 0);

    await page.screenshot({ path: path.join(outputDir, '00-home-hcm-mobile.png'), fullPage: true });

    const contextAction = page.locator('[data-hia-primary-action="home-set-context"]');
    await contextAction.click();
    const profileDialog = page
      .locator('[role="dialog"][aria-modal="true"]')
      .filter({ hasText: 'Profilo personale locale' })
      .first();
    await profileDialog.waitFor({ state: 'visible', timeout: 3000 });
    check('Home context action opens the canonical local profile', await profileDialog.isVisible());
    check('context setup remains explicitly local', await profileDialog.getByText('Profilo personale locale', { exact: false }).first().isVisible());
    await page.screenshot({ path: path.join(outputDir, '01-home-context-profile-mobile.png'), fullPage: true });

    const summary = {
      schemaVersion: 2,
      gate: 'BETA-G5-HOME-HCM',
      generatedAt: new Date().toISOString(),
      homeUrl,
      budgets,
      metrics,
      checks,
      pageErrors,
      contextBoundary: {
        initialRole: metrics.role,
        action: metrics.primaryActions[0]?.name ?? null,
        authorityClaimed: false,
        canonicalProfileOpened: true,
      },
      humanReviewRequired: true,
    };
    fs.writeFileSync(path.join(outputDir, 'home-hcm-summary.json'), JSON.stringify(summary, null, 2));

    if (checks.some((item) => !item.passed)) process.exitCode = 1;
  } catch (error) {
    fs.writeFileSync(path.join(outputDir, 'home-hcm-summary.json'), JSON.stringify({
      schemaVersion: 2,
      gate: 'BETA-G5-HOME-HCM',
      status: 'FAILED',
      error: error instanceof Error ? error.message : String(error),
      checks,
      pageErrors,
      budgets,
    }, null, 2));
    console.error(error);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();
