export type CurriculumPersistenceErrorCode =
  | 'DOMAIN_VALIDATION_FAILED'
  | 'REFERENCE_NOT_FOUND'
  | 'IMMUTABLE_VERSION'
  | 'SCHEMA_UPGRADE_FAILED'
  | 'MIGRATION_FAILED'
  | 'MIGRATION_INCOMPLETE'
  | 'ROLLBACK_FAILED'
  | 'BACKUP_INVALID'
  | 'DUPLICATE_RECORD'
  | 'DELETE_RESTRICTED'
  | 'TRANSACTION_FAILED';

export class CurriculumPersistenceError extends Error {
  constructor(
    public readonly code: CurriculumPersistenceErrorCode,
    message: string,
    public readonly details: readonly string[] = [],
  ) {
    super(message);
    this.name = 'CurriculumPersistenceError';
  }
}
