import { describe, expect, it } from 'vitest';
import type { EntityId, EntityReference } from '../domain/curriculum/identity/types';
import {
  evaluateHumanTaskCognitiveGate,
  type ArenaHumanTaskProjection,
  type HumanTaskStakeholder,
} from '../features/guided-workflow/humanTask';

const ref = (id: string, entityType: EntityReference['entityType']): EntityReference => ({
  id: id as EntityId,
  entityType,
  snapshotLabel: id,
});

const requiredStakeholders: readonly HumanTaskStakeholder[] = [
  'docente',
  'dipartimento',
  'referente',
  'sistema',
];

const validProjection = (): ArenaHumanTaskProjection => ({
  id: 'human-task-revision-1',
  stage: 'revision',
  title: 'Controlla la proposta di revisione',
  goal: 'Verificare il raccordo tra il curricolo corrente e la proposta prima della decisione.',
  stateLabel: 'Da controllare',
  sourceRefs: [
    ref('curriculum-1', 'curriculum-version'),
    ref('proposal-1', 'revision-proposal'),
  ],
  evidence: [
    {
      id: 'current-text',
      label: 'Testo curricolare corrente',
      origin: 'canonical',
      sourceRef: ref('curriculum-1', 'curriculum-version'),
    },
    {
      id: 'proposal-diff',
      label: 'Differenze introdotte dalla proposta',
      origin: 'canonical',
      sourceRef: ref('proposal-1', 'revision-proposal'),
    },
    {
      id: 'decision-boundary',
      label: 'La decisione finale resta umana',
      origin: 'system-derived',
    },
  ],
  stakeholderRequirements: [
    {
      stakeholder: 'docente',
      responsibility: 'Comprendere cosa cambia nella proposta e quali parti richiedono confronto.',
      evidenceRefs: ['current-text', 'proposal-diff'],
    },
    {
      stakeholder: 'dipartimento',
      responsibility: 'Confrontare la proposta con il riferimento curricolare senza ricostruire il contesto.',
      evidenceRefs: ['current-text', 'proposal-diff'],
    },
    {
      stakeholder: 'referente',
      responsibility: 'Verificare provenienza, stato e completezza prima del passaggio decisionale.',
      evidenceRefs: ['current-text', 'proposal-diff'],
    },
    {
      stakeholder: 'sistema',
      responsibility: 'Esporre evidenze e limiti senza assumere la decisione istituzionale.',
      evidenceRefs: ['decision-boundary'],
    },
  ],
  primaryAction: {
    label: 'Invia al confronto',
    capability: 'REVISION_REVIEW',
    responsibleStakeholder: 'referente',
    humanConfirmationRequired: true,
  },
  nextStepLabel: 'Decisione collegiale',
});

describe('Arena Human Task cognitive gate', () => {
  it('promuove una proiezione quando ogni stakeholder dispone di responsabilità ed evidenze verificabili', () => {
    const receipt = evaluateHumanTaskCognitiveGate(validProjection(), requiredStakeholders);

    expect(receipt.status).toBe('SATISFIED');
    expect(receipt.issues).toEqual([]);
    expect(receipt.checkedStakeholders).toEqual(requiredStakeholders);
  });

  it('fallisce chiusa quando manca uno stakeholder richiesto', () => {
    const projection = validProjection();
    projection.stakeholderRequirements = projection.stakeholderRequirements.filter(
      (item) => item.stakeholder !== 'dipartimento'
    );

    const receipt = evaluateHumanTaskCognitiveGate(projection, requiredStakeholders);

    expect(receipt.status).toBe('BLOCKED');
    expect(receipt.issues).toContainEqual(
      expect.objectContaining({
        code: 'MISSING_REQUIRED_STAKEHOLDER',
        stakeholder: 'dipartimento',
      })
    );
  });

  it('rifiuta evidenze dichiarate ma non presenti nella proiezione', () => {
    const projection = validProjection();
    projection.stakeholderRequirements = projection.stakeholderRequirements.map((item) =>
      item.stakeholder === 'referente'
        ? { ...item, evidenceRefs: ['evidence-not-present'] }
        : item
    );

    const receipt = evaluateHumanTaskCognitiveGate(projection, requiredStakeholders);

    expect(receipt.status).toBe('BLOCKED');
    expect(receipt.issues).toContainEqual(
      expect.objectContaining({
        code: 'UNKNOWN_EVIDENCE_REFERENCE',
        stakeholder: 'referente',
      })
    );
  });

  it('richiede almeno una fonte canonica per la proiezione', () => {
    const projection = validProjection();
    projection.sourceRefs = [];

    const receipt = evaluateHumanTaskCognitiveGate(projection, requiredStakeholders);

    expect(receipt.status).toBe('BLOCKED');
    expect(receipt.issues).toContainEqual(
      expect.objectContaining({ code: 'MISSING_CANONICAL_SOURCE' })
    );
  });

  it('impedisce al sistema di assumere una decisione istituzionale', () => {
    const projection = validProjection();
    projection.stage = 'decision';
    projection.primaryAction = {
      label: 'Approva revisione',
      capability: 'REVISION_DECIDE',
      responsibleStakeholder: 'sistema',
      humanConfirmationRequired: true,
    };

    const receipt = evaluateHumanTaskCognitiveGate(projection, requiredStakeholders);

    expect(receipt.status).toBe('BLOCKED');
    expect(receipt.issues).toContainEqual(
      expect.objectContaining({ code: 'SYSTEM_CANNOT_DECIDE' })
    );
  });

  it('impedisce decisioni istituzionali senza conferma umana esplicita', () => {
    const projection = validProjection();
    projection.stage = 'decision';
    projection.primaryAction = {
      label: 'Approva revisione',
      capability: 'REVISION_DECIDE',
      responsibleStakeholder: 'collegio',
      humanConfirmationRequired: false,
    };

    const receipt = evaluateHumanTaskCognitiveGate(projection, requiredStakeholders);

    expect(receipt.status).toBe('BLOCKED');
    expect(receipt.issues).toContainEqual(
      expect.objectContaining({ code: 'DECISION_REQUIRES_HUMAN_CONFIRMATION' })
    );
  });
});
