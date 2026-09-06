import { BookOpenCheck } from 'lucide-react';
import { FontiTab as SourceRegistry, type FontiTabProps } from './FontiTab';
import { InstituteCurrentSourcePanel } from './InstituteCurrentSourcePanel';
import { InstituteCurriculumSourceRegisterPanel } from './InstituteCurriculumSourceRegisterPanel';
import { LocalCurriculumMigrationPreflightTask } from './LocalCurriculumMigrationPreflightTask';

export function FontiWorkspace(props: FontiTabProps) {
  return (
    <div className="space-y-4" data-fonti-workspace="canonical">
      <header className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5" data-source-authority-entry>
        <div className="flex items-start gap-3">
          <BookOpenCheck className="mt-0.5 h-5 w-5 shrink-0 text-indigo-700" aria-hidden="true" />
          <div className="min-w-0">
            <h1 className="text-lg font-black text-slate-900">Fonti del curricolo</h1>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
              Prima trovi la baseline corrente e le fonti normative o istituzionali che la sostengono. L’archivio locale e i documenti aggiunti dall’utente restano separati e non acquistano autorità per il solo fatto di essere presenti in Arena.
            </p>
          </div>
        </div>
      </header>

      <InstituteCurrentSourcePanel />
      <InstituteCurriculumSourceRegisterPanel />

      <SourceRegistry {...props} />

      <details className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5" data-r7c6c-preflight-disclosure>
        <summary className="cursor-pointer text-sm font-black text-slate-800">
          Controllo tecnico dei dati curricolari locali
        </summary>
        <p className="mt-2 max-w-3xl text-xs leading-5 text-slate-600">
          Usa questo controllo solo per verificare la sicurezza della futura migrazione del curricolo. L’operazione lavora su una copia in memoria e non cambia il funzionamento corrente di Arena.
        </p>
        <div className="mt-4">
          <LocalCurriculumMigrationPreflightTask />
        </div>
      </details>
    </div>
  );
}
