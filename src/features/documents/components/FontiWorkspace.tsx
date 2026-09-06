import { Archive } from 'lucide-react';
import { FontiTab as SourceRegistry, type FontiTabProps } from './FontiTab';
import { InstituteCurrentSourcePanel } from './InstituteCurrentSourcePanel';
import { InstituteCurriculumSourceRegisterPanel } from './InstituteCurriculumSourceRegisterPanel';
import { LocalCurriculumMigrationPreflightTask } from './LocalCurriculumMigrationPreflightTask';

export function FontiWorkspace(props: FontiTabProps) {
  return (
    <div
      className="space-y-4"
      data-fascicolo-workspace="canonical"
      data-fonti-workspace="legacy-alias"
      data-teacher-surface="fascicolo"
    >
      <header className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5" data-hcm-level="1">
        <div className="flex items-start gap-3">
          <Archive className="mt-0.5 h-5 w-5 shrink-0 text-indigo-700" aria-hidden="true" />
          <div className="min-w-0">
            <span className="text-xs font-bold text-indigo-700">Servizio di supporto</span>
            <h1 className="mt-1 text-xl font-extrabold text-slate-900">Fascicolo</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Fonti, versioni, registri, ricevute e materiali di tracciabilità del curricolo. Sono sempre consultabili, ma non costituiscono una fase obbligatoria del lavoro del docente.
            </p>
          </div>
        </div>
      </header>

      <InstituteCurrentSourcePanel />
      <InstituteCurriculumSourceRegisterPanel />
      <SourceRegistry {...props} />

      <details
        className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5"
        data-r7c6c-preflight-disclosure
        data-hcm-level="3"
      >
        <summary className="cursor-pointer text-sm font-black text-slate-800">Controlli tecnici</summary>
        <p className="mt-2 max-w-3xl text-xs leading-5 text-slate-600">
          Verifica la sicurezza della futura migrazione dei dati locali. Il controllo lavora su una copia in memoria e non modifica il curricolo corrente.
        </p>
        <div className="mt-4">
          <LocalCurriculumMigrationPreflightTask />
        </div>
      </details>
    </div>
  );
}
