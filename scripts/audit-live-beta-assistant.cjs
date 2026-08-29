const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BETA_URL = process.env.BETA_URL || 'https://antoniocorsano-boop.github.io/CurManLight_arena/';
const OUT_DIR = process.env.AUDIT_OUT_DIR || 'artifacts/live-beta-assistant';

fs.mkdirSync(OUT_DIR, { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, locale: 'it-IT' });
  const page = await context.newPage();
  const consoleErrors = [];
  const checks = [];
  const findings = [];

  page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  page.on('pageerror', (error) => consoleErrors.push(error.message));

  const check = (name, pass, detail = '') => {
    checks.push({ name, pass: Boolean(pass), detail });
    console.log(`${pass ? 'PASS' : 'FAIL'} — ${name}${detail ? ` — ${detail}` : ''}`);
  };

  const finding = (code, detail) => {
    findings.push({ code, detail });
    console.log(`PRODUCT_FINDING=${code} — ${detail}`);
  };

  const screenshot = async (name) => page.screenshot({ path: path.join(OUT_DIR, name), fullPage: true });
  const hasNoHorizontalOverflow = async () => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1);

  const pushAssistantView = async (view) => {
    const target = new URL(`knowledge?assistantView=${view}`, BETA_URL).toString();
    await page.evaluate((url) => {
      window.history.pushState({ assistantKnowledgeView: new URL(url).searchParams.get('assistantView') }, '', url);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }, target);
    await page.waitForTimeout(700);
  };

  const onboardingVisible = async () => {
    const dialogs = page.locator('[role="dialog"][aria-modal="true"]');
    const count = await dialogs.count();
    for (let i = 0; i < count; i++) {
      const dialog = dialogs.nth(i);
      if (!await dialog.isVisible().catch(() => false)) continue;
      const text = await dialog.innerText().catch(() => '');
      if (/Profilo personale locale/i.test(text)) return true;
    }
    return false;
  };

  const openAssistantFromSettings = async () => {
    const settingsEntry = page.locator('[data-settings-entry="canonical"]');
    const settingsVisible = await settingsEntry.isVisible({ timeout: 2000 }).catch(() => false);
    check('Impostazioni canoniche disponibili nell’header', settingsVisible);
    if (!settingsVisible) return false;

    try {
      await settingsEntry.click({ timeout: 1200 });
    } catch (error) {
      if (await onboardingVisible()) {
        finding('ONBOARDING_MODAL_BLOCKS_ASSISTANT_ENTRY', 'Il wizard Profilo personale locale blocca l’accesso a Impostazioni → Assistente Arena.');
        check('Onboarding non blocca l’apertura dell’Assistente', false, 'Il modal onboarding intercetta l’azione Impostazioni.');
        await screenshot('02a-onboarding-blocks-settings.png');
        return false;
      }
      throw error;
    }

    const assistantEntry = page.locator('[data-assistant-entry="bounded"]');
    const assistantVisible = await assistantEntry.isVisible({ timeout: 1500 }).catch(() => false);
    check('Assistente disponibile nel menu Impostazioni', assistantVisible);
    if (!assistantVisible) return false;

    try {
      await assistantEntry.click({ timeout: 1200 });
    } catch (error) {
      if (await onboardingVisible()) {
        finding('ONBOARDING_MODAL_BLOCKS_ASSISTANT_ENTRY', 'Il wizard Profilo personale locale blocca l’apertura dell’Assistente dal menu Impostazioni.');
        check('Onboarding non blocca l’apertura dell’Assistente', false, 'Il modal onboarding intercetta l’azione Assistente Arena.');
        await screenshot('02b-onboarding-blocks-assistant.png');
        return false;
      }
      throw error;
    }

    await page.waitForTimeout(500);
    return true;
  };

  const navigateAndOpenAssistant = async () => {
    const response = await page.goto(BETA_URL, { waitUntil: 'domcontentloaded', timeout: 45000 });
    check('Beta pubblica raggiungibile', Boolean(response && response.ok()), response ? `HTTP ${response.status()}` : 'nessuna risposta');
    const assistantOpened = await openAssistantFromSettings();
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => undefined);
    return assistantOpened;
  };

  try {
    const assistantOpened = await navigateAndOpenAssistant();

    await screenshot('01-beta-mobile.png');
    check('Nessun overflow orizzontale iniziale', await hasNoHorizontalOverflow());

    const releaseResponse = await context.request.get(new URL('beta-release.json', BETA_URL).toString());
    let releaseIdentity = null;
    if (releaseResponse.ok()) {
      try { releaseIdentity = await releaseResponse.json(); } catch (_) {}
    }
    check('Identità release disponibile', releaseResponse.ok(), releaseIdentity ? JSON.stringify(releaseIdentity) : `HTTP ${releaseResponse.status()}`);

    const onboardingStillVisible = await onboardingVisible();
    if (onboardingStillVisible && assistantOpened) {
      finding('ONBOARDING_MODAL_OVERLAPS_ASSISTANT', 'Il wizard Profilo personale locale resta visibile insieme all’Assistente.');
      await screenshot('02c-onboarding-over-assistant.png');
    }
    check('Onboarding e Assistente non si sovrappongono', !(onboardingStillVisible && assistantOpened));

    const assistantPanel = page.locator('[aria-label="Area contenuto assistente"]');
    const panelVisible = assistantOpened && await assistantPanel.isVisible({ timeout: 3000 }).catch(() => false);
    check('Pannello Assistente si apre', panelVisible);
    await screenshot('02-assistant-open.png');

    const knowledgeActionVisible = await page.getByText('Apri conoscenza', { exact: true }).isVisible({ timeout: 1000 }).catch(() => false);
    const graphActionVisible = await page.getByText('Mostra connessioni', { exact: true }).isVisible({ timeout: 1000 }).catch(() => false);
    console.log(`KNOWLEDGE_ACTION_VISIBLE=${knowledgeActionVisible}`);
    console.log(`GRAPH_ACTION_VISIBLE=${graphActionVisible}`);

    if (!knowledgeActionVisible || !graphActionVisible) {
      finding('ASSISTANT_KNOWLEDGE_ACTIONS_NOT_DISCOVERABLE', 'Le azioni di conoscenza devono essere disponibili appena l’Assistente si apre.');
    }
    check('Azioni Conoscenza e Connessioni subito disponibili', knowledgeActionVisible && graphActionVisible);

    if (knowledgeActionVisible) {
      await page.getByText('Apri conoscenza', { exact: true }).click({ force: true });
      await page.waitForTimeout(700);
      await screenshot('03-knowledge-source.png');
      const sourceText = await page.locator('body').innerText();
      check('Assistente → Conoscenza raggiunge la vista esistente', /Conoscenza e fonti|Cerca e chiedi|Termini chiave|Archivio storico/i.test(sourceText));
      check('Nessun overflow orizzontale in Conoscenza', await hasNoHorizontalOverflow());
    } else {
      await pushAssistantView('source');
    }

    const assistantOpenedAgain = await navigateAndOpenAssistant();
    check('Assistente si riapre dopo re-entry', assistantOpenedAgain);

    const graphActionAgain = page.getByText('Mostra connessioni', { exact: true });
    if (await graphActionAgain.isVisible({ timeout: 1000 }).catch(() => false)) {
      await graphActionAgain.click({ force: true });
      await page.waitForTimeout(700);
    } else {
      await pushAssistantView('graph');
    }

    await screenshot('04-knowledge-relations.png');
    const relationsText = await page.locator('body').innerText();
    const relationsVisible = /Relazioni in preparazione/i.test(relationsText);
    const failClosedVisible = /La vecchia mappa tecnica non viene mostrata/i.test(relationsText);
    const technicalLeakage = /Graphify|Mappa Connessioni|WikiLLM|SecondBrainTab|\.tsx\b|\.ts\b/i.test(relationsText);

    check('Assistente → Relazioni raggiunge la vista KX', relationsVisible);
    check('Relazioni resta fail-closed senza grafo tecnico', relationsVisible && failClosedVisible);
    check('Nessun leakage tecnico nella vista Relazioni', !technicalLeakage, technicalLeakage ? 'Rilevato lessico tecnico legacy' : '');
    check('Nessun overflow orizzontale in Relazioni', await hasNoHorizontalOverflow());
    check('Nessun errore JavaScript non gestito', consoleErrors.length === 0, consoleErrors.join(' | '));

    fs.writeFileSync(path.join(OUT_DIR, 'report.json'), JSON.stringify({
      betaUrl: BETA_URL,
      releaseIdentity,
      knowledgeActionVisible,
      graphActionVisible,
      onboardingStillVisible,
      relationsVisible,
      failClosedVisible,
      technicalLeakage,
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
