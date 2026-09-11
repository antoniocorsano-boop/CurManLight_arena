import { useState, type ChangeEvent } from 'react';
import {
  buildFinalPublicationReviewPackage,
  importFinalPublicationReviewPackage,
} from '../../../domain/curriculum/national/finalPublicationReviewReceiptExchange';
import {
  validateFinalPublicationSourceVerificationReceipt,
  type FinalPublicationSourceVerificationReceipt,
} from '../../../domain/curriculum/national/finalPublicationHumanVerification';
import { FinalPublicationSourceFingerprintPanel } from './FinalPublicationSourceFingerprintPanel';
import { FinalPublicationSourceReviewTask } from './FinalPublicationSourceReviewTask';

const STORAGE_KEY = 'cml.dm221.final-publication.source-review.receipts.v1';

function readCurrentReceipts(): FinalPublicationSourceVerificationReceipt[] {
  if (typeof window === 'undefined') return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((value): value is FinalPublicationSourceVerificationReceipt =>
      validateFinalPublicationSourceVerificationReceipt(
        value as FinalPublicationSourceVerificationReceipt,
      ).valid,
    );
  } catch {
    return [];
  }
}

function persistReceipts(receipts: readonly FinalPublicationSourceVerificationReceipt[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(receipts));
}

export function FinalPublicationSourceReviewWorkbench() {
  const [revision, setRevision] = useState(0);
  const [exchangeFeedback, setExchangeFeedback] = useState<string | null>(null);

  const exportReceipts = () => {
    if (typeof document === 'undefined') return;
    const receipts = readCurrentReceipts();
    if (receipts.length === 0) {
      setExchangeFeedback('Non ci sono ancora verifiche valide da esportare.');
      return;
    }

    const packageFile = buildFinalPublicationReviewPackage(receipts);
    const blob = new Blob([JSON.stringify(packageFile, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'dm221-pacchetto-verifiche-fonte.json';
    anchor.click();
    URL.revokeObjectURL(url);
    setExchangeFeedback(
      `Pacchetto esportato con ${receipts.length} ricevute valide, legate al registro corrente.`,
    );
  };

  const importReceipts = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    try {
      const raw = JSON.parse(await file.text()) as unknown;
      const result = importFinalPublicationReviewPackage(raw, readCurrentReceipts());
      if (!result.packageAccepted) {
        setExchangeFeedback(
          `Importazione bloccata: ${result.packageReason ?? 'pacchetto non valido.'}`,
        );
        return;
      }

      persistReceipts(result.acceptedReceipts);
      setRevision((value) => value + 1);
      setExchangeFeedback(
        `Importazione completata: ${result.addedCount} aggiunte, ${result.duplicateCount} già presenti, ${result.conflictCount} conflitti, ${result.invalidCount} non valide. ` +
          'Nessun conflitto è stato sovrascritto automaticamente.',
      );
    } catch {
      setExchangeFeedback('Importazione bloccata: il file non contiene JSON valido.');
    }
  };

  return (
    <div className="space-y-4" data-source-review-workbench="final-publication">
      <FinalPublicationSourceFingerprintPanel />

      <section
        className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
        aria-labelledby="source-review-roundtrip-title"
        data-source-review-roundtrip
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-2xl">
            <h4 id="source-review-roundtrip-title" className="text-sm font-black text-slate-900">
              Metti al sicuro e riprendi le verifiche
            </h4>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">
              Il pacchetto esportato è legato alla pubblicazione finale e al registro di 868 elementi. In importazione, ricevute non valide e conflitti non sostituiscono i dati locali.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={exportReceipts}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
            >
              Esporta pacchetto
            </button>
            <label className="cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-2 text-center text-xs font-bold text-slate-700 hover:bg-slate-100">
              Importa verifiche
              <input
                type="file"
                accept="application/json,.json"
                onChange={importReceipts}
                className="sr-only"
                aria-label="Importa pacchetto verifiche"
              />
            </label>
          </div>
        </div>

        {exchangeFeedback && (
          <p
            role="status"
            className="mt-3 rounded-xl border border-slate-200 bg-white p-3 text-xs font-semibold text-slate-700"
          >
            {exchangeFeedback}
          </p>
        )}
      </section>

      <FinalPublicationSourceReviewTask key={revision} />
    </div>
  );
}
