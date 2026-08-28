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

const JOURNEY = [
  { number: 1, icon: Layers, title: 'Contesto', text: 'Ordine, disciplina, anno e quadro applicabile.', tab: 'curricolo' },
  { number: 2, icon: BookOpenCheck, title: 'Contenuti e fonti', text: 'Controlla cosa è scritto e da dove proviene.', tab: 'fonti' },
  { number: 3, icon: RotateCcw, title: 'Revisione', text: 'Confronta modifica, motivazione ed evidenze.', tab: 'revisione' },
  { number: 4, icon: ShieldCheck, title: 'Decisione', text: 'Solo con autorità istituzionale verificata.', tab: 'revisione' },
] as const;

export function DashboardView(props: DashboardViewProps) {
  if (props.activeTab !== 'dashboard') return null;
  const orientation = ROLE_ORIENTATION[props.role];

  return (
    <div className="space-y-4 fade-in text-left" data-beta-home="institutional-journey">
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6" aria-labelledby="beta-home-title">
        <span className="text-[10px] font-extrabold uppercase tracking-wide text-indigo-600">{orientation.eyebrow}</span>
        <h1 id="beta-home-title" className="mt-1 text-xl font-extrabold leading-tight text-slate-900 sm:text-2xl">{orientation.title}</h1>
        <p className="mt-2 max-w-[72ch] text-sm leading-relaxed text-slate-600">{orientation.summary}</p>
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
            <h2 id="beta-journey-title" className="text-sm font-extrabold text-slate-900">Percorso del curricolo</h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">Preparare, controllare e decidere sono passaggi distinti.</p>
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
          <p className="mt-2 text-xs leading-relaxed text-slate-600">Una scelta locale o un ruolo mostrato nell’interfaccia non costituiscono voto, approvazione o autorizzazione istituzionale. La decisione ufficiale resta un passaggio distinto e controllato.</p>
        </details>
      </section>

      <section className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4" aria-labelledby="handoff-title">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-700" aria-hidden="true">
            <FileText className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 id="handoff-title" className="text-sm font-extrabold text-slate-900">Dopo la revisione</h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">Prepara il risultato per il lavoro successivo senza modificare automaticamente il lavoro operativo del docente.</p>
            <button type="button" onClick={() => props.handleTabSwitch('esportazioni')} className="mt-3 rounded-xl border border-emerald-200 bg-white px-4 py-2.5 text-sm font-bold text-emerald-800 hover:bg-emerald-50">Crea un documento</button>
          </div>
        </div>
      </section>
    </div>
  );
}
