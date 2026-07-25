/**
 * CML-631A — Curriculum Pilot Hook
 *
 * Hook principale per il pilot funzionale.
 * Orchestra dominio e persistenza per il pilot.
 */

import { useState, useCallback, useMemo } from 'react';
import type {
  CurriculumNode,
  CurriculumSegment,
  InstituteCurriculumVersion,
  VerticalCurriculumLink,
  VerticalCurriculumRelationType,
} from '../../../domain/curriculum';
import type { CurriculumFunctionalActivationMode, PilotDataset } from '../types';
import {
  getActivationMode,
  setActivationMode,
  isPilotActive,
  isContributionAllowed,
  initializePilotDataset,
  isPilotInitialized,
  getPilotDataset,
  listPilotVersions,
  listPilotSegments,
  listPilotNodes,
  listPilotLinks,
  proposeVerticalLink,
  updateDraftVerticalLink,
  deleteDraftVerticalLink,
  resetPilot,
  type ServiceResult,
  type ServiceError,
} from '../application/curriculumPilotService';

export interface UseCurriculumPilotReturn {
  // State
  activationMode: CurriculumFunctionalActivationMode;
  isPilotActive: boolean;
  isContributionAllowed: boolean;
  isPilotInitialized: boolean;
  pilotDataset: PilotDataset | null;
  versions: InstituteCurriculumVersion[];
  segments: CurriculumSegment[];
  nodes: CurriculumNode[];
  links: VerticalCurriculumLink[];
  lastError: ServiceError | null;
  isLoading: boolean;

  // Actions
  initializeDataset: () => ServiceResult<PilotDataset>;
  setMode: (mode: CurriculumFunctionalActivationMode) => void;
  proposeLink: (input: {
    versionId: string;
    sourceNodeId: string;
    targetNodeId: string;
    relationType: VerticalCurriculumRelationType;
    rationale: string;
  }) => ServiceResult<VerticalCurriculumLink>;
  updateLink: (input: {
    linkId: string;
    relationType?: VerticalCurriculumRelationType;
    rationale?: string;
  }) => ServiceResult<VerticalCurriculumLink>;
  deleteLink: (linkId: string) => ServiceResult<boolean>;
  reset: () => void;

  // Selectors
  getNodesBySegment: (segmentId: string) => CurriculumNode[];
  getLinksByVersion: (versionId: string) => VerticalCurriculumLink[];
  getSegmentLabel: (segment: CurriculumSegment) => string;
  getNodeLabel: (node: CurriculumNode) => string;
  getRelationTypeLabel: (type: VerticalCurriculumRelationType) => string;
  getStatusLabel: (status: string) => string;
}

export function useCurriculumPilot(): UseCurriculumPilotReturn {
  const [activationModeState, setActivationModeState] = useState<CurriculumFunctionalActivationMode>(() => getActivationMode());
  const [pilotDatasetState, setPilotDatasetState] = useState<PilotDataset | null>(() => getPilotDataset());
  const [versionsState, setVersionsState] = useState<InstituteCurriculumVersion[]>([]);
  const [segmentsState, setSegmentsState] = useState<CurriculumSegment[]>([]);
  const [nodesState, setNodesState] = useState<CurriculumNode[]>([]);
  const [linksState, setLinksState] = useState<VerticalCurriculumLink[]>([]);
  const [lastError, setLastError] = useState<ServiceError | null>(null);

  const refreshData = useCallback(() => {
    setVersionsState(listPilotVersions().ok ? (listPilotVersions() as { ok: true; data: InstituteCurriculumVersion[] }).data : []);
    if (pilotDatasetState) {
      setSegmentsState(listPilotSegments(pilotDatasetState.versionId).ok ? (listPilotSegments(pilotDatasetState.versionId) as { ok: true; data: CurriculumSegment[] }).data : []);
      setNodesState(listPilotNodes(pilotDatasetState.segmentIds[0] || '').ok ? (listPilotNodes(pilotDatasetState.segmentIds[0] || '') as { ok: true; data: CurriculumNode[] }).data : []);
      setLinksState(listPilotLinks(pilotDatasetState.versionId).ok ? (listPilotLinks(pilotDatasetState.versionId) as { ok: true; data: VerticalCurriculumLink[] }).data : []);
    }
  }, [pilotDatasetState]);

  const initializeDataset = useCallback((): ServiceResult<PilotDataset> => {
    const result = initializePilotDataset();
    if (result.ok) {
      setPilotDatasetState(result.data);
      setLastError(null);
      refreshData();
    } else {
      setLastError(result.error);
    }
    return result;
  }, [refreshData]);

  const setMode = useCallback((mode: CurriculumFunctionalActivationMode) => {
    setActivationMode(mode);
    setActivationModeState(mode);
    setLastError(null);
  }, []);

  const proposeLink = useCallback((input: {
    versionId: string;
    sourceNodeId: string;
    targetNodeId: string;
    relationType: VerticalCurriculumRelationType;
    rationale: string;
  }): ServiceResult<VerticalCurriculumLink> => {
    const result = proposeVerticalLink(input);
    if (result.ok) {
      setLastError(null);
      refreshData();
    } else {
      setLastError(result.error);
    }
    return result;
  }, [refreshData]);

  const updateLink = useCallback((input: {
    linkId: string;
    relationType?: VerticalCurriculumRelationType;
    rationale?: string;
  }): ServiceResult<VerticalCurriculumLink> => {
    const result = updateDraftVerticalLink(input);
    if (result.ok) {
      setLastError(null);
      refreshData();
    } else {
      setLastError(result.error);
    }
    return result;
  }, [refreshData]);

  const deleteLink = useCallback((linkId: string): ServiceResult<boolean> => {
    const result = deleteDraftVerticalLink(linkId);
    if (result.ok) {
      setLastError(null);
      refreshData();
    } else {
      setLastError(result.error);
    }
    return result;
  }, [refreshData]);

  const reset = useCallback(() => {
    resetPilot();
    setActivationModeState('disabled');
    setPilotDatasetState(null);
    setVersionsState([]);
    setSegmentsState([]);
    setNodesState([]);
    setLinksState([]);
    setLastError(null);
  }, []);

  const getNodesBySegment = useCallback((segmentId: string): CurriculumNode[] => {
    return nodesState.filter(n => n.segmentId === segmentId);
  }, [nodesState]);

  const getLinksByVersion = useCallback((versionId: string): VerticalCurriculumLink[] => {
    return linksState.filter(l => l.versionId === versionId);
  }, [linksState]);

  const getSegmentLabel = useCallback((segment: CurriculumSegment): string => {
    return `${segment.schoolLevel} - ${segment.subjectOrFieldId} (${segment.scope.type === 'grade' ? segment.scope.grade : segment.scope.type})`;
  }, []);

  const getNodeLabel = useCallback((node: CurriculumNode): string => {
    return `${node.title} (${node.type})`;
  }, []);

  const getRelationTypeLabel = useCallback((type: VerticalCurriculumRelationType): string => {
    const labels: Record<VerticalCurriculumRelationType, string> = {
      continuity: 'Continuita',
      development: 'Sviluppo',
      prerequisite: 'Prerequisito',
      integration: 'Integrazione',
      deepening: 'Approfondimento',
      discontinuity: 'Discontinuita',
    };
    return labels[type] || type;
  }, []);

  const getStatusLabel = useCallback((status: string): string => {
    const labels: Record<string, string> = {
      draft: 'Bozza',
      validated: 'Validato',
      approved: 'Approvato',
      rejected: 'Rifiutato',
    };
    return labels[status] || status;
  }, []);

  return useMemo(() => ({
    activationMode: activationModeState,
    isPilotActive: isPilotActive(),
    isContributionAllowed: isContributionAllowed(),
    isPilotInitialized: isPilotInitialized(),
    pilotDataset: pilotDatasetState,
    versions: versionsState,
    segments: segmentsState,
    nodes: nodesState,
    links: linksState,
    lastError,
    isLoading: false,
    initializeDataset,
    setMode,
    proposeLink,
    updateLink,
    deleteLink,
    reset,
    getNodesBySegment,
    getLinksByVersion,
    getSegmentLabel,
    getNodeLabel,
    getRelationTypeLabel,
    getStatusLabel,
  }), [
    activationModeState,
    pilotDatasetState,
    versionsState,
    segmentsState,
    nodesState,
    linksState,
    lastError,
    initializeDataset,
    setMode,
    proposeLink,
    updateLink,
    deleteLink,
    reset,
    getNodesBySegment,
    getLinksByVersion,
    getSegmentLabel,
    getNodeLabel,
    getRelationTypeLabel,
    getStatusLabel,
  ]);
}
