import { ArrowRight, BookOpenCheck, Eye, FileText, Layers, RotateCcw, ShieldCheck } from 'lucide-react';
import type { DocumentExportEvent, Proposal, UdaModel, UserRole } from '../../../types/curriculum';
import type { InstitutionalRole } from '../../../domain/curriculum/types';
import {
  projectArenaWorkQueue,
  type ArenaProjectedWorkItem,
  type ArenaWorkItemSeed,
} from '../../../domain/institution/workQueue';
import type { CustomKbDoc } from '../../documents/lib/localKnowledgeStore';
import type { CurriculumMap, ProgStatus } from '../types/appViewContracts';
import { ReferenteControlTower } from './ReferenteControlTower';

interface DashboardViewProps {
  activeTab: string;
  role: UserRole;
  savedUda: UdaModel[];
  decisions: Record<string, unknown>;
  currentDisciplineProps?: Proposal[];
  customKbDocs?: CustomKbDoc[];
  localCurriculum?: CurriculumMap;
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
  title: string;
  summary: string;
  primaryLabel: string;
  primaryTab: 'curricolo' | 'revisione';
}

const ROLE_ORIENTATION: Record<UserRole, RoleOrientation> = {
  'non-dichiarato': {
    title: 'Consulta il curricolo',
    summary: 'Consulta contenuti, stato e documenti di riferimento prima di avviare un’attività sul curricolo.',
    primaryLabel: 'Apri il curricolo',
    primaryTab: 'curricolo',
  },
  insegnante: {
    title: 'Il mio lavoro sul curricolo',
    summary: 'Consulta il curricolo della disciplina, esamina le proposte assegnate e prepara il tuo contributo professionale.',
    primaryLabel: 'Apri il curricolo',
    primaryTab: 'curricolo',
  },
  dipartimento: {
    title: 'Revisione disciplinare del curricolo',
    summary: 'Esamina le proposte della disciplina e prepara il confronto professionale del gruppo.',
    primaryLabel: 'Apri la revisione',
    primaryTab: 'revisione',
  },
  referente: {
    title: 'Stato di avanzamento del curricolo d’Istituto',
    summary: 'Verifica fonti, revisioni aperte e passaggi ancora necessari nel percorso di elaborazione del curricolo.',
    primaryLabel: 'Apri la revisione',
    primaryTab: 'revisione',
  },
  dirigente: {
    title: 'Stato del processo curricolare',
    summary: 'Consulta lo stato dei passaggi, le eventuali criticità e gli elementi che richiedono una decisione istituzionale.',
    primaryLabel: 'Apri la revisione',
    primaryTab: 'revisione',
  },
  collegio: {
    title: 'Proposte sottoposte al Collegio',
    summary: 'Consulta le proposte, le motivazioni e la documentazione necessaria per il passaggio collegiale.',
    primaryLabel: 'Apri la revisione',
    primaryTab: 'revisione',
  },
  amministratore: {
    title: 'Configurazione e integrità del sistema',
    summary: 'Consulta lo stato tecnico del sistema senza assumere funzioni decisionali sul curricolo.',
    primaryLabel: 'Apri il curricolo',
    primaryTab: 'curricolo',
  },
};

const JOURNEY = [
  { number: 1, icon: Layers, title: 'Curricolo', text: 'Contesto disciplinare e stato del lavoro.', tab: 'curricolo' },
  { number: 2, icon: RotateCcw, title: 'Revisione', text: 'Contributi personali e confronto professionale.', tab: 'revisione' },
  { number: 3, icon: FileText, title: 'Progettazione', text: 'Programmazione e UDA collegate al curricolo.', tab: 'progetta-annuale' },
] as const;

const toInstitutionalRole = (role: UserRole): InstitutionalRole =>
  role === 'insegnante' ? 'docente' : role;

const queueLabel = (item: ArenaProjectedWorkItem): string => {
  if (item.queueState === 'TO_VERIFY') return 'Da verificare';
  if (item.queueState === 'TO_REVIEW') return 'Da esaminare';
  if (item.queueState === 'TO_DECIDE') return 'Da decidere';
  return 'Da consultare';
};

const routeForWorkItem = (item: ArenaProjectedWorkItem): string => {
  if (item.processId === 'P1_SOURCE_QUALIFICATION') return 'fonti';
  if (item.processId === 'P4_REVISION_REVIEW' || item.processId === 'P5_INSTITUTIONAL_DECISION') return 'revisione';
  if (item.processId === 'P7_PLANNING_HANDOFF') return 'esportazioni';
  return 'curricolo';
};

const deriveRuntimeWorkSeeds = (props: DashboardViewProps): ArenaWorkItemSeed[] => {
  const seeds: ArenaWorkItemSeed[] = [];
  const unverifiedSources = (props.customKbDocs ?? []).filter((source) => source.authorityStatus !== 'LOCAL_VERIFIED');
  const pendingProposals = (props.currentDisciplineProps ?? []).filter((proposal) => !props.decisions[proposal.id]);
  const teacherReview = props.role === 'insegnante';

  if (unverifiedSources.length > 0) {
    seeds.push({
      id: 'home-source-verification',
      processId: 'P1_SOURCE_QUALIFICATION',
      title: unverifiedSources.length === 1 ? '1 fonte da verificare' : `${unverifiedSources.length} fonti da verificare`,
      reason: 'Controlla i documenti di riferimento prima di utilizzarli nel lavoro sul curricolo.',
      queueState: 'TO_VERIFY',
      evidenceState: 'NOT_REQUIRED',
      requiredCapability: 'CURRICULUM_READ',
      nextActionLabel: 'Apri il Fascicolo',
      nextActorRole: 'referente',
      consequential: false,
      authenticatedAuthorityRequired: false,
      sourceRef: unverifiedSources[0]?.id,
      orderKey: '010',
    });
  }

  if (pendingProposals.length > 0) {
    seeds.push({
      id: 'home-pending-revisions',
      processId: 'P4_REVISION_REVIEW',
      title: teacherReview
        ? (pendingProposals.length === 1 ? '1 scheda da esaminare' : `${pendingProposals.length} schede da esaminare`)
        : (pendingProposals.length === 1 ? '1 proposta da esaminare' : `${pendingProposals.length} proposte da esaminare`),
      reason: teacherReview
        ? 'Esamina le schede e registra il tuo orientamento professionale in vista del confronto con il gruppo.'
        : 'Esamina le proposte ancora aperte nel percorso di revisione disciplinare.',
      queueState: 'TO_REVIEW',
      evidenceState: 'NOT_REQUIRED',
      requiredCapability: teacherReview ? 'CURRICULUM_PROPOSE' : 'REVISION_REVIEW',
      nextActionLabel: teacherReview ? 'Apri la revisione' : 'Esamina le proposte',
      nextActorRole: teacherReview ? 'docente' : 'dipartimento',
      consequential: false,
      authenticatedAuthorityRequired: false,
      sourceRef: pendingProposals[0]?.id,
      orderKey: '020',
    });
  }

  return seeds;
};

function WorkItemCard({ item, onOpen }: { item: ArenaProjectedWorkItem; onOpen: () => void }) {
  const actionable = item.access === 'ACTIONABLE';

  return (
    <article
      className={`rounded-xl border p-4 ${actionable ? 'border-indigo-100 bg-indigo-50/40' : 'border-slate-200 bg-slate-50'}`}
      data-home-work-item={item.id}
      data-work-access={item.access}
      data-work-state={item.queueState}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className={`text-[10px] font-black uppercase tracking-wide ${actionable ? 'text-indigo-700' : 'text-slate-500'}`}>{queueLabel(item)}</span>
          <h3 className="mt-1 text-sm font-extrabold text-slate-900">{item.title}</h3>
          <p className="mt-1 text-xs leading-5 text-slate-600">{item.reason}</p>
        </div>
        {!actionable && <Eye className="h-5 w-5 shrink-0 text-slate-400" aria-hidden="true" />}
      </div>

      {item.blocker && (
        <p className="mt-2 rounded-lg bg-white px-3 py-2 text-xs font-semibold leading-5 text-amber-800">{item.blocker}</p>
      )}

      <button
        type="button"
        onClick={onOpen}
        className={`mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold sm:w-auto ${actionable ? 'bg-indigo-700 text-white hover:bg-indigo-600' : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'}`}
        data-home-work-action={actionable ? 'actionable' : 'read-only'}
      >
        {actionable ? item.nextActionLabel : 'Apri per consultare'}
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </article>
  );
}

export function DashboardView(props: DashboardViewProps) {
  if (props.activeTab !== 'dashboard') return null;

  const orientation = ROLE_ORIENTATION[props.role];
  const actor = { role: toInstitutionalRole(props.role), assurance: 'self-declared' as const };
  const projectedWork = projectArenaWorkQueue(deriveRuntimeWorkSeeds(props), actor);
  const actionable = projectedWork.filter((item) => item.access === 'ACTIONABLE' && item.queueState !== 'COMPLETED');
  const readOnly = projectedWork.filter((item) => item.access === 'READ_ONLY' && item.queueState !== 'COMPLETED');

  return (
    <div className="space-y-4 fade-in text-left" data-beta-home="role-work-queue" data-teacher-surface="home" data-home-assurance="self-declared">
      <div className="space-y-4" data-hcm-level="1" data-hcm-purpose="orientation-action">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6" aria-labelledby="beta-home-title">
          <span className="text-xs font-bold text-indigo-700">Il mio lavoro</span>
          <h1 id="beta-home-title" className="mt-1 text-xl font-extrabold leading-tight text-slate-900 sm:text-2xl">{orientation.title}</h1>
          <p className="mt-2 max-w-[68ch] text-sm leading-relaxed text-slate-600">{orientation.summary}</p>
        </section>

        {props.role === 'referente' && (
          <ReferenteControlTower
            sources={props.customKbDocs ?? []}
            curriculum={props.localCurriculum ?? null}
            onOpenSources={() => props.handleTabSwitch('fonti')}
            onOpenRevision={() => props.handleTabSwitch('revisione')}
          />
        )}

        <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5" aria-labelledby="home-actionable-title" data-home-queue="actionable">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 id="home-actionable-title" className="text-base font-extrabold text-slate-900">Da fare</h2>
              <p className="mt-1 text-xs leading-5 text-slate-500">Attività che richiedono il tuo intervento.</p>
            </div>
            <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-black text-indigo-700">{actionable.length}</span>
          </div>

          {actionable.length > 0 ? (
            <div className="mt-3 grid gap-3 lg:grid-cols-2">
              {actionable.map((item) => (
                <WorkItemCard key={item.id} item={item} onOpen={() => props.handleTabSwitch(routeForWorkItem(item))} />
              ))}
            </div>
          ) : (
            <div className="mt-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
              <p className="text-sm font-bold text-slate-800">Non ci sono attività da completare in questo momento.</p>
              <p className="mt-1 text-xs leading-5 text-slate-600">Puoi continuare a consultare il curricolo e i materiali disponibili.</p>
              <button
                type="button"
                onClick={() => props.handleTabSwitch(orientation.primaryTab)}
                className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-white px-4 py-2.5 text-sm font-bold text-indigo-700 sm:w-auto"
              >
                {orientation.primaryLabel}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          )}
        </section>

        {readOnly.length > 0 && (
          <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5" aria-labelledby="home-readonly-title" data-home-queue="read-only">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 id="home-readonly-title" className="text-base font-extrabold text-slate-900">Da consultare</h2>
                <p className="mt-1 text-xs leading-5 text-slate-500">Elementi disponibili per conoscenza o verifica, senza azioni richieste al tuo profilo.</p>
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-600">{readOnly.length}</span>
            </div>
            <div className="mt-3 grid gap-3 lg:grid-cols-2">
              {readOnly.map((item) => (
                <WorkItemCard key={item.id} item={item} onOpen={() => props.handleTabSwitch(routeForWorkItem(item))} />
              ))}
            </div>
          </section>
        )}
      </div>

      <details className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5" data-hcm-level="2" data-hcm-secondary-content>
        <summary className="cursor-pointer text-sm font-extrabold text-slate-800">Il percorso di lavoro</summary>
        <p className="mt-2 text-xs leading-5 text-slate-600">Apri questa sezione solo se vuoi vedere come il lavoro corrente si collega ai passaggi successivi.</p>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
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

        <div className="mt-4 grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2" data-secondary-services>
          <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3" data-secondary-service="fascicolo">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700" aria-hidden="true">
              <BookOpenCheck className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <strong className="text-sm text-slate-900">Fascicolo</strong>
              <p className="mt-1 text-xs leading-5 text-slate-600">Fonti, versioni, registri e ricevute restano consultabili senza diventare una fase del lavoro.</p>
              <button type="button" onClick={() => props.handleTabSwitch('fonti')} className="mt-3 rounded-xl border border-indigo-200 bg-white px-4 py-2.5 text-sm font-bold text-indigo-800 hover:bg-indigo-50">Apri il Fascicolo</button>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3" data-secondary-service="documents">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700" aria-hidden="true">
              <FileText className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <strong className="text-sm text-slate-900">Documenti del curricolo</strong>
              <p className="mt-1 text-xs leading-5 text-slate-600">Prepara o consulta i documenti collegati al curricolo e al lavoro di revisione.</p>
              <button type="button" onClick={() => props.handleTabSwitch('esportazioni')} className="mt-3 rounded-xl border border-emerald-200 bg-white px-4 py-2.5 text-sm font-bold text-emerald-800 hover:bg-emerald-50">Apri documenti</button>
            </div>
          </div>
        </div>
      </details>

      <details className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5" data-hcm-level="3" data-hcm-verification-content>
        <summary className="cursor-pointer text-sm font-extrabold text-slate-800">Ruoli e condizioni di accesso</summary>
        <div className="mt-3 space-y-2 text-xs leading-5 text-slate-600">
          <p>Il profilo di lavoro determina le funzioni mostrate nell’interfaccia.</p>
          <p>Le decisioni che producono effetti istituzionali richiedono l’incarico previsto dal processo e un accesso autenticato. La scelta del profilo personale non attribuisce da sola tale autorità.</p>
        </div>
      </details>
    </div>
  );
}
