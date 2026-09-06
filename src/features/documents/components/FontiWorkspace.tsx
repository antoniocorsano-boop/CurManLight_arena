import { FontiTab as SourceRegistry, type FontiTabProps } from './FontiTab';
import { InstituteCurrentSourcePanel } from './InstituteCurrentSourcePanel';
import { LocalCurriculumMigrationPreflightTask } from './LocalCurriculumMigrationPreflightTask';

export function FontiWorkspace(props: FontiTabProps) {
  return (
    <div className="space-y-4" data-fonti-workspace="canonical">
      <SourceRegistry {...props} />

      <InstituteCurrentSourcePanel />

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
