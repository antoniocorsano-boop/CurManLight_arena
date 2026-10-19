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
      'SUP-H1-FASCICOLO': {},
      'SUP-H2-VERIFICHE': {},
      'SUP-H3-GUIDA': {},
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
        return pass;
      };

      console.log(`=== S3B CURRICOLO CANONICO — ${profile.id} ===`);
      await gotoRoute(page, '/curriculum');

      const technologyEntry = page.getByRole('button', { name: 'Tecnologia', exact: true }).first();
      await technologyEntry.waitFor({ state: 'visible', timeout: 8000 });
      check('curricolo route is reachable', page.url().includes('/curriculum'));
      check('curricolo opens on the discipline/campo/asse catalog', await technologyEntry.isVisible());
      check(
        'open professional validation is visible before entering a discipline',
        await page.getByText('Validazione professionale aperta', { exact: true }).first().isVisible()
      );
      check(
        'non-vigency is visible before entering a discipline',
        await page.getByText('Non vigente', { exact: true }).first().isVisible()
      );
      check('catalog has no material horizontal overflow', await noHorizontalOverflow(page));

      await clickWithPersonalProfileRecovery(page, technologyEntry);

      const explorer = page.locator('[data-curricolo-explore-trama]').first();
      await explorer.waitFor({ state: 'visible', timeout: 8000 });
      check('canonical curricolo explorer is visible', await explorer.isVisible());
      check(
        'canonical UX contract is declared by the explorer',
        (await explorer.getAttribute('data-curricolo-ux-contract')) === 'ARENA_UX_CONTRACT@1.0.0'
      );
      check(
        'the explorer reads from the canonical local artifact',
        (await explorer.getAttribute('data-curricolo-explore-source')) === 'canonical-curricolo-v1.3'
      );

      const reader = page.getByText('Validazione professionale aperta', { exact: true }).first().locator('xpath=ancestor::section[1]');
      const readerText = (await reader.innerText()).toLowerCase();
      check(
        'curricolo authority state stays teacher-readable',
        readerText.includes('versione di lavoro') &&
          readerText.includes('validazione professionale aperta') &&
          readerText.includes('non vigente')
      );
      check(
        'ordinary curricolo surface does not expose assurance jargon',
        !readerText.includes('sha-256') &&
          !readerText.includes('master canonico') &&
          !readerText.includes('riesame h2') &&
          !readerText.includes('fingerprint')
      );

      const technologyButton = explorer.getByRole('button', { name: 'Tecnologia', exact: true }).first();
      const secondaryButton = explorer.getByRole('button', { name: 'Secondaria', exact: true }).first();
      const class2Button = explorer.getByRole('button', { name: 'Classe II', exact: true }).first();
      await clickWithPersonalProfileRecovery(page, technologyButton);
      await secondaryButton.waitFor({ state: 'visible', timeout: 5000 });
      await clickWithPersonalProfileRecovery(page, secondaryButton);
      await class2Button.waitFor({ state: 'visible', timeout: 5000 });
      await clickWithPersonalProfileRecovery(page, class2Button);

      const focusedExplorer = page.locator('[data-curricolo-focused-explorer]').first();
      await focusedExplorer.waitFor({ state: 'visible', timeout: 5000 });
      const focusedText = (await focusedExplorer.innerText()).toLowerCase();
      check(
        'UX-CURR-01 reaches Tecnologia · Secondaria · Classe II without entering Riesame',
        focusedText.includes('tecnologia') && focusedText.includes('secondaria') && focusedText.includes('classe ii')
      );
      const nodeCards = focusedExplorer.locator('[data-curricolo-unit-card]');
      check('Classe II is rendered as semantic curricolo cards', (await nodeCards.count()) > 0);
      check('semantic exploration has no material horizontal overflow', await noHorizontalOverflow(page));

      const firstCard = nodeCards.first();
      await firstCard.waitFor({ state: 'visible', timeout: 5000 });
      check(
        'canonical detail fields are directly readable from the selected scope',
        await firstCard.locator('[data-curricolo-detail-fields="canonical"]').first().isVisible()
      );

      const tramaAction = firstCard.locator('[data-open-curricolo-trama]').first();
      await tramaAction.waitFor({ state: 'visible', timeout: 5000 });
      await clickWithPersonalProfileRecovery(page, tramaAction);

      const tramaView = page.locator('[data-curricolo-trama-view]').first();
      await tramaView.waitFor({ state: 'visible', timeout: 5000 });
      const noInferredEdge = tramaView.locator('[data-curricolo-trama-no-inferred-edge]').first();
      check('UX-CURR-02 opens Trama from the selected curricolo unit', await tramaView.isVisible());
      check(
        'Trama fails closed because current relations are only proposed',
        (await noInferredEdge.getAttribute('data-relation-policy')) === 'canonical-validated-only'
      );
      const tramaText = (await tramaView.innerText()).toLowerCase();
      check(
        'Trama explicitly refuses inferred or merely proposed links',
        tramaText.includes('nessun raccordo professionale validato') && tramaText.includes('nessuna relazione viene inferita')
      );
      check('Trama remains readable without page-level horizontal overflow', await noHorizontalOverflow(page));

      await clickWithPersonalProfileRecovery(page, tramaView.getByRole('button', { name: /torna a esplora/i }).first());
      await focusedExplorer.waitFor({ state: 'visible', timeout: 5000 });

      const currentFirstCard = focusedExplorer.locator('[data-curricolo-unit-card]').first();
      const contextActions = currentFirstCard.locator('[data-curricolo-context-actions]').first();
      await clickWithPersonalProfileRecovery(page, contextActions.locator('summary'));
      check('curricolo unit exposes a distinct planning handoff', (await contextActions.locator('[data-use-curricolo-in-planning]').count()) === 1);
      const reviewActionCount = await contextActions.locator('[data-send-curricolo-to-review]').count();
      const reviewUnavailableCount = await contextActions.locator('[data-review-unavailable-for-context]').count();
      check('review availability does not alter curricolo readability', reviewActionCount + reviewUnavailableCount === 1);
      check('curricolo unit exposes source as a secondary action', (await contextActions.locator('[data-open-curricolo-source]').count()) === 1);
      check('curricolo unit exposes Documento as a distinct projection action', (await contextActions.locator('[data-open-curricolo-document-from-unit]').count()) === 1);

      const documentMode = page.getByRole('button', { name: 'Documento', exact: true }).first();
      await documentMode.waitFor({ state: 'visible', timeout: 5000 });
      await clickWithPersonalProfileRecovery(page, documentMode);
      const documentHeading = page.getByText('Documento del curricolo', { exact: true }).first();
      await documentHeading.waitFor({ state: 'visible', timeout: 5000 });
      check('Documento opens only after an explicit teacher action', await documentHeading.isVisible());
      check('Documento remains subordinate to ordinary consultation', await page.getByText(/Per la consultazione ordinaria torna a Esplora o Trama/i).first().isVisible().catch(() => false));
      check('Documento does not create page-level horizontal overflow', await noHorizontalOverflow(page));

      await clickWithPersonalProfileRecovery(page, page.getByRole('button', { name: 'Esplora', exact: true }).first());
      await page.locator('[data-curricolo-explore-trama]').first().waitFor({ state: 'visible', timeout: 5000 });
      check('teacher can return from Documento to Esplora without leaving Curricolo', page.url().includes('/curriculum'));

      const sourceDisclosure = page.locator('[data-source-review-progressive-disclosure]').first();
      if (await sourceDisclosure.isVisible({ timeout: 1200 }).catch(() => false)) {
        check('source verification remains secondary progressive disclosure', true);
        check('advanced source tools are not mounted by default', (await page.locator('[data-source-review-advanced-tools]').count()) === 0);
      }

      await page.screenshot({
        path: path.join(artifactDir, `${profile.id}-curricolo-context.png`),
        fullPage: true,
      });

      console.log(`=== SUPPORT CANONICAL V1 — ${profile.id} ===`);

      await gotoRoute(page, '/fascicolo');
      const fascicolo = page.locator('[data-teacher-surface="sources"]').first();
      await fascicolo.waitFor({ state: 'visible', timeout: 5000 });
      const sourcePublication = fascicolo.locator('[data-canonical-source-publication]').first();
      const fascicoloRoutePass = check('SUP-H1 Fascicolo has a stable canonical route', page.url().includes('/fascicolo'));
      const fascicoloPublicationPass = check('SUP-H1 Fascicolo exposes the source publication', await sourcePublication.isVisible().catch(() => false));
      const fascicoloOverflowPass = check('SUP-H1 Fascicolo has no material horizontal overflow', await noHorizontalOverflow(page));
      evidence.tasks['SUP-H1-FASCICOLO'][profile.id] = {
        status: [fascicoloRoutePass, fascicoloPublicationPass, fascicoloOverflowPass].every(Boolean)
          ? 'AUTOMATED_EVIDENCE_PASS'
          : 'AUTOMATED_EVIDENCE_FAIL',
      };

      await gotoRoute(page, '/verifiche');
      const verificationSurface = page.locator('[data-teacher-surface="support-verification"]').first();
      await verificationSurface.waitFor({ state: 'visible', timeout: 5000 });
      const verificationCards = await verificationSurface.locator('[data-verification-state]').count();
      const verificationRoutePass = check('SUP-H2 Verifiche has a stable route distinct from Documenti', page.url().includes('/verifiche') && !page.url().includes('/documents'));
      const verificationCardsPass = check('SUP-H2 Verifiche exposes task-oriented readiness checks', verificationCards >= 5);
      const verificationOverflowPass = check('SUP-H2 Verifiche has no material horizontal overflow', await noHorizontalOverflow(page));
      evidence.tasks['SUP-H2-VERIFICHE'][profile.id] = {
        status: [verificationRoutePass, verificationCardsPass, verificationOverflowPass].every(Boolean)
          ? 'AUTOMATED_EVIDENCE_PASS'
          : 'AUTOMATED_EVIDENCE_FAIL',
        verificationCards,
      };

      await gotoRoute(page, '/guida');
      const guideSurface = page.locator('[data-teacher-surface="support-guide"]').first();
      await guideSurface.waitFor({ state: 'visible', timeout: 5000 });
      const guideTasks = await guideSurface.locator('article').count();
      const guideSurfacePass = check('SUP-H3 Guida opens the task-first support surface', await guideSurface.isVisible().catch(() => false));
      const guideTasksPass = check('SUP-H3 Guida exposes task cards instead of a serial legacy manual', guideTasks >= 5);
      const guideOverflowPass = check('SUP-H3 Guida has no material horizontal overflow', await noHorizontalOverflow(page));
      evidence.tasks['SUP-H3-GUIDA'][profile.id] = {
        status: [guideSurfacePass, guideTasksPass, guideOverflowPass].every(Boolean)
          ? 'AUTOMATED_EVIDENCE_PASS'
          : 'AUTOMATED_EVIDENCE_FAIL',
        guideTasks,
      };

      await page.screenshot({
        path: path.join(artifactDir, `${profile.id}-support-surfaces.png`),
        fullPage: true,
      });

      check('no uncaught page errors in curricolo/provenance/support journey', pageErrors.length === 0);
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
