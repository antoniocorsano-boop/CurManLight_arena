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

async function clickWithPersonalProfileRecovery(page, locator) {
  // Recover only from the known personal-profile onboarding modal; every other click failure remains hard.
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

async function gotoRoute(page, route) {
  const response = await page.goto(`${baseUrl}${route}`, {
    waitUntil: 'domcontentloaded',
    timeout: 30000,
  });
  const status = response?.status();
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

      const canonicalEntry = page.locator('[data-canonical-curriculum-entry]').first();
      await canonicalEntry.waitFor({ state: 'visible', timeout: 8000 });
      check('curriculum context route is reachable', page.url().includes('/curriculum'));
      check('canonical curriculum context is visibly identified', await canonicalEntry.isVisible());
      check(
        'curriculum is presented as a professional publication',
        (await canonicalEntry.getAttribute('data-curriculum-presentation')) === 'professional-publication'
      );
      check(
        'web publication declares source-snapshot parity with the department document',
        (await canonicalEntry.getAttribute('data-curriculum-publication-parity')) === 'source-snapshot'
      );

      const authorityText = (await canonicalEntry.innerText()).toLowerCase();
      check(
        'curriculum validation state is persistently visible in teacher-readable language',
        authorityText.includes('da esaminare e validare')
      );
      check(
        'professional identity of the department is visible',
        authorityText.includes('dipartimento scientifico-matematico-tecnologico') &&
          authorityText.includes('matematica') &&
          authorityText.includes('scienze') &&
          authorityText.includes('tecnologia') &&
          authorityText.includes('informatica')
      );
      check(
        'canonical curriculum is visibly a 3–14 path',
        authorityText.includes('curricolo verticale') &&
          authorityText.includes('percorso 3–14') &&
          authorityText.includes('infanzia') &&
          authorityText.includes('primaria') &&
          authorityText.includes('secondaria')
      );
      check(
        'ordinary curriculum surface does not expose assurance jargon',
        !authorityText.includes('sha-256') &&
          !authorityText.includes('master canonico') &&
          !authorityText.includes('riesame h2') &&
          !authorityText.includes('868')
      );

      const webMode = canonicalEntry.locator('[data-curriculum-mode="web"]').first();
      const documentMode = canonicalEntry.locator('[data-curriculum-mode="document"]').first();
      await webMode.waitFor({ state: 'visible', timeout: 5000 });
      await documentMode.waitFor({ state: 'visible', timeout: 5000 });
      check('web and document presentation modes are both visible', await webMode.isVisible() && await documentMode.isVisible());
      check('web reader is the default opening mode', (await page.locator('[data-curriculum-web-reader]').count()) === 1);
      check('document reader is not mounted before the teacher chooses it', (await page.locator('[data-curriculum-document-reader]').count()) === 0);
      check('curriculum context has no material horizontal overflow', await noHorizontalOverflow(page));

      if (profile.id === 'desktop') {
        const desktopIndex = canonicalEntry.locator('[data-curriculum-desktop-index]').first();
        await desktopIndex.waitFor({ state: 'visible', timeout: 5000 });
        check('desktop web reader offers a persistent editorial index', await desktopIndex.isVisible());
        const indexButtons = desktopIndex.locator('button');
        check('desktop editorial index exposes all 16 sections', (await indexButtons.count()) === 16);
        await clickWithPersonalProfileRecovery(page, indexButtons.nth(8));
      } else {
        const sectionSelector = canonicalEntry.locator('[data-curriculum-section-selector]').first();
        await sectionSelector.waitFor({ state: 'visible', timeout: 5000 });
        check('mobile web reader offers compact section navigation', await sectionSelector.isVisible());
        check('mobile web reader starts from the first editorial section', (await sectionSelector.inputValue()) === 'identita');
        check('mobile editorial selector exposes all 16 sections', (await sectionSelector.locator('option').count()) === 16);
        await sectionSelector.selectOption('tecnologia');
      }

      const technologyPublication = canonicalEntry.locator('[data-curriculum-publication-content][data-source-section="9"]').first();
      await technologyPublication.waitFor({ state: 'visible', timeout: 5000 });
      const technologyText = (await technologyPublication.innerText()).toLowerCase();
      check('structured web publication can open the full Technology section', technologyText.includes('perché si studia tecnologia'));
      check('Technology web section preserves annual matrices', (await technologyPublication.locator('[data-curriculum-publication-table]').count()) >= 8);
      check('Technology web section exposes class I and class III progression', technologyText.includes('secondaria — classe i') && technologyText.includes('secondaria — classe iii'));
      check('full curriculum tables do not create page-level horizontal overflow', await noHorizontalOverflow(page));

      await clickWithPersonalProfileRecovery(page, documentMode);
      const documentReader = page.locator('[data-curriculum-document-reader]').first();
      await documentReader.waitFor({ state: 'visible', timeout: 5000 });
      check('document mode opens only after an explicit teacher action', await documentReader.isVisible());
      check('department curriculum document is available in document mode', (await documentReader.locator('[data-open-department-curriculum-document]').count()) === 1);
      check('foundations and traceability document is available as a secondary document', (await documentReader.locator('[data-open-department-foundations-document]').count()) === 1);
      check('document mode has no material horizontal overflow', await noHorizontalOverflow(page));

      await clickWithPersonalProfileRecovery(page, webMode);
      await page.locator('[data-curriculum-web-reader]').first().waitFor({ state: 'visible', timeout: 5000 });
      check('teacher can return from document to web reading without leaving Curriculum', page.url().includes('/curriculum'));

      const sourceDisclosure = page.locator('[data-source-review-progressive-disclosure]').first();
      await sourceDisclosure.waitFor({ state: 'visible', timeout: 5000 });
      check('source verification is available as a secondary closed disclosure', await sourceDisclosure.isVisible());
      check('advanced source tools are not mounted by default', (await page.locator('[data-source-review-advanced-tools]').count()) === 0);

      await clickWithPersonalProfileRecovery(page, sourceDisclosure.locator('summary'));
      const sourceToolsAction = sourceDisclosure.getByRole('button', { name: /apri gli strumenti di verifica/i }).first();
      await sourceToolsAction.waitFor({ state: 'visible', timeout: 5000 });
      check('source assurance requires a second intentional action', await sourceToolsAction.isVisible());
      check('first disclosure still keeps advanced assurance tools unmounted', (await page.locator('[data-source-review-advanced-tools]').count()) === 0);

      await clickWithPersonalProfileRecovery(page, sourceToolsAction);
      const advancedTools = page.locator('[data-source-review-advanced-tools]').first();
      await advancedTools.waitFor({ state: 'visible', timeout: 5000 });
      check('advanced source verification mounts only after the second action', await advancedTools.isVisible());
      check('source review preserves the canonical curriculum route', page.url().includes('/curriculum'));
      check('expanded advanced source review has no material horizontal overflow', await noHorizontalOverflow(page));

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
