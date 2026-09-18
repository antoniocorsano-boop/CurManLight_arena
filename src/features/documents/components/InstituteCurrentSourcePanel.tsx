import { CheckCircle2, FileCheck2 } from 'lucide-react';
import { INSTITUTE_CURRICULUM_CURRENT_SOURCE } from '../../../domain/curriculum/institute/currentSource';

export function InstituteCurrentSourcePanel() {
  const master = INSTITUTE_CURRICULUM_CURRENT_SOURCE;
  const provenance = master.primaryCorrectedSource;

  return (
    <section
      className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 sm:p-5"
      data-current-institute-source
      data-current-curriculum-master
    >
      <div className="flex items-start gap-3" data-hcm-level="1">
        <FileCheck2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-black text-slate-900">Curricolo verticale d’Istituto</h2>
            <span className="rounded-full bg-white px-2.5 py-1 text-xs font-black text-emerald-800">
              Baseline corrente
            </span>
          </div>

          <p className="mt-2 text-sm font-bold text-slate-800">
            Master 3–14 · versione {master.sourceVersion}
          </p>
          <div className="mt-2 flex items-center gap-2 text-sm text-slate-700">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-700" aria-hidden="true" />
            <span>Materializzazione 3–14 completa · Validazione professionale aperta</span>
          </div>
          <p className="mt-2 text-xs font-bold text-amber-800">Non è ancora curricolo vigente.</p>

          <details
            className="mt-3 rounded-xl border border-slate-200 bg-white p-3"
            data-current-source-details
            data-hcm-level="3"
          >
            <summary className="cursor-pointer text-sm font-bold text-slate-700">Fonti e tracciabilità</summary>
            <div className="mt-3 space-y-2 text-xs leading-5 text-slate-600">
              <p><strong className="text-slate-800">Master corrente:</strong> {master.sourceFile}</p>
              <p><strong className="text-slate-800">Versione:</strong> {master.sourceVersion} — {master.sourceDate}</p>
              <p><strong className="text-slate-800">Drive:</strong> <span className="font-mono">{master.driveFileId}</span></p>
              <div className="border-t border-slate-200 pt-2">
                <p><strong className="text-slate-800">Fonte corretta di provenienza:</strong> {provenance.sourceFile}</p>
                <p><strong className="text-slate-800">Drive:</strong> <span className="font-mono">{provenance.driveFileId}</span></p>
                <p><strong className="text-slate-800">SHA-256:</strong> <span className="font-mono">{provenance.sourceSha256}</span></p>
                <p>La proposta corretta del 3 settembre resta immutata come provenienza primaria e non è più la rappresentazione corrente del curricolo.</p>
              </div>
              <p><strong className="text-slate-800">Precedente tecnico:</strong> {provenance.predecessor.sourceFile}</p>
            </div>
          </details>
        </div>
      </div>
    </section>
  );
}
