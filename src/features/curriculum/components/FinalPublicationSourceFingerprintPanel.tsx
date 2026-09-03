import { useState, type ChangeEvent } from 'react';
import { DM221_2025_SOURCE } from '../../../domain/curriculum/national/dm2212025';
import {
  assessFinalPublicationSourceFingerprint,
  buildFinalPublicationSourceFingerprintReceipt,
  computeSha256Hex,
  validateFinalPublicationSourceFingerprintReceipt,
  type FinalPublicationSourceFingerprintReceipt,
} from '../../../domain/curriculum/national/finalPublicationSourceFingerprint';

const STORAGE_KEY = 'cml.dm221.final-publication.source-fingerprint.v1';

function readFingerprint(): FinalPublicationSourceFingerprintReceipt | null {
  if (typeof window === 'undefined') return null;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? 'null') as FinalPublicationSourceFingerprintReceipt | null;
    if (!parsed) return null;
    return validateFinalPublicationSourceFingerprintReceipt(parsed).valid ? parsed : null;
  } catch {
    return null;
  }
}

function persistFingerprint(receipt: FinalPublicationSourceFingerprintReceipt) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(receipt));
}

export function FinalPublicationSourceFingerprintPanel() {
  const [fingerprint, setFingerprint] = useState<FinalPublicationSourceFingerprintReceipt | null>(readFingerprint);
  const [attested, setAttested] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const assessment = fingerprint ? assessFinalPublicationSourceFingerprint(fingerprint) : null;

  const fingerprintPdf = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!attested) {
      setFeedback('Conferma prima che il PDF selezionato proviene dal collegamento ufficiale MIM registrato qui sotto.');
      return;
    }

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setFeedback('Il file selezionato non è riconoscibile come PDF.');
      return;
    }

    setProcessing(true);
    setFeedback(null);
    try {
      const bytes = await file.arrayBuffer();
      const sha256 = await computeSha256Hex(bytes);
      const receipt = buildFinalPublicationSourceFingerprintReceipt({
        sha256,
        byteLength: file.size,
        fileName: file.name,
        sourceOriginAttestation: true,
      });
      persistFingerprint(receipt);
      setFingerprint(receipt);
      setFeedback(
        'Impronta SHA-256 calcolata e salvata localmente. È evidenza dell’esatto file controllato, ma non sblocca l’autorità nazionale finché manca l’impronta canonica attesa nel registro.',
      );
    } catch {
      setFeedback('Non è stato possibile calcolare l’impronta del PDF selezionato.');
    } finally {
      setProcessing(false);
    }
  };

  const exportFingerprint = () => {
    if (!fingerprint || typeof document === 'undefined') return;
    const blob = new Blob([JSON.stringify(fingerprint, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'dm221-impronta-fonte-finale.json';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const importFingerprint = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    try {
      const candidate = JSON.parse(await file.text()) as FinalPublicationSourceFingerprintReceipt;
      const validation = validateFinalPublicationSourceFingerprintReceipt(candidate);
      if (!validation.valid) {
        setFeedback(`Importazione impronta bloccata: ${validation.reason}`);
        return;
      }

      if (fingerprint && fingerprint.sha256 !== candidate.sha256) {
        setFeedback('Conflitto di impronta: esiste già localmente un SHA-256 diverso. Nessun dato è stato sovrascritto.');
        return;
      }

      persistFingerprint(candidate);
      setFingerprint(candidate);
      setFeedback('Impronta valida importata. Il gate nazionale resta chiuso finché manca un SHA-256 canonico atteso nel registro.');
    } catch {
      setFeedback('Importazione impronta bloccata: il file non contiene JSON valido.');
    }
  };

  return (
    <section
      className="space-y-4 rounded-2xl border border-amber-200 bg-amber-50/40 p-4"
      aria-labelledby="final-source-fingerprint-title"
      data-source-fingerprint-gate="required"
    >
      <div className="space-y-1">
        <span className="text-[10px] font-black uppercase tracking-wider text-amber-700">Identità del file sorgente</span>
        <h4 id="final-source-fingerprint-title" className="text-sm font-black text-slate-900">Verifica l’impronta del PDF finale MIM</h4>
        <p className="text-xs leading-relaxed text-slate-600">
          Arena può calcolare SHA-256 interamente nel browser. L’impronta identifica le bytes del PDF che stai leggendo; non sostituisce la verifica umana del testo e non dimostra da sola la provenienza del file.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <a
          href={DM221_2025_SOURCE.officialCurriculumVolume.url}
          target="_blank"
          rel="noreferrer"
          className="text-xs font-black text-amber-800 underline underline-offset-2"
        >
          Apri il PDF ufficiale MIM
        </a>
        <span className="text-[11px] text-slate-500">Edizione stampata {DM221_2025_SOURCE.officialCurriculumVolume.printedAt}</span>
      </div>

      <label className="flex items-start gap-3 rounded-xl border border-amber-200 bg-white p-3 text-xs text-slate-700">
        <input type="checkbox" checked={attested} onChange={(event) => setAttested(event.target.checked)} className="mt-0.5" />
        <span>Confermo che il PDF che selezionerò è quello ottenuto dal collegamento ufficiale MIM mostrato qui sopra.</span>
      </label>

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <label className="cursor-pointer rounded-lg bg-amber-700 px-3 py-2 text-center text-xs font-black text-white">
          {processing ? 'Calcolo in corso…' : 'Seleziona PDF e calcola SHA-256'}
          <input
            type="file"
            accept="application/pdf,.pdf"
            onChange={fingerprintPdf}
            disabled={processing}
            className="sr-only"
            aria-label="Seleziona PDF ufficiale per impronta SHA-256"
          />
        </label>
        <button
          type="button"
          disabled={!fingerprint}
          onClick={exportFingerprint}
          className="rounded-lg border border-amber-300 bg-white px-3 py-2 text-xs font-bold text-amber-900 disabled:opacity-40"
        >
          Esporta impronta
        </button>
        <label className="cursor-pointer rounded-lg border border-amber-300 bg-white px-3 py-2 text-center text-xs font-bold text-amber-900">
          Importa impronta
          <input
            type="file"
            accept="application/json,.json"
            onChange={importFingerprint}
            className="sr-only"
            aria-label="Importa ricevuta impronta sorgente"
          />
        </label>
      </div>

      {fingerprint && (
        <div className="space-y-1 rounded-xl border border-slate-200 bg-white p-3 text-[11px] text-slate-600">
          <p><strong>File:</strong> {fingerprint.fileName} · {fingerprint.byteLength.toLocaleString('it-IT')} byte</p>
          <p className="break-all"><strong>SHA-256:</strong> {fingerprint.sha256}</p>
          <p><strong>Gate crittografico nazionale:</strong> {assessment?.canSatisfyNationalPrescriptiveFingerprintGate ? 'corrispondenza canonica verificata' : 'non soddisfatto'}</p>
          {!assessment?.canonicalFingerprintAvailable && (
            <p>Il registro Arena dichiara ancora `contentFingerprint.sha256 = null`: l’impronta canonica attesa deve essere acquisita e congelata separatamente.</p>
          )}
        </div>
      )}

      {feedback && <p role="status" className="rounded-xl border border-amber-200 bg-white p-3 text-xs font-semibold text-slate-700">{feedback}</p>}
    </section>
  );
}
