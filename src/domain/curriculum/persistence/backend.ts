import Dexie from 'dexie';
import type { CurriculumNode } from '../node';
import type { CurriculumSegment } from '../segment';
import type { InstituteCurriculumVersion } from '../version';
import type { VerticalCurriculumLink } from '../verticalLink';
import type {
  CurriculumMigrationBackup,
  CurriculumMigrationMetadata,
  PersistedCurriculumNode,
  PersistedCurriculumSegment,
  PersistedInstituteCurriculumVersion,
  PersistedVerticalCurriculumLink,
} from './records';
import {
  CURRICULUM_DATABASE_NAME,
  CURRICULUM_SCHEMA_VERSION,
  CURRICULUM_STORES,
  LEGACY_SCHEMA_VERSION,
  LEGACY_STORES,
} from './schema';
import { CurriculumPersistenceError } from './errors';

export interface CurriculumPersistenceBackend {
  getVersion(id: string): Promise<PersistedInstituteCurriculumVersion | undefined>;
  listVersions(): Promise<PersistedInstituteCurriculumVersion[]>;
  putVersion(value: PersistedInstituteCurriculumVersion): Promise<void>;
  deleteVersion(id: string): Promise<void>;
  getSegment(id: string): Promise<PersistedCurriculumSegment | undefined>;
  listSegments(): Promise<PersistedCurriculumSegment[]>;
  putSegment(value: PersistedCurriculumSegment): Promise<void>;
  deleteSegment(id: string): Promise<void>;
  getNode(id: string): Promise<PersistedCurriculumNode | undefined>;
  listNodes(): Promise<PersistedCurriculumNode[]>;
  putNode(value: PersistedCurriculumNode): Promise<void>;
  deleteNode(id: string): Promise<void>;
  getLink(id: string): Promise<PersistedVerticalCurriculumLink | undefined>;
  listLinks(): Promise<PersistedVerticalCurriculumLink[]>;
  putLink(value: PersistedVerticalCurriculumLink): Promise<void>;
  deleteLink(id: string): Promise<void>;
  getMigration(migrationId: string): Promise<CurriculumMigrationMetadata | undefined>;
  putMigration(value: CurriculumMigrationMetadata): Promise<void>;
  getBackup(migrationId: string): Promise<CurriculumMigrationBackup | undefined>;
  putBackup(value: CurriculumMigrationBackup): Promise<void>;
  transaction<T>(work: () => Promise<T>): Promise<T>;
}

type MemoryState = {
  versions: Map<string, PersistedInstituteCurriculumVersion>;
  segments: Map<string, PersistedCurriculumSegment>;
  nodes: Map<string, PersistedCurriculumNode>;
  links: Map<string, PersistedVerticalCurriculumLink>;
  migrations: Map<string, CurriculumMigrationMetadata>;
  backups: Map<string, CurriculumMigrationBackup>;
};

const copy = <T>(value: T): T => structuredClone(value);
const values = <T>(map: Map<string, T>): T[] => [...map.values()].map(copy);

export class MemoryCurriculumPersistenceBackend implements CurriculumPersistenceBackend {
  private state: MemoryState = {
    versions: new Map(),
    segments: new Map(),
    nodes: new Map(),
    links: new Map(),
    migrations: new Map(),
    backups: new Map(),
  };

  async getVersion(id: string) { return copy(this.state.versions.get(id)); }
  async listVersions() { return values(this.state.versions); }
  async putVersion(value: PersistedInstituteCurriculumVersion) { this.state.versions.set(value.id, copy(value)); }
  async deleteVersion(id: string) { this.state.versions.delete(id); }
  async getSegment(id: string) { return copy(this.state.segments.get(id)); }
  async listSegments() { return values(this.state.segments); }
  async putSegment(value: PersistedCurriculumSegment) { this.state.segments.set(value.id, copy(value)); }
  async deleteSegment(id: string) { this.state.segments.delete(id); }
  async getNode(id: string) { return copy(this.state.nodes.get(id)); }
  async listNodes() { return values(this.state.nodes); }
  async putNode(value: PersistedCurriculumNode) { this.state.nodes.set(value.id, copy(value)); }
  async deleteNode(id: string) { this.state.nodes.delete(id); }
  async getLink(id: string) { return copy(this.state.links.get(id)); }
  async listLinks() { return values(this.state.links); }
  async putLink(value: PersistedVerticalCurriculumLink) { this.state.links.set(value.id, copy(value)); }
  async deleteLink(id: string) { this.state.links.delete(id); }
  async getMigration(id: string) { return copy(this.state.migrations.get(id)); }
  async putMigration(value: CurriculumMigrationMetadata) { this.state.migrations.set(value.migrationId, copy(value)); }
  async getBackup(id: string) { return copy(this.state.backups.get(id)); }
  async putBackup(value: CurriculumMigrationBackup) { this.state.backups.set(value.migrationId, copy(value)); }

  async transaction<T>(work: () => Promise<T>): Promise<T> {
    const before = copy(this.state);
    try {
      return await work();
    } catch (error) {
      this.state = before;
      throw error;
    }
  }
}

export function createCurriculumDatabase(name = CURRICULUM_DATABASE_NAME): Dexie {
  try {
    const database = new Dexie(name);
    database.version(LEGACY_SCHEMA_VERSION).stores(LEGACY_STORES);
    database.version(CURRICULUM_SCHEMA_VERSION).stores(CURRICULUM_STORES);
    return database;
  } catch (error) {
    throw new CurriculumPersistenceError(
      'SCHEMA_UPGRADE_FAILED',
      'Unable to configure the curriculum persistence schema',
      [error instanceof Error ? error.message : String(error)],
    );
  }
}

export class DexieCurriculumPersistenceBackend implements CurriculumPersistenceBackend {
  constructor(private readonly database: Dexie = createCurriculumDatabase()) {}

  async getVersion(id: string) { return this.database.table<PersistedInstituteCurriculumVersion>('instituteCurriculumVersions').get(id); }
  async listVersions() { return this.database.table<PersistedInstituteCurriculumVersion>('instituteCurriculumVersions').toArray(); }
  async putVersion(value: PersistedInstituteCurriculumVersion) { await this.database.table<InstituteCurriculumVersion>('instituteCurriculumVersions').put(value); }
  async deleteVersion(id: string) { await this.database.table('instituteCurriculumVersions').delete(id); }
  async getSegment(id: string) { return this.database.table<PersistedCurriculumSegment>('curriculumSegments').get(id); }
  async listSegments() { return this.database.table<PersistedCurriculumSegment>('curriculumSegments').toArray(); }
  async putSegment(value: PersistedCurriculumSegment) { await this.database.table<CurriculumSegment>('curriculumSegments').put(value); }
  async deleteSegment(id: string) { await this.database.table('curriculumSegments').delete(id); }
  async getNode(id: string) { return this.database.table<PersistedCurriculumNode>('curriculumNodes').get(id); }
  async listNodes() { return this.database.table<PersistedCurriculumNode>('curriculumNodes').toArray(); }
  async putNode(value: PersistedCurriculumNode) { await this.database.table<CurriculumNode>('curriculumNodes').put(value); }
  async deleteNode(id: string) { await this.database.table('curriculumNodes').delete(id); }
  async getLink(id: string) { return this.database.table<PersistedVerticalCurriculumLink>('verticalCurriculumLinks').get(id); }
  async listLinks() { return this.database.table<PersistedVerticalCurriculumLink>('verticalCurriculumLinks').toArray(); }
  async putLink(value: PersistedVerticalCurriculumLink) { await this.database.table<VerticalCurriculumLink>('verticalCurriculumLinks').put(value); }
  async deleteLink(id: string) { await this.database.table('verticalCurriculumLinks').delete(id); }
  async getMigration(migrationId: string) { return this.database.table<CurriculumMigrationMetadata>('curriculumMigrationMetadata').where('migrationId').equals(migrationId).first(); }
  async putMigration(value: CurriculumMigrationMetadata) { await this.database.table<CurriculumMigrationMetadata>('curriculumMigrationMetadata').put(value); }
  async getBackup(migrationId: string) { return this.database.table<CurriculumMigrationBackup>('curriculumMigrationBackups').where('migrationId').equals(migrationId).first(); }
  async putBackup(value: CurriculumMigrationBackup) { await this.database.table<CurriculumMigrationBackup>('curriculumMigrationBackups').put(value); }

  async transaction<T>(work: () => Promise<T>): Promise<T> {
    const tables = [
      'instituteCurriculumVersions', 'curriculumSegments', 'curriculumNodes',
      'verticalCurriculumLinks', 'curriculumMigrationMetadata', 'curriculumMigrationBackups',
    ].map(name => this.database.table(name));
    return this.database.transaction('rw', tables, work);
  }
}
