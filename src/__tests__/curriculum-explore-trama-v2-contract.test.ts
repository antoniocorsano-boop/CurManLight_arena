import { describe, expect, it } from 'vitest';
import technologySectionData from '../features/curriculum/data/departmentCurriculumV31.section-09.json';
import professionalReaderSource from '../features/curriculum/components/ProfessionalCurriculumReader.tsx?raw';
import exploreTramaSource from '../features/curriculum/components/CurriculumExploreTrama.tsx?raw';
import workspaceSource from '../features/curriculum/CurriculumWorkspace.tsx?raw';
import uxContractRaw from '../../.human/arena-ux.contract.json?raw';
import {
  buildCurriculumCatalog,
  buildDisciplineProjection,
  type CurriculumAnnualityProjection,
} from '../features/curriculum/components/CurriculumExploreTrama';
import {
  DEPARTMENT_CURRICULUM_SECTIONS,
  type DepartmentCurriculumSection,
} from '../features/curriculum/components/DepartmentCurriculumPublication';

const technologySection = technologySectionData[0] as DepartmentCurriculumSection;
const technologyProjection = buildDisciplineProjection(technologySection);
const catalog = buildCurriculumCatalog(DEPARTMENT_CURRICULUM_SECTIONS);
const annualizedSections = DEPARTMENT_CURRICULUM_SECTIONS.filter(
  (section) => buildDisciplineProjection(section).length > 0,
);
const ux = JSON.parse(uxContractRaw) as {
  contract_id: string;
  curriculum: { projections: string[]; annuality_selector_semantics: string };
};

function findAnnuality(title: string): CurriculumAnnualityProjection {
  const annuality = technologyProjection.find((item) => item.title === title);
  if (!annuality) throw new Error(`Missing annuality: ${title}`);
  return annuality;
}

describe('Curriculum Explore + Trama V2 — ARENA_UX_CONTRACT alignment', () => {
  it('derives the discipline catalog from annualized curriculum sections instead of fixed section numbers', () => {
    expect(catalog).toHaveLength(annualizedSections.length);
    expect(catalog.length).toBeGreaterThanOrEqual(3);
    expect(catalog.map((item) => item.label)).toEqual(expect.arrayContaining([
      'Matematica',
      'Scienze',
      'Tecnologia',
    ]));
    expect(catalog.find((item) => item.label === 'Tecnologia')?.annualities).toHaveLength(8);
    expect(exploreTramaSource).not.toContain('const DISCIPLINES');
    expect(exploreTramaSource).not.toContain('sectionNumber');
    expect(exploreTramaSource).toContain('buildCurriculumCatalog');
  });

  it('projects the same Technology source into semantic annualities without a parallel curriculum source', () => {
    expect(technologyProjection).toHaveLength(8);
    expect(technologyProjection.map((item) => item.title)).toEqual(expect.arrayContaining([
      'Primaria — classe I',
      'Primaria — classe V',
      'Secondaria — classe I',
      'Secondaria — classe III',
    ]));

    const secondaryClass1 = findAnnuality('Secondaria — classe I');
    expect(secondaryClass1.references.join(' ')).toContain('Indicazioni 2025');
    expect(secondaryClass1.rows.some((row) => row.nucleus === 'Cultura tecnica e sistemi')).toBe(true);
    expect(secondaryClass1.rows.every((row) => row.fields.length >= 5)).toBe(true);
  });

  it('keeps annuality selection independent from review state', () => {
    expect(exploreTramaSource).toContain('data-annuality-semantics="consultation-only"');
    expect(exploreTramaSource).not.toContain('preferredTechnologyAnnuality');
    expect(exploreTramaSource).not.toContain('targetRoman');
    expect(professionalReaderSource).not.toContain('targetClass: string');
    expect(ux.curriculum.annuality_selector_semantics).toBe('changes_only_the_consulted_annuality');
  });

  it('exposes the three canonical projections Esplora Trama Documento and retires Vista web as target language', () => {
    expect(ux.contract_id).toBe('ARENA_UX_CONTRACT');
    expect(ux.curriculum.projections).toEqual(['explore', 'trama', 'document']);
    expect(professionalReaderSource).toContain('data-curriculum-mode="explore"');
    expect(professionalReaderSource).toContain('data-curriculum-mode="trama"');
    expect(professionalReaderSource).toContain('data-curriculum-mode="document"');
    expect(professionalReaderSource).not.toContain('Vista web');
  });

  it('keeps Document sequential and subordinate while Explore remains semantic-card based', () => {
    expect(exploreTramaSource).toContain('data-curriculum-node-cards');
    expect(exploreTramaSource).toContain('data-curriculum-unit-card');
    expect(professionalReaderSource).toContain('data-curriculum-integral-web-publication');
    expect(professionalReaderSource).toContain('Sezione precedente');
    expect(professionalReaderSource).toContain('Sezione successiva');
    expect(professionalReaderSource).toContain('Per la consultazione ordinaria torna a Esplora o Trama.');
  });

  it('keeps Trama fail-closed with exact repeated-nucleus relations only', () => {
    expect(exploreTramaSource).toContain("row.nucleus === selectedNucleus");
    expect(exploreTramaSource).toContain('data-relation-policy="same-nucleus-exact-only"');
    expect(exploreTramaSource).toContain('Trama non lo inventa');
    expect(exploreTramaSource).toContain('Nessun raccordo presunto viene aggiunto.');
    expect(exploreTramaSource).not.toContain('embedding');
    expect(exploreTramaSource).not.toContain('fuzzy');
  });

  it('keeps contextual handoffs distinct and preserves professional context before navigation', () => {
    for (const label of [
      'Vedi nella Trama',
      'Usa in Progettazione',
      'Segnala per il Riesame',
      'Vedi fonte',
      'Apri Documento',
    ]) expect(exploreTramaSource).toContain(label);

    expect(workspaceSource).toContain('applyCurriculumContext(context)');
    expect(workspaceSource).toContain("setActiveProgTab('annuale')");
    expect(workspaceSource).toContain("handleTabSwitch('progetta-annuale')");
    expect(workspaceSource).toContain("handleTabSwitch('revisione')");
    expect(workspaceSource).toContain('data-canonical-source-review');
  });

  it('keeps internal governance jargon out of the level-1 curriculum reader', () => {
    const level1Sources = `${professionalReaderSource}\n${exploreTramaSource}`.toLowerCase();
    for (const forbiddenPhrase of [
      'riesame h2',
      'riesame h3',
      'riesame h4',
      'superficie h2',
      'fingerprint',
      'sha-256',
      'master canonico',
      'baseline corrente',
    ]) {
      expect(level1Sources).not.toContain(forbiddenPhrase);
    }
    expect(professionalReaderSource).toContain('Versione di lavoro');
    expect(professionalReaderSource).toContain('Validazione professionale aperta');
  });
});
