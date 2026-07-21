import { describe, it, expect } from 'vitest';
import {
 detectDiscipline,
 scoreVolumeByTerms,
 findBestVolumeMatch,
 generateWikiResponse,
 type WikiVolume,
 type WikiCustomDoc,
} from '../lib/wikiLLM';

// ─── detectDiscipline ───────────────────────────────────────────────────────

describe('detectDiscipline', () => {
 it('detects tecnologia keywords', () => {
  expect(detectDiscipline('parliamo di coding', 'italiano')).toBe('tecnologia');
  expect(detectDiscipline('ia e algoritmi', 'scienze')).toBe('tecnologia');
 });

 it('detects scienze keywords', () => {
  expect(detectDiscipline('scienze naturali', 'italiano')).toBe('scienze');
  expect(detectDiscipline('esperimento galileiano', 'storia')).toBe('scienze');
 });

 it('detects storia keywords', () => {
  // word-boundary: 'ia' inside 'storia' does NOT match tecnologia
  expect(detectDiscipline('storia romana', 'geografia')).toBe('storia');
  expect(detectDiscipline('il corso di storia', 'geografia')).toBe('storia');
 });

 it('detects geografia keywords', () => {
  expect(detectDiscipline('mappa del territorio', 'storia')).toBe('geografia');
 });

 it('detects latino keywords', () => {
  expect(detectDiscipline('elementi di latino', 'inglese')).toBe('latino');
  expect(detectDiscipline('LEL lingua', 'tecnologia')).toBe('latino');
 });

 it('detects inglese', () => {
  expect(detectDiscipline('lingua inglese', 'storia')).toBe('inglese');
 });

 it('detects seconda lingua / francese', () => {
  expect(detectDiscipline('francese B1', 'italiano')).toBe('secondaLingua');
  expect(detectDiscipline('seconda lingua', 'storia')).toBe('secondaLingua');
 });

 it('returns default when no keyword matches', () => {
  expect(detectDiscipline('qualcosa di generico', 'musica')).toBe('musica');
  expect(detectDiscipline('', 'arte')).toBe('arte');
 });
});

// ─── scoreVolumeByTerms ─────────────────────────────────────────────────────

describe('scoreVolumeByTerms', () => {
 it('counts exact matches', () => {
  expect(scoreVolumeByTerms('il gatto mangia il gatto', ['gatto'])).toBe(2);
 });

 it('is case-insensitive', () => {
  expect(scoreVolumeByTerms('GATTO grande', ['gatto'])).toBe(1);
 });

 it('handles multiple terms', () => {
  expect(scoreVolumeByTerms('programmazione curricolare verticale', ['programmazione', 'verticale'])).toBe(2);
 });

 it('returns 0 for no matches', () => {
  expect(scoreVolumeByTerms('testo senza parole chiave', ['gatto'])).toBe(0);
 });

 it('handles empty terms array', () => {
  expect(scoreVolumeByTerms('qualunque testo', [])).toBe(0);
 });

 it('handles regex-special chars in terms without throwing', () => {
  expect(() => scoreVolumeByTerms('test', ['(x+y)*'])).not.toThrow();
  expect(scoreVolumeByTerms('test', ['(x+y)*'])).toBe(0);
 });

 it('counts partial matches within words', () => {
  // "prog" matches inside "programmazione"
  expect(scoreVolumeByTerms('programmazione', ['prog'])).toBe(1);
 });
});

// ─── findBestVolumeMatch ────────────────────────────────────────────────────

describe('findBestVolumeMatch', () => {
 const volumes: WikiVolume[] = [
  { id: 'vol1', title: 'Volume 1', text: 'programmazione curricolare verticale' },
  { id: 'vol2', title: 'Volume 2', text: 'valutazione competenze livelli' },
  { id: 'vol3', title: 'Volume 3', text: 'programmazione valutazione inclusione' },
 ];

 it('finds the volume with highest score', () => {
  const result = findBestVolumeMatch('programmazione valutazione', volumes);
  expect(result).not.toBeNull();
  expect(result!.bestVolId).toBe('vol3'); // has both terms
  expect(result!.maxScore).toBeGreaterThanOrEqual(2);
 });

 it('returns null when below threshold', () => {
  const result = findBestVolumeMatch('xyz', volumes, 10);
  expect(result).toBeNull();
 });

 it('returns null for empty query terms', () => {
  // query with only 1-2 char words → no terms after filter
  const result = findBestVolumeMatch('a b', volumes);
  expect(result).toBeNull();
 });

 it('includes matchedParagraph excerpt', () => {
  const result = findBestVolumeMatch('programmazione curricolare verticale', volumes);
  expect(result).not.toBeNull();
  expect(result!.matchedParagraph).toMatch(/programmazione|curricolare|verticale/i);
 });

 it('truncates paragraph to ~450 chars', () => {
  const longVol: WikiVolume[] = [
   { id: 'vol1', title: 'V1', text: 'a '.repeat(500) + 'term here' },
  ];
  const result = findBestVolumeMatch('term here', longVol);
  expect(result).not.toBeNull();
  expect(result!.matchedParagraph.length).toBeLessThan(600);
 });
});

// ─── generateWikiResponse ───────────────────────────────────────────────────

const baseParams = {
 discipline: 'italiano',
 order: 'primaria',
 customDocs: [] as WikiCustomDoc[],
 volumes: [
  { id: 'vol1', title: 'Volume Test', text: 'programmazione curricolare verticale' },
 ] as WikiVolume[],
 getVolumeTitle: (id: string) => `Volume ${id}`,
};

describe('generateWikiResponse', () => {
 it('returns custom doc response when title matches', () => {
  const doc: WikiCustomDoc = { id: 'd1', title: 'Regolamento Interno', subtitle: 'Linee guida', content: 'Contenuto del regolamento' };
  const res = generateWikiResponse({ ...baseParams, query: 'parla del Regolamento Interno', customDocs: [doc] });
  expect(res).toContain("Analisi del Documento Caricato: Regolamento Interno");
  expect(res).toContain('Regolamento Interno');
 });

 it('returns volume 13 response for roadmap keyword', () => {
  const res = generateWikiResponse({ ...baseParams, query: 'parliamo di roadmap' });
  expect(res).toContain('Volume 13');
  expect(res).toContain('5.8%');
 });

 it('returns volume 14 response for social keyword', () => {
  const res = generateWikiResponse({ ...baseParams, query: 'bacheca social' });
  expect(res).toContain('Volume 14');
  expect(res).toContain('GDPR');
 });

 it('returns DM 14/2024 response for certificazione keyword', () => {
  const res = generateWikiResponse({ ...baseParams, query: 'certificazione competenze' });
  expect(res).toContain('D.M. n. 14');
 });

 it('returns discipline-specific response for storia', () => {
  // word-boundary: 'ia' inside 'storia' does NOT match tecnologia → correctly detects storia
  const res = generateWikiResponse({ ...baseParams, query: 'storia romana' });
  expect(res).toContain('Basso Medioevo');
  expect(res).toContain('D.M. 221/2025');
 });

 it('returns semantic search fallback for unmatched queries', () => {
  const res = generateWikiResponse({ ...baseParams, query: 'programmazione curricolare verticale' });
  // Should either find a volume match or return fallback
  expect(res.length).toBeGreaterThan(50);
 });

 it('returns fallback when no volumes match', () => {
  const res = generateWikiResponse({ ...baseParams, query: 'xxx yyy zzz', volumes: [] });
  expect(res).toContain('elaborata con successo');
  expect(res).toContain('ITALIANO');
 });

 it('detects discipline from query and uses discipline-specific response', () => {
  // "mappa del territorio" → geografia-specific response (not fallback)
  const res = generateWikiResponse({ ...baseParams, query: 'mappa del territorio', volumes: [] });
  expect(res).toContain('Geografia');
  expect(res).toContain('GIS');
 });

 it('handles custom doc with short content', () => {
  const doc: WikiCustomDoc = { id: 'd2', title: 'Brevissimo', subtitle: 'Sub', content: 'Corto' };
  const res = generateWikiResponse({ ...baseParams, query: 'parla di Brevissimo', customDocs: [doc] });
  expect(res).toContain('Brevissimo');
  expect(res).not.toContain('...'); // content is short, no truncation
 });

 it('handles custom doc with long content (truncation)', () => {
  const doc: WikiCustomDoc = { id: 'd3', title: 'Lungo', subtitle: 'Sub', content: 'x'.repeat(600) };
  const res = generateWikiResponse({ ...baseParams, query: 'parla di Lungo', customDocs: [doc] });
  expect(res).toContain('Lungo');
  expect(res).toContain('...');
 });
});
