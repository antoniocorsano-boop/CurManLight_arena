export const CURRICULUM_DATABASE_NAME = 'CurManLightDB_Evoluto_v1.3';
export const LEGACY_SCHEMA_VERSION = 1;
export const CURRICULUM_SCHEMA_VERSION = 2;

export const LEGACY_STORES = {
  state: 'key, value',
} as const;

export const CURRICULUM_STORES = {
  ...LEGACY_STORES,
  instituteCurriculumVersions:
    'id, institutionId, status, effectiveFrom, effectiveTo, previousVersionId, versionNumber, _migrationId',
  curriculumSegments:
    'id, versionId, schoolLevel, subjectOrFieldId, workStatus, frameworkApplicability.framework, sourceSegmentId, replacesSegmentId, _migrationId',
  curriculumNodes:
    'id, versionId, segmentId, type, workStatus, sourceNodeId, replacesNodeId, _migrationId',
  verticalCurriculumLinks:
    'id, versionId, sourceNodeId, targetNodeId, relationType, status, validatedByRole, _migrationId',
  curriculumMigrationMetadata:
    'id, &migrationId, status, startedAt, completedAt',
  curriculumMigrationBackups:
    'id, &migrationId, createdAt, schemaVersion',
} as const;

export type CurriculumStoreName = Exclude<keyof typeof CURRICULUM_STORES, 'state'>;
