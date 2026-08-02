import { useEffect, useRef, useState } from 'react';
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
  transitionDocumentStatus,
  applyDocumentActorContext,
  createDocumentRevision,
  DOCUMENT_TYPE_LABELS,
  DOCUMENT_STATUS_LABELS,
  DOCUMENT_STATUS_TRANSITIONS,
} from '../../../domain/documents';
import type {
  DocumentEntity,
  DocumentStatus,
  PreviewState,
  ExportabilityResult,
  ParagraphSection,
} from '../../../domain/documents';
import { DECLARED_INSTITUTIONAL_ROLES, getCurrentInstitutionalContext } from '../../../domain/institution';
import { createSelfDeclaredActor } from '../../../domain/curriculum/identity';
import type { InstitutionalRole } from '../../../domain/curriculum/types';
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

interface Notice {
  kind: 'success' | 'error';
  text: string;
}

const INSTITUTIONAL_ROLE_LABELS: Record<InstitutionalRole, string> = {
  'non-dichiarato': 'Ruolo non dichiarato',
  docente: 'Docente',
  dipartimento: 'Dipartimento',
  referente: 'Referente per il curricolo',
  collegio: 'Collegio dei docenti',
  dirigente: 'Dirigente scolastico',
  amministratore: 'Amministratore',
};

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
  const { documentArchive, institutionalArchive, replaceDocumentArchive } = useCurriculumStore();
  const [selectedId, setSelectedId] = useState<string | null>(selectedDocumentId ?? null);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const [previewState, setPreviewState] = useState<PreviewState | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [paragraphDrafts, setParagraphDrafts] = useState<Record<string, string[]>>({});
  const [revisionReason, setRevisionReason] = useState('');
  const [actorName, setActorName] = useState('');
  const [actorRole, setActorRole] = useState<InstitutionalRole | ''>('');
  const noticeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const docs = getDocumentList(documentArchive);
  const activeDocs = docs.filter(d => d.status !== 'archived');
  const archivedDocs = docs.filter(d => d.status === 'archived');

  function showNotice(kind: Notice['kind'], text: string) {
    if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
    setNotice({ kind, text });
    noticeTimerRef.current = setTimeout(() => {
      setNotice(null);
      noticeTimerRef.current = null;
    }, 6000);
  }

  useEffect(() => () => {
    if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
  }, []);

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

  useEffect(() => {
    if (!selectedDoc || !selectedVersionObj) return;
    const paragraphs = selectedVersionObj.content.sections.filter(s => s.type === 'paragraph');
    setParagraphDrafts(prev => ({
      ...prev,
      [selectedDoc.id]: paragraphs.map(p => (p as ParagraphSection).text),
    }));
    setRevisionReason('');
    const declaredActor = getCurrentInstitutionalContext(institutionalArchive)?.declaredActor;
    if (declaredActor) {
      setActorName(declaredActor.displayName);
      setActorRole(declaredActor.role);
    } else {
      setActorName('');
      setActorRole('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, effectiveVersionId]);

  function handleGeneratePreview() {
    if (!selectedDoc || !selectedVersionObj) return;
    try {
      const key = serializePreviewKey(computePreviewKey(selectedDoc, selectedVersionObj));
      const html = renderDocument(selectedDoc, selectedVersionObj, { css: PREVIEW_CSS });
      setPreviewState({
        key,
        html,
        renderedAt: new Date().toISOString(),
        versionNumber: selectedVersionObj.versionNumber,
      });
    } catch {
      showNotice('error', 'Impossibile generare l\'anteprima del documento.');
    }
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
      showNotice('error', blockingMessages);
      return;
    }

    if (isArchived) {
      showNotice('error', 'Il documento è archiviato. Puoi consultarlo, ma non esportarlo. Seleziona o crea una versione attiva.');
      return;
    }

    const printResult = printCanonicalDocument(previewState.html, {
      title: selectedDoc.title,
    });
    showNotice(printResult.success ? 'success' : 'error', printResult.message);
  }

  function handleDownloadJson() {
    const blob = new Blob([serializeDocumentArchive(documentArchive)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'archivio-documenti-canonico.json';
    a.click();
    URL.revokeObjectURL(url);
    showNotice('success', 'Archivio documenti esportato in formato JSON.');
  }

  function handleTransition(doc: DocumentEntity, nextStatus: DocumentStatus) {
    const result = transitionDocumentStatus(documentArchive, doc.id, nextStatus);
    if (result.success) {
      replaceDocumentArchive(result.archive);
      setPreviewState(null);
      showNotice('success', `Stato documento aggiornato: ${DOCUMENT_STATUS_LABELS[nextStatus] ?? nextStatus}. Genera nuovamente l'anteprima.`);
    } else {
      showNotice('error', result.errors.map(e => e.message).join('; '));
    }
  }

  function handleArchive(doc: DocumentEntity) {
    const result = archiveDocument(documentArchive, doc.id);
    if (result.success) {
      replaceDocumentArchive(result.archive);
      if (selectedId === doc.id) setSelectedId(null);
      showNotice('success', 'Documento archiviato.');
      return;
    }
    const hasInvalidTransition = result.errors.some(e => e.code === 'INVALID_TRANSITION');
    if (hasInvalidTransition) {
      showNotice(
        'error',
        `Impossibile archiviare: il documento è in stato "${DOCUMENT_STATUS_LABELS[doc.status] ?? doc.status}". ` +
          'Portalo prima a "Completato" con il comando di stato qui sopra, poi ripeti "Archivia".',
      );
      return;
    }
    showNotice('error', result.errors.map(e => e.message).join('; '));
  }

  function handleDuplicate(doc: DocumentEntity) {
    const result = duplicateDocument(documentArchive, doc.id);
    if (result.success) {
      replaceDocumentArchive(result.archive);
      showNotice('success', 'Documento duplicato.');
    } else {
      showNotice('error', result.errors.map(e => e.message).join('; '));
    }
  }

  function handleApplyActor(doc: DocumentEntity) {
    const name = actorName.trim();
    const role = actorRole;
    if (!name || !role) {
      showNotice('error', 'Inserisci sia il nome sia il ruolo prima di applicare autore e ruolo.');
      return;
    }
    const actor = createSelfDeclaredActor(name, role);
    const result = applyDocumentActorContext(documentArchive, doc.id, actor);
    if (result.success) {
      replaceDocumentArchive(result.archive);
      setSelectedVersionId(result.version.id);
      setPreviewState(null);
      showNotice('success', `Autore e ruolo associati al documento (versione ${result.version.versionNumber}). Genera nuovamente l'anteprima per sbloccare la stampa.`);
    } else {
      showNotice('error', result.errors.map(e => e.message).join('; '));
    }
  }

  function handleCreateRevision(doc: DocumentEntity) {
    const baseVersion = documentArchive.versions.find(v => v.id === doc.currentVersionRef);
    if (!baseVersion) {
      showNotice('error', 'Nessuna versione corrente disponibile per la modifica.');
      return;
    }
    const drafts = paragraphDrafts[doc.id] ?? [];
    let paragraphIndex = 0;
    const sections = baseVersion.content.sections.map(section => {
      if (section.type === 'paragraph') {
        const next = drafts[paragraphIndex];
        paragraphIndex += 1;
        if (next !== undefined && next !== section.text) {
          return { ...section, text: next };
        }
      }
      return section;
    });

    const result = createDocumentRevision(documentArchive, doc.id, { sections }, {
      reason: revisionReason.trim(),
    });
    if (result.success) {
      replaceDocumentArchive(result.archive);
      setSelectedVersionId(result.version.id);
      setPreviewState(null);
      setRevisionReason('');
      showNotice('success', `Nuova versione creata: v${result.version.versionNumber}. La versione precedente resta disponibile nel selettore.`);
    } else {
      showNotice('error', result.errors.map(e => e.message).join('; '));
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
    const paragraphs = version
      ? version.content.sections.filter(s => s.type === 'paragraph') as ParagraphSection[]
      : [];
    const drafts = paragraphDrafts[doc.id];
    const hasRevisionChanges = Boolean(
      paragraphs.length > 0 &&
      drafts &&
      paragraphs.some((p, i) => (drafts[i] ?? p.text) !== p.text),
    );
    const needsActor = !archived && (!version?.author || !version?.institutionalSnapshot?.declaredRole);

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
              {version?.author?.displayName && (
                <>
                  <span>·</span>
                  <span>Autore: {version.author.displayName}</span>
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

            {!archived && (
              <div className="border border-ui-border rounded-ui-control p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-ui-text-muted">Stato documento</span>
                  <span className="text-xs font-medium text-ui-text-secondary">
                    {DOCUMENT_STATUS_LABELS[doc.status] ?? doc.status}
                  </span>
                </div>
                {DOCUMENT_STATUS_TRANSITIONS[doc.status].length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {DOCUMENT_STATUS_TRANSITIONS[doc.status].filter(s => s !== 'archived').map(nextStatus => (
                      <button
                        key={nextStatus}
                        onClick={() => handleTransition(doc, nextStatus)}
                        className="px-3 py-1.5 text-xs font-medium bg-ui-surface border border-ui-border rounded-ui-control hover:bg-ui-surface-hover transition"
                      >
                        Passa a {DOCUMENT_STATUS_LABELS[nextStatus] ?? nextStatus}
                      </button>
                    ))}
                  </div>
                )}
                <p className="text-[11px] text-ui-text-muted">
                  Percorso: Bozza → In lavorazione → Completato → Archiviato. "Archivia" è attivo solo da "Completato".
                </p>
              </div>
            )}

            {needsActor && (
              <div className="border border-amber-200 bg-amber-50 rounded-ui-control p-3 space-y-2">
                <p className="text-xs font-semibold text-amber-900">Associa autore e ruolo a questo documento</p>
                <p className="text-xs text-amber-800">
                  Il documento è stato creato senza attore dichiarato. Imposta qui nome e ruolo per sbloccare
                  anteprima e stampa, oppure configura prima l'attore nel pannello Istituzione.
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  <label className="block text-xs font-medium text-amber-900">
                    Nome
                    <input
                      value={actorName}
                      onChange={(e) => setActorName(e.target.value)}
                      aria-label="Nome autore da associare"
                      className="mt-1 w-full text-xs border border-amber-300 rounded-ui-control px-2 py-1 bg-white text-ui-text focus:outline-none focus:ring-1 focus:ring-ui-focus"
                    />
                  </label>
                  <label className="block text-xs font-medium text-amber-900">
                    Ruolo
                    <select
                      value={actorRole}
                      onChange={(e) => setActorRole(e.target.value as InstitutionalRole | '')}
                      aria-label="Ruolo da associare"
                      className="mt-1 w-full text-xs border border-amber-300 rounded-ui-control px-2 py-1 bg-white text-ui-text focus:outline-none focus:ring-1 focus:ring-ui-focus"
                    >
                      <option value="">Seleziona un ruolo</option>
                      {DECLARED_INSTITUTIONAL_ROLES.map(role => (
                        <option key={role} value={role}>{INSTITUTIONAL_ROLE_LABELS[role]}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <button
                  onClick={() => handleApplyActor(doc)}
                  disabled={!actorName.trim() || !actorRole.trim()}
                  className="px-3 py-1.5 text-xs font-medium bg-amber-600 text-white rounded-ui-control hover:bg-amber-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Applica autore e ruolo
                </button>
              </div>
            )}

            {!archived && paragraphs.length > 0 && (
              <div className="border border-ui-border rounded-ui-control p-3 space-y-2">
                <p className="text-xs font-semibold text-ui-text-muted">Crea una nuova versione</p>
                <p className="text-xs text-ui-text-secondary">
                  Modifica il contenuto dei paragrafi e salva una nuova versione. La versione precedente resta disponibile.
                </p>
                {paragraphs.map((p, i) => (
                  <label key={i} className="block text-xs font-medium text-ui-text-secondary">
                    Testo paragrafo {i + 1}
                    <textarea
                      value={drafts?.[i] ?? p.text}
                      onChange={(e) => {
                        const next = [...(drafts ?? paragraphs.map(pg => pg.text))];
                        next[i] = e.target.value;
                        setParagraphDrafts(prev => ({ ...prev, [doc.id]: next }));
                      }}
                      rows={2}
                      aria-label={`Testo paragrafo ${i + 1}`}
                      className="mt-1 w-full text-xs border border-ui-border rounded-ui-control px-2 py-1 bg-ui-surface text-ui-text focus:outline-none focus:ring-1 focus:ring-ui-focus"
                    />
                  </label>
                ))}
                <label className="block text-xs font-medium text-ui-text-secondary">
                  Motivo della nuova versione
                  <input
                    value={revisionReason}
                    onChange={(e) => setRevisionReason(e.target.value)}
                    aria-label="Motivo della nuova versione"
                    placeholder="Es. Corretto il compito di realtà"
                    className="mt-1 w-full text-xs border border-ui-border rounded-ui-control px-2 py-1 bg-ui-surface text-ui-text focus:outline-none focus:ring-1 focus:ring-ui-focus"
                  />
                </label>
                <button
                  onClick={() => handleCreateRevision(doc)}
                  disabled={!hasRevisionChanges || !revisionReason.trim()}
                  className="px-3 py-1.5 text-xs font-medium bg-ui-action text-white rounded-ui-control hover:bg-ui-action-hover transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Crea nuova versione
                </button>
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
      {notice && (
        <div
          role={notice.kind === 'error' ? 'alert' : 'status'}
          aria-live="polite"
          className={`px-4 py-2 rounded text-sm ${
            notice.kind === 'error'
              ? 'bg-red-50 border border-red-200 text-red-800'
              : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
          }`}
        >
          {notice.text}
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
