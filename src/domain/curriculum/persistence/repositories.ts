import type { DomainValidationIssue } from '../types';
import type { CurriculumNode } from '../node';
import type { CurriculumSegment } from '../segment';
import type { InstituteCurriculumVersion } from '../version';
import type { VerticalCurriculumLink } from '../verticalLink';
import {
  isApprovedVersionImmutable,
  detectInvalidStructuralCycles,
  validateCurriculumNode,
  validateCurriculumSegment,
  validateInstituteCurriculumVersion,
  validateVerticalCurriculumLink,
} from '../validation-legacy';
import type { CurriculumPersistenceBackend } from './backend';
import { CurriculumPersistenceError } from './errors';
import type { MigrationProvenance } from './records';

const byId = <T extends { id: string }>(values: T[]): T[] =>
  [...values].sort((left, right) => left.id.localeCompare(right.id));

function assertValid(issues: DomainValidationIssue[]): void {
  const errors = issues.filter(issue => issue.severity === 'error');
  if (errors.length > 0) {
    throw new CurriculumPersistenceError(
      'DOMAIN_VALIDATION_FAILED',
      'Domain validation rejected the write',
      errors.map(issue => issue.code),
    );
  }
}

async function write(operation: () => Promise<void>, message: string): Promise<void> {
  try {
    await operation();
  } catch (error) {
    if (error instanceof CurriculumPersistenceError) throw error;
    throw new CurriculumPersistenceError(
      'TRANSACTION_FAILED',
      message,
      [error instanceof Error ? error.message : String(error)],
    );
  }
}

async function assertMutableVersion(
  backend: CurriculumPersistenceBackend,
  versionId: string,
): Promise<void> {
  const version = await backend.getVersion(versionId);
  if (!version) {
    throw new CurriculumPersistenceError('REFERENCE_NOT_FOUND', `Version '${versionId}' was not found`);
  }
  if (isApprovedVersionImmutable(version)) {
    throw new CurriculumPersistenceError('IMMUTABLE_VERSION', `Version '${versionId}' is immutable`);
  }
}

export class InstituteCurriculumVersionRepository {
  constructor(private readonly backend: CurriculumPersistenceBackend) {}
  getById(id: string) { return this.backend.getVersion(id); }
  async list() { return byId(await this.backend.listVersions()); }

  async save(value: InstituteCurriculumVersion & MigrationProvenance): Promise<void> {
    const all = await this.backend.listVersions();
    const existing = all.find(candidate => candidate.id === value.id);
    if (existing && isApprovedVersionImmutable(existing)) {
      throw new CurriculumPersistenceError('IMMUTABLE_VERSION', `Version '${value.id}' is immutable`);
    }
    assertValid(validateInstituteCurriculumVersion(value, all));
    await write(async () => {
      await this.backend.putVersion(value);
      if (!await this.backend.getVersion(value.id)) {
        throw new CurriculumPersistenceError('TRANSACTION_FAILED', `Version '${value.id}' was not persisted`);
      }
    }, `Version '${value.id}' could not be persisted`);
  }

  async delete(id: string): Promise<void> {
    const segments = await this.backend.listSegments();
    const versions = await this.backend.listVersions();
    if (segments.some(segment => segment.versionId === id)
      || versions.some(version => version.previousVersionId === id)) {
      throw new CurriculumPersistenceError('DELETE_RESTRICTED', `Version '${id}' is referenced`);
    }
    const existing = await this.backend.getVersion(id);
    if (existing && isApprovedVersionImmutable(existing)) {
      throw new CurriculumPersistenceError('IMMUTABLE_VERSION', `Version '${id}' is immutable`);
    }
    await write(() => this.backend.deleteVersion(id), `Version '${id}' could not be deleted`);
  }
}

export class CurriculumSegmentRepository {
  constructor(private readonly backend: CurriculumPersistenceBackend) {}
  getById(id: string) { return this.backend.getSegment(id); }
  async listByVersion(versionId: string) {
    return byId((await this.backend.listSegments()).filter(segment => segment.versionId === versionId));
  }

  async save(value: CurriculumSegment & MigrationProvenance): Promise<void> {
    await assertMutableVersion(this.backend, value.versionId);
    const segments = await this.backend.listSegments();
    const versions = await this.backend.listVersions();
    for (const reference of [value.sourceSegmentId, value.replacesSegmentId]) {
      if (reference && !segments.some(segment => segment.id === reference)) {
        throw new CurriculumPersistenceError(
          'REFERENCE_NOT_FOUND',
          `Segment reference '${reference}' was not found`,
        );
      }
    }
    assertValid(validateCurriculumSegment(value, segments, versions));
    const candidateSegments = [...segments.filter(segment => segment.id !== value.id), value];
    if (detectInvalidStructuralCycles(candidateSegments).length > 0) {
      throw new CurriculumPersistenceError(
        'DOMAIN_VALIDATION_FAILED',
        'Domain validation rejected the write',
        ['SEGMENT_STRUCTURAL_CYCLE'],
      );
    }
    await write(() => this.backend.putSegment(value), `Segment '${value.id}' could not be persisted`);
  }

  async delete(id: string): Promise<void> {
    const segment = await this.backend.getSegment(id);
    if (!segment) return;
    await assertMutableVersion(this.backend, segment.versionId);
    const nodes = await this.backend.listNodes();
    const segments = await this.backend.listSegments();
    if (nodes.some(node => node.segmentId === id)
      || segments.some(candidate => candidate.sourceSegmentId === id || candidate.replacesSegmentId === id)) {
      throw new CurriculumPersistenceError('DELETE_RESTRICTED', `Segment '${id}' is referenced`);
    }
    await write(() => this.backend.deleteSegment(id), `Segment '${id}' could not be deleted`);
  }
}

export class CurriculumNodeRepository {
  constructor(private readonly backend: CurriculumPersistenceBackend) {}
  getById(id: string) { return this.backend.getNode(id); }
  async listBySegment(segmentId: string) {
    return byId((await this.backend.listNodes()).filter(node => node.segmentId === segmentId));
  }
  async listByVersion(versionId: string) {
    return byId((await this.backend.listNodes()).filter(node => node.versionId === versionId));
  }

  async save(value: CurriculumNode & MigrationProvenance): Promise<void> {
    await assertMutableVersion(this.backend, value.versionId);
    const nodes = await this.backend.listNodes();
    const segments = await this.backend.listSegments();
    for (const reference of [value.sourceNodeId, value.replacesNodeId]) {
      if (reference && !nodes.some(node => node.id === reference)) {
        throw new CurriculumPersistenceError(
          'REFERENCE_NOT_FOUND',
          `Node reference '${reference}' was not found`,
        );
      }
    }
    assertValid(validateCurriculumNode(value, nodes, segments));
    await write(() => this.backend.putNode(value), `Node '${value.id}' could not be persisted`);
  }

  async delete(id: string): Promise<void> {
    const node = await this.backend.getNode(id);
    if (!node) return;
    await assertMutableVersion(this.backend, node.versionId);
    const nodes = await this.backend.listNodes();
    const links = await this.backend.listLinks();
    if (links.some(link => link.sourceNodeId === id || link.targetNodeId === id)
      || nodes.some(candidate => candidate.sourceNodeId === id || candidate.replacesNodeId === id)) {
      throw new CurriculumPersistenceError('DELETE_RESTRICTED', `Node '${id}' is referenced`);
    }
    await write(() => this.backend.deleteNode(id), `Node '${id}' could not be deleted`);
  }
}

export class VerticalCurriculumLinkRepository {
  constructor(private readonly backend: CurriculumPersistenceBackend) {}
  getById(id: string) { return this.backend.getLink(id); }
  async listByVersion(versionId: string) {
    return byId((await this.backend.listLinks()).filter(link => link.versionId === versionId));
  }
  async listByNode(nodeId: string) {
    return byId((await this.backend.listLinks())
      .filter(link => link.sourceNodeId === nodeId || link.targetNodeId === nodeId));
  }

  async save(value: VerticalCurriculumLink & MigrationProvenance): Promise<void> {
    await assertMutableVersion(this.backend, value.versionId);
    const nodes = await this.backend.listNodes();
    const links = await this.backend.listLinks();
    const duplicate = links.find(link =>
      link.id !== value.id
      && link.sourceNodeId === value.sourceNodeId
      && link.targetNodeId === value.targetNodeId
      && link.relationType === value.relationType);
    if (duplicate) {
      throw new CurriculumPersistenceError('DUPLICATE_RECORD', `Link duplicates '${duplicate.id}'`);
    }
    assertValid(validateVerticalCurriculumLink(value, links, nodes));
    const endpoints = nodes.filter(node => node.id === value.sourceNodeId || node.id === value.targetNodeId);
    if (endpoints.some(node => node.versionId !== value.versionId)) {
      throw new CurriculumPersistenceError('REFERENCE_NOT_FOUND', 'Link endpoints must belong to its version');
    }
    await write(() => this.backend.putLink(value), `Link '${value.id}' could not be persisted`);
  }

  async delete(id: string): Promise<void> {
    const link = await this.backend.getLink(id);
    if (!link) return;
    await assertMutableVersion(this.backend, link.versionId);
    await write(() => this.backend.deleteLink(id), `Link '${id}' could not be deleted`);
  }
}

export interface CurriculumRepositories {
  versions: InstituteCurriculumVersionRepository;
  segments: CurriculumSegmentRepository;
  nodes: CurriculumNodeRepository;
  links: VerticalCurriculumLinkRepository;
}

export function createCurriculumRepositories(backend: CurriculumPersistenceBackend): CurriculumRepositories {
  return {
    versions: new InstituteCurriculumVersionRepository(backend),
    segments: new CurriculumSegmentRepository(backend),
    nodes: new CurriculumNodeRepository(backend),
    links: new VerticalCurriculumLinkRepository(backend),
  };
}
