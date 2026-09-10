import { describe, expect, it } from 'vitest';
import manifest from '../features/curriculum/data/departmentCurriculumV31.json';
import sections01to06 from '../features/curriculum/data/departmentCurriculumV31.sections-01-06.json';
import section07 from '../features/curriculum/data/departmentCurriculumV31.section-07.json';
import section08 from '../features/curriculum/data/departmentCurriculumV31.section-08.json';
import section09 from '../features/curriculum/data/departmentCurriculumV31.section-09.json';
import sections10to16 from '../features/curriculum/data/departmentCurriculumV31.sections-10-16.json';

const sections = [...sections01to06, ...section07, ...section08, ...section09, ...sections10to16];

describe('department curriculum web/document parity', () => {
  it('binds the web publication to the exact department document snapshot', () => {
    expect(manifest.schema).toBe('CML_DEPARTMENT_CURRICULUM_PUBLICATION_V1');
    expect(manifest.source.driveFileId).toBe('1VYNvik8oLAVWjwB5Y_Q960D62t-eUZRc');
    expect(manifest.source.fileName).toBe('Curricolo_verticale_Dipartimento_Scientifico_Matematico_Tecnologico_2026_2027_v3_1_READY_DIPARTIMENTO.docx');
    expect(manifest.source.modifiedAt).toBe('2026-09-09T10:34:06.480Z');
    expect(manifest.source.sha256).toBe('066dec3b85dcf7b36392902bff47b541c20a715f91d5a3352b871aaaad8726c3');
  });

  it('contains all 16 sections, 189 source blocks and 46 source tables', () => {
    expect(sections).toHaveLength(manifest.parity.sectionCount);
    expect(sections.map((section) => section.number)).toEqual(Array.from({ length: 16 }, (_, index) => index + 1));
    expect(sections.reduce((sum, section) => sum + section.blocks.length, 0)).toBe(manifest.parity.blockCount);
    expect(sections.reduce((sum, section) => sum + section.blocks.filter((block) => block.type === 'table').length, 0)).toBe(manifest.parity.tableCount);
    expect(manifest.parity).toEqual(expect.objectContaining({ sectionCount: 16, blockCount: 189, tableCount: 46 }));
  });

  it('preserves the substantive Technology progression and its annual matrices', () => {
    const technology = sections.find((section) => section.number === 9);
    expect(technology?.title).toBe('Tecnologia — curricolo verticale');
    expect(technology?.blocks.filter((block) => block.type === 'table')).toHaveLength(9);
    const serialized = JSON.stringify(technology);
    expect(serialized).toContain('metodo progettuale costituisce il processo generativo della disciplina');
    expect(serialized).toContain('Primaria — classe I');
    expect(serialized).toContain('Secondaria — classe III');
    expect(serialized).toContain('Digitale, IA e cittadinanza tecnologica');
    expect(serialized).toContain('Evidenze osservabili');
  });

  it('does not turn READY_FOR_DIPARTIMENTO into institutional approval', () => {
    const finalSection = sections.find((section) => section.number === 16);
    const serialized = JSON.stringify(finalSection);
    expect(serialized).toContain('READY_FOR_DIPARTIMENTO');
    expect(serialized).toContain('pronto per l’esame, il confronto e la validazione');
    expect(serialized).toContain('La baseline canonica precedente resta immutata fino all’approvazione formale.');
  });
});
