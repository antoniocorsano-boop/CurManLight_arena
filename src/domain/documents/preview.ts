import type {
  DocumentContent,
  DocumentEntity,
  DocumentVersion,
  InstitutionalSnapshot,
} from './types';

function hashFnv1aHex(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(canonicalJson).join(',')}]`;
  }
  if (value && typeof value === 'object') {
    return `{${Object.entries(value as Record<string, unknown>)
      .filter(([, v]) => v !== undefined)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${JSON.stringify(k)}:${canonicalJson(v)}`)
      .join(',')}}`;
  }
  return JSON.stringify(value);
}

export interface PreviewIdentity {
  documentId: string;
  versionId: string;
  templateId: string;
  contentFingerprint: string;
  metadataFingerprint: string;
}

export interface PreviewState {
  key: string;
  html: string;
  renderedAt: string;
  versionNumber: number;
}

export interface TeachingDesignMetadata {
  discipline?: string;
  order?: string;
  class?: string;
  period?: string;
  hours?: number;
}

export function computeContentFingerprint(content: DocumentContent): string {
  return hashFnv1aHex(canonicalJson(content));
}

export function computeMetadataFingerprint(
  document: DocumentEntity,
  version: DocumentVersion,
): string {
  const relevant = {
    documentId: document.id,
    title: document.title,
    documentType: document.documentType,
    status: document.status,
    origin: document.metadata.origin,
    versionId: version.id,
    versionNumber: version.versionNumber,
    createdAt: version.createdAt,
    author: version.author
      ? { displayName: version.author.displayName, role: version.author.role }
      : undefined,
    instituteName: version.institutionalSnapshot.instituteName,
    academicYearLabel: version.institutionalSnapshot.academicYearLabel,
    declaredRole: version.institutionalSnapshot.declaredRole,
    siteName: version.institutionalSnapshot.siteName,
    mechanicalCode: version.institutionalSnapshot.mechanicalCode,
  };
  return hashFnv1aHex(canonicalJson(relevant));
}

export function computeTemplateId(
  document: DocumentEntity,
  version: DocumentVersion,
): string {
  const snapshot: InstitutionalSnapshot = version.institutionalSnapshot;
  return hashFnv1aHex(
    canonicalJson({
      documentType: document.documentType,
      instituteName: snapshot.instituteName,
      academicYearLabel: snapshot.academicYearLabel,
      declaredRole: snapshot.declaredRole,
      configured: snapshot.configured,
    }),
  );
}

export function computePreviewKey(
  document: DocumentEntity,
  version: DocumentVersion,
): PreviewIdentity {
  return {
    documentId: document.id,
    versionId: version.id,
    templateId: computeTemplateId(document, version),
    contentFingerprint: computeContentFingerprint(version.content),
    metadataFingerprint: computeMetadataFingerprint(document, version),
  };
}

export function serializePreviewKey(identity: PreviewIdentity): string {
  return [
    identity.documentId,
    identity.versionId,
    identity.templateId,
    identity.contentFingerprint,
    identity.metadataFingerprint,
  ].join('|');
}

export function isPreviewStale(
  state: PreviewState | null | undefined,
  document: DocumentEntity,
  version: DocumentVersion,
): boolean {
  if (!state) return true;
  return state.key !== serializePreviewKey(computePreviewKey(document, version));
}

export function extractTeachingDesignMetadata(
  content: DocumentContent,
): TeachingDesignMetadata {
  for (const section of content.sections) {
    if (section.type === 'teaching-design') {
      const snapshot = section.snapshot as Record<string, unknown>;
      return {
        discipline: typeof snapshot.discipline === 'string' ? (snapshot.discipline as string) : undefined,
        order: typeof snapshot.order === 'string' ? (snapshot.order as string) : undefined,
        class: typeof snapshot.class === 'string' ? (snapshot.class as string) : undefined,
        period: typeof snapshot.period === 'string' ? (snapshot.period as string) : undefined,
        hours: typeof snapshot.hours === 'number' ? (snapshot.hours as number) : undefined,
      };
    }
  }
  return {};
}

export function getAuthorDisplay(version: DocumentVersion): string | undefined {
  const author = version.author;
  if (!author || !author.displayName) return undefined;
  return author.displayName;
}

export function getRoleDisplay(version: DocumentVersion): string | undefined {
  const author = version.author;
  if (!author || !author.role) return undefined;
  return author.role;
}
