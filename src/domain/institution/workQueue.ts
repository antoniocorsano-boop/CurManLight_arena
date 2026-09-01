import type { InstitutionalRole } from '../curriculum/types';
import { canUseCapability, type ArenaCapability, type RoleAssurance } from './capabilities';
import {
  getArenaProcessContract,
  type ArenaProcessId,
  type ArenaWorkQueueState,
} from './processRoleModel';

export type ArenaWorkEvidenceState = 'READY' | 'MISSING' | 'STALE' | 'NOT_REQUIRED';
export type ArenaWorkItemAccess = 'ACTIONABLE' | 'READ_ONLY' | 'HIDDEN';

export interface ArenaActorProjection {
  role: InstitutionalRole;
  assurance: RoleAssurance;
}

export interface ArenaWorkItemSeed {
  id: string;
  processId: ArenaProcessId;
  title: string;
  reason: string;
  queueState: ArenaWorkQueueState;
  evidenceState: ArenaWorkEvidenceState;
  requiredCapability: ArenaCapability;
  nextActionLabel: string;
  nextActorRole?: InstitutionalRole;
  blocker?: string;
  consequential: boolean;
  authenticatedAuthorityRequired: boolean;
  sourceRef?: string;
  orderKey: string;
}

export interface ArenaProjectedWorkItem extends ArenaWorkItemSeed {
  access: ArenaWorkItemAccess;
  accessReason: string;
  effectiveBlocker?: string;
}

const QUEUE_STATE_ORDER: Readonly<Record<ArenaWorkQueueState, number>> = {
  TO_VERIFY: 0,
  TO_REVIEW: 1,
  TO_DECIDE: 2,
  TO_READ: 3,
  COMPLETED: 4,
};

const CANONICAL_PROCESS_CAPABILITY: Partial<Record<ArenaProcessId, ArenaCapability>> = {
  P5_INSTITUTIONAL_DECISION: 'REVISION_DECIDE',
  P6_CANONICAL_ADOPTION: 'CURRICULUM_ADOPT',
  P7_PLANNING_HANDOFF: 'DOCUMENT_EXPORT',
};

const hasEvidenceBlocker = (
  evidenceState: ArenaWorkEvidenceState,
  consequential: boolean,
): boolean => consequential && (evidenceState === 'MISSING' || evidenceState === 'STALE');

export const projectArenaWorkItem = (
  seed: ArenaWorkItemSeed,
  actor: ArenaActorProjection,
): ArenaProjectedWorkItem => {
  const process = getArenaProcessContract(seed.processId);
  const effectiveRequiredCapability = CANONICAL_PROCESS_CAPABILITY[process.id] ?? seed.requiredCapability;
  const effectiveConsequential = process.consequential || seed.consequential;
  const effectiveAuthenticatedAuthorityRequired =
    process.authenticatedAuthorityRequired || seed.authenticatedAuthorityRequired;
  const effectiveSeed: ArenaWorkItemSeed = {
    ...seed,
    requiredCapability: effectiveRequiredCapability,
    consequential: effectiveConsequential,
    authenticatedAuthorityRequired: effectiveAuthenticatedAuthorityRequired,
  };

  const canRead = canUseCapability(actor.role, 'CURRICULUM_READ', actor.assurance);
  const canAct = canUseCapability(actor.role, effectiveRequiredCapability, actor.assurance);

  if (!canRead && !canAct) {
    return {
      ...effectiveSeed,
      access: 'HIDDEN',
      accessReason: 'Il ruolo non dispone della capacità richiesta né dell’accesso di lettura al curricolo.',
      effectiveBlocker: seed.blocker,
    };
  }

  if (seed.queueState === 'COMPLETED') {
    return {
      ...effectiveSeed,
      access: 'READ_ONLY',
      accessReason: 'Il lavoro risulta completato e non richiede un’azione corrente.',
      effectiveBlocker: seed.blocker,
    };
  }

  if (process.implementationStatus === 'NOT_IMPLEMENTED') {
    return {
      ...effectiveSeed,
      access: 'READ_ONLY',
      accessReason: 'Il processo richiesto non è ancora implementato e non può essere reso azionabile dalla sola capacità del ruolo.',
      effectiveBlocker: seed.blocker ?? `Processo ${process.id} non implementato.`,
    };
  }

  if (seed.blocker) {
    return {
      ...effectiveSeed,
      access: 'READ_ONLY',
      accessReason: 'Il lavoro è consultabile ma resta bloccato finché il requisito indicato non viene risolto.',
      effectiveBlocker: seed.blocker,
    };
  }

  if (hasEvidenceBlocker(seed.evidenceState, effectiveConsequential)) {
    return {
      ...effectiveSeed,
      access: 'READ_ONLY',
      accessReason: 'Un’azione conseguenziale resta bloccata perché le evidenze richieste sono mancanti o non più correnti.',
      effectiveBlocker: seed.evidenceState === 'MISSING'
        ? 'Evidenze richieste mancanti.'
        : 'Evidenze non più correnti o non legate in modo affidabile allo stato attuale.',
    };
  }

  if (!canAct) {
    return {
      ...effectiveSeed,
      access: 'READ_ONLY',
      accessReason: 'Il lavoro è visibile, ma la capacità richiesta non è disponibile per questo ruolo e livello di assurance.',
    };
  }

  if (effectiveAuthenticatedAuthorityRequired && actor.assurance !== 'authenticated-workspace') {
    return {
      ...effectiveSeed,
      access: 'READ_ONLY',
      accessReason: 'L’azione richiede una membership autenticata nel workspace; il ruolo autodichiarato non attribuisce autorità.',
      effectiveBlocker: 'Membership autenticata richiesta.',
    };
  }

  return {
    ...effectiveSeed,
    access: 'ACTIONABLE',
    accessReason: 'Il ruolo dispone della capacità richiesta e non risultano blocker nel contratto del work item.',
  };
};

export const projectArenaWorkQueue = (
  seeds: readonly ArenaWorkItemSeed[],
  actor: ArenaActorProjection,
): ArenaProjectedWorkItem[] =>
  seeds
    .map((seed) => projectArenaWorkItem(seed, actor))
    .filter((item) => item.access !== 'HIDDEN')
    .sort((left, right) => {
      const queueDelta = QUEUE_STATE_ORDER[left.queueState] - QUEUE_STATE_ORDER[right.queueState];
      if (queueDelta !== 0) return queueDelta;
      const orderDelta = left.orderKey.localeCompare(right.orderKey, 'it');
      if (orderDelta !== 0) return orderDelta;
      return left.id.localeCompare(right.id, 'it');
    });
