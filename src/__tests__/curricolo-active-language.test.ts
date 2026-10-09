import { describe, expect, it } from 'vitest';
import readmeSource from '../../README.md?raw';
import securitySource from '../../SECURITY.md?raw';
import surfaceBoundarySource from '../../docs/architecture/ARENA_ATLAS_DOCENTE_OS_SURFACE_BOUNDARY_M4S4.md?raw';
import roadmapSource from '../../docs/architecture/ARENA_PRODUCT_ROADMAP_2026_2027.md?raw';
import operationsRunbookSource from '../../docs/architecture/ARENA_M4_OPERATIONS_RUNBOOK.md?raw';
import provisionalPublicationSource from '../../docs/governance/ARENA-ATLAS-PROVISIONAL-PUBLICATION-01.md?raw';

const visibleProse = (source: string): string => source
  .replace(/`[^`\n]+`/g, '')
  .replace(/\]\([^\n)]+\)/g, ']')
  .replace(/https?:\/\/\S+/g, '');

const expectCanonicalCurricoloLanguage = (source: string) => {
  expect(visibleProse(source)).not.toMatch(/\bcurriculum\b/i);
};

describe('TRAMA-TERM-01 — linguaggio canonico nelle superfici Arena attive', () => {
  it('usa curricolo nella README di prodotto', () => expectCanonicalCurricoloLanguage(readmeSource));
  it('usa Atlas e curricolo nella policy di sicurezza', () => expectCanonicalCurricoloLanguage(securitySource));
  it('usa Atlas e curricolo nel boundary Arena/Atlas/Docente OS', () => expectCanonicalCurricoloLanguage(surfaceBoundarySource));
  it('usa curricolo nella roadmap corrente', () => expectCanonicalCurricoloLanguage(roadmapSource));
  it('usa curricolo nel runbook operativo corrente', () => expectCanonicalCurricoloLanguage(operationsRunbookSource));
  it('pubblica la dicitura “Curricolo provvisorio — non vigente”', () => {
    expectCanonicalCurricoloLanguage(provisionalPublicationSource);
    expect(provisionalPublicationSource).toContain('Curricolo provvisorio — non vigente');
  });
});
