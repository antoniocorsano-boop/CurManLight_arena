import { describe, expect, it } from 'vitest';
import modalSource from '../features/documents/components/AddKnowledgeSourceModal.tsx?raw';

describe('KX mobile source save feedback', () => {
  it('uses a real form submit and exposes the save lifecycle', () => {
    expect(modalSource).toContain('onSubmit={(event) => { event.preventDefault(); void save(); }}');
    expect(modalSource).toContain('type="submit"');
    expect(modalSource).toContain('data-kx-source-save-state={saveState}');
    expect(modalSource).toContain("type SaveState = 'IDLE' | 'SAVING' | 'ERROR'");
    expect(modalSource).toContain("{saveState === 'SAVING' ? 'Salvataggio…' : 'Aggiungi alla conoscenza'}");
  });

  it('keeps the modal open and reports a failed persistent write', () => {
    expect(modalSource).toContain('if (saved === false)');
    expect(modalSource).toContain('La fonte non è stata salvata.');
    expect(modalSource).toContain('Riprova senza perdere il testo inserito.');
    expect(modalSource).toContain('aria-live="assertive"');
  });
});
