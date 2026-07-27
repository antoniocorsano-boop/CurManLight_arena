/**
 * CML-633C — In-Memory Repositories
 *
 * Repository locali in memoria per test e uso transitorio.
 */

import type { EntityId } from './identity/types';
import type { SchoolOrder } from '../../types/curriculum';
import type { DisciplineCode, CurriculumNodeType } from './model/vocabularies';
import type { Source, SourceStatus, SourceVersion } from './sources/types';
import type {
  CurriculumVersion,
  CurriculumVersionStatus,
  CurriculumSegment,
  CurriculumSegmentStatus,
  CurriculumNode,
  CurriculumNodeStatus,
  CurriculumLink,
  CurriculumLinkStatus,
} from './model/types';

// ─── Source Repository ───────────────────────────────────────────────────────

export class SourceRepository {
  private sources = new Map<EntityId, Source>();

  add(source: Source): void {
    this.sources.set(source.id, source);
  }

  getById(id: EntityId): Source | undefined {
    return this.sources.get(id);
  }

  getAll(): Source[] {
    return Array.from(this.sources.values());
  }

  findByType(sourceType: string): Source[] {
    return this.getAll().filter(s => s.sourceType === sourceType);
  }

  findByStatus(status: SourceStatus): Source[] {
    return this.getAll().filter(s => s.status === status);
  }

  findByTitle(title: string): Source[] {
    const normalized = title.toLowerCase();
    return this.getAll().filter(s => s.title.toLowerCase().includes(normalized));
  }

  findByAuthority(authority: string): Source[] {
    const normalized = authority.toLowerCase();
    return this.getAll().filter(source => source.authority?.toLowerCase().includes(normalized));
  }

  findByDiscipline(disciplineCode: DisciplineCode): Source[] {
    return this.getAll().filter(s =>
      s.scope.disciplines?.includes(disciplineCode)
    );
  }

  findByOrder(order: SchoolOrder): Source[] {
    return this.getAll().filter(s =>
      s.scope.schoolOrders?.includes(order)
    );
  }

  count(): number {
    return this.sources.size;
  }

  clear(): void {
    this.sources.clear();
  }
}

export class SourceVersionRepository {
  private versions = new Map<EntityId, SourceVersion>();

  add(version: SourceVersion): void {
    this.versions.set(version.id, version);
  }

  getById(id: EntityId): SourceVersion | undefined {
    return this.versions.get(id);
  }

  getAll(): SourceVersion[] {
    return Array.from(this.versions.values());
  }

  findBySource(sourceId: EntityId): SourceVersion[] {
    return this.getAll().filter(version => version.sourceRef.id === sourceId);
  }

  clear(): void {
    this.versions.clear();
  }
}

// ─── Curriculum Version Repository ───────────────────────────────────────────

export class CurriculumVersionRepository {
  private versions = new Map<EntityId, CurriculumVersion>();

  add(version: CurriculumVersion): void {
    this.versions.set(version.id, version);
  }

  getById(id: EntityId): CurriculumVersion | undefined {
    return this.versions.get(id);
  }

  getAll(): CurriculumVersion[] {
    return Array.from(this.versions.values());
  }

  findByOrder(order: SchoolOrder): CurriculumVersion[] {
    return this.getAll().filter(v => v.scope.schoolOrder === order);
  }

  findByStatus(status: CurriculumVersionStatus): CurriculumVersion[] {
    return this.getAll().filter(v => v.status === status);
  }

  findActive(): CurriculumVersion[] {
    return this.getAll().filter(v => v.status === 'active');
  }

  count(): number {
    return this.versions.size;
  }

  clear(): void {
    this.versions.clear();
  }
}

// ─── Curriculum Segment Repository ───────────────────────────────────────────

export class CurriculumSegmentRepository {
  private segments = new Map<EntityId, CurriculumSegment>();

  add(segment: CurriculumSegment): void {
    this.segments.set(segment.id, segment);
  }

  getById(id: EntityId): CurriculumSegment | undefined {
    return this.segments.get(id);
  }

  getAll(): CurriculumSegment[] {
    return Array.from(this.segments.values());
  }

  findByVersion(versionId: EntityId): CurriculumSegment[] {
    return this.getAll().filter(s => s.curriculumVersionRef.id === versionId);
  }

  findByOrder(order: SchoolOrder): CurriculumSegment[] {
    return this.getAll().filter(s => s.schoolOrder === order);
  }

  findByDiscipline(disciplineCode: DisciplineCode): CurriculumSegment[] {
    return this.getAll().filter(s => s.disciplineCode === disciplineCode);
  }

  findByNucleus(nucleusId: string): CurriculumSegment[] {
    return this.getAll().filter(s => s.nucleusId === nucleusId);
  }

  findByStatus(status: CurriculumSegmentStatus): CurriculumSegment[] {
    return this.getAll().filter(s => s.status === status);
  }

  count(): number {
    return this.segments.size;
  }

  clear(): void {
    this.segments.clear();
  }
}

// ─── Curriculum Node Repository ──────────────────────────────────────────────

export class CurriculumNodeRepository {
  private nodes = new Map<EntityId, CurriculumNode>();

  add(node: CurriculumNode): void {
    this.nodes.set(node.id, node);
  }

  getById(id: EntityId): CurriculumNode | undefined {
    return this.nodes.get(id);
  }

  getAll(): CurriculumNode[] {
    return Array.from(this.nodes.values());
  }

  findByVersion(versionId: EntityId): CurriculumNode[] {
    return this.getAll().filter(n => n.curriculumVersionRef.id === versionId);
  }

  findBySegment(segmentId: EntityId): CurriculumNode[] {
    return this.getAll().filter(n => n.segmentRef.id === segmentId);
  }

  findByOrder(_order: SchoolOrder): CurriculumNode[] {
    return this.getAll();
  }

  findByType(nodeType: CurriculumNodeType): CurriculumNode[] {
    return this.getAll().filter(n => n.nodeType === nodeType);
  }

  findByStatus(status: CurriculumNodeStatus): CurriculumNode[] {
    return this.getAll().filter(n => n.status === status);
  }

  findByText(text: string): CurriculumNode[] {
    const normalized = text.toLowerCase();
    return this.getAll().filter(n => n.text.toLowerCase().includes(normalized));
  }

  findWithoutSource(): CurriculumNode[] {
    return this.getAll().filter(n => !n.sourceRefs || n.sourceRefs.length === 0);
  }

  findLegacy(): CurriculumNode[] {
    return this.getAll().filter(n => n.provenance === 'legacy');
  }

  findExperimental(): CurriculumNode[] {
    return this.getAll().filter(n => n.provenance === 'demonstration' || n.provenance === 'synthetic');
  }

  count(): number {
    return this.nodes.size;
  }

  clear(): void {
    this.nodes.clear();
  }
}

// ─── Curriculum Link Repository ──────────────────────────────────────────────

export class CurriculumLinkRepository {
  private links = new Map<EntityId, CurriculumLink>();

  add(link: CurriculumLink): void {
    this.links.set(link.id, link);
  }

  getById(id: EntityId): CurriculumLink | undefined {
    return this.links.get(id);
  }

  getAll(): CurriculumLink[] {
    return Array.from(this.links.values());
  }

  findByFromNode(nodeId: EntityId): CurriculumLink[] {
    return this.getAll().filter(l => l.fromNodeRef.id === nodeId);
  }

  findByToNode(nodeId: EntityId): CurriculumLink[] {
    return this.getAll().filter(l => l.toNodeRef.id === nodeId);
  }

  findByType(linkType: string): CurriculumLink[] {
    return this.getAll().filter(l => l.linkType === linkType);
  }

  findByStatus(status: CurriculumLinkStatus): CurriculumLink[] {
    return this.getAll().filter(l => l.status === status);
  }

  findVertical(): CurriculumLink[] {
    return this.getAll().filter(l => l.isVertical);
  }

  count(): number {
    return this.links.size;
  }

  clear(): void {
    this.links.clear();
  }
}

// ─── Combined Domain Repository ──────────────────────────────────────────────

export class CurriculumDomainRepository {
  readonly sources: SourceRepository;
  readonly sourceVersions: SourceVersionRepository;
  readonly versions: CurriculumVersionRepository;
  readonly segments: CurriculumSegmentRepository;
  readonly nodes: CurriculumNodeRepository;
  readonly links: CurriculumLinkRepository;

  constructor() {
    this.sources = new SourceRepository();
    this.sourceVersions = new SourceVersionRepository();
    this.versions = new CurriculumVersionRepository();
    this.segments = new CurriculumSegmentRepository();
    this.nodes = new CurriculumNodeRepository();
    this.links = new CurriculumLinkRepository();
  }

  clear(): void {
    this.sources.clear();
    this.sourceVersions.clear();
    this.versions.clear();
    this.segments.clear();
    this.nodes.clear();
    this.links.clear();
  }

  findNodes(query: {
    versionId?: EntityId;
    order?: SchoolOrder;
    discipline?: DisciplineCode;
    nucleusId?: string;
    nodeType?: CurriculumNodeType;
    text?: string;
  } = {}): CurriculumNode[] {
    const normalizedText = query.text?.toLowerCase();
    return this.nodes.getAll().filter(node => {
      const segment = this.segments.getById(node.segmentRef.id);
      return (!query.versionId || node.curriculumVersionRef.id === query.versionId)
        && (!query.order || segment?.schoolOrder === query.order)
        && (!query.discipline || segment?.disciplineCode === query.discipline)
        && (!query.nucleusId || segment?.nucleusId === query.nucleusId)
        && (!query.nodeType || node.nodeType === query.nodeType)
        && (!normalizedText || node.text.toLowerCase().includes(normalizedText));
    });
  }

  resolveNodeSources(node: CurriculumNode): { sources: Source[]; missing: boolean } {
    const sources = node.sourceRefs
      .map(reference => this.sources.getById(reference.id))
      .filter((source): source is Source => source !== undefined);
    return { sources, missing: sources.length !== node.sourceRefs.length || sources.length === 0 };
  }

  resolveNodeLinks(nodeId: EntityId): CurriculumLink[] {
    return [...this.links.findByFromNode(nodeId), ...this.links.findByToNode(nodeId)];
  }

  stats(): {
    sources: number;
    versions: number;
    segments: number;
    nodes: number;
    links: number;
  } {
    return {
      sources: this.sources.count(),
      versions: this.versions.count(),
      segments: this.segments.count(),
      nodes: this.nodes.count(),
      links: this.links.count(),
    };
  }
}
