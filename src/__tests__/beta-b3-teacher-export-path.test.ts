import { describe, expect, it, vi } from 'vitest';
import { printUdaDocument, renderUdaDocumentHtml } from '../features/documents/services/udaDocumentExport';
import type { UdaModel } from '../types/curriculum';
import type { EntityId } from '../domain/curriculum/identity/types';

const uda: UdaModel = {
  id: 'uda-energy', title: 'Energia & territorio', discipline: 'scienze', order: 'secondaria', period: 'Primo quadrimestre', hours: 12,
  status: 'bozza', traguardi: ['Traguardo energia'], obiettivi: ['Obiettivo salvato'], evidenze: ['Evidenza osservabile'],
  realTask: 'Progettare un risparmio energetico', notes: 'Nota salvata', createdAt: '2026-08-16',
  activities: ['Laboratorio energia'], assessment: ['Rubrica formativa'], materials: ['Dati di consumo'],
  sourcePlanningRef: { id: 'planning-energy' as EntityId, entityType: 'teaching-design', snapshotLabel: 'Planning energia' },
};

describe('B3 teacher UDA export path', () => {
  it('renders the latest persisted content and omits empty optional sections', () => {
    const html = renderUdaDocumentHtml({ ...uda, materials: [], notes: '' });
    expect(html).toContain('Energia &amp; territorio');
    expect(html).toContain('Obiettivo salvato');
    expect(html).toContain('Laboratorio energia');
    expect(html).toContain('Rubrica formativa');
    expect(html).toContain('Progettare un risparmio energetico');
    expect(html).not.toContain('Materiali</h2>');
    expect(html).not.toContain('Note</h2>');
  });

  it('starts the canonical print flow without mutating the UDA', () => {
    const before = JSON.stringify(uda);
    const print = vi.fn();
    const close = vi.fn();
    const write = vi.fn();
    const targetWindow = { document: { write, close: vi.fn() }, print, close } as unknown as Window;
    const result = printUdaDocument(uda, targetWindow);
    expect(result.success).toBe(true);
    expect(print).toHaveBeenCalledOnce();
    expect(write).toHaveBeenCalledWith(expect.stringContaining('Obiettivo salvato'));
    expect(JSON.stringify(uda)).toBe(before);
  });

  it('keeps distinct UDA content isolated and reports print failures safely', () => {
    const second = { ...uda, id: 'uda-water', title: 'Acqua e territorio', obiettivi: ['Obiettivo acqua'] };
    expect(renderUdaDocumentHtml(uda)).toContain('Obiettivo salvato');
    expect(renderUdaDocumentHtml(uda)).not.toContain('Obiettivo acqua');
    expect(renderUdaDocumentHtml(second)).toContain('Obiettivo acqua');
    const blocked = printUdaDocument(uda, null);
    expect(blocked.success).toBe(false);
    const throwingWindow = { document: { write: vi.fn(() => { throw new Error('browser failure'); }), close: vi.fn() }, print: vi.fn(), close: vi.fn() } as unknown as Window;
    expect(printUdaDocument(uda, throwingWindow).success).toBe(false);
  });

  it('fails safely when identity or title is missing', () => {
    const result = printUdaDocument({ ...uda, id: '', title: ' ' });
    expect(result.success).toBe(false);
    expect(result.message).toContain('identità');
  });
});
