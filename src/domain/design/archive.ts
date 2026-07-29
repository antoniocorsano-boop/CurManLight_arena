/**
 * CML-633H — Design Archive Repository
 *
 * Pure functions for managing DesignCurriculumSelection records.
 * All operations return new archives — no mutation.
 */

import type {
  DesignArchive,
  DesignCurriculumSelection,
  DesignArchiveOperationResult,
  DesignSelectionOperationResult,
} from './types';
import { createEmptyDesignArchive, cloneDesignArchive } from './constructors';
import {
  validateDesignCurriculumSelection,
  validateDesignArchiveIntegrity,
  validateInternalDesignReferences,
} from './validators';

export function createEmptyDesignStore(now = new Date().toISOString()): DesignArchive {
  return createEmptyDesignArchive(now);
}

export function addSelection(
  archive: DesignArchive,
  selection: DesignCurriculumSelection,
): DesignSelectionOperationResult {
  const v = validateDesignCurriculumSelection(selection);
  if (!v.valid) return { success: false, errors: v.errors };

  const updated = cloneDesignArchive(archive);
  updated.selections.push(selection);
  updated.updatedAt = new Date().toISOString();

  return { success: true, selection, archive: updated };
}

export function getSelection(
  archive: DesignArchive,
  id: string,
): DesignCurriculumSelection | undefined {
  return archive.selections.find(s => s.id === id);
}

export function listSelectionsForDesign(
  archive: DesignArchive,
  designId: string,
): DesignCurriculumSelection[] {
  return archive.selections.filter(s => s.designRef.id === designId);
}

export function replaceSelectionSnapshot(
  archive: DesignArchive,
  id: string,
  newSnapshot: string,
): DesignSelectionOperationResult {
  const sel = archive.selections.find(s => s.id === id);
  if (!sel) {
    return {
      success: false,
      errors: [{ code: 'SELECTION_NOT_FOUND', message: `Selection ${id} not found` }],
    };
  }

  const updated = cloneDesignArchive(archive);
  const target = updated.selections.find(s => s.id === id);
  if (!target) {
    return {
      success: false,
      errors: [{ code: 'SELECTION_NOT_FOUND', message: `Selection ${id} not found` }],
    };
  }

  target.selectedTextSnapshot = newSnapshot;
  target.metadata = { ...target.metadata, updatedAt: new Date().toISOString() };
  updated.updatedAt = new Date().toISOString();

  return { success: true, selection: target, archive: updated };
}

export function removeSelectionLogically(
  archive: DesignArchive,
  id: string,
): DesignArchiveOperationResult {
  const exists = archive.selections.find(s => s.id === id);
  if (!exists) {
    return {
      success: false,
      errors: [{ code: 'SELECTION_NOT_FOUND', message: `Selection ${id} not found` }],
    };
  }

  const updated: DesignArchive = {
    ...archive,
    selections: archive.selections.filter(s => s.id !== id),
    updatedAt: new Date().toISOString(),
  };

  return { success: true, archive: updated };
}

export function findSelectionBySource(
  archive: DesignArchive,
  sourceEntityRefId: string,
): DesignCurriculumSelection[] {
  return archive.selections.filter(s => s.sourceEntityRef.id === sourceEntityRefId);
}

export function verifyDesignIntegrity(archive: DesignArchive): boolean {
  const av = validateDesignArchiveIntegrity(archive);
  if (!av.valid) return false;
  const rv = validateInternalDesignReferences(archive);
  return rv.valid;
}

export function compareSelectionWithSource(
  selection: DesignCurriculumSelection,
  sourceCurrentText: string | undefined,
): 'source-current' | 'source-updated' | 'source-unavailable' | 'source-legacy' {
  if (selection.qualification === 'legacy-content') return 'source-legacy';
  if (sourceCurrentText === undefined) return 'source-unavailable';
  return sourceCurrentText === selection.currentTextSnapshot ? 'source-current' : 'source-updated';
}