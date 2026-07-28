import type { DocumentArchive } from './types';
import { DOCUMENT_ARCHIVE_SCHEMA_VERSION } from './vocabularies';
import { validateArchiveIntegrity } from './validators';
import { cloneDocumentArchive } from './constructors';

export interface DeserializationResult {
  success: boolean;
  archive?: DocumentArchive;
  errors: string[];
}

export function serializeDocumentArchive(
  archive: DocumentArchive,
): string {
  const checked = validateArchiveIntegrity(archive);
  if (!checked.valid) {
    throw new Error(
      `Document archive not valid: ${checked.errors.map(e => `${e.code}: ${e.message}`).join('; ')}`,
    );
  }
  return JSON.stringify({
    schemaVersion: DOCUMENT_ARCHIVE_SCHEMA_VERSION,
    archive: cloneDocumentArchive(archive),
  });
}

export function deserializeDocumentArchive(json: string): DeserializationResult {
  try {
    const parsed: unknown = JSON.parse(json);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return { success: false, errors: ['Invalid JSON envelope'] };
    }

    const envelope = parsed as Record<string, unknown>;

    if (envelope.schemaVersion !== DOCUMENT_ARCHIVE_SCHEMA_VERSION) {
      return {
        success: false,
        errors: [`Schema version ${String(envelope.schemaVersion)} not supported`],
      };
    }

    const archive = envelope.archive as DocumentArchive | undefined;
    if (!archive || typeof archive !== 'object') {
      return { success: false, errors: ['Archive missing in envelope'] };
    }

    const checked = validateArchiveIntegrity(archive);
    if (!checked.valid) {
      return {
        success: false,
        errors: checked.errors.map(e => `${e.code}: ${e.message}`),
      };
    }

    return { success: true, archive: cloneDocumentArchive(archive), errors: [] };
  } catch (cause) {
    return {
      success: false,
      errors: [cause instanceof Error ? cause.message : 'Unknown deserialization error'],
    };
  }
}

export function fingerprintDocumentArchive(archive: DocumentArchive): string {
  const input = canonicalJson(archive);
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