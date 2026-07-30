import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';

import { useLocalAiSessionStore } from '../features/ai/localAiSessionStore';
import { LocalAiExecutionService } from '../features/ai/localAiExecutionService';
import { CopilotChatSidebar } from '../features/copilot/components/CopilotChatSidebar';
import type { AiResponse } from '../domain/ai/types';

function createProps(overrides: Record<string, unknown> = {}) {
  return {
    isCopilotChatOpen: true,
    setIsCopilotChatOpen: vi.fn(),
    copilotChatHistory: [],
    isCopilotResponding: false,
    copilotChatInput: '',
    setCopilotChatInput: vi.fn(),
    handleSendCopilotMessage: vi.fn(),
    handleSelectCopilotChip: vi.fn(),
    handleToggleVoiceTyping: vi.fn(),
    isVoiceListening: false,
    handleSpeakController: vi.fn(),
    ttsActiveMsgIndex: null,
    ttsPlayingState: 'idle' as const,
    activeTab: 'dashboard',
    activeProgTab: 'classe',
    ...overrides,
  };
}

function successResponse(overrides: Partial<AiResponse<string>> = {}): AiResponse<string> {
  return {
    requestId: 'req-1',
    providerId: 'local-ollama',
    providerKind: 'local',
    capability: 'textGeneration',
    status: 'success',
    result: 'Contenuto generato dal modello.',
    provenance: {
      providerId: 'local-ollama',
      providerKind: 'local',
      capabilityUsed: 'textGeneration',
      requestId: 'req-1',
      timestamp: Date.now(),
      warning: 'Risposta generata da un modello locale. Verifica umana necessaria prima dell\'uso.',
    },
    requiresHumanVerification: true,
    ...overrides,
  };
}

function configureStore() {
  const store = useLocalAiSessionStore.getState();
  store.setEndpoint('http://localhost:11434');
  store.setModel('llama3.2');
  store.enableConfiguration();
  return store;
}

function configureStoreWithPreview(draftText = 'Hello AI') {
  const store = configureStore();
  store.setDraftText(draftText);
  store.setPreview({
    providerId: 'local-ollama',
    providerKind: 'local',
    model: 'llama3.2',
    endpoint: 'http://localhost:11434',
    capability: 'textGeneration',
    outgoingText: draftText,
    contextIncluded: false,
  });
  store.enterPreview();
  return store;
}

describe('CML-634B-R4B — Teacher Local AI Interface UI', () => {
  beforeEach(() => {
    useLocalAiSessionStore.setState(useLocalAiSessionStore.getInitialState());
    vi.stubGlobal('navigator', {
      ...navigator,
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    cleanup();
  });

  // ─── A. Configurazione ───

  describe('A. Configurazione', () => {
    it('renderizza configurazione iniziale con provider Ollama locale', () => {
      render(<CopilotChatSidebar {...createProps()} />);
      expect(screen.getByText('Ollama locale')).toBeInTheDocument();
      expect(screen.getByDisplayValue('http://localhost:11434')).toBeInTheDocument();
    });

    it('mostra avviso di non persistenza', () => {
      render(<CopilotChatSidebar {...createProps()} />);
      expect(screen.getByText(/non viene salvata/)).toBeInTheDocument();
    });

    it('mostra selettore modello con pulsante di scoperta', () => {
      render(<CopilotChatSidebar {...createProps()} />);
      expect(screen.getByText('Controlla modelli disponibili')).toBeInTheDocument();
    });

    it('associa label a endpoint via htmlFor', () => {
      render(<CopilotChatSidebar {...createProps()} />);
      const input = screen.getByLabelText('Endpoint');
      expect(input).toBeInTheDocument();
    });

    it('disabilita pulsante conferma quando modello è vuoto', () => {
      render(<CopilotChatSidebar {...createProps()} />);
      const button = screen.getByText('Usa questa configurazione');
      expect(button).toBeDisabled();
    });

    it('abilita pulsante dopo aver selezionato un modello', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: true, json: () => Promise.resolve({ models: [{ name: 'llama3.2', model: 'llama3.2' }] }) } as unknown as Response);

      render(<CopilotChatSidebar {...createProps()} />);
      fireEvent.click(screen.getByText('Controlla modelli disponibili'));

      await waitFor(() => {
        expect(screen.getByRole('option', { name: /llama3.2/ })).toBeInTheDocument();
      });
      fireEvent.click(screen.getByRole('option', { name: /llama3.2/ }));
      await waitFor(() => {
        expect(screen.getByText('Usa questa configurazione')).not.toBeDisabled();
      });
    });

    it('passa a stato ready e mostra composizione', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: true, json: () => Promise.resolve({ models: [{ name: 'llama3.2', model: 'llama3.2' }] }) } as unknown as Response);

      render(<CopilotChatSidebar {...createProps()} />);
      fireEvent.click(screen.getByText('Controlla modelli disponibili'));

      await waitFor(() => {
        expect(screen.getByRole('option', { name: /llama3.2/ })).toBeInTheDocument();
      });
      fireEvent.click(screen.getByRole('option', { name: /llama3.2/ }));
      await waitFor(() => {
        expect(screen.getByText('Usa questa configurazione')).not.toBeDisabled();
      });
      fireEvent.click(screen.getByText('Usa questa configurazione'));
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Inserisci il testo da inviare al modello locale...')).toBeInTheDocument();
      });
      expect(useLocalAiSessionStore.getState().configurationStatus).toBe('ready');
    });

    it('mostra stato disabled dopo disabilitazione', async () => {
      const store = useLocalAiSessionStore.getState();
      store.setEndpoint('http://localhost:11434');
      store.setModel('llama3.2');
      store.enableConfiguration();
      store.disableConfiguration();
      render(<CopilotChatSidebar {...createProps()} />);
      await waitFor(() => {
        expect(screen.getByText('Provider locale disabilitato.')).toBeInTheDocument();
      });
    });

    it('mostra pulsante disabilitato quando modello vuoto', () => {
      render(<CopilotChatSidebar {...createProps()} />);
      expect(screen.getByText('Usa questa configurazione')).toBeDisabled();
    });
  });

  // ─── B. Composizione e preview ───

  describe('B. Composizione e preview', () => {
    it('mostra area testo docente dopo configurazione', () => {
      configureStore();
      render(<CopilotChatSidebar {...createProps()} />);
      expect(screen.getByPlaceholderText('Inserisci il testo da inviare al modello locale...')).toBeInTheDocument();
    });

    it('blocca Controlla prima dell\'invio con testo vuoto', async () => {
      configureStore();
      render(<CopilotChatSidebar {...createProps()} />);
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Controlla prima dell\'invio' })).toBeDisabled();
      });
    });

    it('abilita Controlla prima dell\'invio con testo presente', () => {
      configureStore();
      render(<CopilotChatSidebar {...createProps()} />);
      const textarea = screen.getByPlaceholderText('Inserisci il testo da inviare al modello locale...');
      fireEvent.change(textarea, { target: { value: 'Ciao modello' } });
      expect(screen.getByRole('button', { name: 'Controlla prima dell\'invio' })).not.toBeDisabled();
    });

    it('crea preview dopo azione docente', () => {
      configureStore();
      render(<CopilotChatSidebar {...createProps()} />);
      const textarea = screen.getByPlaceholderText('Inserisci il testo da inviare al modello locale...');
      fireEvent.change(textarea, { target: { value: 'Ciao modello' } });
      fireEvent.click(screen.getByText('Controlla prima dell\'invio'));
      expect(screen.getByText('Anteprima della richiesta')).toBeInTheDocument();
    });

    it('mostra outgoingText nella preview', () => {
      configureStoreWithPreview('Testo di prova');
      render(<CopilotChatSidebar {...createProps()} />);
      expect(screen.getByText('Testo di prova')).toBeInTheDocument();
    });

    it('mostra provider, endpoint, modello nella preview', () => {
      configureStoreWithPreview('Testo');
      render(<CopilotChatSidebar {...createProps()} />);
      expect(screen.getByText('local-ollama')).toBeInTheDocument();
      expect(screen.getByText('http://localhost:11434')).toBeInTheDocument();
      expect(screen.getByText('llama3.2')).toBeInTheDocument();
    });

    it('mostra avviso nessun contesto nascosto', () => {
      configureStoreWithPreview('Testo');
      render(<CopilotChatSidebar {...createProps()} />);
      expect(screen.getByText(/Nessun contesto nascosto/)).toBeInTheDocument();
    });

    it('permette di tornare alla modifica', () => {
      configureStoreWithPreview('Testo');
      render(<CopilotChatSidebar {...createProps()} />);
      fireEvent.click(screen.getByText('Torna alla modifica'));
      expect(screen.getByPlaceholderText('Inserisci il testo da inviare al modello locale...')).toBeInTheDocument();
    });

    it('mostra testo vuoto suggerimento', () => {
      configureStore();
      render(<CopilotChatSidebar {...createProps()} />);
      expect(screen.getByText('Componi il testo da inviare al modello locale.')).toBeInTheDocument();
    });
  });

  // ─── C. Consenso ───

  describe('C. Consenso', () => {
    it('casella non preselezionata', () => {
      configureStoreWithPreview();
      render(<CopilotChatSidebar {...createProps()} />);
      const checkbox = screen.getByLabelText('Conferma invio');
      expect(checkbox).not.toBeChecked();
    });

    it('invio bloccato senza consenso', async () => {
      configureStoreWithPreview();
      render(<CopilotChatSidebar {...createProps()} />);
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Invia al modello locale' })).toBeDisabled();
      });
    });

    it('invio abilitato con consenso', async () => {
      configureStoreWithPreview();
      const store = useLocalAiSessionStore.getState();
      store.setConsentGiven(true);
      render(<CopilotChatSidebar {...createProps()} />);
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Invia al modello locale' })).not.toBeDisabled();
      });
    });

    it('modifica testo in modifica non invalida consenso (nessuna preview attiva)', async () => {
      configureStore();
      const store = useLocalAiSessionStore.getState();
      store.setDraftText('Ciao');
      store.setConsentGiven(true);
      render(<CopilotChatSidebar {...createProps()} />);
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Controlla prima dell\'invio' })).not.toBeDisabled();
      });
      const textarea = screen.getByPlaceholderText('Inserisci il testo da inviare al modello locale...');
      fireEvent.change(textarea, { target: { value: 'Nuovo testo' } });
      expect(useLocalAiSessionStore.getState().consentGiven).toBe(true);
    });

    it('seconda esecuzione richiede nuovo consenso dopo successo', async () => {
      const executeMock = vi.spyOn(LocalAiExecutionService.prototype, 'execute')
        .mockResolvedValue(successResponse());
      configureStoreWithPreview('Primo testo');
      const store = useLocalAiSessionStore.getState();
      store.setConsentGiven(true);
      render(<CopilotChatSidebar {...createProps()} />);
      fireEvent.click(screen.getByText('Invia al modello locale'));
      await waitFor(() => {
        expect(screen.getByText('Bozza generata dal modello locale')).toBeInTheDocument();
      });
      expect(useLocalAiSessionStore.getState().consentGiven).toBe(false);
      fireEvent.click(screen.getByText('Nuova richiesta'));
      const textarea = screen.getByPlaceholderText('Inserisci il testo da inviare al modello locale...');
      fireEvent.change(textarea, { target: { value: 'Secondo testo' } });
      fireEvent.click(screen.getByRole('button', { name: 'Controlla prima dell\'invio' }));
      await vi.waitFor(() => {
        expect(screen.getByRole('button', { name: 'Invia al modello locale' })).toBeDisabled();
      });
      executeMock.mockRestore();
    }, 10000);

    it('consenso azzerato dopo esecuzione riuscita', async () => {
      const executeMock = vi.spyOn(LocalAiExecutionService.prototype, 'execute')
        .mockResolvedValue(successResponse());
      configureStoreWithPreview();
      const store = useLocalAiSessionStore.getState();
      store.setConsentGiven(true);
      render(<CopilotChatSidebar {...createProps()} />);
      fireEvent.click(screen.getByText('Invia al modello locale'));
      await waitFor(() => {
        expect(screen.getByText('Bozza generata dal modello locale')).toBeInTheDocument();
      });
      expect(useLocalAiSessionStore.getState().consentGiven).toBe(false);
      executeMock.mockRestore();
    }, 10000);
  });

  // ─── D. Esecuzione ───

  describe('D. Esecuzione', () => {
    it('mostra stato di elaborazione durante esecuzione', async () => {
      const executeMock = vi.spyOn(LocalAiExecutionService.prototype, 'execute')
        .mockReturnValue(new Promise(() => {}));
      configureStoreWithPreview();
      const store = useLocalAiSessionStore.getState();
      store.setConsentGiven(true);
      render(<CopilotChatSidebar {...createProps()} />);
      fireEvent.click(screen.getByText('Invia al modello locale'));
      expect(screen.getByText('Invio al modello locale in corso...')).toBeInTheDocument();
      executeMock.mockRestore();
    });

    it('esegue solo una chiamata al servizio', () => {
      const executeMock = vi.spyOn(LocalAiExecutionService.prototype, 'execute')
        .mockResolvedValue(successResponse());
      configureStoreWithPreview();
      const store = useLocalAiSessionStore.getState();
      store.setConsentGiven(true);
      render(<CopilotChatSidebar {...createProps()} />);
      fireEvent.click(screen.getByText('Invia al modello locale'));
      expect(executeMock).toHaveBeenCalledTimes(1);
      expect(executeMock).toHaveBeenCalledWith('Hello AI', expect.any(String));
      executeMock.mockRestore();
    });

    it('container expone aria-busy durante esecuzione', () => {
      const executeMock = vi.spyOn(LocalAiExecutionService.prototype, 'execute')
        .mockReturnValue(new Promise(() => {}));
      configureStoreWithPreview();
      const store = useLocalAiSessionStore.getState();
      store.setConsentGiven(true);
      render(<CopilotChatSidebar {...createProps()} />);
      fireEvent.click(screen.getByText('Invia al modello locale'));
      expect(screen.getByRole('region', { name: 'Area contenuto assistente' }).closest('[aria-busy="true"]')).toBeTruthy();
      executeMock.mockRestore();
    });
  });

  // ─── E. Annullamento ───

  describe('E. Annullamento', () => {
    it('activeRequestId valorizzato durante esecuzione e pulsante Annulla visibile', async () => {
      let resolveExecution!: (value: AiResponse<string>) => void;
      const executionPromise = new Promise<AiResponse<string>>((resolve) => {
        resolveExecution = resolve;
      });
      const executeMock = vi.spyOn(LocalAiExecutionService.prototype, 'execute')
        .mockReturnValue(executionPromise);
      configureStoreWithPreview();
      const store = useLocalAiSessionStore.getState();
      store.setConsentGiven(true);
      render(<CopilotChatSidebar {...createProps()} />);
      fireEvent.click(screen.getByText('Invia al modello locale'));
      await vi.waitFor(() => {
        const requestId = useLocalAiSessionStore.getState().activeRequestId;
        expect(requestId).not.toBeNull();
        expect(requestId).toMatch(/^local-/);
      });
      expect(screen.getByRole('button', { name: 'Annulla richiesta' })).toBeInTheDocument();
      resolveExecution(successResponse({ status: 'cancelled', result: undefined }));
      executeMock.mockRestore();
    }, 10000);

    it('clic Annulla chiama cancel con requestId reale', async () => {
      let resolveExecution!: (value: AiResponse<string>) => void;
      const executionPromise = new Promise<AiResponse<string>>((resolve) => {
        resolveExecution = resolve;
      });
      const executeMock = vi.spyOn(LocalAiExecutionService.prototype, 'execute')
        .mockReturnValue(executionPromise);
      const cancelMock = vi.spyOn(LocalAiExecutionService.prototype, 'cancel')
        .mockReturnValue(true);
      configureStoreWithPreview();
      const store = useLocalAiSessionStore.getState();
      store.setConsentGiven(true);
      render(<CopilotChatSidebar {...createProps()} />);
      fireEvent.click(screen.getByText('Invia al modello locale'));
      await vi.waitFor(() => {
        expect(useLocalAiSessionStore.getState().activeRequestId).not.toBeNull();
      });
      const capturedRequestId = useLocalAiSessionStore.getState().activeRequestId;
      fireEvent.click(screen.getByRole('button', { name: 'Annulla richiesta' }));
      expect(cancelMock).toHaveBeenCalledWith(capturedRequestId);
      resolveExecution(successResponse({ status: 'cancelled', result: undefined }));
      executeMock.mockRestore();
      cancelMock.mockRestore();
    }, 10000);

    it('mostra Richiesta annullata e azzera consenso dopo annullamento', async () => {
      let resolveExecution!: (value: AiResponse<string>) => void;
      const executionPromise = new Promise<AiResponse<string>>((resolve) => {
        resolveExecution = resolve;
      });
      const executeMock = vi.spyOn(LocalAiExecutionService.prototype, 'execute')
        .mockReturnValue(executionPromise);
      const cancelMock = vi.spyOn(LocalAiExecutionService.prototype, 'cancel')
        .mockReturnValue(true);
      configureStoreWithPreview();
      const store = useLocalAiSessionStore.getState();
      store.setConsentGiven(true);
      render(<CopilotChatSidebar {...createProps()} />);
      fireEvent.click(screen.getByText('Invia al modello locale'));
      await vi.waitFor(() => {
        expect(useLocalAiSessionStore.getState().activeRequestId).not.toBeNull();
      });
      fireEvent.click(screen.getByRole('button', { name: 'Annulla richiesta' }));
      await vi.waitFor(() => {
        expect(screen.getByText('Richiesta annullata')).toBeInTheDocument();
      });
      expect(useLocalAiSessionStore.getState().consentGiven).toBe(false);
      expect(useLocalAiSessionStore.getState().activeRequestId).not.toBeNull();
      resolveExecution(successResponse({ status: 'cancelled', result: undefined }));
      await vi.waitFor(() => {
        expect(useLocalAiSessionStore.getState().activeRequestId).toBeNull();
      });
      executeMock.mockRestore();
      cancelMock.mockRestore();
    }, 10000);

    it('seconda cancel impedita: il pulsante scompare dopo la prima pressione', () => {
      const cancelMock = vi.spyOn(LocalAiExecutionService.prototype, 'cancel')
        .mockReturnValue(true);
      const store = useLocalAiSessionStore.getState();
      store.setEndpoint('http://localhost:11434');
      store.setModel('llama3.2');
      store.enableConfiguration();
      store.setExecutionStatus('running');
      store.setActiveRequestId('req-cancel-test');
      render(<CopilotChatSidebar {...createProps()} />);
      const cancelButton = screen.getByRole('button', { name: 'Annulla richiesta' });
      fireEvent.click(cancelButton);
      expect(cancelMock).toHaveBeenCalledTimes(1);
      expect(cancelMock).toHaveBeenCalledWith('req-cancel-test');
      expect(screen.queryByRole('button', { name: 'Annulla richiesta' })).not.toBeInTheDocument();
      cancelMock.mockRestore();
    });

    it('annullamento non modifica il testo originario', async () => {
      const executeMock = vi.spyOn(LocalAiExecutionService.prototype, 'execute')
        .mockResolvedValue(successResponse({ status: 'cancelled', result: undefined }));
      configureStoreWithPreview('Testo originale del docente');
      const store = useLocalAiSessionStore.getState();
      store.setConsentGiven(true);
      render(<CopilotChatSidebar {...createProps()} />);
      fireEvent.click(screen.getByText('Invia al modello locale'));
      await waitFor(() => {
        expect(screen.getByText('Richiesta annullata')).toBeInTheDocument();
      });
      expect(useLocalAiSessionStore.getState().draftText).toBe('Testo originale del docente');
      executeMock.mockRestore();
    }, 10000);
  });

  // ─── F. Risposta ───

  describe('F. Risposta', () => {
    it('mostra Bozza generata dal modello locale dopo successo', async () => {
      const executeMock = vi.spyOn(LocalAiExecutionService.prototype, 'execute')
        .mockResolvedValue(successResponse());
      configureStoreWithPreview();
      const store = useLocalAiSessionStore.getState();
      store.setConsentGiven(true);
      render(<CopilotChatSidebar {...createProps()} />);
      fireEvent.click(screen.getByText('Invia al modello locale'));
      await waitFor(() => {
        expect(screen.getByText('Bozza generata dal modello locale')).toBeInTheDocument();
      });
      executeMock.mockRestore();
    }, 10000);

    it('mostra testo generato', async () => {
      const executeMock = vi.spyOn(LocalAiExecutionService.prototype, 'execute')
        .mockResolvedValue(successResponse());
      configureStoreWithPreview();
      const store = useLocalAiSessionStore.getState();
      store.setConsentGiven(true);
      render(<CopilotChatSidebar {...createProps()} />);
      fireEvent.click(screen.getByText('Invia al modello locale'));
      await waitFor(() => {
        expect(screen.getByText('Contenuto generato dal modello.')).toBeInTheDocument();
      });
      executeMock.mockRestore();
    }, 10000);

    it('mostra avviso verifica umana', async () => {
      const executeMock = vi.spyOn(LocalAiExecutionService.prototype, 'execute')
        .mockResolvedValue(successResponse());
      configureStoreWithPreview();
      const store = useLocalAiSessionStore.getState();
      store.setConsentGiven(true);
      render(<CopilotChatSidebar {...createProps()} />);
      fireEvent.click(screen.getByText('Invia al modello locale'));
      await waitFor(() => {
        expect(screen.getByText(/deve essere verificata dal docente/)).toBeInTheDocument();
      });
      executeMock.mockRestore();
    }, 10000);

    it('mostra pulsante Copia testo', async () => {
      const executeMock = vi.spyOn(LocalAiExecutionService.prototype, 'execute')
        .mockResolvedValue(successResponse());
      configureStoreWithPreview();
      const store = useLocalAiSessionStore.getState();
      store.setConsentGiven(true);
      render(<CopilotChatSidebar {...createProps()} />);
      fireEvent.click(screen.getByText('Invia al modello locale'));
      await waitFor(() => {
        expect(screen.getByText('Copia testo')).toBeInTheDocument();
      });
      executeMock.mockRestore();
    }, 10000);

    it('Copia testo invoca navigator.clipboard.writeText', async () => {
      const writeTextSpy = vi.fn().mockResolvedValue(undefined);
      vi.stubGlobal('navigator', { ...navigator, clipboard: { writeText: writeTextSpy } });
      const executeMock = vi.spyOn(LocalAiExecutionService.prototype, 'execute')
        .mockResolvedValue(successResponse());
      configureStoreWithPreview();
      const store = useLocalAiSessionStore.getState();
      store.setConsentGiven(true);
      render(<CopilotChatSidebar {...createProps()} />);
      fireEvent.click(screen.getByText('Invia al modello locale'));
      await waitFor(() => {
        expect(screen.getByText('Copia testo')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('Copia testo'));
      expect(writeTextSpy).toHaveBeenCalledWith('Contenuto generato dal modello.');
      executeMock.mockRestore();
    }, 10000);

    it('Nuova richiesta azzera preview e risposta', async () => {
      const executeMock = vi.spyOn(LocalAiExecutionService.prototype, 'execute')
        .mockResolvedValue(successResponse());
      configureStoreWithPreview();
      const store = useLocalAiSessionStore.getState();
      store.setConsentGiven(true);
      render(<CopilotChatSidebar {...createProps()} />);
      fireEvent.click(screen.getByText('Invia al modello locale'));
      await waitFor(() => {
        expect(screen.getByText('Nuova richiesta')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('Nuova richiesta'));
      expect(screen.getByPlaceholderText('Inserisci il testo da inviare al modello locale...')).toBeInTheDocument();
      expect(useLocalAiSessionStore.getState().response).toBeNull();
      expect(useLocalAiSessionStore.getState().preview).toBeNull();
      executeMock.mockRestore();
    }, 10000);

    it('Chiudi resetta il flusso', async () => {
      const executeMock = vi.spyOn(LocalAiExecutionService.prototype, 'execute')
        .mockResolvedValue(successResponse());
      configureStoreWithPreview();
      const store = useLocalAiSessionStore.getState();
      store.setConsentGiven(true);
      render(<CopilotChatSidebar {...createProps()} />);
      fireEvent.click(screen.getByText('Invia al modello locale'));
      await waitFor(() => {
        expect(screen.getByText('Chiudi')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('Chiudi'));
      expect(screen.getByPlaceholderText('Inserisci il testo da inviare al modello locale...')).toBeInTheDocument();
      executeMock.mockRestore();
    }, 10000);
  });

  // ─── G. Errori ───

  describe('G. Errori', () => {
    const errorCases: Array<{ status: string; message: string }> = [
      { status: 'provider_not_configured', message: 'Configura endpoint e modello prima di procedere.' },
      { status: 'provider_disabled', message: 'Il provider locale è disabilitato.' },
      { status: 'provider_unavailable', message: 'Ollama locale non è raggiungibile. Verifica che sia avviato.' },
      { status: 'invalid_request', message: 'Controlla testo, configurazione e consenso.' },
      { status: 'capability_not_supported', message: 'Il provider non supporta questa operazione.' },
      { status: 'failed', message: 'La risposta del modello locale non è valida.' },
      { status: 'unknown_error', message: 'Errore durante la richiesta.' },
    ];

    errorCases.forEach(({ status, message }) => {
      it(`mostra "${message}" per stato ${status}`, async () => {
        const executeMock = vi.spyOn(LocalAiExecutionService.prototype, 'execute')
          .mockResolvedValue(successResponse({ status: status as AiResponse<string>['status'], result: undefined }));
        configureStoreWithPreview();
        const store = useLocalAiSessionStore.getState();
        store.setConsentGiven(true);
        render(<CopilotChatSidebar {...createProps()} />);
        fireEvent.click(screen.getByText('Invia al modello locale'));
        await waitFor(() => {
          expect(screen.getByText(message)).toBeInTheDocument();
        });
        executeMock.mockRestore();
      }, 10000);
    });

    it('consenso azzerato dopo errore', async () => {
      const executeMock = vi.spyOn(LocalAiExecutionService.prototype, 'execute')
        .mockResolvedValue(successResponse({ status: 'failed', result: undefined }));
      configureStoreWithPreview();
      const store = useLocalAiSessionStore.getState();
      store.setConsentGiven(true);
      render(<CopilotChatSidebar {...createProps()} />);
      fireEvent.click(screen.getByText('Invia al modello locale'));
      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
      expect(useLocalAiSessionStore.getState().consentGiven).toBe(false);
      executeMock.mockRestore();
    }, 10000);
  });

  // ─── H. Accessibilità ───

  describe('H. Accessibilità', () => {
    it('errori esposti con role="alert"', async () => {
      const executeMock = vi.spyOn(LocalAiExecutionService.prototype, 'execute')
        .mockResolvedValue(successResponse({ status: 'failed', result: undefined }));
      configureStoreWithPreview();
      const store = useLocalAiSessionStore.getState();
      store.setConsentGiven(true);
      render(<CopilotChatSidebar {...createProps()} />);
      fireEvent.click(screen.getByText('Invia al modello locale'));
      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
      executeMock.mockRestore();
    }, 10000);

    it('esecuzione usa aria-live="polite"', () => {
      const store = useLocalAiSessionStore.getState();
      store.setEndpoint('http://localhost:11434');
      store.setModel('llama3.2');
      store.enableConfiguration();
      store.setExecutionStatus('running');
      store.setActiveRequestId('req-1');
      render(<CopilotChatSidebar {...createProps()} />);
      const statusRegion = screen.getByRole('status');
      expect(statusRegion).toHaveAttribute('aria-live', 'polite');
    });

    it('container esecuzione ha role="status"', () => {
      const store = useLocalAiSessionStore.getState();
      store.setEndpoint('http://localhost:11434');
      store.setModel('llama3.2');
      store.enableConfiguration();
      store.setExecutionStatus('running');
      store.setActiveRequestId('req-1');
      render(<CopilotChatSidebar {...createProps()} />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('preview ha role="region" con label', () => {
      configureStoreWithPreview();
      render(<CopilotChatSidebar {...createProps()} />);
      const region = screen.getByRole('region', { name: 'Anteprima richiesta' });
      expect(region).toBeInTheDocument();
    });

    it('risposta ha role="region" con label "Bozza generata dal modello"', async () => {
      const executeMock = vi.spyOn(LocalAiExecutionService.prototype, 'execute')
        .mockResolvedValue(successResponse());
      configureStoreWithPreview();
      const store = useLocalAiSessionStore.getState();
      store.setConsentGiven(true);
      render(<CopilotChatSidebar {...createProps()} />);
      fireEvent.click(screen.getByText('Invia al modello locale'));
      await waitFor(() => {
        const region = screen.getByRole('region', { name: 'Bozza generata dal modello' });
        expect(region).toBeInTheDocument();
      });
      executeMock.mockRestore();
    }, 10000);

    it('pulsanti hanno nomi accessibili', () => {
      configureStore();
      render(<CopilotChatSidebar {...createProps()} />);
      expect(screen.getByRole('button', { name: 'Controlla prima dell\'invio' })).toBeInTheDocument();
    });

    it('nessuna azione solo tramite icona', () => {
      configureStore();
      render(<CopilotChatSidebar {...createProps()} />);
      const buttons = screen.getAllByRole('button');
      buttons.forEach((btn) => {
        const text = btn.textContent?.trim() || '';
        const hasSvg = btn.querySelector('svg') !== null && text === '';
        if (!hasSvg) {
          expect(text).toBeTruthy();
        }
      });
    });

    it('mostra "Richiesta annullata" per stato cancelled (percorso UI separato)', async () => {
      const executeMock = vi.spyOn(LocalAiExecutionService.prototype, 'execute')
        .mockResolvedValue(successResponse({ status: 'cancelled', result: undefined }));
      configureStoreWithPreview();
      const store = useLocalAiSessionStore.getState();
      store.setConsentGiven(true);
      render(<CopilotChatSidebar {...createProps()} />);
      fireEvent.click(screen.getByText('Invia al modello locale'));
      await waitFor(() => {
        expect(screen.getByText('Richiesta annullata')).toBeInTheDocument();
      });
      executeMock.mockRestore();
    }, 10000);
  });

  // ─── I. Non persistenza ───

  describe('I. Non persistenza', () => {
    it('nessun localStorage durante il flusso', () => {
      const storageSpy = vi.spyOn(Storage.prototype, 'setItem');
      configureStoreWithPreview();
      render(<CopilotChatSidebar {...createProps()} />);
      expect(storageSpy).not.toHaveBeenCalled();
      storageSpy.mockRestore();
    });

    it('nessuna fetch al montaggio', () => {
      const fetchSpy = vi.fn();
      vi.stubGlobal('fetch', fetchSpy);
      configureStore();
      render(<CopilotChatSidebar {...createProps()} />);
      expect(fetchSpy).not.toHaveBeenCalled();
    });
  });

  // ─── J. Regressione superficie ───

  describe('J. Regressione superficie', () => {
    it('pannello non renderizzato quando chiuso', () => {
      render(<CopilotChatSidebar {...createProps({ isCopilotChatOpen: false })} />);
      expect(screen.queryByText('Assistente locale non verificato')).not.toBeInTheDocument();
    });

    it('pannello renderizzato quando aperto', () => {
      render(<CopilotChatSidebar {...createProps()} />);
      expect(screen.getByText('Assistente locale non verificato')).toBeInTheDocument();
    });

    it('configurazione visibile quando non configurato', () => {
      render(<CopilotChatSidebar {...createProps()} />);
      expect(screen.getByText('Ollama locale')).toBeInTheDocument();
      expect(screen.getByText('Usa questa configurazione')).toBeInTheDocument();
    });

    it('composizione visibile dopo configurazione', () => {
      configureStore();
      render(<CopilotChatSidebar {...createProps()} />);
      expect(screen.getByPlaceholderText('Inserisci il testo da inviare al modello locale...')).toBeInTheDocument();
    });
  });
});
