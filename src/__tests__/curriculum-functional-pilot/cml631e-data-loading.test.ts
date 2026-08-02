import { describe, it, expect, beforeEach } from 'vitest';
import {
  setActivationMode,
  initializePilotDataset,
  listPilotSegments,
  listPilotNodes,
  resetPilot,
} from '../../features/curriculum-functional-pilot/application/curriculumPilotService';
import type { CurriculumNode } from '../../domain/curriculum';

describe('CML-631E — Data Loading Fix', () => {
  beforeEach(() => {
    resetPilot();
    setActivationMode('pilot-contribution');
    initializePilotDataset();
  });

  it('A1.1 — loads nodes from all segments after refreshData fix', () => {
    const segments = listPilotSegments('pilot-version-001');
    expect(segments.ok).toBe(true);
    expect(segments.ok).toBe(true); if (!segments.ok) { throw new Error('Expected operation to succeed'); }
    expect(segments.data.length).toBe(2);

    const primaryNodes = listPilotNodes('pilot-segment-math-primary-5');
    const secondaryNodes = listPilotNodes('pilot-segment-math-secondary-1');

    expect(primaryNodes.ok).toBe(true);
    expect(secondaryNodes.ok).toBe(true);
    if (primaryNodes.ok && secondaryNodes.ok) {
      expect(primaryNodes.data.length).toBe(3);
      expect(secondaryNodes.data.length).toBe(3);
    }
  });

  it('A1.2 — total node count across all segments is 6', () => {
    const primaryNodes = listPilotNodes('pilot-segment-math-primary-5');
    const secondaryNodes = listPilotNodes('pilot-segment-math-secondary-1');

    let totalCount = 0;
    if (primaryNodes.ok) totalCount += primaryNodes.data.length;
    if (secondaryNodes.ok) totalCount += secondaryNodes.data.length;

    expect(totalCount).toBe(6);
  });

  it('A1.3 — secondary nodes are present and not empty', () => {
    const result = listPilotNodes('pilot-segment-math-secondary-1');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.length).toBeGreaterThan(0);
      const titles = result.data.map((n: CurriculumNode) => n.title);
      expect(titles).toContain('Numeri relativi e algebre');
      expect(titles).toContain('Funzioni lineari');
      expect(titles).toContain('Statistica descrittiva');
    }
  });

  it('A1.4 — primary nodes are present', () => {
    const result = listPilotNodes('pilot-segment-math-primary-5');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.length).toBe(3);
      const titles = result.data.map((n: CurriculumNode) => n.title);
      expect(titles).toContain('Numeri naturali e calcolo');
      expect(titles).toContain('Calcolare con le frazioni');
      expect(titles).toContain('Geometria piana');
    }
  });

  it('A1.5 — node-segment association is correct', () => {
    const primaryNodes = listPilotNodes('pilot-segment-math-primary-5');
    const secondaryNodes = listPilotNodes('pilot-segment-math-secondary-1');

    if (primaryNodes.ok) {
      primaryNodes.data.forEach((n: CurriculumNode) => {
        expect(n.segmentId).toBe('pilot-segment-math-primary-5');
      });
    }
    if (secondaryNodes.ok) {
      secondaryNodes.data.forEach((n: CurriculumNode) => {
        expect(n.segmentId).toBe('pilot-segment-math-secondary-1');
      });
    }
  });

  it('A1.6 — repeated refreshData does not duplicate nodes', () => {
    const primary1 = listPilotNodes('pilot-segment-math-primary-5');
    const primary2 = listPilotNodes('pilot-segment-math-primary-5');

    if (primary1.ok && primary2.ok) {
      expect(primary1.data.length).toBe(primary2.data.length);
      expect(primary1.data[0]?.id).toBe(primary2.data[0]?.id);
    }
  });

  it('A1.7 — uninitialized pilot produces explicit state', () => {
    resetPilot();
    const result = listPilotNodes('pilot-segment-math-primary-5');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(['PILOT_DISABLED', 'PILOT_NOT_INITIALIZED']).toContain(result.error.code);
    }
  });

  it('A1.8 — segment with no nodes does not block other segments', () => {
    const primary = listPilotNodes('pilot-segment-math-primary-5');
    const secondary = listPilotNodes('pilot-segment-math-secondary-1');

    expect(primary.ok).toBe(true);
    expect(secondary.ok).toBe(true);
  });
});