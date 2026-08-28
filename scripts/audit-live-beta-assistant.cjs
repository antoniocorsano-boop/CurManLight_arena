const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BETA_URL = process.env.BETA_URL || 'https://antoniocorsano-boop.github.io/CurManLight_arena/';
const OUT_DIR = process.env.AUDIT_OUT_DIR || 'artifacts/live-beta-assistant';

fs.mkdirSync(OUT_DIR, { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
    locale: 'it-IT',
  });
  const page = await context.newPage();
  const consoleErrors = [];
  const checks = [];
  const findings = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (error) => consoleErrors.push(error.message));

  const check = (name, pass, detail = '') => {
    checks.push({ name, pass: Boolean(pass), detail });
    console.log(`${pass ? 'PASS' : 'FAIL'} — ${name}${detail ? ` — ${detail}` : ''}`);
  };

  const finding = (code, detail) => {
    findings.push({ code, detail });
    console.log(`PRODUCT_FINDING=${code} — ${detail}`);
  };

  const screenshot = async (name) => {
    await page.screenshot({ path: path.join(OUT_DIR, name), fullPage: true });
  };

  const hasNoHorizontalOverflow = async () => page.evaluate(() =>
    document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1
  );

  const pushAssistantView = async (view) => {
    const target = new URL(`knowledge?assistantView=${view}`, BETA_URL).toString();
    await page.evaluate((url) => {
      window.history.pushState({ assistantKnowledgeView: new URL(url).searchParams.get('assistantView') }, '', url);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }, target);
    await page.waitForTimeout(700);
  };

  const closeOnboardingIfPresent = async () => {
    const dialogs = page.locator('[role="dialog"][aria-modal="true"]');
    const count = await dialogs.count();
    for (let i = 0; i < count; i++) {
      const dialog = dialogs.nth(i);
      const visible = await dialog.isVisible().catch(() => false);
      if (!visible) continue;
      const text = await dialog.innerText().catch(() => '');
      if (!/Profilo personale locale/i.test(text)) continue;
      finding('ONBOARDING_MODAL_OVERLAPS_ASSISTANT', 'Il wizard Profilo personale locale compare insieme all’Assistente.');
      await screenshot('02a-onboarding-over-assistant.png');
      return true;
    }
    return false;
  };

  try {
    const response = await page.goto(BETA_URL, { waitUntil: 'networkidle', timeout: 45000 });
    check('Beta pubblica raggiungibile', Boolean(response && response.ok()), response ? `HTTP ${response.status()}` : 'nessuna risposta');
    await screenshot('01-beta-mobile.png');
    check('Nessun overflow orizzontale iniziale', await hasNoHorizontalOverflow());

    const releaseResponse = await context.request.get(new URL('beta-release.json', BETA_URL).toString());
    let releaseIdentity = null;
    if (releaseResponse.ok()) {
      try { releaseIdentity = await releaseResponse.json(); } catch (_) {}
    }
    check('Identità release disponibile', releaseResponse.ok(), releaseIdentity ? JSON.stringify(releaseIdentity) : `HTTP ${releaseResponse.status()}`);

    const assistantEntry = page.locator('[data-assistant-entry="bounded"]');
    check('Icona Assistente presente nell’header', await assistantEntry.isVisible({ timeout: 5000 }).catch(() => false));

    if (await assistantEntry.isVisible().catch(() => false)) {
      await assistantEntry.click();
      await page.waitForTimeout(600);
    }

    await closeOnboardingIfPresent();

    const assistantPanel = page.locator('[aria-label="Area contenuto assistente"]');
    const panelVisible = await assistantPanel.isVisible({ timeout: 5000 }).catch(() => false);
    check('Pannello Assistente si apre', panelVisible);
    await screenshot('02-assistant-open.png');

    const knowledgeActionVisible = await page.getByText('Apri conoscenza', { exact: true }).isVisible({ timeout: 500 }).catch(() => false);
    const graphActionVisible = await page.getByText('Mostra connessioni', { exact: true }).isVisible({ timeout: 500 }).catch(() => false);
    console.log(`KNOWLEDGE_ACTION_VISIBLE=${knowledgeActionVisible}`);
    console.log(`GRAPH_ACTION_VISIBLE=${graphActionVisible}`);

    if (!knowledgeActionVisible || !graphActionVisible) {
      finding('ASSISTANT_KNOWLEDGE_ACTIONS_NOT_DISCOVERABLE', 'Le azioni di conoscenza devono essere disponibili appena l’Assistente si apre.');
    }

    if (knowledgeActionVisible) {
      await page.getByText('Apri conoscenza', { exact: true }).click({ force: true });
      await page.waitForTimeout(700);
      await screenshot('03-knowledge-source.png');
      const sourceText = await page.locator('body').innerText();
      check('Assistente → Conoscenza raggiunge la vista esistente', /Biblioteca|Conoscenza|Glossario/i.test(sourceText));
      check('Nessun overflow orizzontale in Conoscenza', await hasNoHorizontalOverflow());
    } else {
      await pushAssistantView('source');
    }

    await page.goto(BETA_URL, { waitUntil: 'networkidle', timeout: 45000 });
    const entryAgain = page.locator('[data-assistant-entry="bounded"]');
    if (await entryAgain.isVisible({ timeout: 5000 }).catch(() => false)) {
      await entryAgain.click();
      await page.waitForTimeout(500);
    }
    const graphActionAgain = page.getByText('Mostra connessioni', { exact: true });
    if (await graphActionAgain.isVisible({ timeout: 500 }).catch(() => false)) {
      await graphActionAgain.click({ force: true });
      await page.waitForTimeout(700);
    } else {
      await pushAssistantView('graph');
    }
    await screenshot('04-knowledge-graph.png');
    const graphText = await page.locator('body').innerText();
    check('Assistente → Mappa Connessioni raggiunge il grafo', /Mappa Connessioni/i.test(graphText));
    check('Nessun overflow orizzontale nel grafo', await hasNoHorizontalOverflow());

    check('Nessun errore JavaScript non gestito', consoleErrors.length === 0, consoleErrors.join(' | '));

    fs.writeFileSync(path.join(OUT_DIR, 'report.json'), JSON.stringify({
      betaUrl: BETA_URL,
      releaseIdentity,
      knowledgeActionVisible,
      graphActionVisible,
      checks,
      findings,
      consoleErrors,
    }, null, 2));

    const hardFailures = checks.filter((item) => !item.pass && !item.name.startsWith('Identità release'));
    process.exitCode = hardFailures.length === 0 && consoleErrors.length === 0 ? 0 : 1;
  } catch (error) {
    console.error(error);
    fs.writeFileSync(path.join(OUT_DIR, 'fatal-error.txt'), String(error && error.stack ? error.stack : error));
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();
