import { describe, expect, it } from 'vitest';
import {
  createSource,
  createSourceReference,
  createSourceVersion,
} from '../domain/curriculum/constructors';
import {
  isSourceUsableForContext,
  validateDerivedKnowledgeSourceRef,
  validateSourceGovernance,
  type SourceGovernanceRecord,
} from '../domain/curriculum/sources/governance';
import { listUsableSourcesForContext } from '../domain/curriculum/sources/registry';
import {
  CML_BACKUP_SCHEMA,
  createBackupReceipt,
  validateRestoreRequest,
  type CmlBackupManifest,
} from '../domain/backup/contract';

const HASH_A = 'a'.repeat(64);
const HASH_B = 'b'.repeat(64);

function makeActiveSource(title = 'Fonte personale verificata') {
  const source = createSource(
    title,
    'local-import',
    { schoolOrders: ['secondaria-primo-grado'], disciplines: ['TEC'] },
    {
      status: 'active',
      origin: 'teacher',
      locator: {
        type: 'url',
        url: 'https://drive.google.com/file/d/example/view',
      },
      now: '2026-09-05T08:00:00.000Z',
    },
  );
  const version = createSourceVersion(createSourceReference(source.id, source.title), 1, {
    status: 'active',
    origin: 'teacher',
    now: '2026-09-05T08:00:00.000Z',
  });
  return { source, version };
}

function personalGovernance(sourceId: ReturnType<typeof makeActiveSource>['source']['id'], versionId: ReturnType<typeof makeActiveSource>['version']['id']): SourceGovernanceRecord {
  return {
    sourceId,
    sourceVersionId: versionId,
    versionFingerprint: HASH_A,
    authorityLevel: 'personal',
    verificationStatus: 'verified',
    validFor: {
      userIds: ['teacher-1'],
      schoolOrders: ['secondaria-primo-grado'],
      disciplines: ['TEC'],
      validFrom: '2026-09-01',
      validTo: '2027-08-31',
    },
    provenance: {
      originKind: 'local-upload',
      assertedBy: 'teacher-1',
      verifiedBy: 'teacher-1',
      verifiedAt: '2026-09-05T08:10:00.000Z',
      evidenceRef: 'local-source-ingest:1',
    },
  };
}

describe('CML-DRIVE-01 source governance boundary', () => {
  it('makes a verified personal source usable only in its declared user/context', () => {
    const { source, version } = makeActiveSource();
    const governance = personalGovernance(source.id, version.id);

    expect(validateSourceGovernance(governance).valid).toBe(true);
    expect(isSourceUsableForContext(source, version, governance, {
      at: '2026-09-05',
      userId: 'teacher-1',
      schoolOrder: 'secondaria-primo-grado',
      discipline: 'TEC',
    })).toBe(true);

    expect(isSourceUsableForContext(source, version, governance, {
      at: '2026-09-05',
      userId: 'teacher-2',
      schoolOrder: 'secondaria-primo-grado',
      discipline: 'TEC',
    })).toBe(false);
  });

  it('does not derive authority from a Drive locator and does not equate identified with verified', () => {
    const { source, version } = makeActiveSource('Documento su Drive');
    const governance = personalGovernance(source.id, version.id);

    expect(source.locator?.url).toContain('drive.google.com');
    expect(governance.authorityLevel).toBe('personal');

    const identified: SourceGovernanceRecord = {
      ...governance,
      authorityLevel: 'institutional',
      verificationStatus: 'identified',
      validFor: { instituteIds: ['school-1'] },
      provenance: { originKind: 'institutional-import', assertedBy: 'teacher-1' },
    };

    expect(validateSourceGovernance(identified).valid).toBe(true);
    expect(isSourceUsableForContext(source, version, identified, {
      at: '2026-09-05',
      instituteId: 'school-1',
    })).toBe(false);
  });

  it('rejects authority scopes that are not explicitly attributable', () => {
    const { source, version } = makeActiveSource();
    const invalidPersonal = {
      ...personalGovernance(source.id, version.id),
      validFor: {},
    };

    expect(validateSourceGovernance(invalidPersonal).errors)
      .toContain('PERSONAL_SOURCE_REQUIRES_USER_SCOPE');
  });

  it('keeps derived knowledge bound to the exact source version fingerprint', () => {
    const { source, version } = makeActiveSource();
    const governance = personalGovernance(source.id, version.id);

    expect(validateDerivedKnowledgeSourceRef({
      sourceId: source.id,
      sourceVersionId: version.id,
      sourceVersionFingerprint: HASH_A,
      evidenceRef: 'page:3#paragraph:2',
    }, governance)).toBe(true);

    expect(validateDerivedKnowledgeSourceRef({
      sourceId: source.id,
      sourceVersionId: version.id,
      sourceVersionFingerprint: HASH_B,
    }, governance)).toBe(false);
  });

  it('filters the registry view without duplicating the canonical Source entities', () => {
    const first = makeActiveSource('Tecnologia');
    const second = makeActiveSource('Italiano');
    const firstGovernance = personalGovernance(first.source.id, first.version.id);
    const secondGovernance = {
      ...personalGovernance(second.source.id, second.version.id),
      validFor: { userIds: ['teacher-2'] },
    };

    const usable = listUsableSourcesForContext([
      { ...first, governance: firstGovernance },
      { ...second, governance: secondGovernance },
    ], {
      at: '2026-09-05',
      userId: 'teacher-1',
      schoolOrder: 'secondaria-primo-grado',
      discipline: 'TEC',
    });

    expect(usable).toHaveLength(1);
    expect(usable[0].source.id).toBe(first.source.id);
  });
});

describe('CML-DRIVE-01 backup boundary', () => {
  const manifest: CmlBackupManifest = {
    schema: CML_BACKUP_SCHEMA,
    backupId: 'backup-2026-09-05-001',
    product: 'CurManLight Arena',
    createdAt: '2026-09-05T08:30:00.000Z',
    contentHash: HASH_A,
    sourceRegistrySchemaVersion: 1,
    objectCounts: {
      sources: 12,
      sourceVersions: 14,
      curriculumVersions: 2,
      revisions: 5,
      workspaces: 1,
      documents: 3,
    },
  };

  it('records Google Drive only as outbound backup location with no authority effect', () => {
    const receipt = createBackupReceipt({
      manifest,
      provider: 'google-drive',
      remoteObjectId: 'drive-file-123',
      exportedAt: '2026-09-05T08:31:00.000Z',
    });

    expect(receipt.provider).toBe('google-drive');
    expect(receipt.remoteObjectId).toBe('drive-file-123');
    expect(receipt.direction).toBe('outbound-backup');
    expect(receipt.authorityEffect).toBe('none');
  });

  it('never permits restore without matching hash and explicit human confirmation', () => {
    const notConfirmed = validateRestoreRequest({
      manifest,
      recomputedContentHash: HASH_A,
      humanConfirmed: false,
    });
    expect(notConfirmed.valid).toBe(false);
    expect(notConfirmed.errors).toContain('RESTORE_REQUIRES_HUMAN_CONFIRMATION');

    const mismatch = validateRestoreRequest({
      manifest,
      recomputedContentHash: HASH_B,
      humanConfirmed: true,
    });
    expect(mismatch.valid).toBe(false);
    expect(mismatch.errors).toContain('RESTORE_CONTENT_HASH_MISMATCH');

    expect(validateRestoreRequest({
      manifest,
      recomputedContentHash: HASH_A,
      humanConfirmed: true,
    }).valid).toBe(true);
  });
});
