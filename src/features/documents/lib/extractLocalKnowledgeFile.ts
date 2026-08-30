import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import pdfWorkerUrl from 'pdfjs-dist/legacy/build/pdf.worker.min.mjs?url';
import type { KnowledgeImportMetadata } from './localKnowledgeStore';

GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

export const MAX_LOCAL_KNOWLEDGE_FILE_BYTES = 20 * 1024 * 1024;

export type LocalKnowledgeExtraction = {
  content: string;
  metadata: KnowledgeImportMetadata;
  warning?: string;
};

const normalizePageText = (value: string) => value.replace(/\s+/g, ' ').trim();

async function sha256Hex(file: File): Promise<string> {
  if (!globalThis.crypto?.subtle) {
    throw new Error('Il browser non permette di calcolare l’impronta del file.');
  }
  const digest = await globalThis.crypto.subtle.digest('SHA-256', await file.arrayBuffer());
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function validateFile(file: File): void {
  if (file.size <= 0) throw new Error('Il file è vuoto.');
  if (file.size > MAX_LOCAL_KNOWLEDGE_FILE_BYTES) {
    throw new Error('Il file supera il limite di 20 MB per l’importazione locale.');
  }
}

async function extractPdf(file: File): Promise<LocalKnowledgeExtraction> {
  const data = new Uint8Array(await file.arrayBuffer());
  const pdf = await getDocument({ data }).promise;
  const pageBlocks: string[] = [];
  let pagesWithText = 0;

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const textContent = await page.getTextContent();
    const pageText = normalizePageText(
      textContent.items
        .map((item) => ('str' in item ? item.str : ''))
        .join(' '),
    );
    if (pageText) {
      pagesWithText += 1;
      pageBlocks.push(`--- Pagina ${pageNumber} ---\n${pageText}`);
    }
  }

  const sha256 = await sha256Hex(file);
  if (pagesWithText === 0) {
    return {
      content: '',
      metadata: {
        originalFileName: file.name,
        mediaType: file.type || 'application/pdf',
        byteSize: file.size,
        sha256,
        pageCount: pdf.numPages,
        ingestionMethod: 'PDF_TEXT_EXTRACTION',
        extractionStatus: 'OCR_REQUIRED',
      },
      warning: 'Questo PDF sembra una scansione o non contiene testo estraibile. Serve OCR prima di poterlo aggiungere alla conoscenza.',
    };
  }

  const partial = pagesWithText < pdf.numPages;
  return {
    content: pageBlocks.join('\n\n'),
    metadata: {
      originalFileName: file.name,
      mediaType: file.type || 'application/pdf',
      byteSize: file.size,
      sha256,
      pageCount: pdf.numPages,
      ingestionMethod: 'PDF_TEXT_EXTRACTION',
      extractionStatus: partial ? 'PARTIAL' : 'READY',
    },
    warning: partial
      ? `Testo estratto da ${pagesWithText} pagine su ${pdf.numPages}. Controlla il contenuto prima di aggiungerlo.`
      : undefined,
  };
}

async function extractTextFile(file: File): Promise<LocalKnowledgeExtraction> {
  const content = await file.text();
  if (!content.trim()) throw new Error('Il file non contiene testo utilizzabile.');
  return {
    content,
    metadata: {
      originalFileName: file.name,
      mediaType: file.type || 'text/plain',
      byteSize: file.size,
      sha256: await sha256Hex(file),
      ingestionMethod: 'TEXT_FILE',
      extractionStatus: 'NOT_REQUIRED',
    },
  };
}

export async function extractLocalKnowledgeFile(file: File): Promise<LocalKnowledgeExtraction> {
  validateFile(file);
  const lowerName = file.name.toLocaleLowerCase('it');
  const isPdf = file.type === 'application/pdf' || lowerName.endsWith('.pdf');
  if (isPdf) return extractPdf(file);

  const allowedTextFile = ['.txt', '.md', '.csv', '.json'].some((extension) => lowerName.endsWith(extension));
  if (!allowedTextFile) {
    throw new Error('Formato non supportato. Usa PDF testuale, TXT, MD, CSV o JSON.');
  }
  return extractTextFile(file);
}
