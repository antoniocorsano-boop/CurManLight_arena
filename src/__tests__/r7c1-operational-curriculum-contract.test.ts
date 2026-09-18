import { describe, expect, it } from 'vitest';
import {
  OPERATIONAL_CURRICULUM_KIND,
  OPERATIONAL_CURRICULUM_SCHEMA_VERSION,
  buildOperationalCurriculumTargetRef,
  canUseOperationalNodeAsNationalRequirement,
  validateOperationalCurriculumAggregate,
  type OperationalCurriculumAggregateV1,
} from '../domain/curriculum/operationalContract';
import { DM221_2025_SOURCE_ID } from '../domain/curriculum/national/dm2212025';

const HASH_A = 'a'.repeat(64);
const HASH_B = 'b'.repeat(64);

const base = (): OperationalCurriculumAggregateV1 => ({
  schemaVersion: OPERATIONAL_CURRICULUM_SCHEMA_VERSION,
  kind: OPERATIONAL_CURRICULUM_KIND,
  institutionId: 'istituto-demo',
  curriculumVersionRef: 'curriculum:v1',
  sourcePlane: 'CML_633C_CANONICAL_DOMAIN',
  authority: { state: 'NON_AUTHORITATIVE' },
  semanticStatus: 'ELEMENT_BOUND',
  segments: [{
    segmentRef: 'segment:tecnologia:secondaria',
    curriculumVersionRef: 'curriculum:v1',
    target: { kind: 'DISCIPLINE', schoolOrder: 'secondaria', disciplineId: 'TECNOLOGIA' },
    scopeRef: 'school-level',
    nodeRefs: ['node:tecnologia:obiettivo:1'],
    sourceRefs: [DM221_2025_SOURCE_ID],
  }],
  nodes: [{
    nodeRef: 'node:tecnologia:obiettivo:1',
    curriculumVersionRef: 'curriculum:v1',
    segmentRef: 'segment:tecnologia:secondaria',
    nodeType: 'obiettivo',
    text: 'Obiettivo verificato di esempio',
    textFingerprint: HASH_A,
    origin: 'normative-source',
    lifecycle: 'ACTIVE',
    authorityLevel: 'NATIONAL_PRESCRIPTIVE',
    sourceRefs: [DM221_2025_SOURCE_ID],
    nationalElementEvidence: [{
      binding: {
        elementId: 'dm221-tech-example-1',
        segmentId: 'dm221-disc-tecnologia',
        elementKind: 'LEARNING_OBJECTIVE',
        schoolOrder: 'secondaria',
        sourceLocator: {
          sourceId: DM221_2025_SOURCE_ID,
          section: 'Tecnologia',
          page: 80,
        },
        sourceBindingStatus: 'SOURCE_VERIFIED',
        verifiedByHuman: true,
        canonicalTextStatus: 'HUMAN_VERIFIED_SOURCE_TEXT',
      },
      verifiedTextFingerprint: HASH_A,
    }],
  }],
  links: [],
  createdAt: '2026-09-03T14:30:00+02:00',
});

const errorCodes = (value: OperationalCurriculumAggregateV1): string[] =>
  validateOperationalCurriculumAggregate(value).errors.map(error => error.code);

describe('R7C1 operational curriculum aggregate contract', () => {
  it('accepts a source-bound first-cycle discipline aggregate without granting authority', () => {
    const aggregate = base();
    const validation = validateOperationalCurriculumAggregate(aggregate);

    expect(validation).toEqual({ valid: true, errors: [] });
    expect(canUseOperationalNodeAsNationalRequirement(aggregate.nodes[0], aggregate.segments[0].target)).toBe(true);
    expect(buildOperationalCurriculumTargetRef(aggregate.segments[0].target)).toBe('dm221:TECNOLOGIA:secondaria');
  });

  it('represents infanzia natively as a field of experience rather than a discipline projection', () => {
    const aggregate = base();
    aggregate.segments = [{
      segmentRef: 'segment:infanzia:discorsi-parole',
      curriculumVersionRef: 'curriculum:v1',
      target: {
        kind: 'FIELD_OF_EXPERIENCE',
        schoolOrder: 'infanzia',
        fieldId: 'I_DISCORSI_E_LE_PAROLE',
      },
      scopeRef: 'school-level',
      nodeRefs: ['node:infanzia:1'],
      sourceRefs: [DM221_2025_SOURCE_ID],
    }];
    aggregate.nodes = [{
      nodeRef: 'node:infanzia:1',
      curriculumVersionRef: 'curriculum:v1',
      segmentRef: 'segment:infanzia:discorsi-parole',
      nodeType: 'competenza',
      text: 'Contenuto istituzionale di lavoro per il campo.',
      textFingerprint: HASH_A,
      origin: 'institute',
      lifecycle: 'ACTIVE',
      authorityLevel: 'INSTITUTIONAL_REQUIRED',
      sourceRefs: [],
      nationalElementEvidence: [],
    }];

    expect(validateOperationalCurriculumAggregate(aggregate).valid).toBe(true);
    expect(buildOperationalCurriculumTargetRef(aggregate.segments[0].target))
      .toBe('dm221:FIELD:I_DISCORSI_E_LE_PAROLE:infanzia');
  });

  it('fails closed if a discipline is projected onto infanzia', () => {
    const aggregate = base();
    aggregate.segments = [{
      ...aggregate.segments[0],
      target: {
        kind: 'DISCIPLINE',
        schoolOrder: 'infanzia',
        disciplineId: 'TECNOLOGIA',
      } as unknown as OperationalCurriculumAggregateV1['segments'][number]['target'],
    }];

    expect(errorCodes(aggregate)).toContain('INFANZIA_DISCIPLINE_PROJECTION_FORBIDDEN');
  });

  it('does not allow NATIONAL_PRESCRIPTIVE without human-verified source text bound to the same fingerprint', () => {
    const missing = base();
    missing.nodes = [{ ...missing.nodes[0], nationalElementEvidence: [] }];
    expect(errorCodes(missing)).toContain('NATIONAL_NODE_SOURCE_BINDING_REQUIRED');

    const mismatch = base();
    mismatch.nodes = [{
      ...mismatch.nodes[0],
      nationalElementEvidence: [{
        ...mismatch.nodes[0].nationalElementEvidence[0],
        verifiedTextFingerprint: HASH_B,
      }],
    }];
    expect(errorCodes(mismatch)).toContain('NATIONAL_NODE_SOURCE_BINDING_REQUIRED');
  });

  it('does not allow a verified element from another discipline to authorize the node', () => {
    const aggregate = base();
    aggregate.nodes = [{
      ...aggregate.nodes[0],
      nationalElementEvidence: [{
        ...aggregate.nodes[0].nationalElementEvidence[0],
        binding: {
          ...aggregate.nodes[0].nationalElementEvidence[0].binding,
          segmentId: 'dm221-disc-italiano',
        },
      }],
    }];

    expect(errorCodes(aggregate)).toContain('NATIONAL_NODE_SOURCE_BINDING_REQUIRED');
  });

  it('does not allow a local legacy CurriculumMap projection to become canonical authority', () => {
    const aggregate = base();
    aggregate.sourcePlane = 'LEGACY_CURRICULUM_MAP_PROJECTION';
    aggregate.authority = {
      state: 'ACTIVE',
      authorityRef: 'r7:head:1',
      materializationRef: 'materialization:1',
      materializationFingerprint: HASH_A,
    };

    expect(errorCodes(aggregate)).toEqual(expect.arrayContaining([
      'LEGACY_PROJECTION_CANNOT_BE_AUTHORITATIVE',
      'AUTHORITATIVE_SOURCE_PLANE_REQUIRED',
    ]));
  });

  it('keeps structural validity separate from semantic validation', () => {
    const aggregate = base();
    aggregate.semanticStatus = 'SEMANTICALLY_VALIDATED';
    delete aggregate.semanticValidationRef;
    expect(errorCodes(aggregate)).toContain('SEMANTIC_VALIDATION_REF_REQUIRED');

    aggregate.semanticValidationRef = 'p3-semantic-assessment:1';
    expect(validateOperationalCurriculumAggregate(aggregate).valid).toBe(true);
  });

  it('requires one coherent version graph with resolvable segment, node and link references', () => {
    const aggregate = base();
    aggregate.nodes = [{
      ...aggregate.nodes[0],
      curriculumVersionRef: 'curriculum:other',
      segmentRef: 'segment:missing',
    }];
    aggregate.links = [{
      linkRef: 'link:1',
      curriculumVersionRef: 'curriculum:v1',
      fromNodeRef: 'node:tecnologia:obiettivo:1',
      toNodeRef: 'node:missing',
      linkType: 'progression',
      sourceRefs: [],
    }];

    expect(errorCodes(aggregate)).toEqual(expect.arrayContaining([
      'NODE_VERSION_MISMATCH',
      'NODE_SEGMENT_NOT_FOUND',
      'SEGMENT_NODE_BACKREF_MISMATCH',
      'LINK_TARGET_NODE_NOT_FOUND',
    ]));
  });

  it('blocks unfinished or synthetic content from an ACTIVE canonical aggregate', () => {
    const aggregate = base();
    aggregate.authority = {
      state: 'ACTIVE',
      authorityRef: 'r7:head:1',
      materializationRef: 'materialization:1',
      materializationFingerprint: HASH_A,
    };
    aggregate.nodes = [{
      ...aggregate.nodes[0],
      origin: 'synthetic',
      lifecycle: 'PROPOSED',
      authorityLevel: 'LOCAL_WORKING',
      nationalElementEvidence: [],
    }];

    expect(errorCodes(aggregate)).toEqual(expect.arrayContaining([
      'ACTIVE_CANONICAL_NODE_NOT_FINAL',
      'ACTIVE_CANONICAL_SYNTHETIC_NODE_FORBIDDEN',
    ]));
  });
});
