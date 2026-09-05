import Dexie, { type Table } from 'dexie';
import type { SourceGovernanceRecord } from '../../../domain/curriculum/sources/governance';
import {
  buildLocalSourceGovernanceRecord,
  type LocalSourceGovernanceScope,
} from './localSourceGovernance';

export type KnowledgeAuthorityStatus = 'LOCAL_UNVERIFIED' | 'LOCAL_VERIFIED';
export type KnowledgeAuthorityClass = 'LOCAL' | 'INSTITUTIONAL' | 'NORMATIVE' | 'DERIVED' | 'ARCHIVED_REFERENCE';
export type KnowledgeIngestionMethod = 'PASTE' | 'TEXT_FILE' | 'PDF_TEXT_EXTRACTION' | 'LEGACY_LOCAL_STORAGE';
export type KnowledgeExtractionStatus = 'NOT_REQUIRED' | 'READY' | 'PARTIAL' | 'OCR_REQUIRED';
export type KnowledgeSourceType = 'USER_LOCAL_DOCUMENT';
export type KnowledgeLifecycleStatus = 'PENDING_VERIFICATION' | 'VERIFIED_LOCAL';
export type KnowledgeEvidenceEligibility = 'CONSULT_ONLY' | 'LOCAL_EVIDENCE';

export type KnowledgeImportMetadata = {
  originalFileName?: string;
  mediaType?: string;
  byteSize?: number;
  sha256?: string;
  pageCount?: number;
  ingestionMethod: KnowledgeIngestionMethod;
  extractionStatus: KnowledgeExtractionStatus;
  textEditedAfterExtraction?: boolean;
};

export type CustomKbDoc = KnowledgeImportMetadata & {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  importedAt: string;
  authorityStatus: KnowledgeAuthorityStatus;
  authorityClass: KnowledgeAuthorityClass;
  verifiedAt?: string;
  sourceType: KnowledgeSourceType;
  lifecycleStatus: KnowledgeLifecycleStatus;
  sourceVersionId: string;
  evidenceEligibility: KnowledgeEvidenceEligibility;
};

type PersistedSourceGovernanceRecord = SourceGovernanceRecord & {
  registryId: string;
  recordedAt: string;
};

type LocalKnowledgeMeta = {
  key: string;
  value: string;
};

export type LocalKnowledgeVerificationOptions = {
  verifiedAt?: string;
  scope?: LocalSourceGovernanceScope;
};

class LocalKnowledgeDatabase extends Dexie {
  sources!: Table<CustomKbDoc, string>;
  governance!: Table<PersistedSourceGovernanceRecord, string>;
  meta!: Table<LocalKnowledgeMeta, string>;

  constructor() {
    super('curmanlight-local-knowledge-v1');
    this.version(1).stores({
      sources: 'id, importedAt, authorityStatus, originalFileName, sha256',
    });
    this.version(2).stores({
      sources: 'id, importedAt, authorityStatus, originalFileName, sha256',
      governance: 'registryId, sourceId, sourceVersionId, verificationStatus, authorityLevel',
      meta: 'key',
    });
  }
}

let knowledgeDb: LocalKnowledgeDatabase | null = null;
const LOCAL_PRINCIPAL_KEY = 'local-principal-id';

function getKnowledgeDb(): LocalKnowledgeDatabase {
  if (typeof window === 'undefined' || !window.indexedDB) {
    throw new Error('IndexedDB non disponibile in questo browser.');
  }
  if (!knowledgeDb) knowledgeDb = new LocalKnowledgeDatabase();
  return knowledgeDb;
}

function governanceRegistryId(sourceId: string, sourceVersionId: string): string {
  return `${sourceId}::${sourceVersionId}`;
}

function scopeFromGovernance(record: SourceGovernanceRecord | undefined): LocalSourceGovernanceScope {
  return {
    instituteId: record?.validFor.instituteIds?.[0],
    schoolOrder: record?.validFor.schoolOrders?.[0],
    discipline: record?.validFor.disciplines?.[0],
  };
}

function hasExplicitScope(scope: LocalSourceGovernanceScope | undefined): boolean {
  return Boolean(scope?.instituteId || scope?.schoolOrder || scope?.discipline);
}

export async function getOrCreateLocalKnowledgePrincipalId(): Promise<string> {
  const db = getKnowledgeDb();
  const existing = await db.meta.get(LOCAL_PRINCIPAL_KEY);
  if (existing?.value) return existing.value;

  if (!globalThis.crypto?.randomUUID) {
    throw new Error('Generatore di identità locale non disponibile.');
  }

  const value = `local:${globalThis.crypto.randomUUID()}`;
  await db.meta.put({ key: LOCAL_PRINCIPAL_KEY, value });
  return value;
}

export async function calculateLocalKnowledgeSourceFingerprint(source: Pick<CustomKbDoc, 'content'>): Promise<string> {
  if (!globalThis.crypto?.subtle) {
    throw new Error('SHA-256 non disponibile in questo browser.');
  }
  const payload = new TextEncoder().encode(source.content);
  const digest = await globalThis.crypto.subtle.digest('SHA-256', payload);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function prepareGovernanceRecord(
  source: CustomKbDoc,
  scope?: LocalSourceGovernanceScope,
): Promise<PersistedSourceGovernanceRecord> {
  const db = getKnowledgeDb();
  const principalId = await getOrCreateLocalKnowledgePrincipalId();
  const versionFingerprint = await calculateLocalKnowledgeSourceFingerprint(source);
  const registryId = governanceRegistryId(source.id, source.sourceVersionId);
  const existing = await db.governance.get(registryId);
  const effectiveScope = hasExplicitScope(scope) ? scope : scopeFromGovernance(existing);

  if (existing && existing.versionFingerprint !== versionFingerprint) {
    const downgradedSource: CustomKbDoc = {
      ...source,
      authorityStatus: 'LOCAL_UNVERIFIED',
      lifecycleStatus: 'PENDING_VERIFICATION',
      evidenceEligibility: 'CONSULT_ONLY',
      verifiedAt: undefined,
    };
    return {
      ...buildLocalSourceGovernanceRecord(downgradedSource, principalId, versionFingerprint, effectiveScope),
      registryId,
      recordedAt: new Date().toISOString(),
    };
  }

  const next = buildLocalSourceGovernanceRecord(source, principalId, versionFingerprint, effectiveScope);
  if (
    existing
    && existing.versionFingerprint === versionFingerprint
    && existing.verificationStatus === next.verificationStatus
    && !hasExplicitScope(scope)
  ) {
    return existing;
  }

  return {
    ...next,
    registryId,
    recordedAt: new Date().toISOString(),
  };
}

export function createKnowledgeSourceVersionId(source: Pick<CustomKbDoc, 'sha256' | 'importedAt'>): string {
  if (source.sha256) return `sha256:${source.sha256}`;
  return `local:${source.importedAt}`;
}

export function isExtractionEvidenceReady(status: KnowledgeExtractionStatus): boolean {
  return status === 'READY' || status === 'NOT_REQUIRED';
}

export function normalizeKnowledgeSourceLifecycle(source: Omit<CustomKbDoc, 'sourceType' | 'lifecycleStatus' | 'sourceVersionId' | 'evidenceEligibility' | 'authorityClass'> & Partial<Pick<CustomKbDoc, 'sourceType' | 'lifecycleStatus' | 'sourceVersionId' | 'evidenceEligibility' | 'authorityClass'>>): CustomKbDoc {
  const sourceType = source.sourceType ?? 'USER_LOCAL_DOCUMENT';
  const authorityClass = source.authorityClass ?? 'LOCAL';
  const lifecycleStatus = source.lifecycleStatus
    ?? (source.authorityStatus === 'LOCAL_VERIFIED' ? 'VERIFIED_LOCAL' : 'PENDING_VERIFICATION');
  const evidenceEligibility = source.evidenceEligibility
    ?? (source.authorityStatus === 'LOCAL_VERIFIED' && isExtractionEvidenceReady(source.extractionStatus)
      ? 'LOCAL_EVIDENCE'
      : 'CONSULT_ONLY');
  const sourceVersionId = source.sourceVersionId ?? createKnowledgeSourceVersionId(source);

  return {
    ...source,
    sourceType,
    authorityClass,
    lifecycleStatus,
    sourceVersionId,
    evidenceEligibility,
  } as CustomKbDoc;
}

export function isLocalKnowledgeEvidenceEligible(source: CustomKbDoc): boolean {
  return source.authorityClass === 'LOCAL'
    && source.authorityStatus === 'LOCAL_VERIFIED'
    && source.lifecycleStatus === 'VERIFIED_LOCAL'
    && source.evidenceEligibility === 'LOCAL_EVIDENCE'
    && isExtractionEvidenceReady(source.extractionStatus);
}

export async function listLocalKnowledgeSources(): Promise<CustomKbDoc[]> {
  const sources = await getKnowledgeDb().sources.orderBy('importedAt').reverse().toArray();
  return sources.map((source) => normalizeKnowledgeSourceLifecycle(source));
}

export async function listLocalSourceGovernanceRecords(): Promise<SourceGovernanceRecord[]> {
  const records = await getKnowledgeDb().governance.toArray();
  return records.map(({ registryId: _registryId, recordedAt: _recordedAt, ...record }) => record);
}

export async function ensureLocalKnowledgeGovernanceRecords(sources: readonly CustomKbDoc[]): Promise<SourceGovernanceRecord[]> {
  if (sources.length === 0) return [];
  const db = getKnowledgeDb();
  const prepared = await Promise.all(sources.map((source) => prepareGovernanceRecord(source)));
  await db.governance.bulkPut(prepared);
  return prepared.map(({ registryId: _registryId, recordedAt: _recordedAt, ...record }) => record);
}

export async function putLocalKnowledgeSource(source: CustomKbDoc): Promise<void> {
  const db = getKnowledgeDb();
  const normalized = normalizeKnowledgeSourceLifecycle(source);
  const governance = await prepareGovernanceRecord(normalized);
  await db.transaction('rw', db.sources, db.governance, async () => {
    await db.sources.put(normalized);
    await db.governance.put(governance);
  });
}

export async function putLocalKnowledgeSources(sources: CustomKbDoc[]): Promise<void> {
  if (sources.length === 0) return;
  const db = getKnowledgeDb();
  const normalized = sources.map((source) => normalizeKnowledgeSourceLifecycle(source));
  const governance = await Promise.all(normalized.map((source) => prepareGovernanceRecord(source)));
  await db.transaction('rw', db.sources, db.governance, async () => {
    await db.sources.bulkPut(normalized);
    await db.governance.bulkPut(governance);
  });
}

export async function verifyLocalKnowledgeSource(
  id: string,
  options: string | LocalKnowledgeVerificationOptions = {},
): Promise<CustomKbDoc> {
  const db = getKnowledgeDb();
  const source = await db.sources.get(id);
  if (!source) throw new Error('Fonte locale non trovata.');

  const verifiedAt = typeof options === 'string'
    ? options
    : options.verifiedAt ?? new Date().toISOString();
  const requestedScope = typeof options === 'string' ? undefined : options.scope;
  const normalized = normalizeKnowledgeSourceLifecycle(source);
  const verifiedSource: CustomKbDoc = {
    ...normalized,
    authorityStatus: 'LOCAL_VERIFIED',
    authorityClass: 'LOCAL',
    lifecycleStatus: 'VERIFIED_LOCAL',
    evidenceEligibility: isExtractionEvidenceReady(normalized.extractionStatus) ? 'LOCAL_EVIDENCE' : 'CONSULT_ONLY',
    verifiedAt,
  };
  const governance = await prepareGovernanceRecord(verifiedSource, requestedScope);

  await db.transaction('rw', db.sources, db.governance, async () => {
    await db.sources.put(verifiedSource);
    await db.governance.put(governance);
  });
  return verifiedSource;
}

export async function deleteLocalKnowledgeSource(id: string): Promise<void> {
  const db = getKnowledgeDb();
  await db.transaction('rw', db.sources, db.governance, async () => {
    await db.sources.delete(id);
    await db.governance.where('sourceId').equals(id).delete();
  });
}
