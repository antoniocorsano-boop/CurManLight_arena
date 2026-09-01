import type { InstitutionalRevisionDecisionReceipt } from '../revision/sharedDecisionPort';
import type { InstitutionalRole } from '../curriculum/types';
import { canUseCapability, type RoleAssurance } from './capabilities';

export type InstitutionalDecisionValidity = 'VERIFIED_ACTIVE' | 'REVOKED' | 'SUPERSEDED' | 'UNKNOWN';
export type CanonicalTargetState = 'VERIFIED_CURRENT' | 'STALE' | 'UNKNOWN';
export type CanonicalAdoptionReadiness = 'READY_FOR_HUMAN_ADOPTION' | 'BLOCKED' | 'NOT_APPLICABLE';

export type CanonicalAdoptionBlockerCode =
  | 'MISSING_DECISION_RECEIPT' | 'NON_ADOPTIVE_DECISION' | 'DECISION_VALIDITY_NOT_VERIFIED'
  | 'WORKSPACE_MISMATCH' | 'PROPOSAL_VERSION_MISMATCH' | 'PROPOSAL_FINGERPRINT_MISMATCH'
  | 'ADOPTION_BINDING_MISSING' | 'TARGET_NODE_MISMATCH' | 'BASE_CURRICULUM_VERSION_MISMATCH'
  | 'CANONICAL_TARGET_NOT_CURRENT' | 'ALREADY_ADOPTED' | 'ADOPTION_CAPABILITY_UNAVAILABLE'
  | 'AUTHENTICATED_WORKSPACE_REQUIRED';

export interface CanonicalAdoptionActor { role: InstitutionalRole; assurance: RoleAssurance; userId?: string; }

export interface CanonicalAdoptionAssessmentInput {
  workspaceId: string;
  proposalVersionRef: string;
  proposalVersionFingerprint: string;
  targetNodeRef: string;
  targetCanonicalVersionRef: string;
  targetCanonicalState: CanonicalTargetState;
  decisionReceipt: InstitutionalRevisionDecisionReceipt | null;
  decisionValidity: InstitutionalDecisionValidity;
  existingAdoptionReceiptRef?: string;
  actor: CanonicalAdoptionActor;
}

export interface CanonicalAdoptionAssessment {
  readiness: CanonicalAdoptionReadiness;
  blockerCodes: CanonicalAdoptionBlockerCode[];
  reasons: string[];
  decisionReceiptRef?: string;
  targetCanonicalVersionRef: string;
  requiredCapability: 'CURRICULUM_ADOPT';
  requiresHumanConfirmation: true;
}

export interface CanonicalAdoptionReceipt {
  schemaVersion: 1; id: string; workspaceId: string; decisionReceiptRef: string; proposalRef: string;
  proposalVersionRef: string; proposalVersionFingerprint: string; previousCanonicalVersionRef: string;
  adoptedCanonicalVersionRef: string; adoptedByUserId: string; adoptedByRole: InstitutionalRole;
  adoptedAt: string; status: 'ADOPTED'; supersedesAdoptionReceiptRef?: string;
}

const ADOPTIVE_OUTCOMES = new Set(['approve', 'approve-with-changes']);

export function assessCanonicalAdoption(input: CanonicalAdoptionAssessmentInput): CanonicalAdoptionAssessment {
  const blockerCodes: CanonicalAdoptionBlockerCode[] = [];
  const reasons: string[] = [];
  const receipt = input.decisionReceipt;

  if (!receipt) {
    blockerCodes.push('MISSING_DECISION_RECEIPT');
    reasons.push('Manca una ricevuta istituzionale verificabile per la versione proposta.');
  } else if (!ADOPTIVE_OUTCOMES.has(receipt.outcome)) {
    return { readiness: 'NOT_APPLICABLE', blockerCodes: ['NON_ADOPTIVE_DECISION'], reasons: [`L’esito istituzionale “${receipt.outcome}” non autorizza un’adozione canonica.`], decisionReceiptRef: receipt.id, targetCanonicalVersionRef: input.targetCanonicalVersionRef, requiredCapability: 'CURRICULUM_ADOPT', requiresHumanConfirmation: true };
  }

  if (receipt && input.decisionValidity !== 'VERIFIED_ACTIVE') {
    blockerCodes.push('DECISION_VALIDITY_NOT_VERIFIED'); reasons.push('La ricevuta decisionale non risulta verificata come attiva e corrente.');
  }
  if (receipt && receipt.workspaceId !== input.workspaceId) {
    blockerCodes.push('WORKSPACE_MISMATCH'); reasons.push('La ricevuta appartiene a un workspace diverso da quello dell’adozione.');
  }
  if (receipt && receipt.proposalVersionRef !== input.proposalVersionRef) {
    blockerCodes.push('PROPOSAL_VERSION_MISMATCH'); reasons.push('La ricevuta non riguarda la stessa versione della proposta.');
  }
  if (receipt && receipt.proposalVersionFingerprint !== input.proposalVersionFingerprint) {
    blockerCodes.push('PROPOSAL_FINGERPRINT_MISMATCH'); reasons.push('L’impronta della proposta non coincide con quella deliberata.');
  }

  if (receipt) {
    if (!receipt.adoptionBinding || receipt.adoptionBinding.version !== 2) {
      blockerCodes.push('ADOPTION_BINDING_MISSING');
      reasons.push('La ricevuta decisionale è storica o priva del binding v2 necessario per identificare nodo target e baseline canonica.');
    } else {
      if (receipt.adoptionBinding.targetNodeRef !== input.targetNodeRef) {
        blockerCodes.push('TARGET_NODE_MISMATCH'); reasons.push('Il nodo target non coincide con quello vincolato dalla decisione istituzionale.');
      }
      if (receipt.adoptionBinding.baseCurriculumVersionRef !== input.targetCanonicalVersionRef) {
        blockerCodes.push('BASE_CURRICULUM_VERSION_MISMATCH'); reasons.push('La versione canonica corrente non coincide con la baseline vincolata dalla decisione istituzionale.');
      }
    }
  }

  if (input.targetCanonicalState !== 'VERIFIED_CURRENT') {
    blockerCodes.push('CANONICAL_TARGET_NOT_CURRENT'); reasons.push('La versione canonica da sostituire non è verificata come corrente.');
  }
  if (input.existingAdoptionReceiptRef) {
    blockerCodes.push('ALREADY_ADOPTED'); reasons.push('Esiste già una ricevuta di adozione per questo passaggio; non è consentita una seconda promozione silenziosa.');
  }
  if (input.actor.assurance !== 'authenticated-workspace') {
    blockerCodes.push('AUTHENTICATED_WORKSPACE_REQUIRED'); reasons.push('L’adozione canonica richiede una membership autenticata nel workspace.');
  }
  if (!canUseCapability(input.actor.role, 'CURRICULUM_ADOPT', input.actor.assurance)) {
    blockerCodes.push('ADOPTION_CAPABILITY_UNAVAILABLE'); reasons.push('Nessun ruolo attuale possiede ancora la capacità CURRICULUM_ADOPT.');
  }

  return { readiness: blockerCodes.length === 0 ? 'READY_FOR_HUMAN_ADOPTION' : 'BLOCKED', blockerCodes, reasons, decisionReceiptRef: receipt?.id, targetCanonicalVersionRef: input.targetCanonicalVersionRef, requiredCapability: 'CURRICULUM_ADOPT', requiresHumanConfirmation: true };
}
