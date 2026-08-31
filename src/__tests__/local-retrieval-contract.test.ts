import { describe, expect, it } from 'vitest';
import { applyLocalRetrievalContract } from '../features/documents/lib/localRetrievalContract';

describe('R1 local retrieval contract', () => {
  it('abstains on the real vague AI action question instead of promoting an archive coincidence', () => {
    const legacy = '[WikiLLM - Analisi della fonte storica archiviata: 05_WIKI_SISTEMA_CML.md]\n\nQuesta risposta cita una fonte storica archiviata.\n\n"Stack tecnologico: React, Zustand, Dexie.js"\n\nUsa il contenuto come riferimento storico.';
    const result = applyLocalRetrievalContract('In relazione all AI cosa occorre fare?', legacy);

    expect(result.kind).toBe('INSUFFICIENT_EVIDENCE');
    expect(result.text).toContain('Non trovo nelle fonti disponibili');
    expect(result.text).not.toContain('React');
    expect(result.text).not.toContain('WikiLLM');
  });

  it('blocks the legacy success fallback when no evidence exists', () => {
    const result = applyLocalRetrievalContract(
      'xxx yyy zzz',
      'La richiesta "xxx yyy zzz" è stata elaborata con successo come risposta locale non verificata.',
    );

    expect(result.kind).toBe('INSUFFICIENT_EVIDENCE');
  });

  it('presents an explicit source-bound match as evidence, not as an answer', () => {
    const legacy = '[WikiLLM - Analisi della fonte storica archiviata: Volume 8]\n\nQuesta risposta cita una fonte storica archiviata.\n\n"Il curricolo verticale collega traguardi e obiettivi verificabili."\n\nUsa il contenuto come riferimento storico.';
    const result = applyLocalRetrievalContract('curricolo verticale traguardi', legacy);

    expect(result.kind).toBe('EVIDENCE_FOUND');
    expect(result.text).toContain('Ho trovato un passaggio');
    expect(result.text).toContain('non costituisce una risposta');
    expect(result.text).toContain('curricolo verticale');
    expect(result.text).not.toContain('WikiLLM');
    expect(result.text).not.toContain('Volume 8');
  });

  it('fails closed for legacy canned answers without a source binding', () => {
    const result = applyLocalRetrievalContract(
      'certificazione competenze',
      'La certificazione delle competenze secondo il D.M. n. 14 del 30 gennaio 2024 introduce i modelli nazionali.',
    );

    expect(result.kind).toBe('INSUFFICIENT_EVIDENCE');
  });
});
