const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const baseUrl = (process.env.BETA_BASE_URL || 'http://127.0.0.1:4173/CurManLight_arena').replace(/\/$/, '');
const artifactDir = path.join(process.cwd(), 'artifacts', 's3-critical-journeys');
fs.mkdirSync(artifactDir, { recursive: true });

const profiles = [
  { id: 'desktop', viewport: { width: 1280, height: 900 } },
  { id: 'mobile-390x844', viewport: { width: 390, height: 844 } },
];

async function closeLocalProfileIfPresent(page) {
  await page.waitForTimeout(700);
  const dialog = page.locator('[role="dialog"][aria-modal="true"]');
  if (!(await dialog.isVisible({ timeout: 600 }).catch(() => false))) return;
  const closeButton = dialog.locator('button').first();
  if (await closeButton.isVisible({ timeout: 400 }).catch(() => false)) {
    await closeButton.click();
    await dialog.waitFor({ state: 'hidden', timeout: 3000 }).catch(() => undefined);
  }
}

async function gotoRoute(page, route) {
  const response = await page.goto(`${baseUrl}${route}`, {
    waitUntil: 'domcontentloaded',
    timeout: 30000,
  });
  const status = response?.status();
  // GitHub Pages returns the repository 404 document for deep SPA routes;
  // dist/404.html intentionally mirrors index.html so BrowserRouter can
  // rehydrate the requested pathname. Treat only missing responses and 5xx
  // results as transport failures; route correctness is asserted in-page.
  if (!response || (typeof status === 'number' && status >= 500)) {
    throw new Error(`Navigation failed for ${route}: ${status ?? 'no response'}`);
  }
  await closeLocalProfileIfPresent(page);
}

async function noHorizontalOverflow(page) {
  return page.evaluate(() => {
    const root = document.documentElement;
    return root.scrollWidth <= window.innerWidth + 4;
  });
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const evidence = {
    schema: 'CML_ARENA_S3B_BROWSER_EVIDENCE_V1',
    baseUrl,
    generatedAt: new Date().toISOString(),
    humanVerdictIssued: false,
    tasks: {
      'HT-BETA-CURRICULUM-CONTEXT': {},
      'HT-BETA-REVISION-PREPARE': { delegatedTo: 'verify-beta-g4-browser.cjs' },
      'HT-REVISION-DECISION': { delegatedTo: 'verify-beta-g4-browser.cjs' },
      'HT-BETA-PLANNING-HANDOFF': { delegatedTo: 'verify-beta-g4-browser.cjs' },
    },
    profiles: [],
  };

  let failed = false;

  try {
    for (const profile of profiles) {
      const context = await browser.newContext({ viewport: profile.viewport, locale: 'it-IT' });
      const page = await context.newPage();
      const pageErrors = [];
      page.on('pageerror', (error) => pageErrors.push(error.message));

      const result = {
        id: profile.id,
        viewport: profile.viewport,
        checks: [],
        pageErrors,
      };
      const check = (label, condition) => {
        const pass = Boolean(condition);
        result.checks.push({ label, pass });
        console.log(`${pass ? '✓' : '✗'} [${profile.id}] ${label}`);
        if (!pass) failed = true;
      };

      console.log(`=== S3B CURRICULUM CONTEXT — ${profile.id} ===`);
      await gotoRoute(page, '/curriculum');

      const contextHeader = page.getByText('Area locale di consultazione', { exact: false }).first();
      await contextHeader.waitFor({ state: 'visible', timeout: 8000 });
      check('curriculum context route is reachable', page.url().includes('/curriculum'));
      check('curriculum context is visibly identified', await contextHeader.isVisible());

      const bodyText = await page.locator('body').innerText();
      check(
        'curriculum copy does not silently claim institutional adoption',
        bodyText.includes('non verificata') || bodyText.includes('prive di valore deliberativo') || bodyText.includes('non attestano')
      );
      check('curriculum context has no material horizontal overflow', await noHorizontalOverflow(page));

      const provenanceEntry = profile.id === 'desktop'
        ? page.getByText('Controlla le fonti', { exact: false }).first()
        : page.getByText('Fonti', { exact: true }).first();
      await provenanceEntry.waitFor({ state: 'visible', timeout: 5000 });
      check('provenance inspection entry point is visible', await provenanceEntry.isVisible());
      await provenanceEntry.click();
      await page.waitForURL(/\/fonti(?:\/|$|\?)/, { timeout: 5000 });
      check('provenance entry reaches the canonical /fonti route', page.url().includes('/fonti'));

      await page.screenshot({
        path: path.join(artifactDir, `${profile.id}-curriculum-context.png`),
        fullPage: true,
      });

      check('no uncaught page errors in curriculum/provenance journey', pageErrors.length === 0);
      evidence.tasks['HT-BETA-CURRICULUM-CONTEXT'][profile.id] = {
        status: result.checks.every((item) => item.pass) ? 'AUTOMATED_EVIDENCE_PASS' : 'AUTOMATED_EVIDENCE_FAIL',
        checks: result.checks,
      };
      evidence.profiles.push(result);
      await context.close();
    }
  } catch (error) {
    failed = true;
    evidence.error = error instanceof Error ? error.message : String(error);
    console.error(error);
  } finally {
    fs.writeFileSync(
      path.join(artifactDir, 'browser-evidence.json'),
      `${JSON.stringify(evidence, null, 2)}\n`,
      'utf8'
    );
    await browser.close();
  }

  console.log('Automation collected browser evidence only; no human verdict was issued.');
  if (failed) process.exitCode = 1;
})();
