import { describe, expect, it } from 'vitest';
import shellSource from '../features/documents/components/SecondBrainTab.tsx?raw';
import modalSource from '../features/documents/components/KnowledgeModals.tsx?raw';
import storageSource from '../lib/consolidatedStorage.ts?raw';

describe('KX-2 teacher-first knowledge experience', () => {
  it('starts from teacher tasks rather than the technical archive structure', () => {
    expect(shellSource).toContain('data-kx-shell="teacher-first-v2"');
    expect(shellSource).toContain('>Conoscenza</h1>');
    expect(shellSource).toContain('Cerca');
    expect(shellSource).toContain('Fonti');
    expect(shellSource).toContain('Termini');
    expect(shellSource).toContain('Relazioni');
    expect(shellSource).toContain('Aggiungi una fonte');
  });

  it('keeps the human authority boundary visible in plain language', () => {
    expect(shellSource).toContain('controlla sempre la fonte');
    expect(shellSource).toContain('decisione della scuola');
    expect(shellSource).toContain('Risposta da verificare');
    expect(modalSource).toContain('non diventa automaticamente una fonte istituzionale');
  });

  it('fails closed instead of exposing an unfinished relationship map', () => {
    expect(shellSource).toContain("secondBrainTab === 'graph' ?");
    expect(shellSource).toContain('Relazioni in preparazione');
    expect(shellSource).toContain('quando potrà mostrare collegamenti verificabili');
  });

  it('supports a real local knowledge intake path without requiring institutional connection', () => {
    expect(shellSource).toContain('setShowAddKbModal(true)');
    expect(modalSource).toContain('Aggiungi una fonte');
    expect(modalSource).toContain('.txt,.md,.csv,.json');
    expect(modalSource).toContain('Per PDF e Word, per ora copia e incolla il testo');
    expect(modalSource).toContain('Aggiungi alla conoscenza');
  });

  it('uses human source titles and keeps development documents secondary', () => {
    expect(shellSource).toContain('Curricolo della scuola');
    expect(shellSource).toContain('Normativa e riferimenti');
    expect(shellSource).toContain('Scuola e miglioramento');
    expect(shellSource).toContain('Materiali tecnici del sistema');
    expect(shellSource).toContain('Non fanno parte del percorso ordinario del docente');
  });

  it('does not expose repository filenames in the teacher-facing source catalogue', () => {
    expect(shellSource).not.toContain('01_RACCOLTA_DOCUMENTI.MD');
    expect(shellSource).not.toContain('03_QUADRO_NORMATIVO.MD');
    expect(shellSource).not.toContain('05_WIKI_SISTEMA_CML.MD');
    expect(shellSource).not.toContain('11_STATO_SVILUPPO.MD');
  });

  it('keeps long secondary explanations progressively disclosed', () => {
    expect(shellSource).toContain('<details');
    expect(shellSource).toContain('Vedi la fonte');
    expect(shellSource).toContain('Materiali tecnici del sistema');
    expect(modalSource).toContain('Che cosa succede dopo?');
  });

  it('renders the glossary as a dedicated public surface and normalizes saved legacy mojibake', () => {
    expect(shellSource).toContain("secondBrainTab === 'glossary' ? (");
    expect(shellSource).toContain(".replace(/Compito di Realt�/g, 'Compito di Realtà')");
    expect(shellSource).toContain(".replace(/Unit�/g, 'Unità')");
    expect(shellSource).toContain(".replace(/Capacit�/g, 'Capacità')");
    expect(shellSource).toContain(".replace(/abilit�/g, 'abilità')");
  });

  it('keeps the default glossary UTF-8 clean at the source', () => {
    expect(storageSource).not.toContain('�');
    expect(storageSource).toContain('Compito di Realtà');
    expect(storageSource).toContain('Unità di Apprendimento');
    expect(storageSource).toContain('Capacità di utilizzare conoscenze e abilità');
  });

  it('keeps the compatibility reader behind the human source catalogue', () => {
    expect(shellSource).toContain('data-kx-task="source-reader"');
    const readerFallback = shellSource.slice(shellSource.indexOf('data-kx-task="source-reader"'));
    expect(readerFallback).toContain('<LegacySecondBrainTab {...props} />');
    expect(shellSource).toContain('[class*="xl:grid-cols-12"] > div:first-child');
  });

  it('preserves focused-task onboarding exclusion', () => {
    expect(shellSource).toContain("new CustomEvent('arena:knowledge-open')");
  });
});
