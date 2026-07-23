import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UiConfirmDialog } from '../ui/components/UiConfirmDialog';
import progettazioneTabSrc from '../features/progettazione/components/ProgettazioneTab.tsx?raw';
import secondBrainTabSrc from '../features/documents/components/SecondBrainTab.tsx?raw';
import knowledgeModalsSrc from '../features/documents/components/KnowledgeModals.tsx?raw';
import useAppLocalHandlersSrc from '../features/session/hooks/useAppLocalHandlers.ts?raw';
import appHeaderSrc from '../features/navigation/components/AppHeader.tsx?raw';
import sessionModalsSrc from '../features/session/components/SessionModals.tsx?raw';
import esportazioniTabSrc from '../features/documents/components/EsportazioniTab.tsx?raw';

describe('CML-611 — Destructive confirmation flows', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  // ─── UiConfirmDialog component contract ───

  describe('UiConfirmDialog — component contract', () => {
    it('renders title and message when open', () => {
      render(
        <UiConfirmDialog open={true} title="Titolo" message="Corpo" onConfirm={vi.fn()} onCancel={vi.fn()} />
      );
      expect(screen.getByText('Titolo')).toBeInTheDocument();
      expect(screen.getByText('Corpo')).toBeInTheDocument();
    });

    it('renders default Conferma/Annulla labels', () => {
      render(<UiConfirmDialog open={true} title="T" message="M" onConfirm={vi.fn()} onCancel={vi.fn()} />);
      expect(screen.getByText('Annulla')).toBeInTheDocument();
      expect(screen.getByText('Conferma')).toBeInTheDocument();
    });

    it('renders custom confirm/cancel labels', () => {
      render(
        <UiConfirmDialog
          open={true} title="T" message="M"
          confirmLabel="Elimina" cancelLabel="Indietro"
          onConfirm={vi.fn()} onCancel={vi.fn()}
        />
      );
      expect(screen.getByText('Elimina')).toBeInTheDocument();
      expect(screen.getByText('Indietro')).toBeInTheDocument();
    });

    it('calls onConfirm exactly once on confirm click', async () => {
      const onConfirm = vi.fn();
      render(<UiConfirmDialog open={true} title="T" message="M" onConfirm={onConfirm} onCancel={vi.fn()} />);
      await userEvent.setup().click(screen.getByText('Conferma'));
      expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it('calls onCancel on cancel click', async () => {
      const onCancel = vi.fn();
      render(<UiConfirmDialog open={true} title="T" message="M" onConfirm={vi.fn()} onCancel={onCancel} />);
      await userEvent.setup().click(screen.getByText('Annulla'));
      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('calls onCancel on close (X) button', async () => {
      const onCancel = vi.fn();
      render(<UiConfirmDialog open={true} title="T" message="M" onConfirm={vi.fn()} onCancel={onCancel} />);
      const closeBtn = screen.getByLabelText('Chiudi');
      await userEvent.setup().click(closeBtn);
      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('calls onCancel on Escape key', async () => {
      const onCancel = vi.fn();
      render(<UiConfirmDialog open={true} title="T" message="M" onConfirm={vi.fn()} onCancel={onCancel} />);
      const dialog = document.querySelector('dialog')!;
      dialog.dispatchEvent(new KeyboardEvent('cancel'));
      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('renders even when open=false (native dialog renders but closed)', () => {
      const { container } = render(
        <UiConfirmDialog open={false} title="Hidden" message="Nope" onConfirm={vi.fn()} onCancel={vi.fn()} />
      );
      const dialog = container.querySelector('dialog');
      expect(dialog).toBeInTheDocument();
      expect(dialog).not.toHaveAttribute('open');
    });

    it('has native <dialog> element', () => {
      render(<UiConfirmDialog open={true} title="T" message="M" onConfirm={vi.fn()} onCancel={vi.fn()} />);
      expect(document.querySelector('dialog')).toBeInTheDocument();
    });

    it('renders danger variant button (rose-600 class) by default', () => {
      render(<UiConfirmDialog open={true} title="T" message="M" onConfirm={vi.fn()} onCancel={vi.fn()} />);
      const confirmBtn = screen.getByText('Conferma');
      expect(confirmBtn).toHaveClass('bg-ui-danger');
    });

    it('renders primary variant button (action class) when specified', () => {
      render(
        <UiConfirmDialog open={true} title="T" message="M" variant="primary" onConfirm={vi.fn()} onCancel={vi.fn()} />
      );
      const confirmBtn = screen.getByText('Conferma');
      expect(confirmBtn).toHaveClass('bg-ui-action');
    });
  });

  // ─── C28 — UDA single deletion ───

  describe('C28 — UDA single deletion (ProgettazioneTab)', () => {
    it('button sets udaToDelete state, not deleteUda directly', () => {
      const src = progettazioneTabSrc;
      expect(src).toContain('setUdaToDelete(u.id)');
      expect(src).not.toMatch(/onClick=\{.*\(\)\s*=>\s*deleteUda/);
    });

    it('UiConfirmDialog opens when udaToDelete is non-null', () => {
      const src = progettazioneTabSrc;
      expect(src).toContain('open={udaToDelete !== null}');
    });

    it('onConfirm calls deleteUda and clears state', () => {
      const src = progettazioneTabSrc;
      expect(src).toContain('if (udaToDelete) deleteUda(udaToDelete); setUdaToDelete(null)');
    });

    it('onCancel clears state without calling deleteUda', () => {
      const src = progettazioneTabSrc;
      expect(src).toContain('onCancel={() => setUdaToDelete(null)}');
    });

    it('dialog has danger variant', () => {
      const src = progettazioneTabSrc;
      const udaBlock = src.substring(src.indexOf('open={udaToDelete'));
      expect(udaBlock).toContain('variant="danger"');
    });

    it('dialog title and message are specific to UDA', () => {
      const src = progettazioneTabSrc;
      expect(src).toContain('Rimuovi UDA');
      expect(src).toContain('rimuovere questa UDA');
    });
  });

  // ─── C29 — Clear all UDAs ───

  describe('C29 — Clear all UDAs (ProgettazioneTab)', () => {
    it('button opens dialog, not clearUdaLibrary directly', () => {
      const src = progettazioneTabSrc;
      expect(src).toContain('setShowClearAllConfirm(true)');
      expect(src).not.toMatch(/onClick=\{clearUdaLibrary\}/);
    });

    it('onConfirm calls clearUdaLibrary exactly once', () => {
      const src = progettazioneTabSrc;
      expect(src).toContain('clearUdaLibrary(); setShowClearAllConfirm(false)');
    });

    it('onCancel clears state without calling clearUdaLibrary', () => {
      const src = progettazioneTabSrc;
      expect(src).toContain('onCancel={() => setShowClearAllConfirm(false)}');
    });

    it('dialog has danger variant and clear-specific text', () => {
      const src = progettazioneTabSrc;
      const clearBlock = src.substring(src.indexOf('open={showClearAllConfirm'));
      expect(clearBlock).toContain('variant="danger"');
      expect(clearBlock).toContain('Svuota archivio UDA');
      expect(clearBlock).toContain('tutte le UDA salvate');
    });
  });

  // ─── C30 — Custom KB doc deletion ───

  describe('C30 — Custom KB doc deletion (SecondBrainTab)', () => {
    it('button sets docToDelete, not handleDeleteCustomKbDoc directly', () => {
      const src = secondBrainTabSrc;
      expect(src).toContain('setDocToDelete(selectedBrainDoc)');
      expect(src).not.toMatch(/onClick=\{.*handleDeleteCustomKbDoc/);
    });

    it('UiConfirmDialog opens when docToDelete is non-null', () => {
      const src = secondBrainTabSrc;
      expect(src).toContain('open={docToDelete !== null}');
    });

    it('onConfirm calls handleDeleteCustomKbDoc with preserved ID', () => {
      const src = secondBrainTabSrc;
      expect(src).toContain('if (docToDelete) handleDeleteCustomKbDoc(docToDelete); setDocToDelete(null)');
    });

    it('onCancel clears state without calling handler', () => {
      const src = secondBrainTabSrc;
      expect(src).toContain('onCancel={() => setDocToDelete(null)}');
    });

    it('dialog has danger variant and KB-specific text', () => {
      const src = secondBrainTabSrc;
      const docBlock = src.substring(src.indexOf('open={docToDelete'));
      expect(docBlock).toContain('variant="danger"');
      expect(docBlock).toContain('Elimina documento');
      expect(docBlock).toContain('Second Brain');
    });
  });

  describe('C30 — Custom KB doc deletion (KnowledgeModals)', () => {
    it('button sets docToDelete, not handleDeleteCustomKbDoc directly', () => {
      const src = knowledgeModalsSrc;
      expect(src).toContain('setDocToDelete(selectedBrainDoc)');
      expect(src).not.toMatch(/onClick=\{.*handleDeleteCustomKbDoc/);
    });

    it('onConfirm calls handler with preserved ID', () => {
      const src = knowledgeModalsSrc;
      expect(src).toContain('if (docToDelete) handleDeleteCustomKbDoc(docToDelete); setDocToDelete(null)');
    });

    it('dialog has danger variant and volume-specific text', () => {
      const src = knowledgeModalsSrc;
      const volBlock = src.substring(src.indexOf('open={docToDelete'));
      expect(volBlock).toContain('variant="danger"');
      expect(volBlock).toContain('Elimina volume');
      expect(volBlock).toContain('Second Brain');
    });
  });

  // ─── C7 — Double-confirm fix ───

  describe('C7 — Double-confirm fix', () => {
    it('useAppLocalHandlers has no native confirm() call', () => {
      const src = useAppLocalHandlersSrc;
      expect(src).not.toMatch(/confirm\s*\(/);
    });

    it('handleClearLocalStorageWithReset executes resetAll directly (no guard)', () => {
      const src = useAppLocalHandlersSrc;
      const fn = src.substring(src.indexOf('handleClearLocalStorageWithReset'));
      expect(fn).toMatch(/resetAll\(\);\s*\n/);
    });

    it('AppHeader uses showResetConfirm state for reset button', () => {
      const src = appHeaderSrc;
      expect(src).toContain('const [showResetConfirm, setShowResetConfirm]');
      expect(src).toContain('setShowResetConfirm(true)');
      expect(src).not.toMatch(/onClick=\{.*handleClearLocalStorageWithReset.*setRoleDropdownOpen/);
    });

    it('AppHeader has UiConfirmDialog with reset text', () => {
      const src = appHeaderSrc;
      expect(src).toContain('UiConfirmDialog');
      expect(src).toContain('Azzera la memoria');
      expect(src).toContain('onConfirm={() => { handleClearLocalStorageWithReset(); setShowResetConfirm(false); }}');
    });

    it('SessionModals uses showResetConfirm state for reset button', () => {
      const src = sessionModalsSrc;
      expect(src).toContain('const [showResetConfirm, setShowResetConfirm]');
      expect(src).toContain('setShowResetConfirm(true)');
    });

    it('SessionModals has UiConfirmDialog with reset text', () => {
      const src = sessionModalsSrc;
      expect(src).toContain('UiConfirmDialog');
      expect(src).toContain('Azzera la memoria');
    });

    it('EsportazioniTab calls handler directly (UiConfirmDialog already guards)', () => {
      const src = esportazioniTabSrc;
      expect(src).toContain('handleClearLocalStorageWithReset();');
      expect(src).toContain('setShowResetConfirm(false)');
    });

    it('all three call sites have corresponding UiConfirmDialog', () => {
      const appHeader = appHeaderSrc;
      const sessionModals = sessionModalsSrc;
      const esportazioni = esportazioniTabSrc;

      expect(appHeader).toContain('showResetConfirm');
      expect(sessionModals).toContain('showResetConfirm');
      expect(esportazioni).toContain('showResetConfirm');
    });
  });
});
