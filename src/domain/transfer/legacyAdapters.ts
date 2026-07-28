import type { TransferWarning } from './types';
import { createTransferError } from './errors';
import type { TransferError } from './errors';

export type LegacyAdaptationResult<T> =
  | { ok: true; value: T; warnings: TransferWarning[] }
  | { ok: false; error: TransferError; warnings: TransferWarning[] };

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

export function isLegacyFormat(data: unknown): boolean {
  if (!isObject(data)) return false;
  const obj = data as Record<string, unknown>;
  if ('id' in obj && !('entityId' in obj)) return true;
  if ('nodeId' in obj && !('entityId' in obj)) return true;
  if ('nodes' in obj && Array.isArray(obj.nodes)) return true;
  if ('nodeRefs' in obj && !Array.isArray(obj.nodeRefs)) return false;
  if ('sources' in obj && !('origin' in obj)) return true;
  if ('sourceRefs' in obj) return true;
  return false;
}

function hasLegacyCurriculumFields(data: Record<string, unknown>): boolean {
  return ('id' in data || 'nodeId' in data) && ('name' in data || 'label' in data || 'type' in data || 'nodeType' in data);
}

function hasLegacyUdaFields(data: Record<string, unknown>): boolean {
  return ('nodes' in data && Array.isArray(data.nodes)) || ('sourceRefs' in data);
}

export function adaptLegacyCurriculumNode(node: unknown): LegacyAdaptationResult<{ entityId: string; entityType: string; text?: string; origin?: string }> {
  const warnings: TransferWarning[] = [];

  if (!isObject(node)) {
    return {
      ok: false,
      error: createTransferError('LEGACY_CONTENT_INCOMPLETE', { details: { reason: 'Expected object, got ' + typeof node } }),
      warnings,
    };
  }

  if (!hasLegacyCurriculumFields(node)) {
    return {
      ok: false,
      error: createTransferError('LEGACY_CONTENT_INCOMPLETE', { details: { reason: 'Missing required legacy curriculum fields (id/nodeId + name/label/type/nodeType)' } }),
      warnings,
    };
  }

  const entityId = (node.id ?? node.nodeId) as string;
  const entityType = (node.type ?? node.nodeType ?? 'curriculum-node') as string;
  const text = (node.name ?? node.label) as string | undefined;
  const origin = 'legacy' as const;

  if (!node.id && node.nodeId) {
    warnings.push({ code: 'LEGACY_FIELD_MAPPED', message: 'Mapped nodeId to entityId', field: 'id' });
  }
  if (!node.type && node.nodeType) {
    warnings.push({ code: 'LEGACY_FIELD_MAPPED', message: 'Mapped nodeType to entityType', field: 'type' });
  }
  if (!text) {
    warnings.push({ code: 'LEGACY_CONTENT_INCOMPLETE', message: 'Missing name/label field', field: 'name' });
  }
  if (!node.origin) {
    warnings.push({ code: 'LEGACY_CONTENT_INCOMPLETE', message: 'Origin field absent, defaulted to legacy', field: 'origin' });
  }

  return { ok: true, value: { entityId, entityType, text, origin }, warnings };
}

export function adaptLegacyUdaModel(uda: unknown): LegacyAdaptationResult<{ nodeRefs: Array<{ entityId: string; entityType: string }>; sources: string[]; origin: string }> {
  const warnings: TransferWarning[] = [];

  if (!isObject(uda)) {
    return {
      ok: false,
      error: createTransferError('LEGACY_CONTENT_INCOMPLETE', { details: { reason: 'Expected object, got ' + typeof uda } }),
      warnings,
    };
  }

  if (!hasLegacyUdaFields(uda)) {
    return {
      ok: false,
      error: createTransferError('LEGACY_CONTENT_INCOMPLETE', { details: { reason: 'Missing nodes array or sourceRefs' } }),
      warnings,
    };
  }

  const rawNodes: Array<Record<string, unknown>> = Array.isArray(uda.nodes)
    ? (uda.nodes as Array<Record<string, unknown>>)
    : [];

  const nodeRefs: Array<{ entityId: string; entityType: string }> = [];
  for (const n of rawNodes) {
    const entityId = (n.id ?? n.nodeId ?? '') as string;
    const entityType = (n.type ?? n.nodeType ?? 'curriculum-node') as string;
    if (!entityId) {
      warnings.push({ code: 'LEGACY_CONTENT_INCOMPLETE', message: 'Node missing id/nodeId, defaulted to empty string' });
    }
    nodeRefs.push({ entityId, entityType });
  }

  const sources: string[] = Array.isArray(uda.sourceRefs)
    ? (uda.sourceRefs as string[])
    : Array.isArray(uda.sources)
      ? (uda.sources as string[])
      : [];

  if (uda.sources && !Array.isArray(uda.sources)) {
    warnings.push({ code: 'LEGACY_FIELD_MAPPED', message: 'sources field was not an array, ignored' });
  }

  return { ok: true, value: { nodeRefs, sources, origin: 'legacy' }, warnings };
}

export function tryAdaptLegacyCurriculumNode(node: unknown): { entityId: string; entityType: string; text?: string; origin?: string } | null {
  const result = adaptLegacyCurriculumNode(node);
  return result.ok ? result.value : null;
}

export function tryAdaptLegacyUdaModel(uda: unknown): { nodeRefs: Array<{ entityId: string; entityType: string }>; sources: string[]; origin: string } | null {
  const result = adaptLegacyUdaModel(uda);
  return result.ok ? result.value : null;
}
