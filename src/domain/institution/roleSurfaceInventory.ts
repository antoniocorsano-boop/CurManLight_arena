import type { ArenaProcessId } from './processRoleModel';

export type CanonicalArenaSurfaceId =
  | 'HOME'
  | 'CURRICULUM'
  | 'SOURCES'
  | 'REVISION'
  | 'KNOWLEDGE'
  | 'DOCUMENTS'
  | 'SUPPORT';

export type CurrentRoleDifferentiation =
  | 'ROLE_ORIENTED_COPY'
  | 'COMMON_SURFACE'
  | 'COMMON_WITH_AUTHENTICATED_BOUNDARY';

export interface ArenaRoleSurfaceInventoryItem {
  id: CanonicalArenaSurfaceId;
  label: string;
  currentRoleDifferentiation: CurrentRoleDifferentiation;
  processes: readonly ArenaProcessId[];
  currentPrimaryTask: string;
  targetPrimaryTask: string;
  gapSeverity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export const ARENA_ROLE_SURFACE_INVENTORY: readonly ArenaRoleSurfaceInventoryItem[] = [
  {
    id: 'HOME',
    label: 'Home',
    currentRoleDifferentiation: 'ROLE_ORIENTED_COPY',
    processes: ['P2_CURRICULUM_CONTEXT', 'P4_REVISION_REVIEW', 'P5_INSTITUTIONAL_DECISION', 'P7_PLANNING_HANDOFF'],
    currentPrimaryTask: 'orientamento iniziale con copy per ruolo e journey comune',
    targetPrimaryTask: 'mostrare il lavoro che richiede attenzione in base a capacità e stato del processo',
    gapSeverity: 'HIGH',
  },
  {
    id: 'CURRICULUM',
    label: 'Curricolo',
    currentRoleDifferentiation: 'COMMON_SURFACE',
    processes: ['P2_CURRICULUM_CONTEXT', 'P3_CURRICULUM_ANALYSIS'],
    currentPrimaryTask: 'consultare e aggiornare la copia curricolare locale',
    targetPrimaryTask: 'consultare o analizzare il curricolo con azioni prioritarie coerenti con il ruolo effettivo',
    gapSeverity: 'HIGH',
  },
  {
    id: 'SOURCES',
    label: 'Fonti',
    currentRoleDifferentiation: 'COMMON_SURFACE',
    processes: ['P1_SOURCE_QUALIFICATION', 'P2_CURRICULUM_CONTEXT'],
    currentPrimaryTask: 'consultare, aggiungere e verificare fonti locali',
    targetPrimaryTask: 'risolvere i blocker di provenienza/evidenza rilevanti per il lavoro corrente',
    gapSeverity: 'MEDIUM',
  },
  {
    id: 'REVISION',
    label: 'Revisione',
    currentRoleDifferentiation: 'COMMON_WITH_AUTHENTICATED_BOUNDARY',
    processes: ['P3_CURRICULUM_ANALYSIS', 'P4_REVISION_REVIEW', 'P5_INSTITUTIONAL_DECISION'],
    currentPrimaryTask: 'gestire proposte locali e, separatamente, decidere quando la membership autenticata lo consente',
    targetPrimaryTask: 'separare preparazione, review e decisione in code di lavoro coerenti con capacità e responsabilità',
    gapSeverity: 'HIGH',
  },
  {
    id: 'KNOWLEDGE',
    label: 'Conoscenza',
    currentRoleDifferentiation: 'COMMON_SURFACE',
    processes: ['P1_SOURCE_QUALIFICATION', 'P2_CURRICULUM_CONTEXT', 'P3_CURRICULUM_ANALYSIS', 'P4_REVISION_REVIEW'],
    currentPrimaryTask: 'consultare e cercare conoscenza/evidenze disponibili',
    targetPrimaryTask: 'fornire supporto contestuale a un bisogno di evidenza proveniente dal lavoro corrente',
    gapSeverity: 'MEDIUM',
  },
  {
    id: 'DOCUMENTS',
    label: 'Documenti / Handoff',
    currentRoleDifferentiation: 'COMMON_SURFACE',
    processes: ['P7_PLANNING_HANDOFF'],
    currentPrimaryTask: 'preparare output e handoff da una superficie comune',
    targetPrimaryTask: 'mostrare solo gli output coerenti con processo, stato e capacità dell’attore',
    gapSeverity: 'HIGH',
  },
  {
    id: 'SUPPORT',
    label: 'Guida / Supporto',
    currentRoleDifferentiation: 'COMMON_SURFACE',
    processes: [],
    currentPrimaryTask: 'fornire guida generale e checklist',
    targetPrimaryTask: 'mantenere guida comune con recovery contestuale dai work item',
    gapSeverity: 'LOW',
  },
] as const;

export const getArenaRoleSurfaceInventoryItem = (
  id: CanonicalArenaSurfaceId
): ArenaRoleSurfaceInventoryItem => {
  const item = ARENA_ROLE_SURFACE_INVENTORY.find((candidate) => candidate.id === id);
  if (!item) throw new Error(`Unknown Arena canonical surface: ${id}`);
  return item;
};
