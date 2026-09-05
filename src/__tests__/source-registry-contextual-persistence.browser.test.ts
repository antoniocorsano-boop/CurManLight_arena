import { describe, expect, it } from 'vitest';
import {
  calculateLocalKnowledgeSourceFingerprint,
  deleteLocalKnowledgeSource,
  getOrCreateLocalKnowledgePrincipalId,
  listLocalKnowledgeSources,
  listLocalSourceGovernanceRecords,
  normalizeKnowledgeSourceLifecycle,
  putLocalKnowledgeSource,
  verifyLocalKnowledgeSource,
} from '../features/documents/lib/localKnowledgeStore';

const registryKey = (sourceId: string, sourceVersionId: string): string => `${sourceId}::${sourceVersionId}`;

describe('CML-DRIVE-01 contextual source registry persistence', () => {
  it('persists source and exact-version governance together, then removes both together', async () => {
    const id = `browser-context-${crypto.randomUUID()}`;
    const importedAt = new Date().toISOString();
    const source = normalizeKnowledgeSourceLifecycle({
      id,
      title: 'Fonte browser di prova',
      subtitle: 'Persistenza IndexedDB',
      content: 'Versione esatta verificata nel test browser',
      importedAt,
      authorityStatus: 'LOCAL_UNVERIFIED',
      ingestionMethod: 'TEXT_FILE',
      extractionStatus: 'READY',
    });

    try {
      await putLocalKnowledgeSource(source);

      const beforeVerification = (await listLocalSourceGovernanceRecords()).find((record) =>
        registryKey(record.sourceId, record.sourceVersionId) === registryKey(source.id, source.sourceVersionId));
      expect(beforeVerification?.verificationStatus).toBe('imported');
      expect(beforeVerification?.authorityLevel).toBe('personal');

      const verified = await verifyLocalKnowledgeSource(id, {
        scope: {
          instituteId: 'school:browser-test',
          schoolOrder: 'secondaria',
          discipline: 'Tecnologia',
        },
      });
      const principalId = await getOrCreateLocalKnowledgePrincipalId();
      const fingerprint = await calculateLocalKnowledgeSourceFingerprint(verified);

      const persistedSource = (await listLocalKnowledgeSources()).find((item) => item.id === id);
      const persistedGovernance = (await listLocalSourceGovernanceRecords()).find((record) =>
        registryKey(record.sourceId, record.sourceVersionId) === registryKey(verified.id, verified.sourceVersionId));

      expect(persistedSource?.authorityStatus).toBe('LOCAL_VERIFIED');
      expect(persistedGovernance?.verificationStatus).toBe('verified');
      expect(persistedGovernance?.authorityLevel).toBe('personal');
      expect(persistedGovernance?.versionFingerprint).toBe(fingerprint);
      expect(persistedGovernance?.validFor.userIds).toEqual([principalId]);
      expect(persistedGovernance?.validFor.instituteIds).toEqual(['school:browser-test']);
      expect(persistedGovernance?.validFor.schoolOrders).toEqual(['secondaria']);
      expect(persistedGovernance?.validFor.disciplines).toEqual(['Tecnologia']);

      await deleteLocalKnowledgeSource(id);
      const sourcesAfterDelete = await listLocalKnowledgeSources();
      const governanceAfterDelete = await listLocalSourceGovernanceRecords();
      expect(sourcesAfterDelete.some((item) => item.id === id)).toBe(false);
      expect(governanceAfterDelete.some((record) => record.sourceId === id)).toBe(false);
    } finally {
      await deleteLocalKnowledgeSource(id).catch(() => undefined);
    }
  });
});
