import type { CurriculumNode } from '../node';
import type { CurriculumSegment } from '../segment';
import type { InstituteCurriculumVersion } from '../version';
import type { VerticalCurriculumLink } from '../verticalLink';

export interface MigrationProvenance {
  _migrationId?: string;
  _importedFromLegacy?: boolean;
}

export type PersistedInstituteCurriculumVersion = InstituteCurriculumVersion & MigrationProvenance;
export type PersistedCurriculumSegment = CurriculumSegment & MigrationProvenance;
export type PersistedCurriculumNode = CurriculumNode & MigrationProvenance;
export type PersistedVerticalCurriculumLink = VerticalCurriculumLink & MigrationProvenance;

export type CurriculumMigrationStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'rolled-back';

export interface CurriculumMigrationMetadata {
  id: string;
  migrationId: string;
  sourceSchemaVersion: number;
  targetSchemaVersion: number;
  startedAt: string;
  completedAt?: string;
  status: CurriculumMigrationStatus;
  sourceRecordCount: number;
  migratedRecordCount: number;
  skippedRecordCount: number;
  issueCount: number;
  checksum?: string;
  errorCode?: string;
}

export interface CurriculumMigrationBackup {
  id: string;
  migrationId: string;
  createdAt: string;
  schemaVersion: number;
  payload: unknown;
  recordCounts: Record<string, number>;
  checksum?: string;
}
