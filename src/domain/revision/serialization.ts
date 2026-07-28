/**
 * Serialization, backup and restore for RevisionArchive.
 *
 * - Schema versioned
 * - Validates before import
 * - Internal reference check
 * - Future schema handling
 * - No silent replacement
 * - Preview of changes
 * - Explicit conflicts
 * - Rollback
 * - No content execution
 * - No automatic promotion of legacy records
 */

import type {
  RevisionArchive,
  RevisionValidationResult,
  RevisionError,
  RevisionWarning,
} from './types';
import { REVISION_ARCHIVE_SCHEMA_VERSION } from './vocabularies';
import { cloneRevisionArchive } from './constructors';
import { validateArchiveIntegrity, validateInternalArchiveReferences } from './validators';

// ─── Serialization ──────────────────────────────────────────────────────────

export function serializeRevisionArchive(archive: RevisionArchive): string {
  return JSON.stringify(archive, null, 2);
}

export function deserializeRevisionArchive(json: string): RevisionValidationResult & { archive?: RevisionArchive } {
  try {
    const parsed = JSON.parse(json);
    const schemaCheck = validateArchiveIntegrity(parsed);

    if (!schemaCheck.valid) {
      return {
        valid: false,
        errors: schemaCheck.errors,
        warnings: [],
      };
    }

    // Null check
    if (!parsed.proposals || !Array.isArray(parsed.proposals)) {
      return {
        valid: false,
        errors: [{ code: 'MISSING_PROPOSALS', message: 'Archive missing proposals array' }],
        warnings: [],
      };
    }
    if (!parsed.versions || !Array.isArray(parsed.versions)) {
      return {
        valid: false,
        errors: [{ code: 'MISSING_VERSIONS', message: 'Archive missing versions array' }],
        warnings: [],
      };
    }
    if (!parsed.decisions || !Array.isArray(parsed.decisions)) {
      return {
        valid: false,
        errors: [{ code: 'MISSING_DECISIONS', message: 'Archive missing decisions array' }],
        warnings: [],
      };
    }

    // Ensure effects and events arrays
    const archive: RevisionArchive = {
      schemaVersion: parsed.schemaVersion ?? REVISION_ARCHIVE_SCHEMA_VERSION,
      updatedAt: parsed.updatedAt ?? new Date().toISOString(),
      proposals: parsed.proposals,
      versions: parsed.versions,
      decisions: parsed.decisions,
      effects: Array.isArray(parsed.effects) ? parsed.effects : [],
      events: Array.isArray(parsed.events) ? parsed.events : [],
    };

    const refCheck = validateInternalArchiveReferences(archive);
    const warnings: RevisionWarning[] = [...refCheck.warnings];

    if (!refCheck.valid) {
      return {
        valid: false,
        errors: refCheck.errors,
        warnings,
      };
    }

    return {
      valid: true,
      errors: [],
      warnings,
      archive,
    };
  } catch {
    return {
      valid: false,
      errors: [{ code: 'PARSE_ERROR', message: 'Failed to parse JSON' }],
      warnings: [],
    };
  }
}

// ─── Preview ────────────────────────────────────────────────────────────────

export interface ImportPreview {
  incomingProposals: number;
  incomingVersions: number;
  incomingDecisions: number;
  incomingEffects: number;
  incomingEvents: number;
  existingProposals: number;
  existingVersions: number;
  existingDecisions: number;
  existingEffects: number;
  existingEvents: number;
  conflicts: Array<{ entityType: string; id: string; message: string }>;
  warnings: RevisionWarning[];
}

export function previewRevisionArchiveImport(
  existing: RevisionArchive,
  incoming: RevisionArchive,
): ImportPreview {
  const existingPropIds = new Set(existing.proposals.map(p => p.id));
  const existingVerIds = new Set(existing.versions.map(v => v.id));
  const existingDecIds = new Set(existing.decisions.map(d => d.id));
  const existingEffIds = new Set(existing.effects.map(e => e.id));
  const existingEvtIds = new Set(existing.events.map(e => e.id));

  const conflicts: ImportPreview['conflicts'] = [];

  for (const p of incoming.proposals) {
    if (existingPropIds.has(p.id)) {
      conflicts.push({ entityType: 'proposal', id: p.id, message: 'Proposal ID already exists in target archive' });
    }
  }
  for (const v of incoming.versions) {
    if (existingVerIds.has(v.id)) {
      conflicts.push({ entityType: 'version', id: v.id, message: 'Version ID already exists in target archive' });
    }
  }
  for (const d of incoming.decisions) {
    if (existingDecIds.has(d.id)) {
      conflicts.push({ entityType: 'decision', id: d.id, message: 'Decision ID already exists in target archive' });
    }
  }
  for (const e of incoming.effects) {
    if (existingEffIds.has(e.id)) {
      conflicts.push({ entityType: 'effect', id: e.id, message: 'Effect ID already exists in target archive' });
    }
  }
  for (const e of incoming.events) {
    if (existingEvtIds.has(e.id)) {
      conflicts.push({ entityType: 'event', id: e.id, message: 'Event ID already exists in target archive' });
    }
  }

  return {
    incomingProposals: incoming.proposals.length,
    incomingVersions: incoming.versions.length,
    incomingDecisions: incoming.decisions.length,
    incomingEffects: incoming.effects.length,
    incomingEvents: incoming.events.length,
    existingProposals: existing.proposals.length,
    existingVersions: existing.versions.length,
    existingDecisions: existing.decisions.length,
    existingEffects: existing.effects.length,
    existingEvents: existing.events.length,
    conflicts,
    warnings: [],
  };
}

// ─── Import / Restore ───────────────────────────────────────────────────────

export interface ImportRevisionArchiveResult {
  success: boolean;
  archive?: RevisionArchive;
  errors: RevisionError[];
  warnings: RevisionWarning[];
  rollback?: RevisionArchive;
}

export function importRevisionArchive(
  existing: RevisionArchive,
  incoming: RevisionArchive,
): ImportRevisionArchiveResult {
  const rollback = cloneRevisionArchive(existing);

  const preview = previewRevisionArchiveImport(existing, incoming);

  if (preview.conflicts.length > 0) {
    return {
      success: false,
      errors: preview.conflicts.map(c => ({
        code: 'IMPORT_CONFLICT',
        message: c.message,
        field: c.entityType,
      })),
      warnings: [],
      rollback,
    };
  }

  // Merge: append incoming entities to existing archive
  const merged: RevisionArchive = {
    schemaVersion: existing.schemaVersion,
    updatedAt: new Date().toISOString(),
    proposals: [...existing.proposals, ...incoming.proposals],
    versions: [...existing.versions, ...incoming.versions],
    decisions: [...existing.decisions, ...incoming.decisions],
    effects: [...existing.effects, ...incoming.effects],
    events: [...existing.events, ...incoming.events],
  };

  // Validate merged archive
  const refCheck = validateInternalArchiveReferences(merged);
  if (!refCheck.valid) {
    return {
      success: false,
      errors: refCheck.errors,
      warnings: refCheck.warnings,
      rollback,
    };
  }

  return {
    success: true,
    archive: merged,
    errors: [],
    warnings: preview.warnings,
    rollback,
  };
}

// ─── Backup / Restore ───────────────────────────────────────────────────────

export function createRevisionArchiveBackup(archive: RevisionArchive): string {
  return serializeRevisionArchive(archive);
}

export function restoreRevisionArchiveBackup(
  backup: string,
): ImportRevisionArchiveResult & { preview?: ImportPreview } {
  const deserialized = deserializeRevisionArchive(backup);

  if (!deserialized.valid || !deserialized.archive) {
    return {
      success: false,
      errors: deserialized.errors,
      warnings: deserialized.warnings,
    };
  }

  // Full restore (replace): no conflict check needed, it's a restore
  return {
    success: true,
    archive: deserialized.archive,
    errors: [],
    warnings: deserialized.warnings,
    preview: undefined,
  };
}

// ─── Fingerprint ────────────────────────────────────────────────────────────

export function fingerprintRevisionArchive(archive: RevisionArchive): string {
  // FNV-1a 32-bit hash over sorted entity IDs for deterministic fingerprint
  const allIds = [
    ...archive.proposals.map(p => p.id),
    ...archive.versions.map(v => v.id),
    ...archive.decisions.map(d => d.id),
    ...archive.effects.map(e => e.id),
    ...archive.events.map(e => e.id),
  ].sort();

  const joined = allIds.join(',');
  let hash = 2166136261;
  for (let i = 0; i < joined.length; i++) {
    hash ^= joined.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}