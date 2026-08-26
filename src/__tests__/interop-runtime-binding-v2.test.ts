import { describe, expect, it } from 'vitest';
import type { CurriculumMap } from '../features/session/types/appViewContracts';
import {
  createDecision,
  createDecisionAuthority,
  createEmptyRevisionArchive,
  createInitialProposalVersion,
  createProposal,
} from '../domain/revision';
import { createEntityReference, generateDeterministicId } from '../domain/curriculum/identity';
import {
  createCmlLocalHandoffV2FromArenaRuntime,
  projectArenaRuntimeCurriculumV2,
} from '../domain/transfer/interopRuntimeBindingV2';
import { validateCmlLocalHandoffV2 } from '../domain/transfer/interopCurriculumContextV2';

const emptyLevel = () => ({ traguardi: [], obiettivi: [], proposte: undefined, proposals: [], evidenze: [], nucleiFondanti: [] });

function curriculumMap(): CurriculumMap {
  return {
    tecnologia: {
      infanzia: emptyLevel(),
      primaria: emptyLevel(),
      secondaria: {
        traguardi: ['Progettare soluzioni tecnologiche in modo consapevole.'],
        obiettivi: ['Analizzare materiali, processi e sistemi tecnologici.'],
        evidenze: ['Documentare il processo di progettazione.'],
        nucleiFondanti: ['Materiali e trasformazioni'],
        proposals: [
          {
            id: 'transition-tech-001',
            focus: 'Raccordo transitorio',
            oldText: 'Contenuto IN2012 da raccordare.',
            newText: 'Integrare progressivamente progettazione digitale e informatica nel percorso della coorte.',
            notes: 'Ipotesi per la transizione IN2012 → IN2025.',
          },
        ],
      },
    },
  };
}

function baseInput() {
  return {
    institutionId: 'school-demo',
    schoolYearRef: '2026-2027',
    schoolOrder: 'secondaria' as const,
    classLevel: 1,
    sectionRef: 'section-A',
    disciplineRef: 'tecnologia',
    curriculumMap: curriculumMap(),
    revisionArchive: createEmptyRevisionArchive('2026-08-26T10:00:00.000Z'),
    sourceVersion: 'arena-test-runtime',
    emittedAt: '2026-08-26T14:00:00.000Z',
  };
}

describe('CML interop v2 runtime binding', () => {
  it('projects the current Arena curriculum into a complete provisional IN2025 context for first grade', () => {
    const projection = projectArenaRuntimeCurriculumV2(baseInput());

    expect(projection.curricularContext.curriculumState).toBe('PROVISIONAL_COMPLETE');
    expect(projection.curricularContext.applicabilityStatus).toBe('APPLICABLE');
    expect(projection.curricularContext.transitionRemodulation.state).toBe('NOT_REQUIRED');
    expect(projection.curricularContext.requirements.some(r => r.kind === 'COMPETENCE' && r.coverageRequired)).toBe(true);
    expect(projection.curricularContext.requirements.some(r => r.kind === 'SPECIFIC_LEARNING_OBJECTIVE' && r.coverageRequired)).toBe(true);
    expect(projection.annualPlanningFramework.payload.periods[0].periodId).toBe('annual');
    expect(projection.annualPlanningFramework.payload.constraints.some(c => c.id === 'provisional-baseline-revalidation')).toBe(true);
  });

  it('projects a legacy cohort as TRANSITIONAL and builds a non-approved remodulation hypothesis', () => {
    const projection = projectArenaRuntimeCurriculumV2({ ...baseInput(), classLevel: 2 });

    expect(projection.curricularContext.applicabilityStatus).toBe('TRANSITIONAL');
    expect(projection.curricularContext.transitionRemodulation.state).toBe('HYPOTHESIS');
    expect(projection.curricularContext.transitionRemodulation.institutionallyApproved).toBe(false);
    expect(projection.curricularContext.transitionRemodulation.usableForPlanning).toBe(true);
    expect(projection.curricularContext.requirements.some(r => r.authorityLevel === 'TRANSITION_REQUIRED' && r.coverageRequired)).toBe(true);
  });

  it('does not promote revision workflow data to APPROVED curriculum state', () => {
    const archive = createEmptyRevisionArchive('2026-08-26T10:00:00.000Z');
    const proposal = createProposal({
      targetNodeRef: createEntityReference(generateDeterministicId('node-1'), 'curriculum-node'),
      curriculumVersionRef: createEntityReference(generateDeterministicId('curriculum-v1'), 'curriculum-version'),
      currentTextSnapshot: 'Contenuto IN2012 da raccordare.',
      proposedText: 'Testo approvato localmente dalla proposta.',
      rationale: 'Raccordo transitorio.',
      origin: 'institute',
    }, '2026-08-26T10:00:00.000Z');
    const version = createInitialProposalVersion(proposal, {
      currentTextSnapshot: proposal.currentTextSnapshot,
      proposedText: proposal.proposedText,
      rationale: proposal.rationale,
    }, '2026-08-26T10:00:00.000Z');
    proposal.status = 'accepted-for-decision';
    proposal.currentVersionRef = version.id;

    const decision = createDecision({
      proposalRef: createEntityReference(proposal.id, 'revision-proposal'),
      proposalVersionRef: createEntityReference(version.id, 'revision-proposal'),
      outcome: 'approve',
      rationale: 'Decisione registrata nel workflow locale.',
      authority: createDecisionAuthority('collegio-docenti'),
      decidedAt: '2026-08-26T11:00:00.000Z',
      origin: 'institute',
    }, '2026-08-26T11:00:00.000Z');
    decision.status = 'recorded-local';

    archive.proposals.push(proposal);
    archive.versions.push(version);
    archive.decisions.push(decision);

    const projection = projectArenaRuntimeCurriculumV2({ ...baseInput(), classLevel: 2, revisionArchive: archive });

    expect(projection.curricularContext.curriculumState).toBe('PROVISIONAL_COMPLETE');
    expect(projection.curricularContext.approvalDecisionRef).toBeUndefined();
    expect(projection.curricularContext.requirements.some(r => r.description === proposal.proposedText)).toBe(true);
  });

  it('honours an explicit rejection in the revision process without inventing a replacement requirement', () => {
    const archive = createEmptyRevisionArchive('2026-08-26T10:00:00.000Z');
    const proposal = createProposal({
      targetNodeRef: createEntityReference(generateDeterministicId('node-2'), 'curriculum-node'),
      curriculumVersionRef: createEntityReference(generateDeterministicId('curriculum-v2'), 'curriculum-version'),
      currentTextSnapshot: 'Contenuto IN2012 da raccordare.',
      proposedText: 'Proposta da non utilizzare.',
      origin: 'institute',
    }, '2026-08-26T10:00:00.000Z');
    const version = createInitialProposalVersion(proposal, {
      currentTextSnapshot: proposal.currentTextSnapshot,
      proposedText: proposal.proposedText,
    }, '2026-08-26T10:00:00.000Z');
    proposal.currentVersionRef = version.id;
    const decision = createDecision({
      proposalRef: createEntityReference(proposal.id, 'revision-proposal'),
      proposalVersionRef: createEntityReference(version.id, 'revision-proposal'),
      outcome: 'reject',
      authority: createDecisionAuthority('collegio-docenti'),
      origin: 'institute',
    }, '2026-08-26T11:00:00.000Z');
    decision.status = 'recorded-local';
    archive.proposals.push(proposal);
    archive.versions.push(version);
    archive.decisions.push(decision);

    const projection = projectArenaRuntimeCurriculumV2({ ...baseInput(), classLevel: 2, revisionArchive: archive });

    expect(projection.curricularContext.requirements.some(r => r.description === proposal.proposedText)).toBe(false);
    expect(projection.curricularContext.transitionRemodulation.state).toBe('HYPOTHESIS');
    expect(projection.curricularContext.transitionRemodulation.affectedRequirementIds).toHaveLength(0);
  });

  it('creates a handoff v2 that passes the canonical validator', () => {
    const handoff = createCmlLocalHandoffV2FromArenaRuntime(baseInput());
    expect(validateCmlLocalHandoffV2(handoff)).toEqual({ valid: true, errors: [] });
  });

  it('refuses to call an empty curriculum complete for planning', () => {
    const map = curriculumMap();
    map.tecnologia.secondaria = emptyLevel();
    expect(() => projectArenaRuntimeCurriculumV2({ ...baseInput(), curriculumMap: map })).toThrow(
      'Arena runtime binding refuses to mark an empty curriculum as completeForPlanning.',
    );
  });
});
