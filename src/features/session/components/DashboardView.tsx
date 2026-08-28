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
    eyebrow: 'Curricolo d’istituto',
    title: 'Inizia dal contesto curricolare',
    summary: 'Controlla ordine, disciplina e stato del curricolo prima di preparare o valutare una modifica.',
    primaryLabel: 'Controlla il contesto',
    primaryTab: 'curricolo',
  },
  insegnante: {
    eyebrow: 'Contributo professionale',
    title: 'Consulta e contribuisci al curricolo',
    summary: 'Parti dal curricolo vigente e dalle fonti. Puoi preparare contributi, ma una decisione istituzionale richiede un’autorizzazione verificata.',
    primaryLabel: 'Consulta il curricolo',
    primaryTab: 'curricolo',
  },
  dipartimento: {
    eyebrow: 'Lavoro di revisione',
    title: 'Rivedi le proposte del dipartimento',
    summary: 'Confronta contenuto, fonte e conseguenza prima di preparare una proposta da sottoporre al passaggio istituzionale previsto.',
    primaryLabel: 'Apri le revisioni',
    primaryTab: 'revisione',
  },
  referente: {
    eyebrow: 'Coordinamento curricolare',
    title: 'Coordina la revisione del curricolo',
    summary: 'Raccogli i contributi e verifica che ogni proposta sia comprensibile, tracciabile e pronta per il passaggio successivo.',
    primaryLabel: 'Controlla le proposte',
    primaryTab: 'revisione',
  },
  dirigente: {
    eyebrow: 'Controllo istituzionale',
    title: 'Controlla ciò che richiede una decisione',
    summary: 'Esamina proposta, evidenze e conseguenze. Il ruolo mostrato nell’interfaccia non attribuisce da solo il potere di registrare una decisione ufficiale.',
    primaryLabel: 'Controlla le revisioni',
    primaryTab: 'revisione',
  },
  collegio: {
    eyebrow: 'Lavoro collegiale',
    title: 'Prepara il lavoro collegiale sul curricolo',
    summary: 'Consulta le proposte e le relative fonti. Le decisioni ufficiali restano separate dalla semplice consultazione o preparazione del lavoro.',
    primaryLabel: 'Apri le revisioni',
    primaryTab: 'revisione',
  },
  amministratore: {
    eyebrow: 'Supporto al workspace',
    title: 'Supporta l’accesso senza decidere sul curricolo',
    summary: 'L’amministrazione tecnica non attribuisce autorità curricolare. Consulta lo stato del lavoro senza trasformare permessi tecnici in decisioni istituzionali.',
    primaryLabel: 'Consulta il curricolo',
    primaryTab: 'curricolo',
  },
};

interface TaskCardProps {
  number: number;
  title: string;
  description: string;
  action: string;
  onOpen: () => void;
  icon: typeof Layers;
  note?: string;
}

function TaskCard({ number, title, description, action, onOpen, icon: Icon, note }: TaskCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5" data-beta-task={number}>
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-sm font-black text-indigo-700" aria-hidden="true">
          {number}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-600" aria-hidden="true">
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-extrabold text-slate-900">{title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">{description}</p>
              {note && <p className="mt-2 text-xs leading-relaxed text-slate-500">{note}</p>}
            </div>
          </div>
          <button
            type="button"
            onClick={onOpen}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-2.5 text-sm font-bold text-indigo-800 transition hover:bg-indigo-100 sm:w-auto"
          >
            {action}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  );
}

/**
 * Arena Beta Home.
 *
 * This surface deliberately represents the certified institutional journey,
 * not the repository's historical feature inventory. No local counters are
 * presented as votes, consensus, approvals or institutional decisions.
 */
export function DashboardView(props: DashboardViewProps) {
  if (props.activeTab !== 'dashboard') return null;

  const orientation = ROLE_ORIENTATION[props.role];

  return (
    <div className="space-y-6 fade-in text-left" data-beta-home="institutional-journey">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6" aria-labelledby="beta-home-title">
        <span className="text-[10px] font-extrabold uppercase tracking-wide text-indigo-600">{orientation.eyebrow}</span>
        <h1 id="beta-home-title" className="mt-1 text-xl font-extrabold leading-tight text-slate-900 sm:text-2xl">{orientation.title}</h1>
        <p className="mt-2 max-w-[72ch] text-sm leading-relaxed text-slate-600">{orientation.summary}</p>
        <button
          type="button"
          onClick={() => props.handleTabSwitch(orientation.primaryTab)}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-indigo-600 sm:w-auto"
          data-hia-primary-action="home-primary"
        >
          {orientation.primaryLabel}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </section>

      <section className="space-y-3" aria-labelledby="beta-journey-title">
        <div>
          <h2 id="beta-journey-title" className="text-base font-extrabold text-slate-900">Percorso del curricolo</h2>
          <p className="mt-1 text-sm text-slate-600">Ogni passaggio ha uno scopo diverso. Preparare, controllare e decidere non sono la stessa azione.</p>
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          <TaskCard
            number={1}
            icon={Layers}
            title="Controlla il contesto"
            description="Verifica ordine di scuola, disciplina, anno e quadro curricolare applicabile prima di lavorare sui contenuti."
            action="Apri il curricolo"
            onOpen={() => props.handleTabSwitch('curricolo')}
          />

          <TaskCard
            number={2}
            icon={BookOpenCheck}
            title="Controlla contenuti e fonti"
            description="Leggi ciò che il curricolo contiene e verifica da dove provengono gli elementi che richiedono attenzione."
            action="Apri le fonti"
            onOpen={() => props.handleTabSwitch('fonti')}
          />

          <TaskCard
            number={3}
            icon={RotateCcw}
            title="Rivedi una proposta"
            description="Confronta modifica, motivazione, evidenze e conseguenza prima di arrivare a qualsiasi decisione istituzionale."
            action="Apri la revisione"
            onOpen={() => props.handleTabSwitch('revisione')}
            note="Nessuna scelta locale mostrata nella Home viene trattata come voto, consenso o approvazione ufficiale."
          />

          <TaskCard
            number={4}
            icon={ShieldCheck}
            title="Decidi solo con autorità verificata"
            description="Quando una proposta è pronta, Arena separa la consultazione dalla decisione ufficiale e verifica l’autorizzazione richiesta."
            action="Controlla il passaggio"
            onOpen={() => props.handleTabSwitch('revisione')}
            note="Cambiare il ruolo visualizzato nell’app non attribuisce l’autorizzazione a decidere."
          />
        </div>
      </section>

      <section className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 sm:p-5" aria-labelledby="handoff-title">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-700" aria-hidden="true">
            <FileText className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 id="handoff-title" className="text-sm font-extrabold text-slate-900">Dopo la revisione: prepara il passaggio alla progettazione</h2>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">Il risultato curricolare può essere preparato per il lavoro successivo senza modificare automaticamente il lavoro operativo del docente.</p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <button type="button" onClick={() => props.handleTabSwitch('revisione')} className="rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-600">Apri la revisione</button>
              <button type="button" onClick={() => props.handleTabSwitch('esportazioni')} className="rounded-xl border border-emerald-200 bg-white px-4 py-2.5 text-sm font-bold text-emerald-800 hover:bg-emerald-50">Crea un documento</button>
            </div>
          </div>
        </div>
      </section>

      <p className="border-t border-slate-100 pt-4 text-center text-xs leading-relaxed text-slate-500">
        Arena distingue sempre consultazione, preparazione e decisione istituzionale. Le funzionalità operative di classe e l’authoring didattico esteso non fanno parte di questa Beta.
      </p>
    </div>
  );
}
