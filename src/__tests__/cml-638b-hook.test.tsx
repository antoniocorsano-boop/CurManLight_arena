import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCurriculumStore } from '../store/useCurriculumStore';
import { createEmptyDocumentArchive } from '../domain/documents';
import { createEmptyInstitutionalArchive } from '../domain/institution';
import { useDocumentProduction } from '../features/documents/hooks/useDocumentProduction';
import { getDocumentList } from '../domain/documents/selectors';
import type { UdaModel } from '../types/curriculum';

const uda: UdaModel = {
  id: 'uda-hook-1',
  title: 'Energia e sostenibilità',
  discipline: 'scienze',
  order: 'primaria',
  period: 'Secondo Quadrimestre',
  hours: 10,
  status: 'bozza',
  traguardi: ['Osservare fenomeni'],
  obiettivi: ['Descrivere trasformazioni'],
  evidenze: ['Raccoglie dati'],
  realTask: 'Diario di classe',
  notes: '',
  createdAt: '2026-07-01T09:00:00.000Z',
};

function resetStore() {
  useCurriculumStore.setState({
    savedUda: [uda],
    documentArchive: createEmptyDocumentArchive(),
    institutionalArchive: createEmptyInstitutionalArchive(),
  });
}

describe('CML-638B useDocumentProduction hook', () => {
  beforeEach(() => {
    resetStore();
  });

  it('returns uda-not-found for an unknown id and leaves the archive untouched', () => {
    const { result } = renderHook(() => useDocumentProduction());

    let outcome: ReturnType<typeof result.current.createDocumentFromUda> | undefined;
    act(() => {
      outcome = result.current.createDocumentFromUda('uda-sconosciuta');
    });

    expect(outcome?.status).toBe('uda-not-found');
    expect(getDocumentList(useCurriculumStore.getState().documentArchive).length).toBe(0);
  });

  it('creates a document from a saved UDA and persists it in the store archive', () => {
    const { result } = renderHook(() => useDocumentProduction());

    let outcome: ReturnType<typeof result.current.createDocumentFromUda> | undefined;
    act(() => {
      outcome = result.current.createDocumentFromUda('uda-hook-1');
    });

    expect(outcome?.status).toBe('created');
    expect(getDocumentList(useCurriculumStore.getState().documentArchive).length).toBe(1);

    let second: ReturnType<typeof result.current.createDocumentFromUda> | undefined;
    act(() => {
      second = result.current.createDocumentFromUda('uda-hook-1');
    });

    expect(second?.status).toBe('already-exists');
    expect(getDocumentList(useCurriculumStore.getState().documentArchive).length).toBe(1);
  });
});
