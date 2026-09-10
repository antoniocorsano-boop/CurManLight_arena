const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const baseUrl = (process.env.BETA_BASE_URL || 'http://127.0.0.1:4173/CurManLight_arena').replace(/\/$/, '');
const artifactDir = path.join(process.cwd(), 'artifacts', 'curriculum-explore-trama-v1');
fs.mkdirSync(artifactDir, { recursive: true });

const profiles = [
  { id: 'desktop', viewport: { width: 1280, height: 900 } },
  { id: 'mobile-390x844', viewport: { width: 390, height: 844 } },
];

async function closeLocalProfileIfPresent(page) {
  await page.waitForTimeout(500);
  const dialog = page.locator('[role="dialog"][aria-modal="true"]');
  if (!(await dialog.isVisible({ timeout: 500 }).catch(() => false))) return;
  const closeButton = dialog.locator('button').first();
  if (await closeButton.isVisible({ timeout: 400 }).catch(() => false)) {
    await closeButton.click();
    await dialog.waitFor({ state: 'hidden', timeout: 3000 }).catch(() => undefined);
  }
}

async function gotoCurriculum(page) {
  const response = await page.goto(`${baseUrl}/curriculum`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  if (!response || response.status() >= 500) throw new Error(`Curriculum navigation failed: ${response?.status() ?? 'no response'}`);
  await closeLocalProfileIfPresent(page);
}

async function noPageHorizontalOverflow(page) {
  return page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 4);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const evidence = {
    schema: 'CML_CURRICULUM_EXPLORE_TRAMA_V1_BROWSER_EVIDENCE',
    baseUrl,
    generatedAt: new Date().toISOString(),
    humanVerdictIssued: false,
    profiles: [],
  };
  let failed = false;

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
      const surface = page.locator('[data-curriculum-explore-trama]').first();
      await surface.waitFor({ state: 'visible', timeout: 8000 });

      check('focused teacher consultation is visible before the integral publication', await surface.isVisible());
      check('discipline selector exposes the four department disciplines', (await surface.locator('[data-curriculum-discipline-selector] button').count()) === 4);
      check('Technology is the initial professional context', (await surface.innerText()).includes('Tecnologia'));

      const secondaryButton = surface.getByRole('button', { name: 'Secondaria', exact: true }).first();
      await secondaryButton.click();
      const annualitySelector = surface.locator('[data-curriculum-annuality-selector]').first();
      await annualitySelector.waitFor({ state: 'visible', timeout: 4000 });
      check('secondary Technology exposes three annualities directly', (await annualitySelector.locator('button').count()) === 3);

      const classTwoButton = annualitySelector.getByRole('button', { name: 'Classe II', exact: true }).first();
      await classTwoButton.click();
      const focusedExplorer = surface.locator('[data-curriculum-focused-explorer]').first();
      await focusedExplorer.waitFor({ state: 'visible', timeout: 4000 });
      const explorerText = await focusedExplorer.innerText();
      check('class II can be reached without traversing the 16 editorial sections', explorerText.includes('Secondaria — classe II'));
      check('class II is rendered as semantic cards rather than requiring the integral table', (await focusedExplorer.locator('[data-curriculum-node-cards] article').count()) >= 8);
      check('focused exploration preserves nucleus and annual outcome content', explorerText.includes('Cultura tecnica e sistemi') && explorerText.includes('Esito annuale d’Istituto'));
      check('focused exploration has no page-level horizontal overflow', await noPageHorizontalOverflow(page));

      const cultureCard = focusedExplorer.locator('[data-curriculum-node-cards] article').filter({ hasText: 'Cultura tecnica e sistemi' }).first();
      await cultureCard.waitFor({ state: 'visible', timeout: 4000 });
      await cultureCard.locator('[data-open-curriculum-trama]').click();

      const trama = surface.locator('[data-curriculum-trama-view]').first();
      await trama.waitFor({ state: 'visible', timeout: 4000 });
      const graph = trama.locator('[data-curriculum-trama-graph]').first();
      check('Trama opens from a curricular node without leaving Curriculum', await trama.isVisible() && page.url().includes('/curriculum'));
      check('Trama declares exact-only relation policy', (await graph.getAttribute('data-relation-policy')) === 'same-nucleus-exact-only');
      check('exact repeated nucleus produces a visible three-year progression', (await graph.locator('[data-curriculum-trama-node]').count()) === 3);
      const tramaText = await trama.innerText();
      check('Trama exposes classes I, II and III for the repeated nucleus', tramaText.includes('Secondaria — classe I') && tramaText.includes('Secondaria — classe II') && tramaText.includes('Secondaria — classe III'));
      check('Trama explains that links are not inferred or invented', tramaText.includes('Nessun collegamento viene inferito o inventato'));
      check('Trama remains usable without page-level horizontal overflow', await noPageHorizontalOverflow(page));

      const exploreButton = surface.locator('[data-curriculum-explore-view="explore"]').first();
      await exploreButton.click();
      await surface.locator('[data-curriculum-focused-explorer]').first().waitFor({ state: 'visible', timeout: 4000 });
      check('teacher can return from Trama to focused exploration in place', page.url().includes('/curriculum'));
      check('no uncaught page errors in Explore/Trama journey', pageErrors.length === 0);

      await page.screenshot({ path: path.join(artifactDir, `${profile.id}-explore-trama.png`), fullPage: true });
      evidence.profiles.push(result);
      await context.close();
    }
  } catch (error) {
    failed = true;
    evidence.error = error instanceof Error ? error.message : String(error);
    console.error(error);
  } finally {
    fs.writeFileSync(path.join(artifactDir, 'browser-evidence.json'), `${JSON.stringify(evidence, null, 2)}\n`, 'utf8');
    await browser.close();
  }

  console.log('Explore/Trama browser evidence is automated evidence only; no human acceptance verdict was issued.');
  if (failed) process.exitCode = 1;
})();
