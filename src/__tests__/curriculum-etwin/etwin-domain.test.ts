/**
 * CML-630C — Curriculum e-Twin Domain Validation Prototype
 *
 * Test per la validazione del modello di dominio sperimentale.
 */

import { describe, it, expect } from 'vitest';
import {
  createVersion,
  createSegment,
  createNode,
  createLink,
  validateLink,
  canTransitionVersion,
  transitionVersion,
  canTransitionSegment,
  transitionSegment,
  canTransitionLink,
  getVersionWithSegments,
  getSegmentWithNodes,
  getLinkWithNodes,
  getSegmentsByDiscipline,
  getSegmentsByOrder,
  getLinksByNode,
  getLinksByStatus,
  getNodesBySegment,
  getNodesByType,
} from '../../features/curriculum-etwin/domain/logic';
import {
  scenario1Version,
  scenario1Segments,
  scenario1Nodes,
  scenario1Links,
  scenario2Segments,
  scenario2Links,
  scenario3Version,
  scenario3Links,
} from '../../features/curriculum-etwin/data/syntheticData';

describe('CML-630C — Curriculum e-Twin Domain', () => {
  describe('Version creation and transitions', () => {
    it('creates a draft version with correct defaults', () => {
      const version = createVersion('Test Version', '2026/2027');
      expect(version.title).toBe('Test Version');
      expect(version.effectivePeriod).toBe('2026/2027');
      expect(version.status).toBe('draft');
      expect(version.versionNumber).toBe(1);
      expect(version.id).toBeTruthy();
    });

    it('allows transition from draft to under-review', () => {
      const version = createVersion('Test', '2026/2027');
      expect(canTransitionVersion('draft', 'under-review')).toBe(true);
      const updated = transitionVersion(version, 'under-review');
      expect(updated.status).toBe('under-review');
    });

    it('prevents direct transition from draft to approved', () => {
      expect(canTransitionVersion('draft', 'approved')).toBe(false);
    });

    it('prevents transition from approved back to draft', () => {
      expect(canTransitionVersion('approved', 'draft')).toBe(false);
    });

    it('allows full workflow: draft → under-review → proposed → approved → superseded', () => {
      let version = createVersion('Full Workflow', '2026/2027');
      version = transitionVersion(version, 'under-review');
      expect(version.status).toBe('under-review');
      version = transitionVersion(version, 'proposed-to-collegio');
      expect(version.status).toBe('proposed-to-collegio');
      version = transitionVersion(version, 'approved');
      expect(version.status).toBe('approved');
      expect(version.approvedAt).toBeTruthy();
      version = transitionVersion(version, 'superseded');
      expect(version.status).toBe('superseded');
      expect(version.supersededAt).toBeTruthy();
    });

    it('uses scenario 1 version correctly', () => {
      expect(scenario1Version.status).toBe('approved');
      expect(scenario1Version.title).toBe('Curricolo Verticale Matematica 2026-2028');
    });
  });

  describe('Segment creation and transitions', () => {
    it('creates a segment with correct defaults', () => {
      const segment = createSegment('version-1', 'primaria', { type: 'grade', grade: '3ª' }, 'matematica', 'IN2025');
      expect(segment.curriculumVersionId).toBe('version-1');
      expect(segment.schoolOrder).toBe('primaria');
      expect(segment.scope).toEqual({ type: 'grade', grade: '3ª' });
      expect(segment.disciplineOrField).toBe('matematica');
      expect(segment.applicableFramework).toBe('IN2025');
      expect(segment.institutionalContentStatus).toBe('not-started');
      expect(segment.contentVersion).toBe(0);
    });

    it('allows segment workflow transitions', () => {
      expect(canTransitionSegment('not-started', 'draft')).toBe(true);
      expect(canTransitionSegment('draft', 'open-for-contributions')).toBe(true);
      expect(canTransitionSegment('open-for-contributions', 'under-review')).toBe(true);
      expect(canTransitionSegment('under-review', 'ready-for-consolidation')).toBe(true);
      expect(canTransitionSegment('ready-for-consolidation', 'included-in-proposal')).toBe(true);
      expect(canTransitionSegment('included-in-proposal', 'effective')).toBe(true);
    });

    it('prevents invalid segment transitions', () => {
      expect(canTransitionSegment('not-started', 'effective')).toBe(false);
      expect(canTransitionSegment('draft', 'effective')).toBe(false);
      expect(canTransitionSegment('effective', 'draft')).toBe(false);
    });

    it('transitions segment correctly', () => {
      const segment = createSegment('v1', 'primaria', { type: 'grade', grade: '1ª' }, 'italiano', 'IN2025');
      const draft = transitionSegment(segment, 'draft');
      expect(draft.institutionalContentStatus).toBe('draft');
      const open = transitionSegment(draft, 'open-for-contributions');
      expect(open.institutionalContentStatus).toBe('open-for-contributions');
    });

    it('uses scenario segments correctly', () => {
      expect(scenario1Segments).toHaveLength(2);
      expect(scenario1Segments[0].disciplineOrField).toBe('matematica');
      expect(scenario1Segments[0].applicableFramework).toBe('IN2025');
    });
  });

  describe('Node creation', () => {
    it('creates a node with correct properties', () => {
      const node = createNode('segment-1', 'competence', 'Test Node', 'Description', 'IN2025');
      expect(node.segmentId).toBe('segment-1');
      expect(node.type).toBe('competence');
      expect(node.title).toBe('Test Node');
      expect(node.description).toBe('Description');
      expect(node.framework).toBe('IN2025');
      expect(node.contentStatus).toBe('draft');
    });

    it('uses scenario nodes correctly', () => {
      expect(scenario1Nodes).toHaveLength(5);
      expect(scenario1Nodes[0].type).toBe('competence');
      expect(scenario1Nodes[0].segmentId).toBe('seg-mat-prim-5');
    });
  });

  describe('Link creation and validation', () => {
    it('creates a link with correct properties', () => {
      const link = createLink('node-1', 'node-2', 'continuity', 'Rationale', 'docente');
      expect(link.sourceNodeId).toBe('node-1');
      expect(link.targetNodeId).toBe('node-2');
      expect(link.relationType).toBe('continuity');
      expect(link.rationale).toBe('Rationale');
      expect(link.status).toBe('draft');
      expect(link.createdByRole).toBe('docente');
    });

    it('validates a correct link', () => {
      const link = createLink('node-1', 'node-2', 'continuity');
      const validation = validateLink(link, [
        { id: 'node-1', segmentId: 's1', type: 'competence', title: 'N1' },
        { id: 'node-2', segmentId: 's1', type: 'competence', title: 'N2' },
      ]);
      expect(validation.valid).toBe(true);
    });

    it('rejects link to non-existent node', () => {
      const link = createLink('node-1', 'node-999', 'continuity');
      const validation = validateLink(link, [
        { id: 'node-1', segmentId: 's1', type: 'competence', title: 'N1' },
      ]);
      expect(validation.valid).toBe(false);
      expect(validation.error).toContain('Target node');
    });

    it('rejects link from non-existent node', () => {
      const link = createLink('node-999', 'node-1', 'continuity');
      const validation = validateLink(link, [
        { id: 'node-1', segmentId: 's1', type: 'competence', title: 'N1' },
      ]);
      expect(validation.valid).toBe(false);
      expect(validation.error).toContain('Source node');
    });

    it('rejects self-referencing link', () => {
      const link = createLink('node-1', 'node-1', 'continuity');
      const validation = validateLink(link, [
        { id: 'node-1', segmentId: 's1', type: 'competence', title: 'N1' },
      ]);
      expect(validation.valid).toBe(false);
      expect(validation.error).toContain('itself');
    });

    it('allows link workflow transitions', () => {
      expect(canTransitionLink('draft', 'proposed')).toBe(true);
      expect(canTransitionLink('proposed', 'validated')).toBe(true);
      expect(canTransitionLink('proposed', 'rejected')).toBe(true);
      expect(canTransitionLink('rejected', 'draft')).toBe(true);
      expect(canTransitionLink('validated', 'draft')).toBe(false);
    });

    it('uses scenario links correctly', () => {
      expect(scenario1Links).toHaveLength(3);
      expect(scenario1Links[0].relationType).toBe('continuity');
      expect(scenario1Links[0].status).toBe('validated');
    });
  });

  describe('Query functions', () => {
    it('gets version with segments', () => {
      const result = getVersionWithSegments(scenario1Version, scenario1Segments);
      expect(result.version).toBe(scenario1Version);
      expect(result.segments).toHaveLength(2);
    });

    it('gets segment with nodes', () => {
      const result = getSegmentWithNodes(scenario1Segments[0], scenario1Nodes);
      expect(result.segment).toBe(scenario1Segments[0]);
      expect(result.nodes).toHaveLength(2);
    });

    it('gets link with nodes', () => {
      const result = getLinkWithNodes(scenario1Links[0], scenario1Nodes);
      expect(result).not.toBeNull();
      expect(result!.link).toBe(scenario1Links[0]);
      expect(result!.sourceNode.id).toBe(scenario1Links[0].sourceNodeId);
      expect(result!.targetNode.id).toBe(scenario1Links[0].targetNodeId);
    });

    it('returns null for link with missing nodes', () => {
      const result = getLinkWithNodes(scenario1Links[0], []);
      expect(result).toBeNull();
    });

    it('filters segments by discipline', () => {
      const result = getSegmentsByDiscipline(scenario1Segments, 'matematica');
      expect(result).toHaveLength(2);
    });

    it('filters segments by order', () => {
      const result = getSegmentsByOrder(scenario1Segments, 'primaria');
      expect(result).toHaveLength(1);
    });

    it('filters links by node', () => {
      const result = getLinksByNode(scenario1Links, 'node-numeri-prim5');
      expect(result).toHaveLength(2);
    });

    it('filters links by status', () => {
      const validated = getLinksByStatus(scenario1Links, 'validated');
      expect(validated).toHaveLength(2);
      const proposed = getLinksByStatus(scenario1Links, 'proposed');
      expect(proposed).toHaveLength(1);
    });

    it('filters nodes by segment', () => {
      const result = getNodesBySegment(scenario1Nodes, 'seg-mat-prim-5');
      expect(result).toHaveLength(2);
    });

    it('filters nodes by type', () => {
      const result = getNodesByType(scenario1Nodes, 'competence');
      expect(result).toHaveLength(5);
    });
  });

  describe('Scenario 2 — Interdisciplinary', () => {
    it('has correct interdisciplinary links', () => {
      expect(scenario2Links).toHaveLength(2);
      expect(scenario2Links[0].relationType).toBe('integration');
    });

    it('links cross discipline boundaries', () => {
      const tecSegment = scenario2Segments.find(s => s.disciplineOrField === 'tecnologia');
      const matSegment = scenario2Segments.find(s => s.disciplineOrField === 'matematica');
      expect(tecSegment).toBeDefined();
      expect(matSegment).toBeDefined();
      expect(tecSegment!.schoolOrder).toBe(matSegment!.schoolOrder);
    });
  });

  describe('Scenario 3 — Discontinuity', () => {
    it('has rejected link for discontinued relation', () => {
      const rejectedLink = scenario3Links.find(l => l.status === 'rejected');
      expect(rejectedLink).toBeDefined();
      expect(rejectedLink!.relationType).toBe('discontinuity');
    });

    it('has proposed link for new relation', () => {
      const proposedLink = scenario3Links.find(l => l.status === 'proposed');
      expect(proposedLink).toBeDefined();
    });

    it('represents version evolution', () => {
      expect(scenario3Version.versionNumber).toBe(2);
      expect(scenario3Version.previousVersionId).toBe('version-scenario-3-v1');
    });
  });
});
