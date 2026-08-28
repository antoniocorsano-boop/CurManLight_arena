const { chromium } = require('playwright');
const fs = require('fs');

const baseUrl = (process.env.BETA_BASE_URL || 'https://antoniocorsano-boop.github.io/CurManLight_arena/').replace(/\/$/, '');
const expectedSha = process.env.EXPECTED_SHA || 'd5c1993d15bb124648c5557b9edc0ca4f7e1b4dd';
const outDir = 'artifacts/live-beta-mobile';
fs.mkdirSync(outDir, { recursive: true });

async function closeDialog(page) {
  await page.waitForTimeout(700);
  const dialog = page.locator('[role="dialog"][aria-modal="true"]');
  if (await dialog.isVisible({ timeout: 500 }).catch(() => false)) {
    const buttons = dialog.getByRole('button');
    if (await buttons.count()) await buttons.first().click().catch(() => undefined);
  }
}

async function clickNav(page, label) {
  const before = page.url();
  const item = page.getByText(label, { exact: true }).last();
  await item.waitFor({ state: 'visible', timeout: 8000 });
  await item.click();
  await page.waitForTimeout(450);
  return { before, after: page.url() };
}

(async () => {
  const checks = [];
  const failures = [];
  const check = (label, condition, detail = '') => {
    const ok = Boolean(condition);
    checks.push({ label, ok, detail });
    console.log(`${ok ? '✓' : '✗'} ${label}${detail ? ` — ${detail}` : ''}`);
    if (!ok) failures.push(label);
  };

  const release = await fetch(`${baseUrl}/beta-release.json`).then(r => {
    if (!r.ok) throw new Error(`beta-release.json HTTP ${r.status}`);
    return r.json();
  });
  check('Published release identity is the requested candidate', release.releaseSha === expectedSha, `published=${release.releaseSha}`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'it-IT' });
  const page = await context.newPage();
  const pageErrors = [];
  page.on('pageerror', e => pageErrors.push(e.message));

  async function routeHealth(label) {
    const dims = await page.evaluate(() => ({
      sw: document.documentElement.scrollWidth,
      cw: document.documentElement.clientWidth,
      sh: document.documentElement.scrollHeight,
      ch: document.documentElement.clientHeight,
    }));
    check(`${label}: no horizontal page overflow`, dims.sw <= dims.cw + 2, `${dims.sw}/${dims.cw}`);
    return dims;
  }

  try {
    const response = await page.goto(`${baseUrl}/`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    check('Home loads from the public Beta', response && response.ok(), `HTTP ${response?.status()}`);
    await closeDialog(page);
    await page.getByText('CurManLight', { exact: true }).first().waitFor({ state: 'visible', timeout: 8000 });
    check('Stable CurManLight vector brand is visible', await page.locator('[data-brand-mark="curmanlight"]').isVisible().catch(() => false));
    const homeDims = await routeHealth('Home');
    check('Home is bounded on mobile', homeDims.sh <= homeDims.ch * 2.6, `height ratio ${(homeDims.sh / homeDims.ch).toFixed(2)}x`);
    await page.screenshot({ path: `${outDir}/01-home.png`, fullPage: true });

    const curriculumNav = await clickNav(page, 'Curricolo');
    await closeDialog(page);
    check('Curricolo navigation changes view', curriculumNav.after !== curriculumNav.before, curriculumNav.after);
    check('Curricolo renders substantive content', (await page.locator('main').innerText()).trim().length > 120);
    await routeHealth('Curricolo');
    await page.screenshot({ path: `${outDir}/02-curricolo.png`, fullPage: true });

    const revisionNav = await clickNav(page, 'Revisione');
    check('Revisione navigation changes view', revisionNav.after !== revisionNav.before, revisionNav.after);
    await page.getByText('Revisione del Curricolo: Gap 2025', { exact: false }).waitFor({ state: 'visible', timeout: 8000 });
    await routeHealth('Revisione');
    const proposed = page.locator('[data-revision-current-card] article').nth(1);
    const actions = page.locator('[data-revision-sticky-actions]');
    await proposed.scrollIntoViewIfNeeded();
    await page.waitForTimeout(250);
    const [p, a] = await Promise.all([proposed.boundingBox(), actions.boundingBox()]);
    const overlaps = Boolean(p && a && p.x < a.x + a.width && p.x + p.width > a.x && p.y < a.y + a.height && p.y + p.height > a.y);
    check('Revision actions do not cover proposed text', !overlaps, p && a ? `proposed y=${p.y.toFixed(0)}..${(p.y+p.height).toFixed(0)}, actions y=${a.y.toFixed(0)}..${(a.y+a.height).toFixed(0)}` : 'bounding box unavailable');
    check('Revision primary choices remain visible', await page.getByRole('button', { name: 'Usa testo 2025' }).isVisible());
    check('Revision next-step control remains reachable', await page.getByRole('button', { name: 'Successivo' }).isVisible());
    await page.screenshot({ path: `${outDir}/03-revisione.png`, fullPage: true });

    const sourcesNav = await clickNav(page, 'Fonti');
    check('Fonti navigation changes view', sourcesNav.after !== sourcesNav.before, sourcesNav.after);
    check('Fonti renders substantive content', (await page.locator('main').innerText()).trim().length > 80);
    await routeHealth('Fonti');
    await page.screenshot({ path: `${outDir}/04-fonti.png`, fullPage: true });

    const docsNav = await clickNav(page, 'Documenti');
    check('Documenti navigation changes view', docsNav.after !== docsNav.before, docsNav.after);
    check('Documenti renders substantive content', (await page.locator('main').innerText()).trim().length > 80);
    await routeHealth('Documenti');
    await page.screenshot({ path: `${outDir}/05-documenti.png`, fullPage: true });

    check('No uncaught page errors during live navigation', pageErrors.length === 0, pageErrors.join(' | '));
  } catch (error) {
    console.error(error);
    failures.push(`runtime: ${error.message}`);
    await page.screenshot({ path: `${outDir}/failure.png`, fullPage: true }).catch(() => undefined);
  } finally {
    await browser.close();
  }

  console.log(`=== LIVE MOBILE RESULT: ${checks.filter(c => c.ok).length}/${checks.length} checks passed ===`);
  if (failures.length) {
    console.error('FAILED:', failures.join('; '));
    process.exit(1);
  }
})();
