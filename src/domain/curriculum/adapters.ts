/**
 * CML-633C — Read-only curriculumKB adapter.
 *
 * `curriculumKB` remains authoritative until an approved persistent migration.
 * This adapter never writes to it and derives stable identifiers from its context.
 */

import { createEntityReference, createLegacyMetadata, generateDeterministicId } from './identity/constructors';
import type { EntityMetadata } from './identity/types';
import type { SchoolOrder, DisciplineData, CurricularLevel } from '../../types/curriculum';
import { resolveDisciplineCode } from './model/vocabularies';
import type { Source } from './sources/types';
import type { CurriculumVersion, CurriculumSegment, CurriculumNode, CurriculumLink } from './model/types';

const SCHOOL_ORDERS: readonly SchoolOrder[] = ['infanzia', 'primaria', 'secondaria'];
const LEGACY_SOURCE_TITLE = 'curriculumKB legacy';

export interface AdaptationIssue {
  code: 'MISSING_SOURCE' | 'EMPTY_ORDER' | 'UNMAPPED_NUCLEUS' | 'EXPERIMENTAL_PROPOSAL';
  severity: 'warning' | 'information' | 'incomplete';
  discipline?: string;
  order?: SchoolOrder;
  message: string;
}

export interface AdaptedCurriculumKB {
  sources: Source[];
  /** Compatibility alias for the first non-empty school-order version. */
  version: CurriculumVersion;
  versions: CurriculumVersion[];
  segments: CurriculumSegment[];
  nodes: CurriculumNode[];
  /** Proposed content is canonical but deliberately separate from active legacy nodes. */
  proposals: CurriculumNode[];
  links: CurriculumLink[];
  warnings: string[];
  issues: AdaptationIssue[];
  stats: {
    totalNodes: number;
    nodesWithSource: number;
    nodesWithoutSource: number;
    legacyNodes: number;
    experimentalNodes: number;
    evidences: number;
    traguardi: number;
    obiettivi: number;
    proposals: number;
    nuclei: number;
  };
}

function metadata(seed: string, migrationDate: string): EntityMetadata {
  return { ...createLegacyMetadata(migrationDate, undefined, ['authority', 'issuedAt', 'versionLabel']), id: generateDeterministicId(seed) };
}

function hasContent(level: CurricularLevel): boolean {
  return Boolean(level.traguardi?.length || level.obiettivi?.length || level.evidenze?.length || level.proposals?.length);
}

function legacyNode(
  version: CurriculumVersion,
  segment: CurriculumSegment,
  nodeType: CurriculumNode['nodeType'],
  text: string,
  originalKey: string,
  migrationDate: string,
): CurriculumNode {
  const nodeMetadata = metadata(`curriculumKB|node|${originalKey}|${text}`, migrationDate);
  return {
    id: nodeMetadata.id,
    metadata: nodeMetadata,
    curriculumVersionRef: createEntityReference(version.id, 'curriculum-version', version.title),
    segmentRef: createEntityReference(segment.id, 'curriculum-segment', segment.title),
    nodeType,
    text,
    sourceRefs: [],
    status: 'legacy',
    provenance: 'legacy',
    legacy: {
      isLegacy: true,
      originalKey,
      originalText: text,
      migrationDate,
      migrationWarnings: ['Fonte normativa originale non disponibile nel curriculumKB'],
    },
    keywords: [],
  };
}

/** Adapts the legacy KB into an in-memory canonical read model. */
export function adaptCurriculumKB(
  curriculumKB: Record<string, DisciplineData>,
  migrationDate: string,
): AdaptedCurriculumKB {
  const warnings: string[] = [];
  const issues: AdaptationIssue[] = [];
  const sourceMetadata = metadata('curriculumKB|source', migrationDate);
  const source: Source = {
    id: sourceMetadata.id,
    metadata: sourceMetadata,
    title: LEGACY_SOURCE_TITLE,
    sourceType: 'legacy',
    status: 'legacy',
    scope: {},
    notes: 'Registro di provenienza locale; autorita, data e versione normativa non sono disponibili.',
    usedByNodeRefs: [],
  };
  const versions: CurriculumVersion[] = SCHOOL_ORDERS.map(order => {
    const versionMetadata = metadata(`curriculumKB|version|${order}`, migrationDate);
    return {
      id: versionMetadata.id,
      metadata: versionMetadata,
      title: `Curriculum KB - Legacy (${order})`,
      description: 'Vista in sola lettura derivata dal curriculumKB esistente.',
      scope: { schoolOrder: order, disciplines: [] },
      status: 'legacy' as const,
      mainSourceRefs: [],
      segmentRefs: [],
      dataOrigin: 'legacy' as const,
      migrationNotes: 'Nessuna promozione a curricolo d’istituto; migrazione persistente non avviata.',
    };
  });
  const versionsByOrder = new Map(versions.map(version => [version.scope.schoolOrder, version]));
  const segments: CurriculumSegment[] = [];
  const nodes: CurriculumNode[] = [];
  const proposals: CurriculumNode[] = [];

  let evidences = 0;
  let traguardi = 0;
  let obiettivi = 0;
  let nuclei = 0;

  for (const [disciplineKey, disciplineData] of Object.entries(curriculumKB)) {
    const disciplineCode = resolveDisciplineCode(disciplineKey);
    if (!disciplineCode) {
      warnings.push(`Disciplina non riconosciuta: ${disciplineKey}`);
      continue;
    }

    for (const order of SCHOOL_ORDERS) {
      const level = disciplineData[order] as CurricularLevel | undefined;
      if (!level || !hasContent(level)) {
        issues.push({ code: 'EMPTY_ORDER', severity: 'information', discipline: disciplineKey, order, message: 'Ordine senza contenuti curriculari adattabili.' });
        continue;
      }
      const version = versionsByOrder.get(order)!;
      if (!version.scope.disciplines.includes(disciplineCode)) version.scope.disciplines.push(disciplineCode);

      const segmentMetadata = metadata(`curriculumKB|segment|${disciplineKey}|${order}`, migrationDate);
      const nucleusNames = level.nucleiFondanti || [];
      nuclei += nucleusNames.length;
      const segment: CurriculumSegment = {
        id: segmentMetadata.id,
        metadata: segmentMetadata,
        curriculumVersionRef: createEntityReference(version.id, 'curriculum-version', version.title),
        schoolOrder: order,
        disciplineCode,
        // A legacy bundle can contain several nuclei; preserve their texts in notes rather than falsely assigning one.
        nucleusId: nucleusNames.length === 1 ? `${disciplineCode}_${order}_${normalizeNucleus(nucleusNames[0])}` : undefined,
        title: `${disciplineKey} - ${order}`,
        status: 'legacy',
        completeness: 'legacy',
        sourceRefs: [],
        nodeRefs: [],
        dataOrigin: 'legacy',
        notes: nucleusNames.length > 1 ? `Nuclei legacy: ${nucleusNames.join(' | ')}` : undefined,
      };
      if (nucleusNames.length > 1) {
        issues.push({ code: 'UNMAPPED_NUCLEUS', severity: 'incomplete', discipline: disciplineKey, order, message: 'Più nuclei legacy conservati senza assegnazione arbitraria ai singoli nodi.' });
      }
      segments.push(segment);
      version.segmentRefs.push(createEntityReference(segment.id, 'curriculum-segment', segment.title));

      const addNodes = (type: CurriculumNode['nodeType'], texts: string[] | undefined, counter: () => void) => {
        for (const [index, text] of (texts || []).entries()) {
          const node = legacyNode(version, segment, type, text, `${disciplineKey}|${order}|${type}|${index}`, migrationDate);
          nodes.push(node);
          segment.nodeRefs.push(createEntityReference(node.id, 'curriculum-node', text.substring(0, 50)));
          source.usedByNodeRefs.push(createEntityReference(node.id, 'curriculum-node', text.substring(0, 50)));
          counter();
          issues.push({ code: 'MISSING_SOURCE', severity: 'incomplete', discipline: disciplineKey, order, message: `Nodo ${type} senza fonte normativa risolvibile.` });
        }
      };
      addNodes('traguardo', level.traguardi, () => { traguardi++; });
      addNodes('obiettivo', level.obiettivi, () => { obiettivi++; });
      addNodes('evidenza', level.evidenze, () => { evidences++; });

      for (const proposal of level.proposals || []) {
        const node = legacyNode(version, segment, 'indicatore', proposal.newText, `${disciplineKey}|${order}|proposal|${proposal.id}`, migrationDate);
        node.status = 'experimental';
        node.provenance = 'demonstration';
        node.legacy!.migrationWarnings = ['Proposta legacy separata dai nodi attivi'];
        proposals.push(node);
        warnings.push(`Proposta trovata: ${proposal.focus} (classificata come sperimentale)`);
        issues.push({ code: 'EXPERIMENTAL_PROPOSAL', severity: 'information', discipline: disciplineKey, order, message: `Proposta '${proposal.focus}' mantenuta separata dal curricolo legacy.` });
      }
    }
  }

  const populatedVersions = versions.filter(version => version.segmentRefs.length > 0);
  return {
    sources: [source],
    version: populatedVersions[0] || versions[0],
    versions: populatedVersions,
    segments,
    nodes,
    proposals,
    links: [],
    warnings,
    issues,
    stats: {
      totalNodes: nodes.length,
      nodesWithSource: 0,
      nodesWithoutSource: nodes.length,
      legacyNodes: nodes.length,
      experimentalNodes: proposals.length,
      evidences,
      traguardi,
      obiettivi,
      proposals: proposals.length,
      nuclei,
    },
  };
}

function normalizeNucleus(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

/** Adapts one discipline through the same deterministic read model. */
export function adaptDiscipline(disciplineKey: string, disciplineData: DisciplineData, migrationDate: string) {
  const result = adaptCurriculumKB({ [disciplineKey]: disciplineData }, migrationDate);
  return { source: result.sources[0], segments: result.segments, nodes: result.nodes, warnings: result.warnings };
}

/** Builds the discipline/order matrix without altering legacy content. */
export function verifyMigrationMatrix(curriculumKB: Record<string, DisciplineData>): {
  disciplines: string[];
  orders: SchoolOrder[];
  matrix: Record<string, Record<SchoolOrder, { segments: number; nodes: number; hasContent: boolean }>>;
} {
  const matrix = {} as Record<string, Record<SchoolOrder, { segments: number; nodes: number; hasContent: boolean }>>;
  for (const [discipline, data] of Object.entries(curriculumKB)) {
    matrix[discipline] = {} as Record<SchoolOrder, { segments: number; nodes: number; hasContent: boolean }>;
    for (const order of SCHOOL_ORDERS) {
      const level = data[order] as CurricularLevel | undefined;
      const nodes = (level?.traguardi?.length || 0) + (level?.obiettivi?.length || 0) + (level?.evidenze?.length || 0);
      matrix[discipline][order] = { segments: level && hasContent(level) ? 1 : 0, nodes, hasContent: Boolean(level && hasContent(level)) };
    }
  }
  return { disciplines: Object.keys(curriculumKB), orders: [...SCHOOL_ORDERS], matrix };
}
