import {
  calculateCmlBackupContentHash,
  decodeCmlBackupPackage,
  validateRestoreRequest,
  type CmlBackupManifest,
} from '../../../domain/backup';
import {
  validateSourceGovernance,
  type SourceGovernanceRecord,
} from '../../../domain/curriculum/sources/governance';
import {
  calculateLocalKnowledgeSourceFingerprint,
  getOrCreateLocalKnowledgePrincipalId,
  listLocalKnowledgeSources,
  replaceLocalKnowledgeRegistryFromRestore,
  type CustomKbDoc,
} from './localKnowledgeStore';
import {
  LOCAL_SOURCE_REGISTRY_SCHEMA_VERSION,
  LOCAL_SOURCE_REGISTRY_SNAPSHOT_SCHEMA,
} from './localSourceRegistryBackup';

export interface LocalSourceRegistryRestorePreview {
  manifest: CmlBackupManifest;
  recomputedContentHash: string;
  snapshotCreatedAt: string;
  currentSourceCount: number;
  restoredSourceCount: number;
  preservedVerificationCount: number;
  needsVerificationCount: number;
  principalRebindCount: number;
  preparedSources: readonly CustomKbDoc[];
  preparedGovernance: readonly SourceGovernanceRecord[];
}

export interface LocalSourceRegistryRestoreResult {
  sources: CustomKbDoc[];
  restoredSourceCount: number;
  preservedVerificationCount: number;
  needsVerificationCount: number;
}

type RawSnapshot = {
  schema?: unknown;
  createdAt?: unknown;
  sources?: unknown;
  governance?: unknown;
};

const INGESTION_METHODS = new Set(['PASTE', 'TEXT_FILE', 'PDF_TEXT_EXTRACTION', 'LEGACY_LOCAL_STORAGE']);
const EXTRACTION_STATUSES = new Set(['NOT_REQUIRED', 'READY', 'PARTIAL', 'OCR_REQUIRED']);
const AUTHORITY_STATUSES = new Set(['LOCAL_UNVERIFIED', 'LOCAL_VERIFIED']);
const LIFECYCLE_STATUSES = new Set(['PENDING_VERIFICATION', 'VERIFIED_LOCAL']);
const EVIDENCE_ELIGIBILITY = new Set(['CONSULT_ONLY', 'LOCAL_EVIDENCE']);

function asObject(value: unknown, errorCode: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(errorCode);
  return value as Record<string, unknown>;
}

function requireString(value: unknown, errorCode: string): string {
  if (typeof value !== 'string' || !value.trim()) throw new Error(errorCode);
  return value;
}

function assertLocalSource(value: unknown): asserts value is CustomKbDoc {
  const source = asObject(value, 'RESTORE_SOURCE_INVALID');
  requireString(source.id, 'RESTORE_SOURCE_ID_REQUIRED');
  requireString(source.title, 'RESTORE_SOURCE_TITLE_REQUIRED');
  if (typeof source.subtitle !== 'string') throw new Error('RESTORE_SOURCE_SUBTITLE_INVALID');
  if (typeof source.content !== 'string') throw new Error('RESTORE_SOURCE_CONTENT_INVALID');
  requireString(source.importedAt, 'RESTORE_SOURCE_IMPORTED_AT_REQUIRED');
  requireString(source.sourceVersionId, 'RESTORE_SOURCE_VERSION_REQUIRED');
  if (source.sourceType !== 'USER_LOCAL_DOCUMENT') throw new Error('RESTORE_SOURCE_TYPE_UNSUPPORTED');
  if (source.authorityClass !== 'LOCAL') throw new Error('RESTORE_SOURCE_AUTHORITY_ESCALATION_BLOCKED');
  if (!AUTHORITY_STATUSES.has(String(source.authorityStatus))) throw new Error('RESTORE_SOURCE_AUTHORITY_STATUS_INVALID');
  if (!LIFECYCLE_STATUSES.has(String(source.lifecycleStatus))) throw new Error('RESTORE_SOURCE_LIFECYCLE_INVALID');
  if (!EVIDENCE_ELIGIBILITY.has(String(source.evidenceEligibility))) throw new Error('RESTORE_SOURCE_EVIDENCE_ELIGIBILITY_INVALID');
  if (!INGESTION_METHODS.has(String(source.ingestionMethod))) throw new Error('RESTORE_SOURCE_INGESTION_INVALID');
  if (!EXTRACTION_STATUSES.has(String(source.extractionStatus))) throw new Error('RESTORE_SOURCE_EXTRACTION_INVALID');
}

function assertGovernanceRecord(value: unknown): asserts value is SourceGovernanceRecord {
  const record = asObject(value, 'RESTORE_GOVERNANCE_INVALID');
  requireString(record.sourceId, 'RESTORE_GOVERNANCE_SOURCE_REQUIRED');
  requireString(record.sourceVersionId, 'RESTORE_GOVERNANCE_VERSION_REQUIRED');
  requireString(record.versionFingerprint, 'RESTORE_GOVERNANCE_FINGERPRINT_REQUIRED');
  if (record.authorityLevel !== 'personal') throw new Error('RESTORE_GOVERNANCE_AUTHORITY_ESCALATION_BLOCKED');
  if (!record.validFor || typeof record.validFor !== 'object') throw new Error('RESTORE_GOVERNANCE_SCOPE_INVALID');
  if (!record.provenance || typeof record.provenance !== 'object') throw new Error('RESTORE_GOVERNANCE_PROVENANCE_INVALID');
  const validation = validateSourceGovernance(value as SourceGovernanceRecord);
  if (!validation.valid) throw new Error(`RESTORE_GOVERNANCE_INVALID:${validation.errors.join(',')}`);
  const userIds = (value as SourceGovernanceRecord).validFor.userIds;
  if (!userIds || userIds.length !== 1 || !userIds[0]?.trim()) {
    throw new Error('RESTORE_PERSONAL_USER_SCOPE_INVALID');
  }
}

function parseSnapshot(payload: Uint8Array): {
  createdAt: string;
  sources: CustomKbDoc[];
  governance: SourceGovernanceRecord[];
} {
  let raw: RawSnapshot;
  try {
    raw = JSON.parse(new TextDecoder().decode(payload)) as RawSnapshot;
  } catch {
    throw new Error('RESTORE_SNAPSHOT_INVALID_JSON');
  }

  if (raw.schema !== LOCAL_SOURCE_REGISTRY_SNAPSHOT_SCHEMA) throw new Error('RESTORE_SNAPSHOT_SCHEMA_UNSUPPORTED');
  const createdAt = requireString(raw.createdAt, 'RESTORE_SNAPSHOT_CREATED_AT_REQUIRED');
  if (!Array.isArray(raw.sources) || !Array.isArray(raw.governance)) throw new Error('RESTORE_SNAPSHOT_COLLECTIONS_INVALID');

  raw.sources.forEach(assertLocalSource);
  raw.governance.forEach(assertGovernanceRecord);
  return {
    createdAt,
    sources: raw.sources as CustomKbDoc[],
    governance: raw.governance as SourceGovernanceRecord[],
  };
}

function validateManifestCoverage(
  manifest: CmlBackupManifest,
  snapshot: { createdAt: string; sources: readonly CustomKbDoc[]; governance: readonly SourceGovernanceRecord[] },
): void {
  if (manifest.sourceRegistrySchemaVersion !== LOCAL_SOURCE_REGISTRY_SCHEMA_VERSION) {
    throw new Error('RESTORE_SOURCE_REGISTRY_SCHEMA_UNSUPPORTED');
  }
  if (manifest.createdAt !== snapshot.createdAt) throw new Error('RESTORE_CREATED_AT_MISMATCH');

  const uniqueVersions = new Set(snapshot.sources.map((source) => source.sourceVersionId));
  if (manifest.objectCounts.sources !== snapshot.sources.length) throw new Error('RESTORE_SOURCE_COUNT_MISMATCH');
  if (manifest.objectCounts.sourceVersions !== uniqueVersions.size) throw new Error('RESTORE_SOURCE_VERSION_COUNT_MISMATCH');
  if (manifest.objectCounts.documents !== snapshot.sources.length) throw new Error('RESTORE_DOCUMENT_COUNT_MISMATCH');
  if (
    manifest.objectCounts.curriculumVersions !== 0
    || manifest.objectCounts.revisions !== 0
    || manifest.objectCounts.workspaces !== 0
  ) {
    throw new Error('RESTORE_SCOPE_EXCEEDS_LOCAL_SOURCE_REGISTRY');
  }
  if (snapshot.governance.length !== snapshot.sources.length) throw new Error('RESTORE_GOVERNANCE_COUNT_MISMATCH');
}

function governanceKey(sourceId: string, sourceVersionId: string): string {
  return `${sourceId}::${sourceVersionId}`;
}

function downgradeForCurrentPrincipal(
  source: CustomKbDoc,
  governance: SourceGovernanceRecord,
  currentPrincipalId: string,
): { source: CustomKbDoc; governance: SourceGovernanceRecord } {
  const previousVerifier = governance.provenance.verifiedBy;
  const previousVerifiedAt = governance.provenance.verifiedAt;
  const historyNote = governance.verificationStatus === 'verified'
    ? `Verifica del backup non ereditata automaticamente${previousVerifier ? ` (${previousVerifier}` : ''}${previousVerifiedAt ? `, ${previousVerifiedAt}` : ''}${previousVerifier ? ')' : ''}. Richiesta nuova verifica nel principal locale corrente.`
    : 'Fonte ripristinata nel principal locale corrente; resta da verificare.';
  const existingNotes = governance.provenance.notes?.trim();

  return {
    source: {
      ...source,
      authorityStatus: 'LOCAL_UNVERIFIED',
      authorityClass: 'LOCAL',
      lifecycleStatus: 'PENDING_VERIFICATION',
      evidenceEligibility: 'CONSULT_ONLY',
      verifiedAt: undefined,
    },
    governance: {
      ...governance,
      authorityLevel: 'personal',
      verificationStatus: 'imported',
      validFor: {
        ...governance.validFor,
        userIds: [currentPrincipalId],
      },
      provenance: {
        ...governance.provenance,
        assertedBy: currentPrincipalId,
        verifiedBy: undefined,
        verifiedAt: undefined,
        notes: existingNotes ? `${existingNotes} ${historyNote}` : historyNote,
      },
    },
  };
}

export async function previewLocalSourceRegistryRestore(
  packageBytes: Uint8Array,
): Promise<LocalSourceRegistryRestorePreview> {
  const { manifest, payload } = decodeCmlBackupPackage(packageBytes);
  const recomputedContentHash = await calculateCmlBackupContentHash(payload);
  if (recomputedContentHash !== manifest.contentHash) throw new Error('RESTORE_CONTENT_HASH_MISMATCH');

  const snapshot = parseSnapshot(payload);
  validateManifestCoverage(manifest, snapshot);

  const currentPrincipalId = await getOrCreateLocalKnowledgePrincipalId();
  const currentSources = await listLocalKnowledgeSources();
  const sourceIds = new Set<string>();
  const governanceByKey = new Map<string, SourceGovernanceRecord>();

  for (const record of snapshot.governance) {
    const key = governanceKey(String(record.sourceId), String(record.sourceVersionId));
    if (governanceByKey.has(key)) throw new Error('RESTORE_DUPLICATE_GOVERNANCE_RECORD');
    governanceByKey.set(key, record);
  }

  const preparedSources: CustomKbDoc[] = [];
  const preparedGovernance: SourceGovernanceRecord[] = [];
  let preservedVerificationCount = 0;
  let needsVerificationCount = 0;
  let principalRebindCount = 0;

  for (const source of snapshot.sources) {
    if (sourceIds.has(source.id)) throw new Error('RESTORE_DUPLICATE_SOURCE_ID');
    sourceIds.add(source.id);

    const key = governanceKey(source.id, source.sourceVersionId);
    const governance = governanceByKey.get(key);
    if (!governance) throw new Error('RESTORE_GOVERNANCE_MISSING');
    const fingerprint = await calculateLocalKnowledgeSourceFingerprint(source);
    if (fingerprint !== governance.versionFingerprint) throw new Error('RESTORE_SOURCE_FINGERPRINT_MISMATCH');

    const sourceClaimsVerified = source.authorityStatus === 'LOCAL_VERIFIED'
      || source.lifecycleStatus === 'VERIFIED_LOCAL';
    const governanceClaimsVerified = governance.verificationStatus === 'verified';
    if (sourceClaimsVerified !== governanceClaimsVerified) throw new Error('RESTORE_VERIFICATION_STATE_INCONSISTENT');

    const backupPrincipalId = governance.validFor.userIds?.[0];
    const canPreserveVerification = governanceClaimsVerified
      && backupPrincipalId === currentPrincipalId
      && governance.provenance.verifiedBy === currentPrincipalId;

    if (canPreserveVerification) {
      preparedSources.push({ ...source });
      preparedGovernance.push({
        ...governance,
        validFor: { ...governance.validFor },
        provenance: { ...governance.provenance },
      });
      preservedVerificationCount += 1;
      continue;
    }

    const adjusted = downgradeForCurrentPrincipal(source, governance, currentPrincipalId);
    preparedSources.push(adjusted.source);
    preparedGovernance.push(adjusted.governance);
    needsVerificationCount += 1;
    if (backupPrincipalId !== currentPrincipalId) principalRebindCount += 1;
  }

  if (governanceByKey.size !== preparedGovernance.length) throw new Error('RESTORE_ORPHAN_GOVERNANCE_RECORD');

  return {
    manifest,
    recomputedContentHash,
    snapshotCreatedAt: snapshot.createdAt,
    currentSourceCount: currentSources.length,
    restoredSourceCount: preparedSources.length,
    preservedVerificationCount,
    needsVerificationCount,
    principalRebindCount,
    preparedSources,
    preparedGovernance,
  };
}

export async function applyLocalSourceRegistryRestore(
  preview: LocalSourceRegistryRestorePreview,
): Promise<LocalSourceRegistryRestoreResult> {
  const validation = validateRestoreRequest({
    manifest: preview.manifest,
    recomputedContentHash: preview.recomputedContentHash,
    humanConfirmed: true,
  });
  if (!validation.valid) throw new Error(`RESTORE_VALIDATION_FAILED:${validation.errors.join(',')}`);

  await replaceLocalKnowledgeRegistryFromRestore({
    sources: preview.preparedSources,
    governance: preview.preparedGovernance,
  });
  const sources = await listLocalKnowledgeSources();
  return {
    sources,
    restoredSourceCount: preview.restoredSourceCount,
    preservedVerificationCount: preview.preservedVerificationCount,
    needsVerificationCount: preview.needsVerificationCount,
  };
}
