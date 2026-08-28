import { describe, expect, it } from 'vitest';
import shellSource from '../features/documents/components/SecondBrainTab.tsx?raw';

describe('KX-1 knowledge experience shell', () => {
  it('uses the canonical task-first labels', () => {
    expect(shellSource).toContain('Conoscenza e fonti');
    expect(shellSource).toContain('Cerca e chiedi');
    expect(shellSource).toContain('Relazioni');
    expect(shellSource).toContain('Termini chiave');
    expect(shellSource).toContain('Archivio storico');
  });

  it('keeps the human authority boundary visible', () => {
    expect(shellSource).toContain('restano da verificare');
    expect(shellSource).toContain('decisione istituzionale');
    expect(shellSource).toContain('Risposta da verificare');
  });

  it('fails closed instead of exposing the legacy technical graph', () => {
    expect(shellSource).toContain("secondBrainTab === 'graph' ?");
    expect(shellSource).toContain('Relazioni in preparazione');
    expect(shellSource).toContain('La vecchia mappa tecnica non viene mostrata');
  });

  it('makes ask/search the dominant action instead of rendering the archive workspace', () => {
    expect(shellSource).toContain("isSearchActive ? (");
    expect(shellSource).toContain('Che cosa vuoi capire?');
    expect(shellSource).toContain('Cerca nelle fonti');
    expect(shellSource).toContain('La risposta comparirà qui');
  });

  it('renders the glossary as a dedicated public surface and normalizes known mojibake', () => {
    expect(shellSource).toContain("secondBrainTab === 'glossary' ? (");
    expect(shellSource).toContain(".replace(/Unit�/g, 'Unità')");
    expect(shellSource).toContain(".replace(/Capacit�/g, 'Capacità')");
    expect(shellSource).toContain(".replace(/abilit�/g, 'abilità')");
    expect(shellSource).toContain('Definizione locale');
  });

  it('keeps the compatibility implementation behind Archive only', () => {
    expect(shellSource).toContain('data-kx-task="archive"');
    const archiveFallback = shellSource.slice(shellSource.indexOf('data-kx-task="archive"'));
    expect(archiveFallback).toContain('<LegacySecondBrainTab {...props} />');
  });

  it('hides the legacy workspace selector inside Archive', () => {
    expect(shellSource).toContain('.kx-legacy-shell[data-kx-task="archive"] [class*="xl:col-span-8"] > div:first-child');
    expect(shellSource).not.toContain('.kx-legacy-shell[data-kx-task="brain"] [class*="xl:col-span-8"] > div:first-child');
  });

  it('preserves focused-task onboarding exclusion', () => {
    expect(shellSource).toContain("new CustomEvent('arena:knowledge-open')");
  });
});
