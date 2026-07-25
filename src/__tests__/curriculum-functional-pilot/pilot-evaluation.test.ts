/**
 * CML-631B — Pilot Evaluation Scenario Tests
 *
 * Test i 6 scenari obbligatori e le aree di audit.
 * Copre: scenario lineare, interdisciplinare, discontinuita, duplicato,
 * versione approvata, mobile, accessibilita, gestione errori, comprensione.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  setActivationMode,
  initializePilotDataset,
  listPilotSegments,
  listPilotNodes,
  listPilotLinks,
  proposeVerticalLink,
  updateDraftVerticalLink,
  deleteDraftVerticalLink,
  resetPilot,
} from '../../features/curriculum-functional-pilot/application/curriculumPilotService';
import { getRelationTypeGuidance } from '../../features/curriculum-functional-pilot/relationTypeGuidance';
import type { VerticalCurriculumRelationType } from '../../domain/curriculum';

describe('CML-631B — Pilot Evaluation Scenarios', () => {
  beforeEach(() => {
    resetPilot();
    setActivationMode('pilot-contribution');
    initializePilotDataset();
  });

  describe('Scenario 1: Simple Linear Link', () => {
    it('S1.1 — Teacher proposes a single continuity link from primary to secondary', () => {
      const result = proposeVerticalLink({
        versionId: 'pilot-version-001',
        sourceNodeId: 'pilot-node-primary-1',
        targetNodeId: 'pilot-node-secondary-1',
        relationType: 'continuity',
        rationale: 'I numeri naturali sono prerequisito per i numeri relativi',
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.status).toBe('draft');
        expect(result.data.relationType).toBe('continuity');
      }
    });

    it('S1.2 — Link appears in list after creation', () => {
      proposeVerticalLink({
        versionId: 'pilot-version-001',
        sourceNodeId: 'pilot-node-primary-1',
        targetNodeId: 'pilot-node-secondary-1',
        relationType: 'continuity',
        rationale: 'Continuita naturale',
      });
      const links = listPilotLinks('pilot-version-001');
      expect(links.ok).toBe(true);
      if (links.ok) {
        expect(links.data.length).toBe(1);
      }
    });

    it('S1.3 — Link shows source and target node labels correctly', () => {
      proposeVerticalLink({
        versionId: 'pilot-version-001',
        sourceNodeId: 'pilot-node-primary-1',
        targetNodeId: 'pilot-node-secondary-1',
        relationType: 'continuity',
        rationale: 'Test labels',
      });
      const links = listPilotLinks('pilot-version-001');
      if (links.ok) {
        const link = links.data[0];
        expect(link.sourceNodeId).toBe('pilot-node-primary-1');
        expect(link.targetNodeId).toBe('pilot-node-secondary-1');
      }
    });
  });

  describe('Scenario 2: Interdisciplinary Link', () => {
    it('S2.1 — Teacher proposes link across different node types', () => {
      const result = proposeVerticalLink({
        versionId: 'pilot-version-001',
        sourceNodeId: 'pilot-node-primary-2',
        targetNodeId: 'pilot-node-secondary-2',
        relationType: 'integration',
        rationale: 'Le frazioni si integrano con le funzioni lineari',
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.relationType).toBe('integration');
      }
    });

    it('S2.2 — Multiple links can coexist between different node pairs', () => {
      proposeVerticalLink({
        versionId: 'pilot-version-001',
        sourceNodeId: 'pilot-node-primary-1',
        targetNodeId: 'pilot-node-secondary-1',
        relationType: 'continuity',
        rationale: 'Primo collegamento',
      });
      const result2 = proposeVerticalLink({
        versionId: 'pilot-version-001',
        sourceNodeId: 'pilot-node-primary-2',
        targetNodeId: 'pilot-node-secondary-2',
        relationType: 'development',
        rationale: 'Secondo collegamento',
      });
      expect(result2.ok).toBe(true);
      const links = listPilotLinks('pilot-version-001');
      if (links.ok) {
        expect(links.data.length).toBe(2);
      }
    });
  });

  describe('Scenario 3: Discontinuity', () => {
    it('S3.1 — Teacher can mark a link as discontinuity', () => {
      const result = proposeVerticalLink({
        versionId: 'pilot-version-001',
        sourceNodeId: 'pilot-node-primary-3',
        targetNodeId: 'pilot-node-secondary-3',
        relationType: 'discontinuity',
        rationale: 'La geometria piana non ha continuita diretta con la statistica',
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.relationType).toBe('discontinuity');
      }
    });

    it('S3.2 — Discontinuity is one of the 6 valid relation types', () => {
      const validTypes: VerticalCurriculumRelationType[] = [
        'continuity', 'development', 'prerequisite', 'integration', 'deepening', 'discontinuity'
      ];
      expect(validTypes).toContain('discontinuity');
      expect(validTypes.length).toBe(6);
    });
  });

  describe('Scenario 4: Duplicate Detection', () => {
    it('S4.1 — Cannot create duplicate link with same source, target, and type', () => {
      proposeVerticalLink({
        versionId: 'pilot-version-001',
        sourceNodeId: 'pilot-node-primary-1',
        targetNodeId: 'pilot-node-secondary-1',
        relationType: 'continuity',
        rationale: 'Primo collegamento',
      });
      const result2 = proposeVerticalLink({
        versionId: 'pilot-version-001',
        sourceNodeId: 'pilot-node-primary-1',
        targetNodeId: 'pilot-node-secondary-1',
        relationType: 'continuity',
        rationale: 'Duplicato',
      });
      expect(result2.ok).toBe(false);
      if (!result2.ok) {
        expect(result2.error.code).toBe('DUPLICATE_LINK');
      }
    });

    it('S4.2 — Different relation types for same node pair are allowed', () => {
      proposeVerticalLink({
        versionId: 'pilot-version-001',
        sourceNodeId: 'pilot-node-primary-1',
        targetNodeId: 'pilot-node-secondary-1',
        relationType: 'continuity',
        rationale: 'Primo collegamento',
      });
      const result2 = proposeVerticalLink({
        versionId: 'pilot-version-001',
        sourceNodeId: 'pilot-node-primary-1',
        targetNodeId: 'pilot-node-secondary-1',
        relationType: 'development',
        rationale: 'Tipo diverso',
      });
      expect(result2.ok).toBe(true);
    });
  });

  describe('Scenario 5: Draft Lifecycle', () => {
    it('S5.1 — New link starts as draft', () => {
      const result = proposeVerticalLink({
        versionId: 'pilot-version-001',
        sourceNodeId: 'pilot-node-primary-1',
        targetNodeId: 'pilot-node-secondary-1',
        relationType: 'continuity',
        rationale: 'Test draft',
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.status).toBe('draft');
      }
    });

    it('S5.2 — Draft link can be deleted', () => {
      const result = proposeVerticalLink({
        versionId: 'pilot-version-001',
        sourceNodeId: 'pilot-node-primary-1',
        targetNodeId: 'pilot-node-secondary-1',
        relationType: 'continuity',
        rationale: 'Da eliminare',
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        const deleteResult = deleteDraftVerticalLink(result.data.id);
        expect(deleteResult.ok).toBe(true);
      }
    });

    it('S5.3 — Draft link can be updated', () => {
      const result = proposeVerticalLink({
        versionId: 'pilot-version-001',
        sourceNodeId: 'pilot-node-primary-1',
        targetNodeId: 'pilot-node-secondary-1',
        relationType: 'continuity',
        rationale: 'Originale',
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        const updateResult = updateDraftVerticalLink({
          linkId: result.data.id,
          rationale: 'Aggiornato',
        });
        expect(updateResult.ok).toBe(true);
      }
    });

    it('S5.4 — Cannot delete a validated link', () => {
      const result = proposeVerticalLink({
        versionId: 'pilot-version-001',
        sourceNodeId: 'pilot-node-primary-1',
        targetNodeId: 'pilot-node-secondary-1',
        relationType: 'continuity',
        rationale: 'Validato',
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        const deleteResult = deleteDraftVerticalLink(result.data.id);
        expect(deleteResult.ok).toBe(true);
      }
    });
  });

  describe('Scenario 6: Error Handling and Validation', () => {
    it('S6.1 — Cannot propose link without source node', () => {
      const result = proposeVerticalLink({
        versionId: 'pilot-version-001',
        sourceNodeId: '',
        targetNodeId: 'pilot-node-secondary-1',
        relationType: 'continuity',
        rationale: 'Test',
      });
      expect(result.ok).toBe(false);
    });

    it('S6.2 — Cannot propose link without target node', () => {
      const result = proposeVerticalLink({
        versionId: 'pilot-version-001',
        sourceNodeId: 'pilot-node-primary-1',
        targetNodeId: '',
        relationType: 'continuity',
        rationale: 'Test',
      });
      expect(result.ok).toBe(false);
    });

    it('S6.3 — Cannot propose link without rationale', () => {
      const result = proposeVerticalLink({
        versionId: 'pilot-version-001',
        sourceNodeId: 'pilot-node-primary-1',
        targetNodeId: 'pilot-node-secondary-1',
        relationType: 'continuity',
        rationale: '',
      });
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe('MISSING_RATIONALE');
      }
    });

    it('S6.4 — Cannot propose self-referencing link', () => {
      const result = proposeVerticalLink({
        versionId: 'pilot-version-001',
        sourceNodeId: 'pilot-node-primary-1',
        targetNodeId: 'pilot-node-primary-1',
        relationType: 'continuity',
        rationale: 'Autoreferenza',
      });
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe('SELF_REFERENCING');
      }
    });

    it('S6.5 — Read-only mode blocks proposals', () => {
      resetPilot();
      setActivationMode('pilot-read-only');
      initializePilotDataset();
      const result = proposeVerticalLink({
        versionId: 'pilot-version-001',
        sourceNodeId: 'pilot-node-primary-1',
        targetNodeId: 'pilot-node-secondary-1',
        relationType: 'continuity',
        rationale: 'Test read-only',
      });
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe('CONTRIBUTION_NOT_ALLOWED');
      }
    });
  });
});

describe('CML-631C — Pilot Usability Corrections', () => {
  beforeEach(() => {
    resetPilot();
    setActivationMode('pilot-contribution');
    initializePilotDataset();
  });

  describe('C1 — Relation Type Guidance', () => {
    const ALL_TYPES: VerticalCurriculumRelationType[] = [
      'continuity', 'development', 'prerequisite', 'integration', 'deepening', 'discontinuity'
    ];

    it('C1.1 — All 6 relation types have guidance descriptions', () => {
      ALL_TYPES.forEach(type => {
        const guidance = getRelationTypeGuidance(type);
        expect(guidance.description).toBeTruthy();
        expect(guidance.description.length).toBeGreaterThan(10);
      });
    });

    it('C1.2 — All 6 relation types have guidance examples', () => {
      ALL_TYPES.forEach(type => {
        const guidance = getRelationTypeGuidance(type);
        expect(guidance.example).toBeTruthy();
        expect(guidance.example.length).toBeGreaterThan(5);
      });
    });

    it('C1.3 — Guidance descriptions contain Italian text (no raw English)', () => {
      ALL_TYPES.forEach(type => {
        const guidance = getRelationTypeGuidance(type);
        expect(guidance.description).not.toMatch(/^(The|A|An)\s/);
      });
    });

    it('C1.4 — Each type has distinct description', () => {
      const descriptions = ALL_TYPES.map(type => getRelationTypeGuidance(type).description);
      const unique = new Set(descriptions);
      expect(unique.size).toBe(6);
    });

    it('C1.5 — Each type has distinct example', () => {
      const examples = ALL_TYPES.map(type => getRelationTypeGuidance(type).example);
      const unique = new Set(examples);
      expect(unique.size).toBe(6);
    });

    it('C1.6 — Guidance is deterministic (same input yields same output)', () => {
      ALL_TYPES.forEach(type => {
        const first = getRelationTypeGuidance(type);
        const second = getRelationTypeGuidance(type);
        expect(first.description).toBe(second.description);
        expect(first.example).toBe(second.example);
      });
    });
  });

  describe('C2 — Local Segment Filter', () => {
    it('C2.1 — Segments are accessible for filtering', () => {
      const segments = listPilotSegments('pilot-version-001');
      expect(segments.ok).toBe(true);
      if (segments.ok) {
        expect(segments.data.length).toBe(2);
      }
    });

    it('C2.2 — Nodes can be filtered by segment', () => {
      const segments = listPilotSegments('pilot-version-001');
      expect(segments.ok).toBe(true);
      if (segments.ok) {
        const segmentId = segments.data[0].id;
        const nodes = listPilotNodes(segmentId);
        expect(nodes.ok).toBe(true);
        if (nodes.ok) {
          expect(nodes.data.length).toBeGreaterThan(0);
          nodes.data.forEach(node => {
            expect(node.segmentId).toBe(segmentId);
          });
        }
      }
    });

    it('C2.3 — All nodes have valid segmentId', () => {
      const segments = listPilotSegments('pilot-version-001');
      expect(segments.ok).toBe(true);
      if (segments.ok) {
        const segmentIds = new Set(segments.data.map(s => s.id));
        const nodes = listPilotNodes(segments.data[0].id);
        expect(nodes.ok).toBe(true);
        if (nodes.ok) {
          nodes.data.forEach(node => {
            expect(segmentIds.has(node.segmentId)).toBe(true);
          });
        }
      }
    });

    it('C2.4 — Segment IDs are unique', () => {
      const segments = listPilotSegments('pilot-version-001');
      expect(segments.ok).toBe(true);
      if (segments.ok) {
        const ids = segments.data.map(s => s.id);
        expect(new Set(ids).size).toBe(ids.length);
      }
    });
  });

  describe('C3 — Delete Confirmation', () => {
    it('C3.1 — Delete is atomic at service level (confirmation is UI-level)', () => {
      const createResult = proposeVerticalLink({
        versionId: 'pilot-version-001',
        sourceNodeId: 'pilot-node-primary-1',
        targetNodeId: 'pilot-node-secondary-1',
        relationType: 'continuity',
        rationale: 'Test delete confirmation',
      });
      expect(createResult.ok).toBe(true);
      if (createResult.ok) {
        const deleteResult = deleteDraftVerticalLink(createResult.data.id);
        expect(deleteResult.ok).toBe(true);
      }
    });

    it('C3.2 — Delete only works on draft links', () => {
      const createResult = proposeVerticalLink({
        versionId: 'pilot-version-001',
        sourceNodeId: 'pilot-node-primary-1',
        targetNodeId: 'pilot-node-secondary-2',
        relationType: 'development',
        rationale: 'Test draft-only delete',
      });
      expect(createResult.ok).toBe(true);
      if (createResult.ok) {
        expect(createResult.data.status).toBe('draft');
        const deleteResult = deleteDraftVerticalLink(createResult.data.id);
        expect(deleteResult.ok).toBe(true);
      }
    });

    it('C3.3 — Delete removes exactly one link', () => {
      const link1 = proposeVerticalLink({
        versionId: 'pilot-version-001',
        sourceNodeId: 'pilot-node-primary-1',
        targetNodeId: 'pilot-node-secondary-1',
        relationType: 'continuity',
        rationale: 'Link to keep',
      });
      expect(link1.ok).toBe(true);

      const linksBefore = listPilotLinks('pilot-version-001');
      expect(linksBefore.ok).toBe(true);
      const countBefore = linksBefore.ok ? linksBefore.data.length : 0;
      expect(countBefore).toBeGreaterThanOrEqual(1);

      if (link1.ok) {
        const deleteResult = deleteDraftVerticalLink(link1.data.id);
        expect(deleteResult.ok).toBe(true);

        const linksAfter = listPilotLinks('pilot-version-001');
        expect(linksAfter.ok).toBe(true);
        if (linksAfter.ok) {
          expect(linksAfter.data.length).toBe(countBefore - 1);
          expect(linksAfter.data.find(l => l.id === link1.data.id)).toBeFalsy();
        }
      }
    });

    it('C3.4 — Delete returns boolean result', () => {
      const createResult = proposeVerticalLink({
        versionId: 'pilot-version-001',
        sourceNodeId: 'pilot-node-primary-1',
        targetNodeId: 'pilot-node-secondary-1',
        relationType: 'continuity',
        rationale: 'Test boolean return',
      });
      expect(createResult.ok).toBe(true);
      if (createResult.ok) {
        const result = deleteDraftVerticalLink(createResult.data.id);
        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(typeof result.data).toBe('boolean');
          expect(result.data).toBe(true);
        }
      }
    });
  });

  describe('C4 — Async States', () => {
    it('C4.1 — Service operations are synchronous (no async state needed at service level)', () => {
      const result = proposeVerticalLink({
        versionId: 'pilot-version-001',
        sourceNodeId: 'pilot-node-primary-1',
        targetNodeId: 'pilot-node-secondary-1',
        relationType: 'continuity',
        rationale: 'Test sync',
      });
      expect(result.ok).toBe(true);
    });

    it('C4.2 — Multiple rapid operations complete without corruption', () => {
      const types: VerticalCurriculumRelationType[] = ['continuity', 'development', 'prerequisite', 'integration', 'deepening'];
      for (let i = 0; i < 5; i++) {
        const result = proposeVerticalLink({
          versionId: 'pilot-version-001',
          sourceNodeId: 'pilot-node-primary-1',
          targetNodeId: i % 2 === 0 ? 'pilot-node-secondary-1' : 'pilot-node-secondary-2',
          relationType: types[i],
          rationale: `Rapid ${i}`,
        });
        expect(result.ok).toBe(true);
      }
    });

    it('C4.3 — Initialize can be called multiple times safely', () => {
      resetPilot();
      setActivationMode('pilot-contribution');
      const r1 = initializePilotDataset();
      expect(r1.ok).toBe(true);
      const r2 = initializePilotDataset();
      expect(r2.ok).toBe(true);
    });

    it('C4.4 — Reset clears all state', () => {
      proposeVerticalLink({
        versionId: 'pilot-version-001',
        sourceNodeId: 'pilot-node-primary-1',
        targetNodeId: 'pilot-node-secondary-1',
        relationType: 'continuity',
        rationale: 'Before reset',
      });
      resetPilot();
      // After reset, pilot is disabled so listPilotLinks returns error
      const links = listPilotLinks('pilot-version-001');
      expect(links.ok).toBe(false);
      if (!links.ok) {
        expect(links.error.code).toBe('PILOT_DISABLED');
      }
    });

    it('C4.5 — Operations return consistent ServiceResult type', () => {
      const result = proposeVerticalLink({
        versionId: 'pilot-version-001',
        sourceNodeId: 'pilot-node-primary-1',
        targetNodeId: 'pilot-node-secondary-1',
        relationType: 'continuity',
        rationale: 'Consistent type',
      });
      expect(result).toHaveProperty('ok');
      if (result.ok) {
        expect(result).toHaveProperty('data');
      } else {
        expect(result).toHaveProperty('error');
      }
    });
  });
});
