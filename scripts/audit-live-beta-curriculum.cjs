const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const BETA_URL = (process.env.BETA_URL || 'https://antoniocorsano-boop.github.io/CurManLight_arena/').replace(/\/$/, '');
const EXPECTED_RELEASE_SHA = (process.env.EXPECTED_RELEASE_SHA || '').trim();
const OUT_DIR = process.env.AUDIT_OUT_DIR || 'artifacts/live-beta-curriculum';

fs.mkdirSync(OUT_DIR, { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, locale: 'it-IT' });
  const page = await context.newPage();
  const checks = [];
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  const check = (name, pass, detail = '') => {
    const item = { name, pass: Boolean(pass), detail };
    checks.push(item);
    console.log(`${item.pass ? 'PASS' : 'FAIL'} — ${name}${detail ? ` — ${detail}` : ''}`);
    return item.pass;
  };

  const completePersonalProfileIfRequired = async () => {
    const dialog = page.locator('[data-onboarding-contract="personal-work-profile-v1"]');
    if (!await dialog.isVisible().catch(() => false)) {
      check('Profilo personale già disponibile', true, 'onboarding non richiesto');
      return;
    }

    check('Onboarding personale rilevato', true, 'completamento esplicito del profilo di prova');
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
    check('Profilo personale salvato tramite flusso reale', !await dialog.isVisible().catch(() => false));
  };

  try {
    const response = await page.goto(`${BETA_URL}/`, { waitUntil: 'domcontentloaded', timeout: 45000 });
    check('Beta pubblica raggiungibile', Boolean(response && response.ok()), response ? `HTTP ${response.status()}` : 'nessuna risposta');
    await page.waitForTimeout(1200);

    const releaseResponse = await context.request.get(`${BETA_URL}/beta-release.json`);
    const releaseIdentity = releaseResponse.ok() ? await releaseResponse.json().catch(() => null) : null;
    check('Identità release disponibile', Boolean(releaseIdentity?.releaseSha), releaseIdentity ? JSON.stringify(releaseIdentity) : `HTTP ${releaseResponse.status()}`);
    if (EXPECTED_RELEASE_SHA) {
      check('Release pubblicata coincide con exact head atteso', releaseIdentity?.releaseSha === EXPECTED_RELEASE_SHA, `atteso=${EXPECTED_RELEASE_SHA} pubblicato=${releaseIdentity?.releaseSha || 'assente'}`);
    }

    await completePersonalProfileIfRequired();
    await page.waitForTimeout(350);

    const curriculumButton = page.getByRole('button', { name: 'Curricolo', exact: true }).last();
    await curriculumButton.waitFor({ state: 'visible', timeout: 8000 });
    check('Comando Curricolo disponibile nella navigazione primaria', await curriculumButton.isVisible().catch(() => false));
    await curriculumButton.click();
    await page.waitForTimeout(700);

    const canonicalSurface = page.locator('[data-canonical-curriculum-entry]');
    await canonicalSurface.waitFor({ state: 'visible', timeout: 8000 }).catch(() => undefined);
    check('Superficie curricolare canonica visibile', await canonicalSurface.isVisible().catch(() => false));
    check('Titolo Curricolo verticale d’Istituto visibile', await canonicalSurface.getByText('Curricolo verticale d’Istituto', { exact: true }).isVisible().catch(() => false));
    check('Curricolo verticale integrale 3–14 visibile', await canonicalSurface.getByText('Curricolo verticale integrale 3–14', { exact: true }).isVisible().catch(() => false));
    check('Baseline corrente dichiarata', await canonicalSurface.getByText('Baseline corrente', { exact: true }).isVisible().catch(() => false));
    check('Stato non vigente esplicitato', await canonicalSurface.getByText('Non è ancora il curricolo vigente dell’Istituto.', { exact: false }).isVisible().catch(() => false));

    const legacyWorkspace = page.locator('[data-legacy-curriculum-workspace]');
    check('Archivio locale precedente non aperto automaticamente', await legacyWorkspace.count() === 0);
    const legacyDisclosure = page.locator('[data-legacy-curriculum-disclosure]');
    check('Archivio locale precedente relegato a disclosure secondaria', await legacyDisclosure.isVisible().catch(() => false));

    const primaryText = (await canonicalSurface.innerText().catch(() => '')).replace(/\s+/g, ' ').trim();
    const normalizedPrimaryText = primaryText.toLocaleLowerCase('it-IT');
    check(
      'La superficie primaria contiene copertura 3–14',
      normalizedPrimaryText.includes('3 · 4 · 5 anni')
        && normalizedPrimaryText.includes('classi i · ii · iii · iv · v')
        && normalizedPrimaryText.includes('secondaria di primo grado'),
      primaryText,
    );
    check('Nessun errore pagina non gestito', pageErrors.length === 0, pageErrors.join(' | '));

    await page.screenshot({ path: path.join(OUT_DIR, 'curricolo-mobile.png'), fullPage: true });

    const report = {
      schema: 'CML_ARENA_LIVE_CURRICULUM_PRIMARY_SURFACE_AUDIT_V1',
      betaUrl: BETA_URL,
      expectedReleaseSha: EXPECTED_RELEASE_SHA || null,
      releaseIdentity,
      generatedAt: new Date().toISOString(),
      viewport: { width: 390, height: 844 },
      humanVerdictIssued: false,
      checks,
      pageErrors,
    };
    fs.writeFileSync(path.join(OUT_DIR, 'report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');

    const failures = checks.filter((item) => !item.pass);
    if (failures.length === 0) {
      console.log(`BETA_CURRICULUM_PRIMARY_SURFACE_PASS ${releaseIdentity?.releaseSha || 'unknown'}`);
      process.exitCode = 0;
    } else {
      console.error(`BETA_CURRICULUM_PRIMARY_SURFACE_FAIL failures=${failures.length}`);
      process.exitCode = 1;
    }
  } catch (error) {
    console.error(error);
    fs.writeFileSync(path.join(OUT_DIR, 'fatal-error.txt'), String(error && error.stack ? error.stack : error));
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();
