/**
 * CML-631A — Curriculum Pilot Service
 *
 * Livello applicativo tra UI e repository.
 * Orchestra dominio e persistenza per il pilota funzionale.
 */

import type {
  InstituteCurriculumVersion,
  CurriculumSegment,
  CurriculumNode,
  VerticalCurriculumLink,
  VerticalCurriculumRelationType,
  DomainValidationIssue,
} from '../../../domain/curriculum';
import {
  validateVerticalCurriculumLink,
  isApprovedVersionImmutable,
  findDuplicateVerticalLinks,
} from '../../../domain/curriculum';
import type { CurriculumFunctionalActivationMode, PilotDataset } from '../types';
import { PILOT_DATASET_ID } from '../types';
import {
  PILOT_VERSION,
  PILOT_SEGMENTS,
  PILOT_NODES,
  PILOT_INITIAL_LINKS,
} from '../data/pilotData';

// ─── Service State ──────────────────────────────────────────────────────────────

let activationMode: CurriculumFunctionalActivationMode = 'disabled';
let pilotDataset: PilotDataset | null = null;
let pilotLinks: VerticalCurriculumLink[] = [...PILOT_INITIAL_LINKS];

// ─── Service Result Types ───────────────────────────────────────────────────────

export type ServiceResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ServiceError };

export interface ServiceError {
  code: string;
  message: string;
  details?: DomainValidationIssue[];
}

// ─── Activation Mode ────────────────────────────────────────────────────────────

export function getActivationMode(): CurriculumFunctionalActivationMode {
  return activationMode;
}

export function setActivationMode(mode: CurriculumFunctionalActivationMode): void {
  activationMode = mode;
}

export function isPilotActive(): boolean {
  return activationMode !== 'disabled';
}

export function isContributionAllowed(): boolean {
  return activationMode === 'pilot-contribution';
}

// ─── Dataset Initialization ─────────────────────────────────────────────────────

export function initializePilotDataset(): ServiceResult<PilotDataset> {
  if (pilotDataset && pilotDataset.id === PILOT_DATASET_ID) {
    return { ok: true, data: pilotDataset };
  }

  pilotDataset = {
    id: PILOT_DATASET_ID,
    versionId: PILOT_VERSION.id,
    segmentIds: PILOT_SEGMENTS.map(s => s.id),
    nodeIds: PILOT_NODES.map(n => n.id),
    initializedAt: new Date().toISOString(),
  };

  return { ok: true, data: pilotDataset };
}

export function isPilotInitialized(): boolean {
  return pilotDataset !== null && pilotDataset.id === PILOT_DATASET_ID;
}

export function getPilotDataset(): PilotDataset | null {
  return pilotDataset;
}

// ─── Query Functions ────────────────────────────────────────────────────────────

export function listPilotVersions(): ServiceResult<InstituteCurriculumVersion[]> {
  if (!isPilotActive()) {
    return { ok: false, error: { code: 'PILOT_DISABLED', message: 'La modalità pilota non è attiva' } };
  }
  if (!isPilotInitialized()) {
    return { ok: false, error: { code: 'PILOT_NOT_INITIALIZED', message: 'Il dataset pilota non è stato inizializzato' } };
  }
  return { ok: true, data: [PILOT_VERSION] };
}

export function listPilotSegments(versionId: string): ServiceResult<CurriculumSegment[]> {
  if (!isPilotActive()) {
    return { ok: false, error: { code: 'PILOT_DISABLED', message: 'La modalità pilota non è attiva' } };
  }
  if (!isPilotInitialized()) {
    return { ok: false, error: { code: 'PILOT_NOT_INITIALIZED', message: 'Il dataset pilota non è stato inizializzato' } };
  }
  if (versionId !== PILOT_VERSION.id) {
    return { ok: false, error: { code: 'VERSION_NOT_FOUND', message: 'Versione non trovata' } };
  }
  return { ok: true, data: PILOT_SEGMENTS };
}

export function listPilotNodes(segmentId: string): ServiceResult<CurriculumNode[]> {
  if (!isPilotActive()) {
    return { ok: false, error: { code: 'PILOT_DISABLED', message: 'La modalità pilota non è attiva' } };
  }
  if (!isPilotInitialized()) {
    return { ok: false, error: { code: 'PILOT_NOT_INITIALIZED', message: 'Il dataset pilota non è stato inizializzato' } };
  }
  const nodes = PILOT_NODES.filter(n => n.segmentId === segmentId);
  return { ok: true, data: nodes };
}

export function listPilotLinks(versionId: string): ServiceResult<VerticalCurriculumLink[]> {
  if (!isPilotActive()) {
    return { ok: false, error: { code: 'PILOT_DISABLED', message: 'La modalità pilota non è attiva' } };
  }
  if (!isPilotInitialized()) {
    return { ok: false, error: { code: 'PILOT_NOT_INITIALIZED', message: 'Il dataset pilota non è stato inizializzato' } };
  }
  const links = pilotLinks.filter(l => l.versionId === versionId);
  return { ok: true, data: links };
}

// ─── Mutation Functions ─────────────────────────────────────────────────────────

export function proposeVerticalLink(input: {
  versionId: string;
  sourceNodeId: string;
  targetNodeId: string;
  relationType: VerticalCurriculumRelationType;
  rationale: string;
  createdByRole?: string;
}): ServiceResult<VerticalCurriculumLink> {
  if (!isContributionAllowed()) {
    return { ok: false, error: { code: 'CONTRIBUTION_NOT_ALLOWED', message: 'La modalità pilota non consente contributi' } };
  }

  if (!isPilotInitialized()) {
    return { ok: false, error: { code: 'PILOT_NOT_INITIALIZED', message: 'Il dataset pilota non è stato inizializzato' } };
  }

  // Check version immutability
  if (isApprovedVersionImmutable(PILOT_VERSION)) {
    return { ok: false, error: { code: 'VERSION_IMMUTABLE', message: 'La versione approvata non può essere modificata' } };
  }

  // Validate source and target exist
  const sourceNode = PILOT_NODES.find(n => n.id === input.sourceNodeId);
  if (!sourceNode) {
    return { ok: false, error: { code: 'SOURCE_NODE_NOT_FOUND', message: 'Punto di partenza non trovato' } };
  }

  const targetNode = PILOT_NODES.find(n => n.id === input.targetNodeId);
  if (!targetNode) {
    return { ok: false, error: { code: 'TARGET_NODE_NOT_FOUND', message: 'Punto di arrivo non trovato' } };
  }

  // Validate source != target
  if (input.sourceNodeId === input.targetNodeId) {
    return { ok: false, error: { code: 'SELF_REFERENCING', message: 'Seleziona due elementi curricolari diversi' } };
  }

  // Validate rationale
  if (!input.rationale?.trim()) {
    return { ok: false, error: { code: 'MISSING_RATIONALE', message: 'Inserisci una breve motivazione pedagogica' } };
  }

  // Check for duplicates
  const newLink: VerticalCurriculumLink = {
    id: `pilot-link-${Date.now()}`,
    versionId: input.versionId,
    sourceNodeId: input.sourceNodeId,
    targetNodeId: input.targetNodeId,
    relationType: input.relationType,
    rationale: input.rationale.trim(),
    status: 'draft',
    createdByRole: (input.createdByRole as 'docente') || 'docente',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const validationIssues = validateVerticalCurriculumLink(newLink, pilotLinks, PILOT_NODES);
  const errors = validationIssues.filter(i => i.severity === 'error');
  if (errors.length > 0) {
    return {
      ok: false,
      error: {
        code: 'VALIDATION_FAILED',
        message: errors[0].message,
        details: errors,
      },
    };
  }

  const duplicates = findDuplicateVerticalLinks([...pilotLinks, newLink]);
  if (duplicates.length > 0) {
    return { ok: false, error: { code: 'DUPLICATE_LINK', message: 'Questo collegamento è già presente' } };
  }

  pilotLinks = [...pilotLinks, newLink];
  return { ok: true, data: newLink };
}

export function updateDraftVerticalLink(input: {
  linkId: string;
  relationType?: VerticalCurriculumRelationType;
  rationale?: string;
}): ServiceResult<VerticalCurriculumLink> {
  if (!isContributionAllowed()) {
    return { ok: false, error: { code: 'CONTRIBUTION_NOT_ALLOWED', message: 'La modalità pilota non consente contributi' } };
  }

  const linkIndex = pilotLinks.findIndex(l => l.id === input.linkId);
  if (linkIndex === -1) {
    return { ok: false, error: { code: 'LINK_NOT_FOUND', message: 'Collegamento non trovato' } };
  }

  const link = pilotLinks[linkIndex];
  if (link.status === 'validated') {
    return { ok: false, error: { code: 'LINK_VALIDATED', message: 'Un collegamento validato non può essere modificato' } };
  }

  const updated: VerticalCurriculumLink = {
    ...link,
    relationType: input.relationType || link.relationType,
    rationale: input.rationale?.trim() || link.rationale,
    updatedAt: new Date().toISOString(),
  };

  const validationIssues = validateVerticalCurriculumLink(updated, pilotLinks.filter(l => l.id !== input.linkId), PILOT_NODES);
  const errors = validationIssues.filter(i => i.severity === 'error');
  if (errors.length > 0) {
    return {
      ok: false,
      error: {
        code: 'VALIDATION_FAILED',
        message: errors[0].message,
        details: errors,
      },
    };
  }

  pilotLinks = pilotLinks.map((l, i) => i === linkIndex ? updated : l);
  return { ok: true, data: updated };
}

export function deleteDraftVerticalLink(linkId: string): ServiceResult<boolean> {
  if (!isContributionAllowed()) {
    return { ok: false, error: { code: 'CONTRIBUTION_NOT_ALLOWED', message: 'La modalità pilota non consente contributi' } };
  }

  const link = pilotLinks.find(l => l.id === linkId);
  if (!link) {
    return { ok: false, error: { code: 'LINK_NOT_FOUND', message: 'Collegamento non trovato' } };
  }

  if (link.status === 'validated') {
    return { ok: false, error: { code: 'LINK_VALIDATED', message: 'Un collegamento validato non può essere eliminato' } };
  }

  pilotLinks = pilotLinks.filter(l => l.id !== linkId);
  return { ok: true, data: true };
}

// ─── Reset ──────────────────────────────────────────────────────────────────────

export function resetPilot(): void {
  activationMode = 'disabled';
  pilotDataset = null;
  pilotLinks = [...PILOT_INITIAL_LINKS];
}
