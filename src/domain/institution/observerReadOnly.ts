import type { InstitutionalRole } from '../curriculum/types';
import type { ArenaCapability, RoleAssurance } from './capabilities';
import { getObserverCapabilities } from './capabilities';
import type { ArenaProjectedWorkItem, ArenaWorkItemSeed } from './workQueue';
import { projectArenaWorkQueue } from './workQueue';

export interface ArenaObserverExperienceContract {
  accessProfile: 'observer-read-only';
  authorityRole: false;
  capabilities: readonly ArenaCapability[];
  visibleDomains: readonly ['curriculum', 'evidence', 'process'];
  mutationPolicy: 'DENY_ALL';
  purpose: string;
}

export const ARENA_OBSERVER_READ_ONLY: ArenaObserverExperienceContract = {
  accessProfile: 'observer-read-only',
  authorityRole: false,
  capabilities: getObserverCapabilities(),
  visibleDomains: ['curriculum', 'evidence', 'process'],
  mutationPolicy: 'DENY_ALL',
  purpose: 'Consentire consultazione istituzionale, audit e revisione esterna senza attribuire capacità di modifica o decisione.',
};

export const projectObserverWorkQueue = (
  seeds: readonly ArenaWorkItemSeed[],
  role: InstitutionalRole,
  assurance: RoleAssurance,
): ArenaProjectedWorkItem[] =>
  projectArenaWorkQueue(seeds, {
    role,
    assurance,
    accessProfile: 'observer-read-only',
  });

export const observerMayMutate = (): false => false;
