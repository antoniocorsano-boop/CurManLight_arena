import { describe, expect, it } from 'vitest';
import type { EntityId, EntityReference } from '../domain/curriculum/identity/types';
import type { RevisionProposal } from '../domain/revision';
import { evaluateRevisionHumanTask } from '../features/guided-workflow/revisionHumanTask';

const ref = (id: string, entityType: EntityReference['entityType']): EntityReference => ({
  id: id as EntityId,
  entityType,
  snapshotLabel: id,
});

const proposal = (overrides: Partial<RevisionProposal> = {}): RevisionProposal => ({
  id: 'proposal-1' as EntityId,
  metadata: {
    id: 'proposal-1' as EntityId,
    createdAt: '2026-08-24T06:00:00.000Z',
    updatedAt: '2026-08-24T06:00:00.000Z',
    origin: 'teacher',
    schemaVersion: 1 as never,
  },
  targetNodeRef: ref('node-1', 'curriculum-node'),
  curriculumVersionRef: ref('curriculum-1', 'curriculum-version'),
  currentTextSnapshot: 'Testo vigente',
  proposedText: 'Testo proposto',
  rationale: 'Motivazione verificabile',
  evidenceRefs: [],
  sourceRefs: [],
  status: 'draft',
  currentVersionRef: 'proposal-version-1' as EntityId,
  decisionRefs: [],
  ...overrides,
});

describe('revision Human Task projection', () => {
  it('usa il riferimento curricolare come fonte canonica anche senza sourceRefs aggiuntivi', () => {
    const { projection, receipt } = evaluateRevisionHumanTask(proposal());

    expect(projection.sourceRefs).toHaveLength(1);
    expect(projection.sourceRefs[0].entityType).toBe('curriculum-version');
    expect(receipt.status).toBe('SATISFIED');
  });

  it('blocca una bozza senza motivazione invece di presentarla come pronta', () => {
    const { projection, receipt } = evaluateRevisionHumanTask(proposal({ rationale: '' }));

    expect(projection.stateLabel).toBe('Da completare');
    expect(receipt.status).toBe('BLOCKED');
    expect(receipt.issues).toContainEqual(
      expect.objectContaining({
        code: 'UNKNOWN_EVIDENCE_REFERENCE',
        stakeholder: 'docente',
      })
    );
  });

  it('rende il referente responsabile quando la proposta è stata inviata', () => {
    const { projection, receipt } = evaluateRevisionHumanTask(proposal({ status: 'submitted' }));

    expect(projection.primaryAction.label).toBe('Prendi in carico');
    expect(projection.primaryAction.responsibleStakeholder).toBe('referente');
    expect(receipt.status).toBe('SATISFIED');
  });

  it('mantiene la decisione finale nel perimetro umano del collegio', () => {
    const { projection, receipt } = evaluateRevisionHumanTask(
      proposal({ status: 'accepted-for-decision' })
    );

    expect(projection.stage).toBe('decision');
    expect(projection.primaryAction.capability).toBe('REVISION_DECIDE');
    expect(projection.primaryAction.responsibleStakeholder).toBe('collegio');
    expect(projection.primaryAction.humanConfirmationRequired).toBe(true);
    expect(receipt.status).toBe('SATISFIED');
  });
});
