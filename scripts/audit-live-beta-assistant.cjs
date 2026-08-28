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

  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (error) => consoleErrors.push(error.message));

  const check = (name, pass, detail = '') => {
    checks.push({ name, pass: Boolean(pass), detail });
    console.log(`${pass ? 'PASS' : 'FAIL'} — ${name}${detail ? ` — ${detail}` : ''}`);
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
      await page.waitForTimeout(500);
    }

    const assistantPanel = page.locator('[aria-label="Area contenuto assistente"]');
    const panelVisible = await assistantPanel.isVisible({ timeout: 5000 }).catch(() => false);
    check('Pannello Assistente si apre', panelVisible);
    await screenshot('02-assistant-open.png');

    let assistantState = 'UNAVAILABLE';
    let assistantText = '';
    if (panelVisible) {
      assistantText = await assistantPanel.innerText();
      if (assistantText.includes('Ollama locale') && assistantText.includes('Endpoint')) {
        assistantState = 'LOCAL_AI_CONFIGURATION_REQUIRED';
      } else if (assistantText.includes('Controlla prima dell\'invio')) {
        assistantState = 'LOCAL_AI_READY';
      } else {
        assistantState = 'UNKNOWN';
      }
    }

    const knowledgeActionVisible = await page.getByText('Apri conoscenza', { exact: true }).isVisible({ timeout: 500 }).catch(() => false);
    const graphActionVisible = await page.getByText('Mostra connessioni', { exact: true }).isVisible({ timeout: 500 }).catch(() => false);

    console.log(`ASSISTANT_STATE=${assistantState}`);
    console.log(`KNOWLEDGE_ACTION_VISIBLE=${knowledgeActionVisible}`);
    console.log(`GRAPH_ACTION_VISIBLE=${graphActionVisible}`);

    if (assistantState === 'LOCAL_AI_CONFIGURATION_REQUIRED' && !knowledgeActionVisible && !graphActionVisible) {
      console.log('PRODUCT_FINDING=Le azioni Conoscenza/Connessioni sono nascoste dietro la configurazione e una risposta AI riuscita.');
    }

    if (await assistantEntry.isVisible().catch(() => false)) {
      await assistantEntry.click();
      await page.waitForTimeout(300);
    }

    await pushAssistantView('source');
    await screenshot('03-knowledge-source.png');
    const sourceText = await page.locator('body').innerText();
    const sourceReached = /Biblioteca|Conoscenza|Glossario/i.test(sourceText);
    check('Deep-link Assistente → Conoscenza raggiunge la vista esistente', sourceReached);
    check('Nessun overflow orizzontale in Conoscenza', await hasNoHorizontalOverflow());

    await pushAssistantView('graph');
    await screenshot('04-knowledge-graph.png');
    const graphText = await page.locator('body').innerText();
    const graphReached = /Mappa Connessioni/i.test(graphText);
    check('Deep-link Assistente → Mappa Connessioni raggiunge il grafo', graphReached);
    check('Nessun overflow orizzontale nel grafo', await hasNoHorizontalOverflow());

    const report = {
      betaUrl: BETA_URL,
      releaseIdentity,
      assistantState,
      knowledgeActionVisible,
      graphActionVisible,
      checks,
      consoleErrors,
      productFinding: assistantState === 'LOCAL_AI_CONFIGURATION_REQUIRED' && !knowledgeActionVisible && !graphActionVisible
        ? 'ASSISTANT_KNOWLEDGE_ACTIONS_BLOCKED_BY_LOCAL_AI_CONFIGURATION'
        : null,
    };

    fs.writeFileSync(path.join(OUT_DIR, 'report.json'), JSON.stringify(report, null, 2));

    check('Nessun errore JavaScript non gestito', consoleErrors.length === 0, consoleErrors.join(' | '));

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
