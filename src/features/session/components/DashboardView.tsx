import { ArrowRight, BookOpenCheck, FileText, Layers, RotateCcw, ShieldCheck } from 'lucide-react';
import type { UdaModel, UserRole, DocumentExportEvent } from '../../../types/curriculum';
import type { ProgStatus } from '../types/appViewContracts';

interface DashboardViewProps {
  activeTab: string;
  role: UserRole;
  savedUda: UdaModel[];
  decisions: Record<string, unknown>;
  wizardStep: number;
  progTitle: string;
  progStatus: ProgStatus;
  documentExportHistory: DocumentExportEvent[];
  handleDownloadCml: () => void;
  handleTabSwitch: (tab: string) => void;
  setSelectedBrainDoc: (value: string) => void;
  setWikiWorkspaceTab: (value: 'read') => void;
  setShowSaveModal: (value: boolean) => void;
  setActiveCurricoloView: (value: 'albero' | 'mappa' | 'popolamento') => void;
  setActiveProgTab: (value: string) => void;
  setSelectedUda: (uda: UdaModel | null) => void;
}

interface RoleOrientation {
  eyebrow: string;
  title: string;
  summary: string;
  primaryLabel: string;
  primaryTab: 'curricolo' | 'revisione';
}

const ROLE_ORIENTATION: Record<UserRole, RoleOrientation> = {
  'non-dichiarato': {
    eyebrow: 'Da dove iniziare',
    title: 'Controlla il curricolo',
    summary: 'Guarda materia, ordine di scuola, stato e fonti prima di fare modifiche.',
    primaryLabel: 'Apri il curricolo',
    primaryTab: 'curricolo',
  },
  insegnante: {
    eyebrow: 'Il tuo lavoro',
    title: 'Consulta il curricolo della tua materia',
    summary: 'Puoi leggere, controllare le fonti e preparare una proposta. L’approvazione resta un passaggio separato.',
    primaryLabel: 'Apri il curricolo',
    primaryTab: 'curricolo',
  },
  dipartimento: {
    eyebrow: 'Il tuo lavoro',
    title: 'Rivedi le proposte',
    summary: 'Confronta il testo, la motivazione e le fonti. Poi prepara la proposta per il passaggio successivo.',
    primaryLabel: 'Apri le revisioni',
    primaryTab: 'revisione',
  },
  referente: {
    eyebrow: 'Il tuo lavoro',
    title: 'Controlla le proposte',
    summary: 'Verifica che ogni proposta sia chiara, motivata e accompagnata dalle fonti necessarie.',
    primaryLabel: 'Apri le revisioni',
    primaryTab: 'revisione',
  },
  dirigente: {
    eyebrow: 'Il tuo lavoro',
    title: 'Controlla ciò che richiede una decisione',
    summary: 'Esamina proposta, fonti e conseguenze. Il ruolo mostrato qui non basta da solo per registrare una decisione ufficiale.',
    primaryLabel: 'Apri le revisioni',
    primaryTab: 'revisione',
  },
  collegio: {
    eyebrow: 'Il tuo lavoro',
    title: 'Prepara il lavoro sul curricolo',
    summary: 'Consulta proposte e fonti. La preparazione del lavoro resta distinta dalla decisione ufficiale.',
    primaryLabel: 'Apri le revisioni',
    primaryTab: 'revisione',
  },
  amministratore: {
    eyebrow: 'Il tuo lavoro',
    title: 'Gestisci l’accesso senza decidere sul curricolo',
    summary: 'I permessi tecnici permettono di usare il sistema, ma non attribuiscono autorità sulle decisioni curricolari.',
    primaryLabel: 'Apri il curricolo',
    primaryTab: 'curricolo',
  },
};

const JOURNEY = [
  { number: 1, icon: Layers, title: 'Guarda il contesto', text: 'Materia, ordine, anno e stato.', tab: 'curricolo' },
  { number: 2, icon: BookOpenCheck, title: 'Controlla le fonti', text: 'Verifica da dove arrivano i contenuti.', tab: 'fonti' },
  { number: 3, icon: RotateCcw, title: 'Prepara una modifica', text: 'Confronta testo e motivazione.', tab: 'revisione' },
  { number: 4, icon: ShieldCheck, title: 'Decisione', text: 'Solo quando esiste l’autorità richiesta.', tab: 'revisione' },
] as const;

export function DashboardView(props: DashboardViewProps) {
  if (props.activeTab !== 'dashboard') return null;
  const orientation = ROLE_ORIENTATION[props.role];

  return (
    <div className="space-y-4 fade-in text-left" data-beta-home="institutional-journey" data-teacher-surface="home">
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6" aria-labelledby="beta-home-title">
        <span className="text-xs font-bold text-indigo-700">{orientation.eyebrow}</span>
        <h1 id="beta-home-title" className="mt-1 text-xl font-extrabold leading-tight text-slate-900 sm:text-2xl">{orientation.title}</h1>
        <p className="mt-2 max-w-[68ch] text-sm leading-relaxed text-slate-600">{orientation.summary}</p>
        <button
          type="button"
          onClick={() => props.handleTabSwitch(orientation.primaryTab)}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-indigo-600 sm:w-auto"
          data-hia-primary-action="home-primary"
        >
          {orientation.primaryLabel}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5" aria-labelledby="beta-journey-title">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="beta-journey-title" className="text-sm font-extrabold text-slate-900">Come funziona</h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">Un passaggio alla volta.</p>
          </div>
          <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-bold text-indigo-700">4 passaggi</span>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {JOURNEY.map(({ number, icon: Icon, title, text, tab }) => (
            <button
              key={number}
              type="button"
              onClick={() => props.handleTabSwitch(tab)}
              className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-left transition hover:border-indigo-200 hover:bg-indigo-50"
            >
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[10px] font-black text-indigo-700">{number}</span>
                <Icon className="h-4 w-4 text-slate-500" aria-hidden="true" />
              </div>
              <strong className="mt-2 block text-xs text-slate-900">{title}</strong>
              <span className="mt-1 hidden text-[11px] leading-relaxed text-slate-500 sm:block">{text}</span>
            </button>
          ))}
        </div>

        <details className="mt-3 border-t border-slate-100 pt-3" data-hcm-secondary-content>
          <summary className="cursor-pointer text-xs font-semibold text-slate-500">Perché questi passaggi sono separati</summary>
          <p className="mt-2 text-xs leading-relaxed text-slate-600">Preparare una proposta non significa approvarla. Una decisione ufficiale richiede il passaggio e l’autorità previsti.</p>
        </details>
      </section>

      <section className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4" aria-labelledby="handoff-title">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-700" aria-hidden="true">
            <FileText className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 id="handoff-title" className="text-sm font-extrabold text-slate-900">Quando hai finito</h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">Prepara un documento o passa il risultato al lavoro successivo. Arena non modifica automaticamente il lavoro del docente.</p>
            <button type="button" onClick={() => props.handleTabSwitch('esportazioni')} className="mt-3 rounded-xl border border-emerald-200 bg-white px-4 py-2.5 text-sm font-bold text-emerald-800 hover:bg-emerald-50">Crea un documento</button>
          </div>
        </div>
      </section>
    </div>
  );
}
