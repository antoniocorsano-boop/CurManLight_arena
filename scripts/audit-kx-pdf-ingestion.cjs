const { chromium } = require('playwright');

const BASE_URL = process.env.KX_URL || 'http://127.0.0.1:4173/';
const PDF_BASE64 = 'JVBERi0xLjMKJZOMi54gUmVwb3J0TGFiIEdlbmVyYXRlZCBQREYgZG9jdW1lbnQgKG9wZW5zb3VyY2UpCjEgMCBvYmoKPDwKL0YxIDIgMCBSCj4+CmVuZG9iagoyIDAgb2JqCjw8Ci9CYXNlRm9udCAvSGVsdmV0aWNhIC9FbmNvZGluZyAvV2luQW5zaUVuY29kaW5nIC9OYW1lIC9GMSAvU3VidHlwZSAvVHlwZTEgL1R5cGUgL0ZvbnQKPj4KZW5kb2JqCjMgMCBvYmoKPDwKL0NvbnRlbnRzIDcgMCBSIC9NZWRpYUJveCBbIDAgMCAzMDAgMjAwIF0gL1BhcmVudCA2IDAgUiAvUmVzb3VyY2VzIDw8Ci9Gb250IDEgMCBSIC9Qcm9jU2V0IFsgL1BERiAvVGV4dCAvSW1hZ2VCIC9JbWFnZUMgL0ltYWdlSSBdCj4+IC9Sb3RhdGUgMCAvVHJhbnMgPDwKCj4+IAogIC9UeXBlIC9QYWdlCj4+CmVuZG9iago0IDAgb2JqCjw8Ci9QYWdlTW9kZSAvVXNlTm9uZSAvUGFnZXMgNiAwIFIgL1R5cGUgL0NhdGFsb2cKPj4KZW5kb2JqCjUgMCBvYmoKPDwKL0F1dGhvciAoYW5vbnltb3VzKSAvQ3JlYXRpb25EYXRlIChEOjIwMjYwODMwMDQwMDQ4KzAwJzAwJykgL0NyZWF0b3IgKGFub255bW91cykgL0tleXdvcmRzICgpIC9Nb2REYXRlIChEOjIwMjYwODMwMDQwMDQ4KzAwJzAwJykgL0Ryb2R1Y2VyIChSZXBvcnRMYWIgUERGIExpYnJhcnkgLSBcKG9wZW5zb3VyY2VcKSkgCiAgL1N1YmplY3QgKHVuc3BlY2lmaWVkKSAvVGl0bGUgKHVudGl0bGVkKSAvVHJhcHBlZCAvRmFsc2UKPj4KZW5kb2JqCjYgMCBvYmoKPDwKL0NvdW50IDEgL0tpZHMgWyAzIDAgUiBdIC9UeXBlIC9QYWdlcwo+PgplbmRvYmoKNyAwIG9iago8PAovRmlsdGVyIFsgL0FTQ0lJODVEZWNvZGUgL0ZsYXRlRGVjb2RlIF0gL0xlbmd0aCAxMTAKPj4Kc3RyZWFtCkdhcEBEMGItSDYnRXJpXVFrQlQlaVctbzMjZjgrYSZyIjomPj4mTGkuNDRMJDdETSkvMm1hZHQlPExhT1dpU04zPztdcVs6WzktKVRVVTJZOTl1X05JYV51c3FQZCc1TCFvXV9vRGsibSdCXX4+ZW5kc3RyZWFtCmVuZG9iagp4cmVmCjAgOAowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwNjEgMDAwMDAgbiAKMDAwMDAwMDA5MiAwMDAwMCBuIAowMDAwMDAwMTk5IDAwMDAwIG4gCjAwMDAwMDAzOTIgMDAwMDAgbiAKMDAwMDAwMDQ2MCAwMDAwMCBuIAowMDAwMDAwNzIxIDAwMDAwIG4gCjAwMDAwMDA3ODAgMDAwMDAgbiAKdHJhaWxlcgo8PAovSUQgCls8ZDI2OTNhMTQ5ZTVjZjYyZjNkMGVlOWQwNWVmNjMyNDQ+PGQyNjkzYTE0OWU1Y2Y2MmYzZDBlZTlkMDVlZjYzMjQ0Pl0KJSBSZXBvcnRMYWIgZ2VuZXJhdGVkIFBERiBkb2N1bWVudCAtLSBkaWdlc3QgKG9wZW5zb3VyY2UpCgovSW5mbyA1IDAgUgovUm9vdCA0IDAgUgovU2l6ZSA4Cj4+CnN0YXJ0eHJlZgo5ODAKJSVFT0YK';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'it-IT' });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  page.on('pageerror', (error) => consoleErrors.push(error.message));

  try {
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 45000 });
    await page.evaluate(() => { window.history.pushState({}, '', 'knowledge'); window.dispatchEvent(new PopStateEvent('popstate')); });
    const knowledgeNav = page.getByRole('navigation', { name: 'Cosa vuoi fare nella conoscenza', exact: true });
    await knowledgeNav.getByRole('button', { name: 'Fonti', exact: true }).click();
    await page.getByRole('button', { name: 'Aggiungi una fonte', exact: true }).click();

    const input = page.locator('#kb-file-upload-input');
    await input.setInputFiles({
      name: 'kx3-worker-fixture.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from(PDF_BASE64, 'base64'),
    });

    const dialog = page.getByRole('dialog');
    await dialog.getByText('File pronto da verificare', { exact: true }).waitFor({ state: 'visible', timeout: 15000 });
    const textArea = dialog.getByRole('textbox', { name: 'Testo della fonte' });
    const extracted = await textArea.inputValue();
    if (!extracted.includes('KX3 PDF TESTO ARENA')) {
      throw new Error(`PDF text extraction mismatch: ${extracted.slice(0, 200)}`);
    }
    if (consoleErrors.some((message) => /fake worker|Failed to fetch dynamically imported module/i.test(message))) {
      throw new Error(`pdf.js worker error: ${consoleErrors.join(' | ')}`);
    }

    await dialog.getByRole('button', { name: 'Aggiungi alla conoscenza', exact: true }).click();
    await dialog.waitFor({ state: 'hidden', timeout: 10000 });
    await page.getByRole('button', { name: 'Apri e verifica', exact: true }).click();
    const verification = page.locator('[data-kx-task="source-verification"]');
    await verification.getByRole('heading', { name: 'Conferma la verifica della fonte', exact: true }).waitFor({ state: 'visible' });
    await verification.getByRole('button', { name: 'Conferma come fonte locale verificata', exact: true }).click();
    await page.getByText('Fonte locale verificata', { exact: true }).waitFor({ state: 'visible', timeout: 10000 });

    const staleWarning = page.getByText('Il testo è disponibile localmente e resta una fonte non verificata.', { exact: true });
    if (await staleWarning.isVisible().catch(() => false)) {
      throw new Error('Verified source still renders the legacy unverified warning.');
    }

    console.log('KX_PDF_INGESTION_PASS worker=explicit text=extracted');
    console.log('KX_SOURCE_VERIFICATION_PASS authority=local-only explicit-human-confirmation');
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
