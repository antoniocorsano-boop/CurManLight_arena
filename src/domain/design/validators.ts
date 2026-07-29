/**
 * CML-633H — Design Curriculum Selection Validators
 */

import { isValidEntityId } from '../curriculum/identity';
import type {
  DesignArchive,
  DesignTransferError,
} from './types';
import {
  VALID_DESIGN_QUALIFICATIONS,
} from './types';
import { DESIGN_ARCHIVE_SCHEMA_VERSION } from './vocabularies';

function error(code: string, message: string, field?: string): DesignTransferError {
  return { code, message, field };
}

export function validateDesignCurriculumSelection(
  selection: unknown,
): { valid: boolean; errors: DesignTransferError[] } {
  const errors: DesignTransferError[] = [];
  if (!selection || typeof selection !== 'object') {
    return { valid: false, errors: [error('INVALID_SELECTION', 'Selection must be an object')] };
  }
  const s = selection as Record<string, unknown>;
  if (typeof s.id !== 'string' || !isValidEntityId(s.id)) errors.push(error('INVALID_ID', 'Invalid selection ID', 'id'));
  if (!s.metadata || typeof s.metadata !== 'object') errors.push(error('MISSING_METADATA', 'Metadata required', 'metadata'));
  if (!s.sourceArea || !['A02', 'A03'].includes(s.sourceArea as string)) errors.push(error('INVALID_SOURCE_AREA', 'sourceArea must be A02 or A03', 'sourceArea'));
  if (!s.sourceEntityRef || typeof s.sourceEntityRef !== 'object') errors.push(error('MISSING_SOURCE_ENTITY', 'sourceEntityRef required', 'sourceEntityRef'));
  if (!VALID_DESIGN_QUALIFICATIONS.includes(s.qualification as never)) errors.push(error('INVALID_QUALIFICATION', `Invalid qualification: ${String(s.qualification)}`, 'qualification'));
  if (typeof s.currentTextSnapshot !== 'string') errors.push(error('MISSING_CURRENT_SNAPSHOT', 'currentTextSnapshot required', 'currentTextSnapshot'));
  if (typeof s.selectedTextSnapshot !== 'string') errors.push(error('MISSING_SELECTED_SNAPSHOT', 'selectedTextSnapshot required', 'selectedTextSnapshot'));
  if (!s.designRef || typeof s.designRef !== 'object') errors.push(error('MISSING_DESIGN_REF', 'designRef required', 'designRef'));
  return errors.length > 0 ? { valid: false, errors } : { valid: true, errors: [] };
}

export function validateDesignArchiveIntegrity(
  archive: unknown,
): { valid: boolean; errors: DesignTransferError[] } {
  const errors: DesignTransferError[] = [];
  if (!archive || typeof archive !== 'object') {
    return { valid: false, errors: [error('INVALID_ARCHIVE', 'Archive must be an object')] };
  }
  const a = archive as Record<string, unknown>;
  if (a.schemaVersion !== DESIGN_ARCHIVE_SCHEMA_VERSION) {
    return { valid: false, errors: [error('UNSUPPORTED_SCHEMA', `Schema version ${String(a.schemaVersion)} not supported`)] };
  }
  if (!Array.isArray(a.selections)) {
    return { valid: false, errors: [error('MISSING_SELECTIONS', 'Archive must have selections array')] };
  }
  const selIds = new Set<string>();
  for (const s of a.selections) {
    if (typeof (s as Record<string, unknown>).id === 'string') {
      const sid = (s as Record<string, unknown>).id as string;
      if (selIds.has(sid)) errors.push(error('DUPLICATE_SELECTION', `Duplicate selection ID: ${sid}`));
      selIds.add(sid);
    }
  }
  return errors.length > 0 ? { valid: false, errors } : { valid: true, errors: [] };
}

export function validateInternalDesignReferences(
  archive: DesignArchive,
): { valid: boolean; errors: DesignTransferError[] } {
  const errors: DesignTransferError[] = [];
  for (const s of archive.selections) {
    if (!s.designRef || typeof s.designRef.id !== 'string') {
      errors.push(error('MISSING_DESIGN_REF', `Selection ${s.id} missing designRef`, 'designRef'));
    }
    if (!s.sourceEntityRef || typeof s.sourceEntityRef.id !== 'string') {
      errors.push(error('MISSING_SOURCE_REF', `Selection ${s.id} missing sourceEntityRef`, 'sourceEntityRef'));
    }
  }

  return errors.length > 0 ? { valid: false, errors } : { valid: true, errors: [] };
}