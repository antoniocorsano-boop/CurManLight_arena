import { describe, it, expect } from 'vitest';
import {
  createCurriculumSegment,
  createCurriculumNode,
  createSegmentReference,
  createCurriculumVersionReference,
} from '../../domain/curriculum/constructors';
import { validateCurriculumSegment, validateCurriculumNode } from '../../domain/curriculum/validation';
import { generateEntityId } from '../../domain/curriculum/identity/constructors';
import type { FrameworkApplicabilityReference } from '../../domain/curriculum/types';

describe('CURR-R2C — Minimal 2025 contract extension', () => {
  const versionId = generateEntityId();
  const segmentId = generateEntityId();
  const versionRef = createCurriculumVersionReference(versionId, 'Indicazioni nazionali 2025');
  const segmentRef = createSegmentReference(segmentId, 'Italiano');

  it('accepts normativeNodeKind objective-2012 on a node', () => {
    const node = createCurriculumNode(
      versionRef,
      segmentRef,
      'obiettivo',
      'Obiettivo - fine primaria',
      {
        normativeCheckpoint: 'end-primary',
        normativeNodeKind: 'objective-2012',
        provenance: 'normative',
        origin: 'normative-source',
      }
    );

    expect(node.normativeNodeKind).toBe('objective-2012');
    const result = validateCurriculumNode(node);
    expect(result.valid).toBe(true);
    expect(result.errors.filter((e: any) => e.severity === 'error')).toHaveLength(0);
  });

  it('accepts normativeNodeKind osa-2025 on a node', () => {
    const node = createCurriculumNode(
      versionRef,
      segmentRef,
      'obiettivo',
      'OSA - classe III',
      {
        normativeCheckpoint: 'end-primary-grade-3',
        normativeNodeKind: 'osa-2025',
        provenance: 'normative',
        origin: 'normative-source',
      }
    );

    expect(node.normativeNodeKind).toBe('osa-2025');
    const result = validateCurriculumNode(node);
    expect(result.valid).toBe(true);
    expect(result.errors.filter((e: any) => e.severity === 'error')).toHaveLength(0);
  });

  it('rejects invalid normativeNodeKind values', () => {
    const node = createCurriculumNode(
      versionRef,
      segmentRef,
      'obiettivo',
      'Obiettivo generico',
      {
        normativeNodeKind: 'osa-2012' as any,
        provenance: 'normative',
        origin: 'normative-source',
      }
    );

    const result = validateCurriculumNode(node);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e: any) => e.code === 'NODE-012')).toBe(true);
  });

  it('allows nodes without normativeNodeKind, preserving R1 behavior', () => {
    const node = createCurriculumNode(
      versionRef,
      segmentRef,
      'obiettivo',
      'Obiettivo - fine primaria',
      {
        normativeCheckpoint: 'end-primary',
        provenance: 'normative',
        origin: 'normative-source',
      }
    );

    expect(node.normativeNodeKind).toBeUndefined();
    const result = validateCurriculumNode(node);
    expect(result.valid).toBe(true);
    expect(result.errors.filter((e: any) => e.severity === 'error')).toHaveLength(0);
  });

  it('accepts frameworkApplicability on a segment for conditional curriculum areas', () => {
    const applicability: FrameworkApplicabilityReference = {
      framework: 'IN2025',
      resolutionStatus: 'resolved',
      resolutionReason: 'Applicabile solo ai percorsi a indirizzo musicale',
      cohortEntryYear: 2026,
    };

    const segment = createCurriculumSegment(
      versionRef,
      'secondaria',
      null,
      'Strumento musicale',
      {
        sourceArea: { kind: 'discipline', code: 'in2025-strumento-musicale', label: 'Strumento musicale' },
        status: 'complete',
        completeness: 'complete',
        sourceRefs: [],
        origin: 'normative-source',
        frameworkApplicability: applicability,
      }
    );

    expect(segment.frameworkApplicability).toBeDefined();
    expect(segment.frameworkApplicability?.framework).toBe('IN2025');
    expect(segment.frameworkApplicability?.resolutionStatus).toBe('resolved');
    expect(segment.frameworkApplicability?.cohortEntryYear).toBe(2026);

    const result = validateCurriculumSegment(segment);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('allows segments without frameworkApplicability, preserving R1 behavior', () => {
    const segment = createCurriculumSegment(
      versionRef,
      'primaria',
      'italiano',
      'Italiano',
      {
        sourceArea: { kind: 'discipline', code: 'in2025-italiano', label: 'Italiano' },
        status: 'complete',
        completeness: 'complete',
        sourceRefs: [],
        origin: 'normative-source',
      }
    );

    expect(segment.frameworkApplicability).toBeUndefined();
    const result = validateCurriculumSegment(segment);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});
