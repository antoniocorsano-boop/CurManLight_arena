import type { InstitutionalRole } from '../curriculum/types';

export type ArenaCapability =
  | 'CURRICULUM_READ'
  | 'CURRICULUM_PROPOSE'
  | 'REVISION_REVIEW'
  | 'REVISION_DECIDE'
  | 'CURRICULUM_ADOPT'
  | 'DOCUMENT_PREPARE'
  | 'DOCUMENT_EXPORT'
  | 'WORKSPACE_ADMIN';

export type RoleAssurance = 'self-declared' | 'authenticated-workspace';
export type ArenaAccessProfile = 'role-default' | 'observer-read-only';

export interface CapabilityAccessDecision {
  allowed: boolean;
  role: InstitutionalRole;
  capability: ArenaCapability;
  assurance: RoleAssurance;
  accessProfile: ArenaAccessProfile;
  reason: string;
}

const ROLE_CAPABILITIES: Readonly<Record<InstitutionalRole, readonly ArenaCapability[]>> = {
  'non-dichiarato': [],
  docente: [
    'CURRICULUM_READ',
    'CURRICULUM_PROPOSE',
    'DOCUMENT_PREPARE',
    'DOCUMENT_EXPORT',
  ],
  dipartimento: [
    'CURRICULUM_READ',
    'CURRICULUM_PROPOSE',
    'REVISION_REVIEW',
    'DOCUMENT_PREPARE',
    'DOCUMENT_EXPORT',
  ],
  referente: [
    'CURRICULUM_READ',
    'CURRICULUM_PROPOSE',
    'REVISION_REVIEW',
    'DOCUMENT_PREPARE',
    'DOCUMENT_EXPORT',
  ],
  collegio: [
    'CURRICULUM_READ',
    'REVISION_DECIDE',
    'DOCUMENT_EXPORT',
  ],
  dirigente: [
    'CURRICULUM_READ',
    'REVISION_REVIEW',
    'CURRICULUM_ADOPT',
    'DOCUMENT_EXPORT',
  ],
  amministratore: [
    'CURRICULUM_READ',
    'WORKSPACE_ADMIN',
  ],
};

const OBSERVER_CAPABILITIES: readonly ArenaCapability[] = ['CURRICULUM_READ'];

const AUTHENTICATED_ONLY_CAPABILITIES: readonly ArenaCapability[] = [
  'REVISION_DECIDE',
  'CURRICULUM_ADOPT',
  'WORKSPACE_ADMIN',
];

export const getRoleCapabilities = (
  role: InstitutionalRole
): readonly ArenaCapability[] => ROLE_CAPABILITIES[role];

export const getObserverCapabilities = (): readonly ArenaCapability[] => OBSERVER_CAPABILITIES;

export const resolveCapabilityAccess = (
  role: InstitutionalRole,
  capability: ArenaCapability,
  assurance: RoleAssurance,
  accessProfile: ArenaAccessProfile = 'role-default'
): CapabilityAccessDecision => {
  if (accessProfile === 'observer-read-only') {
    const allowed = OBSERVER_CAPABILITIES.includes(capability);
    return {
      allowed,
      role,
      capability,
      assurance,
      accessProfile,
      reason: allowed
        ? 'Il profilo osservatore consente la consultazione del curricolo senza attribuire capacità mutanti.'
        : 'Il profilo osservatore è read-only e blocca qualsiasi capacità di proposta, revisione, decisione, adozione, export o amministrazione.',
    };
  }

  if (!ROLE_CAPABILITIES[role].includes(capability)) {
    return {
      allowed: false,
      role,
      capability,
      assurance,
      accessProfile,
      reason: 'La capacità non appartiene al ruolo nel modello di privilegio minimo.',
    };
  }

  if (
    assurance === 'self-declared' &&
    AUTHENTICATED_ONLY_CAPABILITIES.includes(capability)
  ) {
    return {
      allowed: false,
      role,
      capability,
      assurance,
      accessProfile,
      reason: 'Il ruolo autodichiarato non attribuisce autorità istituzionale o amministrativa.',
    };
  }

  return {
    allowed: true,
    role,
    capability,
    assurance,
    accessProfile,
    reason:
      assurance === 'authenticated-workspace'
        ? 'Capacità consentita al ruolo autenticato nel workspace.'
        : 'Capacità locale consentita senza attribuire autorità istituzionale.',
  };
};

export const canUseCapability = (
  role: InstitutionalRole,
  capability: ArenaCapability,
  assurance: RoleAssurance,
  accessProfile: ArenaAccessProfile = 'role-default'
): boolean => resolveCapabilityAccess(role, capability, assurance, accessProfile).allowed;
