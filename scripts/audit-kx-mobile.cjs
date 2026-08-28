const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.KX_URL || 'http://127.0.0.1:4173/';
const OUT_DIR = process.env.AUDIT_OUT_DIR || 'artifacts/kx-mobile';
fs.mkdirSync(OUT_DIR, { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, locale: 'it-IT' });
  const page = await context.newPage();
  const checks = [];
  const consoleErrors = [];
  const check = (name, pass, detail = '') => {
    checks.push({ name, pass: Boolean(pass), detail });
    console.log(`${pass ? 'PASS' : 'FAIL'} — ${name}${detail ? ` — ${detail}` : ''}`);
  };
  const taskButton = (label) => page.getByRole('button', { name: label, exact: true });
  const screenshot = async (name) => page.screenshot({ path: path.join(OUT_DIR, name), fullPage: true });
  const noHorizontalOverflow = async () => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1);
  const visibleNestedScrollers = async () => page.evaluate(() => {
    const viewportHeight = window.innerHeight;
    return Array.from(document.querySelectorAll('[data-kx-shell="plain-language-v1"] *')).filter((el) => {
      const style = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0 || rect.bottom < 0 || rect.top > viewportHeight * 3) return false;
      return ['auto', 'scroll'].includes(style.overflowY) && el.scrollHeight > el.clientHeight + 8;
    }).map((el) => ({ tag: el.tagName, className: typeof el.className === 'string' ? el.className.slice(0, 180) : '', clientHeight: el.clientHeight, scrollHeight: el.scrollHeight }));
  });

  try {
    page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
    page.on('pageerror', (error) => consoleErrors.push(error.message));
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 45000 });
    await page.evaluate(() => { window.history.pushState({}, '', 'knowledge'); window.dispatchEvent(new PopStateEvent('popstate')); });
    await page.waitForTimeout(800);

    const shell = page.locator('[data-kx-shell="plain-language-v1"]');
    check('Shell KX visibile', await shell.isVisible({ timeout: 5000 }).catch(() => false));
    check('Nessun overflow orizzontale iniziale', await noHorizontalOverflow());
    for (const label of ['Cerca e chiedi', 'Relazioni', 'Termini chiave', 'Archivio storico']) check(`Task visibile: ${label}`, await taskButton(label).isVisible().catch(() => false));
    await screenshot('01-kx-shell.png');

    await taskButton('Relazioni').click(); await page.waitForTimeout(250);
    check('Relazioni fail-closed', await page.getByText('Relazioni in preparazione', { exact: true }).isVisible().catch(() => false));
    const relationText = await shell.innerText();
    const forbidden = ['Graphify', 'Moduli del codice sorgente', '.tsx / .ts', 'WikiLLM', 'Zustand'];
    check('Nessun leakage tecnico in Relazioni', forbidden.every((term) => !relationText.includes(term)), forbidden.filter((term) => relationText.includes(term)).join(', '));
    check('Relazioni attiva', await taskButton('Relazioni').getAttribute('aria-current') === 'page');
    check('Nessun overflow orizzontale in Relazioni', await noHorizontalOverflow());
    await screenshot('02-relazioni.png');

    await taskButton('Cerca e chiedi').click(); await page.waitForTimeout(250);
    check('Cerca e chiedi attivo', await taskButton('Cerca e chiedi').getAttribute('aria-current') === 'page');
    check('Azione Cerca nelle fonti dominante', await page.getByRole('button', { name: 'Cerca nelle fonti', exact: true }).isVisible().catch(() => false));
    check('Input domanda visibile', await page.getByLabel('Che cosa vuoi capire?').isVisible().catch(() => false));
    check('WikiLLM non visibile nel task Cerca', !(await page.getByText(/WikiLLM/i).isVisible().catch(() => false)));
    check('Nessun overflow orizzontale in Cerca', await noHorizontalOverflow());
    const searchScrollers = await visibleNestedScrollers();
    check('Nessuno scroll annidato nel task Cerca', searchScrollers.length === 0, JSON.stringify(searchScrollers));
    await screenshot('03-cerca.png');

    await taskButton('Archivio storico').click(); await page.waitForTimeout(250);
    check('Archivio storico attivo', await taskButton('Archivio storico').getAttribute('aria-current') === 'page');
    check('Nessun overflow orizzontale in Archivio', await noHorizontalOverflow());
    const archiveScrollers = await visibleNestedScrollers();
    check('Nessuno scroll annidato nel task Archivio', archiveScrollers.length === 0, JSON.stringify(archiveScrollers));
    await screenshot('04-archivio.png');

    await taskButton('Termini chiave').click(); await page.waitForTimeout(250);
    check('Termini chiave attivo', await taskButton('Termini chiave').getAttribute('aria-current') === 'page');
    const glossaryText = await shell.innerText();
    check('Nessun mojibake nel glossario visibile', !glossaryText.includes('�'));
    check('Nessun overflow orizzontale in Termini chiave', await noHorizontalOverflow());
    const glossaryScrollers = await visibleNestedScrollers();
    check('Nessuno scroll annidato in Termini chiave', glossaryScrollers.length === 0, JSON.stringify(glossaryScrollers));
    await screenshot('05-termini.png');

    check('Nessun errore JavaScript non gestito', consoleErrors.length === 0, consoleErrors.join(' | '));
    fs.writeFileSync(path.join(OUT_DIR, 'report.json'), JSON.stringify({ baseUrl: BASE_URL, checks, consoleErrors }, null, 2));
    process.exitCode = checks.every((item) => item.pass) && consoleErrors.length === 0 ? 0 : 1;
  } catch (error) {
    console.error(error);
    fs.writeFileSync(path.join(OUT_DIR, 'fatal-error.txt'), String(error && error.stack ? error.stack : error));
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();
