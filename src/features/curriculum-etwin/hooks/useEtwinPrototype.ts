/**
 * CML-630C — Curriculum e-Twin Domain Validation Prototype
 *
 * Hook per la gestione dello stato del prototipo sperimentale.
 */

import { useState, useCallback, useMemo } from 'react';
import type {
  InstituteCurriculumVersion,
  CurriculumSegment,
  CurriculumNode,
  VerticalCurriculumLink,
  InstitutionalRole,
  InstituteCurriculumStatus,
  SegmentWorkflowStatus,
  LinkStatus,
} from '../domain/types';
import {
  transitionVersion,
  transitionSegment,
  transitionLink,
  validateLink,
  canTransitionVersion,
  canTransitionSegment,
  canTransitionLink,
} from '../domain/logic';
import {
  allVersions,
  allSegments,
  allNodes,
  allLinks,
} from '../data/syntheticData';

export function useEtwinPrototype() {
  const [versions, setVersions] = useState<InstituteCurriculumVersion[]>(allVersions);
  const [segments, setSegments] = useState<CurriculumSegment[]>(allSegments);
  const [nodes] = useState<CurriculumNode[]>(allNodes);
  const [links, setLinks] = useState<VerticalCurriculumLink[]>(allLinks);
  const [selectedVersionId, setSelectedVersionId] = useState<string>(allVersions[0].id);
  const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedLinkId, setSelectedLinkId] = useState<string | null>(null);
  const [activeRole, setActiveRole] = useState<InstitutionalRole>('docente');
  const [viewMode, setViewMode] = useState<'model-a' | 'model-b'>('model-b');

  const selectedVersion = useMemo(
    () => versions.find(v => v.id === selectedVersionId) ?? versions[0],
    [versions, selectedVersionId]
  );

  const versionSegments = useMemo(
    () => segments.filter(s => s.curriculumVersionId === selectedVersion.id),
    [segments, selectedVersion]
  );

  const selectedSegment = useMemo(
    () => segments.find(s => s.id === selectedSegmentId) ?? null,
    [segments, selectedSegmentId]
  );

  const segmentNodes = useMemo(
    () => selectedSegment ? nodes.filter(n => n.segmentId === selectedSegment.id) : [],
    [nodes, selectedSegment]
  );

  const selectedNode = useMemo(
    () => nodes.find(n => n.id === selectedNodeId) ?? null,
    [nodes, selectedNodeId]
  );

  const nodeLinks = useMemo(
    () => selectedNode ? links.filter(l => l.sourceNodeId === selectedNode.id || l.targetNodeId === selectedNode.id) : [],
    [links, selectedNode]
  );

  const allVersionLinks = useMemo(
    () => {
      const segmentIds = versionSegments.map(s => s.id);
      const nodeIds = nodes.filter(n => segmentIds.includes(n.segmentId)).map(n => n.id);
      return links.filter(l => nodeIds.includes(l.sourceNodeId) || nodeIds.includes(l.targetNodeId));
    },
    [versionSegments, nodes, links]
  );

  const handleTransitionVersion = useCallback((targetStatus: InstituteCurriculumStatus) => {
    setVersions(prev => prev.map(v => {
      if (v.id === selectedVersion.id) {
        return transitionVersion(v, targetStatus);
      }
      return v;
    }));
  }, [selectedVersion]);

  const handleTransitionSegment = useCallback((segmentId: string, targetStatus: SegmentWorkflowStatus) => {
    setSegments(prev => prev.map(s => {
      if (s.id === segmentId) {
        return transitionSegment(s, targetStatus);
      }
      return s;
    }));
  }, []);

  const handleTransitionLink = useCallback((linkId: string, targetStatus: LinkStatus) => {
    setLinks(prev => prev.map(l => {
      if (l.id === linkId) {
        return transitionLink(l, targetStatus, activeRole);
      }
      return l;
    }));
  }, [activeRole]);

  const handleAddLink = useCallback((
    sourceNodeId: string,
    targetNodeId: string,
    relationType: VerticalCurriculumLink['relationType'],
    rationale?: string
  ) => {
    const newLink: VerticalCurriculumLink = {
      id: `link-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      sourceNodeId,
      targetNodeId,
      relationType,
      rationale,
      status: 'draft',
      createdByRole: activeRole,
    };
    const validation = validateLink(newLink, nodes);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }
    setLinks(prev => [...prev, newLink]);
    return { success: true };
  }, [activeRole, nodes]);

  const canPerformAction = useCallback((action: string): boolean => {
    switch (activeRole) {
      case 'docente':
        return ['propose-link', 'edit-draft', 'view'].includes(action);
      case 'dipartimento':
        return ['validate-link', 'reject-link', 'propose-link', 'view'].includes(action);
      case 'referente':
        return ['consolidate', 'propose-version', 'view'].includes(action);
      case 'collegio':
        return ['approve-version', 'reject-version', 'view'].includes(action);
      default:
        return false;
    }
  }, [activeRole]);

  return {
    versions,
    segments,
    nodes,
    links,
    selectedVersion,
    versionSegments,
    selectedSegment,
    segmentNodes,
    selectedNode,
    nodeLinks,
    allVersionLinks,
    selectedLinkId,
    activeRole,
    viewMode,
    setSelectedVersionId,
    setSelectedSegmentId,
    setSelectedNodeId,
    setSelectedLinkId,
    setActiveRole,
    setViewMode,
    handleTransitionVersion,
    handleTransitionSegment,
    handleTransitionLink,
    handleAddLink,
    canPerformAction,
    canTransitionVersion: (target: InstituteCurriculumStatus) => canTransitionVersion(selectedVersion.status, target),
    canTransitionSegment: (segmentId: string, target: SegmentWorkflowStatus) => {
      const seg = segments.find(s => s.id === segmentId);
      return seg ? canTransitionSegment(seg.institutionalContentStatus, target) : false;
    },
    canTransitionLink: (linkId: string, target: LinkStatus) => {
      const link = links.find(l => l.id === linkId);
      return link ? canTransitionLink(link.status, target) : false;
    },
  };
}
