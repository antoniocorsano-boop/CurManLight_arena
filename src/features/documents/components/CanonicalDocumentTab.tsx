import { useEffect, useState } from 'react';
import { useCurriculumStore } from '../../../store/useCurriculumStore';
import { getDocumentList, getCurrentVersionForDocument, archiveDocument, duplicateDocument, renderDocument, serializeDocumentArchive } from '../../../domain/documents';
import type { DocumentEntity, ExportFormat } from '../../../domain/documents';
import { DOCUMENT_TYPE_LABELS, DOCUMENT_STATUS_LABELS } from '../../../domain/documents';

export interface CanonicalDocumentTabProps {
  selectedDocumentId?: string | null;
  onSelectionChange?: (id: string | null) => void;
}

export function CanonicalDocumentTab({ selectedDocumentId, onSelectionChange }: CanonicalDocumentTabProps) {
  const { documentArchive, replaceDocumentArchive } = useCurriculumStore();
  const [selectedId, setSelectedId] = useState<string | null>(selectedDocumentId ?? null);
  const [message, setMessage] = useState<string | null>(null);

  const docs = getDocumentList(documentArchive);

  function showMessage(msg: string) {
    setMessage(msg);
    setTimeout(() => setMessage(null), 3000);
  }

  function handleExport(doc: DocumentEntity, format: ExportFormat) {
    const version = getCurrentVersionForDocument(documentArchive, doc);
    if (!version) return;

    let content: string;
    let ext: string;
    let mime: string;

    if (format === 'html') {
      content = renderDocument(doc, version);
      ext = '.html';
      mime = 'text/html';
    } else if (format === 'json') {
      content = serializeDocumentArchive(documentArchive);
      ext = '.json';
      mime = 'application/json';
    } else {
      content = renderDocument(doc, version);
      ext = '.pdf';
      mime = 'application/pdf';
    }

    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.title.toLowerCase().replace(/\s+/g, '-')}${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    showMessage(`Esportato ${format.toUpperCase()}`);
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

  function handleSelect(doc: DocumentEntity) {
    const nextId = selectedId === doc.id ? null : doc.id;
    setSelectedId(nextId);
    onSelectionChange?.(nextId);
  }

  useEffect(() => {
    if (selectedDocumentId !== undefined) {
      setSelectedId(selectedDocumentId ?? null);
    }
  }, [selectedDocumentId]);

  const selectedDoc = selectedId ? docs.find(d => d.id === selectedId) : null;
  const selectedVersion = selectedDoc ? getCurrentVersionForDocument(documentArchive, selectedDoc) : null;

  return (
    <div className="space-y-4">
      {message && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-2 rounded text-sm">
          {message}
        </div>
      )}

      {docs.length === 0 ? (
        <div className="text-ui-text-secondary text-sm py-8 text-center">
          Nessun documento canonico presente. Crea il primo documento dalla sezione Progettazioni.
        </div>
      ) : (
        <div className="space-y-2">
          {docs.filter(d => d.status !== 'archived').map(doc => {
            const version = getCurrentVersionForDocument(documentArchive, doc);
            return (
              <div key={doc.id} className="border border-ui-border rounded-ui-control">
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
                      {version && (
                        <>
                          <span>·</span>
                          <span>v{version.versionNumber}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <svg
                    className={`w-4 h-4 text-ui-text-secondary transition-transform ${selectedId === doc.id ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {selectedId === doc.id && (
                  <div className="px-4 pb-3 pt-1 border-t border-ui-border space-y-3">
                    {selectedVersion && (
                      <div className="text-sm text-ui-text-secondary space-y-1">
                        <p><strong>Origine:</strong> {doc.metadata.origin}</p>
                        <p><strong>Versione corrente:</strong> {selectedVersion.versionNumber}</p>
                        <p><strong>Creato:</strong> {new Date(selectedVersion.createdAt).toLocaleDateString('it-IT')}</p>
                        {selectedVersion.reason && <p><strong>Motivo:</strong> {selectedVersion.reason}</p>}
                        <p><strong>Istituto:</strong> {selectedVersion.institutionalSnapshot.instituteName}</p>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleExport(doc, 'html')}
                        className="px-3 py-1.5 text-xs font-medium bg-ui-surface border border-ui-border rounded-ui-control hover:bg-ui-surface-hover transition"
                      >
                        HTML
                      </button>
                      <button
                        onClick={() => handleExport(doc, 'json')}
                        className="px-3 py-1.5 text-xs font-medium bg-ui-surface border border-ui-border rounded-ui-control hover:bg-ui-surface-hover transition"
                      >
                        JSON
                      </button>
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
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="text-xs text-ui-text-secondary border-t border-ui-border pt-3 mt-4">
        <p>Totale documenti: {docs.length} · Formati esportazione: HTML, JSON, stampa browser</p>
      </div>
    </div>
  );
}