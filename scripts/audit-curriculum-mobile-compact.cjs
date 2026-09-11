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

async function gotoCurriculum(page) {
  const response = await page.goto(`${baseUrl}/curriculum`, {
    waitUntil: 'domcontentloaded',
    timeout: 30000,
  });
  const status = response?.status();
  if (!response || (typeof status === 'number' && status >= 500)) {
    throw new Error(`Navigation failed for /curriculum: ${status ?? 'no response'}`);
  }
  await closeLocalProfileIfPresent(page);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  let failed = false;
  const evidence = {
    schema: 'CML_CURRICULUM_MOBILE_COMPACT_BROWSER_EVIDENCE_V1',
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

      await gotoCurriculum(page);
      const explorer = page.locator('[data-curriculum-explore-trama]').first();
      await explorer.waitFor({ state: 'visible', timeout: 8000 });

      await clickWithPersonalProfileRecovery(page, explorer.getByRole('button', { name: 'Tecnologia', exact: true }).first());
      await clickWithPersonalProfileRecovery(page, explorer.getByRole('button', { name: 'Secondaria', exact: true }).first());
      await clickWithPersonalProfileRecovery(page, explorer.getByRole('button', { name: 'Classe II', exact: true }).first());

      const firstCard = page.locator('[data-curriculum-focused-explorer] [data-curriculum-unit-card]').first();
      await firstCard.waitFor({ state: 'visible', timeout: 5000 });
      const mobileDetail = firstCard.locator('[data-curriculum-mobile-detail="expandable"]').first();
      const mobileSummary = firstCard.locator('[data-curriculum-mobile-summary="detail"]').first();
      const mobileFields = firstCard.locator('[data-curriculum-detail-fields="mobile"]').first();
      const desktopFields = firstCard.locator('[data-curriculum-detail-fields="desktop"]').first();
      const tramaAction = firstCard.locator('[data-open-curriculum-trama]').first();

      if (profile.id === 'mobile-390x844') {
        check('mobile compact summary is visible', await mobileSummary.isVisible());
        check('mobile curriculum detail starts collapsed', !(await mobileDetail.evaluate((element) => element.open)));
        check('mobile curriculum fields are hidden before expansion', !(await mobileFields.isVisible()));
        check('Trama action remains visible while detail is collapsed', await tramaAction.isVisible());

        await clickWithPersonalProfileRecovery(page, mobileSummary);
        check('mobile curriculum detail opens on explicit teacher action', await mobileDetail.evaluate((element) => element.open));
        check('mobile curriculum fields become visible after expansion', await mobileFields.isVisible());
        check('Trama action remains visible after detail expansion', await tramaAction.isVisible());
      } else {
        check('mobile disclosure is hidden on desktop', !(await mobileSummary.isVisible()));
        check('desktop curriculum detail is visible without interaction', await desktopFields.isVisible());
        check('Trama action remains directly visible on desktop', await tramaAction.isVisible());
      }

      check('compact curriculum card produces no uncaught page errors', pageErrors.length === 0);
      await page.screenshot({
        path: path.join(artifactDir, `${profile.id}-curriculum-mobile-compact.png`),
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
      path.join(artifactDir, 'curriculum-mobile-compact-browser-evidence.json'),
      `${JSON.stringify(evidence, null, 2)}\n`,
      'utf8'
    );
    await browser.close();
  }

  console.log('Automation collected responsive browser evidence only; no human verdict was issued.');
  if (failed) {
    console.log('CURRICULUM_MOBILE_COMPACT_BROWSER_FAIL');
    process.exitCode = 1;
  } else {
    console.log('CURRICULUM_MOBILE_COMPACT_MOBILE_PASS');
    console.log('CURRICULUM_MOBILE_COMPACT_DESKTOP_PASS');
    console.log('CURRICULUM_MOBILE_COMPACT_BROWSER_PASS');
  }
})();
