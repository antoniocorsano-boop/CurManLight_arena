import { describe, expect, it, vi } from 'vitest';
import {
  calculateCmlBackupContentHash,
  CML_BACKUP_SCHEMA,
  type BackupReceipt,
  type BackupSink,
} from '../domain/backup';
import {
  backupLocalSourceRegistry,
  createLocalSourceRegistryBackupArtifact,
  LOCAL_SOURCE_REGISTRY_SNAPSHOT_SCHEMA,
} from '../features/documents/lib/localSourceRegistryBackup';
import {
  deleteLocalKnowledgeSource,
  normalizeKnowledgeSourceLifecycle,
  putLocalKnowledgeSource,
  verifyLocalKnowledgeSource,
} from '../features/documents/lib/localKnowledgeStore';

const FIXED_NOW = '2026-09-05T06:15:00.000Z';
const FIXED_BACKUP_ID = 'backup:browser-source-registry';

function decodeSnapshot(payload: Uint8Array): any {
  return JSON.parse(new TextDecoder().decode(payload));
}

describe('CML-DRIVE-01 local source registry backup pipeline', () => {
  it('builds an exact governed snapshot and sends it once through the outbound BackupSink', async () => {
    const id = `backup-source-${crypto.randomUUID()}`;
    const source = normalizeKnowledgeSourceLifecycle({
      id,
      title: 'Fonte da includere nel backup',
      subtitle: 'Test browser del registro',
      content: 'Contenuto verificato da preservare nello snapshot',
      importedAt: '2026-09-05T06:10:00.000Z',
      authorityStatus: 'LOCAL_UNVERIFIED',
      ingestionMethod: 'TEXT_FILE',
      extractionStatus: 'READY',
    });

    try {
      await putLocalKnowledgeSource(source);
      await verifyLocalKnowledgeSource(id, {
        verifiedAt: '2026-09-05T06:12:00.000Z',
        scope: {
          instituteId: 'school:backup-browser-test',
          schoolOrder: 'secondaria',
          discipline: 'Tecnologia',
        },
      });

      const artifact = await createLocalSourceRegistryBackupArtifact({
        now: () => FIXED_NOW,
        backupIdFactory: () => FIXED_BACKUP_ID,
      });
      const snapshot = decodeSnapshot(artifact.payload);
      const backedUpSource = snapshot.sources.find((item: any) => item.id === id);
      const backedUpGovernance = snapshot.governance.find((item: any) => item.sourceId === id);

      expect(artifact.manifest.schema).toBe(CML_BACKUP_SCHEMA);
      expect(artifact.manifest.backupId).toBe(FIXED_BACKUP_ID);
      expect(artifact.manifest.createdAt).toBe(FIXED_NOW);
      expect(artifact.manifest.objectCounts.sources).toBeGreaterThanOrEqual(1);
      expect(artifact.manifest.objectCounts.sourceVersions).toBeGreaterThanOrEqual(1);
      expect(artifact.manifest.contentHash).toMatch(/^[0-9a-f]{64}$/);
      expect(await calculateCmlBackupContentHash(artifact.payload)).toBe(artifact.manifest.contentHash);

      expect(snapshot.schema).toBe(LOCAL_SOURCE_REGISTRY_SNAPSHOT_SCHEMA);
      expect(snapshot.createdAt).toBe(FIXED_NOW);
      expect(backedUpSource?.title).toBe('Fonte da includere nel backup');
      expect(backedUpSource?.authorityStatus).toBe('LOCAL_VERIFIED');
      expect(backedUpGovernance?.verificationStatus).toBe('verified');
      expect(backedUpGovernance?.authorityLevel).toBe('personal');
      expect(backedUpGovernance?.validFor.instituteIds).toEqual(['school:backup-browser-test']);
      expect(backedUpGovernance?.validFor.schoolOrders).toEqual(['secondaria']);
      expect(backedUpGovernance?.validFor.disciplines).toEqual(['Tecnologia']);

      const writeSnapshot = vi.fn(async (manifest, payload): Promise<BackupReceipt> => {
        const outboundSnapshot = decodeSnapshot(payload);
        expect(outboundSnapshot.schema).toBe(LOCAL_SOURCE_REGISTRY_SNAPSHOT_SCHEMA);
        expect(outboundSnapshot.sources.some((item: any) => item.id === id)).toBe(true);
        expect(await calculateCmlBackupContentHash(payload)).toBe(manifest.contentHash);

        return {
          backupId: manifest.backupId,
          provider: 'google-drive',
          remoteObjectId: 'drive-browser-test',
          contentHash: manifest.contentHash,
          exportedAt: '2026-09-05T06:16:00.000Z',
          direction: 'outbound-backup',
          authorityEffect: 'none',
        };
      });
      const sink: BackupSink = { writeSnapshot };

      const result = await backupLocalSourceRegistry(sink, {
        now: () => FIXED_NOW,
        backupIdFactory: () => FIXED_BACKUP_ID,
      });

      expect(writeSnapshot).toHaveBeenCalledTimes(1);
      expect(result.receipt.provider).toBe('google-drive');
      expect(result.receipt.direction).toBe('outbound-backup');
      expect(result.receipt.authorityEffect).toBe('none');
      expect(result.receipt.contentHash).toBe(result.artifact.manifest.contentHash);
      expect(decodeSnapshot(result.artifact.payload).sources.some((item: any) => item.id === id)).toBe(true);
    } finally {
      await deleteLocalKnowledgeSource(id).catch(() => undefined);
    }
  });
});
