const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const baseUrl = (process.env.BETA_URL || 'https://antoniocorsano-boop.github.io/CurManLight_arena').replace(/\/$/, '');
const expectedReleaseSha = String(process.env.EXPECTED_RELEASE_SHA || '').trim();
const artifactDir = path.join(process.cwd(), 'artifacts', 'g6-accessibility');
fs.mkdirSync(artifactDir, { recursive: true });

const routes = [
  { id: 'home', path: '/' },
  { id: 'curriculum', path: '/curriculum' },
  { id: 'revision', path: '/revisione' },
  { id: 'documents', path: '/documents' },
  { id: 'sources', path: '/fascicolo' },
  { id: 'guide', path: '/guida' },
];

const profiles = [
  { id: 'desktop', viewport: { width: 1280, height: 900 } },
  { id: 'mobile', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
  { id: 'reflow-320', viewport: { width: 320, height: 800 }, isMobile: true, hasTouch: true },
];

const result = {
  schema: 'CML_ARENA_G6_AUTOMATED_A11Y_V1',
  generatedAt: new Date().toISOString(),
  baseUrl,
  expectedReleaseSha,
  releaseIdentity: null,
  humanVerdictIssued: false,
  profiles: [],
  summary: {
    failedChecks: 0,
    axeCriticalSerious: 0,
    unnamedControls: 0,
    undersizedTargets24: 0,
    focusVisibilityFailures: 0,
    reflowFailures: 0,
  },
};

let failed = false;

function recordCheck(bucket, label, pass, detail = '') {
  bucket.checks.push({ label, pass: Boolean(pass), detail });
  console.log(`${pass ? 'PASS' : 'FAIL'} — ${bucket.profile}/${bucket.route} — ${label}${detail ? ` — ${detail}` : ''}`);
  if (!pass) {
    failed = true;
    result.summary.failedChecks += 1;
  }
}

async function closeLocalProfileIfPresent(page) {
  await page.waitForTimeout(450);
  const dialog = page.locator('[role="dialog"][aria-modal="true"]').first();
  if (!(await dialog.isVisible({ timeout: 350 }).catch(() => false))) return;
  const closeByName = dialog.getByRole('button', { name: /chiudi|annulla|continua|salva/i }).first();
  if (await closeByName.isVisible({ timeout: 250 }).catch(() => false)) {
    await closeByName.click().catch(() => undefined);
  } else {
    await page.keyboard.press('Escape').catch(() => undefined);
  }
  await dialog.waitFor({ state: 'hidden', timeout: 1800 }).catch(() => undefined);
}

async function gotoRoute(page, route) {
  const response = await page.goto(`${baseUrl}${route}`, {
    waitUntil: 'domcontentloaded',
    timeout: 30000,
  });
  if (!response || response.status() >= 500) {
    throw new Error(`Navigation failed ${route}: ${response?.status() ?? 'no response'}`);
  }
  await closeLocalProfileIfPresent(page);
  await page.waitForTimeout(250);
}

async function injectAxe(page) {
  await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') });
}

async function runAxe(page) {
  return page.evaluate(async () => {
    return window.axe.run(document, {
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'],
      },
      rules: {
        'color-contrast': { enabled: true },
      },
    });
  });
}

async function inspectUnnamedControls(page) {
  return page.evaluate(() => {
    const selectors = [
      'button',
      'a[href]',
      'input:not([type="hidden"])',
      'select',
      'textarea',
      '[role="button"]',
      '[role="link"]',
    ];
    const nodes = Array.from(document.querySelectorAll(selectors.join(',')));
    return nodes
      .filter((el) => {
        if (!(el instanceof HTMLElement)) return false;
        const rect = el.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) return false;
        const style = getComputedStyle(el);
        return style.visibility !== 'hidden' && style.display !== 'none';
      })
      .filter((el) => {
        const text = (el.textContent || '').trim();
        const aria = (el.getAttribute('aria-label') || '').trim();
        const labelledBy = (el.getAttribute('aria-labelledby') || '').trim();
        const title = (el.getAttribute('title') || '').trim();
        const alt = el instanceof HTMLInputElement && el.type === 'image' ? (el.alt || '').trim() : '';
        return !text && !aria && !labelledBy && !title && !alt;
      })
      .map((el) => ({
        tag: el.tagName.toLowerCase(),
        role: el.getAttribute('role'),
        cls: el.getAttribute('class'),
        outer: el.outerHTML.slice(0, 240),
      }));
  });
}

async function inspectTargets(page) {
  return page.evaluate(() => {
    const selectors = 'button,a[href],input:not([type="hidden"]),select,textarea,[role="button"],[role="link"]';
    const nodes = Array.from(document.querySelectorAll(selectors));
    const visible = nodes.filter((el) => {
      if (!(el instanceof HTMLElement)) return false;
      const rect = el.getBoundingClientRect();
      const style = getComputedStyle(el);
      return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
    });
    const mapped = visible.map((el) => {
      const rect = el.getBoundingClientRect();
      return {
        tag: el.tagName.toLowerCase(),
        text: (el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 80),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      };
    });
    return {
      under24: mapped.filter((x) => x.width < 24 || x.height < 24),
      under44: mapped.filter((x) => x.width < 44 || x.height < 44),
      total: mapped.length,
    };
  });
}

async function keyboardFocusProbe(page) {
  await page.evaluate(() => {
    const active = document.activeElement;
    if (active instanceof HTMLElement) active.blur();
    window.scrollTo(0, 0);
  });
  const samples = [];
  for (let i = 0; i < 8; i += 1) {
    await page.keyboard.press('Tab');
    const sample = await page.evaluate(() => {
      const el = document.activeElement;
      if (!(el instanceof HTMLElement)) return null;
      const style = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      const visibleFocus =
        (style.outlineStyle !== 'none' && parseFloat(style.outlineWidth || '0') > 0) ||
        (style.boxShadow && style.boxShadow !== 'none');
      return {
        tag: el.tagName.toLowerCase(),
        text: (el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 90),
        visibleFocus,
        inViewport: rect.bottom >= 0 && rect.top <= window.innerHeight,
      };
    });
    if (sample) samples.push(sample);
  }
  const meaningful = samples.filter((x) => x.tag !== 'body');
  return {
    samples,
    hasFocusable: meaningful.length > 0,
    visibleFocusObserved: meaningful.some((x) => x.visibleFocus),
    focusInViewport: meaningful.every((x) => x.inViewport),
  };
}

async function inspectDialogs(page) {
  return page.evaluate(() => {
    const dialogs = Array.from(document.querySelectorAll('[role="dialog"],dialog'));
    return dialogs
      .filter((el) => el instanceof HTMLElement && getComputedStyle(el).display !== 'none')
      .map((el) => ({
        tag: el.tagName.toLowerCase(),
        ariaModal: el.getAttribute('aria-modal'),
        ariaLabel: el.getAttribute('aria-label'),
        ariaLabelledby: el.getAttribute('aria-labelledby'),
      }));
  });
}

(async () => {
  const releaseResponse = await fetch(`${baseUrl}/beta-release.json`);
  if (!releaseResponse.ok) throw new Error(`beta-release.json HTTP ${releaseResponse.status}`);
  const release = await releaseResponse.json();
  result.releaseIdentity = release;
  const releaseSha = String(release.releaseSha || '').trim();
  const identityPass = /^[0-9a-f]{40}$/.test(releaseSha) && (!expectedReleaseSha || releaseSha === expectedReleaseSha);
  console.log(`${identityPass ? 'PASS' : 'FAIL'} — release identity — ${releaseSha}`);
  if (!identityPass) {
    failed = true;
    result.summary.failedChecks += 1;
  }

  const browser = await chromium.launch({ headless: true });
  try {
    for (const profile of profiles) {
      const context = await browser.newContext({
        viewport: profile.viewport,
        locale: 'it-IT',
        isMobile: Boolean(profile.isMobile),
        hasTouch: Boolean(profile.hasTouch),
        reducedMotion: 'reduce',
      });

      for (const route of routes) {
        const page = await context.newPage();
        const bucket = { profile: profile.id, route: route.id, path: route.path, checks: [], axe: null };
        result.profiles.push(bucket);

        try {
          await gotoRoute(page, route.path);
          await injectAxe(page);

          const axe = await runAxe(page);
          const severe = axe.violations.filter((v) => ['critical', 'serious'].includes(v.impact));
          bucket.axe = {
            violations: axe.violations.map((v) => ({
              id: v.id,
              impact: v.impact,
              help: v.help,
              nodes: v.nodes.length,
              targets: v.nodes.slice(0, 8).map((n) => n.target),
            })),
            severeCount: severe.length,
          };
          result.summary.axeCriticalSerious += severe.length;
          recordCheck(bucket, 'axe-core: nessuna violazione critical/serious', severe.length === 0, severe.map((v) => `${v.id}(${v.nodes.length})`).join(', '));

          const unnamed = await inspectUnnamedControls(page);
          result.summary.unnamedControls += unnamed.length;
          bucket.unnamedControls = unnamed;
          recordCheck(bucket, 'controlli visibili con nome accessibile', unnamed.length === 0, unnamed.length ? `${unnamed.length} senza nome` : '');

          const targets = await inspectTargets(page);
          result.summary.undersizedTargets24 += targets.under24.length;
          bucket.targets = targets;
          recordCheck(bucket, 'target interattivi >= 24 CSS px', targets.under24.length === 0, targets.under24.slice(0, 6).map((x) => `${x.text || x.tag}:${x.width}x${x.height}`).join(', '));

          const focus = await keyboardFocusProbe(page);
          bucket.keyboardFocus = focus;
          const focusPass = focus.hasFocusable && focus.visibleFocusObserved && focus.focusInViewport;
          if (!focusPass) result.summary.focusVisibilityFailures += 1;
          recordCheck(bucket, 'Tab raggiunge controlli con focus visibile', focusPass, JSON.stringify(focus.samples.slice(0, 4)));

          const dialogs = await inspectDialogs(page);
          bucket.visibleDialogs = dialogs;
          const dialogsPass = dialogs.every((d) => (d.tag === 'dialog' || d.ariaModal === 'true') && Boolean(d.ariaLabel || d.ariaLabelledby));
          recordCheck(bucket, 'dialoghi visibili hanno semantica e nome', dialogsPass, dialogs.length ? JSON.stringify(dialogs) : 'nessun dialogo visibile');

          const overflow = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 4);
          if (profile.id === 'reflow-320' && !overflow) result.summary.reflowFailures += 1;
          recordCheck(bucket, profile.id === 'reflow-320' ? 'reflow 320px senza overflow pagina' : 'nessun overflow orizzontale pagina', overflow);

          await page.screenshot({
            path: path.join(artifactDir, `${profile.id}-${route.id}.png`),
            fullPage: true,
          });
        } catch (error) {
          recordCheck(bucket, 'audit route completato', false, error instanceof Error ? error.message : String(error));
        } finally {
          await page.close();
        }
      }

      await context.close();
    }
  } finally {
    await browser.close();
  }

  fs.writeFileSync(path.join(artifactDir, 'g6-accessibility.json'), JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result.summary, null, 2));

  if (failed) {
    console.error('BETA_G6_AUTOMATED_A11Y_FAIL');
    process.exitCode = 1;
  } else {
    console.log('BETA_G6_AUTOMATED_A11Y_PASS');
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
