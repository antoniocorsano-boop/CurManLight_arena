import type { WorkspaceActorContext } from './sharedWorkspacePort';
import type { CanonicalAdoptionReceipt } from './canonicalAdoptionContract';

export interface SharedCanonicalVersionHead {
  workspaceId: string;
  canonicalVersionRef: string;
  status: 'ACTIVE';
  activatedAt: string;
  adoptionReceiptRef: string;
}

export interface SharedCanonicalAdoptionCommand {
  workspaceId: string;
  decisionReceiptRef: string;
  proposalRef: string;
  proposalVersionRef: string;
  proposalVersionFingerprint: string;
  expectedCurrentCanonicalVersionRef: string;
  candidateCanonicalVersionRef: string;
  clientRequestId: string;
}

export interface SharedCanonicalAdoptionResult {
  receipt: CanonicalAdoptionReceipt;
  previousHead: SharedCanonicalVersionHead;
  currentHead: SharedCanonicalVersionHead;
}

/**
 * Server-backed authority boundary for P6 canonical adoption.
 *
 * Implementations MUST perform the following as one authoritative transaction:
 * - re-check active authenticated membership and CURRICULUM_ADOPT capability;
 * - re-check the institutional decision receipt and proposal fingerprint;
 * - compare-and-swap the expected current canonical head;
 * - activate the candidate canonical version;
 * - supersede the previous canonical head;
 * - persist one immutable CanonicalAdoptionReceipt;
 * - return the resulting canonical head and receipt.
 *
 * There is deliberately no local/self-declared fallback for this port.
 * Dexie/localStorage may cache the resulting state for consultation, but may
 * never be the authority that creates a canonical adoption receipt.
 */
export interface SharedCanonicalAdoptionRepository {
  getCurrentCanonicalHead(
    context: WorkspaceActorContext,
    workspaceId: string,
  ): Promise<SharedCanonicalVersionHead | null>;

  findAdoptionForDecision(
    context: WorkspaceActorContext,
    decisionReceiptRef: string,
  ): Promise<CanonicalAdoptionReceipt | null>;

  adoptCanonicalCurriculum(
    context: WorkspaceActorContext,
    command: SharedCanonicalAdoptionCommand,
  ): Promise<SharedCanonicalAdoptionResult>;
}
