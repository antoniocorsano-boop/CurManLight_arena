/**
 * The CML-631 pilot consumes the curriculum barrel. During the CML-633
 * transition, its legacy contracts must remain the public default.
 */

import { describe, expect, it } from 'vitest';

import {
  CONTENT_ORIGIN_REGISTRY,
  CURRENT_SCHEMA_VERSION,
  SourceRepository,
  VALID_LINK_STATUSES,
  adaptCurriculumKB,
  createSource,
  findDuplicateVerticalLinks,
  isApprovedVersionImmutable,
  validateSource,
  validateVerticalCurriculumLink,
} from '../../domain/curriculum';
import type {
  CanonicalCurriculumNode,
  CurriculumNode,
  CurriculumSegment,
} from '../../domain/curriculum';

describe('curriculum public API compatibility', () => {
  it('preserves CML-631 legacy contracts during the canonical-domain transition', () => {
    const node = {} as CurriculumNode;
    const segment = {} as CurriculumSegment;

    expect(node.segmentId).toBeUndefined();
    expect(segment.schoolLevel).toBeUndefined();
    expect(validateVerticalCurriculumLink).toBeTypeOf('function');
    expect(isApprovedVersionImmutable).toBeTypeOf('function');
    expect(findDuplicateVerticalLinks).toBeTypeOf('function');
    expect(VALID_LINK_STATUSES).toContain('draft');
  });

  it('exposes canonical identity, source, repository, and adapter contracts', () => {
    const canonicalNode = {} as CanonicalCurriculumNode;

    expect(canonicalNode.segmentRef).toBeUndefined();
    expect(CURRENT_SCHEMA_VERSION).toBeTypeOf('number');
    expect(CONTENT_ORIGIN_REGISTRY).toBeInstanceOf(Map);
    expect(createSource).toBeTypeOf('function');
    expect(validateSource).toBeTypeOf('function');
    expect(SourceRepository).toBeTypeOf('function');
    expect(adaptCurriculumKB).toBeTypeOf('function');
  });
});
