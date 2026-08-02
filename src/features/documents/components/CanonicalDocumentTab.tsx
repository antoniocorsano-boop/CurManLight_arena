import { useEffect, useState } from 'react';
import { Printer } from 'lucide-react';
import { useCurriculumStore } from '../../../store/useCurriculumStore';
import {
  getDocumentList,
  archiveDocument,
  duplicateDocument,
  serializeDocumentArchive,
  renderDocument,
  getDocumentHistory,
  validateExportability,
  computePreviewKey,
  serializePreviewKey,
  isPreviewStale,
  DOCUMENT_TYPE_LABELS,
  DOCUMENT_STATUS_LABELS,
} from '../../../domain/documents';
import type {
  DocumentEntity,
  PreviewState,
  ExportabilityResult,
} from '../../../domain/documents';
import { printCanonicalDocument } from '../services/canonicalDocumentPrint';

export interface CanonicalDocumentTabProps {
  selectedDocumentId?: string | null;
  onSelectionChange?: (id: string | null) => void;
}

const PREVIEW_CSS = `
article { font-family: 'Segoe UI', Arial, sans-serif; max-width: 800px; margin: 0 auto; }
header { text-align: center; border-bottom: 2px solid #1e3a8a; padding-bottom: 12px; margin-bottom: 20px; }
.institute-name { font-size: 14pt; font-weight: bold; color: #1e3a8a; margin: 0; }
.mechanical-code, .site-name, .academic-year { font-size: 8pt; color: #64748b; margin: 2px 0; }
h1 { color: #1e3a8a; text-align: center; font-size: 14pt; margin: 20px 0; }
.doc-version-info { border-top: 1pt solid #cbd5e1; margin-top: 20px; padding-top: 10px; font-size: 8pt; color: #64748b; }
.doc-version, .doc-date, .doc-author { margin: 2px 0; }
.doc-provenance { margin-top: 15px; border-top: 1pt solid #cbd5e1; padding-top: 8px; }
.provenance-label { font-size: 8pt; color: #64748b; margin: 0; }
.provenance-list { font-size: 8pt; color: #475569; margin: 2px 0 0 0; }
`;

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('it-IT', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  } catch {
    return iso;
  }
}

export function CanonicalDocumentTab({ selectedDocumentId, onSelectionChange }: CanonicalDocumentTabProps) {
  const { documentArchive, replaceDocumentArchive } = useCurriculumStore();
  const [selectedId, setSelectedId] = useState<string | null>(selectedDocumentId ?? null);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const [previewState, setPreviewState] = useState<PreviewState | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const docs = getDocumentList(documentArchive);
  const activeDocs = docs.filter(d => d.status !== 'archived');
  const archivedDocs = docs.filter(d => d.status === 'archived');

  function showMessage(msg: string) {
    setMessage(msg);
    setTimeout(() => setMessage(null), 5000);
  }

  useEffect(() => {
    if (selectedDocumentId !== undefined) {
      setSelectedId(selectedDocumentId ?? null);
    }
  }, [selectedDocumentId]);

  useEffect(() => {
    if (!selectedId) {
      setSelectedVersionId(null);
      setPreviewState(null);
    }
  }, [selectedId]);

  const selectedDoc = selectedId ? docs.find(d => d.id === selectedId) : null;
  const effectiveVersionId = selectedVersionId ?? selectedDoc?.currentVersionRef ?? null;
  const selectedVersionObj = effectiveVersionId
    ? (documentArchive.versions.find(v => v.id === effectiveVersionId) ?? null)
    : null;
  const isArchived = selectedDoc?.status === 'archived';
  const isCurrentVersion = selectedVersionObj && selectedDoc?.currentVersionRef === selectedVersionObj.id;
  const previewStale = selectedDoc && selectedVersionObj
    ? isPreviewStale(previewState, selectedDoc, selectedVersionObj)
    : false;

  const exportability: ExportabilityResult | null =
    selectedDoc && selectedVersionObj
      ? validateExportability({
          archive: documentArchive,
          document: selectedDoc,
          version: selectedVersionObj,
          selectedVersionId: effectiveVersionId,
          previewState,
        })
      : null;

  function handleGeneratePreview() {
    if (!selectedDoc || !selectedVersionObj) return;
    const key = serializePreviewKey(computePreviewKey(selectedDoc, selectedVersionObj));
    const html = renderDocument(selectedDoc, selectedVersionObj, { css: PREVIEW_CSS });
    setPreviewState({
      key,
      html,
      renderedAt: new Date().toISOString(),
      versionNumber: selectedVersionObj.versionNumber,
    });
  }

  function handlePrint() {
    if (!selectedDoc || !selectedVersionObj || !previewState) return;

    const printExportability = validateExportability({
      archive: documentArchive,
      document: selectedDoc,
      version: selectedVersionObj,
      selectedVersionId: effectiveVersionId,
      previewState,
    });

    if (!printExportability.exportable) {
      const blockingMessages = printExportability.blockingErrors.map(e => e.message).join('; ') ?? 'Validazione non superata.';
      showMessage(blockingMessages);
      return;
    }

    if (isArchived) {
      showMessage("Il documento è archiviato. Puoi consultarlo, ma non esportarlo. Seleziona o crea una versione attiva.");
      return;
    }

    const printResult = printCanonicalDocument(previewState.html, {
      title: selectedDoc.title,
    });
    showMessage(printResult.success ? printResult.message : printResult.message);
  }

  function handleDownloadJson() {
    const blob = new Blob([serializeDocumentArchive(documentArchive)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'archivio-documenti-canonico.json';
    a.click();
    URL.revokeObjectURL(url);
    showMessage('Archivio documenti esportato in formato JSON.');
  }

  function handleArchive(doc: DocumentEntity) {
    const result = archiveDocument(documentArchive, doc.id);
    if (result.success) {
      replaceDocumentArchive(result.archive);
      if (selectedId === doc.id) setSelectedId(null);
      showMessage('Documento archiviato');
    }
  }

  function handleDuplicate(doc: DocumentEntity) {
    const result = duplicateDocument(documentArchive, doc.id);
    if (result.success) {
      replaceDocumentArchive(result.archive);
      showMessage('Documento duplicato');
    }
  }

  function handleVersionChange(versionId: string) {
    setSelectedVersionId(versionId);
  }

  function handleSelect(doc: DocumentEntity) {
    const nextId = selectedId === doc.id ? null : doc.id;
    setSelectedId(nextId);
    setSelectedVersionId(null);
    setPreviewState(null);
    onSelectionChange?.(nextId);
  }

  function renderExpandedCard(doc: DocumentEntity, archived: boolean) {
    const docVersions = getDocumentHistory(documentArchive, doc.id);
    const versionId = doc === selectedDoc ? effectiveVersionId : (doc.currentVersionRef);
    const version = versionId
      ? (documentArchive.versions.find(v => v.id === versionId) ?? null)
      : null;

    return (
      <div
        key={doc.id}
        className={`border rounded-ui-control ${
          archived ? 'border-amber-300 bg-amber-50/30' : 'border-ui-border'
        }`}
      >
        <button
          onClick={() => handleSelect(doc)}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-ui-surface-hover transition text-left"
        >
          <div className="flex-1 min-w-0">
            <div className="font-medium text-ui-text truncate">{doc.title}</div>
            <div className="flex gap-2 mt-1 text-xs text-ui-text-secondary">
              <span>{DOCUMENT_TYPE_LABELS[doc.documentType] ?? doc.documentType}</span>
              <span>·</span>
              <span>{DOCUMENT_STATUS_LABELS[doc.status] ?? doc.status}</span>
              {archived && (
                <>
                  <span>·</span>
                  <span className="text-amber-700 font-medium">Archiviato</span>
                </>
              )}
              {version && (
                <>
                  <span>·</span>
                  <span>v{version.versionNumber}</span>
                </>
              )}
            </div>
          </div>
          <svg
            className={`w-4 h-4 text-ui-text-secondary transition-transform ${
              selectedId === doc.id ? 'rotate-180' : ''
            }`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {selectedId === doc.id && selectedVersionObj && (
          <div className="px-4 pb-3 pt-1 border-t border-ui-border space-y-3">
            {archived && (
              <div className="rounded-ui-control border border-amber-200 bg-amber-50 px-3 py-2 text-[13px] text-amber-900">
                Il documento è archiviato. Puoi consultarlo, ma non esportarlo. Seleziona o crea una versione attiva.
              </div>
            )}

            <div className="text-sm text-ui-text-secondary space-y-1">
              <p><strong>Origine:</strong> {doc.metadata.origin}</p>
              <p><strong>Versione corrente:</strong> {selectedVersionObj.versionNumber}</p>
              <p><strong>Creato:</strong> {formatDate(selectedVersionObj.createdAt)}</p>
              {selectedVersionObj.reason && <p><strong>Motivo:</strong> {selectedVersionObj.reason}</p>}
              <p><strong>Istituto:</strong> {selectedVersionObj.institutionalSnapshot.instituteName}</p>
              <p><strong>Tipo modello:</strong> {DOCUMENT_TYPE_LABELS[doc.documentType] ?? doc.documentType}</p>
              {doc.sourceRefs.length > 0 && (
                <p><strong>Provenienza (UDA):</strong> {doc.sourceRefs.map(r => r.snapshotLabel ?? r.id).join(', ')}</p>
              )}
              {selectedVersionObj.author?.displayName && (
                <p><strong>Autore:</strong> {selectedVersionObj.author.displayName}
                  {selectedVersionObj.author.role && ` (${selectedVersionObj.author.role})`}</p>
              )}
              {!isCurrentVersion && (
                <p className="text-xs text-ui-text-muted">Questa non è la versione corrente.</p>
              )}
            </div>

            {docVersions.length > 1 && (
              <div className="flex items-end gap-2">
                <label htmlFor={`version-select-${doc.id}`} className="text-xs font-semibold text-ui-text-muted">Versione</label>
                <select
                  id={`version-select-${doc.id}`}
                  aria-label="Seleziona versione del documento"
                  value={effectiveVersionId ?? ''}
                  onChange={(e) => handleVersionChange(e.target.value)}
                  className="text-xs border border-ui-border rounded-ui-control px-2 py-1 bg-ui-surface text-ui-text focus:outline-none focus:ring-1 focus:ring-ui-focus"
                >
                  {docVersions.map(v => (
                    <option key={v.id} value={v.id}>
                      v{v.versionNumber} · {formatDate(v.createdAt)} {v.id === doc.currentVersionRef ? '(corrente)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                onClick={handleGeneratePreview}
                disabled={!selectedVersionObj}
                className="px-3 py-1.5 text-xs font-medium bg-ui-action text-white rounded-ui-control hover:bg-ui-action-hover transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {previewState && !previewStale ? 'Anteprima pronta' : previewState ? 'Aggiorna anteprima' : 'Genera anteprima'}
              </button>
              {previewState && previewStale && (
                <span className="text-xs text-amber-600 font-medium">
                  L'anteprima non è più aggiornata.
                </span>
              )}
            </div>

            {previewState && previewStale && (
              <div className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-3 py-2 rounded-ui-control">
                L'anteprima non è più aggiornata. Generala nuovamente prima di stampare.
              </div>
            )}

            {exportability && !exportability.exportable && exportability.blockingErrors.length > 0 && !isArchived && (
              <div
                className="rounded-ui-control border border-rose-200 bg-rose-50 px-3 py-2 text-[13px] text-rose-900"
                aria-live="polite"
                role="alert"
              >
                <strong className="block text-xs font-semibold mb-1">Dati mancanti o blocchi per l'esportazione:</strong>
                <ul className="list-disc list-inside space-y-0.5">
                  {exportability.blockingErrors.map((e) => (
                    <li key={e.code} className="ml-4" id={`export-error-${e.code}`}>
                      {e.message}
                      {e.field && <span className="text-rose-600"> (campo: {e.field})</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {previewState && !previewStale && !isArchived && (
              <div className="border border-ui-border rounded-ui-control overflow-hidden bg-white">
                <iframe
                  title={`Anteprima documento ${doc.title}`}
                  srcDoc={previewState.html}
                  className="w-full h-64 border-0"
                  sandbox="allow-scripts"
                />
              </div>
            )}

            {isArchived && previewState && !previewStale && (
              <div className="border border-ui-border rounded-ui-control overflow-hidden bg-white">
                <iframe
                  title={`Anteprima documento archiviato ${doc.title}`}
                  srcDoc={previewState.html}
                  className="w-full h-64 border-0"
                  sandbox="allow-scripts"
                />
              </div>
            )}

            {!exportability?.exportable && (exportability?.blockingErrors.length ?? 0) > 0 && !isArchived && (
              <p className="text-xs text-rose-700">
                Correggi gli errori prima di stampare.
              </p>
            )}

            {exportability?.exportable && !isArchived && (
              <div
                className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-ui-control"
                aria-live="polite"
              >
                Pronto per l'esportazione. Genera l'anteprima e stampa.
              </div>
            )}

            <div className="flex flex-wrap gap-2">
               <button
                onClick={handlePrint}
                disabled={!exportability?.exportable || isArchived}
                className="px-3 py-1.5 text-xs font-medium bg-ui-action text-white rounded-ui-control hover:bg-ui-action-hover transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <Printer className="w-3.5 h-3.5" aria-hidden="true" />
                Stampa o salva in PDF
              </button>

              <button
                onClick={handleDownloadJson}
                className="px-3 py-1.5 text-xs font-medium bg-ui-surface border border-ui-border rounded-ui-control hover:bg-ui-surface-hover transition"
              >
                Archivio JSON
              </button>

              {!isArchived && (
                <>
                  <button
                    onClick={() => handleDuplicate(doc)}
                    className="px-3 py-1.5 text-xs font-medium bg-ui-surface border border-ui-border rounded-ui-control hover:bg-ui-surface-hover transition"
                  >
                    Duplica
                  </button>
                  <button
                    onClick={() => handleArchive(doc)}
                    className="px-3 py-1.5 text-xs font-medium bg-red-50 border border-red-200 text-red-700 rounded-ui-control hover:bg-red-100 transition"
                  >
                    Archivia
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {message && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-2 rounded text-sm">
          {message}
        </div>
      )}

      {docs.length === 0 ? (
        <div className="text-ui-text-secondary text-sm py-8 text-center">
          Nessun documento canonico ancora presente.
        </div>
      ) : (
        <div className="space-y-2">
          {activeDocs.length > 0 && (
            <div>
              <h3 className="text-[11px] font-semibold text-ui-text-muted uppercase tracking-wider mb-1">
                Documenti attivi
              </h3>
              {activeDocs.map(doc => renderExpandedCard(doc, false))}
            </div>
          )}
          {archivedDocs.length > 0 && (
            <div>
              <h3 className="text-[11px] font-semibold text-ui-text-muted uppercase tracking-wider mb-1">
                Documenti archiviati
              </h3>
              {archivedDocs.map(doc => renderExpandedCard(doc, true))}
            </div>
          )}
        </div>
      )}

      <div className="text-xs text-ui-text-secondary border-t border-ui-border pt-3 mt-4">
        <p>Totale documenti: {docs.length} · Formati: anteprima HTML, stampa/PDF via browser</p>
      </div>
    </div>
  );
}
