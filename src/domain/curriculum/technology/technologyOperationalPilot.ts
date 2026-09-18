import {
  OPERATIONAL_CURRICULUM_KIND,
  OPERATIONAL_CURRICULUM_SCHEMA_VERSION,
  validateOperationalCurriculumAggregate,
  type OperationalCurriculumAggregateV1,
  type OperationalCurriculumLink,
  type OperationalCurriculumNode,
  type OperationalCurriculumSegment,
} from '../operationalContract';
import { DM221_2025_SOURCE_ID } from '../national/dm2212025';
import type { NationalCurriculumElementKind } from '../national/elementBindings';
import type { VerifiedTechnologyElement } from '../national/technologyHumanVerification';
import {
  TECHNOLOGY_INSTITUTIONAL_DRAFT_EXIT_PROFILE,
  TECHNOLOGY_INSTITUTIONAL_DRAFT_FINALITIES,
  TECHNOLOGY_INSTITUTIONAL_DRAFT_NUCLEI,
  TECHNOLOGY_INSTITUTIONAL_DRAFT_SOURCE,
  type TechnologyDraftGrade,
  type TechnologyDraftNucleusId,
} from './technologyInstitutionalDraft';
import {
  buildTechnologyWorkingArtifactGraph,
  type TechnologyCurriculumArtifactInstance,
} from './technologyArtifacts';

export interface TechnologyGradeProgressionEntry {
  progressionRef: string;
  nucleusId: TechnologyDraftNucleusId;
  grade: TechnologyDraftGrade;
  text: string;
  sourceRef: string;
}

export interface TechnologyGradeProgressionLink {
  linkRef: string;
  fromProgressionRef: string;
  toProgressionRef: string;
  relation: 'PROGRESSION';
}

export interface TechnologyInstitutionalContextSnapshot {
  sourceRef: string;
  authorityStatus: typeof TECHNOLOGY_INSTITUTIONAL_DRAFT_SOURCE.authorityStatus;
  finalities: typeof TECHNOLOGY_INSTITUTIONAL_DRAFT_FINALITIES;
  exitProfile: typeof TECHNOLOGY_INSTITUTIONAL_DRAFT_EXIT_PROFILE;
}

export interface TechnologyOperationalPilotPackage {
  packageVersion: 'r7c2-technology-pilot-v1';
  aggregate: OperationalCurriculumAggregateV1;
  institutionalContext: TechnologyInstitutionalContextSnapshot;
  progressionEntries: readonly TechnologyGradeProgressionEntry[];
  progressionLinks: readonly TechnologyGradeProgressionLink[];
  artifacts: readonly TechnologyCurriculumArtifactInstance[];
  nationalSourceReview: {
    inventoryScope: 'LOWER_SECONDARY_TECHNOLOGY';
    verifiedElementRefs: readonly string[];
    verifiedCount: number;
  };
}

export interface TechnologyPlanningRequirementSnapshot {
  nodeRef: string;
  curriculumVersionRef: string;
  segmentRef: string;
  snapshotText: string;
  authorityLevel: OperationalCurriculumNode['authorityLevel'];
  origin: OperationalCurriculumNode['origin'];
  sourceRefs: readonly string[];
}

export interface TechnologyPlanningHandoff {
  handoffVersion: 'r7c2-technology-planning-handoff-v1';
  curriculumVersionRef: string;
  nodeRefs: readonly string[];
  requirements: readonly TechnologyPlanningRequirementSnapshot[];
  status: 'WORKING_DRAFT_ONLY' | 'SOURCE_VERIFIED_REFERENCE_SET';
}

const target = {
  kind: 'DISCIPLINE' as const,
  schoolOrder: 'secondaria' as const,
  disciplineId: 'TECNOLOGIA' as const,
};

function normalizeText(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

export async function sha256NormalizedText(value: string): Promise<string> {
  const cryptoApi = globalThis.crypto;
  if (!cryptoApi?.subtle) {
    throw new Error('R7C2_SHA256_UNAVAILABLE: Web Crypto SubtleCrypto è necessario per il fingerprint del testo.');
  }
  const bytes = new TextEncoder().encode(normalizeText(value));
  const digest = await cryptoApi.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}

function nodeTypeForNationalKind(
  kind: NationalCurriculumElementKind,
): OperationalCurriculumNode['nodeType'] {
  if (kind === 'EXPECTED_COMPETENCE') return 'competenza';
  if (kind === 'LEARNING_OBJECTIVE') return 'obiettivo';
  if (kind === 'KNOWLEDGE_OR_CONTENT') return 'conoscenza';
  throw new Error(`R7C2_UNSUPPORTED_NATIONAL_ELEMENT_KIND: ${kind}`);
}

function buildProgression(): {
  entries: TechnologyGradeProgressionEntry[];
  links: TechnologyGradeProgressionLink[];
} {
  const grades: readonly TechnologyDraftGrade[] = ['prima', 'seconda', 'terza'];
  const entries: TechnologyGradeProgressionEntry[] = [];
  const links: TechnologyGradeProgressionLink[] = [];

  for (const nucleus of TECHNOLOGY_INSTITUTIONAL_DRAFT_NUCLEI) {
    const nucleusEntries = grades.map((grade) => ({
      progressionRef: `technology-progression:${nucleus.id}:${grade}`,
      nucleusId: nucleus.id,
      grade,
      text: nucleus.progression[grade],
      sourceRef: TECHNOLOGY_INSTITUTIONAL_DRAFT_SOURCE.sourceRef,
    } satisfies TechnologyGradeProgressionEntry));
    entries.push(...nucleusEntries);
    links.push(
      {
        linkRef: `technology-progression-link:${nucleus.id}:prima-seconda`,
        fromProgressionRef: nucleusEntries[0].progressionRef,
        toProgressionRef: nucleusEntries[1].progressionRef,
        relation: 'PROGRESSION',
      },
      {
        linkRef: `technology-progression-link:${nucleus.id}:seconda-terza`,
        fromProgressionRef: nucleusEntries[1].progressionRef,
        toProgressionRef: nucleusEntries[2].progressionRef,
        relation: 'PROGRESSION',
      },
    );
  }

  return { entries, links };
}

async function buildInstitutionalNucleusGraph(
  curriculumVersionRef: string,
): Promise<{
  segments: OperationalCurriculumSegment[];
  nodes: OperationalCurriculumNode[];
  links: OperationalCurriculumLink[];
}> {
  const segments: OperationalCurriculumSegment[] = [];
  const nodes: OperationalCurriculumNode[] = [];
  const links: OperationalCurriculumLink[] = [];

  for (const nucleus of TECHNOLOGY_INSTITUTIONAL_DRAFT_NUCLEI) {
    const segmentRef = `technology-segment:${nucleus.id}`;
    const sourceRef = TECHNOLOGY_INSTITUTIONAL_DRAFT_SOURCE.sourceRef;
    const nodeSpecs = [
      { suffix: 'knowledge', nodeType: 'conoscenza' as const, text: nucleus.framework.knowledge },
      { suffix: 'skills', nodeType: 'abilita' as const, text: nucleus.framework.skills },
      { suffix: 'competence', nodeType: 'competenza' as const, text: nucleus.framework.expectedCompetence },
      { suffix: 'evidence', nodeType: 'evidenza' as const, text: nucleus.framework.evidence },
    ];
    const segmentNodes: OperationalCurriculumNode[] = [];

    for (const spec of nodeSpecs) {
      segmentNodes.push({
        nodeRef: `technology-node:${nucleus.id}:${spec.suffix}`,
        curriculumVersionRef,
        segmentRef,
        nodeType: spec.nodeType,
        text: spec.text,
        textFingerprint: await sha256NormalizedText(spec.text),
        origin: 'imported',
        lifecycle: 'PROPOSED',
        authorityLevel: 'LOCAL_WORKING',
        sourceRefs: [sourceRef],
        nationalElementEvidence: [],
      });
    }

    nodes.push(...segmentNodes);
    segments.push({
      segmentRef,
      curriculumVersionRef,
      target,
      scopeRef: `institutional:nucleus:${nucleus.id}`,
      nodeRefs: segmentNodes.map(node => node.nodeRef),
      sourceRefs: [sourceRef],
    });

    links.push({
      linkRef: `technology-link:${nucleus.id}:evidence-for-competence`,
      curriculumVersionRef,
      fromNodeRef: segmentNodes[3].nodeRef,
      toNodeRef: segmentNodes[2].nodeRef,
      linkType: 'evidence-for',
      sourceRefs: [sourceRef],
    });
  }

  return { segments, nodes, links };
}

async function buildVerifiedNationalGraph(
  curriculumVersionRef: string,
  verifiedElements: readonly VerifiedTechnologyElement[],
): Promise<{
  segments: OperationalCurriculumSegment[];
  nodes: OperationalCurriculumNode[];
}> {
  const byGroup = new Map<string, VerifiedTechnologyElement[]>();

  for (const element of verifiedElements) {
    if (element.schoolOrder !== 'secondaria') {
      throw new Error(`R7C2_TECHNOLOGY_ORDER_MISMATCH: ${element.elementId} non appartiene alla secondaria.`);
    }
    const current = byGroup.get(element.group) ?? [];
    current.push(element);
    byGroup.set(element.group, current);
  }

  const segments: OperationalCurriculumSegment[] = [];
  const nodes: OperationalCurriculumNode[] = [];

  for (const [group, elements] of byGroup.entries()) {
    const segmentRef = `technology-national-segment:${group}`;
    const segmentNodes: OperationalCurriculumNode[] = [];

    for (const element of elements) {
      const fingerprint = await sha256NormalizedText(element.canonicalText);
      segmentNodes.push({
        nodeRef: `technology-national-node:${element.elementId}`,
        curriculumVersionRef,
        segmentRef,
        nodeType: nodeTypeForNationalKind(element.elementKind),
        text: element.canonicalText,
        textFingerprint: fingerprint,
        origin: 'normative-source',
        lifecycle: 'ACTIVE',
        authorityLevel: 'NATIONAL_PRESCRIPTIVE',
        sourceRefs: [DM221_2025_SOURCE_ID],
        nationalElementEvidence: [{
          binding: element,
          verifiedTextFingerprint: fingerprint,
        }],
      });
    }

    nodes.push(...segmentNodes);
    segments.push({
      segmentRef,
      curriculumVersionRef,
      target,
      scopeRef: `national:${group}`,
      nodeRefs: segmentNodes.map(node => node.nodeRef),
      sourceRefs: [DM221_2025_SOURCE_ID],
    });
  }

  return { segments, nodes };
}

export async function buildTechnologyOperationalPilot(input: {
  institutionId: string;
  curriculumVersionRef: string;
  createdAt: string;
  verifiedNationalElements?: readonly VerifiedTechnologyElement[];
}): Promise<TechnologyOperationalPilotPackage> {
  const verifiedElements = input.verifiedNationalElements ?? [];
  const institutional = await buildInstitutionalNucleusGraph(input.curriculumVersionRef);
  const national = await buildVerifiedNationalGraph(input.curriculumVersionRef, verifiedElements);
  const aggregate: OperationalCurriculumAggregateV1 = {
    schemaVersion: OPERATIONAL_CURRICULUM_SCHEMA_VERSION,
    kind: OPERATIONAL_CURRICULUM_KIND,
    institutionId: input.institutionId,
    curriculumVersionRef: input.curriculumVersionRef,
    sourcePlane: 'CML_633C_CANONICAL_DOMAIN',
    authority: { state: 'NON_AUTHORITATIVE' },
    semanticStatus: verifiedElements.length > 0 ? 'ELEMENT_BOUND' : 'STRUCTURAL_ONLY',
    segments: [...institutional.segments, ...national.segments],
    nodes: [...institutional.nodes, ...national.nodes],
    links: institutional.links,
    createdAt: input.createdAt,
  };

  const validation = validateOperationalCurriculumAggregate(aggregate);
  if (!validation.valid) {
    throw new Error(`R7C2_OPERATIONAL_AGGREGATE_INVALID: ${validation.errors.map(error => error.code).join(',')}`);
  }

  const progression = buildProgression();
  const institutionalSegmentRefs = institutional.segments.map(segment => segment.segmentRef);
  const institutionalNodeRefs = institutional.nodes.map(node => node.nodeRef);

  return {
    packageVersion: 'r7c2-technology-pilot-v1',
    aggregate,
    institutionalContext: {
      sourceRef: TECHNOLOGY_INSTITUTIONAL_DRAFT_SOURCE.sourceRef,
      authorityStatus: TECHNOLOGY_INSTITUTIONAL_DRAFT_SOURCE.authorityStatus,
      finalities: TECHNOLOGY_INSTITUTIONAL_DRAFT_FINALITIES,
      exitProfile: TECHNOLOGY_INSTITUTIONAL_DRAFT_EXIT_PROFILE,
    },
    progressionEntries: progression.entries,
    progressionLinks: progression.links,
    artifacts: buildTechnologyWorkingArtifactGraph({
      curriculumVersionRef: input.curriculumVersionRef,
      segmentRefs: institutionalSegmentRefs,
      nodeRefs: institutionalNodeRefs,
      sourceRef: 'technology-curriculum-annexes-a-h-2026-2027',
    }),
    nationalSourceReview: {
      inventoryScope: 'LOWER_SECONDARY_TECHNOLOGY',
      verifiedElementRefs: verifiedElements.map(element => element.elementId),
      verifiedCount: verifiedElements.length,
    },
  };
}

export function buildTechnologyPlanningHandoff(
  pilot: TechnologyOperationalPilotPackage,
  nodeRefs: readonly string[],
): TechnologyPlanningHandoff {
  const nodeByRef = new Map(pilot.aggregate.nodes.map(node => [node.nodeRef, node]));
  const requirements = nodeRefs.map((nodeRef) => {
    const node = nodeByRef.get(nodeRef);
    if (!node) {
      throw new Error(`R7C2_PLANNING_NODE_NOT_FOUND: ${nodeRef}`);
    }
    return {
      nodeRef: node.nodeRef,
      curriculumVersionRef: node.curriculumVersionRef,
      segmentRef: node.segmentRef,
      snapshotText: node.text,
      authorityLevel: node.authorityLevel,
      origin: node.origin,
      sourceRefs: node.sourceRefs,
    } satisfies TechnologyPlanningRequirementSnapshot;
  });

  return {
    handoffVersion: 'r7c2-technology-planning-handoff-v1',
    curriculumVersionRef: pilot.aggregate.curriculumVersionRef,
    nodeRefs: requirements.map(requirement => requirement.nodeRef),
    requirements,
    status: requirements.some(requirement => requirement.authorityLevel === 'LOCAL_WORKING')
      ? 'WORKING_DRAFT_ONLY'
      : 'SOURCE_VERIFIED_REFERENCE_SET',
  };
}
