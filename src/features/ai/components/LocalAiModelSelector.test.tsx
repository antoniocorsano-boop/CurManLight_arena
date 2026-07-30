import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { LocalAiModelSelector } from './LocalAiModelSelector';

describe('LocalAiModelSelector', () => {
  const defaultProps = {
    endpoint: 'http://localhost:11434',
    selectedModel: '',
    onModelSelect: vi.fn(),
  };

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('renderizza il pulsante Controlla modelli disponibili allo stato iniziale', () => {
    render(<LocalAiModelSelector {...defaultProps} />);
    expect(screen.getByText('Controlla modelli disponibili')).toBeInTheDocument();
  });

  it('non esegue chiamate al montaggio', () => {
    render(<LocalAiModelSelector {...defaultProps} />);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('mostra stato di caricamento durante la ricerca', async () => {
    vi.mocked(fetch).mockImplementation(() => new Promise(() => {}));
    render(<LocalAiModelSelector {...defaultProps} />);
    fireEvent.click(screen.getByText('Controlla modelli disponibili'));
    expect(screen.getByText('Ricerca dei modelli locali in corso...')).toBeInTheDocument();
  });

  it('chiama /api/tags dopo il clic', async () => {
    mockFetchOk({ models: [] });

    render(<LocalAiModelSelector {...defaultProps} />);
    fireEvent.click(screen.getByText('Controlla modelli disponibili'));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:11434/api/tags',
        expect.objectContaining({ method: 'GET' })
      );
    });
  });

  function mockFetchOk(body: unknown) {
    vi.mocked(fetch).mockResolvedValue({ ok: true, json: () => Promise.resolve(body) } as unknown as Response);
  }

  it('mostra elenco di modelli dopo scoperta riuscita', async () => {
    mockFetchOk({
      models: [
        { name: 'llama3.2:3b', model: 'llama3.2:3b', size: 2019393189, details: { family: 'Llama', parameterSize: '3B' } },
        { name: 'mistral:latest', model: 'mistral:latest', size: 4372824384 },
      ],
    });

    render(<LocalAiModelSelector {...defaultProps} />);
    fireEvent.click(screen.getByText('Controlla modelli disponibili'));

    await waitFor(() => {
      expect(screen.getByText('llama3.2:3b')).toBeInTheDocument();
      expect(screen.getByText('mistral:latest')).toBeInTheDocument();
    });
    expect(screen.getByText(/Modelli disponibili: 2/)).toBeInTheDocument();
  });

  it('seleziona un modello al clic', async () => {
    const onModelSelect = vi.fn();
    mockFetchOk({ models: [{ name: 'llama3.2:3b', model: 'llama3.2:3b' }] });

    render(<LocalAiModelSelector {...defaultProps} onModelSelect={onModelSelect} />);
    fireEvent.click(screen.getByText('Controlla modelli disponibili'));

    await waitFor(() => {
      expect(screen.getByText('llama3.2:3b')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('llama3.2:3b'));
    expect(onModelSelect).toHaveBeenCalledWith('llama3.2:3b');
  });

  it('mostra metadati del modello (dimensione, famiglia)', async () => {
    mockFetchOk({
      models: [{ name: 'llama3.2:3b', model: 'llama3.2:3b', size: 2019393189, details: { family: 'Llama', parameterSize: '3B' } }],
    });

    render(<LocalAiModelSelector {...defaultProps} />);
    fireEvent.click(screen.getByText('Controlla modelli disponibili'));

    await waitFor(() => {
      expect(screen.getByText(/1\.9 GB/)).toBeInTheDocument();
      expect(screen.getByText(/Llama/)).toBeInTheDocument();
    });
  });

  it('mostra messaggio per elenco vuoto', async () => {
    mockFetchOk({ models: [] });

    render(<LocalAiModelSelector {...defaultProps} />);
    fireEvent.click(screen.getByText('Controlla modelli disponibili'));

    await waitFor(() => {
      expect(screen.getByText(/Nessun modello è installato/)).toBeInTheDocument();
    });
  });

  it('mostra errore per servizio non raggiungibile', async () => {
    vi.mocked(fetch).mockRejectedValue(new TypeError('Failed to fetch'));

    render(<LocalAiModelSelector {...defaultProps} />);
    fireEvent.click(screen.getByText('Controlla modelli disponibili'));

    await waitFor(() => {
      expect(screen.getByText(/Ollama locale non è raggiungibile/)).toBeInTheDocument();
    });
  });

  it('mostra errore per risposta non valida', async () => {
    mockFetchOk({});

    render(<LocalAiModelSelector {...defaultProps} />);
    fireEvent.click(screen.getByText('Controlla modelli disponibili'));

    await waitFor(() => {
      expect(screen.getByText(/Ollama ha restituito un elenco di modelli non riconosciuto/)).toBeInTheDocument();
    });
  });

  it('mostra avviso quando modello selezionato non è più disponibile', async () => {
    mockFetchOk({ models: [{ name: 'mistral:latest', model: 'mistral:latest' }] });

    render(<LocalAiModelSelector {...defaultProps} selectedModel="llama3.2:3b" />);
    fireEvent.click(screen.getByText('Controlla modelli disponibili'));

    await waitFor(() => {
      expect(screen.getByText(/non è più presente/)).toBeInTheDocument();
    });
  });

  it('permette inserimento manuale avanzato', async () => {
    mockFetchOk({ models: [{ name: 'mistral:latest', model: 'mistral:latest' }] });

    const onModelSelect = vi.fn();
    render(<LocalAiModelSelector {...defaultProps} onModelSelect={onModelSelect} />);
    fireEvent.click(screen.getByText('Controlla modelli disponibili'));
    await waitFor(() => {
      expect(screen.getByText('Inserimento manuale avanzato')).toBeInTheDocument();
    });
  });

  it('può essere disabilitato', async () => {
    render(<LocalAiModelSelector {...defaultProps} disabled={true} />);
    const button = screen.getByText('Controlla modelli disponibili');
    expect(button).toBeDisabled();
  });

  it('mostra modello selezionato come aria-selected', async () => {
    mockFetchOk({ models: [{ name: 'llama3.2:3b', model: 'llama3.2:3b' }] });

    render(<LocalAiModelSelector {...defaultProps} selectedModel="llama3.2:3b" />);
    fireEvent.click(screen.getByText('Controlla modelli disponibili'));

    await waitFor(() => {
      const option = screen.getByRole('option', { name: /llama3.2:3b/ });
      expect(option).toHaveAttribute('aria-selected', 'true');
    });
  });
});
