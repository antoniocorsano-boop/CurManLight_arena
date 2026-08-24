import type { EntityReference } from '../../domain/curriculum/identity/types';
import type { InstitutionalRole } from '../../domain/curriculum/types';

/**
 * Arena Human Task contract.
 *
 * A Human Task projection is a read model over canonical domain state. It must
 * never become a second source of curriculum, revision, decision or document
 * truth. The projection exists only to make the current human responsibility,
 * evidence and next action understandable.
 */

export type HumanTaskStage =
  | 'curriculum'
  | 'revision'
  | 'decision'
  | 'document';

export type HumanTaskStakeholder = InstitutionalRole | 'sistema';

export type HumanTaskCapability =
  | 'CURRICULUM_READ'
  | 'CURRICULUM_PROPOSE'
  | 'REVISION_REVIEW'
  | 'REVISION_DECIDE'
  | 'DOCUMENT_PREPARE'
  | 'DOCUMENT_EXPORT';

export type HumanTaskEvidenceOrigin =
  | 'canonical'
  | 'human'
  | 'system-derived';

export interface HumanTaskEvidence {
  id: string;
  label: string;
  origin: HumanTaskEvidenceOrigin;
  sourceRef?: EntityReference;
}

export interface HumanTaskStakeholderRequirement {
  stakeholder: HumanTaskStakeholder;
  /** What this stakeholder must be able to understand or do. */
  responsibility: string;
  /** Evidence identifiers that make the responsibility verifiable. */
  evidenceRefs: readonly string[];
}

export interface HumanTaskPrimaryAction {
  label: string;
  capability: HumanTaskCapability;
  responsibleStakeholder: HumanTaskStakeholder;
  /** Institutional decisions must always remain explicitly human-confirmed. */
  humanConfirmationRequired: boolean;
}

export interface ArenaHumanTaskProjection {
  id: string;
  stage: HumanTaskStage;
  title: string;
  goal: string;
  stateLabel: string;
  sourceRefs: readonly EntityReference[];
  evidence: readonly HumanTaskEvidence[];
  stakeholderRequirements: readonly HumanTaskStakeholderRequirement[];
  primaryAction: HumanTaskPrimaryAction;
  nextStepLabel?: string;
}

export type HumanTaskGateIssueCode =
  | 'MISSING_REQUIRED_STAKEHOLDER'
  | 'MISSING_STAKEHOLDER_RESPONSIBILITY'
  | 'MISSING_STAKEHOLDER_EVIDENCE'
  | 'UNKNOWN_EVIDENCE_REFERENCE'
  | 'MISSING_CANONICAL_SOURCE'
  | 'SYSTEM_CANNOT_DECIDE'
  | 'DECISION_REQUIRES_HUMAN_CONFIRMATION';

export interface HumanTaskGateIssue {
  code: HumanTaskGateIssueCode;
  stakeholder?: HumanTaskStakeholder;
  message: string;
}

export interface HumanTaskCognitiveReceipt {
  status: 'SATISFIED' | 'BLOCKED';
  checkedStakeholders: readonly HumanTaskStakeholder[];
  issues: readonly HumanTaskGateIssue[];
  note: string;
}

const INSTITUTIONAL_DECISION_CAPABILITIES: readonly HumanTaskCapability[] = [
  'REVISION_DECIDE',
];

const unique = <T,>(values: readonly T[]): T[] => [...new Set(values)];

/**
 * Deterministic cognitive gate inspired by the Human Task model used in
 * DOCENTE OS. It fails closed when a required stakeholder would have to infer
 * its responsibility or provenance from hidden implementation details.
 */
export const evaluateHumanTaskCognitiveGate = (
  projection: ArenaHumanTaskProjection,
  requiredStakeholders: readonly HumanTaskStakeholder[]
): HumanTaskCognitiveReceipt => {
  const issues: HumanTaskGateIssue[] = [];
  const evidenceIds = new Set(projection.evidence.map((item) => item.id));
  const requirementsByStakeholder = new Map(
    projection.stakeholderRequirements.map((item) => [item.stakeholder, item])
  );

  if (projection.sourceRefs.length === 0) {
    issues.push({
      code: 'MISSING_CANONICAL_SOURCE',
      message: 'La proiezione Human Task deve mantenere almeno una fonte canonica.',
    });
  }

  for (const stakeholder of unique(requiredStakeholders)) {
    const requirement = requirementsByStakeholder.get(stakeholder);

    if (!requirement) {
      issues.push({
        code: 'MISSING_REQUIRED_STAKEHOLDER',
        stakeholder,
        message: `Manca la responsabilità cognitiva richiesta per ${stakeholder}.`,
      });
      continue;
    }

    if (!requirement.responsibility.trim()) {
      issues.push({
        code: 'MISSING_STAKEHOLDER_RESPONSIBILITY',
        stakeholder,
        message: `La responsabilità di ${stakeholder} non è comprensibile.`,
      });
    }

    if (requirement.evidenceRefs.length === 0) {
      issues.push({
        code: 'MISSING_STAKEHOLDER_EVIDENCE',
        stakeholder,
        message: `Manca un'evidenza verificabile per ${stakeholder}.`,
      });
      continue;
    }

    for (const evidenceRef of requirement.evidenceRefs) {
      if (!evidenceIds.has(evidenceRef)) {
        issues.push({
          code: 'UNKNOWN_EVIDENCE_REFERENCE',
          stakeholder,
          message: `L'evidenza ${evidenceRef} richiesta da ${stakeholder} non appartiene alla proiezione.`,
        });
      }
    }
  }

  if (
    projection.primaryAction.responsibleStakeholder === 'sistema' &&
    INSTITUTIONAL_DECISION_CAPABILITIES.includes(projection.primaryAction.capability)
  ) {
    issues.push({
      code: 'SYSTEM_CANNOT_DECIDE',
      stakeholder: 'sistema',
      message: 'Il sistema può preparare o proporre, ma non assumere una decisione istituzionale.',
    });
  }

  if (
    INSTITUTIONAL_DECISION_CAPABILITIES.includes(projection.primaryAction.capability) &&
    !projection.primaryAction.humanConfirmationRequired
  ) {
    issues.push({
      code: 'DECISION_REQUIRES_HUMAN_CONFIRMATION',
      stakeholder: projection.primaryAction.responsibleStakeholder,
      message: 'Una decisione istituzionale richiede conferma umana esplicita.',
    });
  }

  const checkedStakeholders = unique(requiredStakeholders);

  return {
    status: issues.length === 0 ? 'SATISFIED' : 'BLOCKED',
    checkedStakeholders,
    issues,
    note:
      issues.length === 0
        ? 'Ogni stakeholder richiesto dispone di responsabilità ed evidenze verificabili; la decisione resta nel perimetro umano.'
        : 'La proiezione non è promuovibile finché tutti i requisiti cognitivi e di provenienza non sono soddisfatti.',
  };
};
