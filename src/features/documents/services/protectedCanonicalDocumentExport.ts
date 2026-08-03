import { requireCapability, type ProtectedActionResult, type ResolvedWorkspaceRole } from '../../../domain/permissions';
import type { ExportabilityResult, ExportError } from '../../../domain/documents/exportValidator';
import type { PrintResult } from './canonicalDocumentPrint';

export type CanonicalExportEffect =
  | { kind: 'print'; run: () => PrintResult }
  | { kind: 'download-json'; run: () => void };

export type CanonicalExportError =
  | { ok: false; reason: 'DOCUMENT_NOT_EXPORTABLE'; errors: ExportError[] }
  | { ok: false; reason: 'CANONICAL_EXPORT_FAILED'; message: string };

export type CanonicalExportResult = ProtectedActionResult<PrintResult | void, CanonicalExportError>;

export function executeCanonicalExport(
  resolution: ResolvedWorkspaceRole,
  effect: CanonicalExportEffect,
  validation?: ExportabilityResult,
): CanonicalExportResult {
  if (validation && !validation.exportable) {
    return {
      ok: false,
      reason: 'DOCUMENT_NOT_EXPORTABLE',
      errors: validation.blockingErrors,
    };
  }

  const permission = requireCapability(resolution, 'document.export');
  if (!permission.ok) return permission;

  try {
    const value = effect.run();
    if (effect.kind === 'print') {
      const printResult = value as PrintResult;
      if (!printResult.success) {
        return {
          ok: false,
          reason: 'CANONICAL_EXPORT_FAILED',
          message: printResult.message,
        };
      }
    }
    return { ok: true, value };
  } catch {
    return {
      ok: false,
      reason: 'CANONICAL_EXPORT_FAILED',
      message: "Impossibile completare l'esportazione del documento canonico.",
    };
  }
}