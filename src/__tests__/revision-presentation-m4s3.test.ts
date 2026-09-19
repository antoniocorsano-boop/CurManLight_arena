import { describe, expect, it } from 'vitest';
import type { Proposal } from '../types/curriculum';
import {
  createEmptyRevisionStore,
  getRevisionPresentationState,
  migrateLegacyRevisionPresentation,
  projectRevisionPresentationLegacyState,
  recordRevisionPresentationChoice,
  resetRevisionPresentationChoice,
} from '../domain/revision';

const proposal: Proposal = {
  id: 'p-technology-1',
  focus: 'Cultura tecnica e sistemi',
  oldText: 'Testo precedente',
  newText: 'Testo proposto',
  notes: 'Confronto curricolare',
};

const context = {
  discipline: 'tecnologia',
  order: 'secondaria' as const,
  academicYear: '2026/2027',
};

describe('M4-S3 revision presentation convergence', () => {
  it('migrates legacy choices without promoting their authority', () => {
    const migrated = migrateLegacyRevisionPresentation({
      archive: createEmptyRevisionStore('2026-09-19T08:00:00.000Z'),
      proposals: [proposal],
      legacy: {
        decisions: { [proposal.id]: 'approved' },
        customTexts: {},
      },
      context,
      now: '2026-09-19T08:01:00.000Z',
    });

    const state = getRevisionPresentationState(migrated, proposal, context);
    expect(state).toMatchObject({
      choice: 'confirm-proposal',
      prepared: true,
      source: 'legacy',
    });
    expect(migrated.decisions).toHaveLength(1);
    expect(migrated.decisions[0].status).toBe('legacy');
  });

  it('is idempotent when the same legacy state is migrated again', () => {
    const first = migrateLegacyRevisionPresentation({
      archive: createEmptyRevisionStore('2026-09-19T08:00:00.000Z'),
      proposals: [proposal],
      legacy: {
        decisions: { [proposal.id]: 'custom' },
        customTexts: { [proposal.id]: 'Testo personalizzato' },
      },
      context,
      now: '2026-09-19T08:01:00.000Z',
    });
    const second = migrateLegacyRevisionPresentation({
      archive: first,
      proposals: [proposal],
      legacy: {
        decisions: { [proposal.id]: 'custom' },
        customTexts: { [proposal.id]: 'Testo personalizzato' },
      },
      context,
      now: '2026-09-19T08:02:00.000Z',
    });

    expect(second.proposals).toHaveLength(first.proposals.length);
    expect(second.decisions).toHaveLength(first.decisions.length);
    expect(getRevisionPresentationState(second, proposal, context)).toMatchObject({
      choice: 'propose-change',
      customText: 'Testo personalizzato',
      source: 'legacy',
    });
  });

  it('records a new human action as canonical recorded-local state', () => {
    const migrated = migrateLegacyRevisionPresentation({
      archive: createEmptyRevisionStore('2026-09-19T08:00:00.000Z'),
      proposals: [proposal],
      legacy: {
        decisions: { [proposal.id]: 'approved' },
        customTexts: {},
      },
      context,
      now: '2026-09-19T08:01:00.000Z',
    });
    const updated = recordRevisionPresentationChoice({
      archive: migrated,
      proposal,
      context,
      choice: 'propose-change',
      customText: 'Nuova formulazione del docente',
      now: '2026-09-19T08:03:00.000Z',
    });

    expect(getRevisionPresentationState(updated, proposal, context)).toMatchObject({
      choice: 'propose-change',
      customText: 'Nuova formulazione del docente',
      prepared: true,
      source: 'canonical',
    });
    expect(updated.decisions.some((decision) => decision.status === 'legacy')).toBe(true);
    expect(updated.decisions.some((decision) => decision.status === 'recorded-local')).toBe(true);
  });

  it('reopens a migrated legacy choice without deleting its history', () => {
    const migrated = migrateLegacyRevisionPresentation({
      archive: createEmptyRevisionStore('2026-09-19T08:00:00.000Z'),
      proposals: [proposal],
      legacy: {
        decisions: { [proposal.id]: 'rejected' },
        customTexts: {},
      },
      context,
      now: '2026-09-19T08:01:00.000Z',
    });
    const reopened = resetRevisionPresentationChoice({
      archive: migrated,
      proposal,
      context,
      now: '2026-09-19T08:04:00.000Z',
    });

    expect(getRevisionPresentationState(reopened, proposal, context)).toMatchObject({
      choice: null,
      prepared: false,
      source: 'canonical',
    });
    expect(reopened.decisions.some((decision) => decision.status === 'legacy')).toBe(true);
    expect(reopened.decisions.some((decision) => decision.outcome === 'defer' && decision.status === 'recorded-local')).toBe(true);
  });
  it('projects canonical state over stale legacy compatibility fields', () => {
    const migrated = migrateLegacyRevisionPresentation({
      archive: createEmptyRevisionStore('2026-09-19T08:00:00.000Z'),
      proposals: [proposal],
      legacy: {
        decisions: { [proposal.id]: 'approved' },
        customTexts: {},
      },
      context,
      now: '2026-09-19T08:01:00.000Z',
    });
    const canonical = recordRevisionPresentationChoice({
      archive: migrated,
      proposal,
      context,
      choice: 'keep-previous',
      now: '2026-09-19T08:02:00.000Z',
    });

    expect(projectRevisionPresentationLegacyState({
      archive: canonical,
      proposals: [proposal],
      context,
      legacy: {
        decisions: { [proposal.id]: 'approved' },
        customTexts: {},
      },
    })).toEqual({
      decisions: { [proposal.id]: 'rejected' },
      customTexts: {},
    });
  });

  it('does not resurrect legacy compatibility state after canonical reopening', () => {
    const migrated = migrateLegacyRevisionPresentation({
      archive: createEmptyRevisionStore('2026-09-19T08:00:00.000Z'),
      proposals: [proposal],
      legacy: {
        decisions: { [proposal.id]: 'approved' },
        customTexts: {},
      },
      context,
      now: '2026-09-19T08:01:00.000Z',
    });
    const reopened = resetRevisionPresentationChoice({
      archive: migrated,
      proposal,
      context,
      now: '2026-09-19T08:02:00.000Z',
    });

    expect(projectRevisionPresentationLegacyState({
      archive: reopened,
      proposals: [proposal],
      context,
      legacy: {
        decisions: { [proposal.id]: 'approved' },
        customTexts: {},
      },
    })).toEqual({ decisions: {}, customTexts: {} });
  });

  it('keeps a completed personal choice visible when the presentation context key changes', () => {
    const authenticatedContext = {
      ...context,
      academicYear: '2026/2027',
    };
    const localContext = {
      ...context,
      academicYear: '',
    };
    const recorded = recordRevisionPresentationChoice({
      archive: createEmptyRevisionStore('2026-09-19T08:00:00.000Z'),
      proposal,
      context: authenticatedContext,
      choice: 'confirm-proposal',
      now: '2026-09-19T08:01:00.000Z',
    });

    expect(getRevisionPresentationState(recorded, proposal, authenticatedContext)).toMatchObject({
      choice: 'confirm-proposal',
      prepared: true,
      source: 'canonical',
    });
    expect(getRevisionPresentationState(recorded, proposal, localContext)).toMatchObject({
      choice: 'confirm-proposal',
      prepared: true,
      source: 'canonical',
    });
  });

  it('reopening through a new context masks the portable prior choice without deleting history', () => {
    const authenticatedContext = {
      ...context,
      academicYear: '2026/2027',
    };
    const localContext = {
      ...context,
      academicYear: '',
    };
    const recorded = recordRevisionPresentationChoice({
      archive: createEmptyRevisionStore('2026-09-19T08:00:00.000Z'),
      proposal,
      context: authenticatedContext,
      choice: 'keep-previous',
      now: '2026-09-19T08:01:00.000Z',
    });
    const reopened = resetRevisionPresentationChoice({
      archive: recorded,
      proposal,
      context: localContext,
      now: '2026-09-19T08:02:00.000Z',
    });

    expect(getRevisionPresentationState(reopened, proposal, localContext)).toMatchObject({
      choice: null,
      prepared: false,
      source: 'canonical',
    });
    expect(reopened.decisions.some((decision) => decision.outcome === 'reject')).toBe(true);
    expect(reopened.decisions.some((decision) => decision.outcome === 'defer' && decision.status === 'recorded-local')).toBe(true);
  });

});
