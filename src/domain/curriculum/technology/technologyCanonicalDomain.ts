import type {
  ContentOrigin,
  EntityId,
  EntityMetadata,
  EntityReference,
} from '../identity/types';
import { CURRENT_SCHEMA_VERSION } from '../identity/types';
import {
  createEntityReference,
  generateDeterministicId,
} from '../identity/constructors';
import type {
  CurriculumLink,
  CurriculumNode,
  CurriculumSegment,
  CurriculumVersion,
} from '../model/types';
import type { Source } from '../sources/types';
import {
  checkReferentialIntegrity,
  validateCurriculumLink,
  validateCurriculumNode,
  validateCurriculumSegment,
  validateCurriculumVersion,
  validateSource,
} from '../validation';
import {
  TECHNOLOGY_INSTITUTIONAL_DRAFT_NUCLEI,
  TECHNOLOGY_INSTITUTIONAL_DRAFT_SOURCE,
} from './technologyInstitutionalDraft';

export interface TechnologyCanonicalDomainSnapshot {
  snapshotVersion: 'r7c2-technology-cml633c-v1';
  source: Source;
  curriculumVersion: CurriculumVersion;
  segments: readonly CurriculumSegment[];
  nodes: readonly CurriculumNode[];
  links: readonly CurriculumLink[];
}

export interface TechnologyCanonicalDomainValidation {
  valid: boolean;
  errors: readonly string[];
}

function deterministicMetadata(
  seed: string,
  origin: ContentOrigin,
  now: string,
): EntityMetadata {
  const id = generateDeterministicId(seed);
  return {
    id,
    createdAt: now,
    updatedAt: now,
    origin,
    schemaVersion: CURRENT_SCHEMA_VERSION,
  };
}

function ref(
  id: EntityId,
  entityType: EntityReference['entityType'],
  label?: string,
): EntityReference {
  return createEntityReference(id, entityType, label);
}

export function buildTechnologyCanonicalDomainSnapshot(input: {
  institutionId: string;
  curriculumVersionKey: string;
  createdAt: string;
}): TechnologyCanonicalDomainSnapshot {
  const sourceMetadata = deterministicMetadata(
    `r7c2:technology:source:${TECHNOLOGY_INSTITUTIONAL_DRAFT_SOURCE.sourceRef}`,
    'imported',
    input.createdAt,
  );
  const sourceRef = ref(sourceMetadata.id, 'source', TECHNOLOGY_INSTITUTIONAL_DRAFT_SOURCE.title);

  const versionMetadata = deterministicMetadata(
    `r7c2:technology:curriculum-version:${input.institutionId}:${input.curriculumVersionKey}`,
    'imported',
    input.createdAt,
  );
  const versionRef = ref(versionMetadata.id, 'curriculum-version', input.curriculumVersionKey);

  const segments: CurriculumSegment[] = [];
  const nodes: CurriculumNode[] = [];
  const links: CurriculumLink[] = [];

  for (const nucleus of TECHNOLOGY_INSTITUTIONAL_DRAFT_NUCLEI) {
    const segmentMetadata = deterministicMetadata(
      `r7c2:technology:segment:${input.curriculumVersionKey}:${nucleus.id}`,
      'imported',
      input.createdAt,
    );
    const segmentRef = ref(segmentMetadata.id, 'curriculum-segment', nucleus.label);

    const specs = [
      { key: 'knowledge', nodeType: 'conoscenza' as const, text: nucleus.framework.knowledge },
      { key: 'skills', nodeType: 'abilita' as const, text: nucleus.framework.skills },
      { key: 'competence', nodeType: 'competenza' as const, text: nucleus.framework.expectedCompetence },
      { key: 'evidence', nodeType: 'evidenza' as const, text: nucleus.framework.evidence },
    ];

    const nucleusNodes = specs.map((spec) => {
      const metadata = deterministicMetadata(
        `r7c2:technology:node:${input.curriculumVersionKey}:${nucleus.id}:${spec.key}`,
        'imported',
        input.createdAt,
      );
      return {
        id: metadata.id,
        metadata,
        curriculumVersionRef: versionRef,
        segmentRef,
        nodeType: spec.nodeType,
        text: spec.text,
        sourceRefs: [sourceRef],
        status: 'proposed',
        provenance: 'teacher-proposed',
        keywords: [],
      } satisfies CurriculumNode;
    });

    nodes.push(...nucleusNodes);
    segments.push({
      id: segmentMetadata.id,
      metadata: segmentMetadata,
      curriculumVersionRef: versionRef,
      schoolOrder: 'secondaria',
      disciplineCode: 'tecnologia',
      nucleusId: nucleus.id,
      title: nucleus.label,
      description: nucleus.summary,
      status: 'unverified',
      completeness: 'partial',
      sourceRefs: [sourceRef],
      nodeRefs: nucleusNodes.map(node => ref(node.id, 'curriculum-node', node.text)),
      dataOrigin: 'imported',
      notes: 'Segmento derivato dalla bozza operativa di Tecnologia; non adottato istituzionalmente.',
    });

    const linkMetadata = deterministicMetadata(
      `r7c2:technology:link:${input.curriculumVersionKey}:${nucleus.id}:evidence-for-competence`,
      'imported',
      input.createdAt,
    );
    links.push({
      id: linkMetadata.id,
      metadata: linkMetadata,
      fromNodeRef: ref(nucleusNodes[3].id, 'curriculum-node', nucleusNodes[3].text),
      toNodeRef: ref(nucleusNodes[2].id, 'curriculum-node', nucleusNodes[2].text),
      linkType: 'evidence-for',
      description: `L’evidenza del nucleo documenta la competenza attesa: ${nucleus.label}`,
      sourceRefs: [sourceRef],
      origin: 'imported',
      status: 'proposed',
      isVertical: false,
    });
  }

  const curriculumVersion: CurriculumVersion = {
    id: versionMetadata.id,
    metadata: versionMetadata,
    title: 'Curricolo verticale di Tecnologia — bozza operativa 2026/2027',
    description: 'Materializzazione CML-633C del pilota R7C2; mantiene stato di bozza non adottata.',
    scope: {
      schoolOrder: 'secondaria',
      disciplines: ['tecnologia'],
      gradeRange: ['prima', 'seconda', 'terza'],
    },
    academicYear: '2026/2027',
    status: 'draft',
    mainSourceRefs: [sourceRef],
    segmentRefs: segments.map(segment => ref(segment.id, 'curriculum-segment', segment.title)),
    dataOrigin: 'imported',
    migrationNotes: 'R7C2 pilot: nessuna scrittura produttiva e nessuna promozione da CurriculumMap legacy.',
  };

  const source: Source = {
    id: sourceMetadata.id,
    metadata: sourceMetadata,
    title: TECHNOLOGY_INSTITUTIONAL_DRAFT_SOURCE.title,
    sourceType: 'institute-curriculum',
    status: 'draft',
    scope: {
      schoolOrders: ['secondaria'],
      disciplines: ['tecnologia'],
      instituteId: input.institutionId,
      isNational: false,
    },
    locator: {
      type: 'internal',
      value: TECHNOLOGY_INSTITUTIONAL_DRAFT_SOURCE.sourceRef,
      notes: 'Documento di lavoro fornito come base del pilota R7C2.',
    },
    notes: TECHNOLOGY_INSTITUTIONAL_DRAFT_SOURCE.sourceNote,
    usedByNodeRefs: nodes.map(node => ref(node.id, 'curriculum-node', node.text)),
  };

  return {
    snapshotVersion: 'r7c2-technology-cml633c-v1',
    source,
    curriculumVersion,
    segments,
    nodes,
    links,
  };
}

export function validateTechnologyCanonicalDomainSnapshot(
  snapshot: TechnologyCanonicalDomainSnapshot,
): TechnologyCanonicalDomainValidation {
  const errors: string[] = [];

  const sourceValidation = validateSource(snapshot.source);
  for (const error of sourceValidation.errors.filter(error => error.severity === 'error')) {
    errors.push(`source:${error.code}`);
  }

  const versionValidation = validateCurriculumVersion(snapshot.curriculumVersion);
  for (const error of versionValidation.errors.filter(error => error.severity === 'error')) {
    errors.push(`version:${error.code}`);
  }

  snapshot.segments.forEach((segment, index) => {
    const validation = validateCurriculumSegment(segment);
    for (const error of validation.errors.filter(error => error.severity === 'error')) {
      errors.push(`segment[${index}]:${error.code}`);
    }
  });

  snapshot.nodes.forEach((node, index) => {
    const validation = validateCurriculumNode(node);
    for (const error of validation.errors.filter(error => error.severity === 'error')) {
      errors.push(`node[${index}]:${error.code}`);
    }
  });

  snapshot.links.forEach((link, index) => {
    const validation = validateCurriculumLink(link);
    for (const error of validation.errors.filter(error => error.severity === 'error')) {
      errors.push(`link[${index}]:${error.code}`);
    }
  });

  const integrity = checkReferentialIntegrity(
    [...snapshot.nodes],
    [...snapshot.segments],
    [...snapshot.links],
  );
  errors.push(...integrity.broken.map(error => `integrity:${error}`));

  const segmentIds = new Set(snapshot.segments.map(segment => segment.id));
  for (const segmentRef of snapshot.curriculumVersion.segmentRefs) {
    if (!segmentIds.has(segmentRef.id)) errors.push(`version:missing-segment:${segmentRef.id}`);
  }

  const nodeIds = new Set(snapshot.nodes.map(node => node.id));
  for (const segment of snapshot.segments) {
    for (const nodeRef of segment.nodeRefs) {
      if (!nodeIds.has(nodeRef.id)) errors.push(`segment:missing-node:${nodeRef.id}`);
    }
  }

  return { valid: errors.length === 0, errors };
}
