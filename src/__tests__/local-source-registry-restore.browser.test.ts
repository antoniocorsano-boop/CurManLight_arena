import { describe, expect, it } from 'vitest';
import {
  createCmlBackupArtifact,
  encodeCmlBackupPackage,
} from '../domain/backup';
import {
  applyLocalSourceRegistryRestore,
  previewLocalSourceRegistryRestore,
} from '../features/documents/lib/localSourceRegistryRestore';
import {
  createLocalSourceRegistryBackupArtifact,
  LOCAL_SOURCE_REGISTRY_SCHEMA_VERSION,
} from '../features/documents/lib/localSourceRegistryBackup';
import {
  deleteLocalKnowledgeSource,
  getOrCreateLocalKnowledgePrincipalId,
  listLocalKnowledgeSources,
  normalizeKnowledgeSourceLifecycle,
  putLocalKnowledgeSource,
  verifyLocalKnowledgeSource,
} from '../features/documents/lib/localKnowledgeStore';

const packageArtifact = (artifact: Awaited<ReturnType<typeof createLocalSourceRegistryBackupArtifact>>) =>
  encodeCmlBackupPackage(artifact.manifest, artifact.payload);

describe('CML-DRIVE-01 explicit local source-registry restore', () => {
  it('previews before mutation and atomically replaces the registry only after explicit apply', async () => {
    const originalArtifact = await createLocalSourceRegistryBackupArtifact();
    const originalPackage = packageArtifact(originalArtifact);
    const sourceId = `restore-source-${crypto.randomUUID()}`;
    const extraId = `restore-extra-${crypto.randomUUID()}`;

    try {
      await putLocalKnowledgeSource(normalizeKnowledgeSourceLifecycle({
        id: sourceId,
        title: 'Fonte da ripristinare',
        subtitle: 'Restore browser test',
        content: 'Contenuto esatto incluso nel backup',
        importedAt: '2026-09-05T07:00:00.000Z',
        authorityStatus: 'LOCAL_UNVERIFIED',
        ingestionMethod: 'TEXT_FILE',
        extractionStatus: 'READY',
      }));
      await verifyLocalKnowledgeSource(sourceId, {
        verifiedAt: '2026-09-05T07:01:00.000Z',
        scope: { schoolOrder: 'secondaria', discipline: 'Tecnologia' },
      });

      const backup = await createLocalSourceRegistryBackupArtifact({
        now: () => '2026-09-05T07:02:00.000Z',
        backupIdFactory: () => 'restore-browser-exact',
      });
      const packageBytes = packageArtifact(backup);

      await putLocalKnowledgeSource(normalizeKnowledgeSourceLifecycle({
        id: extraId,
        title: 'Fonte successiva al backup',
        subtitle: 'Deve sparire solo dopo conferma',
        content: 'Contenuto successivo',
        importedAt: '2026-09-05T07:03:00.000Z',
        authorityStatus: 'LOCAL_UNVERIFIED',
        ingestionMethod: 'TEXT_FILE',
        extractionStatus: 'READY',
      }));

      const preview = await previewLocalSourceRegistryRestore(packageBytes);
      const beforeApply = await listLocalKnowledgeSources();
      expect(beforeApply.some((source) => source.id === extraId)).toBe(true);
      expect(preview.currentSourceCount).toBe(beforeApply.length);
      expect(preview.restoredSourceCount).toBe(backup.manifest.objectCounts.sources);
      expect(preview.recomputedContentHash).toBe(backup.manifest.contentHash);
      expect(preview.preparedSources.some((source) => source.id === sourceId)).toBe(true);

      const result = await applyLocalSourceRegistryRestore(preview);
      const restored = result.sources.find((source) => source.id === sourceId);
      expect(restored?.authorityStatus).toBe('LOCAL_VERIFIED');
      expect(result.sources.some((source) => source.id === extraId)).toBe(false);
      expect(result.preservedVerificationCount).toBeGreaterThanOrEqual(1);
    } finally {
      const originalPreview = await previewLocalSourceRegistryRestore(originalPackage);
      await applyLocalSourceRegistryRestore(originalPreview);
    }
  });

  it('does not inherit personal verification when the backup principal differs', async () => {
    const originalArtifact = await createLocalSourceRegistryBackupArtifact();
    const originalPackage = packageArtifact(originalArtifact);
    const sourceId = `restore-principal-${crypto.randomUUID()}`;

    try {
      await putLocalKnowledgeSource(normalizeKnowledgeSourceLifecycle({
        id: sourceId,
        title: 'Fonte con principal diverso',
        subtitle: 'Verifica non trasferibile automaticamente',
        content: 'Contenuto integro ma identità diversa',
        importedAt: '2026-09-05T07:10:00.000Z',
        authorityStatus: 'LOCAL_UNVERIFIED',
        ingestionMethod: 'TEXT_FILE',
        extractionStatus: 'READY',
      }));
      await verifyLocalKnowledgeSource(sourceId, {
        verifiedAt: '2026-09-05T07:11:00.000Z',
        scope: { discipline: 'Tecnologia' },
      });
      const backup = await createLocalSourceRegistryBackupArtifact({
        now: () => '2026-09-05T07:12:00.000Z',
        backupIdFactory: () => 'restore-browser-other-principal',
      });

      const snapshot = JSON.parse(new TextDecoder().decode(backup.payload));
      const record = snapshot.governance.find((item: any) => item.sourceId === sourceId);
      expect(record).toBeTruthy();
      record.validFor.userIds = ['local:other-principal'];
      record.provenance.assertedBy = 'local:other-principal';
      record.provenance.verifiedBy = 'local:other-principal';

      const payload = new TextEncoder().encode(JSON.stringify(snapshot));
      const foreignArtifact = await createCmlBackupArtifact({
        backupId: 'restore-browser-other-principal',
        createdAt: backup.manifest.createdAt,
        sourceRegistrySchemaVersion: LOCAL_SOURCE_REGISTRY_SCHEMA_VERSION,
        objectCounts: backup.manifest.objectCounts,
        payload,
      });
      const preview = await previewLocalSourceRegistryRestore(
        encodeCmlBackupPackage(foreignArtifact.manifest, foreignArtifact.payload),
      );
      const currentPrincipal = await getOrCreateLocalKnowledgePrincipalId();
      const preparedSource = preview.preparedSources.find((source) => source.id === sourceId);
      const preparedGovernance = preview.preparedGovernance.find((item) => item.sourceId === sourceId);

      expect(preparedSource?.authorityStatus).toBe('LOCAL_UNVERIFIED');
      expect(preparedSource?.lifecycleStatus).toBe('PENDING_VERIFICATION');
      expect(preparedGovernance?.verificationStatus).toBe('imported');
      expect(preparedGovernance?.validFor.userIds).toEqual([currentPrincipal]);
      expect(preparedGovernance?.provenance.verifiedBy).toBeUndefined();
      expect(preview.principalRebindCount).toBeGreaterThanOrEqual(1);
      expect(preview.needsVerificationCount).toBeGreaterThanOrEqual(1);
    } finally {
      await deleteLocalKnowledgeSource(sourceId).catch(() => undefined);
      const originalPreview = await previewLocalSourceRegistryRestore(originalPackage);
      await applyLocalSourceRegistryRestore(originalPreview);
    }
  });

  it('blocks a package whose payload no longer matches the manifest hash', async () => {
    const backup = await createLocalSourceRegistryBackupArtifact({
      now: () => '2026-09-05T07:20:00.000Z',
      backupIdFactory: () => 'restore-browser-tamper',
    });
    const packageBytes = packageArtifact(backup);
    const tampered = packageBytes.slice();
    tampered[tampered.length - 1] = (tampered[tampered.length - 1] ?? 0) ^ 1;

    await expect(previewLocalSourceRegistryRestore(tampered)).rejects.toThrow('RESTORE_CONTENT_HASH_MISMATCH');
  });
});
