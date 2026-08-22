import { ArrowRight, BookOpen, Calendar, FileText } from 'lucide-react';
import type { DocumentExportEvent, UdaModel, UserRole } from '../../../types/curriculum';
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
  setActiveCurricoloView: (value: 'albero' | 'mappa' | 'popolamento' | 'nazionale') => void;
  setActiveProgTab: (value: string) => void;
  setSelectedUda: (uda: UdaModel | null) => void;
}

const ROLE_LABELS: Record<UserRole, string> = {
  insegnante: 'Docente',
  dipartimento: 'Dipartimento',
  referente: 'Referente d’istituto',
  'non-dichiarato': 'Contesto non dichiarato',
  dirigente: 'Dirigenza',
  collegio: 'Collegio docenti',
  amministratore: 'Amministrazione',
};

function TaskCard({ title, description, icon: Icon, onClick, primary = false }: {
  title: string;
  description: string;
  icon: typeof BookOpen;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-36 rounded-2xl border p-5 text-left transition ${primary ? 'border-indigo-300 bg-white hover:border-indigo-500' : 'border-slate-200 bg-white hover:border-indigo-300'}`}
    >
      <div className="flex items-start justify-between gap-4">
        <Icon className="h-6 w-6 text-indigo-600" aria-hidden="true" />
        <ArrowRight className="h-5 w-5 text-slate-400" aria-hidden="true" />
      </div>
      <h2 className="mt-6 text-base font-semibold text-slate-900">{title}</h2>
      <p className="mt-1.5 text-sm leading-6 text-slate-500">{description}</p>
    </button>
  );
}

export function DashboardView({ activeTab, role, savedUda, wizardStep, progTitle, handleTabSwitch, setActiveProgTab }: DashboardViewProps) {
  if (activeTab !== 'dashboard') return null;

  const hasCurrentWork = wizardStep > 1 && wizardStep <= 5;
  const currentWork = hasCurrentWork
    ? progTitle || 'Progettazione in corso'
    : savedUda.length > 0
      ? 'Un lavoro salvato è pronto da riprendere'
      : 'Nessun lavoro in corso';

  const openPlanning = () => {
    handleTabSwitch('progetta-annuale');
    setActiveProgTab(hasCurrentWork ? 'annuale' : 'home');
  };

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-5 py-2 text-left">
      <section>
        <h1 className="text-3xl font-bold text-indigo-800">Cosa devi fare oggi?</h1>
        <p className="mt-2 max-w-3xl text-base leading-7 text-slate-600">
          Parti dal contesto attivo, riprendi il lavoro corrente oppure scegli il prossimo passo del tuo percorso.
        </p>
      </section>

      <section aria-labelledby="active-context-title" className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Contesto attivo</p>
        <h2 id="active-context-title" className="mt-1 text-base font-semibold text-slate-900">{ROLE_LABELS[role]}</h2>
        <p className="mt-1 text-sm leading-6 text-slate-600">Le azioni disponibili restano locali e richiedono sempre una decisione professionale.</p>
      </section>

      <section aria-labelledby="current-work-title" className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Lavoro corrente</p>
        <h2 id="current-work-title" className="mt-1 text-base font-semibold text-slate-900">{currentWork}</h2>
        <p className="mt-1 text-sm leading-6 text-slate-600">Il prossimo passo è sempre modificabile dal percorso di lavoro.</p>
      </section>

      <section aria-label="Azioni principali" className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <TaskCard title="Consulta il curricolo" description="Leggi le fonti nazionali, il curricolo d’istituto e il confronto tra framework." icon={BookOpen} onClick={() => handleTabSwitch('curricolo')} primary />
        <TaskCard title="Continua la progettazione" description="Riprendi il lavoro corrente o avvia una nuova progettazione annuale." icon={Calendar} onClick={openPlanning} />
        <TaskCard title="Proponi un aggiornamento" description="Confronta i contenuti e apri il percorso di revisione istituzionale." icon={BookOpen} onClick={() => handleTabSwitch('revisione')} />
        <TaskCard title="Produci un documento" description="Prepara un documento di lavoro a partire dai contenuti disponibili." icon={FileText} onClick={() => handleTabSwitch('esportazioni')} />
      </section>
    </div>
  );
}
