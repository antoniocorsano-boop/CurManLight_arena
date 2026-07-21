import { useRef, useState } from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useAppNavigation } from '../features/navigation';
import { useOnboardingProfile } from '../features/session';
import { useUdaProgrammingHandlers } from '../features/progettazione';
import { useKnowledgeBaseHandlers } from '../features/documents';
import { useWikiGlossaryHandlers } from '../features/documents';
import { useWorkspaceSyncHandlers } from '../features/workspace';
import { useDocumentExportHandlers } from '../features/documents';
import { useBackupHandlers } from '../features/documents';
import type { CurriculumMap } from '../features/session';
import type { DecisionStatus, SchoolOrder, UdaModel, UserRole, UserState } from '../types/curriculum';

const showToast = vi.fn<(msg: string, success?: boolean) => void>();

const createCurriculum = (): CurriculumMap => {
 const level = {
  traguardi: ['Comprendere e produrre testi regolativi'],
  obiettivi: ['Organizzare informazioni in modo coerente'],
  evidenze: ['Argomenta scelte e procedure'],
  proposals: []
 };

 return {
  italiano: {
   infanzia: { ...level },
   primaria: { ...level },
   secondaria: { ...level }
  },
  scienze: {
   infanzia: { ...level },
   primaria: { ...level },
   secondaria: { ...level }
  }
 };
};

const createUda = (overrides: Partial<UdaModel> = {}): UdaModel => ({
 id: 'uda-1',
 title: 'UDA acqua e territorio',
 discipline: 'italiano',
 order: 'primaria',
 period: 'Primo Quadrimestre',
 hours: 12,
 status: 'bozza',
 traguardi: ['Comprendere testi'],
 obiettivi: ['Organizzare informazioni'],
 evidenze: ['Argomenta'],
 realTask: 'Presentazione cooperativa',
 notes: 'Note didattiche',
 createdAt: '20/07/2026',
 ...overrides
});

beforeEach(() => {
 localStorage.clear();
 showToast.mockClear();
 vi.restoreAllMocks();
 vi.unstubAllGlobals();
 Object.defineProperty(window, 'scrollTo', {
  value: vi.fn(),
  configurable: true
 });
});

afterEach(() => {
 vi.useRealTimers();
 vi.restoreAllMocks();
 vi.unstubAllGlobals();
 localStorage.clear();
});

function installDownloadMocks() {
 Object.defineProperty(URL, 'createObjectURL', {
  value: vi.fn(() => 'blob:curmanlight-test'),
  configurable: true
 });
 return vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
}

function NavigationExportImportHarness({
 onDecision,
 onCustomText
}: {
 onDecision: (id: string, status: DecisionStatus) => void;
 onCustomText: (id: string, text: string) => void;
}) {
 const [activeProgTab, setActiveProgTab] = useState<UserState['activeProgTab']>('home');
 const navigation = useAppNavigation({
  secondBrainTab: 'brain',
  activeGeneralSubtab: 'premessa',
  activeProgTab,
  activeProcessoTab: 'flusso',
  wikiWorkspaceTab: 'read'
 });
 const exportHandlers = useDocumentExportHandlers({
  localCurriculum: createCurriculum(),
  decisions: { 'p-1': 'approved' },
  customTexts: { 'p-1': 'Testo approvato' },
  schoolYear: '2026-2027',
  discipline: 'italiano',
  order: 'primaria',
  role: 'insegnante',
  selectedTraguardi: [0],
  selectedObiettivi: [0],
  selectedEvidenze: ['Argomenta'],
  savedUda: [createUda()],
  targetClass: '2',
  targetSection: 'A',
  showToast,
  getDisciplineLabel: (disc) => disc,
  setGeneratedDocTitle: vi.fn(),
  setGeneratedDocText: vi.fn()
 });
 const backupHandlers = useBackupHandlers({
  schoolYear: '2026-2027',
  setDecision: onDecision,
  setCustomText: onCustomText,
  restoreBackupState: vi.fn(),
  setShowSaveModal: vi.fn(),
  showToast
 });

 return (
  <div>
   <output aria-label="active-tab">{navigation.activeTab}</output>
   <output aria-label="active-prog">{activeProgTab}</output>
   <button onClick={() => navigation.handleTabSwitch('curricolo')}>Curricolo</button>
   <button onClick={() => setActiveProgTab('classe')}>Classe</button>
   <button onClick={() => {
    setActiveProgTab('uda');
    navigation.handleTabSwitch('progetta-annuale');
   }}>UDA</button>
   <button onClick={exportHandlers.handleDownloadCml}>Export CML</button>
   <input
    aria-label="Import CML"
    type="file"
    onChange={backupHandlers.handleImportMergeCml}
   />
  </div>
 );
}

function OnboardingNavigationHarness({
 onRole,
 onDiscipline,
 onOrder,
 onShow
}: {
 onRole: (role: UserRole) => void;
 onDiscipline: (discipline: string) => void;
 onOrder: (order: SchoolOrder) => void;
 onShow: (value: boolean) => void;
}) {
 const [order, setOrderState] = useState<SchoolOrder>('primaria');
 const onboarding = useOnboardingProfile({
  order,
  setRole: onRole,
  setDiscipline: onDiscipline,
  setOrder: (nextOrder) => {
   setOrderState(nextOrder);
   onOrder(nextOrder);
  },
  setShowOnboardingModal: onShow,
  showToast
 });
 const navigation = useAppNavigation({
  secondBrainTab: 'brain',
  activeGeneralSubtab: 'premessa',
  activeProgTab: 'home',
  activeProcessoTab: 'flusso',
  wikiWorkspaceTab: 'read'
 });

 return (
  <div>
   <output aria-label="active-tab">{navigation.activeTab}</output>
   <button onClick={() => onboarding.setOnboardingRoleLocal('referente')}>Ruolo referente</button>
   <button onClick={() => onboarding.setOnboardingDiscLocal('storia')}>Disciplina storia</button>
   <button onClick={() => onboarding.handleSetOnboardingOrdLocal('secondaria')}>Ordine secondaria</button>
   <button onClick={onboarding.saveOnboardingProfile}>Salva profilo</button>
   <button onClick={() => navigation.handleTabSwitch('curricolo')}>Navigazione iniziale</button>
  </div>
 );
}

function UdaWizardHarness({
 onAddUda,
 onActiveProgTab
}: {
 onAddUda: (uda: UdaModel) => void;
 onActiveProgTab: (tab: UserState['activeProgTab']) => void;
}) {
 const handlers = useUdaProgrammingHandlers({
  localCurriculum: createCurriculum(),
  discipline: 'italiano',
  order: 'primaria',
  schoolYear: '2026-2027',
  targetClass: '2',
  targetSection: 'A',
  selectedTraguardi: [0],
  selectedObiettivi: [0],
  selectedEvidenze: ['Argomenta scelte e procedure'],
  addUda: onAddUda,
  setActiveProgTab: onActiveProgTab,
  showToast
 });

 return (
  <div>
   <button onClick={() => handlers.setProgTitle('Acqua e territorio')}>Titolo UDA</button>
   <button onClick={() => handlers.setRealTaskInput('Mostra cooperativa sul ciclo dell acqua')}>Compito reale</button>
   <button onClick={handlers.handleGenerateUda}>Salva UDA</button>
  </div>
 );
}

function KnowledgeHarness() {
 const knowledge = useKnowledgeBaseHandlers({ showToast });
 const wiki = useWikiGlossaryHandlers({
  discipline: 'italiano',
  order: 'primaria',
  customKbDocs: knowledge.customKbDocs,
  getVolumeTitleWithCustom: knowledge.getVolumeTitleWithCustom,
  showToast
 });

 return (
  <div>
   <output aria-label="reader-title">{knowledge.getVolumeTitleWithCustom(knowledge.selectedBrainDoc)}</output>
   <output aria-label="wiki-response">{wiki.wikiResponse ?? ''}</output>
   <button onClick={() => {
    knowledge.setNewKbDocTitle('Regolamento Laboratori');
    knowledge.setNewKbDocSubtitle('Procedure interne');
    knowledge.setNewKbDocContent('I laboratori seguono procedure di sicurezza condivise.');
   }}>Prepara documento</button>
   <button onClick={knowledge.handleAddCustomKbDoc}>Aggiungi documento</button>
   <button onClick={() => wiki.triggerWikiLLMQuery('Regolamento Laboratori')}>Query documento</button>
  </div>
 );
}

function WorkspaceHarness({
 onLoggedIn,
 onToken
}: {
 onLoggedIn: (value: boolean) => void;
 onToken: (value: string) => void;
}) {
 const [loggedIn, setLoggedIn] = useState(true);
 const [token, setToken] = useState('token-test');
 const [syncing, setSyncing] = useState(false);
 const stateRef = useRef<{ savedUda: UdaModel[] }>({ savedUda: [createUda()] });
 const handlers = useWorkspaceSyncHandlers({
  isWorkspaceLoggedIn: loggedIn,
  workspaceAccessToken: token,
  cloudAccountType: 'scolastica',
  schoolYear: '2026-2027',
  localCurriculum: createCurriculum(),
  savedUda: [createUda()],
  decisions: { 'p-1': 'approved' },
  customTexts: { 'p-1': 'Testo approvato' },
  role: 'insegnante',
  discipline: 'italiano',
  order: 'primaria',
  stateRef,
  restoreBackupState: vi.fn(),
  setIsSyncingWorkspace: setSyncing,
  setCloudAccountType: vi.fn(),
  setShowCloudAccountModal: vi.fn(),
  setIsWorkspaceLoggedIn: (value) => {
   setLoggedIn(value);
   onLoggedIn(value);
  },
  setWorkspaceAccessToken: (value) => {
   setToken(value);
   onToken(value);
  },
  setWorkspaceUserEmail: vi.fn(),
  setIsWorkspaceSyncLocked: vi.fn(),
  showToast
 });

 return (
  <div>
   <output aria-label="login-state">{loggedIn ? 'logged-in' : 'logged-out'}</output>
   <output aria-label="sync-state">{syncing ? 'syncing' : 'idle'}</output>
   <button onClick={handlers.handleWorkspaceSync}>Sync manuale</button>
   <button onClick={handlers.handleWorkspaceLogout}>Logout</button>
  </div>
 );
}

describe('CML-603D TS-001 interaction flows', () => {
 it('covers Home -> Curricolo -> Classe -> UDA -> Export -> Import without real network', async () => {
  const user = userEvent.setup();
  const clickSpy = installDownloadMocks();
  const onDecision = vi.fn<(id: string, status: DecisionStatus) => void>();
  const onCustomText = vi.fn<(id: string, text: string) => void>();
  render(<NavigationExportImportHarness onDecision={onDecision} onCustomText={onCustomText} />);

  expect(screen.getByLabelText('active-tab')).toHaveTextContent('dashboard');
  await user.click(screen.getByRole('button', { name: 'Curricolo' }));
  expect(screen.getByLabelText('active-tab')).toHaveTextContent('curricolo');
  await user.click(screen.getByRole('button', { name: 'Classe' }));
  expect(screen.getByLabelText('active-prog')).toHaveTextContent('classe');
  await user.click(screen.getByRole('button', { name: 'UDA' }));
  expect(screen.getByLabelText('active-tab')).toHaveTextContent('progetta-annuale');
  expect(screen.getByLabelText('active-prog')).toHaveTextContent('uda');

  await user.click(screen.getByRole('button', { name: 'Export CML' }));
  expect(clickSpy).toHaveBeenCalled();

  const cmlFile = new File([
   JSON.stringify({
    format: 'CML-LIGHT-EXPORT',
    decisions: { 'p-2': 'approved' },
    customTexts: { 'p-2': 'Decisione importata' }
   })
  ], 'proposta.cml', { type: 'application/json' });
  fireEvent.change(screen.getByLabelText('Import CML'), { target: { files: [cmlFile] } });

  await waitFor(() => {
   expect(onDecision).toHaveBeenCalledWith('p-2', 'approved');
   expect(onCustomText).toHaveBeenCalledWith('p-2', 'Decisione importata');
  });
 });

 it('covers onboarding profile choice and initial navigation', async () => {
  const user = userEvent.setup();
  const onRole = vi.fn<(role: UserRole) => void>();
  const onDiscipline = vi.fn<(discipline: string) => void>();
  const onOrder = vi.fn<(order: SchoolOrder) => void>();
  const onShow = vi.fn<(value: boolean) => void>();
  render(<OnboardingNavigationHarness onRole={onRole} onDiscipline={onDiscipline} onOrder={onOrder} onShow={onShow} />);

  await user.click(screen.getByRole('button', { name: 'Ruolo referente' }));
  await user.click(screen.getByRole('button', { name: 'Disciplina storia' }));
  await user.click(screen.getByRole('button', { name: 'Ordine secondaria' }));
  await user.click(screen.getByRole('button', { name: 'Salva profilo' }));
  await user.click(screen.getByRole('button', { name: 'Navigazione iniziale' }));

  expect(onRole).toHaveBeenCalledWith('referente');
  expect(onDiscipline).toHaveBeenCalledWith('storia');
  expect(onOrder).toHaveBeenCalledWith('secondaria');
  expect(onShow).toHaveBeenCalledWith(false);
  expect(screen.getByLabelText('active-tab')).toHaveTextContent('curricolo');
 });

 it('covers Progettazione -> wizard -> salvataggio UDA', async () => {
  const user = userEvent.setup();
  const onAddUda = vi.fn<(uda: UdaModel) => void>();
  const onActiveProgTab = vi.fn<(tab: UserState['activeProgTab']) => void>();
  render(<UdaWizardHarness onAddUda={onAddUda} onActiveProgTab={onActiveProgTab} />);

  await user.click(screen.getByRole('button', { name: 'Titolo UDA' }));
  await user.click(screen.getByRole('button', { name: 'Compito reale' }));
  await user.click(screen.getByRole('button', { name: 'Salva UDA' }));

  expect(onAddUda).toHaveBeenCalledWith(expect.objectContaining({
   title: 'Acqua e territorio (Target: 2^A)',
   discipline: 'italiano',
   order: 'primaria',
   evidenze: ['Argomenta scelte e procedure'],
   realTask: 'Mostra cooperativa sul ciclo dell acqua'
  }));
  expect(onActiveProgTab).toHaveBeenCalledWith('uda');
 });

 it('covers Knowledge -> custom doc -> query -> reader without network', async () => {
  vi.useFakeTimers();
  render(<KnowledgeHarness />);

  fireEvent.click(screen.getByRole('button', { name: 'Prepara documento' }));
  fireEvent.click(screen.getByRole('button', { name: 'Aggiungi documento' }));
  expect(localStorage.getItem('curman_customKbDocs')).toContain('Regolamento Laboratori');

  fireEvent.click(screen.getByRole('button', { name: 'Query documento' }));
  await act(async () => {
   vi.advanceTimersByTime(1500);
  });

  expect(screen.getByLabelText('wiki-response')).toHaveTextContent('Regolamento Laboratori');
  expect(showToast).toHaveBeenCalledWith('Risposta WikiLLM generata!');
 });

 it('covers Workspace -> login state -> sync manuale -> logout with mocked network boundary', async () => {
  const user = userEvent.setup();
  const fetchMock = vi.fn<typeof fetch>();
  fetchMock
   .mockResolvedValueOnce({ ok: true, json: async () => ({ files: [] }) } as Response)
   .mockResolvedValueOnce({ ok: true, json: async () => ({ id: 'drive-file-1' }) } as Response);
  vi.stubGlobal('fetch', fetchMock);
  vi.spyOn(window, 'confirm').mockReturnValue(true);
  const onLoggedIn = vi.fn<(value: boolean) => void>();
  const onToken = vi.fn<(value: string) => void>();
  render(<WorkspaceHarness onLoggedIn={onLoggedIn} onToken={onToken} />);

  expect(screen.getByLabelText('login-state')).toHaveTextContent('logged-in');
  await user.click(screen.getByRole('button', { name: 'Sync manuale' }));

  await waitFor(() => {
   expect(fetchMock).toHaveBeenCalledTimes(2);
   expect(showToast).toHaveBeenCalledWith(expect.stringContaining('Copia di Sicurezza sincronizzata'), true);
  });

  await user.click(screen.getByRole('button', { name: 'Logout' }));

  expect(onLoggedIn).toHaveBeenCalledWith(false);
  expect(onToken).toHaveBeenCalledWith('');
  expect(localStorage.getItem('curman_isWorkspaceLoggedIn')).toBe('false');
  expect(screen.getByLabelText('login-state')).toHaveTextContent('logged-out');
 });
});
