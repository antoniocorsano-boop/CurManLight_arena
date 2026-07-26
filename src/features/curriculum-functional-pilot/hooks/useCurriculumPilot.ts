/**
 * CML-631A — Curriculum Pilot Hook
 *
 * Hook principale per il pilot funzionale.
 * Orchestra dominio e persistenza per il pilot.
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import type {
  CurriculumNode,
  CurriculumSegment,
  InstituteCurriculumVersion,
  VerticalCurriculumLink,
  VerticalCurriculumRelationType,
} from '../../../domain/curriculum';
import type { CurriculumFunctionalActivationMode, PilotDataset, PilotAsyncOperation } from '../types';
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
import { getRelationTypeGuidance, type RelationTypeGuidance } from '../relationTypeGuidance';

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
  asyncOperation: PilotAsyncOperation;

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
  getRelationTypeDescription: (type: VerticalCurriculumRelationType) => RelationTypeGuidance;
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
  const [asyncOperation, setAsyncOperation] = useState<PilotAsyncOperation>('none');

  const refreshData = useCallback((overrideDataset?: PilotDataset | null) => {
    const dataset = overrideDataset ?? pilotDatasetState;
    setVersionsState(listPilotVersions().ok ? (listPilotVersions() as { ok: true; data: InstituteCurriculumVersion[] }).data : []);
    if (dataset) {
      setSegmentsState(listPilotSegments(dataset.versionId).ok ? (listPilotSegments(dataset.versionId) as { ok: true; data: CurriculumSegment[] }).data : []);
      const allNodes = dataset.segmentIds.flatMap(segmentId => {
        const result = listPilotNodes(segmentId);
        return result.ok ? (result as { ok: true; data: CurriculumNode[] }).data : [];
      });
      setNodesState(allNodes);
      setLinksState(listPilotLinks(dataset.versionId).ok ? (listPilotLinks(dataset.versionId) as { ok: true; data: VerticalCurriculumLink[] }).data : []);
    }
  }, [pilotDatasetState]);

  useEffect(() => {
    if (pilotDatasetState) {
      refreshData(pilotDatasetState);
    }
  }, [pilotDatasetState, refreshData]);

  const initializeDataset = useCallback((): ServiceResult<PilotDataset> => {
    setAsyncOperation('init');
    const result = initializePilotDataset();
    if (result.ok) {
      setPilotDatasetState(result.data);
      setLastError(null);
    } else {
      setLastError(result.error);
    }
    queueMicrotask(() => setAsyncOperation('none'));
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
    setAsyncOperation('create-link');
    const result = proposeVerticalLink(input);
    if (result.ok) {
      setLastError(null);
      refreshData();
    } else {
      setLastError(result.error);
    }
    queueMicrotask(() => setAsyncOperation('none'));
    return result;
  }, [refreshData]);

  const updateLink = useCallback((input: {
    linkId: string;
    relationType?: VerticalCurriculumRelationType;
    rationale?: string;
  }): ServiceResult<VerticalCurriculumLink> => {
    setAsyncOperation('update-link');
    const result = updateDraftVerticalLink(input);
    if (result.ok) {
      setLastError(null);
      refreshData();
    } else {
      setLastError(result.error);
    }
    queueMicrotask(() => setAsyncOperation('none'));
    return result;
  }, [refreshData]);

  const deleteLink = useCallback((linkId: string): ServiceResult<boolean> => {
    setAsyncOperation('delete-link');
    const result = deleteDraftVerticalLink(linkId);
    if (result.ok) {
      setLastError(null);
      refreshData();
    } else {
      setLastError(result.error);
    }
    queueMicrotask(() => setAsyncOperation('none'));
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
    setAsyncOperation('none');
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
      continuity: 'Continuità',
      development: 'Sviluppo',
      prerequisite: 'Prerequisito',
      integration: 'Integrazione',
      deepening: 'Approfondimento',
      discontinuity: 'Discontinuità',
    };
    return labels[type] || type;
  }, []);

  const getRelationTypeDescription = useCallback((type: VerticalCurriculumRelationType): RelationTypeGuidance => {
    return getRelationTypeGuidance(type);
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
    isLoading: asyncOperation !== 'none',
    asyncOperation,
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
    getRelationTypeDescription,
    getStatusLabel,
  }), [
    activationModeState,
    pilotDatasetState,
    versionsState,
    segmentsState,
    nodesState,
    linksState,
    lastError,
    asyncOperation,
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
    getRelationTypeDescription,
    getStatusLabel,
  ]);
}
