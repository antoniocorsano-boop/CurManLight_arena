import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import type { UdaModel } from '../types/curriculum';
import { useCurriculumStore } from '../store/useCurriculumStore';
import { useCurriculumAiHandlers } from '../features/curriculum/hooks/useCurriculumAiHandlers';
import { useKnowledgeBaseHandlers } from '../features/documents/hooks/useKnowledgeBaseHandlers';
import { useWikiGlossaryHandlers } from '../features/documents/hooks/useWikiGlossaryHandlers';
import { useWorkspaceSyncHandlers } from '../features/workspace/hooks/useWorkspaceSyncHandlers';

const showToast = vi.fn();

const createUda = (): UdaModel => ({
 id: 'uda-1',
 title: 'UDA Energia',
 discipline: 'italiano',
 order: 'primaria',
 targetClass: '5',
 targetSection: 'A',
 period: 'Ottobre',
 hours: 8,
 status: 'bozza',
 selectedTraguardi: [],
 selectedObiettivi: [],
 selectedEvidenze: [],
 realTask: '',
 coAuthors: '',
 notes: '',
 createdAt: new Date().toISOString(),
 updatedAt: new Date().toISOString(),
});

function CurriculumHarness() {
 const state = useCurriculumStore();
 const [importTopicInput, setImportTopicInput] = useState('');
 const [isGeneratingKB, setIsGeneratingKB] = useState(false);
 const [generatedKBOuput, setGeneratedKBOuput] = useState<{ traguardi: string[]; obiettivi: string[]; evidenze: string[] } | null>(null);
 const [popolamentoTab, setPopolamentoTab] = useState<'copilot' | 'csv' | 'security'>('copilot');
 const [showAgentSetupModal, setShowAgentSetupModal] = useState(false);
 const [localAgentStatus] = useState('installed');
 const [localAgentSize] = useState('light');
 const [targetClass, setTargetClass] = useState('');
 const [targetSection, setTargetSection] = useState('');
 const [progettazioneMode, setProgettazioneMode] = useState<'grid' | 'wizard'>('grid');
 const [wizardStep, setWizardStep] = useState(0);
 const [progTitle, setProgTitle] = useState('');
 const [progPeriod, setProgPeriod] = useState('');
 const [progHours, setProgHours] = useState(0);
 const [progStatus, setProgStatus] = useState<'bozza' | 'in revisione' | 'pronta per confronto'>('bozza');
 const [progNotes, setProgNotes] = useState('');
 const [realTaskInput, setRealTaskInput] = useState('');
 const [progCoAuthors, setProgCoAuthors] = useState('');
 const [branchFocusHighlight, setBranchFocusHighlight] = useState(false);
 const [tepBannerVisible, setTepBannerVisible] = useState(false);
 const [tepBannerDismissed, setTepBannerDismissed] = useState(false);
 const [anticipatedFields, setAnticipatedFields] = useState<string[]>([]);

 const handlers = useCurriculumAiHandlers({
  discipline: state.discipline,
  order: state.order,
  localCurriculum: {},
  setLocalCurriculum: vi.fn(),
  importTopicInput,
  setImportTopicInput,
  isGeneratingKB,
  setIsGeneratingKB,
  generatedKBOuput,
  setGeneratedKBOuput,
  localAgentStatus,
  localAgentSize,
  popolamentoTab,
  setPopolamentoTab,
  setShowAgentSetupModal,
  showToast,
 });

 return (
  <div>
   <output aria-label="ai-output">{generatedKBOuput?.traguardi.join(', ') ?? ''}</output>
   <output aria-label="agent-modal">{showAgentSetupModal ? 'open' : 'closed'}</output>
   <button onClick={() => handlers.handleAiGenerateCurriculum()}>Genera</button>
   <button onClick={() => handlers.handleSaveGeneratedToKB()}>Salva generato</button>
   <button onClick={() => setTargetClass('5')}>Classe</button>
   <button onClick={() => setTargetSection('A')}>Sezione</button>
   <button onClick={() => setProgettazioneMode('wizard')}>Wizard</button>
   <button onClick={() => setWizardStep(1)}>Step</button>
   <button onClick={() => setProgTitle('Programmazione annuale')}>Titolo</button>
   <button onClick={() => setProgPeriod('Annuale')}>Periodo</button>
   <button onClick={() => setProgHours(66)}>Ore</button>
   <button onClick={() => setProgStatus('pronta per confronto')}>Stato</button>
   <button onClick={() => setProgNotes('Note')}>Note</button>
   <button onClick={() => setRealTaskInput('Mostra cooperativa sul ciclo dell acqua')}>Compito reale</button>
   <button onClick={() => setProgCoAuthors('Docente A')}>Coautori</button>
   <button onClick={() => setBranchFocusHighlight(!branchFocusHighlight)}>Focus</button>
   <button onClick={() => setTepBannerVisible(!tepBannerVisible)}>TEP</button>
   <button onClick={() => setTepBannerDismissed(!tepBannerDismissed)}>TEP dismiss</button>
   <button onClick={() => setAnticipatedFields(['title'])}>Anticipa</button>
   <output aria-label="curriculum-state">{JSON.stringify({ targetClass, targetSection, progettazioneMode, wizardStep, progTitle, progPeriod, progHours, progStatus, progNotes, realTaskInput, progCoAuthors, branchFocusHighlight, tepBannerVisible, tepBannerDismissed, anticipatedFields })}</output>
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
   <button onClick={() => { void knowledge.handleAddCustomKbDoc(); }}>Aggiungi documento</button>
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
  setIsWorkspaceLoggedIn: (value) => { setLoggedIn(value); onLoggedIn(value); },
  setWorkspaceAccessToken: (value) => { setToken(value); onToken(value); },
  setIsSyncingWorkspace: setSyncing,
  stateRef,
  showToast,
 });

 return (
  <div>
   <output aria-label="logged-in">{String(loggedIn)}</output>
   <output aria-label="token">{token}</output>
   <output aria-label="syncing">{String(syncing)}</output>
   <button onClick={() => { void handlers.handleWorkspaceSync(); }}>Sincronizza</button>
   <button onClick={() => handlers.handleWorkspaceLogout()}>Logout</button>
  </div>
 );
}

describe('CML603D interactions', () => {
 it('keeps curriculum AI actions reachable', async () => {
  const user = userEvent.setup();
  render(<CurriculumHarness />);
  await user.click(screen.getByRole('button', { name: 'Genera' }));
  expect(screen.getByLabelText('agent-modal')).toBeInTheDocument();
 });

 it('adds a local knowledge document and keeps it queryable', async () => {
  const user = userEvent.setup();
  render(<KnowledgeHarness />);
  await user.click(screen.getByRole('button', { name: 'Prepara documento' }));
  await user.click(screen.getByRole('button', { name: 'Aggiungi documento' }));
  await user.click(screen.getByRole('button', { name: 'Query documento' }));
  await waitFor(() => expect(screen.getByLabelText('wiki-response').textContent).not.toBe(''));
 });

 it('keeps workspace sync/logout actions reachable', async () => {
  const onLoggedIn = vi.fn();
  const onToken = vi.fn();
  const user = userEvent.setup();
  render(<WorkspaceHarness onLoggedIn={onLoggedIn} onToken={onToken} />);
  await user.click(screen.getByRole('button', { name: 'Logout' }));
  expect(onLoggedIn).toHaveBeenCalledWith(false);
  expect(onToken).toHaveBeenCalledWith('');
 });
});
