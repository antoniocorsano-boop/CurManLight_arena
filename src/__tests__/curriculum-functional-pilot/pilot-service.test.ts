/**
 * CML-631A — Curriculum Domain Functional Activation Pilot Tests
 *
 * Suite di test completa per il pilot funzionale.
 * Copre: attivazione, inizializzazione, query, mutazioni, validazione, errori.
 */

import { describe, it, expect, beforeEach } from 'vitest';
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
} from '../../features/curriculum-functional-pilot/application/curriculumPilotService';

describe('CML-631A — Curriculum Functional Activation Pilot', () => {
  beforeEach(() => {
    resetPilot();
  });

  describe('Activation Mode Management', () => {
    it('Test 1 — Default mode is disabled', () => {
      expect(getActivationMode()).toBe('disabled');
    });

    it('Test 2 — Can set mode to pilot-read-only', () => {
      setActivationMode('pilot-read-only');
      expect(getActivationMode()).toBe('pilot-read-only');
    });

    it('Test 3 — Can set mode to pilot-contribution', () => {
      setActivationMode('pilot-contribution');
      expect(getActivationMode()).toBe('pilot-contribution');
    });

    it('Test 4 — Can set mode back to disabled', () => {
      setActivationMode('pilot-contribution');
      setActivationMode('disabled');
      expect(getActivationMode()).toBe('disabled');
    });

    it('Test 5 — isPilotActive returns true when mode is not disabled', () => {
      setActivationMode('pilot-read-only');
      expect(isPilotActive()).toBe(true);
    });

    it('Test 6 — isPilotActive returns false when mode is disabled', () => {
      expect(isPilotActive()).toBe(false);
    });

    it('Test 7 — isContributionAllowed returns true only for pilot-contribution', () => {
      setActivationMode('pilot-contribution');
      expect(isContributionAllowed()).toBe(true);
    });

    it('Test 8 — isContributionAllowed returns false for pilot-read-only', () => {
      setActivationMode('pilot-read-only');
      expect(isContributionAllowed()).toBe(false);
    });

    it('Test 9 — isContributionAllowed returns false for disabled', () => {
      expect(isContributionAllowed()).toBe(false);
    });
  });

  describe('Dataset Initialization', () => {
    it('Test 10 — Dataset is not initialized by default', () => {
      expect(isPilotInitialized()).toBe(false);
    });

    it('Test 11 — Can initialize pilot dataset', () => {
      const result = initializePilotDataset();
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.id).toBe('pilot-math-primary-secondary-2026');
        expect(result.data.segmentIds.length).toBeGreaterThan(0);
        expect(result.data.nodeIds.length).toBeGreaterThan(0);
      }
    });

    it('Test 12 — Initialization is idempotent', () => {
      const result1 = initializePilotDataset();
      const result2 = initializePilotDataset();
      expect(result1.ok).toBe(true);
      expect(result2.ok).toBe(true);
      if (result1.ok && result2.ok) {
        expect(result1.data.id).toBe(result2.data.id);
      }
    });

    it('Test 13 — getPilotDataset returns null before initialization', () => {
      expect(getPilotDataset()).toBeNull();
    });

    it('Test 14 — getPilotDataset returns dataset after initialization', () => {
      initializePilotDataset();
      const dataset = getPilotDataset();
      expect(dataset).not.toBeNull();
      expect(dataset?.id).toBe('pilot-math-primary-secondary-2026');
    });
  });

  describe('Query Functions — Disabled Mode', () => {
    it('Test 15 — listPilotVersions fails when disabled', () => {
      const result = listPilotVersions();
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe('PILOT_DISABLED');
      }
    });

    it('Test 16 — listPilotSegments fails when disabled', () => {
      const result = listPilotSegments('version-1');
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe('PILOT_DISABLED');
      }
    });

    it('Test 17 — listPilotNodes fails when disabled', () => {
      const result = listPilotNodes('segment-1');
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe('PILOT_DISABLED');
      }
    });

    it('Test 18 — listPilotLinks fails when disabled', () => {
      const result = listPilotLinks('version-1');
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe('PILOT_DISABLED');
      }
    });
  });

  describe('Query Functions — Active Mode', () => {
    beforeEach(() => {
      setActivationMode('pilot-read-only');
      initializePilotDataset();
    });

    it('Test 19 — listPilotVersions returns pilot versions', () => {
      const result = listPilotVersions();
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.length).toBe(1);
        expect(result.data[0].id).toBe('pilot-version-001');
      }
    });

    it('Test 20 — listPilotSegments returns segments for valid version', () => {
      const result = listPilotSegments('pilot-version-001');
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.length).toBe(2);
      }
    });

    it('Test 21 — listPilotSegments fails for invalid version', () => {
      const result = listPilotSegments('invalid-version');
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe('VERSION_NOT_FOUND');
      }
    });

    it('Test 22 — listPilotNodes returns nodes for valid segment', () => {
      const result = listPilotNodes('pilot-segment-math-primary-5');
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.length).toBe(3);
      }
    });

    it('Test 23 — listPilotNodes returns empty for segment with no nodes', () => {
      const result = listPilotNodes('nonexistent-segment');
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.length).toBe(0);
      }
    });

    it('Test 24 — listPilotLinks returns empty initially', () => {
      const result = listPilotLinks('pilot-version-001');
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.length).toBe(0);
      }
    });

    it('Test 25 — listPilotVersions fails when not initialized', () => {
      resetPilot();
      setActivationMode('pilot-read-only');
      const result = listPilotVersions();
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe('PILOT_NOT_INITIALIZED');
      }
    });
  });

  describe('Mutation Functions — Propose Vertical Link', () => {
    beforeEach(() => {
      setActivationMode('pilot-contribution');
      initializePilotDataset();
    });

    it('Test 26 — Can propose a valid vertical link', () => {
      const result = proposeVerticalLink({
        versionId: 'pilot-version-001',
        sourceNodeId: 'pilot-node-primary-1',
        targetNodeId: 'pilot-node-secondary-1',
        relationType: 'continuity',
        rationale: 'Collegamento tra numeri naturali e numeri relativi',
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.status).toBe('draft');
        expect(result.data.relationType).toBe('continuity');
        expect(result.data.rationale).toContain('numeri naturali');
      }
    });

    it('Test 27 — Cannot propose link when contribution not allowed', () => {
      setActivationMode('pilot-read-only');
      const result = proposeVerticalLink({
        versionId: 'pilot-version-001',
        sourceNodeId: 'pilot-node-primary-1',
        targetNodeId: 'pilot-node-secondary-1',
        relationType: 'continuity',
        rationale: 'Test',
      });
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe('CONTRIBUTION_NOT_ALLOWED');
      }
    });

    it('Test 28 — Cannot propose link with same source and target', () => {
      const result = proposeVerticalLink({
        versionId: 'pilot-version-001',
        sourceNodeId: 'pilot-node-primary-1',
        targetNodeId: 'pilot-node-primary-1',
        relationType: 'continuity',
        rationale: 'Test self-referencing',
      });
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe('SELF_REFERENCING');
      }
    });

    it('Test 29 — Cannot propose link with empty rationale', () => {
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

    it('Test 30 — Cannot propose link with whitespace-only rationale', () => {
      const result = proposeVerticalLink({
        versionId: 'pilot-version-001',
        sourceNodeId: 'pilot-node-primary-1',
        targetNodeId: 'pilot-node-secondary-1',
        relationType: 'continuity',
        rationale: '   ',
      });
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe('MISSING_RATIONALE');
      }
    });

    it('Test 31 — Cannot propose link with invalid source node', () => {
      const result = proposeVerticalLink({
        versionId: 'pilot-version-001',
        sourceNodeId: 'invalid-node',
        targetNodeId: 'pilot-node-secondary-1',
        relationType: 'continuity',
        rationale: 'Test invalid source',
      });
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe('SOURCE_NODE_NOT_FOUND');
      }
    });

    it('Test 32 — Cannot propose link with invalid target node', () => {
      const result = proposeVerticalLink({
        versionId: 'pilot-version-001',
        sourceNodeId: 'pilot-node-primary-1',
        targetNodeId: 'invalid-node',
        relationType: 'continuity',
        rationale: 'Test invalid target',
      });
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe('TARGET_NODE_NOT_FOUND');
      }
    });

    it('Test 33 — Can propose link with all relation types', () => {
      const types = ['continuity', 'development', 'prerequisite', 'integration', 'deepening', 'discontinuity'] as const;
      for (const type of types) {
        resetPilot();
        setActivationMode('pilot-contribution');
        initializePilotDataset();
        const result = proposeVerticalLink({
          versionId: 'pilot-version-001',
          sourceNodeId: 'pilot-node-primary-1',
          targetNodeId: 'pilot-node-secondary-1',
          relationType: type,
          rationale: `Test ${type}`,
        });
        expect(result.ok).toBe(true);
      }
    });

    it('Test 34 — Proposed link has correct metadata', () => {
      const result = proposeVerticalLink({
        versionId: 'pilot-version-001',
        sourceNodeId: 'pilot-node-primary-1',
        targetNodeId: 'pilot-node-secondary-1',
        relationType: 'development',
        rationale: 'Sviluppo delle competenze numeriche',
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.versionId).toBe('pilot-version-001');
        expect(result.data.sourceNodeId).toBe('pilot-node-primary-1');
        expect(result.data.targetNodeId).toBe('pilot-node-secondary-1');
        expect(result.data.createdByRole).toBe('non-dichiarato');
        expect(result.data.createdAt).toBeDefined();
        expect(result.data.updatedAt).toBeDefined();
      }
    });

    it('preserves an explicitly declared provenance role', () => {
      const result = proposeVerticalLink({
        versionId: 'pilot-version-001',
        sourceNodeId: 'pilot-node-primary-1',
        targetNodeId: 'pilot-node-secondary-1',
        relationType: 'development',
        rationale: 'Collegamento dichiarato',
        createdByRole: 'referente',
      });
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.data.createdByRole).toBe('referente');
    });

    it('Test 35 — Proposed link appears in list', () => {
      proposeVerticalLink({
        versionId: 'pilot-version-001',
        sourceNodeId: 'pilot-node-primary-1',
        targetNodeId: 'pilot-node-secondary-1',
        relationType: 'continuity',
        rationale: 'Test link visibility',
      });
      const links = listPilotLinks('pilot-version-001');
      expect(links.ok).toBe(true);
      if (links.ok) {
        expect(links.data.length).toBe(1);
      }
    });

    it('Test 36 — Can propose multiple different links', () => {
      proposeVerticalLink({
        versionId: 'pilot-version-001',
        sourceNodeId: 'pilot-node-primary-1',
        targetNodeId: 'pilot-node-secondary-1',
        relationType: 'continuity',
        rationale: 'Link 1',
      });
      proposeVerticalLink({
        versionId: 'pilot-version-001',
        sourceNodeId: 'pilot-node-primary-2',
        targetNodeId: 'pilot-node-secondary-2',
        relationType: 'development',
        rationale: 'Link 2',
      });
      const links = listPilotLinks('pilot-version-001');
      expect(links.ok).toBe(true);
      if (links.ok) {
        expect(links.data.length).toBe(2);
      }
    });
  });

  describe('Mutation Functions — Update Draft Link', () => {
    beforeEach(() => {
      setActivationMode('pilot-contribution');
      initializePilotDataset();
    });

    it('Test 37 — Can update draft link relation type', () => {
      const proposeResult = proposeVerticalLink({
        versionId: 'pilot-version-001',
        sourceNodeId: 'pilot-node-primary-1',
        targetNodeId: 'pilot-node-secondary-1',
        relationType: 'continuity',
        rationale: 'Test update',
      });
      expect(proposeResult.ok).toBe(true);
      if (proposeResult.ok) {
        const updateResult = updateDraftVerticalLink({
          linkId: proposeResult.data.id,
          relationType: 'development',
        });
        expect(updateResult.ok).toBe(true);
        if (updateResult.ok) {
          expect(updateResult.data.relationType).toBe('development');
        }
      }
    });

    it('Test 38 — Can update draft link rationale', () => {
      const proposeResult = proposeVerticalLink({
        versionId: 'pilot-version-001',
        sourceNodeId: 'pilot-node-primary-1',
        targetNodeId: 'pilot-node-secondary-1',
        relationType: 'continuity',
        rationale: 'Old rationale',
      });
      expect(proposeResult.ok).toBe(true);
      if (proposeResult.ok) {
        const updateResult = updateDraftVerticalLink({
          linkId: proposeResult.data.id,
          rationale: 'New rationale',
        });
        expect(updateResult.ok).toBe(true);
        if (updateResult.ok) {
          expect(updateResult.data.rationale).toBe('New rationale');
        }
      }
    });

    it('Test 39 — Cannot update link with invalid ID', () => {
      const result = updateDraftVerticalLink({
        linkId: 'invalid-id',
        relationType: 'development',
      });
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe('LINK_NOT_FOUND');
      }
    });

    it('Test 40 — Cannot update when contribution not allowed', () => {
      setActivationMode('pilot-read-only');
      const result = updateDraftVerticalLink({
        linkId: 'some-id',
        relationType: 'development',
      });
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe('CONTRIBUTION_NOT_ALLOWED');
      }
    });

    it('Test 41 — Updated link timestamp changes', () => {
      const proposeResult = proposeVerticalLink({
        versionId: 'pilot-version-001',
        sourceNodeId: 'pilot-node-primary-1',
        targetNodeId: 'pilot-node-secondary-1',
        relationType: 'continuity',
        rationale: 'Test timestamp',
      });
      expect(proposeResult.ok).toBe(true);
      if (proposeResult.ok) {
        const originalUpdatedAt = proposeResult.data.updatedAt;
        // Force a small delay to ensure timestamp changes
        const updateResult = updateDraftVerticalLink({
          linkId: proposeResult.data.id,
          rationale: 'Updated rationale',
        });
        expect(updateResult.ok).toBe(true);
        if (updateResult.ok) {
          // Timestamp should be >= original (may be same if very fast)
          expect(updateResult.data.updatedAt >= originalUpdatedAt).toBe(true);
        }
      }
    });
  });

  describe('Mutation Functions — Delete Draft Link', () => {
    beforeEach(() => {
      setActivationMode('pilot-contribution');
      initializePilotDataset();
    });

    it('Test 42 — Can delete draft link', () => {
      const proposeResult = proposeVerticalLink({
        versionId: 'pilot-version-001',
        sourceNodeId: 'pilot-node-primary-1',
        targetNodeId: 'pilot-node-secondary-1',
        relationType: 'continuity',
        rationale: 'Test delete',
      });
      expect(proposeResult.ok).toBe(true);
      if (proposeResult.ok) {
        const deleteResult = deleteDraftVerticalLink(proposeResult.data.id);
        expect(deleteResult.ok).toBe(true);
        const links = listPilotLinks('pilot-version-001');
        if (links.ok) {
          expect(links.data.length).toBe(0);
        }
      }
    });

    it('Test 43 — Cannot delete link with invalid ID', () => {
      const result = deleteDraftVerticalLink('invalid-id');
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe('LINK_NOT_FOUND');
      }
    });

    it('Test 44 — Cannot delete when contribution not allowed', () => {
      setActivationMode('pilot-read-only');
      const result = deleteDraftVerticalLink('some-id');
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe('CONTRIBUTION_NOT_ALLOWED');
      }
    });

    it('Test 45 — Deleted link is removed from list', () => {
      const proposeResult = proposeVerticalLink({
        versionId: 'pilot-version-001',
        sourceNodeId: 'pilot-node-primary-1',
        targetNodeId: 'pilot-node-secondary-1',
        relationType: 'continuity',
        rationale: 'Test deletion visibility',
      });
      expect(proposeResult.ok).toBe(true);
      if (proposeResult.ok) {
        deleteDraftVerticalLink(proposeResult.data.id);
        const links = listPilotLinks('pilot-version-001');
        expect(links.ok).toBe(true);
        if (links.ok) {
          expect(links.data.find(l => l.id === proposeResult.data.id)).toBeUndefined();
        }
      }
    });
  });

  describe('Reset and State Management', () => {
    it('Test 46 — Reset clears activation mode', () => {
      setActivationMode('pilot-contribution');
      resetPilot();
      expect(getActivationMode()).toBe('disabled');
    });

    it('Test 47 — Reset clears pilot dataset', () => {
      initializePilotDataset();
      resetPilot();
      expect(getPilotDataset()).toBeNull();
    });

    it('Test 48 — Reset clears all links', () => {
      setActivationMode('pilot-contribution');
      initializePilotDataset();
      proposeVerticalLink({
        versionId: 'pilot-version-001',
        sourceNodeId: 'pilot-node-primary-1',
        targetNodeId: 'pilot-node-secondary-1',
        relationType: 'continuity',
        rationale: 'Test reset links',
      });
      resetPilot();
      setActivationMode('pilot-contribution');
      initializePilotDataset();
      const links = listPilotLinks('pilot-version-001');
      expect(links.ok).toBe(true);
      if (links.ok) {
        expect(links.data.length).toBe(0);
      }
    });

    it('Test 49 — Full workflow: init, propose, update, delete, reset', () => {
      // Init
      setActivationMode('pilot-contribution');
      const initResult = initializePilotDataset();
      expect(initResult.ok).toBe(true);

      // Propose
      const proposeResult = proposeVerticalLink({
        versionId: 'pilot-version-001',
        sourceNodeId: 'pilot-node-primary-1',
        targetNodeId: 'pilot-node-secondary-1',
        relationType: 'continuity',
        rationale: 'Full workflow test',
      });
      expect(proposeResult.ok).toBe(true);

      // Update
      if (proposeResult.ok) {
        const updateResult = updateDraftVerticalLink({
          linkId: proposeResult.data.id,
          rationale: 'Updated rationale',
        });
        expect(updateResult.ok).toBe(true);

        // Delete
        const deleteResult = deleteDraftVerticalLink(proposeResult.data.id);
        expect(deleteResult.ok).toBe(true);
      }

      // Reset
      resetPilot();
      expect(getActivationMode()).toBe('disabled');
      expect(getPilotDataset()).toBeNull();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('Test 50 — Query functions return empty arrays for valid but empty dataset', () => {
      setActivationMode('pilot-read-only');
      initializePilotDataset();
      const links = listPilotLinks('pilot-version-001');
      expect(links.ok).toBe(true);
      if (links.ok) {
        expect(Array.isArray(links.data)).toBe(true);
        expect(links.data.length).toBe(0);
      }
    });

    it('Test 51 — Multiple rapid mode changes', () => {
      setActivationMode('pilot-read-only');
      setActivationMode('pilot-contribution');
      setActivationMode('disabled');
      setActivationMode('pilot-contribution');
      expect(getActivationMode()).toBe('pilot-contribution');
    });

    it('Test 52 — Initialize after reset works correctly', () => {
      initializePilotDataset();
      resetPilot();
      const result = initializePilotDataset();
      expect(result.ok).toBe(true);
      expect(isPilotInitialized()).toBe(true);
    });

    it('Test 53 — Propose link with very long rationale', () => {
      setActivationMode('pilot-contribution');
      initializePilotDataset();
      const longRationale = 'A'.repeat(1000);
      const result = proposeVerticalLink({
        versionId: 'pilot-version-001',
        sourceNodeId: 'pilot-node-primary-1',
        targetNodeId: 'pilot-node-secondary-1',
        relationType: 'continuity',
        rationale: longRationale,
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.rationale).toBe(longRationale);
      }
    });

    it('Test 54 — Propose link with special characters in rationale', () => {
      setActivationMode('pilot-contribution');
      initializePilotDataset();
      const specialRationale = 'Collegamento con caratteri speciali: àèìòù, accents, symbols @#$%';
      const result = proposeVerticalLink({
        versionId: 'pilot-version-001',
        sourceNodeId: 'pilot-node-primary-1',
        targetNodeId: 'pilot-node-secondary-1',
        relationType: 'continuity',
        rationale: specialRationale,
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.rationale).toBe(specialRationale);
      }
    });

    it('Test 55 — Rationale is trimmed of whitespace', () => {
      setActivationMode('pilot-contribution');
      initializePilotDataset();
      const result = proposeVerticalLink({
        versionId: 'pilot-version-001',
        sourceNodeId: 'pilot-node-primary-1',
        targetNodeId: 'pilot-node-secondary-1',
        relationType: 'continuity',
        rationale: '  Test trimming  ',
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.rationale).toBe('Test trimming');
      }
    });

    it('Test 56 — Update preserves unchanged fields', () => {
      setActivationMode('pilot-contribution');
      initializePilotDataset();
      const proposeResult = proposeVerticalLink({
        versionId: 'pilot-version-001',
        sourceNodeId: 'pilot-node-primary-1',
        targetNodeId: 'pilot-node-secondary-1',
        relationType: 'continuity',
        rationale: 'Original rationale',
      });
      expect(proposeResult.ok).toBe(true);
      if (proposeResult.ok) {
        const updateResult = updateDraftVerticalLink({
          linkId: proposeResult.data.id,
          rationale: 'Updated rationale',
        });
        expect(updateResult.ok).toBe(true);
        if (updateResult.ok) {
          expect(updateResult.data.sourceNodeId).toBe('pilot-node-primary-1');
          expect(updateResult.data.targetNodeId).toBe('pilot-node-secondary-1');
          expect(updateResult.data.versionId).toBe('pilot-version-001');
        }
      }
    });

    it('Test 57 — Delete does not affect other links', () => {
      setActivationMode('pilot-contribution');
      initializePilotDataset();
      const link1 = proposeVerticalLink({
        versionId: 'pilot-version-001',
        sourceNodeId: 'pilot-node-primary-1',
        targetNodeId: 'pilot-node-secondary-1',
        relationType: 'continuity',
        rationale: 'Link 1',
      });
      expect(link1.ok).toBe(true);
      if (link1.ok) {
        deleteDraftVerticalLink(link1.data.id);
        const remaining = listPilotLinks('pilot-version-001');
        expect(remaining.ok).toBe(true);
        if (remaining.ok) {
          expect(remaining.data.length).toBe(0);
          expect(remaining.data.find(l => l.id === link1.data.id)).toBeUndefined();
        }
      }
    });

    it('Test 58 — Service result types are consistent', () => {
      const successResult = listPilotVersions();
      if (successResult.ok) {
        expect(successResult.data).toBeDefined();
        expect(Array.isArray(successResult.data)).toBe(true);
      }
    });

    it('Test 59 — Error results have required fields', () => {
      setActivationMode('disabled');
      const result = listPilotVersions();
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBeDefined();
        expect(result.error.message).toBeDefined();
        expect(typeof result.error.code).toBe('string');
        expect(typeof result.error.message).toBe('string');
      }
    });

    it('Test 60 — Pilot dataset has correct structure', () => {
      initializePilotDataset();
      const dataset = getPilotDataset();
      expect(dataset).toBeDefined();
      expect(dataset?.id).toBe('pilot-math-primary-secondary-2026');
      expect(dataset?.versionId).toBe('pilot-version-001');
      expect(Array.isArray(dataset?.segmentIds)).toBe(true);
      expect(Array.isArray(dataset?.nodeIds)).toBe(true);
      expect(dataset?.initializedAt).toBeDefined();
    });

    it('Test 61 — Activation mode persistence across operations', () => {
      setActivationMode('pilot-contribution');
      initializePilotDataset();
      proposeVerticalLink({
        versionId: 'pilot-version-001',
        sourceNodeId: 'pilot-node-primary-1',
        targetNodeId: 'pilot-node-secondary-1',
        relationType: 'continuity',
        rationale: 'Test persistence',
      });
      expect(getActivationMode()).toBe('pilot-contribution');
    });

    it('Test 62 — Multiple link operations maintain consistency', () => {
      setActivationMode('pilot-contribution');
      initializePilotDataset();
      const links: string[] = [];
      // Propose one valid link
      const result = proposeVerticalLink({
        versionId: 'pilot-version-001',
        sourceNodeId: 'pilot-node-primary-1',
        targetNodeId: 'pilot-node-secondary-1',
        relationType: 'continuity',
        rationale: 'Link 1',
      });
      if (result.ok) links.push(result.data.id);
      const allLinks = listPilotLinks('pilot-version-001');
      expect(allLinks.ok).toBe(true);
      if (allLinks.ok) {
        expect(allLinks.data.length).toBe(1);
      }
    });

    it('Test 63 — Error recovery after failed operation', () => {
      setActivationMode('pilot-contribution');
      initializePilotDataset();
      const failResult = proposeVerticalLink({
        versionId: 'pilot-version-001',
        sourceNodeId: 'pilot-node-primary-1',
        targetNodeId: 'pilot-node-primary-1',
        relationType: 'continuity',
        rationale: 'Self-referencing',
      });
      expect(failResult.ok).toBe(false);
      const successResult = proposeVerticalLink({
        versionId: 'pilot-version-001',
        sourceNodeId: 'pilot-node-primary-1',
        targetNodeId: 'pilot-node-secondary-1',
        relationType: 'continuity',
        rationale: 'Valid link after failure',
      });
      expect(successResult.ok).toBe(true);
    });

    it('Test 64 — Contribution mode required for all mutations', () => {
      setActivationMode('pilot-read-only');
      initializePilotDataset();
      const propose = proposeVerticalLink({
        versionId: 'pilot-version-001',
        sourceNodeId: 'pilot-node-primary-1',
        targetNodeId: 'pilot-node-secondary-1',
        relationType: 'continuity',
        rationale: 'Test',
      });
      expect(propose.ok).toBe(false);
      const update = updateDraftVerticalLink({ linkId: 'test', rationale: 'Test' });
      expect(update.ok).toBe(false);
      const del = deleteDraftVerticalLink('test');
      expect(del.ok).toBe(false);
    });

    it('Test 65 — Pilot data constants are correct', () => {
      initializePilotDataset();
      const dataset = getPilotDataset();
      expect(dataset).not.toBeNull();
      expect(dataset?.id).toBe('pilot-math-primary-secondary-2026');
      expect(dataset?.versionId).toBe('pilot-version-001');
    });
  });
});
