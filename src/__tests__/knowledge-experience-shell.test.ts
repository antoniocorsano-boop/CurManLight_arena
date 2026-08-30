import { describe, expect, it } from 'vitest';
import shellSource from '../features/documents/components/SecondBrainTab.tsx?raw';
import addSourceModalSource from '../features/documents/components/AddKnowledgeSourceModal.tsx?raw';
import readerModalSource from '../features/documents/components/KnowledgeModals.tsx?raw';
import knowledgeHandlerSource from '../features/documents/hooks/useKnowledgeBaseHandlers.ts?raw';
import extractionSource from '../features/documents/lib/extractLocalKnowledgeFile.ts?raw';
import localKnowledgeStoreSource from '../features/documents/lib/localKnowledgeStore.ts?raw';
import storageSource from '../lib/consolidatedStorage.ts?raw';

describe('KX teacher-first knowledge experience', () => {
  it('starts from teacher tasks rather than the technical archive structure', () => {
    expect(shellSource).toContain('data-kx-shell="teacher-first-v2"');
    expect(shellSource).toContain('>Conoscenza</h1>');
    expect(shellSource).toContain('Cerca');
    expect(shellSource).toContain('Fonti');
    expect(shellSource).toContain('Termini');
    expect(shellSource).toContain('Relazioni');
    expect(shellSource).toContain('Aggiungi una fonte');
  });

  it('keeps the human authority boundary visible in plain language', () => {
    expect(shellSource).toContain('controlla sempre la fonte');
    expect(shellSource).toContain('decisione della scuola');
    expect(shellSource).toContain('Risposta da verificare');
    expect(addSourceModalSource).toContain('Non diventa automaticamente una fonte istituzionale');
    expect(addSourceModalSource).toContain('non modifica il curricolo approvato');
  });

  it('fails closed instead of exposing an unfinished relationship map', () => {
    expect(shellSource).toContain("secondBrainTab === 'graph' ?");
    expect(shellSource).toContain('Relazioni in preparazione');
    expect(shellSource).toContain('quando potrà mostrare collegamenti verificabili');
  });

  it('supports PDF as a first-class local intake format without pretending OCR exists', () => {
    expect(shellSource).toContain('setShowAddKbModal(true)');
    expect(addSourceModalSource).toContain('Aggiungi una fonte');
    expect(addSourceModalSource).toContain('.pdf,.txt,.md,.csv,.json');
    expect(addSourceModalSource).toContain('fino a');
    expect(addSourceModalSource).toContain('serve OCR');
    expect(addSourceModalSource).toContain('il file originale non viene inviato a un server');
    expect(addSourceModalSource).toContain('Aggiungi alla conoscenza');
    expect(extractionSource).toContain('20 * 1024 * 1024');
  });

  it('extracts PDF text page by page and preserves a cryptographic source identity', () => {
    expect(extractionSource).toContain("from 'pdfjs-dist/legacy/build/pdf.mjs'");
    expect(extractionSource).toContain("pdf.worker.min.mjs?worker");
    expect(extractionSource).toContain('GlobalWorkerOptions.workerPort = new PdfWorker()');
    expect(extractionSource).toContain("globalThis.crypto.subtle.digest('SHA-256'");
    expect(extractionSource).toContain('--- Pagina ${pageNumber} ---');
    expect(extractionSource).toContain("extractionStatus: 'OCR_REQUIRED'");
    expect(extractionSource).toContain("extractionStatus: partial ? 'PARTIAL' : 'READY'");
  });

  it('stores local knowledge in IndexedDB with explicit provenance and authority state', () => {
    expect(localKnowledgeStoreSource).toContain("super('curmanlight-local-knowledge-v1')");
    expect(localKnowledgeStoreSource).toContain("authorityStatus: KnowledgeAuthorityStatus");
    expect(localKnowledgeStoreSource).toContain('originalFileName?: string');
    expect(localKnowledgeStoreSource).toContain('sha256?: string');
    expect(localKnowledgeStoreSource).toContain('pageCount?: number');
    expect(localKnowledgeStoreSource).toContain("'LOCAL_UNVERIFIED'");
    expect(knowledgeHandlerSource).toContain('putLocalKnowledgeSource(newDoc)');
    expect(knowledgeHandlerSource).not.toContain("safeLocalStorageSetItem('curman_customKbDocs'");
  });

  it('migrates legacy localStorage knowledge instead of silently losing it', () => {
    expect(knowledgeHandlerSource).toContain("safeLocalStorageGetItem('curman_customKbDocs', '[]')");
    expect(knowledgeHandlerSource).toContain('putLocalKnowledgeSources(missingLegacy)');
    expect(knowledgeHandlerSource).toContain("safeLocalStorageRemoveItem('curman_customKbDocs')");
    expect(knowledgeHandlerSource).toContain("'LEGACY_LOCAL_STORAGE'");
  });

  it('escapes imported content before it reaches the legacy HTML reader', () => {
    expect(knowledgeHandlerSource).toContain('const escapeHtml');
    expect(knowledgeHandlerSource).toContain(".replace(/</g, '&lt;')");
    expect(knowledgeHandlerSource).toContain('const safeContent = escapeHtml(doc.content)');
    expect(readerModalSource).toContain('dangerouslySetInnerHTML');
  });

  it('uses human source titles and keeps development documents secondary', () => {
    expect(shellSource).toContain('Curricolo della scuola');
    expect(shellSource).toContain('Normativa e riferimenti');
    expect(shellSource).toContain('Scuola e miglioramento');
    expect(shellSource).toContain('Materiali tecnici del sistema');
    expect(shellSource).toContain('Non fanno parte del percorso ordinario del docente');
  });

  it('does not expose repository filenames in the teacher-facing source catalogue', () => {
    expect(shellSource).not.toContain('01_RACCOLTA_DOCUMENTI.MD');
    expect(shellSource).not.toContain('03_QUADRO_NORMATIVO.MD');
    expect(shellSource).not.toContain('05_WIKI_SISTEMA_CML.MD');
    expect(shellSource).not.toContain('11_STATO_SVILUPPO.MD');
  });

  it('keeps long secondary explanations progressively disclosed', () => {
    expect(shellSource).toContain('<details');
    expect(shellSource).toContain('Vedi la fonte');
    expect(shellSource).toContain('Materiali tecnici del sistema');
    expect(addSourceModalSource).toContain('Che cosa succede dopo?');
  });

  it('renders the glossary as a dedicated public surface and normalizes saved legacy mojibake', () => {
    expect(shellSource).toContain("secondBrainTab === 'glossary' ? (");
    expect(shellSource).toContain(".replace(/Compito di Realt�/g, 'Compito di Realtà')");
    expect(shellSource).toContain(".replace(/Unit�/g, 'Unità')");
    expect(shellSource).toContain(".replace(/Capacit�/g, 'Capacità')");
    expect(shellSource).toContain(".replace(/abilit�/g, 'abilità')");
  });

  it('keeps the default glossary UTF-8 clean at the source', () => {
    expect(storageSource).not.toContain('�');
    expect(storageSource).toContain('Compito di Realtà');
    expect(storageSource).toContain('Unità di Apprendimento');
    expect(storageSource).toContain('Capacità di utilizzare conoscenze e abilità');
  });

  it('keeps the compatibility reader behind the human source catalogue', () => {
    expect(shellSource).toContain('data-kx-task="source-reader"');
    const readerFallback = shellSource.slice(shellSource.indexOf('data-kx-task="source-reader"'));
    expect(readerFallback).toContain('<LegacySecondBrainTab {...props} />');
    expect(shellSource).toContain('[class*="xl:grid-cols-12"] > div:first-child');
  });

  it('preserves focused-task onboarding exclusion', () => {
    expect(shellSource).toContain("new CustomEvent('arena:knowledge-open')");
  });
});
