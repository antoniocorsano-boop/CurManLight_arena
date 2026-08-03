import { describe, expect, it, vi } from 'vitest';
import { executeDepartmentConsolidation, parseCmlImport } from '../features/documents/services/departmentConsolidation';
import { resolveOperationalRole } from '../domain/permissions';

const raw = JSON.stringify({ format: 'CML-LIGHT-EXPORT', decisions: { d1: 'approved' }, customTexts: { d1: 'Testo consolidato' } });

describe('CML-635B2 department consolidation', () => {
  it('preserves the existing CML format and parses without effects', () => {
    expect(parseCmlImport(raw)).toEqual({ format: 'CML-LIGHT-EXPORT', decisions: { d1: 'approved' }, customTexts: { d1: 'Testo consolidato' } });
    expect(parseCmlImport('{bad')).toMatchObject({ ok: false, reason: 'CML_IMPORT_INVALID' });
    expect(parseCmlImport(JSON.stringify({ format: 'other', decisions: {}, customTexts: {} }))).toMatchObject({ ok: false, reason: 'CML_IMPORT_INVALID' });
  });

  it('requires the capability before applying either map', () => {
    const setDecision = vi.fn();
    const setCustomText = vi.fn();
    const parsed = parseCmlImport(raw);
    if ('ok' in parsed) throw new Error('fixture should parse');
    const result = executeDepartmentConsolidation(resolveOperationalRole('docente'), parsed, { setDecision, setCustomText });
    expect(result).toMatchObject({ ok: false, reason: 'CAPABILITY_NOT_GRANTED' });
    expect(setDecision).not.toHaveBeenCalled();
    expect(setCustomText).not.toHaveBeenCalled();
  });

  it('counts and applies decisions and custom texts for a granted role', () => {
    const setDecision = vi.fn();
    const setCustomText = vi.fn();
    const parsed = parseCmlImport(raw);
    if ('ok' in parsed) throw new Error('fixture should parse');
    const result = executeDepartmentConsolidation(resolveOperationalRole('dipartimento'), parsed, { setDecision, setCustomText });
    expect(result).toEqual({ ok: true, value: { mergedDecisions: 1, mergedCustomTexts: 1 } });
    expect(setDecision).toHaveBeenCalledWith('d1', 'approved');
    expect(setCustomText).toHaveBeenCalledWith('d1', 'Testo consolidato');
  });
});
