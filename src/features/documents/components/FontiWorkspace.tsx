import { FontiTab as SourceRegistry, type FontiTabProps } from './FontiTab';
import { InstituteCurrentSourcePanel } from './InstituteCurrentSourcePanel';
import { InstituteCurriculumSourceRegisterPanel } from './InstituteCurriculumSourceRegisterPanel';
import { LocalCurriculumMigrationPreflightTask } from './LocalCurriculumMigrationPreflightTask';

export function FontiWorkspace(props: FontiTabProps) {
  return (
    <div className="space-y-4" data-fonti-workspace="canonical">
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
