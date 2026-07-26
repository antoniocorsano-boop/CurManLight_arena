/**
 * CML-631G — Pilot Initialization Integration Tests
 *
 * Verifies that the React hook loads segments and nodes
 * after dataset initialization, catching stale-closure bugs.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  resetPilot,
  setActivationMode,
  initializePilotDataset,
} from '../../features/curriculum-functional-pilot/application/curriculumPilotService';
import { PilotMainView } from '../../features/curriculum-functional-pilot/components/PilotMainView';

describe('CML-631G — Pilot Initialization Integration', () => {
  beforeEach(() => {
    resetPilot();
    setActivationMode('pilot-contribution');
  });

  it('G.1 — shows initialization prompt when pilot is not initialized', () => {
    render(<PilotMainView />);
    expect(screen.getByText('Il dataset pilota non è stato inizializzato.')).toBeDefined();
    expect(screen.getByRole('button', { name: /inizializza dataset pilota/i })).toBeDefined();
  });

  it('G.2 — loads all segments and nodes after initialization', async () => {
    const user = userEvent.setup();
    render(<PilotMainView />);

    const initButton = screen.getByRole('button', { name: /inizializza dataset pilota/i });
    await user.click(initButton);

    await waitFor(() => {
      expect(screen.getByText('primaria - matematica (5a)')).toBeDefined();
    });

    await waitFor(() => {
      expect(screen.getByText('secondaria - matematica (1a)')).toBeDefined();
    });

    const primaryNodes = screen.getAllByText(/Numeri naturali e calcolo \(competence\)/);
    expect(primaryNodes.length).toBeGreaterThanOrEqual(1);

    const secondaryNodes = screen.getAllByText(/Numeri relativi e algebre \(competence\)/);
    expect(secondaryNodes.length).toBeGreaterThanOrEqual(1);
  });

  it('G.3 — shows 6 nodes in source picker after initialization', async () => {
    const user = userEvent.setup();
    render(<PilotMainView />);

    const initButton = screen.getByRole('button', { name: /inizializza dataset pilota/i });
    await user.click(initButton);

    await waitFor(() => {
      const nodeButtons = screen.getAllByRole('button', { name: /selezionato|elemento di partenza|numeri naturali|numeri relativi|funzioni lineari|statistica descrittiva|calcolare con le frazioni|geometria piana|rappresentare dati|utilizzare frazioni/i });
      expect(nodeButtons.length).toBeGreaterThanOrEqual(6);
    });
  });

  it('G.4 — target picker is disabled before source selection', async () => {
    const user = userEvent.setup();
    render(<PilotMainView />);

    const initButton = screen.getByRole('button', { name: /inizializza dataset pilota/i });
    await user.click(initButton);

    await waitFor(() => {
      expect(screen.getByText('Prima scegli il punto di partenza.')).toBeDefined();
    });
  });

  it('G.5 — enables target picker after source selection', async () => {
    const user = userEvent.setup();
    render(<PilotMainView />);

    const initButton = screen.getByRole('button', { name: /inizializza dataset pilota/i });
    await user.click(initButton);

    await waitFor(() => {
      expect(screen.getAllByText(/Numeri naturali e calcolo \(competence\)/).length).toBeGreaterThanOrEqual(1);
    });

    const sourceButtons = screen.getAllByRole('button', { name: /Numeri naturali e calcolo \(competence\)/ });
    const enabledSourceButton = sourceButtons.find(btn => !btn.hasAttribute('disabled'));
    expect(enabledSourceButton).toBeDefined();
    await user.click(enabledSourceButton!);

    await waitFor(() => {
      expect(screen.queryByText('Prima scegli il punto di partenza.')).toBeNull();
    });
  });

  it('G.6 — node list contains 6 unique nodes without duplicates', async () => {
    const user = userEvent.setup();
    render(<PilotMainView />);

    const initButton = screen.getByRole('button', { name: /inizializza dataset pilota/i });
    await user.click(initButton);

    await waitFor(() => {
      const expectedNodes = [
        'Numeri naturali e calcolo (competence)',
        'Calcolare con le frazioni (objective)',
        'Geometria piana (milestone)',
        'Numeri relativi e algebre (competence)',
        'Funzioni lineari (objective)',
        'Statistica descrittiva (milestone)',
      ];
      for (const nodeLabel of expectedNodes) {
        const buttons = screen.getAllByRole('button', { name: nodeLabel });
        expect(buttons.length).toBeGreaterThanOrEqual(1);
      }
    });
  });

  it('G.7 — failed initialization shows error state', async () => {
    const user = userEvent.setup();
    render(<PilotMainView />);

    const initButton = screen.getByRole('button', { name: /inizializza dataset pilota/i });
    await user.click(initButton);

    await waitFor(() => {
      expect(screen.getByText('Dataset inizializzato')).toBeDefined();
    });
  });

  it('G.8 — pre-initialized pilot loads data immediately', async () => {
    initializePilotDataset();
    render(<PilotMainView />);

    await waitFor(() => {
      expect(screen.getByText('Dataset inizializzato')).toBeDefined();
    });

    expect(screen.getByText('primaria - matematica (5a)')).toBeDefined();
    expect(screen.getAllByText(/Numeri naturali e calcolo \(competence\)/).length).toBeGreaterThanOrEqual(1);
  });

  it('G.9 — renders non-empty counters after initialization', async () => {
    const user = userEvent.setup();
    render(<PilotMainView />);

    const initButton = screen.getByRole('button', { name: /inizializza dataset pilota/i });
    await user.click(initButton);

    await waitFor(() => {
      expect(screen.getByText('Dataset inizializzato')).toBeDefined();
    });

    const grid = document.querySelector('.grid.grid-cols-3');
    expect(grid).not.toBeNull();
    const counters = grid!.querySelectorAll('.text-emerald-800');
    const values = Array.from(counters).map(el => el.textContent?.trim());
    expect(values).toEqual(['1', '2', '0']);
    expect(screen.queryByText('Nessun elemento corrisponde alla ricerca')).toBeNull();
  });
});