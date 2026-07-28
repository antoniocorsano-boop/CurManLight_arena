import { act, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { createJSONStorage } from 'zustand/middleware';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  INSTITUTIONAL_ARCHIVE_SCHEMA_VERSION,
  addAcademicYear,
  addInstitute,
  addInstituteSite,
  confirmInstitute,
  createAcademicYear,
  createEmptyInstitutionalArchive,
  createInstituteDraft,
  createInstituteSite,
  createInstitutionalContext,
  getA07InstitutionalDocumentRead,
  instituteReference,
  projectA07InstitutionalDocumentHeader,
  setActiveAcademicYear,
  setActiveInstitute,
  setInstitutionalContext,
} from '../domain/institution';
import {
  CURRICULUM_SCHEMA_VERSION,
  CURRICULUM_STORES,
  createCurriculumDatabase,
} from '../domain/curriculum/persistence';
import { useBackupHandlers, useDocumentExportHandlers, useTemplateEngine, useUdaPackageHandlers } from '../features/documents';
import { EsportazioniTab, type EsportazioniTabProps } from '../features/documents/components/EsportazioniTab';
import { CertificazioneTab } from '../features/progettazione/components/CertificazioneTab';
import { UdaDetailModal } from '../features/progettazione/components/UdaModals';
import { useUdaProgrammingHandlers } from '../features/progettazione';
import type { CurriculumMap } from '../features/session';
import { InstitutionConfigPanel } from '../features/session/components/InstitutionConfigPanel';
import { DocumentViewModal, SaveSettingsModal } from '../features/session/components/SessionModals';
import documentExportSource from '../features/documents/hooks/useDocumentExportHandlers.ts?raw';
import udaPackageSource from '../features/documents/hooks/useUdaPackageHandlers.ts?raw';
import templateEngineSource from '../features/documents/hooks/useTemplateEngine.ts?raw';
import exportTabSource from '../features/documents/components/EsportazioniTab.tsx?raw';
import sessionModalsSource from '../features/session/components/SessionModals.tsx?raw';
import udaModalsSource from '../features/progettazione/components/UdaModals.tsx?raw';
import { useSessionAutoSave, useWorkspaceSyncHandlers } from '../features/workspace';
import { useCurriculumStore } from '../store/useCurriculumStore';
import { UiConfirmDialog } from '../ui/components/UiConfirmDialog';

const NOW = '2026-07-27T10:00:00.000Z';
const A07_AUTHORITY_WORDING = /\bd['’]istituto\b|sovran|adozion|deliberat|finalizzat|ufficial|approvat|validat[oa]|autorità|di rito|conform[ei] al PTOF/iu;
const A07_SOURCE_AUTHORITY_WORDING = /\bd['’]istituto\b|sovran|adozion|deliberat|finalizzat|ufficial|autorità|di rito|APPROVATO 2025|Approvata Integrazione|VALIDATO ED/iu;
const originalStorage = useCurriculumStore.persist.getOptions().storage;

function configuredArchive() {
  const institute = createInstituteDraft({ name: 'Istituto Locale', schoolOrders: ['primaria'] }, NOW);
  let archive = addInstitute(createEmptyInstitutionalArchive(NOW), institute, NOW).archive!;
  archive = confirmInstitute(archive, institute.id, NOW).archive!;
  return setActiveInstitute(archive, institute.id, NOW).archive!;
}

function configuredA04Archive(name = 'Istituto Galileo', yearLabel = '2027/2028', declaredRole?: 'docente') {
  const startYear = Number(yearLabel.slice(0, 4));
  const institute = createInstituteDraft({
    name,
    mechanicalCode: 'RMIC123456',
    schoolOrders: ['secondaria'],
    documentProfile: {
      heading: 'Intestazione Galileo',
      subheading: 'Polo formativo locale',
      footer: 'Contatti configurati localmente',
      generalReferences: 'Riferimenti interni configurati',
    },
  }, NOW);
  let archive = addInstitute(createEmptyInstitutionalArchive(NOW), institute, NOW).archive!;
  const site = createInstituteSite({
    instituteRef: instituteReference(institute),
    name: 'Sede Centro',
    isMain: true,
    address: { street: 'Via Roma 1', city: 'Roma', province: 'RM', postalCode: '00100' },
  }, NOW);
  archive = addInstituteSite(archive, site, NOW).archive!;
  const year = createAcademicYear({
    instituteRef: instituteReference(institute),
    label: yearLabel,
    startsOn: `${startYear}-09-01`,
    endsOn: `${startYear + 1}-08-31`,
    status: 'planned',
  }, NOW);
  archive = addAcademicYear(archive, year, NOW).archive!;
  archive = confirmInstitute(archive, institute.id, NOW).archive!;
  archive = setActiveInstitute(archive, institute.id, NOW).archive!;
  archive = setActiveAcademicYear(archive, institute.id, year.id, NOW).archive!;
  const context = createInstitutionalContext({
    instituteRef: instituteReference(institute),
    academicYearRef: { id: year.id, entityType: 'academic-year', snapshotLabel: year.label },
    siteRef: { id: site.id, entityType: 'institute-site', snapshotLabel: site.name },
    declaredActor: declaredRole ? { displayName: 'Persona locale', role: declaredRole, assertion: 'self-declared' } : undefined,
  }, NOW);
  return setInstitutionalContext(archive, context, NOW).archive!;
}

const a04Curriculum: CurriculumMap = {
  italiano: {
    primaria: { traguardi: ['Traguardo primaria'], obiettivi: ['Obiettivo primaria'], evidenze: [], proposals: [] },
    secondaria: { traguardi: ['Traguardo secondaria'], obiettivi: ['Obiettivo secondaria'], evidenze: [], proposals: [] },
  },
} as unknown as CurriculumMap;

function A04PreviewHarness({ onAddUda = vi.fn(), showToast = vi.fn() }) {
  const handlers = useUdaProgrammingHandlers({
    localCurriculum: a04Curriculum,
    discipline: 'italiano',
    order: 'primaria',
    schoolYear: '2025-2026',
    targetClass: '2',
    targetSection: 'A',
    selectedTraguardi: [0],
    selectedObiettivi: [0],
    selectedEvidenze: [],
    addUda: onAddUda,
    setActiveProgTab: vi.fn(),
    showToast,
  });
  return (
    <div>
      <output aria-label="Anteprima A04">{handlers.compileProgPreviewText()}</output>
      <button onClick={handlers.handleGenerateUda}>Genera A04</button>
    </div>
  );
}

function renderCertificationTab() {
  return render(<CertificazioneTab
    localCurriculum={a04Curriculum}
    discipline="italiano"
    selectedTraguardi={[]}
    selectedEvidenze={[]}
    activeCompetencyExplorer={null}
    setActiveCompetencyExplorer={vi.fn()}
    showToast={vi.fn()}
    handleLoadSuggestedUda={vi.fn()}
    getDisciplineIcon={() => ''}
    getDisciplineLabel={value => value}
  />);
}

function renderInstitutionPanel(onExportBackup = vi.fn(), onExportError = vi.fn()) {
  return render(<InstitutionConfigPanel onExportBackup={onExportBackup} onExportError={onExportError} />);
}

function validBackup(archive = configuredArchive()) {
  return {
    role: 'insegnante' as const,
    discipline: 'italiano',
    order: 'primaria' as const,
    schoolYear: '2026-2027',
    decisions: { decisione: 'approved' as const },
    customTexts: {},
    savedUda: [],
    activeRevisionFilter: 'all' as const,
    selectedTraguardi: [],
    selectedObiettivi: [],
    selectedEvidenze: [],
    activeProgTab: 'annuale' as const,
    activeCurricoloView: 'albero' as const,
    activeProcessoTab: 'flusso' as const,
    activeGeneralSubtab: 'premessa' as const,
    documentExportHistory: [],
    institutionalArchive: archive,
  };
}

function readBlob(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(blob);
  });
}

const sampleUda = {
  id: 'uda-a07', title: 'Acqua e territorio', discipline: 'italiano', order: 'secondaria' as const,
  period: 'Primo Quadrimestre', hours: 12, status: 'bozza' as const,
  traguardi: ['Comprendere testi'], obiettivi: ['Organizzare informazioni'], evidenze: ['Argomenta'],
  realTask: 'Presentazione cooperativa', notes: 'Note didattiche', createdAt: '2026-07-27',
};

function documentExportArgs(profile = getA07InstitutionalDocumentRead(createEmptyInstitutionalArchive(NOW))) {
  return {
    localCurriculum: a04Curriculum,
    decisions: {}, customTexts: {}, schoolYear: '2025-2026', discipline: 'italiano', order: 'secondaria' as const,
    role: 'insegnante' as const, selectedTraguardi: [0], selectedObiettivi: [0], selectedEvidenze: [],
    savedUda: [sampleUda], targetClass: '3', targetSection: 'A', showToast: vi.fn(),
    getDisciplineLabel: (value: string) => value,
    setGeneratedDocTitle: vi.fn(), setGeneratedDocText: vi.fn(), institutionalProfile: profile,
  };
}

function exportTabProps(profile = getA07InstitutionalDocumentRead(createEmptyInstitutionalArchive(NOW))): EsportazioniTabProps {
  const noop = vi.fn();
  return {
    esportazioniTab: 'template', setEsportazioniTab: noop, templateDocType: 'relazione', setTemplateDocType: noop,
    templateJsonState: {
      fontFamily: 'Arial', fontSize: '11pt', lineHeight: '1.5', showMinisterialHeader: true,
      logoLeft: '', logoRight: '', margins: 'Normali (2cm)', sections: [], leftSignee: '', rightSignee: '',
    },
    setTemplateJsonState: noop, templateChatInput: '', setTemplateChatInput: noop, templateChatHistory: [],
    handleSendTemplateInstruction: noop, handleDownloadWordDefinitivo: noop, handleDownloadWordDocx: noop,
    handleDownloadODF: noop, handleDownloadCurricoloPDF: noop, handleCopyToClipboardFormatted: noop,
    handleDownloadTxt: noop, handleDownloadCml: noop, handleDownloadWordConfronto: noop,
    handleDownloadRichMarkdown: noop, handleDownloadPdfDirect: noop, handleClearLocalStorageWithReset: noop,
    handleGenerateProgrammazioneAnnualeDoc: noop, handleGenerateRelazioneDoc: noop,
    handleGenerateSpecificoGradoDoc: noop, targetClass: '3', targetSection: 'A', showToast: noop,
    documentExportHistory: [], clearDocumentExportHistory: noop, institutionalProfile: profile,
    resetTemplateState: noop,
  };
}

async function restoreDownloadableBackup(payload: unknown, showToast = vi.fn()) {
  const setShowSaveModal = vi.fn();
  const { result } = renderHook(() => useBackupHandlers({
    schoolYear: '2026-2027',
    setDecision: useCurriculumStore.getState().setDecision,
    setCustomText: useCurriculumStore.getState().setCustomText,
    restoreBackupState: useCurriculumStore.getState().restoreBackupState,
    setShowSaveModal,
    showToast,
  }));
  const file = new File([JSON.stringify(payload)], 'backup.json', { type: 'application/json' });

  act(() => result.current.handleRestoreBackup({ target: { files: [file] } } as never));
  await waitFor(() => expect(showToast).toHaveBeenCalled());
  return { setShowSaveModal, showToast };
}

function renderEmergencyRestore(showToast = vi.fn()) {
  const hook = renderHook(() => useSessionAutoSave({
    localCurriculum: {} as CurriculumMap,
    savedUda: [],
    decisions: {},
    customTexts: {},
    schoolYear: '2026-2027',
    role: 'insegnante',
    discipline: 'italiano',
    order: 'primaria',
    institutionalArchive: useCurriculumStore.getState().institutionalArchive,
    isWorkspaceLoggedIn: false,
    workspaceAccessToken: '',
    isWorkspaceSyncLocked: false,
    restoreBackupState: useCurriculumStore.getState().restoreBackupState,
    showToast,
  }));
  return { ...hook, showToast };
}

function SaveSettingsModalHarness() {
  const [show, setShow] = useState(false);
  const noop = vi.fn();
  return (
    <>
      <button onClick={() => setShow(true)}>Apri impostazioni</button>
      <SaveSettingsModal
        showSaveModal={show}
        setShowSaveModal={setShow}
        setShowOnboardingModal={noop}
        setShowCloudAccountModal={noop}
        setShowAgentSetupModal={noop}
        saveProgDraft={noop}
        handleDownloadBackup={noop}
        handleRestoreBackup={noop}
        handleClearLocalStorageWithReset={noop}
        isWorkspaceLoggedIn={false}
        workspaceClientId=""
        setWorkspaceClientId={noop}
        safeLocalStorageSetItem={noop}
        showToast={noop}
        isSyncingWorkspace={false}
        handleWorkspaceSync={noop}
        handleWorkspaceLogout={noop}
        handleWorkspaceLogin={noop}
        workspaceUserEmail=""
        handleRestoreFromLocalEmergencyStorage={noop}
        setShowMottoModal={noop}
        triggerPwaInstall={noop}
      />
    </>
  );
}

beforeEach(() => {
  localStorage.clear();
  useCurriculumStore.persist.setOptions({ storage: createJSONStorage(() => localStorage) });
  useCurriculumStore.setState(useCurriculumStore.getInitialState(), true);
});

afterEach(() => {
  useCurriculumStore.persist.setOptions({ storage: originalStorage });
  vi.restoreAllMocks();
  localStorage.clear();
});

describe('CML-633D Task 6 institutional integration', () => {
  it('starts with one neutral, unconfigured institutional archive', () => {
    expect(useCurriculumStore.getState().institutionalArchive).toMatchObject({
      schemaVersion: INSTITUTIONAL_ARCHIVE_SCHEMA_VERSION,
      institutes: [],
      academicYears: [],
      sites: [],
      contexts: [],
    });
    expect(useCurriculumStore.getState().institutionalArchive.activeInstituteRef).toBeUndefined();
  });

  it('atomically replaces the archive in the same persisted state record', async () => {
    const storage = {
      getItem: vi.fn(async () => null),
      setItem: vi.fn(async (_name: string, _value: string) => undefined),
      removeItem: vi.fn(async () => undefined),
    };
    useCurriculumStore.persist.setOptions({ storage: createJSONStorage(() => storage) });
    useCurriculumStore.setState({ decisions: { existing: 'approved' } });
    await waitFor(() => expect(storage.setItem).toHaveBeenCalled());
    storage.setItem.mockClear();
    const archive = configuredArchive();

    act(() => useCurriculumStore.getState().replaceInstitutionalArchive(archive));

    expect(useCurriculumStore.getState().institutionalArchive).toEqual(archive);
    await waitFor(() => expect(storage.setItem).toHaveBeenCalledTimes(1));
    const persisted = JSON.parse(storage.setItem.mock.calls[0][1]);
    expect(persisted.state.institutionalArchive).toEqual(archive);
    expect(persisted.state.decisions).toEqual({ existing: 'approved' });
  });

  it('hydrates persisted payloads that predate the archive as neutral', async () => {
    const oldPayload = { state: { ...validBackup(), institutionalArchive: undefined }, version: 0 };
    delete (oldPayload.state as { institutionalArchive?: unknown }).institutionalArchive;
    const storage = {
      getItem: vi.fn(async () => JSON.stringify(oldPayload)),
      setItem: vi.fn(async () => undefined),
      removeItem: vi.fn(async () => undefined),
    };
    useCurriculumStore.persist.setOptions({ storage: createJSONStorage(() => storage) });
    useCurriculumStore.setState({ institutionalArchive: configuredArchive() });

    await useCurriculumStore.persist.rehydrate();

    expect(useCurriculumStore.getState().institutionalArchive.institutes).toEqual([]);
    expect(useCurriculumStore.getState().institutionalArchive.activeInstituteRef).toBeUndefined();
  });

  it('ignores action and unknown keys in persisted and restored payloads', async () => {
    const originalReplace = useCurriculumStore.getState().replaceInstitutionalArchive;
    const originalReset = useCurriculumStore.getState().resetAll;
    const storage = {
      getItem: vi.fn(async () => JSON.stringify({
        state: {
          ...validBackup(),
          replaceInstitutionalArchive: 'persisted attack',
          resetAll: 'persisted attack',
          unknownStateKey: 'ignored',
        },
        version: 0,
      })),
      setItem: vi.fn(async () => undefined),
      removeItem: vi.fn(async () => undefined),
    };
    useCurriculumStore.persist.setOptions({ storage: createJSONStorage(() => storage) });

    await useCurriculumStore.persist.rehydrate();

    expect(useCurriculumStore.getState().replaceInstitutionalArchive).toBe(originalReplace);
    expect(useCurriculumStore.getState().resetAll).toBe(originalReset);
    expect((useCurriculumStore.getState() as unknown as Record<string, unknown>).unknownStateKey).toBeUndefined();

    const result = useCurriculumStore.getState().restoreBackupState({
      ...validBackup(),
      replaceInstitutionalArchive: () => undefined,
      resetAll: () => undefined,
      unknownStateKey: true,
    } as never);

    expect(result.success).toBe(true);
    expect(useCurriculumStore.getState().replaceInstitutionalArchive).toBe(originalReplace);
    expect(useCurriculumStore.getState().resetAll).toBe(originalReset);
    expect((useCurriculumStore.getState() as unknown as Record<string, unknown>).unknownStateKey).toBeUndefined();
  });

  it.each([
    ['malformed', (archive: ReturnType<typeof configuredArchive>) => ({ ...archive, contexts: null })],
    ['future', (archive: ReturnType<typeof configuredArchive>) => ({ ...archive, schemaVersion: INSTITUTIONAL_ARCHIVE_SCHEMA_VERSION + 1 })],
  ])('returns a controlled failure for a %s archive without mutation', (_label, makeInvalid) => {
    const archive = configuredArchive();
    act(() => useCurriculumStore.setState({ institutionalArchive: archive, decisions: { current: 'approved' } }));

    const result = useCurriculumStore.getState().restoreBackupState({
      ...validBackup(),
      decisions: { incoming: 'rejected' },
      institutionalArchive: makeInvalid(archive),
    } as never);

    expect(result).toMatchObject({ success: false, error: 'invalid-institutional-archive' });
    expect(useCurriculumStore.getState().institutionalArchive).toEqual(archive);
    expect(useCurriculumStore.getState().decisions).toEqual({ current: 'approved' });
  });

  it('includes the archive in emergency and downloadable backups and round-trips it', async () => {
    const archive = configuredArchive();
    act(() => useCurriculumStore.getState().replaceInstitutionalArchive(archive));
    const { result: autoSave } = renderHook(() => useSessionAutoSave({
      localCurriculum: {} as CurriculumMap,
      savedUda: [],
      decisions: {},
      customTexts: {},
      schoolYear: '2026-2027',
      role: 'insegnante',
      discipline: 'italiano',
      order: 'primaria',
      institutionalArchive: archive,
      isWorkspaceLoggedIn: false,
      workspaceAccessToken: '',
      isWorkspaceSyncLocked: false,
      restoreBackupState: useCurriculumStore.getState().restoreBackupState,
      showToast: vi.fn(),
    }));
    act(() => window.dispatchEvent(new Event('beforeunload')));
    expect(JSON.parse(localStorage.getItem('curman_emergency_backup')!).institutionalArchive).toEqual(archive);
    autoSave.current.stateRef.current.institutionalArchive = archive;

    let downloaded: Blob | undefined;
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: vi.fn((blob: Blob) => {
        downloaded = blob;
        return 'blob:institution-test';
      }),
    });
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
    const { result: backup } = renderHook(() => useBackupHandlers({
      schoolYear: '2026-2027',
      setDecision: useCurriculumStore.getState().setDecision,
      setCustomText: useCurriculumStore.getState().setCustomText,
      restoreBackupState: useCurriculumStore.getState().restoreBackupState,
      setShowSaveModal: vi.fn(),
      showToast: vi.fn(),
    }));
    act(() => backup.current.handleDownloadBackup());
    const downloadedPayload = JSON.parse(await readBlob(downloaded!));
    expect(downloadedPayload.institutionalArchive).toEqual(archive);

    act(() => useCurriculumStore.getState().replaceInstitutionalArchive(createEmptyInstitutionalArchive(NOW)));
    await restoreDownloadableBackup(downloadedPayload);
    expect(useCurriculumStore.getState().institutionalArchive).toEqual(archive);
  });

  it('rejects an invalid archive without mutating any current state', async () => {
    const archive = configuredArchive();
    act(() => useCurriculumStore.setState({ institutionalArchive: archive, decisions: { current: 'approved' } }));
    const before = useCurriculumStore.getState();

    const { setShowSaveModal } = await restoreDownloadableBackup({
      ...validBackup(),
      decisions: { incoming: 'rejected' },
      institutionalArchive: { ...archive, institutes: null },
    });

    expect(useCurriculumStore.getState().institutionalArchive).toEqual(before.institutionalArchive);
    expect(useCurriculumStore.getState().decisions).toEqual(before.decisions);
    expect(setShowSaveModal).not.toHaveBeenCalledWith(false);
  });

  it('rejects future institutional archive schemas without mutation', async () => {
    const archive = configuredArchive();
    act(() => useCurriculumStore.setState({ institutionalArchive: archive }));

    await restoreDownloadableBackup({
      ...validBackup(),
      institutionalArchive: { ...archive, schemaVersion: INSTITUTIONAL_ARCHIVE_SCHEMA_VERSION + 1 },
    });

    expect(useCurriculumStore.getState().institutionalArchive).toEqual(archive);
  });

  it('restores older backups without fabricating or retaining institutional identity', async () => {
    act(() => useCurriculumStore.getState().replaceInstitutionalArchive(configuredArchive()));
    const oldBackup = validBackup();
    delete (oldBackup as { institutionalArchive?: unknown }).institutionalArchive;

    await restoreDownloadableBackup(oldBackup);

    expect(useCurriculumStore.getState().institutionalArchive.institutes).toEqual([]);
    expect(useCurriculumStore.getState().institutionalArchive.activeInstituteRef).toBeUndefined();
  });

  it('restores a valid institutional archive from emergency storage', () => {
    const archive = configuredArchive();
    localStorage.setItem('curman_emergency_backup', JSON.stringify(validBackup(archive)));
    const { result, showToast } = renderEmergencyRestore();

    act(() => result.current.handleRestoreFromLocalEmergencyStorage());

    expect(useCurriculumStore.getState().institutionalArchive).toEqual(archive);
    expect(showToast).toHaveBeenCalledWith(expect.stringMatching(/successo/i), true);
  });

  it.each([
    ['malformed', (archive: ReturnType<typeof configuredArchive>) => ({ ...archive, institutes: null })],
    ['future', (archive: ReturnType<typeof configuredArchive>) => ({ ...archive, schemaVersion: INSTITUTIONAL_ARCHIVE_SCHEMA_VERSION + 1 })],
  ])('rejects a %s emergency archive without mutation', (_label, makeInvalid) => {
    const archive = configuredArchive();
    act(() => useCurriculumStore.setState({ institutionalArchive: archive, decisions: { current: 'approved' } }));
    localStorage.setItem('curman_emergency_backup', JSON.stringify({
      ...validBackup(),
      decisions: { incoming: 'rejected' },
      institutionalArchive: makeInvalid(archive),
    }));
    const { result, showToast } = renderEmergencyRestore();

    act(() => result.current.handleRestoreFromLocalEmergencyStorage());

    expect(useCurriculumStore.getState().institutionalArchive).toEqual(archive);
    expect(useCurriculumStore.getState().decisions).toEqual({ current: 'approved' });
    expect(showToast).toHaveBeenCalledWith(expect.stringMatching(/errore/i), false);
  });

  it('restores an old emergency backup as neutral without retaining identity', () => {
    act(() => useCurriculumStore.getState().replaceInstitutionalArchive(configuredArchive()));
    const oldBackup = validBackup();
    delete (oldBackup as { institutionalArchive?: unknown }).institutionalArchive;
    localStorage.setItem('curman_emergency_backup', JSON.stringify(oldBackup));
    const { result } = renderEmergencyRestore();

    act(() => result.current.handleRestoreFromLocalEmergencyStorage());

    expect(useCurriculumStore.getState().institutionalArchive.institutes).toEqual([]);
    expect(useCurriculumStore.getState().institutionalArchive.activeInstituteRef).toBeUndefined();
  });

  it('reports cloud restore failure instead of success for a future archive', async () => {
    const archive = configuredArchive();
    act(() => useCurriculumStore.setState({ institutionalArchive: archive }));
    const showToast = vi.fn();
    vi.stubGlobal('confirm', vi.fn(() => true));
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ files: [{ id: 'cloud-backup' }] }) })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ...validBackup(),
          institutionalArchive: { ...archive, schemaVersion: INSTITUTIONAL_ARCHIVE_SCHEMA_VERSION + 1 },
        }),
      }));
    const { result } = renderHook(() => useWorkspaceSyncHandlers({
      isWorkspaceLoggedIn: true,
      workspaceAccessToken: 'token',
      cloudAccountType: 'scolastica',
      schoolYear: '2026-2027',
      localCurriculum: {} as CurriculumMap,
      savedUda: [],
      decisions: {},
      customTexts: {},
      role: 'insegnante',
      discipline: 'italiano',
      order: 'primaria',
      institutionalArchive: archive,
      stateRef: { current: { savedUda: [] } },
      restoreBackupState: useCurriculumStore.getState().restoreBackupState,
      setIsSyncingWorkspace: vi.fn(),
      setCloudAccountType: vi.fn(),
      setShowCloudAccountModal: vi.fn(),
      setIsWorkspaceLoggedIn: vi.fn(),
      setWorkspaceAccessToken: vi.fn(),
      setWorkspaceUserEmail: vi.fn(),
      setIsWorkspaceSyncLocked: vi.fn(),
      showToast,
    }));

    await act(() => result.current.handleWorkspaceAutoPull('token'));

    expect(useCurriculumStore.getState().institutionalArchive).toEqual(archive);
    expect(showToast).toHaveBeenCalledWith(expect.stringMatching(/non.*ripristin|non valido/i), false);
    expect(showToast).not.toHaveBeenCalledWith(expect.stringMatching(/successo/i), true);
  });

  it('includes the institutional archive in a Google Drive backup payload', async () => {
    const archive = configuredArchive();
    let uploadedBody = '';
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ files: [] }) })
      .mockImplementationOnce(async (_url: string, init: RequestInit) => {
        uploadedBody = String(init.body);
        return { ok: true };
      }));
    const { result } = renderHook(() => useWorkspaceSyncHandlers({
      isWorkspaceLoggedIn: true, workspaceAccessToken: 'token', cloudAccountType: 'personale', schoolYear: '2026-2027',
      localCurriculum: {} as CurriculumMap, savedUda: [], decisions: {}, customTexts: {}, role: 'non-dichiarato', discipline: 'italiano', order: 'primaria',
      institutionalArchive: archive, stateRef: { current: { savedUda: [] } }, restoreBackupState: useCurriculumStore.getState().restoreBackupState,
      setIsSyncingWorkspace: vi.fn(), setCloudAccountType: vi.fn(), setShowCloudAccountModal: vi.fn(), setIsWorkspaceLoggedIn: vi.fn(),
      setWorkspaceAccessToken: vi.fn(), setWorkspaceUserEmail: vi.fn(), setIsWorkspaceSyncLocked: vi.fn(), showToast: vi.fn(),
    }));

    await act(() => result.current.handleWorkspaceSync());
    expect(uploadedBody).toContain('"institutionalArchive"');
    expect(uploadedBody).toContain(archive.institutes[0].id);
  });

  it('applies a valid institutional archive before reporting cloud restore success', async () => {
    const archive = configuredArchive();
    act(() => useCurriculumStore.getState().replaceInstitutionalArchive(createEmptyInstitutionalArchive(NOW)));
    const showToast = vi.fn();
    vi.stubGlobal('confirm', vi.fn(() => true));
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ files: [{ id: 'cloud-backup' }] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => validBackup(archive) }));
    const { result } = renderHook(() => useWorkspaceSyncHandlers({
      isWorkspaceLoggedIn: true, workspaceAccessToken: 'token', cloudAccountType: 'personale', schoolYear: '2026-2027',
      localCurriculum: {} as CurriculumMap, savedUda: [], decisions: {}, customTexts: {}, role: 'non-dichiarato', discipline: 'italiano', order: 'primaria',
      institutionalArchive: createEmptyInstitutionalArchive(NOW), stateRef: { current: { savedUda: [] } }, restoreBackupState: useCurriculumStore.getState().restoreBackupState,
      setIsSyncingWorkspace: vi.fn(), setCloudAccountType: vi.fn(), setShowCloudAccountModal: vi.fn(), setIsWorkspaceLoggedIn: vi.fn(),
      setWorkspaceAccessToken: vi.fn(), setWorkspaceUserEmail: vi.fn(), setIsWorkspaceSyncLocked: vi.fn(), showToast,
    }));

    await act(() => result.current.handleWorkspaceAutoPull('token'));
    expect(useCurriculumStore.getState().institutionalArchive).toEqual(archive);
    expect(showToast).toHaveBeenCalledWith(expect.stringMatching(/ripristinata|ripristinato/i), true);
  });

  it('does not fabricate identity when resetting work or clearing export history', () => {
    act(() => useCurriculumStore.getState().resetAll());
    expect(useCurriculumStore.getState().institutionalArchive.institutes).toEqual([]);

    act(() => useCurriculumStore.getState().clearDocumentExportHistory());
    expect(useCurriculumStore.getState().institutionalArchive.institutes).toEqual([]);
    expect(useCurriculumStore.getState().institutionalArchive.activeInstituteRef).toBeUndefined();
  });

  it('keeps IndexedDB at schema version 2 with no institutional object store', () => {
    const database = createCurriculumDatabase('cml-633d-institution-integration-schema-test');
    expect(CURRICULUM_SCHEMA_VERSION).toBe(2);
    expect(database.verno).toBe(2);
    expect(database.tables.map(table => table.name).sort()).toEqual(Object.keys(CURRICULUM_STORES).sort());
    expect(database.tables.some(table => ['institutionalArchive', 'institutionalArchives'].includes(table.name))).toBe(false);
    database.close();
  });
});

describe('CML-633D Task 7 institutional configuration surface', () => {
  it('shows a neutral, optional personal-mode form with explicit canonical labels', () => {
    renderInstitutionPanel();

    expect(screen.getByText('Istituto non configurato')).toBeInTheDocument();
    expect(screen.getByText(/modalità personale resta utilizzabile/i)).toBeInTheDocument();
    expect(screen.getByText(/esportazioni istituzionali richiedono la configurazione/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Nome istituto')).toHaveValue('');
    expect(screen.getByLabelText('Codice meccanografico (facoltativo)')).toHaveValue('');
    expect(screen.getByRole('group', { name: 'Ordini scolastici' })).toBeInTheDocument();
    expect(screen.getByLabelText("Scuola dell'Infanzia")).not.toBeChecked();
    expect(screen.getByLabelText('Scuola Primaria')).not.toBeChecked();
    expect(screen.getByLabelText('Scuola Secondaria di Primo Grado')).not.toBeChecked();
    expect(screen.getByLabelText('Sede principale (facoltativa)')).toHaveValue('');
    expect(screen.getByLabelText('Etichetta nuovo anno scolastico')).toHaveValue('');
    expect(screen.getByLabelText('Data inizio nuovo anno')).toHaveValue('');
    expect(screen.getByLabelText('Data fine nuovo anno')).toHaveValue('');
    expect(screen.getByLabelText('Intestazione documento (facoltativa)')).toHaveValue('');
    expect(screen.getByLabelText('Sottotitolo documento (facoltativo)')).toHaveValue('');
    expect(screen.getByLabelText('Piè di pagina documento (facoltativo)')).toHaveValue('');
    expect(screen.getByLabelText('Riferimenti generali (facoltativi)')).toHaveValue('');
    expect(screen.getByLabelText('Nome dichiarato (facoltativo)')).toHaveValue('');
    expect(screen.getByLabelText('Ruolo dichiarato per questa sessione')).toHaveValue('');
  });

  it('associates validation errors and supports native keyboard draft submission', async () => {
    const user = userEvent.setup();
    renderInstitutionPanel();

    await user.click(screen.getByRole('button', { name: 'Salva bozza' }));

    const name = screen.getByRole('textbox', { name: 'Nome istituto' });
    const orders = screen.getByRole('group', { name: 'Ordini scolastici' });
    expect(name).toHaveAttribute('aria-invalid', 'true');
    expect(name).toHaveAccessibleDescription(/nome istituto è obbligatorio/i);
    expect(orders).toHaveAttribute('aria-invalid', 'true');
    expect(orders).toHaveAttribute('aria-describedby');
    expect(screen.getByText(/seleziona almeno un ordine scolastico/i)).toBeInTheDocument();
    expect(document.activeElement).toBe(name);
    expect(useCurriculumStore.getState().institutionalArchive.institutes).toEqual([]);

    await user.type(name, 'Istituto Tastiera');
    await user.click(screen.getByLabelText('Scuola Primaria'));
    await user.click(name);
    await user.keyboard('{Enter}');

    expect(useCurriculumStore.getState().institutionalArchive.institutes[0]).toMatchObject({
      name: 'Istituto Tastiera',
      schoolOrders: ['primaria'],
      status: 'draft',
    });
  });

  it('demotes changed confirmed-local data to draft while preserving identity and provenance', async () => {
    const user = userEvent.setup();
    const confirmed = configuredArchive();
    confirmed.institutes[0].status = 'confirmed-local';
    act(() => useCurriculumStore.getState().replaceInstitutionalArchive(confirmed));
    renderInstitutionPanel();
    const before = useCurriculumStore.getState().institutionalArchive.institutes[0];

    const name = screen.getByLabelText('Nome istituto');
    await user.clear(name);
    await user.type(name, 'Istituto Modificato');
    await user.click(screen.getByRole('button', { name: 'Salva bozza' }));

    const changed = useCurriculumStore.getState().institutionalArchive.institutes[0];
    expect(changed).toMatchObject({ name: 'Istituto Modificato', status: 'draft', id: before.id });
    expect(changed.metadata).toMatchObject({
      id: before.metadata.id,
      createdAt: before.metadata.createdAt,
      origin: before.metadata.origin,
    });
    expect(screen.getByRole('button', { name: 'Conferma localmente' })).toBeEnabled();
  });

  it('adds canonical years without overwriting selection and switches the sole active year', async () => {
    const user = userEvent.setup();
    renderInstitutionPanel();
    fireEvent.change(screen.getByLabelText('Nome istituto'), { target: { value: 'Istituto Anni' } });
    await user.click(screen.getByLabelText('Scuola Primaria'));
    await user.click(screen.getByRole('button', { name: 'Salva bozza' }));
    fireEvent.change(screen.getByLabelText('Etichetta nuovo anno scolastico'), { target: { value: '2025/2026' } });
    fireEvent.change(screen.getByLabelText('Data inizio nuovo anno'), { target: { value: '2025-09-01' } });
    fireEvent.change(screen.getByLabelText('Data fine nuovo anno'), { target: { value: '2026-08-31' } });
    await user.click(screen.getByRole('button', { name: 'Aggiungi anno scolastico' }));
    let archive = useCurriculumStore.getState().institutionalArchive;
    const firstYearId = archive.academicYears[0].id;
    expect(screen.getByLabelText('Anno scolastico selezionato')).toHaveValue(firstYearId);
    expect(screen.getByLabelText('Etichetta nuovo anno scolastico')).toHaveValue('');

    fireEvent.change(screen.getByLabelText('Etichetta nuovo anno scolastico'), { target: { value: '2026/2027' } });
    fireEvent.change(screen.getByLabelText('Data inizio nuovo anno'), { target: { value: '2026-09-01' } });
    fireEvent.change(screen.getByLabelText('Data fine nuovo anno'), { target: { value: '2027-08-31' } });
    await user.click(screen.getByRole('button', { name: 'Aggiungi anno scolastico' }));
    archive = useCurriculumStore.getState().institutionalArchive;
    const secondYearId = archive.academicYears[1].id;
    expect(screen.getByLabelText('Anno scolastico selezionato')).toHaveValue(firstYearId);
    expect(screen.getByRole('list', { name: 'Anni scolastici configurati' })).toHaveTextContent('2025/2026');
    expect(screen.getByRole('list', { name: 'Anni scolastici configurati' })).toHaveTextContent('2026/2027');

    await user.click(screen.getByRole('button', { name: 'Conferma localmente' }));

    await user.selectOptions(screen.getByLabelText('Anno scolastico selezionato'), secondYearId);
    await user.click(screen.getByRole('button', { name: 'Attiva anno e contesto' }));
    archive = useCurriculumStore.getState().institutionalArchive;
    expect(archive.academicYears.find(item => item.id === secondYearId)?.status).toBe('active');
    expect(archive.academicYears.filter(item => item.status === 'active')).toHaveLength(1);

    await user.selectOptions(screen.getByLabelText('Anno scolastico selezionato'), firstYearId);
    await user.click(screen.getByRole('button', { name: 'Attiva anno e contesto' }));
    archive = useCurriculumStore.getState().institutionalArchive;
    expect(archive.academicYears.find(item => item.id === firstYearId)?.status).toBe('active');
    expect(archive.academicYears.find(item => item.id === secondYearId)?.status).toBe('closed');
    expect(archive.academicYears.filter(item => item.status === 'active')).toHaveLength(1);
  });

  it('saves one canonical draft, confirms it locally without verification, and explicitly activates year and context', async () => {
    const user = userEvent.setup();
    const replace = vi.spyOn(useCurriculumStore.getState(), 'replaceInstitutionalArchive');
    renderInstitutionPanel();

    fireEvent.change(screen.getByLabelText('Nome istituto'), { target: { value: 'Istituto Galileo' } });
    fireEvent.change(screen.getByLabelText('Codice meccanografico (facoltativo)'), { target: { value: 'RMIC123456' } });
    await user.click(screen.getByLabelText("Scuola dell'Infanzia"));
    await user.click(screen.getByLabelText('Scuola Secondaria di Primo Grado'));
    fireEvent.change(screen.getByLabelText('Sede principale (facoltativa)'), { target: { value: 'Sede Centro' } });
    fireEvent.change(screen.getByLabelText('Intestazione documento (facoltativa)'), { target: { value: 'Curricolo verticale' } });
    fireEvent.change(screen.getByLabelText('Sottotitolo documento (facoltativo)'), { target: { value: 'Documento di lavoro' } });
    fireEvent.change(screen.getByLabelText('Piè di pagina documento (facoltativo)'), { target: { value: 'Uso interno' } });
    fireEvent.change(screen.getByLabelText('Riferimenti generali (facoltativi)'), { target: { value: 'PTOF e regolamento' } });
    await user.click(screen.getByRole('button', { name: 'Salva bozza' }));
    expect(replace).toHaveBeenCalledTimes(1);
    replace.mockClear();

    let archive = useCurriculumStore.getState().institutionalArchive;
    expect(archive.activeInstituteRef).toBeUndefined();
    expect(archive.currentContextRef).toBeUndefined();
    expect(archive.institutes[0]).toMatchObject({
      name: 'Istituto Galileo',
      mechanicalCode: 'RMIC123456',
      schoolOrders: ['infanzia', 'secondaria'],
      status: 'draft',
      documentProfile: {
        heading: 'Curricolo verticale',
        subheading: 'Documento di lavoro',
        footer: 'Uso interno',
        generalReferences: 'PTOF e regolamento',
      },
    });
    expect(archive.sites[0]).toMatchObject({ name: 'Sede Centro', isMain: true });
    expect(screen.getByText('Stato: bozza')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Etichetta nuovo anno scolastico'), { target: { value: '2026/2027' } });
    fireEvent.change(screen.getByLabelText('Data inizio nuovo anno'), { target: { value: '2026-09-01' } });
    fireEvent.change(screen.getByLabelText('Data fine nuovo anno'), { target: { value: '2027-08-31' } });
    await user.click(screen.getByRole('button', { name: 'Aggiungi anno scolastico' }));
    expect(replace).toHaveBeenCalledTimes(1);
    replace.mockClear();
    archive = useCurriculumStore.getState().institutionalArchive;
    expect(archive.academicYears[0]).toMatchObject({ label: '2026/2027', status: 'planned' });

    await user.click(screen.getByRole('button', { name: 'Conferma localmente' }));
    expect(replace).toHaveBeenCalledTimes(1);
    replace.mockClear();
    archive = useCurriculumStore.getState().institutionalArchive;
    expect(archive.institutes[0].status).toBe('confirmed-local');
    expect(archive.activeInstituteRef).toBeUndefined();
    expect(screen.getByText(/conferma locale.*non verifica/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Nome dichiarato (facoltativo)'), { target: { value: 'Ada Rossi' } });
    await user.selectOptions(screen.getByLabelText('Ruolo dichiarato per questa sessione'), 'referente');
    await user.click(screen.getByRole('button', { name: 'Attiva anno e contesto' }));
    expect(replace).toHaveBeenCalledTimes(1);
    archive = useCurriculumStore.getState().institutionalArchive;
    expect(archive.activeInstituteRef?.id).toBe(archive.institutes[0].id);
    expect(archive.institutes[0].activeAcademicYearRef?.id).toBe(archive.academicYears[0].id);
    expect(archive.academicYears[0].status).toBe('active');
    expect(archive.currentContextRef?.id).toBe(archive.contexts[0].id);
    expect(archive.contexts[0].declaredActor).toMatchObject({
      displayName: 'Ada Rossi',
      role: 'referente',
      assertion: 'self-declared',
    });
    expect(screen.getByText(/ordini configurati:.*infanzia.*secondaria/i)).toBeInTheDocument();
    expect(screen.getByText('Stato: configurato localmente')).toBeInTheDocument();
  });

  it('delegates export to the existing complete backup authority and surfaces errors', async () => {
    const user = userEvent.setup();
    const onExportBackup = vi.fn();
    const onExportError = vi.fn();
    const createObjectUrl = vi.spyOn(URL, 'createObjectURL');
    createObjectUrl.mockClear();
    renderInstitutionPanel(onExportBackup, onExportError);

    await user.click(screen.getByRole('button', { name: 'Esporta backup JSON' }));
    expect(onExportBackup).toHaveBeenCalledTimes(1);
    expect(createObjectUrl).not.toHaveBeenCalled();

    onExportBackup.mockImplementation(() => { throw new Error('download non disponibile'); });
    await user.click(screen.getByRole('button', { name: 'Esporta backup JSON' }));
    expect(onExportError).toHaveBeenCalledWith('Impossibile esportare la copia di sicurezza completa.');
    expect(screen.getByRole('alert')).toHaveTextContent(/impossibile esportare/i);
  });

  it('archives a cleared main site while retaining its historical record', async () => {
    const user = userEvent.setup();
    renderInstitutionPanel();
    fireEvent.change(screen.getByLabelText('Nome istituto'), { target: { value: 'Istituto Sedi' } });
    await user.click(screen.getByLabelText('Scuola Primaria'));
    fireEvent.change(screen.getByLabelText('Sede principale (facoltativa)'), { target: { value: 'Sede Centrale' } });
    await user.click(screen.getByRole('button', { name: 'Salva bozza' }));
    expect(useCurriculumStore.getState().institutionalArchive.sites[0]).toMatchObject({ name: 'Sede Centrale', isMain: true, status: 'draft' });

    fireEvent.change(screen.getByLabelText('Sede principale (facoltativa)'), { target: { value: '' } });
    await user.click(screen.getByRole('button', { name: 'Salva bozza' }));

    const sites = useCurriculumStore.getState().institutionalArchive.sites;
    expect(sites).toHaveLength(1);
    expect(sites[0]).toMatchObject({ name: 'Sede Centrale', isMain: false, status: 'archived' });
    expect(sites.filter(item => item.isMain && item.status !== 'archived')).toHaveLength(0);
  });

  it('requires saving dirty institutional fields before confirm or context actions', async () => {
    const user = userEvent.setup();
    const confirmed = configuredArchive();
    act(() => useCurriculumStore.getState().replaceInstitutionalArchive(confirmed));
    renderInstitutionPanel();

    fireEvent.change(screen.getByLabelText('Nome istituto'), { target: { value: 'Modifica non salvata' } });
    const confirm = screen.getByRole('button', { name: 'Conferma localmente' });
    const activate = screen.getByRole('button', { name: 'Attiva anno e contesto' });
    expect(confirm).toBeDisabled();
    expect(confirm).toHaveAccessibleDescription(/salva la bozza prima/i);
    expect(activate).toBeDisabled();
    expect(activate).toHaveAccessibleDescription(/salva la bozza prima/i);

    await user.click(screen.getByRole('button', { name: 'Salva bozza' }));
    expect(useCurriculumStore.getState().institutionalArchive.institutes[0].status).toBe('draft');
    expect(screen.getByRole('button', { name: 'Conferma localmente' })).toBeEnabled();
  });

  it('keeps confirmed identity when adding a separate planned academic year', async () => {
    const user = userEvent.setup();
    act(() => useCurriculumStore.getState().replaceInstitutionalArchive(configuredArchive()));
    renderInstitutionPanel();
    fireEvent.change(screen.getByLabelText('Etichetta nuovo anno scolastico'), { target: { value: '2026/2027' } });
    fireEvent.change(screen.getByLabelText('Data inizio nuovo anno'), { target: { value: '2026-09-01' } });
    fireEvent.change(screen.getByLabelText('Data fine nuovo anno'), { target: { value: '2027-08-31' } });

    await user.click(screen.getByRole('button', { name: 'Aggiungi anno scolastico' }));

    const archive = useCurriculumStore.getState().institutionalArchive;
    expect(archive.institutes[0].status).toBe('confirmed-local');
    expect(archive.activeInstituteRef?.id).toBe(archive.institutes[0].id);
    expect(archive.academicYears[0].status).toBe('planned');
    expect(archive.institutes[0].activeAcademicYearRef).toBeUndefined();
  });

  it('requires explicit destructive confirmation before archiving and resetting the active configuration', async () => {
    const user = userEvent.setup();
    act(() => useCurriculumStore.getState().replaceInstitutionalArchive(configuredArchive()));
    renderInstitutionPanel();

    await user.click(screen.getByRole('button', { name: 'Archivia configurazione' }));
    expect(screen.getByText(/archiviare e azzerare/i)).toBeInTheDocument();
    expect(useCurriculumStore.getState().institutionalArchive.institutes[0].status).not.toBe('archived');

    await user.click(screen.getByText('Annulla'));
    expect(useCurriculumStore.getState().institutionalArchive.institutes[0].status).not.toBe('archived');
    await user.click(screen.getByRole('button', { name: 'Archivia configurazione' }));
    await user.click(screen.getByText('Archivia e azzera'));

    const archive = useCurriculumStore.getState().institutionalArchive;
    expect(archive.institutes[0].status).toBe('archived');
    expect(archive.activeInstituteRef).toBeUndefined();
    expect(screen.getByText('Istituto non configurato')).toBeInTheDocument();
    expect(screen.getByLabelText('Nome dichiarato (facoltativo)')).toHaveValue('');
    expect(screen.getByLabelText('Ruolo dichiarato per questa sessione')).toHaveValue('');
  });

  it('clears declared actor draft values when active institute and context disappear', async () => {
    const user = userEvent.setup();
    renderInstitutionPanel();
    await user.type(screen.getByLabelText('Nome dichiarato (facoltativo)'), 'Ada Rossi');
    await user.selectOptions(screen.getByLabelText('Ruolo dichiarato per questa sessione'), 'referente');

    act(() => useCurriculumStore.getState().replaceInstitutionalArchive(createEmptyInstitutionalArchive(NOW)));

    expect(screen.getByLabelText('Nome dichiarato (facoltativo)')).toHaveValue('');
    expect(screen.getByLabelText('Ruolo dichiarato per questa sessione')).toHaveValue('');
  });

  it('names and contains settings-modal focus, closes on Escape and returns focus', async () => {
    const user = userEvent.setup();
    render(<SaveSettingsModalHarness />);
    const opener = screen.getByRole('button', { name: 'Apri impostazioni' });
    await user.click(opener);

    const dialog = screen.getByRole('dialog', { name: 'Impostazioni locali' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    const close = screen.getByRole('button', { name: 'Chiudi impostazioni' });
    expect(document.activeElement).toBe(close);
    await user.keyboard('{Shift>}{Tab}{/Shift}');
    expect(dialog).toContainElement(document.activeElement as HTMLElement);
    expect(document.activeElement).not.toBe(opener);
    await user.tab();
    expect(document.activeElement).toBe(close);
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog', { name: "Impostazioni d'Istituto" })).not.toBeInTheDocument();
    expect(document.activeElement).toBe(opener);
  });

  it('gives confirmation dialogs an accessible title and description', () => {
    render(<UiConfirmDialog open title="Archivia configurazione" message="Rimuove il contesto attivo." onConfirm={vi.fn()} onCancel={vi.fn()} />);
    const dialog = screen.getByRole('dialog', { hidden: true });
    expect(dialog).toHaveAccessibleName('Archivia configurazione');
    expect(dialog).toHaveAccessibleDescription('Rimuove il contesto attivo.');
  });

  it('closes only a nested confirmation on Escape and restores its trigger focus', async () => {
    const user = userEvent.setup();
    act(() => useCurriculumStore.getState().replaceInstitutionalArchive(configuredArchive()));
    render(<SaveSettingsModalHarness />);
    await user.click(screen.getByRole('button', { name: 'Apri impostazioni' }));
    const parent = screen.getByRole('dialog', { name: 'Impostazioni locali' });
    const trigger = screen.getByRole('button', { name: 'Archivia configurazione' });
    await user.click(trigger);
    expect(screen.getByRole('dialog', { name: 'Archiviare e azzerare la configurazione?' })).toBeInTheDocument();

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog', { name: 'Archiviare e azzerare la configurazione?' })).not.toBeInTheDocument();
    expect(parent).toBeInTheDocument();
    expect(document.activeElement).toBe(trigger);
  });
});

describe('CML-633D Task 8 A04 institutional reads', () => {
  it('blocks generation when the selected order is not configured instead of reusing indices under another order', () => {
    const archive = configuredA04Archive();
    const onAddUda = vi.fn();
    const showToast = vi.fn();
    act(() => useCurriculumStore.setState({
      institutionalArchive: archive,
      order: 'primaria',
      schoolYear: '2025-2026',
    }));

    render(<A04PreviewHarness onAddUda={onAddUda} showToast={showToast} />);

    const preview = screen.getByLabelText('Anteprima A04');
    expect(preview).toHaveTextContent('Istituto Galileo');
    expect(preview).toHaveTextContent('SEDE: Sede Centro');
    expect(preview).toHaveTextContent('ORDINE: PRIMARIA');
    expect(preview).toHaveTextContent('ANNO SCOL.: 2027/2028');
    expect(preview).toHaveTextContent(/ordine primaria.*non.*configurat/i);
    expect(preview).toHaveTextContent('Traguardo primaria');
    expect(preview).not.toHaveTextContent('Traguardo secondaria');
    expect(useCurriculumStore.getState()).toMatchObject({ order: 'primaria', schoolYear: '2025-2026' });
    fireEvent.click(screen.getByRole('button', { name: 'Genera A04' }));
    expect(onAddUda).not.toHaveBeenCalled();
    expect(showToast).toHaveBeenCalledWith(expect.stringMatching(/ordine primaria.*non.*configurat/i), false);
    expect(useCurriculumStore.getState().savedUda).toEqual([]);
  });

  it('keeps personal mode neutral and does not presume the former institute identity', () => {
    render(<A04PreviewHarness />);

    const preview = screen.getByLabelText('Anteprima A04');
    expect(preview).toHaveTextContent('Istituto non configurato');
    expect(preview).toHaveTextContent('MODALITA: PERSONALE');
    expect(preview).not.toHaveTextContent('don Lorenzo Milani');
    expect(preview).not.toHaveTextContent('Calvario-Covotta');
    expect(preview).not.toHaveTextContent('AVIC849003');
  });

  it('uses neutral or configured identity in certification output without a presumed code', async () => {
    const user = userEvent.setup();
    const writeText = vi.fn((_text: string) => Promise.resolve());
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
    const view = renderCertificationTab();

    await user.click(screen.getByRole('button', { name: 'Copia matrice di lavoro' }));
    expect(writeText).toHaveBeenLastCalledWith(expect.stringContaining('Istituto non configurato'));
    expect(writeText).toHaveBeenLastCalledWith(expect.stringContaining('MATRICE DI LAVORO NON VALIDATA'));
    expect(writeText).toHaveBeenLastCalledWith(expect.not.stringContaining('AVIC849003'));

    act(() => useCurriculumStore.setState({ institutionalArchive: configuredA04Archive() }));
    view.rerender(<CertificazioneTab
      localCurriculum={a04Curriculum}
      discipline="italiano"
      selectedTraguardi={[]}
      selectedEvidenze={[]}
      activeCompetencyExplorer={null}
      setActiveCompetencyExplorer={vi.fn()}
      showToast={vi.fn()}
      handleLoadSuggestedUda={vi.fn()}
      getDisciplineIcon={() => ''}
      getDisciplineLabel={value => value}
    />);
    await user.click(screen.getByRole('button', { name: 'Copia matrice di lavoro' }));
    const configuredOutput = writeText.mock.calls[writeText.mock.calls.length - 1]?.[0] ?? '';
    expect(configuredOutput).toContain('Istituto Galileo');
    expect(configuredOutput).toContain('Codice Meccanografico: RMIC123456');
    expect(configuredOutput).toContain('Anno scolastico: 2027/2028');
    expect(configuredOutput).toContain('Ordine: secondaria');
    expect(configuredOutput).toContain('Sede: Sede Centro');
    expect(configuredOutput).not.toContain('don Lorenzo Milani');
    expect(configuredOutput).not.toContain('AVIC849003');
  });

  it('does not rewrite saved UDA records when active institutional context switches', () => {
    const savedUda = [{
      id: 'uda-storica', title: 'UDA storica', discipline: 'italiano', order: 'primaria' as const,
      period: 'Primo Quadrimestre', hours: 10, status: 'bozza' as const,
      traguardi: ['Storico'], obiettivi: ['Storico'], evidenze: [], realTask: 'Storico', notes: 'Storico', createdAt: '01/09/2025',
    }];
    act(() => useCurriculumStore.setState({ savedUda, institutionalArchive: configuredA04Archive('Istituto Uno', '2027/2028') }));
    const before = structuredClone(useCurriculumStore.getState().savedUda);

    act(() => useCurriculumStore.getState().replaceInstitutionalArchive(configuredA04Archive('Istituto Due', '2028/2029')));

    expect(useCurriculumStore.getState().savedUda).toEqual(before);
    expect(useCurriculumStore.getState().savedUda[0]).not.toHaveProperty('institutionalContext');
  });
});

describe('CML-633D Task 9 A07 institutional document integration', () => {
  it('uses the neutral profile across representative exports, preserves curriculum content and warns without blocking', async () => {
    const blobs: Blob[] = [];
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: vi.fn((blob: Blob) => { blobs.push(blob); return 'blob:a07'; }),
    });
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
    const args = documentExportArgs();
    const { result } = renderHook(() => useDocumentExportHandlers(args));

    act(() => {
      result.current.handleDownloadWordDefinitivo();
      result.current.handleDownloadTxt();
      result.current.handleDownloadCml();
      result.current.handleDownloadRichMarkdown();
      result.current.handleGenerateProgrammazioneAnnualeDoc();
    });

    const outputs = await Promise.all(blobs.map(readBlob));
    expect(outputs).toHaveLength(4);
    outputs.forEach(output => {
      expect(output).toContain('Istituto non configurato');
      expect(output).not.toMatch(/AVIC849003|don Lorenzo Milani|Calvario-Covotta|Maria Letizia|Ministero dell.Istruzione|USR Campania/i);
      expect(output).not.toMatch(A07_AUTHORITY_WORDING);
    });
    expect(outputs[0]).toContain('Traguardo secondaria');
    expect(outputs[1]).toContain('Traguardo secondaria');
    expect(outputs[2]).toContain('"instituteName": "Istituto non configurato"');
    expect(outputs[3]).toContain('Traguardo secondaria');
    const generated = String(args.setGeneratedDocText.mock.calls[0]?.[0] ?? '');
    expect(generated).not.toContain('Istituto non configurato');
    expect(generated).toContain('Documento curricolare locale');
    expect(generated).not.toMatch(A07_AUTHORITY_WORDING);
    expect(args.showToast).toHaveBeenCalledWith(expect.stringMatching(/configurazione istituzionale incompleta/i), false);
  });

  it('keeps the incomplete warning in the final export and UDA package notifications', () => {
    Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: vi.fn(() => 'blob:warning') });
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
    const profile = getA07InstitutionalDocumentRead(createEmptyInstitutionalArchive(NOW));
    const exportArgs = documentExportArgs(profile);
    const exported = renderHook(() => useDocumentExportHandlers(exportArgs));

    act(() => exported.result.current.handleDownloadTxt());

    expect(exportArgs.showToast).toHaveBeenCalledTimes(1);
    expect(exportArgs.showToast).toHaveBeenLastCalledWith(
      expect.stringMatching(/configurazione istituzionale incompleta.*download del file/iu),
      false,
    );

    const packageToast = vi.fn();
    const packaged = renderHook(() => useUdaPackageHandlers({
      savedUda: [sampleUda], targetClass: '3', targetSection: 'A', showToast: packageToast, institutionalProfile: profile,
    }));
    act(() => packaged.result.current.handleDownloadScormManifest(sampleUda.id));

    expect(packageToast).toHaveBeenCalledTimes(1);
    expect(packageToast).toHaveBeenLastCalledWith(
      expect.stringMatching(/configurazione istituzionale incompleta.*pacchetto SCORM/iu),
      false,
    );
  });

  it('uses configured canonical identity and active year consistently in export and generated preview text', async () => {
    const blobs: Blob[] = [];
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: vi.fn((blob: Blob) => { blobs.push(blob); return 'blob:a07-configured'; }),
    });
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
    const profile = getA07InstitutionalDocumentRead(configuredA04Archive('Istituto Galileo', '2027/2028', 'docente'));
    const args = documentExportArgs(profile);
    const { result } = renderHook(() => useDocumentExportHandlers(args));

    act(() => {
      result.current.handleDownloadWordDocx();
      result.current.handleDownloadTxt();
      result.current.handleGenerateRelazioneDoc();
      result.current.handleGenerateSpecificoGradoDoc();
    });

    const exported = await readBlob(blobs[0]);
    const textExport = await readBlob(blobs[1]);
    const previewText = String(args.setGeneratedDocText.mock.calls[0]?.[0] ?? '');
    const gradeSpecificText = String(args.setGeneratedDocText.mock.calls[1]?.[0] ?? '');
    for (const output of [exported, textExport]) {
      expect(output).toContain('Istituto Galileo');
      expect(output).toContain('Intestazione Galileo');
      expect(output).toContain('RMIC123456');
      expect(output).toContain('2027/2028');
      expect(output).not.toContain('2025-2026');
      expect(output).not.toMatch(/AVIC849003|don Lorenzo Milani|Maria Letizia|Il Dirigente Scolastico|VALIDATO ED APPROVATO/i);
      expect(output).not.toMatch(A07_AUTHORITY_WORDING);
      expect(output).toContain('Contatti configurati localmente');
    }
    for (const body of [previewText, gradeSpecificText]) {
      expect(body).toContain('Documento curricolare locale');
      expect(body).not.toMatch(/Intestazione Galileo|Istituto Galileo|RMIC123456|Contatti configurati localmente/);
      expect(body).not.toMatch(A07_AUTHORITY_WORDING);
    }
    expect(gradeSpecificText).not.toMatch(/docente dichiara|sottoscritt[oa]|firma/i);
    expect(exported).toContain('Traguardo secondaria');
  });

  it('uses the complete escaped shared projection in formatted clipboard output', async () => {
    let clipboardHtml: Blob | undefined;
    vi.stubGlobal('ClipboardItem', class {
      constructor(items: Record<string, Blob>) { clipboardHtml = items['text/html']; }
    });
    const write = vi.fn(() => Promise.resolve());
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { write, writeText: vi.fn() } });
    const profile = {
      ...getA07InstitutionalDocumentRead(configuredA04Archive()),
      heading: '<script>Intestazione</script>',
    };
    const { result } = renderHook(() => useDocumentExportHandlers(documentExportArgs(profile)));

    act(() => result.current.handleCopyToClipboardFormatted());
    await waitFor(() => expect(write).toHaveBeenCalled());
    const output = await readBlob(clipboardHtml!);

    for (const field of ['&lt;script&gt;Intestazione&lt;/script&gt;', 'Istituto Galileo', 'Polo formativo locale', 'Sede Centro', 'Via Roma 1', 'RMIC123456', 'Riferimenti interni configurati', '2027/2028', 'Contatti configurati localmente']) {
      expect(output).toContain(field);
    }
    expect(output).not.toContain('<script>Intestazione</script>');
    expect(output).not.toMatch(A07_AUTHORITY_WORDING);
  });

  it('escapes imported content at representative table, print and SCORM HTML/XML boundaries', async () => {
    const attack = '</title><script>attack()</script><img src=x onerror="attack()">';
    const multilineAttack = `${attack}\nseconda riga`;
    const maliciousProfile = {
      configured: true,
      instituteName: attack,
      heading: attack,
      subheading: attack,
      footer: attack,
      organizationId: 'org" onload="attack()',
    };
    const maliciousCurriculum = {
      evil: {
        secondaria: {
          traguardi: [multilineAttack],
          obiettivi: [attack],
          evidenze: [],
          proposals: [{ id: 'prop-evil', focus: attack, oldText: attack, newText: attack, notes: '' }],
        },
      },
    } as unknown as CurriculumMap;
    const blobs: Blob[] = [];
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: vi.fn((blob: Blob) => { blobs.push(blob); return 'blob:escaped'; }),
    });
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
    const writes: string[] = [];
    vi.spyOn(window, 'open').mockReturnValue({
      document: { write: vi.fn((value: string) => writes.push(value)), close: vi.fn() },
    } as unknown as Window);
    const exportArgs = {
      ...documentExportArgs(maliciousProfile),
      localCurriculum: maliciousCurriculum,
      discipline: 'evil',
      decisions: { 'prop-evil': 'custom' as const },
      customTexts: { 'prop-evil': multilineAttack },
      getDisciplineLabel: () => attack,
    };
    const documentHandlers = renderHook(() => useDocumentExportHandlers(exportArgs));

    act(() => documentHandlers.result.current.handleDownloadWordDefinitivo());
    act(() => documentHandlers.result.current.handlePrintDocumentPdf(attack, `DOCUMENTO: ${multilineAttack}`));
    const table = await readBlob(blobs[0]);
    const printed = writes.join('\n');

    const maliciousUda = {
      ...sampleUda,
      id: 'uda" onload="attack()',
      title: attack,
      discipline: attack,
      period: attack,
      status: attack,
      traguardi: [multilineAttack],
      obiettivi: [attack],
      evidenze: [attack],
      realTask: multilineAttack,
      notes: multilineAttack,
    } as unknown as typeof sampleUda;
    let zipBlob: Blob | undefined;
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: vi.fn((blob: Blob) => { zipBlob = blob; return 'blob:escaped-scorm'; }),
    });
    const udaHandlers = renderHook(() => useUdaPackageHandlers({
      savedUda: [maliciousUda], targetClass: '3', targetSection: 'A', showToast: vi.fn(), institutionalProfile: maliciousProfile,
    }));
    act(() => udaHandlers.result.current.handleDownloadScormManifest(maliciousUda.id));
    const scorm = await readBlob(zipBlob!);

    for (const output of [table, printed, scorm]) {
      expect(output).not.toContain('<script>attack()</script>');
      expect(output).not.toContain('<img src=x');
      expect(output).not.toContain('onerror="attack()"');
      expect(output).toContain('&lt;script&gt;attack()&lt;/script&gt;');
    }
    expect(table).toContain('<br>seconda riga');
    expect(scorm).not.toContain('identifier="UDA-uda" onload="attack()"');
    expect(scorm).toContain('UDA-uda&quot; onload=&quot;attack()');
  });

  it('routes direct PDF export through the canonical configured document instead of printing an identity-less page', () => {
    const writes: string[] = [];
    const printWindow = {
      document: { write: vi.fn((value: string) => writes.push(value)), close: vi.fn() },
    };
    vi.spyOn(window, 'open').mockReturnValue(printWindow as unknown as Window);
    const profile = getA07InstitutionalDocumentRead(configuredA04Archive('Istituto Galileo', '2027/2028', 'docente'));
    const { result } = renderHook(() => useDocumentExportHandlers(documentExportArgs(profile)));

    act(() => result.current.handleDownloadPdfDirect());

    expect(writes.join('\n')).toContain('Istituto Galileo');
    expect(writes.join('\n')).toContain('Traguardo secondaria');
    expect(writes.join('\n')).not.toMatch(/AVIC849003|don Lorenzo Milani|Maria Letizia/i);
  });

  it('keeps generated text body-only and applies heading and footer once in modal and printed output', () => {
    const profile = getA07InstitutionalDocumentRead(configuredA04Archive());
    const args = documentExportArgs(profile);
    const { result } = renderHook(() => useDocumentExportHandlers(args));
    act(() => result.current.handleGenerateRelazioneDoc());
    const body = String(args.setGeneratedDocText.mock.calls[0]?.[0] ?? '');

    expect(body).not.toContain('Intestazione Galileo');
    expect(body).not.toContain('Contatti configurati localmente');

    const modal = render(<DocumentViewModal
      generatedDocTitle="Relazione"
      setGeneratedDocTitle={vi.fn()}
      generatedDocText={body}
      setGeneratedDocText={vi.fn()}
      handlePrintDocumentPdf={vi.fn()}
      copyText={vi.fn()}
      showToast={vi.fn()}
      institutionalProfile={profile}
    />);
    expect((modal.container.textContent?.match(/Intestazione Galileo/g) ?? [])).toHaveLength(1);
    expect((modal.container.textContent?.match(/Contatti configurati localmente/g) ?? [])).toHaveLength(1);
    modal.unmount();

    const writes: string[] = [];
    vi.spyOn(window, 'open').mockReturnValue({
      document: { write: vi.fn((value: string) => writes.push(value)), close: vi.fn() },
    } as unknown as Window);
    act(() => result.current.handlePrintDocumentPdf('Relazione', body));
    const printed = writes.join('\n');
    expect(printed.match(/Intestazione Galileo/g) ?? []).toHaveLength(1);
    expect(printed.match(/Contatti configurati localmente/g) ?? []).toHaveLength(1);
  });

  it.each([
    ['neutral', () => getA07InstitutionalDocumentRead(createEmptyInstitutionalArchive(NOW))],
    ['configured', () => getA07InstitutionalDocumentRead(configuredA04Archive())],
  ])('copies the %s generated document with the same canonical projection exactly once', async (_label, getProfile) => {
    const profile = getProfile();
    const projection = projectA07InstitutionalDocumentHeader(profile);
    const projectionLines = [projection.primaryHeading, projection.displayName, ...projection.secondaryLines]
      .filter((line): line is string => Boolean(line));
    const body = 'Contenuto didattico preservato';
    const copyText = vi.fn();
    render(<DocumentViewModal
      generatedDocTitle="Relazione"
      setGeneratedDocTitle={vi.fn()}
      generatedDocText={body}
      setGeneratedDocText={vi.fn()}
      handlePrintDocumentPdf={vi.fn()}
      copyText={copyText}
      showToast={vi.fn()}
      institutionalProfile={profile}
    />);

    await userEvent.click(screen.getByRole('button', { name: 'Copia negli Appunti' }));

    const expected = [
      ...projectionLines,
      '',
      body,
      ...(projection.footer ? ['', projection.footer] : []),
    ].join('\n');
    expect(copyText).toHaveBeenCalledWith(expected);
    const copied = String(copyText.mock.calls[0]?.[0] ?? '');
    for (const line of [...projectionLines, body, ...(projection.footer ? [projection.footer] : [])]) {
      expect(copied.split(line)).toHaveLength(2);
    }
  });

  it('renders partial institutional projections without promoting subtitle or site to the display name', () => {
    const profile = {
      configured: true,
      instituteName: 'Istituto Parziale',
      subheading: 'Sottotitolo presente',
      siteName: 'Sede Nord',
      organizationId: 'institute-partial',
    };
    render(<DocumentViewModal
      generatedDocTitle="Relazione"
      setGeneratedDocTitle={vi.fn()}
      generatedDocText="Corpo"
      setGeneratedDocText={vi.fn()}
      handlePrintDocumentPdf={vi.fn()}
      copyText={vi.fn()}
      showToast={vi.fn()}
      institutionalProfile={profile}
    />);

    expect(screen.getByText('Istituto Parziale').tagName).toBe('STRONG');
    expect(screen.getByText('Sottotitolo presente').tagName).toBe('P');
    expect(screen.getByText('Sede: Sede Nord').tagName).toBe('P');
  });

  it('uses canonical identity in register and stable local SCORM metadata without seals or presumed authorities', async () => {
    const writeText = vi.fn((_text: string) => Promise.resolve());
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
    let zipBlob: Blob | undefined;
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: vi.fn((blob: Blob) => { zipBlob = blob; return 'blob:scorm'; }),
    });
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
    const profile = getA07InstitutionalDocumentRead(configuredA04Archive('Istituto Galileo', '2027/2028', 'docente'));
    const { result } = renderHook(() => useUdaPackageHandlers({
      savedUda: [sampleUda], targetClass: '3', targetSection: 'A', showToast: vi.fn(), institutionalProfile: profile,
    }));

    act(() => result.current.copyUdaTextLocal(sampleUda.id));
    act(() => result.current.copyUdaForRegister(sampleUda.id));
    act(() => result.current.handleDownloadScormManifest(sampleUda.id));
    await waitFor(() => expect(writeText).toHaveBeenCalled());

    const localUda = String(writeText.mock.calls[0]?.[0] ?? '');
    const register = String(writeText.mock.calls[1]?.[0] ?? '');
    const scorm = await readBlob(zipBlob!);
    for (const output of [localUda, register, scorm]) {
      for (const field of ['Intestazione Galileo', 'Istituto Galileo', 'Polo formativo locale', 'Sede Centro', 'Via Roma 1', 'RMIC123456', 'Riferimenti interni configurati', '2027/2028', 'Contatti configurati localmente']) {
        expect(output).toContain(field);
      }
      expect(output).not.toMatch(A07_AUTHORITY_WORDING);
    }
    expect(register).toContain('Ruolo dichiarato: docente');
    expect(scorm).toContain('Ruolo dichiarato: docente');
    expect(scorm).not.toContain('Persona locale');
    expect(scorm).toContain('<displayName>Istituto Galileo</displayName>');
    expect(scorm).toContain(`default="${profile.organizationId}"`);
    expect(`${register}\n${scorm}`).not.toMatch(/AVIC849003|don Lorenzo Milani|MOCK_SIGNATURE|sigilloDigitale|CURRICOLO_VERTICALE_MILANI|LMS d.Istituto|Docente d.Istituto|autoinstallante/i);
  });

  it('keeps neutral SCORM personal and local without inferred author, organization claims or institutional assessment wording', async () => {
    let zipBlob: Blob | undefined;
    Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: vi.fn((blob: Blob) => { zipBlob = blob; return 'blob:neutral-scorm'; }) });
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
    const profile = getA07InstitutionalDocumentRead(createEmptyInstitutionalArchive(NOW));
    const { result } = renderHook(() => useUdaPackageHandlers({
      savedUda: [sampleUda], targetClass: '3', targetSection: 'A', showToast: vi.fn(), institutionalProfile: profile,
    }));

    act(() => result.current.handleDownloadScormManifest(sampleUda.id));
    const scorm = await readBlob(zipBlob!);

    expect(scorm).toContain('Istituto non configurato');
    expect(scorm).toContain('curmanlight-local');
    expect(scorm).not.toMatch(A07_AUTHORITY_WORDING);
    expect(scorm).not.toMatch(/Docente d.Istituto|LMS d.Istituto|PTOF|autoinstallante|certificazione|sigillo|ufficial/i);
    expect(scorm).not.toContain('Ruolo dichiarato:');
  });

  it('keeps template defaults neutral and renders the same configured identity in template and generated-document previews', () => {
    const neutral = getA07InstitutionalDocumentRead(createEmptyInstitutionalArchive(NOW));
    const template = renderHook(() => useTemplateEngine({ showToast: vi.fn(), institutionalProfile: neutral }));
    expect(template.result.current.templateJsonState).toMatchObject({
      logoLeft: '', logoRight: '', leftSignee: '', rightSignee: '',
    });

    const profile = getA07InstitutionalDocumentRead(configuredA04Archive());
    const exportView = render(<EsportazioniTab {...exportTabProps(profile)} />);
    expect(screen.getByText('Istituto Galileo')).toBeInTheDocument();
    expect(screen.getByText('Intestazione Galileo')).toBeInTheDocument();
    expect(exportView.container).not.toHaveTextContent(/Maria Letizia|Ministero dell.Istruzione|USR Campania/i);
    exportView.unmount();

    render(<DocumentViewModal
      generatedDocTitle="Relazione"
      setGeneratedDocTitle={vi.fn()}
      generatedDocText="Contenuto didattico preservato"
      setGeneratedDocText={vi.fn()}
      handlePrintDocumentPdf={vi.fn()}
      copyText={vi.fn()}
      showToast={vi.fn()}
      institutionalProfile={profile}
    />);
    expect(screen.getByText('Istituto Galileo')).toBeInTheDocument();
    expect(screen.getByText('Intestazione Galileo')).toBeInTheDocument();
    expect(screen.getByText('Contenuto didattico preservato')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).not.toHaveTextContent(/Maria Letizia|Il Dirigente Scolastico|Firma omessa/i);
  });

  it('refreshes the template assistant identity after configuration without replacing conversation history', () => {
    vi.useFakeTimers();
    try {
      const neutral = getA07InstitutionalDocumentRead(createEmptyInstitutionalArchive(NOW));
      const configured = getA07InstitutionalDocumentRead(configuredA04Archive());
      const showToast = vi.fn();
      const { result, rerender } = renderHook(
        ({ profile }) => useTemplateEngine({ showToast, institutionalProfile: profile }),
        { initialProps: { profile: neutral } },
      );
      expect(result.current.templateChatHistory[0]?.text).toContain('Istituto non configurato');

      act(() => result.current.handleSendTemplateInstruction('Carattere Times New Roman'));
      act(() => vi.advanceTimersByTime(800));
      const conversation = result.current.templateChatHistory.slice(1);

      rerender({ profile: configured });

      expect(result.current.templateChatHistory[0]?.text).toContain('Istituto Galileo');
      expect(result.current.templateChatHistory[0]?.text).not.toContain('Istituto non configurato');
      expect(result.current.templateChatHistory.slice(1)).toEqual(conversation);
      expect(conversation).toEqual([
        { sender: 'user', text: 'Carattere Times New Roman' },
        { sender: 'assistant', text: "Carattere del modello configurato su 'Times New Roman'." },
      ]);
    } finally {
      vi.useRealTimers();
    }
  });

  it('applies overlapping template instructions to the latest state and cleans pending completions on unmount', () => {
    vi.useFakeTimers();
    try {
      const profile = getA07InstitutionalDocumentRead(createEmptyInstitutionalArchive(NOW));
      const showToast = vi.fn();
      const hook = renderHook(() => useTemplateEngine({ showToast, institutionalProfile: profile }));

      act(() => {
        hook.result.current.handleSendTemplateInstruction('Margini stretti 1.5');
        hook.result.current.handleSendTemplateInstruction('Carattere Times New Roman');
        vi.advanceTimersByTime(800);
      });

      expect(hook.result.current.templateJsonState).toMatchObject({
        margins: 'Stretti (1.5cm)',
        fontFamily: 'Times New Roman, serif',
      });
      expect(hook.result.current.templateChatHistory.filter(message => message.sender === 'user').map(message => message.text)).toEqual([
        'Margini stretti 1.5',
        'Carattere Times New Roman',
      ]);
      expect(hook.result.current.templateChatHistory.filter(message => message.sender === 'assistant')).toHaveLength(3);

      const unmountedToast = vi.fn();
      const pending = renderHook(() => useTemplateEngine({ showToast: unmountedToast, institutionalProfile: profile }));
      act(() => pending.result.current.handleSendTemplateInstruction('Carattere grande 12pt'));
      expect(vi.getTimerCount()).toBe(1);
      pending.unmount();
      expect(vi.getTimerCount()).toBe(0);
      act(() => vi.runAllTimers());
      expect(unmountedToast).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });

  it('uses the canonical site in bilingual template previews and a neutral site fallback', () => {
    const neutral = getA07InstitutionalDocumentRead(createEmptyInstitutionalArchive(NOW));
    const neutralView = render(<EsportazioniTab {...exportTabProps(neutral)} templateDocType="greci" />);
    expect(neutralView.getByRole('option', { name: 'Programmazione bilingue - Sede non configurata' })).toBeInTheDocument();
    expect(neutralView.getByText('RELAZIONE DI INTERASSE BILINGUE - SEDE NON CONFIGURATA')).toBeInTheDocument();
    expect(neutralView.container).not.toHaveTextContent(/Plesso Greci/i);
    neutralView.unmount();

    const configured = getA07InstitutionalDocumentRead(configuredA04Archive());
    const configuredView = render(<EsportazioniTab {...exportTabProps(configured)} templateDocType="greci" />);
    expect(configuredView.getByRole('option', { name: 'Programmazione bilingue - Sede Centro' })).toBeInTheDocument();
    expect(configuredView.getByText('RELAZIONE DI INTERASSE BILINGUE - SEDE CENTRO')).toBeInTheDocument();
    expect(configuredView.container).not.toHaveTextContent(/Plesso Greci/i);
  });

  it('shows the incomplete configuration warning in previews while allowing personal exports', () => {
    const profile = getA07InstitutionalDocumentRead(createEmptyInstitutionalArchive(NOW));
    render(<EsportazioniTab {...exportTabProps(profile)} />);

    expect(screen.getByRole('status')).toHaveTextContent('Configurazione istituzionale incompleta');
    expect(screen.getByText('Istituto non configurato')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Genera Modello Word (.docx)' })).toBeEnabled();
  });

  it('shows the warning before register and SCORM actions without disabling personal use', () => {
    const profile = getA07InstitutionalDocumentRead(createEmptyInstitutionalArchive(NOW));
    render(<UdaDetailModal
      selectedUda={sampleUda}
      setSelectedUda={vi.fn()}
      handleDownloadScormManifest={vi.fn()}
      copyUdaForRegister={vi.fn()}
      copyUdaTextLocal={vi.fn()}
      institutionalProfile={profile}
    />);

    expect(screen.getByRole('status')).toHaveTextContent('Configurazione istituzionale incompleta');
    expect(screen.getByRole('button', { name: 'Scarica SCORM (.zip)' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Copia per Registro (Argo/ClasseViva)' })).toBeEnabled();
  });

  it('contains no former identity, preset authority, official claim or named signature in active A07 sources', () => {
    const generatedDocumentModalSource = sessionModalsSource.slice(sessionModalsSource.indexOf('interface DocumentViewModalProps'));
    const udaPackageModalSource = udaModalsSource.slice(0, udaModalsSource.indexOf('export interface OutcomesModalProps'));
    const activeA07 = [documentExportSource, udaPackageSource, templateEngineSource, exportTabSource, generatedDocumentModalSource, udaPackageModalSource].join('\n');
    expect(activeA07).not.toMatch(/AVIC849003|Calvario-Covotta|don Lorenzo Milani|Maria Letizia CML|MINISTERO DELL.ISTRUZIONE E DEL MERITO|UFFICIO SCOLASTICO REGIONALE PER LA CAMPANIA|VALIDATO ED APPROVATO DAL COLLEGIO DOCENTI|MOCK_SIGNATURE_DON_MILANI/i);
    expect(activeA07).not.toMatch(A07_SOURCE_AUTHORITY_WORDING);
    expect(udaPackageSource).not.toMatch(/Docente d.Istituto|LMS d.Istituto|PTOF|autoinstallante|certificazione d.Istituto/i);
    expect(exportTabSource).not.toMatch(/Plesso Greci/i);
  });
});
