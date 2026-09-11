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
  return page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 4);
}

async function inspectCurriculumTableScroll(locator) {
  return locator.evaluate((wrapper) => {
    const table = wrapper.querySelector('[data-curriculum-publication-grid]');
    if (!(table instanceof HTMLElement)) {
      return {
        hasTable: false,
        overflowX: '',
        tableDisplay: '',
        clientWidth: wrapper.clientWidth,
        scrollWidth: wrapper.scrollWidth,
        scrollMoved: false,
      };
    }

    const wrapperStyle = getComputedStyle(wrapper);
    const tableStyle = getComputedStyle(table);
    const maxScrollLeft = Math.max(0, wrapper.scrollWidth - wrapper.clientWidth);
    wrapper.scrollLeft = Math.min(120, maxScrollLeft);

    return {
      hasTable: true,
      overflowX: wrapperStyle.overflowX,
      tableDisplay: tableStyle.display,
      clientWidth: wrapper.clientWidth,
      scrollWidth: wrapper.scrollWidth,
      scrollMoved: maxScrollLeft > 0 && wrapper.scrollLeft > 0,
    };
  });
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const evidence = {
    schema: 'CML_ARENA_S3B_BROWSER_EVIDENCE_V2',
    uxContract: 'ARENA_UX_CONTRACT@1.0.0',
    baseUrl,
    generatedAt: new Date().toISOString(),
    humanVerdictIssued: false,
    tasks: {
      'HT-BETA-CURRICULUM-CONTEXT': {},
      'UX-CURR-01': {},
      'UX-CURR-02': {},
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

      console.log(`=== S3B CURRICULUM CONTEXT V2 — ${profile.id} ===`);
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
        'curriculum surface declares the canonical UX contract',
        (await canonicalEntry.getAttribute('data-curriculum-ux-contract')) === 'ARENA_UX_CONTRACT@1.0.0'
      );
      check(
        'curriculum declares source-snapshot parity with the department document',
        (await canonicalEntry.getAttribute('data-curriculum-publication-parity')) === 'source-snapshot'
      );

      const authorityText = (await canonicalEntry.innerText()).toLowerCase();
      check(
        'curriculum validation state is persistently visible in teacher-readable language',
        authorityText.includes('versione di lavoro') && authorityText.includes('validazione professionale aperta')
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
        'canonical curriculum is visibly a vertical 3–14 path',
        authorityText.includes('curricolo verticale') && authorityText.includes('percorso verticale 3–14')
      );
      check(
        'ordinary curriculum surface does not expose assurance jargon',
        !authorityText.includes('sha-256') &&
          !authorityText.includes('master canonico') &&
          !authorityText.includes('riesame h2') &&
          !authorityText.includes('fingerprint')
      );

      const exploreMode = canonicalEntry.locator('[data-curriculum-mode="explore"]').first();
      const tramaMode = canonicalEntry.locator('[data-curriculum-mode="trama"]').first();
      const documentMode = canonicalEntry.locator('[data-curriculum-mode="document"]').first();
      await exploreMode.waitFor({ state: 'visible', timeout: 5000 });
      await tramaMode.waitFor({ state: 'visible', timeout: 5000 });
      await documentMode.waitFor({ state: 'visible', timeout: 5000 });
      check(
        'Esplora Trama and Documento are the three visible curriculum projections',
        await exploreMode.isVisible() && await tramaMode.isVisible() && await documentMode.isVisible()
      );
      check('Esplora is the default curriculum projection', (await page.locator('[data-curriculum-professional-explorer]').count()) === 1);
      check('Documento is not mounted before explicit selection', (await page.locator('[data-curriculum-document-reader]').count()) === 0);
      check('curriculum context has no material horizontal overflow', await noHorizontalOverflow(page));

      const explorer = page.locator('[data-curriculum-explore-trama]').first();
      await explorer.waitFor({ state: 'visible', timeout: 5000 });
      const technologyButton = explorer.getByRole('button', { name: 'Tecnologia', exact: true }).first();
      const secondaryButton = explorer.getByRole('button', { name: 'Secondaria', exact: true }).first();
      const class2Button = explorer.getByRole('button', { name: 'Classe II', exact: true }).first();
      await technologyButton.waitFor({ state: 'visible', timeout: 5000 });
      await clickWithPersonalProfileRecovery(page, technologyButton);
      await clickWithPersonalProfileRecovery(page, secondaryButton);
      await clickWithPersonalProfileRecovery(page, class2Button);

      const focusedExplorer = page.locator('[data-curriculum-focused-explorer]').first();
      await focusedExplorer.waitFor({ state: 'visible', timeout: 5000 });
      const focusedText = (await focusedExplorer.innerText()).toLowerCase();
      check('UX-CURR-01 reaches Tecnologia · Secondaria · Classe II directly', focusedText.includes('tecnologia') && focusedText.includes('secondaria — classe ii'));
      const nodeCards = focusedExplorer.locator('[data-curriculum-unit-card]');
      check('Classe II is rendered as semantic curriculum cards', (await nodeCards.count()) > 0);
      check('semantic exploration does not create page-level horizontal overflow', await noHorizontalOverflow(page));

      const firstCard = nodeCards.first();
      const tramaAction = firstCard.locator('[data-open-curriculum-trama]').first();
      await tramaAction.waitFor({ state: 'visible', timeout: 5000 });
      await clickWithPersonalProfileRecovery(page, tramaAction);
      const tramaView = page.locator('[data-curriculum-trama-view]').first();
      await tramaView.waitFor({ state: 'visible', timeout: 5000 });
      const tramaGraph = tramaView.locator('[data-curriculum-trama-graph]').first();
      check('UX-CURR-02 opens Trama from the selected curriculum unit', await tramaView.isVisible());
      check('Trama is explicitly fail-closed on exact nucleus identity', (await tramaGraph.getAttribute('data-relation-policy')) === 'same-nucleus-exact-only');
      check('Trama remains readable without page-level horizontal overflow', await noHorizontalOverflow(page));

      const backToExplore = tramaView.getByRole('button', { name: /torna a esplora/i }).first();
      await clickWithPersonalProfileRecovery(page, backToExplore);
      await focusedExplorer.waitFor({ state: 'visible', timeout: 5000 });

      const currentFirstCard = focusedExplorer.locator('[data-curriculum-unit-card]').first();
      const contextActions = currentFirstCard.locator('[data-curriculum-context-actions]').first();
      await clickWithPersonalProfileRecovery(page, contextActions.locator('summary'));
      check('curriculum unit exposes a distinct planning handoff', (await contextActions.locator('[data-use-curriculum-in-planning]').count()) === 1);
      check('curriculum unit exposes a distinct review handoff for Technology class II', (await contextActions.locator('[data-send-curriculum-to-review]').count()) === 1);
      check('curriculum unit exposes source as a secondary action', (await contextActions.locator('[data-open-curriculum-source]').count()) === 1);
      check('curriculum unit exposes Document as a distinct projection action', (await contextActions.locator('[data-open-curriculum-document-from-unit]').count()) === 1);

      await clickWithPersonalProfileRecovery(page, documentMode);
      const documentReader = page.locator('[data-curriculum-document-reader]').first();
      await documentReader.waitFor({ state: 'visible', timeout: 5000 });
      check('Documento opens only after an explicit teacher action', await documentReader.isVisible());
      check('department curriculum document is available in Documento', (await documentReader.locator('[data-open-department-curriculum-document]').count()) === 1);
      check('foundations and traceability remain a secondary document', (await documentReader.locator('[data-open-department-foundations-document]').count()) === 1);

      const integralPublication = documentReader.locator('[data-curriculum-integral-web-publication]').first();
      await clickWithPersonalProfileRecovery(page, integralPublication.locator('summary'));

      if (profile.id === 'desktop') {
        const desktopIndex = integralPublication.locator('[data-curriculum-desktop-index]').first();
        await desktopIndex.waitFor({ state: 'visible', timeout: 5000 });
        check('Documento exposes the full 16-section editorial index on desktop', (await desktopIndex.locator('button').count()) === 16);
        const technologyIndexButton = desktopIndex.getByRole('button', { name: /Tecnologia — curricolo verticale/i }).first();
        await clickWithPersonalProfileRecovery(page, technologyIndexButton);
      } else {
        const sectionSelector = integralPublication.locator('[data-curriculum-section-selector]').first();
        await sectionSelector.waitFor({ state: 'visible', timeout: 5000 });
        check('Documento exposes compact editorial navigation on mobile', await sectionSelector.isVisible());
        check('mobile editorial selector exposes all 16 sections', (await sectionSelector.locator('option').count()) === 16);
        await sectionSelector.selectOption('tecnologia');
      }

      const technologyPublication = integralPublication.locator('[data-curriculum-publication-content][data-source-section="9"]').first();
      await technologyPublication.waitFor({ state: 'visible', timeout: 5000 });
      const technologyText = (await technologyPublication.innerText()).toLowerCase();
      check('Documento can still open the complete Technology section', technologyText.includes('perché si studia tecnologia'));
      check('Documento preserves the annual matrices', (await technologyPublication.locator('[data-curriculum-publication-table]').count()) >= 8);
      check('Documento preserves class I to class III progression', technologyText.includes('secondaria — classe i') && technologyText.includes('secondaria — classe iii'));
      check('Documento does not create page-level horizontal overflow', await noHorizontalOverflow(page));

      if (profile.id === 'mobile-390x844') {
        const tableScroll = technologyPublication.locator('[data-curriculum-table-scroll]').first();
        await tableScroll.waitFor({ state: 'visible', timeout: 5000 });
        const scrollState = await inspectCurriculumTableScroll(tableScroll);
        result.curriculumTableScroll = scrollState;
        check('portrait document table exposes a dedicated scroll wrapper', scrollState.hasTable);
        check('portrait document table wrapper owns horizontal overflow', ['auto', 'scroll'].includes(scrollState.overflowX));
        check('portrait document table preserves native table layout', scrollState.tableDisplay === 'table');
        check('portrait document table is wider than its viewport container', scrollState.scrollWidth > scrollState.clientWidth);
        check('portrait document table can move horizontally inside its wrapper', scrollState.scrollMoved);
      }

      await clickWithPersonalProfileRecovery(page, exploreMode);
      await page.locator('[data-curriculum-professional-explorer]').first().waitFor({ state: 'visible', timeout: 5000 });
      check('teacher can return from Documento to Esplora without leaving Curricolo', page.url().includes('/curriculum'));

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
      const profileStatus = result.checks.every((item) => item.pass) ? 'AUTOMATED_EVIDENCE_PASS' : 'AUTOMATED_EVIDENCE_FAIL';
      evidence.tasks['HT-BETA-CURRICULUM-CONTEXT'][profile.id] = { status: profileStatus, checks: result.checks };
      evidence.tasks['UX-CURR-01'][profile.id] = { status: profileStatus };
      evidence.tasks['UX-CURR-02'][profile.id] = { status: profileStatus };
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
