import {
  createCmlBackupArtifact,
  type BackupReceipt,
  type BackupSink,
  type CmlBackupArtifact,
} from '../../../domain/backup';
import type { SourceGovernanceRecord } from '../../../domain/curriculum/sources/governance';
import type { CustomKbDoc } from './localKnowledgeStore';
import {
  ensureLocalKnowledgeGovernanceRecords,
  listLocalKnowledgeSources,
} from './localKnowledgeStore';

export const LOCAL_SOURCE_REGISTRY_SNAPSHOT_SCHEMA = 'CML_LOCAL_SOURCE_REGISTRY_SNAPSHOT_V1' as const;
export const LOCAL_SOURCE_REGISTRY_SCHEMA_VERSION = 2;

export interface LocalSourceRegistrySnapshot {
  schema: typeof LOCAL_SOURCE_REGISTRY_SNAPSHOT_SCHEMA;
  createdAt: string;
  sources: readonly CustomKbDoc[];
  governance: readonly SourceGovernanceRecord[];
}

export interface CreateLocalSourceRegistryBackupOptions {
  now?: () => string;
  backupIdFactory?: () => string;
}

export interface LocalSourceRegistryBackupResult {
  artifact: CmlBackupArtifact;
  receipt: BackupReceipt;
}

function sortStringArray(values: readonly string[] | undefined): readonly string[] | undefined {
  return values ? [...values].sort((a, b) => a.localeCompare(b)) : undefined;
}

function canonicalizeGovernance(record: SourceGovernanceRecord): SourceGovernanceRecord {
  return {
    ...record,
    validFor: {
      ...record.validFor,
      userIds: sortStringArray(record.validFor.userIds),
      instituteIds: sortStringArray(record.validFor.instituteIds),
      schoolOrders: sortStringArray(record.validFor.schoolOrders),
      disciplines: sortStringArray(record.validFor.disciplines),
    },
    provenance: { ...record.provenance },
  };
}

function stableJsonValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stableJsonValue);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter(([, child]) => child !== undefined)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, child]) => [key, stableJsonValue(child)]),
  );
}

export function encodeLocalSourceRegistrySnapshot(snapshot: LocalSourceRegistrySnapshot): Uint8Array {
  const stable = stableJsonValue(snapshot);
  return new TextEncoder().encode(JSON.stringify(stable));
}

export async function createLocalSourceRegistryBackupArtifact(
  options: CreateLocalSourceRegistryBackupOptions = {},
): Promise<CmlBackupArtifact> {
  const createdAt = options.now?.() ?? new Date().toISOString();
  const backupId = options.backupIdFactory?.()
    ?? `source-registry:${globalThis.crypto?.randomUUID?.() ?? `${Date.now()}`}`;

  const sources = (await listLocalKnowledgeSources())
    .slice()
    .sort((left, right) => left.id.localeCompare(right.id) || left.sourceVersionId.localeCompare(right.sourceVersionId));
  const governance = (await ensureLocalKnowledgeGovernanceRecords(sources))
    .map(canonicalizeGovernance)
    .sort((left, right) => String(left.sourceId).localeCompare(String(right.sourceId))
      || String(left.sourceVersionId).localeCompare(String(right.sourceVersionId)));

  const snapshot: LocalSourceRegistrySnapshot = {
    schema: LOCAL_SOURCE_REGISTRY_SNAPSHOT_SCHEMA,
    createdAt,
    sources,
    governance,
  };
  const payload = encodeLocalSourceRegistrySnapshot(snapshot);
  const uniqueVersions = new Set(sources.map((source) => source.sourceVersionId));

  return createCmlBackupArtifact({
    backupId,
    createdAt,
    sourceRegistrySchemaVersion: LOCAL_SOURCE_REGISTRY_SCHEMA_VERSION,
    objectCounts: {
      sources: sources.length,
      sourceVersions: uniqueVersions.size,
      curriculumVersions: 0,
      revisions: 0,
      workspaces: 0,
      documents: sources.length,
    },
    payload,
  });
}

/**
 * Explicit one-shot backup orchestration. There is intentionally no timer,
 * watch, polling or inbound provider interaction.
 */
export async function backupLocalSourceRegistry(
  sink: BackupSink,
  options: CreateLocalSourceRegistryBackupOptions = {},
): Promise<LocalSourceRegistryBackupResult> {
  const artifact = await createLocalSourceRegistryBackupArtifact(options);
  const receipt = await sink.writeSnapshot(artifact.manifest, artifact.payload);
  return { artifact, receipt };
}
