import Dexie, { type Table } from 'dexie';

export type KnowledgeAuthorityStatus = 'LOCAL_UNVERIFIED' | 'LOCAL_VERIFIED';
export type KnowledgeIngestionMethod = 'PASTE' | 'TEXT_FILE' | 'PDF_TEXT_EXTRACTION' | 'LEGACY_LOCAL_STORAGE';
export type KnowledgeExtractionStatus = 'NOT_REQUIRED' | 'READY' | 'PARTIAL' | 'OCR_REQUIRED';

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
  verifiedAt?: string;
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

export async function listLocalKnowledgeSources(): Promise<CustomKbDoc[]> {
  return getKnowledgeDb().sources.orderBy('importedAt').reverse().toArray();
}

export async function putLocalKnowledgeSource(source: CustomKbDoc): Promise<void> {
  await getKnowledgeDb().sources.put(source);
}

export async function putLocalKnowledgeSources(sources: CustomKbDoc[]): Promise<void> {
  if (sources.length === 0) return;
  await getKnowledgeDb().sources.bulkPut(sources);
}

export async function verifyLocalKnowledgeSource(id: string, verifiedAt = new Date().toISOString()): Promise<CustomKbDoc> {
  const db = getKnowledgeDb();
  const source = await db.sources.get(id);
  if (!source) throw new Error('Fonte locale non trovata.');

  const verifiedSource: CustomKbDoc = {
    ...source,
    authorityStatus: 'LOCAL_VERIFIED',
    verifiedAt,
  };
  await db.sources.put(verifiedSource);
  return verifiedSource;
}

export async function deleteLocalKnowledgeSource(id: string): Promise<void> {
  await getKnowledgeDb().sources.delete(id);
}
