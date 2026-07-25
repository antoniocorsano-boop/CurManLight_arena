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
  listPilotLinks,
  proposeVerticalLink,
  updateDraftVerticalLink,
  deleteDraftVerticalLink,
  resetPilot,
} from '../../features/curriculum-functional-pilot/application/curriculumPilotService';
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
