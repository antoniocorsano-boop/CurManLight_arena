import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const root = path.resolve('storybook-static');
const outDir = path.resolve(process.env.TRAMA_COMPONENT_EVIDENCE_DIR || 'artifacts/trama-component-evidence-arena-01');
const port = Number(process.env.TRAMA_COMPONENT_EVIDENCE_PORT || 6007);
const exactHead = process.env.TRAMA_EXACT_HEAD || null;
const runId = process.env.TRAMA_RUN_ID || null;

const contentTypes = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.mjs', 'text/javascript; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.webp', 'image/webp'],
  ['.woff', 'font/woff'],
  ['.woff2', 'font/woff2'],
]);

function safeFilePath(requestUrl) {
  const url = new URL(requestUrl || '/', `http://127.0.0.1:${port}`);
  const pathname = decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname);
  const candidate = path.resolve(root, `.${pathname}`);
  if (!candidate.startsWith(root + path.sep) && candidate !== root) return null;
  return candidate;
}

const server = createServer(async (req, res) => {
  try {
    const filePath = safeFilePath(req.url);
    if (!filePath) {
      res.writeHead(403).end('Forbidden');
      return;
    }
    const stat = await fs.stat(filePath);
    const resolved = stat.isDirectory() ? path.join(filePath, 'index.html') : filePath;
    const body = await fs.readFile(resolved);
    res.writeHead(200, {
      'Content-Type': contentTypes.get(path.extname(resolved)) || 'application/octet-stream',
      'Cache-Control': 'no-store',
    });
    res.end(body);
  } catch {
    res.writeHead(404).end('Not found');
  }
});

await fs.mkdir(outDir, { recursive: true });
await new Promise((resolve) => server.listen(port, '127.0.0.1', resolve));

const browser = await chromium.launch({ headless: true });
const results = [];

async function captureTabs(viewport, label) {
  const page = await browser.newPage({ viewport });
  const url = `http://127.0.0.1:${port}/iframe.html?id=ui-system-uitabs--responsive-compact&viewMode=story`;
  await page.goto(url, { waitUntil: 'networkidle' });

  const tablist = page.getByRole('tablist', { name: 'Sezioni di qualificazione' });
  await tablist.waitFor({ state: 'visible' });
  const tabs = page.getByRole('tab');
  assert.equal(await tabs.count(), 4, 'Expected four governed tabs');

  const metrics = await tablist.evaluate((node) => {
    const el = node;
    const style = window.getComputedStyle(el);
    return {
      overflowX: style.overflowX,
      clientWidth: el.clientWidth,
      scrollWidth: el.scrollWidth,
      documentClientWidth: document.documentElement.clientWidth,
      documentScrollWidth: document.documentElement.scrollWidth,
    };
  });

  assert.equal(metrics.overflowX, 'auto', 'Tablist must contain horizontal overflow');
  assert.ok(
    metrics.documentScrollWidth <= metrics.documentClientWidth + 1,
    `Tabs must not force page-level horizontal overflow: ${metrics.documentScrollWidth} > ${metrics.documentClientWidth}`
  );
  if (viewport.width <= 390) {
    assert.ok(metrics.scrollWidth > metrics.clientWidth, 'Compact viewport must exercise contained tab scrolling');
  }

  const first = tabs.nth(0);
  await first.focus();
  await page.keyboard.press('ArrowRight');
  const second = tabs.nth(1);
  assert.equal(await second.getAttribute('aria-selected'), 'true', 'ArrowRight must activate second tab');
  assert.equal(await second.getAttribute('tabindex'), '0', 'Active tab must remain in the Tab sequence');

  const screenshot = path.join(outDir, `tabs-${label}.png`);
  await page.screenshot({ path: screenshot, fullPage: true });
  results.push({ component: 'ARENA.TABS.GOVERNED', viewport, screenshot: path.relative(process.cwd(), screenshot), metrics });
  await page.close();
}

async function captureDialog(viewport, label) {
  const page = await browser.newPage({ viewport });
  const url = `http://127.0.0.1:${port}/iframe.html?id=ui-system-uiconfirmdialog--danger-confirm&viewMode=story`;
  await page.goto(url, { waitUntil: 'networkidle' });

  const dialog = page.getByRole('dialog');
  await dialog.waitFor({ state: 'visible' });

  const semantics = await dialog.evaluate((node) => {
    const el = node;
    const rect = el.getBoundingClientRect();
    return {
      labelledBy: el.getAttribute('aria-labelledby'),
      describedBy: el.getAttribute('aria-describedby'),
      left: rect.left,
      right: rect.right,
      top: rect.top,
      bottom: rect.bottom,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      documentClientWidth: document.documentElement.clientWidth,
      documentScrollWidth: document.documentElement.scrollWidth,
    };
  });

  assert.ok(semantics.labelledBy, 'Dialog requires aria-labelledby');
  assert.ok(semantics.describedBy, 'Dialog requires aria-describedby');
  assert.ok(semantics.left >= -1 && semantics.right <= semantics.viewportWidth + 1, 'Dialog must fit horizontally');
  assert.ok(semantics.top >= -1 && semantics.bottom <= semantics.viewportHeight + 1, 'Dialog must fit vertically');
  assert.ok(
    semantics.documentScrollWidth <= semantics.documentClientWidth + 1,
    'Dialog must not create page-level horizontal overflow'
  );

  const screenshot = path.join(outDir, `dialog-${label}.png`);
  await page.screenshot({ path: screenshot, fullPage: true });
  results.push({ component: 'ARENA.DIALOG_CONFIRM.GOVERNED', viewport, screenshot: path.relative(process.cwd(), screenshot), metrics: semantics });
  await page.close();
}

try {
  const viewports = [
    [{ width: 390, height: 844 }, '390x844'],
    [{ width: 1024, height: 768 }, '1024x768'],
  ];

  for (const [viewport, label] of viewports) {
    await captureTabs(viewport, label);
    await captureDialog(viewport, label);
  }

  const evidence = {
    schemaVersion: 'trama.component-browser-evidence/v1',
    exactHead,
    runId,
    generatedAt: new Date().toISOString(),
    status: 'PASS',
    producers: ['Storybook static build', 'Playwright Chromium'],
    results,
  };
  await fs.writeFile(path.join(outDir, 'evidence.json'), JSON.stringify(evidence, null, 2) + '\n', 'utf8');
  process.stdout.write('TRAMA_COMPONENT_BROWSER_EVIDENCE_PASS\n');
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
