import { describe, expect, it, vi } from 'vitest';
import { executeCanonicalExport } from '../features/documents/services/protectedCanonicalDocumentExport';
import { resolveOperationalRole } from '../domain/permissions';
import type { ExportabilityResult } from '../domain/documents/exportValidator';

const exportable: ExportabilityResult = { exportable: true, blockingErrors: [], warnings: [] };
const invalid: ExportabilityResult = {
  exportable: false,
  blockingErrors: [{ code: 'TITLE_MISSING', message: 'Titolo mancante.' }],
  warnings: [],
};

describe('CML-635B2 canonical export enforcement', () => {
  it('denies before invoking print or download effects', () => {
    const run = vi.fn(() => undefined);
    const result = executeCanonicalExport(resolveOperationalRole(undefined), { kind: 'download-json', run }, exportable);
    expect(result).toMatchObject({ ok: false, reason: 'CAPABILITY_NOT_GRANTED', requiredCapability: 'document.export' });
    expect(run).not.toHaveBeenCalled();
  });

  it('keeps document validation distinct from capability denial', () => {
    const run = vi.fn(() => undefined);
    const result = executeCanonicalExport(resolveOperationalRole('amministratore'), { kind: 'download-json', run }, invalid);
    expect(result).toEqual({ ok: false, reason: 'DOCUMENT_NOT_EXPORTABLE', errors: invalid.blockingErrors });
    expect(run).not.toHaveBeenCalled();
  });

  it('runs the canonical effect only after capability and validation pass', () => {
    const run = vi.fn(() => undefined);
    const result = executeCanonicalExport(resolveOperationalRole('amministratore'), { kind: 'download-json', run }, exportable);
    expect(result).toEqual({ ok: true, value: undefined });
    expect(run).toHaveBeenCalledOnce();
  });

  it('returns technical print failures separately', () => {
    const result = executeCanonicalExport(resolveOperationalRole('docente'), {
      kind: 'print',
      run: () => ({ success: false, error: 'popup-blocked' as const, message: 'Popup bloccato.' }),
    }, exportable);
    expect(result).toEqual({ ok: false, reason: 'CANONICAL_EXPORT_FAILED', message: 'Popup bloccato.' });
  });
});