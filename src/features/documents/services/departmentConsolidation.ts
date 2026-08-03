import type { DecisionStatus } from '../../../types/curriculum';
import { requireCapability, type ProtectedActionResult, type ResolvedWorkspaceRole } from '../../../domain/permissions';

export type CmlImportPayload = {
  format: 'CML-LIGHT-EXPORT';
  decisions: Record<string, DecisionStatus>;
  customTexts: Record<string, string>;
};

export type ConsolidationPersistence = {
  setDecision: (id: string, status: DecisionStatus) => void;
  setCustomText: (id: string, text: string) => void;
};

export type ConsolidationInputError = {
  ok: false;
  reason: 'CML_IMPORT_INVALID';
  message: string;
};

const DECISION_STATUSES: readonly DecisionStatus[] = ['approved', 'custom', 'rejected'];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function parseCmlImport(raw: string): CmlImportPayload | ConsolidationInputError {
  try {
    const imported: unknown = JSON.parse(raw);
    if (!isRecord(imported) || imported.format !== 'CML-LIGHT-EXPORT' || !isRecord(imported.decisions) || !isRecord(imported.customTexts)) {
      return { ok: false, reason: 'CML_IMPORT_INVALID', message: 'Formato file non valido. Caricare un file .cml valido!' };
    }
    const decisions = imported.decisions;
    const customTexts = imported.customTexts;
    if (Object.values(decisions).some(value => !DECISION_STATUSES.includes(value as DecisionStatus)) || Object.values(customTexts).some(value => typeof value !== 'string')) {
      return { ok: false, reason: 'CML_IMPORT_INVALID', message: 'Struttura del file di lavoro non valida.' };
    }
    return { format: 'CML-LIGHT-EXPORT', decisions: decisions as Record<string, DecisionStatus>, customTexts: customTexts as Record<string, string> };
  } catch {
    return { ok: false, reason: 'CML_IMPORT_INVALID', message: 'Errore di decodifica del file di lavoro' };
  }
}

export function executeDepartmentConsolidation(
  resolution: ResolvedWorkspaceRole,
  payload: CmlImportPayload,
  persistence: ConsolidationPersistence,
): ProtectedActionResult<{ mergedDecisions: number; mergedCustomTexts: number }, ConsolidationInputError> {
  const guard = requireCapability(resolution, 'department.consolidate');
  if (!guard.ok) return guard;
  Object.entries(payload.decisions).forEach(([id, status]) => persistence.setDecision(id, status));
  Object.entries(payload.customTexts).forEach(([id, text]) => persistence.setCustomText(id, text));
  return { ok: true, value: { mergedDecisions: Object.keys(payload.decisions).length, mergedCustomTexts: Object.keys(payload.customTexts).length } };
}
