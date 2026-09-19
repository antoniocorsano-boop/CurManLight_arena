import { AlertTriangle, CheckCircle2, ChevronRight, CircleHelp, FileSearch, ShieldCheck } from 'lucide-react';
import type { AppViewsLayerProps } from '../types/appViewContracts';
import { AVAILABLE_DEPARTMENT_PUBLICATION } from '../../curriculum/data/curriculumPublicationRegistry';

type VerificationState = 'ok' | 'attention' | 'blocked';

const STATE_STYLES: Record<VerificationState, string> = {
  ok: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  attention: 'border-amber-200 bg-amber-50 text-amber-900',
  blocked: 'border-rose-200 bg-rose-50 text-rose-900',
};

const STATE_LABELS: Record<VerificationState, string> = {
  ok: 'Pronto',
  attention: 'Da controllare',
  blocked: 'Bloccato',
};

export type SupportVerificationViewProps = Pick<AppViewsLayerProps,
  | 'institutionalProfile'
  | 'customKbDocs'
  | 'currentDisciplineProps'
  | 'currentDisciplineDecided'
  | 'handleTabSwitch'
  | 'setShowSaveModal'
>;

export function SupportVerificationView({
  institutionalProfile,
  customKbDocs,
  currentDisciplineProps,
  currentDisciplineDecided,
  handleTabSwitch,
  setShowSaveModal,
}: SupportVerificationViewProps) {

  const unverifiedLocalSources = customKbDocs.filter((source) => source.authorityStatus !== 'LOCAL_VERIFIED').length;
  const pendingRevisionItems = Math.max(0, currentDisciplineProps.length - currentDisciplineDecided);
  const sourceAvailable = Boolean(AVAILABLE_DEPARTMENT_PUBLICATION?.sourceInstitutionName && AVAILABLE_DEPARTMENT_PUBLICATION?.sourceVersionLabel);

  const checks: Array<{
    id: string;
    title: string;
    state: VerificationState;
    explanation: string;
    action?: {
      label: string;
      tab?: 'fonti' | 'revisione' | 'esportazioni' | 'progetta-annuale';
      openSettings?: boolean;
    };
  }> = [
    {
      id: 'institution',
      title: 'Contesto istituzionale',
      state: institutionalProfile.configured ? 'ok' : 'blocked',
      explanation: institutionalProfile.configured
        ? `È attivo il contesto “${institutionalProfile.instituteName}”.`
        : 'L’istituto non è ancora configurato. Le pubblicazioni sorgente restano consultabili, ma non possono essere presentate come adottate dall’istituto corrente.',
      action: institutionalProfile.configured
        ? undefined
        : { label: 'Apri le Impostazioni locali', openSettings: true },
    },
    {
      id: 'source-publication',
      title: 'Fascicolo sorgente',
      state: sourceAvailable ? 'ok' : 'blocked',
      explanation: sourceAvailable
        ? `Fonte identificata: ${AVAILABLE_DEPARTMENT_PUBLICATION.sourceInstitutionName} · ${AVAILABLE_DEPARTMENT_PUBLICATION.sourceVersionLabel}.`
        : 'Manca una pubblicazione sorgente identificata e versionata.',
      action: { label: 'Apri il Fascicolo', tab: 'fonti' },
    },
    {
      id: 'local-sources',
      title: 'Fonti personali',
      state: unverifiedLocalSources > 0 ? 'attention' : 'ok',
      explanation: unverifiedLocalSources > 0
        ? `${unverifiedLocalSources} font${unverifiedLocalSources === 1 ? 'e' : 'i'} personal${unverifiedLocalSources === 1 ? 'e' : 'i'} da verificare. Restano locali e non acquisiscono autorità istituzionale.`
        : customKbDocs.length > 0
          ? 'Le fonti personali presenti sono state verificate localmente. Restano fonti locali.'
          : 'Nessuna fonte personale richiede attenzione.',
      action: { label: 'Controlla le fonti', tab: 'fonti' },
    },
    {
      id: 'revision',
      title: 'Riesame professionale',
      state: pendingRevisionItems > 0 ? 'attention' : 'ok',
      explanation: pendingRevisionItems > 0
        ? `${pendingRevisionItems} sched${pendingRevisionItems === 1 ? 'a' : 'e'} da esaminare nel contesto disciplinare corrente.`
        : 'Non risultano schede correnti in attesa nel contesto disciplinare selezionato.',
      action: { label: 'Apri il riesame', tab: 'revisione' },
    },
    {
      id: 'surface-boundary',
      title: 'Confine Arena · Atlas · Docente OS',
      state: 'ok',
      explanation: 'Arena governa il curricolo; Curriculum Atlas lo rende navigabile in sola lettura; Docente OS possiede programmazione annuale, UDA, lezioni e materiali.',
      action: { label: 'Apri il passaggio', tab: 'progetta-annuale' },
    },
    {
      id: 'handoff',
      title: 'Passaggio operativo a Docente OS',
      state: institutionalProfile.configured ? 'attention' : 'blocked',
      explanation: institutionalProfile.configured
        ? 'Il prerequisito istituzionale è presente. Arena può preparare il contesto versionato; Docente OS dovrà accettarlo prima di usarlo.'
        : 'Senza un contesto istituzionale verificabile Arena non prepara un passaggio istituzionale verso Docente OS.',
      action: { label: 'Verifica il passaggio', tab: 'esportazioni' },
    },
  ];

  const blockingCount = checks.filter((check) => check.state === 'blocked').length;
  const attentionCount = checks.filter((check) => check.state === 'attention').length;

  return (
    <section
      className="space-y-5 text-left"
      aria-labelledby="support-verification-title"
      data-teacher-surface="support-verification"
      data-human-task="support-readiness"
    >
      <header className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-6 w-6 shrink-0 text-indigo-700" aria-hidden="true" />
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wide text-indigo-700">Supporto</p>
            <h1 id="support-verification-title" className="mt-1 text-2xl font-black text-slate-950">Verifiche</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Vedi cosa è pronto, cosa richiede attenzione e cosa ti impedisce di procedere. Questa vista non certifica il curricolo e non prende decisioni al posto dell’istituto.
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-sm font-bold">
          {blockingCount === 0 && attentionCount === 0 ? (
            <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-emerald-800">Nessun blocco rilevato</span>
          ) : (
            <>
              {blockingCount > 0 && <span className="rounded-full bg-rose-50 px-3 py-1.5 text-rose-800">{blockingCount} {blockingCount === 1 ? 'blocco' : 'blocchi'}</span>}
              {attentionCount > 0 && <span className="rounded-full bg-amber-50 px-3 py-1.5 text-amber-900">{attentionCount} da controllare</span>}
            </>
          )}
        </div>
      </header>

      <div className="space-y-3" aria-label="Stato delle verifiche">
        {checks.map((check) => (
          <article key={check.id} className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5" data-verification-state={check.state}>
            <div className="flex items-start gap-3">
              {check.state === 'ok' ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" />
              ) : check.state === 'blocked' ? (
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" aria-hidden="true" />
              ) : (
                <CircleHelp className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden="true" />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base font-black text-slate-900">{check.title}</h2>
                  <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${STATE_STYLES[check.state]}`}>
                    {STATE_LABELS[check.state]}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">{check.explanation}</p>
                {check.action && (
                  <button
                    type="button"
                    onClick={() => {
                      if (check.action?.openSettings) {
                        setShowSaveModal(true);
                        return;
                      }
                      if (check.action?.tab) handleTabSwitch(check.action.tab);
                    }}
                    className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    {check.action.label}
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>

      <details className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <summary className="cursor-pointer font-bold text-slate-700">
          Cosa non fa questa pagina
        </summary>
        <div className="mt-3 flex items-start gap-2 text-sm leading-6 text-slate-600">
          <FileSearch className="mt-1 h-4 w-4 shrink-0" aria-hidden="true" />
          <p>Non approva il curricolo, non sostituisce la decisione istituzionale, non rende Atlas autoritativo, non certifica conformità amministrativa e non modifica Docente OS.</p>
        </div>
      </details>
    </section>
  );
}
