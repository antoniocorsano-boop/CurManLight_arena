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
  it('persists exact-version governance, invalidates changed content, supports explicit reverification, and deletes atomically', async () => {
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
      const firstFingerprint = await calculateLocalKnowledgeSourceFingerprint(verified);

      const persistedSource = (await listLocalKnowledgeSources()).find((item) => item.id === id);
      const persistedGovernance = (await listLocalSourceGovernanceRecords()).find((record) =>
        registryKey(record.sourceId, record.sourceVersionId) === registryKey(verified.id, verified.sourceVersionId));

      expect(persistedSource?.authorityStatus).toBe('LOCAL_VERIFIED');
      expect(persistedGovernance?.verificationStatus).toBe('verified');
      expect(persistedGovernance?.authorityLevel).toBe('personal');
      expect(persistedGovernance?.versionFingerprint).toBe(firstFingerprint);
      expect(persistedGovernance?.validFor.userIds).toEqual([principalId]);
      expect(persistedGovernance?.validFor.instituteIds).toEqual(['school:browser-test']);
      expect(persistedGovernance?.validFor.schoolOrders).toEqual(['secondaria']);
      expect(persistedGovernance?.validFor.disciplines).toEqual(['Tecnologia']);

      await putLocalKnowledgeSource({
        ...verified,
        content: 'Contenuto modificato dopo la prima verifica',
      });
      const changedSource = (await listLocalKnowledgeSources()).find((item) => item.id === id);
      const changedGovernance = (await listLocalSourceGovernanceRecords()).find((record) =>
        registryKey(record.sourceId, record.sourceVersionId) === registryKey(verified.id, verified.sourceVersionId));
      const changedFingerprint = changedSource
        ? await calculateLocalKnowledgeSourceFingerprint(changedSource)
        : undefined;

      expect(changedSource?.authorityStatus).toBe('LOCAL_UNVERIFIED');
      expect(changedSource?.evidenceEligibility).toBe('CONSULT_ONLY');
      expect(changedSource?.verifiedAt).toBeUndefined();
      expect(changedGovernance?.verificationStatus).toBe('imported');
      expect(changedGovernance?.versionFingerprint).toBe(changedFingerprint);
      expect(changedGovernance?.versionFingerprint).not.toBe(firstFingerprint);

      const reverified = await verifyLocalKnowledgeSource(id, {
        scope: {
          instituteId: 'school:browser-test',
          schoolOrder: 'secondaria',
          discipline: 'Tecnologia',
        },
      });
      const reverifiedFingerprint = await calculateLocalKnowledgeSourceFingerprint(reverified);
      const reverifiedGovernance = (await listLocalSourceGovernanceRecords()).find((record) =>
        registryKey(record.sourceId, record.sourceVersionId) === registryKey(reverified.id, reverified.sourceVersionId));

      expect(reverified.authorityStatus).toBe('LOCAL_VERIFIED');
      expect(reverifiedGovernance?.verificationStatus).toBe('verified');
      expect(reverifiedGovernance?.versionFingerprint).toBe(reverifiedFingerprint);
      expect(reverifiedGovernance?.versionFingerprint).not.toBe(firstFingerprint);
      expect(reverifiedGovernance?.authorityLevel).toBe('personal');

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
