import { CheckCircle2, FileCheck2, ShieldCheck } from 'lucide-react';
import { INSTITUTE_CURRICULUM_CURRENT_SOURCE } from '../../../domain/curriculum/institute/currentSource';

export function InstituteCurrentSourcePanel() {
  const source = INSTITUTE_CURRICULUM_CURRENT_SOURCE;

  return (
    <section
      className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 sm:p-5"
      data-current-institute-source
    >
      <div className="flex items-start gap-3">
        <FileCheck2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-black text-slate-900">Curricolo verticale d’istituto</h2>
            <span className="rounded-full bg-white px-2.5 py-1 text-xs font-black text-emerald-800">
              Fonte corrente
            </span>
          </div>

          <p className="mt-2 text-sm font-bold text-slate-800">
            Proposta corretta del 3 settembre 2026
          </p>
          <p className="mt-1 text-sm leading-6 text-slate-700">
            Le correzioni documentali della versione precedente sono recepite. Il contenuto resta una proposta d’Istituto e deve ancora essere validato professionalmente.
          </p>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm font-bold text-emerald-900">
              <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
              7 correzioni della fonte recepite
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm font-bold text-amber-900">
              <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
              Validazione professionale aperta
            </div>
          </div>

          <details className="mt-4 rounded-xl border border-slate-200 bg-white p-3" data-current-source-details>
            <summary className="cursor-pointer text-sm font-bold text-slate-700">Dettagli della fonte</summary>
            <div className="mt-3 space-y-2 text-xs leading-5 text-slate-600">
              <p><strong className="text-slate-800">File:</strong> {source.sourceFile}</p>
              <p><strong className="text-slate-800">Stato:</strong> proposta d’Istituto da validare</p>
              <p><strong className="text-slate-800">SHA-256:</strong> <span className="font-mono">{source.sourceSha256}</span></p>
              <p><strong className="text-slate-800">Precedente tecnico:</strong> {source.predecessor.sourceFile}</p>
              <p>La precedente ricostruzione v3 resta nello storico e non è più la base corrente del lavoro.</p>
            </div>
          </details>
        </div>
      </div>
    </section>
  );
}
