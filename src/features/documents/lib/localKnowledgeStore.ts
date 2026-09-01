import Dexie, { type Table } from 'dexie';

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

class LocalKnowledgeDatabase extends Dexie {
  sources!: Table<CustomKbDoc, string>;

  constructor() {
    super('curmanlight-local-knowledge-v1');
    this.version(1).stores({
      sources: 'id, importedAt, authorityStatus, originalFileName, sha256',
    });
  }
}

let knowledgeDb: LocalKnowledgeDatabase | null = null;

function getKnowledgeDb(): LocalKnowledgeDatabase {
  if (typeof window === 'undefined' || !window.indexedDB) {
    throw new Error('IndexedDB non disponibile in questo browser.');
  }
  if (!knowledgeDb) knowledgeDb = new LocalKnowledgeDatabase();
  return knowledgeDb;
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

export async function putLocalKnowledgeSource(source: CustomKbDoc): Promise<void> {
  await getKnowledgeDb().sources.put(normalizeKnowledgeSourceLifecycle(source));
}

export async function putLocalKnowledgeSources(sources: CustomKbDoc[]): Promise<void> {
  if (sources.length === 0) return;
  await getKnowledgeDb().sources.bulkPut(sources.map((source) => normalizeKnowledgeSourceLifecycle(source)));
}

export async function verifyLocalKnowledgeSource(id: string, verifiedAt = new Date().toISOString()): Promise<CustomKbDoc> {
  const db = getKnowledgeDb();
  const source = await db.sources.get(id);
  if (!source) throw new Error('Fonte locale non trovata.');

  const normalized = normalizeKnowledgeSourceLifecycle(source);
  const verifiedSource: CustomKbDoc = {
    ...normalized,
    authorityStatus: 'LOCAL_VERIFIED',
    authorityClass: 'LOCAL',
    lifecycleStatus: 'VERIFIED_LOCAL',
    evidenceEligibility: isExtractionEvidenceReady(normalized.extractionStatus) ? 'LOCAL_EVIDENCE' : 'CONSULT_ONLY',
    verifiedAt,
  };
  await db.sources.put(verifiedSource);
  return verifiedSource;
}

export async function deleteLocalKnowledgeSource(id: string): Promise<void> {
  await getKnowledgeDb().sources.delete(id);
}
