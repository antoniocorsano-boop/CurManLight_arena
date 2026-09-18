const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const BETA_URL = (process.env.BETA_URL || 'https://antoniocorsano-boop.github.io/CurManLight_arena/').replace(/\/$/, '');
const EXPECTED_RELEASE_SHA = (process.env.EXPECTED_RELEASE_SHA || '').trim();
const OUT_DIR = process.env.AUDIT_OUT_DIR || 'artifacts/live-beta-support';

fs.mkdirSync(OUT_DIR, { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, locale: 'it-IT' });
  const page = await context.newPage();
  const checks = [];
  const findings = [];
  const pageErrors = [];

  page.on('pageerror', (error) => pageErrors.push(error.message));

  const check = (name, pass, detail = '', severity = 'hard') => {
    const item = { name, pass: Boolean(pass), detail, severity };
    checks.push(item);
    console.log(`${item.pass ? 'PASS' : 'FAIL'} — ${name}${detail ? ` — ${detail}` : ''}${severity === 'soft' ? ' — SOFT' : ''}`);
    return item.pass;
  };

  const finding = (code, detail) => {
    findings.push({ code, detail });
    console.log(`PRODUCT_FINDING=${code} — ${detail}`);
  };

  const completePersonalProfileIfRequired = async () => {
    const dialog = page.locator('[data-onboarding-contract="personal-work-profile-v1"]');
    if (!await dialog.isVisible().catch(() => false)) return false;

    await dialog.locator('[data-personal-role="insegnante"]').click();
    await dialog.getByRole('button', { name: 'Disciplinare', exact: true }).click();
    await dialog.getByRole('button', { name: 'Prossimo', exact: true }).click();
    await dialog.getByRole('button', { name: 'secondaria', exact: true }).click();
    await dialog.getByRole('button', { name: 'Prossimo', exact: true }).click();

    const discipline = dialog.locator('#personal-work-discipline');
    await discipline.selectOption({ label: 'Tecnologia' }).catch(async () => {
      const options = await discipline.locator('option').allTextContents();
      const technologyIndex = options.findIndex((label) => /tecnologia/i.test(label));
      if (technologyIndex < 0) throw new Error(`Disciplina Tecnologia non disponibile: ${options.join(', ')}`);
      await discipline.selectOption({ index: technologyIndex });
    });
    await dialog.getByRole('button', { name: 'Prossimo', exact: true }).click();

    const firstCombination = dialog.locator('button').filter({ hasText: /^1\^A$/ }).first();
    if (await firstCombination.isVisible().catch(() => false)) await firstCombination.click();

    await dialog.locator('[data-save-personal-profile="explicit"]').click();
    await dialog.waitFor({ state: 'detached', timeout: 5000 }).catch(async () => dialog.waitFor({ state: 'hidden', timeout: 5000 }));
    return !await dialog.isVisible().catch(() => false);
  };

  try {
    const response = await page.goto(`${BETA_URL}/`, { waitUntil: 'domcontentloaded', timeout: 45000 });
    check('Beta pubblica raggiungibile', Boolean(response && response.ok()), response ? `HTTP ${response.status()}` : 'nessuna risposta');
    await page.waitForTimeout(1400);

    const onboardingInitiallyVisible = await page.locator('[data-onboarding-contract="personal-work-profile-v1"]').isVisible().catch(() => false);
    if (onboardingInitiallyVisible) {
      check('Profilo di prova configurato tramite flusso reale', await completePersonalProfileIfRequired(), 'onboarding completato esplicitamente');
      await page.reload({ waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.waitForTimeout(1200);
    } else {
      check('Profilo di prova configurato tramite flusso reale', true, 'profilo già disponibile nella sessione di prova');
    }

    const blockingDialogs = await page.locator('[role="dialog"][aria-modal="true"]:visible').count().catch(() => 0);
    check('Utente locale già configurato non riceve onboarding automatico', blockingDialogs === 0, `dialoghi visibili=${blockingDialogs}`);

    if (blockingDialogs > 0) {
      await completePersonalProfileIfRequired();
      await page.waitForTimeout(300);
    }

    const releaseResponse = await context.request.get(`${BETA_URL}/beta-release.json`);
    const releaseIdentity = releaseResponse.ok() ? await releaseResponse.json().catch(() => null) : null;
    check('Identità release disponibile', Boolean(releaseIdentity && releaseIdentity.releaseSha), releaseIdentity ? JSON.stringify(releaseIdentity) : `HTTP ${releaseResponse.status()}`);
    if (EXPECTED_RELEASE_SHA) {
      check('Release pubblicata coincide con lo SHA distribuito', releaseIdentity?.releaseSha === EXPECTED_RELEASE_SHA, `atteso=${EXPECTED_RELEASE_SHA} pubblicato=${releaseIdentity?.releaseSha || 'assente'}`);
    }

    const navTrigger = page.locator('[data-mobile-navigation-trigger="brand"]');
    check('Comando navigazione mobile disponibile', await navTrigger.isVisible().catch(() => false));
    await navTrigger.click({ timeout: 5000 });
    await page.waitForTimeout(250);

    const sidebar = page.locator('#sidebar');
    await sidebar.waitFor({ state: 'visible', timeout: 2000 }).catch(() => undefined);
    check('Menu secondario mobile si apre', await sidebar.isVisible().catch(() => false));

    const guideEntry = sidebar.getByRole('button', { name: 'Guida', exact: true });
    const verificationEntry = sidebar.getByRole('button', { name: 'Verifiche', exact: true });
    const legacyControlsEntry = sidebar.getByRole('button', { name: 'Controlli e checklist', exact: true });
    const canonicalSupportPublished = await verificationEntry.isVisible().catch(() => false);
    const legacySupportPublished = await legacyControlsEntry.isVisible().catch(() => false);

    check('Guida è raggiungibile dal menu mobile', await guideEntry.isVisible().catch(() => false));
    check(
      'Navigazione Supporto pubblicata riconoscibile',
      canonicalSupportPublished || legacySupportPublished,
      canonicalSupportPublished ? 'supporto canonico' : 'supporto precedente in attesa di deploy',
    );

    await guideEntry.click();
    await page.waitForURL(/\/guida(?:\/|$|\?)/, { timeout: 5000 });
    const canonicalGuide = page.locator('[data-teacher-surface="support-guide"]').first();
    const guideVisible = canonicalSupportPublished
      ? await canonicalGuide.isVisible().catch(() => false)
      : page.url().includes('/guida') && (await page.locator('#main-content').innerText().catch(() => '')).trim().length > 20;
    check('Azione Guida apre la vista reale', guideVisible, page.url());

    const overflowMetrics = await page.evaluate(() => {
      const root = document.querySelector('#main-content');
      const fallback = document.documentElement;
      const scroller = root || fallback;
      return {
        scrollWidth: scroller.scrollWidth,
        clientWidth: scroller.clientWidth,
        scrollHeight: scroller.scrollHeight,
        clientHeight: scroller.clientHeight,
        viewportHeight: window.innerHeight,
      };
    });
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

    const verticalScreens = overflowMetrics.viewportHeight > 0 ? overflowMetrics.scrollHeight / overflowMetrics.viewportHeight : null;
    console.log(`GUIDE_TYPOGRAPHY=${JSON.stringify(typography)}`);
    console.log(`GUIDE_VERTICAL_SCREENS=${verticalScreens === null ? 'n/a' : verticalScreens.toFixed(2)}`);

    if (typography.minPx !== null && typography.minPx < 12) {
      finding('GUIDE_TEXT_BELOW_12PX', `Minimo osservato ${typography.minPx}px; elementi sotto 12px: ${typography.below12Count}/${typography.measuredCount}.`);
    }
    if (verticalScreens !== null && verticalScreens > 8) {
      finding('GUIDE_LONG_MOBILE_SCROLL', `La Guida occupa circa ${verticalScreens.toFixed(1)} altezze viewport a 390x844.`);
    }

    await page.screenshot({ path: path.join(OUT_DIR, 'guide-mobile.png'), fullPage: true });

    await navTrigger.click({ timeout: 5000 });
    await page.waitForTimeout(250);
    await sidebar.waitFor({ state: 'visible', timeout: 1500 }).catch(() => undefined);
    check('Menu mobile si riapre dalla Guida', await sidebar.isVisible().catch(() => false));

    if (canonicalSupportPublished) {
      const verificationAgain = sidebar.getByRole('button', { name: 'Verifiche', exact: true });
      check('Verifiche resta disponibile dopo la Guida', await verificationAgain.isVisible().catch(() => false));
      await verificationAgain.click();
      await page.waitForURL(/\/verifiche(?:\/|$|\?)/, { timeout: 5000 });
      await page.waitForTimeout(350);

      const verificationSurface = page.locator('[data-teacher-surface="support-verification"]');
      const documentsSurface = page.locator('[data-teacher-surface="documents"]');
      check('Verifiche apre una superficie reale dedicata', await verificationSurface.isVisible().catch(() => false), page.url());
      check(
        'Verifiche non ricade su Documenti',
        !page.url().includes('/documents') && !await documentsSurface.isVisible().catch(() => false),
        page.url(),
      );

      const verificationCards = await verificationSurface.locator('[data-verification-state]').count().catch(() => 0);
      check('Verifiche espone controlli orientati al compito', verificationCards >= 4, `controlli=${verificationCards}`);
    } else {
      check('Supporto live precedente resta raggiungibile in attesa del deploy della tranche', legacySupportPublished);
      finding(
        'CANONICAL_SUPPORT_PENDING_DEPLOY',
        'La Beta pubblica serve ancora la baseline precedente: le asserzioni Verifiche/Guida task-first saranno obbligatorie dopo il deploy della tranche Supporto.',
      );
    }

    check('Nessun errore pagina non gestito', pageErrors.length === 0, pageErrors.join(' | '));

    const report = {
      schema: 'CML_ARENA_S3C_LIVE_SUPPORT_EVIDENCE_V1',
      betaUrl: BETA_URL,
      expectedReleaseSha: EXPECTED_RELEASE_SHA || null,
      releaseIdentity,
      generatedAt: new Date().toISOString(),
      humanVerdictIssued: false,
      auditPersona: 'configured-local-user-via-real-profile-flow',
      checks,
      findings,
      metrics: { overflowMetrics, typography, verticalScreens },
      pageErrors,
    };
    fs.writeFileSync(path.join(OUT_DIR, 'report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');

    const hardFailures = checks.filter((item) => item.severity !== 'soft' && !item.pass);
    process.exitCode = hardFailures.length === 0 ? 0 : 1;
  } catch (error) {
    console.error(error);
    fs.writeFileSync(path.join(OUT_DIR, 'fatal-error.txt'), String(error && error.stack ? error.stack : error));
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();
