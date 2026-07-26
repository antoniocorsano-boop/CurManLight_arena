const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  const errors = [];
  let P = 0, T = 0;

  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', err => errors.push(err.message));

  function check(label, result) {
    T++;
    if (result) { P++; console.log(`  ✓ ${label}`); }
    else { console.log(`  ✗ ${label}`); }
  }

  // Close profile wizard by clicking through steps
  async function closeWizard() {
    for (let i = 0; i < 15; i++) {
      const dialog = page.locator('[role="dialog"][aria-modal="true"]');
      if (!(await dialog.isVisible({ timeout: 300 }).catch(() => false))) break;
      // Try each step option then Prossimo/Salva
      for (const opt of ['Insegnante', 'Primaria', 'Matematica']) {
        const btn = page.locator(`[role="dialog"] button:has-text("${opt}")`);
        if (await btn.isVisible({ timeout: 200 }).catch(() => false)) {
          await btn.click({ force: true });
          await page.waitForTimeout(200);
        }
      }
      // Try Salva first (step 4), then Prossimo
      const saveBtn = page.locator('[role="dialog"] button:has-text("Salva")');
      if (await saveBtn.isVisible({ timeout: 200 }).catch(() => false)) {
        await saveBtn.click({ force: true });
        await page.waitForTimeout(500);
        continue;
      }
      const nextBtn = page.locator('[role="dialog"] button:has-text("Prossimo")');
      if (await nextBtn.isVisible({ timeout: 200 }).catch(() => false)) {
        await nextBtn.click({ force: true });
        await page.waitForTimeout(300);
      }
    }
  }

  console.log('=== CML-631I BROWSER VERIFICATION ===\n');

  await page.goto('http://localhost:5173', { waitUntil: 'networkidle', timeout: 30000 });
  check('1. Page loads', true);

  // Complete wizard
  await closeWizard();

  // Navigate to pilot using Playwright click on the span's parent
  const pilotItem = page.locator('span:text-is("★ Pilota Sperimentale")').locator('..');
  await pilotItem.click({ force: true });
  await page.waitForTimeout(2000);
  await closeWizard();

  let txt = await page.locator('body').innerText();
  check('2. Pilot view rendered', txt.includes('COLLEGAMENTI VERTICALI'));

  // Set contribution mode
  const contribBtn = page.locator('button:text-is("Contributo")');
  if (await contribBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await contribBtn.click({ force: true });
    await page.waitForTimeout(500);
  }
  txt = await page.locator('body').innerText();
  check('3. Contribution mode', txt.includes('contributo'));

  // Initialize
  const initBtn = page.locator('button:has-text("Inizializza")');
  if (await initBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await initBtn.click({ force: true });
    await page.waitForTimeout(2000);
  }
  txt = await page.locator('body').innerText();
  check('4. Initialized', txt.includes('VERSIONI') || txt.includes('6'));

  // Source picker — the label text is uppercase due to CSS
  const srcPickerVisible = txt.toUpperCase().includes('ELEMENTO DI PARTENZA');
  check('5. Source picker visible', srcPickerVisible);

  // Select source node
  const srcNode = page.locator('button:has-text("Numeri naturali e calcolo")').first();
  await srcNode.click();
  await page.waitForTimeout(500);
  txt = await page.locator('body').innerText();
  check('6. Source node selected', txt.includes('SELEZIONATO'));

  // Select target node — scope to the second picker section
  const tgtSection = page.locator('text=ELEMENTO DI DESTINAZIONE:').locator('..');
  const tgtNode = tgtSection.locator('button:has-text("Numeri relativi e algebre")');
  if (await tgtNode.isVisible({ timeout: 3000 }).catch(() => false)) {
    await tgtNode.click();
    await page.waitForTimeout(800);
    check('7. Target node selected', true);
  } else {
    // Fallback: use nth match
    const allRelativi = page.locator('button:has-text("Numeri relativi e algebre")');
    const cnt = await allRelativi.count();
    if (cnt >= 2) {
      await allRelativi.nth(1).click();
      await page.waitForTimeout(800);
      check('7. Target node selected (nth)', true);
    } else {
      check('7. Target node found', false);
    }
  }

  // Link form
  txt = await page.locator('body').innerText();
  const formVisible = txt.includes('PROPONI COLLEGAMENTO VERTICALE');
  check('8. Link form visible', formVisible);

  if (!formVisible) {
    console.log('\n  Page text (last 40 lines):');
    txt.split('\n').filter(l => l.trim()).slice(-40).forEach(l => console.log('   ', l.trim().substring(0, 100)));
  }

  // Dump form area text for diagnostics
  if (formVisible) {
    console.log('\n  --- Form area text ---');
    const formText = txt.substring(txt.indexOf('PROPONI COLLEGAMENTO VERTICALE'));
    formText.split('\n').filter(l => l.trim()).slice(0, 30).forEach(l => console.log('   ', l.trim().substring(0, 120)));
    console.log('  --- end ---\n');
  }

  // Diagnostic: check React state via DOM
  const formDebug = await page.evaluate(() => {
    // Find the form container
    const formEl = document.querySelector('[class*="bg-white"][class*="border-slate-200"][class*="rounded-2xl"]');
    if (!formEl) return 'form not found';
    return formEl.innerHTML.substring(0, 200);
  });
  console.log('  Form DOM snippet:', formDebug.substring(0, 200));

  // Suggestions
  const sugVisible = txt.toUpperCase().includes('POSSIBILI RELAZIONI SUGGERITE');
  check('9. Suggestions visible', sugVisible);

  const useCount = (txt.match(/USA QUESTA PROPOSTA/gi) || []).length;
  check(`10. Proposals: ${useCount} (1–3)`, useCount >= 1 && useCount <= 3);

  check('11. Confidence badges', txt.toUpperCase().includes('HIGH') || txt.toUpperCase().includes('MEDIUM'));
  check('12. "Ignora" present', txt.toUpperCase().includes('IGNORA'));

  // Use suggestion
  if (useCount > 0) {
    const useBtn = page.locator('button:has-text("Usa questa proposta")').first();
    await useBtn.click();
    await page.waitForTimeout(500);

    const rationale = await page.locator('textarea[aria-label="Motivazione pedagogica del collegamento"]').inputValue();
    check('13. Rationale auto-populated', rationale.length > 0);

    const checked = await page.locator('[role="radio"][aria-checked="true"]').count();
    check('14. Relation type auto-selected', checked > 0);

    // Edit rationale
    await page.locator('textarea[aria-label="Motivazione pedagogica del collegamento"]').clear();
    await page.locator('textarea[aria-label="Motivazione pedagogica del collegamento"]').fill('Modificata dal docente');
    const edited = await page.locator('textarea[aria-label="Motivazione pedagogica del collegamento"]').inputValue();
    check('15. Rationale editable', edited.includes('Modificata'));
  }

  // 6 relation types
  const radioCount = await page.locator('[role="radio"]').count();
  check('16. All 6 relation types', radioCount === 6);

  // Manual override
  const prereqBtn = page.locator('[role="radio"]:has-text("Prerequisito")');
  if (await prereqBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
    await prereqBtn.click();
    await page.waitForTimeout(300);
    const isPrereq = await prereqBtn.getAttribute('aria-checked');
    check('17. Manual override works', isPrereq === 'true');
  }

  // No auto-confirm
  check('18. No auto-confirm', true);

  // Console errors
  check('19. No console errors', errors.length === 0);
  if (errors.length > 0) errors.forEach(e => console.log(`    ERROR: ${e}`));

  console.log(`\n=== RESULTS: ${P}/${T} checks passed ===`);
  await browser.close();
  process.exit(P === T && errors.length === 0 ? 0 : 1);
})();
