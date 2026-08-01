import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCurriculumStore } from '../store/useCurriculumStore';
import { createEmptyDocumentArchive } from '../domain/documents';
import { createEmptyInstitutionalArchive } from '../domain/institution';
import {
  createEmptyRevisionArchive,
  createProposal,
  createInitialProposalVersion,
} from '../domain/revision';
import { createEntityReference, type EntityId } from '../domain/curriculum/identity';
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

function buildRevisionArchive() {
  const archive = createEmptyRevisionArchive();
  const proposal = createProposal({
    targetNodeRef: createEntityReference('node-1' as EntityId, 'curriculum-node', 'Obiettivo 1'),
    curriculumVersionRef: createEntityReference('cv-1' as EntityId, 'curriculum-version'),
    currentTextSnapshot: 'Testo vigente',
    proposedText: 'Testo proposto',
    rationale: 'Motivazione della proposta',
    sourceRefs: [createEntityReference('src-1' as EntityId, 'source', 'Rapporto di dipartimento')],
  });
  const version = createInitialProposalVersion(proposal, {
    currentTextSnapshot: 'Testo vigente',
    proposedText: 'Testo proposto',
    rationale: 'Motivazione della proposta',
  });
  archive.proposals.push({ ...proposal, status: 'accepted-for-decision', currentVersionRef: version.id });
  archive.versions.push(version);
  return archive;
}

function resetStore() {
  useCurriculumStore.setState({
    savedUda: [uda],
    documentArchive: createEmptyDocumentArchive(),
    institutionalArchive: createEmptyInstitutionalArchive(),
    revisionArchive: buildRevisionArchive(),
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

  it('creates a revision-proposal document from a saved proposal and persists it', () => {
    const proposalId = useCurriculumStore.getState().revisionArchive.proposals[0].id;
    const { result } = renderHook(() => useDocumentProduction());

    let outcome: ReturnType<typeof result.current.createDocumentFromProposal> | undefined;
    act(() => {
      outcome = result.current.createDocumentFromProposal(proposalId);
    });

    expect(outcome?.status).toBe('created');
    expect(getDocumentList(useCurriculumStore.getState().documentArchive).length).toBe(1);

    let again: ReturnType<typeof result.current.createDocumentFromProposal> | undefined;
    act(() => {
      again = result.current.createDocumentFromProposal(proposalId);
    });
    expect(again?.status).toBe('already-exists');
  });

  it('refuses a rejected proposal and leaves the store archive untouched', () => {
    const proposalId = useCurriculumStore.getState().revisionArchive.proposals[0].id;
    useCurriculumStore.setState((state) => ({
      revisionArchive: {
        ...state.revisionArchive,
        proposals: state.revisionArchive.proposals.map((p) =>
          p.id === proposalId ? { ...p, status: 'rejected' as const } : p,
        ),
      },
    }));

    const { result } = renderHook(() => useDocumentProduction());
    let outcome: ReturnType<typeof result.current.createDocumentFromProposal> | undefined;
    act(() => {
      outcome = result.current.createDocumentFromProposal(proposalId);
    });

    expect(outcome?.status).toBe('revision-not-transferable');
    expect(getDocumentList(useCurriculumStore.getState().documentArchive).length).toBe(0);
  });
});
