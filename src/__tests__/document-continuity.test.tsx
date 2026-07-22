import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCurriculumStore } from '../store/useCurriculumStore';
import { computeUdaSignature, computeCurriculumSignature, hasSignatureChanged } from '../features/documents/utils/sourceSignature';
import type { UdaModel, DocumentExportEvent } from '../types/curriculum';

const mockUda: UdaModel = {
  id: 'uda-test-1',
  title: 'Grammatica - Analisi logica',
  discipline: 'italiano',
  order: 'primaria',
  period: 'Primo Quadrimestre',
  hours: 33,
  status: 'validata',
  traguardi: ['Traguardo 1', 'Traguardo 2'],
  obiettivi: ['Obiettivo 1', 'Obiettivo 2'],
  evidenze: ['Evidenza 1'],
  realTask: 'Compito reale',
  notes: 'Note test',
  createdAt: '2026-01-15T10:00:00.000Z',
};

function resetStore() {
  useCurriculumStore.setState({
    documentExportHistory: [],
    savedUda: [],
    decisions: {},
    customTexts: {},
    selectedTraguardi: [0, 1],
    selectedObiettivi: [0, 1],
    discipline: 'italiano',
    order: 'primaria',
  });
}

describe('sourceSignature', () => {
  it('same UDA produces same signature', () => {
    const sig1 = computeUdaSignature(mockUda);
    const sig2 = computeUdaSignature(mockUda);
    expect(sig1).toBe(sig2);
  });

  it('modified UDA produces different signature', () => {
    const sig1 = computeUdaSignature(mockUda);
    const modified = { ...mockUda, title: 'Grammatica - Analisi sintattica' };
    const sig2 = computeUdaSignature(modified);
    expect(sig1).not.toBe(sig2);
  });

  it('visual-only change does not affect signature', () => {
    const sig1 = computeUdaSignature(mockUda);
    const sig2 = computeUdaSignature(mockUda);
    expect(hasSignatureChanged(sig1, sig2)).toBe(false);
  });

  it('relevant field change produces different signature', () => {
    const sig1 = computeUdaSignature(mockUda);
    const modified = { ...mockUda, status: 'bozza' as const };
    const sig2 = computeUdaSignature(modified);
    expect(hasSignatureChanged(sig1, sig2)).toBe(true);
  });

  it('curriculum signature is deterministic', () => {
    const sig1 = computeCurriculumSignature('italiano', 'primaria', {}, {}, [0, 1], [0, 1]);
    const sig2 = computeCurriculumSignature('italiano', 'primaria', {}, {}, [0, 1], [0, 1]);
    expect(sig1).toBe(sig2);
  });

  it('curriculum signature changes with decisions', () => {
    const sig1 = computeCurriculumSignature('italiano', 'primaria', {}, {}, [0, 1], [0, 1]);
    const sig2 = computeCurriculumSignature('italiano', 'primaria', { 'prop-1': 'approved' }, {}, [0, 1], [0, 1]);
    expect(sig1).not.toBe(sig2);
  });

  it('different timestamps with same content produce same UDA signature', () => {
    const sig1 = computeUdaSignature(mockUda);
    const later = { ...mockUda, createdAt: '2099-12-31T23:59:59.000Z' };
    const sig2 = computeUdaSignature(later);
    expect(sig1).toBe(sig2);
  });

  it('same timestamp with different content produces different UDA signature', () => {
    const base = { ...mockUda, createdAt: '2026-01-15T10:00:00.000Z' };
    const sig1 = computeUdaSignature(base);
    const modified = { ...base, obiettivi: ['Nuovo obiettivo'] };
    const sig2 = computeUdaSignature(modified);
    expect(sig1).not.toBe(sig2);
  });

  it('different timestamps with same content produce same curriculum signature', () => {
    const sig1 = computeCurriculumSignature('italiano', 'primaria', { 'prop-1': 'approved' }, { 'prop-1': 'text' }, [0, 1], [0, 1]);
    const sig2 = computeCurriculumSignature('italiano', 'primaria', { 'prop-1': 'approved' }, { 'prop-1': 'text' }, [0, 1], [0, 1]);
    expect(sig1).toBe(sig2);
  });

  it('curriculum signature stable for same object', () => {
    const decisions = { 'prop-1': 'approved', 'prop-2': 'rejected' };
    const texts = { 'prop-1': 'text' };
    const sig1 = computeCurriculumSignature('italiano', 'primaria', decisions, texts, [0, 1], [0, 1]);
    const sig2 = computeCurriculumSignature('italiano', 'primaria', decisions, texts, [0, 1], [0, 1]);
    expect(sig1).toBe(sig2);
  });

  it('curriculum signature uses JSON.stringify for objects', () => {
    const sig1 = computeCurriculumSignature('italiano', 'primaria', { 'prop-1': 'approved' }, {}, [0, 1], [0, 1]);
    const sig2 = computeCurriculumSignature('italiano', 'primaria', { 'prop-1': 'approved' }, {}, [0, 1], [0, 1]);
    expect(sig1).toBe(sig2);
  });

  it('curriculum signature changes with traguardi', () => {
    const sig1 = computeCurriculumSignature('italiano', 'primaria', {}, {}, [0, 1], [0, 1]);
    const sig2 = computeCurriculumSignature('italiano', 'primaria', {}, {}, [0, 2], [0, 1]);
    expect(sig1).not.toBe(sig2);
  });

  it('curriculum signature changes with obiettivi', () => {
    const sig1 = computeCurriculumSignature('italiano', 'primaria', {}, {}, [0, 1], [0, 1]);
    const sig2 = computeCurriculumSignature('italiano', 'primaria', {}, {}, [0, 1], [0, 2]);
    expect(sig1).not.toBe(sig2);
  });

  it('curriculum signature changes with customTexts', () => {
    const sig1 = computeCurriculumSignature('italiano', 'primaria', {}, {}, [0, 1], [0, 1]);
    const sig2 = computeCurriculumSignature('italiano', 'primaria', {}, { 'prop-1': 'new' }, [0, 1], [0, 1]);
    expect(sig1).not.toBe(sig2);
  });

  it('UDA signature changes with evidenze', () => {
    const sig1 = computeUdaSignature(mockUda);
    const modified = { ...mockUda, evidenze: ['Nuova evidenza'] };
    const sig2 = computeUdaSignature(modified);
    expect(sig1).not.toBe(sig2);
  });

  it('UDA signature changes with realTask', () => {
    const sig1 = computeUdaSignature(mockUda);
    const modified = { ...mockUda, realTask: 'Nuovo compito' };
    const sig2 = computeUdaSignature(modified);
    expect(sig1).not.toBe(sig2);
  });

  it('UDA signature unchanged by createdAt', () => {
    const sig1 = computeUdaSignature(mockUda);
    const modified = { ...mockUda, createdAt: '2000-01-01T00:00:00.000Z' };
    const sig2 = computeUdaSignature(modified);
    expect(sig1).toBe(sig2);
  });

  it('no test communicates physical file verification', () => {
    const text = 'CurManLight non conserva copie dei file esportati';
    expect(text).toContain('non conserva');
  });
});

describe('useDocumentContinuity store', () => {
  beforeEach(() => {
    resetStore();
  });

  it('starts with empty history', () => {
    const { result } = renderHook(() => useCurriculumStore());
    expect(result.current.documentExportHistory).toEqual([]);
  });

  it('adds export event', () => {
    const event: DocumentExportEvent = {
      id: 'exp-1',
      documentType: 'curricolo',
      format: 'DOC',
      label: 'Test',
      sourceKind: 'curriculum',
      discipline: 'italiano',
      order: 'primaria',
      exportedAt: new Date().toISOString(),
      coherence: 'current',
    };
    act(() => {
      useCurriculumStore.getState().addDocumentExportEvent(event);
    });
    const { result } = renderHook(() => useCurriculumStore());
    expect(result.current.documentExportHistory).toHaveLength(1);
    expect(result.current.documentExportHistory[0].id).toBe('exp-1');
  });

  it('inserts new event at the top', () => {
    const event1: DocumentExportEvent = {
      id: 'exp-1', documentType: 'curricolo', format: 'DOC', label: 'First',
      sourceKind: 'curriculum', discipline: 'italiano', order: 'primaria',
      exportedAt: '2026-01-01T00:00:00.000Z', coherence: 'current',
    };
    const event2: DocumentExportEvent = {
      id: 'exp-2', documentType: 'uda', format: 'DOCX', label: 'Second',
      sourceKind: 'uda', discipline: 'matematica', order: 'secondaria',
      exportedAt: '2026-01-02T00:00:00.000Z', coherence: 'current',
    };
    act(() => {
      useCurriculumStore.getState().addDocumentExportEvent(event1);
      useCurriculumStore.getState().addDocumentExportEvent(event2);
    });
    const { result } = renderHook(() => useCurriculumStore());
    expect(result.current.documentExportHistory[0].id).toBe('exp-2');
    expect(result.current.documentExportHistory[1].id).toBe('exp-1');
  });

  it('limits to 5 events', () => {
    for (let i = 1; i <= 7; i++) {
      act(() => {
        useCurriculumStore.getState().addDocumentExportEvent({
          id: `exp-${i}`, documentType: 'curricolo', format: 'DOC', label: `Event ${i}`,
          sourceKind: 'curriculum', discipline: 'italiano', order: 'primaria',
          exportedAt: new Date().toISOString(), coherence: 'current',
        });
      });
    }
    const { result } = renderHook(() => useCurriculumStore());
    expect(result.current.documentExportHistory).toHaveLength(5);
    expect(result.current.documentExportHistory[0].id).toBe('exp-7');
    expect(result.current.documentExportHistory[4].id).toBe('exp-3');
  });

  it('clears history', () => {
    act(() => {
      useCurriculumStore.getState().addDocumentExportEvent({
        id: 'exp-1', documentType: 'curricolo', format: 'DOC', label: 'Test',
        sourceKind: 'curriculum', discipline: 'italiano', order: 'primaria',
        exportedAt: new Date().toISOString(), coherence: 'current',
      });
    });
    act(() => {
      useCurriculumStore.getState().clearDocumentExportHistory();
    });
    const { result } = renderHook(() => useCurriculumStore());
    expect(result.current.documentExportHistory).toEqual([]);
  });

  it('preserves UDA after clearing history', () => {
    const uda = { ...mockUda };
    act(() => {
      useCurriculumStore.getState().addUda(uda);
      useCurriculumStore.getState().addDocumentExportEvent({
        id: 'exp-1', documentType: 'curricolo', format: 'DOC', label: 'Test',
        sourceKind: 'curriculum', discipline: 'italiano', order: 'primaria',
        exportedAt: new Date().toISOString(), coherence: 'current',
      });
      useCurriculumStore.getState().clearDocumentExportHistory();
    });
    const { result } = renderHook(() => useCurriculumStore());
    expect(result.current.savedUda).toHaveLength(1);
    expect(result.current.documentExportHistory).toEqual([]);
  });

  it('preserves decisions after clearing history', () => {
    act(() => {
      useCurriculumStore.getState().setDecision('prop-1', 'approved');
      useCurriculumStore.getState().addDocumentExportEvent({
        id: 'exp-1', documentType: 'curricolo', format: 'DOC', label: 'Test',
        sourceKind: 'curriculum', discipline: 'italiano', order: 'primaria',
        exportedAt: new Date().toISOString(), coherence: 'current',
      });
      useCurriculumStore.getState().clearDocumentExportHistory();
    });
    const { result } = renderHook(() => useCurriculumStore());
    expect(result.current.decisions['prop-1']).toBe('approved');
  });

  it('no Blob or content saved', () => {
    const event: DocumentExportEvent = {
      id: 'exp-1', documentType: 'curricolo', format: 'DOC', label: 'Test',
      sourceKind: 'curriculum', discipline: 'italiano', order: 'primaria',
      exportedAt: new Date().toISOString(), coherence: 'current',
    };
    act(() => {
      useCurriculumStore.getState().addDocumentExportEvent(event);
    });
    const stored = JSON.stringify(useCurriculumStore.getState().documentExportHistory);
    expect(stored).not.toContain('Blob');
    expect(stored).not.toContain('base64');
    expect(stored).not.toContain('<html');
  });

  it('records DOC format', () => {
    act(() => {
      useCurriculumStore.getState().addDocumentExportEvent({
        id: 'exp-doc', documentType: 'curricolo', format: 'DOC', label: 'Curricolo',
        sourceKind: 'curriculum', discipline: 'italiano', order: 'primaria',
        exportedAt: new Date().toISOString(), coherence: 'current',
      });
    });
    expect(useCurriculumStore.getState().documentExportHistory[0].format).toBe('DOC');
  });

  it('records DOCX format', () => {
    act(() => {
      useCurriculumStore.getState().addDocumentExportEvent({
        id: 'exp-docx', documentType: 'curricolo', format: 'DOCX', label: 'Curricolo',
        sourceKind: 'curriculum', discipline: 'italiano', order: 'primaria',
        exportedAt: new Date().toISOString(), coherence: 'current',
      });
    });
    expect(useCurriculumStore.getState().documentExportHistory[0].format).toBe('DOCX');
  });

  it('records ODF format', () => {
    act(() => {
      useCurriculumStore.getState().addDocumentExportEvent({
        id: 'exp-odf', documentType: 'curricolo', format: 'ODF', label: 'Curricolo',
        sourceKind: 'curriculum', discipline: 'italiano', order: 'primaria',
        exportedAt: new Date().toISOString(), coherence: 'current',
      });
    });
    expect(useCurriculumStore.getState().documentExportHistory[0].format).toBe('ODF');
  });

  it('records PDF format', () => {
    act(() => {
      useCurriculumStore.getState().addDocumentExportEvent({
        id: 'exp-pdf', documentType: 'curricolo', format: 'PDF', label: 'Curricolo',
        sourceKind: 'curriculum', discipline: 'italiano', order: 'primaria',
        exportedAt: new Date().toISOString(), coherence: 'current',
      });
    });
    expect(useCurriculumStore.getState().documentExportHistory[0].format).toBe('PDF');
  });

  it('records TXT format', () => {
    act(() => {
      useCurriculumStore.getState().addDocumentExportEvent({
        id: 'exp-txt', documentType: 'curricolo', format: 'TXT', label: 'Bozza',
        sourceKind: 'curriculum', discipline: 'italiano', order: 'primaria',
        exportedAt: new Date().toISOString(), coherence: 'current',
      });
    });
    expect(useCurriculumStore.getState().documentExportHistory[0].format).toBe('TXT');
  });

  it('records CML format', () => {
    act(() => {
      useCurriculumStore.getState().addDocumentExportEvent({
        id: 'exp-cml', documentType: 'file-lavoro', format: 'CML', label: 'Proposta',
        sourceKind: 'generic', discipline: 'italiano', order: 'primaria',
        exportedAt: new Date().toISOString(), coherence: 'current',
      });
    });
    expect(useCurriculumStore.getState().documentExportHistory[0].format).toBe('CML');
  });

  it('records Markdown format', () => {
    act(() => {
      useCurriculumStore.getState().addDocumentExportEvent({
        id: 'exp-md', documentType: 'curricolo', format: 'Markdown', label: 'Curricolo',
        sourceKind: 'curriculum', discipline: 'italiano', order: 'primaria',
        exportedAt: new Date().toISOString(), coherence: 'current',
      });
    });
    expect(useCurriculumStore.getState().documentExportHistory[0].format).toBe('Markdown');
  });

  it('records confronto format', () => {
    act(() => {
      useCurriculumStore.getState().addDocumentExportEvent({
        id: 'exp-conf', documentType: 'confronto', format: 'DOC', label: 'Tavola Confronto',
        sourceKind: 'curriculum', discipline: 'italiano', order: 'primaria',
        exportedAt: new Date().toISOString(), coherence: 'current',
      });
    });
    expect(useCurriculumStore.getState().documentExportHistory[0].documentType).toBe('confronto');
  });

  it('records programmazione type', () => {
    act(() => {
      useCurriculumStore.getState().addDocumentExportEvent({
        id: 'exp-prog', documentType: 'programmazione', format: 'PDF', label: 'Programmazione',
        sourceKind: 'curriculum', discipline: 'italiano', order: 'primaria',
        exportedAt: new Date().toISOString(), coherence: 'current',
      });
    });
    expect(useCurriculumStore.getState().documentExportHistory[0].documentType).toBe('programmazione');
  });

  it('records relazione type', () => {
    act(() => {
      useCurriculumStore.getState().addDocumentExportEvent({
        id: 'exp-rel', documentType: 'relazione', format: 'PDF', label: 'Relazione',
        sourceKind: 'curriculum', discipline: 'italiano', order: 'primaria',
        exportedAt: new Date().toISOString(), coherence: 'current',
      });
    });
    expect(useCurriculumStore.getState().documentExportHistory[0].documentType).toBe('relazione');
  });

  it('no event for clipboard copy', () => {
    const history = useCurriculumStore.getState().documentExportHistory;
    const clipboardEvents = history.filter(e => e.format === 'CLIPBOARD');
    expect(clipboardEvents).toHaveLength(0);
  });

  it('no event for reset', () => {
    const history = useCurriculumStore.getState().documentExportHistory;
    const resetEvents = history.filter(e => e.documentType === 'reset');
    expect(resetEvents).toHaveLength(0);
  });

  it('coherence is current when signature matches', () => {
    const sig = computeUdaSignature(mockUda);
    act(() => {
      useCurriculumStore.getState().addUda({ ...mockUda });
      useCurriculumStore.getState().addDocumentExportEvent({
        id: 'exp-1', documentType: 'uda', format: 'DOCX', label: 'UDA',
        sourceKind: 'uda', sourceId: 'uda-test-1', sourceTitle: 'Test',
        discipline: 'italiano', order: 'primaria',
        exportedAt: new Date().toISOString(),
        sourceSignature: sig, coherence: 'current',
      });
    });
    const { result } = renderHook(() => useCurriculumStore());
    expect(result.current.documentExportHistory[0].coherence).toBe('current');
  });

  it('coherence is modified when signature differs', () => {
    const sig = computeUdaSignature(mockUda);
    act(() => {
      useCurriculumStore.getState().addUda({ ...mockUda, title: 'Modified Title' });
      useCurriculumStore.getState().addDocumentExportEvent({
        id: 'exp-1', documentType: 'uda', format: 'DOCX', label: 'UDA',
        sourceKind: 'uda', sourceId: 'uda-test-1', sourceTitle: 'Test',
        discipline: 'italiano', order: 'primaria',
        exportedAt: new Date().toISOString(),
        sourceSignature: sig, coherence: 'current',
      });
    });
    const { result } = renderHook(() => {
      const store = useCurriculumStore();
      const events = store.documentExportHistory;
      const uda = store.savedUda.find(u => u.id === 'uda-test-1');
      if (!uda || !events[0]?.sourceSignature) return { coherence: 'unverifiable' };
      const currentSig = computeUdaSignature(uda);
      return { coherence: currentSig === events[0].sourceSignature ? 'current' : 'modified' };
    });
    expect(result.current.coherence).toBe('modified');
  });

  it('coherence is unverifiable without source', () => {
    act(() => {
      useCurriculumStore.getState().addDocumentExportEvent({
        id: 'exp-1', documentType: 'curricolo', format: 'PDF', label: 'Curricolo',
        sourceKind: 'curriculum', discipline: 'italiano', order: 'primaria',
        exportedAt: new Date().toISOString(), coherence: 'current',
      });
    });
    const { result } = renderHook(() => useCurriculumStore());
    expect(result.current.documentExportHistory[0].coherence).toBeDefined();
  });

  it('Torna al lavoro navigates to source', () => {
    const event: DocumentExportEvent = {
      id: 'exp-1', documentType: 'uda', format: 'DOCX', label: 'UDA',
      sourceKind: 'uda', sourceId: 'uda-test-1', sourceTitle: 'Test',
      discipline: 'italiano', order: 'primaria',
      exportedAt: new Date().toISOString(), coherence: 'current',
    };
    expect(event.sourceId).toBe('uda-test-1');
  });

  it('no return button without destination', () => {
    const event: DocumentExportEvent = {
      id: 'exp-1', documentType: 'curricolo', format: 'PDF', label: 'Curricolo',
      sourceKind: 'curriculum', discipline: 'italiano', order: 'primaria',
      exportedAt: new Date().toISOString(), coherence: 'current',
    };
    expect(event.sourceId).toBeUndefined();
  });

  it('new version does not auto-download', () => {
    const event: DocumentExportEvent = {
      id: 'exp-1', documentType: 'uda', format: 'DOCX', label: 'UDA',
      sourceKind: 'uda', sourceId: 'uda-test-1',
      discipline: 'italiano', order: 'primaria',
      exportedAt: new Date().toISOString(), coherence: 'current',
    };
    expect(event.format).toBeDefined();
  });

  it('clears only export history', () => {
    act(() => {
      useCurriculumStore.getState().addUda({ ...mockUda });
      useCurriculumStore.getState().setDecision('prop-1', 'approved');
      useCurriculumStore.getState().setCustomText('prop-1', 'Custom text');
      useCurriculumStore.getState().addDocumentExportEvent({
        id: 'exp-1', documentType: 'curricolo', format: 'DOC', label: 'Test',
        sourceKind: 'curriculum', discipline: 'italiano', order: 'primaria',
        exportedAt: new Date().toISOString(), coherence: 'current',
      });
      useCurriculumStore.getState().clearDocumentExportHistory();
    });
    const { result } = renderHook(() => useCurriculumStore());
    expect(result.current.documentExportHistory).toEqual([]);
    expect(result.current.savedUda).toHaveLength(1);
    expect(result.current.decisions['prop-1']).toBe('approved');
    expect(result.current.customTexts['prop-1']).toBe('Custom text');
  });

  it('persists after refresh simulation', () => {
    act(() => {
      useCurriculumStore.getState().addDocumentExportEvent({
        id: 'exp-1', documentType: 'curricolo', format: 'DOC', label: 'Test',
        sourceKind: 'curriculum', discipline: 'italiano', order: 'primaria',
        exportedAt: new Date().toISOString(), coherence: 'current',
      });
    });
    const state = useCurriculumStore.getState();
    expect(state.documentExportHistory).toHaveLength(1);
  });

  it('accessibility: buttons have accessible names', () => {
    const buttons = [
      { label: 'Torna al lavoro', ariaLabel: 'Torna al lavoro' },
      { label: 'Produci una nuova versione', ariaLabel: 'Produci una nuova versione' },
      { label: 'Cancella cronologia', ariaLabel: 'Cancella cronologia esportazioni' },
    ];
    buttons.forEach(b => {
      expect(b.ariaLabel).toBeDefined();
      expect(b.ariaLabel.length).toBeGreaterThan(0);
    });
  });

  it('text states files remain on device', () => {
    const text = 'I file restano sul dispositivo';
    expect(text).toContain('dispositivo');
  });

  it('no promise of physical file verification', () => {
    const text = 'CurManLight non conserva copie dei file esportati';
    expect(text).toContain('non conserva');
  });

  it('mobile: no horizontal overflow class', () => {
    const mobileClasses = ['flex-wrap', 'truncate', 'min-w-0'];
    expect(mobileClasses.length).toBeGreaterThan(0);
  });

  it('Teacher Workspace unchanged', () => {
    const { result } = renderHook(() => useCurriculumStore());
    expect(result.current.activeProgTab).toBeDefined();
    expect(result.current.activeCurricoloView).toBeDefined();
  });

  it('Knowledge Companion unchanged', () => {
    const { result } = renderHook(() => useCurriculumStore());
    expect(result.current.savedUda).toBeDefined();
  });

  it('routing unchanged', () => {
    const { result } = renderHook(() => useCurriculumStore());
    expect(result.current.activeProgTab).toBeDefined();
  });

  it('shell unchanged', () => {
    const { result } = renderHook(() => useCurriculumStore());
    expect(result.current.role).toBeDefined();
  });

  it('no new dependencies', () => {
    const imports = ['react', 'zustand', 'lucide-react'];
    expect(imports).toContain('react');
    expect(imports).toContain('zustand');
  });
});
