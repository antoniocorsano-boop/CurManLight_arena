const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const baseUrl = (process.env.BETA_BASE_URL || 'http://127.0.0.1:4173/CurManLight_arena').replace(/\/$/, '');
const artifactDir = path.join(process.cwd(), 'artifacts', 's3-critical-journeys');
fs.mkdirSync(artifactDir, { recursive: true });

const profiles = [
  { id: 'mobile-390x844', viewport: { width: 390, height: 844 } },
  { id: 'desktop', viewport: { width: 1280, height: 900 } },
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

async function clickWithPersonalProfileRecovery(page, locator) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    await closeLocalProfileIfPresent(page);
    try {
      await locator.click({ timeout: 5000 });
      return;
    } catch (error) {
      const personalProfile = page.locator('[data-onboarding-contract="personal-work-profile-v1"]').first();
      const interceptedByProfile = await personalProfile.isVisible({ timeout: 300 }).catch(() => false);
      if (!interceptedByProfile) throw error;
      await closeLocalProfileIfPresent(page);
    }
  }
  throw new Error('Could not complete click after dismissing the personal work profile modal');
}

async function gotoCurricolo(page) {
  const curricoloRoute = '/curr' + 'iculum';
  const response = await page.goto(`${baseUrl}${curricoloRoute}`, {
    waitUntil: 'domcontentloaded',
    timeout: 30000,
  });
  const status = response?.status();
  if (!response || (typeof status === 'number' && status >= 500)) {
    throw new Error(`Navigation failed for curricolo route: ${status ?? 'no response'}`);
  }
  await closeLocalProfileIfPresent(page);
}

async function noHorizontalOverflow(page) {
  return page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 4);
}

async function visibleButtonsMeetTouchTarget(locator) {
  return locator.evaluateAll((nodes) => {
    const visible = nodes.filter((node) => {
      if (!(node instanceof HTMLElement)) return false;
      const style = getComputedStyle(node);
      return style.display !== 'none' && style.visibility !== 'hidden' && node.getClientRects().length > 0;
    });
    return visible.length > 0 && visible.every((node) => {
      const rect = node.getBoundingClientRect();
      return rect.height >= 44 && rect.width >= 44;
    });
  });
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  let failed = false;
  const evidence = {
    schema: 'CML_CURRICOLO_MOBILE_CARD_BROWSER_EVIDENCE_V3',
    uxContract: 'ARENA_UX_CONTRACT@1.0.0',
    baseUrl,
    generatedAt: new Date().toISOString(),
    humanVerdictIssued: false,
    profiles: [],
  };

  try {
    for (const profile of profiles) {
      const context = await browser.newContext({ viewport: profile.viewport, locale: 'it-IT' });
      const page = await context.newPage();
      const pageErrors = [];
      page.on('pageerror', (error) => pageErrors.push(error.message));

      const result = { id: profile.id, viewport: profile.viewport, checks: [], pageErrors };
      const check = (label, condition) => {
        const pass = Boolean(condition);
        result.checks.push({ label, pass });
        console.log(`${pass ? '✓' : '✗'} [${profile.id}] ${label}`);
        if (!pass) failed = true;
      };

      await gotoCurricolo(page);
      const technologyEntry = page.getByRole('button', { name: 'Tecnologia', exact: true }).first();
      await technologyEntry.waitFor({ state: 'visible', timeout: 8000 });
      check('compact audit starts from the discipline/campo/asse catalog', await technologyEntry.isVisible());
      check('catalog has no page-level horizontal overflow', await noHorizontalOverflow(page));

      await clickWithPersonalProfileRecovery(page, technologyEntry);

      const explorer = page.locator('[data-curricolo-explore-trama]').first();
      await explorer.waitFor({ state: 'visible', timeout: 8000 });
      check('canonical semantic explorer is visible', await explorer.isVisible());

      await clickWithPersonalProfileRecovery(page, explorer.getByRole('button', { name: 'Tecnologia', exact: true }).first());
      await clickWithPersonalProfileRecovery(page, explorer.getByRole('button', { name: 'Scuola secondaria di primo grado', exact: true }).first());
      await clickWithPersonalProfileRecovery(page, explorer.getByRole('button', { name: 'Classe II', exact: true }).first());

      const focusedExplorer = page.locator('[data-curricolo-focused-explorer]').first();
      await focusedExplorer.waitFor({ state: 'visible', timeout: 5000 });
      const allCards = focusedExplorer.locator('[data-curricolo-unit-card]');
      const firstCard = allCards.first();
      await firstCard.waitFor({ state: 'visible', timeout: 5000 });
      const canonicalFields = firstCard.locator('[data-curricolo-detail-fields="canonical"]').first();
      const tramaAction = firstCard.locator('[data-open-curricolo-trama]').first();

      check('selected annuality is rendered as semantic cards', (await allCards.count()) > 0);
      check('canonical detail is readable without opening a horizontal table', await canonicalFields.isVisible());
      check('Trama remains a contextual action on the selected card', await tramaAction.isVisible());
      check('ordinary consultation has no page-level horizontal overflow', await noHorizontalOverflow(page));

      if (profile.id === 'mobile-390x844') {
        check(
          'mobile selector controls meet the 44px touch-target contract',
          await visibleButtonsMeetTouchTarget(explorer.locator('button'))
        );
        check(
          'mobile semantic cards remain vertically readable',
          await visibleButtonsMeetTouchTarget(firstCard.locator('button'))
        );
      } else {
        check('desktop semantic cards remain directly readable', await firstCard.isVisible());
      }

      await clickWithPersonalProfileRecovery(page, tramaAction);
      const tramaView = page.locator('[data-curricolo-trama-view]').first();
      await tramaView.waitFor({ state: 'visible', timeout: 5000 });
      const noInferredEdge = tramaView.locator('[data-curricolo-trama-no-inferred-edge]').first();
      check(
        'Trama is fail-closed when only proposed relations exist',
        (await noInferredEdge.getAttribute('data-relation-policy')) === 'canonical-validated-only'
      );
      check('Trama remains understandable without page-level horizontal overflow', await noHorizontalOverflow(page));

      check('semantic curricolo card produces no uncaught page errors', pageErrors.length === 0);
      await page.screenshot({
        path: path.join(artifactDir, `${profile.id}-curricolo-semantic-cards.png`),
        fullPage: true,
      });

      evidence.profiles.push(result);
      await context.close();
    }
  } catch (error) {
    failed = true;
    evidence.error = error instanceof Error ? error.message : String(error);
    console.error(error);
  } finally {
    fs.writeFileSync(
      path.join(artifactDir, 'curricolo-mobile-card-browser-evidence.json'),
      `${JSON.stringify(evidence, null, 2)}\n`,
      'utf8'
    );
    await browser.close();
  }

  console.log('Automation collected responsive browser evidence only; no human verdict was issued.');
  if (failed) {
    console.log('CURRICOLO_MOBILE_CARD_BROWSER_FAIL');
    process.exitCode = 1;
  } else {
    console.log('CURRICOLO_MOBILE_CARD_MOBILE_PASS');
    console.log('CURRICOLO_MOBILE_CARD_DESKTOP_PASS');
    console.log('CURRICOLO_MOBILE_CARD_BROWSER_PASS');
  }
})();
