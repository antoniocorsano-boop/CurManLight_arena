const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const BETA_URL = (process.env.BETA_URL || 'https://antoniocorsano-boop.github.io/CurManLight_arena/').replace(/\/$/, '');
const EXPECTED_RELEASE_SHA = (process.env.EXPECTED_RELEASE_SHA || '').trim();
const OUT_DIR = process.env.AUDIT_OUT_DIR || 'artifacts/live-beta-support';

fs.mkdirSync(OUT_DIR, { recursive: true });

const isVisibleElement = (element) => {
  const style = window.getComputedStyle(element);
  const rect = element.getBoundingClientRect();
  return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) !== 0 && rect.width > 0 && rect.height > 0;
};

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, locale: 'it-IT' });
  const page = await context.newPage();
  const checks = [];
  const findings = [];
  const pageErrors = [];

  page.on('pageerror', (error) => pageErrors.push(error.message));

  const check = (name, pass, detail = '') => {
    const item = { name, pass: Boolean(pass), detail };
    checks.push(item);
    console.log(`${item.pass ? 'PASS' : 'FAIL'} — ${name}${detail ? ` — ${detail}` : ''}`);
    return item.pass;
  };

  const finding = (code, detail) => {
    findings.push({ code, detail });
    console.log(`PRODUCT_FINDING=${code} — ${detail}`);
  };

  const closeLocalProfileIfPresent = async () => {
    await page.waitForTimeout(700);
    const dialogs = page.locator('[role="dialog"][aria-modal="true"]');
    const count = await dialogs.count();
    for (let index = 0; index < count; index += 1) {
      const dialog = dialogs.nth(index);
      if (!(await dialog.isVisible().catch(() => false))) continue;
      const text = await dialog.innerText().catch(() => '');
      if (!/Profilo personale locale/i.test(text)) continue;
      const closeButton = dialog.locator('button').first();
      if (await closeButton.isVisible().catch(() => false)) {
        await closeButton.click();
        await dialog.waitFor({ state: 'hidden', timeout: 3000 }).catch(() => undefined);
      }
    }
  };

  try {
    const response = await page.goto(`${BETA_URL}/`, { waitUntil: 'domcontentloaded', timeout: 45000 });
    check('Beta pubblica raggiungibile', Boolean(response && response.ok()), response ? `HTTP ${response.status()}` : 'nessuna risposta');
    await closeLocalProfileIfPresent();

    const releaseResponse = await context.request.get(`${BETA_URL}/beta-release.json`);
    const releaseIdentity = releaseResponse.ok() ? await releaseResponse.json().catch(() => null) : null;
    check('Identità release disponibile', Boolean(releaseIdentity && releaseIdentity.releaseSha), releaseIdentity ? JSON.stringify(releaseIdentity) : `HTTP ${releaseResponse.status()}`);
    if (EXPECTED_RELEASE_SHA) {
      check('Release pubblicata coincide con lo SHA distribuito', releaseIdentity?.releaseSha === EXPECTED_RELEASE_SHA, `atteso=${EXPECTED_RELEASE_SHA} pubblicato=${releaseIdentity?.releaseSha || 'assente'}`);
    }

    const navTrigger = page.locator('[data-mobile-navigation-trigger="brand"]');
    check('Comando navigazione mobile disponibile', await navTrigger.isVisible({ timeout: 3000 }).catch(() => false));
    await navTrigger.click();
    await page.waitForTimeout(250);

    const sidebar = page.locator('#sidebar');
    check('Menu secondario mobile si apre', await sidebar.isVisible({ timeout: 2000 }).catch(() => false));

    const guideEntry = sidebar.getByRole('button', { name: 'Guida', exact: true });
    const controlsEntry = sidebar.getByRole('button', { name: 'Controlli e checklist', exact: true });
    check('Guida è raggiungibile dal menu mobile', await guideEntry.isVisible({ timeout: 1500 }).catch(() => false));
    check('Controlli e checklist sono raggiungibili dal menu mobile', await controlsEntry.isVisible({ timeout: 1500 }).catch(() => false));

    await guideEntry.click();
    await page.waitForURL(/\/guida(?:\/|$|\?)/, { timeout: 5000 });
    const guideHeading = page.getByRole('heading', { name: /Guida Utente e Manuale d'Uso della Piattaforma/i }).first();
    check('Azione Guida apre la vista reale', await guideHeading.isVisible({ timeout: 3000 }).catch(() => false), page.url());

    const overflowMetrics = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      scrollHeight: document.documentElement.scrollHeight,
      viewportHeight: window.innerHeight,
    }));
    check('Guida non produce overflow orizzontale', overflowMetrics.scrollWidth <= overflowMetrics.clientWidth + 4, JSON.stringify(overflowMetrics));

    const typography = await page.evaluate(() => {
      const root = document.querySelector('#main-content') || document.body;
      const values = Array.from(root.querySelectorAll('p, li, button, summary, span'))
        .filter((element) => {
          const style = window.getComputedStyle(element);
          const rect = element.getBoundingClientRect();
          return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) !== 0 && rect.width > 0 && rect.height > 0 && (element.textContent || '').trim().length > 0;
        })
        .map((element) => Number.parseFloat(window.getComputedStyle(element).fontSize))
        .filter(Number.isFinite);
      return {
        minPx: values.length ? Math.min(...values) : null,
        below12Count: values.filter((value) => value < 12).length,
        measuredCount: values.length,
      };
    });

    const screenCount = overflowMetrics.viewportHeight > 0 ? overflowMetrics.scrollHeight / overflowMetrics.viewportHeight : null;
    console.log(`GUIDE_TYPOGRAPHY=${JSON.stringify(typography)}`);
    console.log(`GUIDE_VERTICAL_SCREENS=${screenCount === null ? 'n/a' : screenCount.toFixed(2)}`);
    if (typography.minPx !== null && typography.minPx < 12) {
      finding('GUIDE_TEXT_BELOW_12PX', `Minimo osservato ${typography.minPx}px; elementi sotto 12px: ${typography.below12Count}/${typography.measuredCount}.`);
    }
    if (screenCount !== null && screenCount > 8) {
      finding('GUIDE_LONG_MOBILE_SCROLL', `La Guida occupa circa ${screenCount.toFixed(1)} schermate verticali a 390x844.`);
    }

    await page.screenshot({ path: path.join(OUT_DIR, 'guide-mobile.png'), fullPage: true });

    await navTrigger.click();
    await page.waitForTimeout(250);
    check('Menu mobile si riapre dalla Guida', await sidebar.isVisible({ timeout: 1500 }).catch(() => false));
    const controlsAgain = sidebar.getByRole('button', { name: 'Controlli e checklist', exact: true });
    await controlsAgain.click();
    await page.waitForTimeout(400);
    check('Azione Controlli produce una navigazione osservabile', page.url().includes('/documents'));

    check('Nessun errore pagina non gestito', pageErrors.length === 0, pageErrors.join(' | '));

    const report = {
      schema: 'CML_ARENA_S3C_LIVE_SUPPORT_EVIDENCE_V1',
      betaUrl: BETA_URL,
      expectedReleaseSha: EXPECTED_RELEASE_SHA || null,
      releaseIdentity,
      generatedAt: new Date().toISOString(),
      humanVerdictIssued: false,
      checks,
      findings,
      metrics: { overflowMetrics, typography, verticalScreens: screenCount },
      pageErrors,
    };
    fs.writeFileSync(path.join(OUT_DIR, 'report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');

    const hardFailures = checks.filter((item) => !item.pass);
    process.exitCode = hardFailures.length === 0 ? 0 : 1;
  } catch (error) {
    console.error(error);
    fs.writeFileSync(path.join(OUT_DIR, 'fatal-error.txt'), String(error && error.stack ? error.stack : error));
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();
