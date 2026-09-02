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
    title: 'Controlla il curricolo',
    summary: 'Guarda materia, ordine di scuola, stato e fonti prima di fare modifiche.',
    primaryLabel: 'Apri il curricolo',
    primaryTab: 'curricolo',
  },
  insegnante: {
    title: 'Il curricolo che riguarda il tuo lavoro',
    summary: 'Controlla fonti e contenuti, prepara eventuali proposte e porta alla progettazione solo ciò che è pronto.',
    primaryLabel: 'Apri il curricolo',
    primaryTab: 'curricolo',
  },
  dipartimento: {
    title: 'Coerenza e proposte della disciplina',
    summary: 'Concentrati sugli elementi da verificare e sulle proposte che richiedono revisione disciplinare.',
    primaryLabel: 'Apri le revisioni',
    primaryTab: 'revisione',
  },
  referente: {
    title: 'Readiness del curricolo di istituto',
    summary: 'Controlla fonti da verificare, proposte ancora aperte e ciò che deve avanzare nel processo.',
    primaryLabel: 'Apri le revisioni',
    primaryTab: 'revisione',
  },
  dirigente: {
    title: 'Stato e blocchi del processo curricolare',
    summary: 'Verifica ciò che è pronto, ciò che è bloccato e ciò che richiede un passaggio istituzionale distinto.',
    primaryLabel: 'Apri le revisioni',
    primaryTab: 'revisione',
  },
  collegio: {
    title: 'Elementi da conoscere prima della decisione',
    summary: 'Consulta proposte e fonti. La scelta del ruolo qui non attribuisce da sola autorità istituzionale.',
    primaryLabel: 'Apri le revisioni',
    primaryTab: 'revisione',
  },
  amministratore: {
    title: 'Integrità e accesso al sistema',
    summary: 'Il ruolo tecnico non attribuisce autorità sul curricolo. Le attività curricolari restano consultabili solo nei limiti previsti.',
    primaryLabel: 'Apri il curricolo',
    primaryTab: 'curricolo',
  },
};

const JOURNEY = [
  { number: 1, icon: Layers, title: 'Contesto', text: 'Materia, ordine, anno e stato.', tab: 'curricolo' },
  { number: 2, icon: BookOpenCheck, title: 'Fonti', text: 'Provenienza, versione e verifica.', tab: 'fonti' },
  { number: 3, icon: RotateCcw, title: 'Revisione', text: 'Proposta, evidenze e confronto.', tab: 'revisione' },
  { number: 4, icon: ShieldCheck, title: 'Decisione', text: 'Solo con autorità verificata.', tab: 'revisione' },
] as const;

const toInstitutionalRole = (role: UserRole): InstitutionalRole =>
  role === 'insegnante' ? 'docente' : role;

const queueLabel = (item: ArenaProjectedWorkItem): string => {
  if (item.queueState === 'TO_VERIFY') return 'Da verificare';
  if (item.queueState === 'TO_REVIEW') return 'Da esaminare';
  if (item.queueState === 'TO_DECIDE') return 'Da decidere';
  return 'Da leggere';
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

  if (unverifiedSources.length > 0) {
    seeds.push({
      id: 'home-source-verification',
      processId: 'P1_SOURCE_QUALIFICATION',
      title: unverifiedSources.length === 1 ? '1 fonte locale da verificare' : `${unverifiedSources.length} fonti locali da verificare`,
      reason: 'Le fonti sono già consultabili, ma la verifica locale deve restare esplicita prima dell’eventuale uso come evidenza.',
      queueState: 'TO_VERIFY',
      evidenceState: 'NOT_REQUIRED',
      requiredCapability: 'CURRICULUM_READ',
      nextActionLabel: 'Controlla le fonti',
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
      title: pendingProposals.length === 1 ? '1 proposta ancora aperta' : `${pendingProposals.length} proposte ancora aperte`,
      reason: 'Queste proposte non hanno ancora un esito locale registrato e richiedono il passaggio di revisione previsto dal processo.',
      queueState: 'TO_REVIEW',
      evidenceState: 'NOT_REQUIRED',
      requiredCapability: 'REVISION_REVIEW',
      nextActionLabel: 'Rivedi le proposte',
      nextActorRole: 'dipartimento',
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

      {item.effectiveBlocker && (
        <p className="mt-2 rounded-lg bg-white px-3 py-2 text-xs font-semibold leading-5 text-amber-800">{item.effectiveBlocker}</p>
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
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6" aria-labelledby="beta-home-title">
        <span className="text-xs font-bold text-indigo-700">Il mio lavoro</span>
        <h1 id="beta-home-title" className="mt-1 text-xl font-extrabold leading-tight text-slate-900 sm:text-2xl">{orientation.title}</h1>
        <p className="mt-2 max-w-[68ch] text-sm leading-relaxed text-slate-600">{orientation.summary}</p>
        <p className="mt-2 text-xs leading-5 text-slate-500">Il ruolo selezionato orienta ciò che vedi. L’autorità istituzionale non è verificata da questo selettore e richiede una membership autenticata.</p>
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
            <p className="mt-1 text-xs leading-5 text-slate-500">Solo attività rilevate nello stato reale di Arena e compatibili con il ruolo corrente.</p>
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
            <p className="text-sm font-bold text-slate-800">Nessuna attività azionabile rilevata adesso.</p>
            <p className="mt-1 text-xs leading-5 text-slate-600">Arena non crea attività artificiali per riempire la Home. Puoi comunque entrare nell’area principale del tuo ruolo.</p>
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
              <h2 id="home-readonly-title" className="text-base font-extrabold text-slate-900">Da seguire</h2>
              <p className="mt-1 text-xs leading-5 text-slate-500">Elementi utili da conoscere, ma non azionabili con il ruolo e il livello di autorità correnti.</p>
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

      <details className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5" data-hcm-secondary-content>
        <summary className="cursor-pointer text-sm font-extrabold text-slate-800">Come funziona il processo</summary>
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
        <p className="mt-3 border-t border-slate-100 pt-3 text-xs leading-5 text-slate-600">Preparare una proposta non significa approvarla. Una decisione ufficiale richiede identità, membership e autorità verificate.</p>
      </details>

      <section className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4" aria-labelledby="handoff-title">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-700" aria-hidden="true">
            <FileText className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 id="handoff-title" className="text-sm font-extrabold text-slate-900">Documenti e passaggio successivo</h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">Prepara un documento o un handoff controllato. Un normale export non viene trattato come prova di un handoff validato.</p>
            <button type="button" onClick={() => props.handleTabSwitch('esportazioni')} className="mt-3 rounded-xl border border-emerald-200 bg-white px-4 py-2.5 text-sm font-bold text-emerald-800 hover:bg-emerald-50">Apri documenti</button>
          </div>
        </div>
      </section>
    </div>
  );
}