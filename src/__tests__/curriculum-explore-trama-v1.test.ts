import { describe, expect, it } from 'vitest';
import technologySectionData from '../features/curriculum/data/departmentCurriculumV31.section-09.json';
import professionalReaderSource from '../features/curriculum/components/ProfessionalCurriculumReader.tsx?raw';
import exploreTramaSource from '../features/curriculum/components/CurriculumExploreTrama.tsx?raw';
import {
  buildDisciplineProjection,
  type CurriculumAnnualityProjection,
} from '../features/curriculum/components/CurriculumExploreTrama';
import type { DepartmentCurriculumSection } from '../features/curriculum/components/DepartmentCurriculumPublication';

const technologySection = technologySectionData[0] as DepartmentCurriculumSection;
const technologyProjection = buildDisciplineProjection(technologySection);

function findAnnuality(title: string): CurriculumAnnualityProjection {
  const annuality = technologyProjection.find((item) => item.title === title);
  if (!annuality) throw new Error(`Missing annuality: ${title}`);
  return annuality;
}

describe('G5 Curriculum Explore + Trama V1', () => {
  it('projects the Technology publication into annualities without creating a parallel curriculum source', () => {
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

  it('renders annual matrices as mobile-first semantic cards in the ordinary teacher exploration surface', () => {
    expect(professionalReaderSource).toContain('CurriculumExploreTrama');
    expect(professionalReaderSource).toContain('data-curriculum-integral-publication-intro');
    expect(exploreTramaSource).toContain('data-curriculum-focused-explorer');
    expect(exploreTramaSource).toContain('data-curriculum-node-cards');
    expect(exploreTramaSource).toContain('Disciplina');
    expect(exploreTramaSource).toContain('Ordine di scuola');
    expect(exploreTramaSource).toContain('Annualità');
    expect(exploreTramaSource).toContain('Esplora');
  });

  it('keeps Trama fail-closed and only connects exact repeated nucleus labels', () => {
    expect(exploreTramaSource).toContain("row.nucleus === selectedNucleus");
    expect(exploreTramaSource).toContain('data-relation-policy="same-nucleus-exact-only"');
    expect(exploreTramaSource).toContain('Nessun collegamento viene inferito o inventato.');
    expect(exploreTramaSource).toContain('La Trama non crea un raccordo semantico presunto.');
    expect(exploreTramaSource).not.toContain('fuzzy');
    expect(exploreTramaSource).not.toContain('embedding');
  });

  it('keeps the existing integral web publication and Document route available during the G5 transition', () => {
    expect(professionalReaderSource).toContain('data-curriculum-mode="web"');
    expect(professionalReaderSource).toContain('data-curriculum-mode="document"');
    expect(professionalReaderSource).toContain('data-curriculum-section-selector');
    expect(professionalReaderSource).toContain('data-curriculum-desktop-index');
    expect(professionalReaderSource).toContain('DepartmentCurriculumPublication');
    expect(professionalReaderSource).toContain('data-curriculum-document-reader');
  });
});
