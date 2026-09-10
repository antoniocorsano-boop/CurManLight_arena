import { describe, expect, it } from 'vitest';
import {
  OPERATIONAL_GROUPS,
  TRANSVERSAL_AXES,
  getOperationalGroupForDiscipline,
  getOperationalGroupsForDisciplines,
} from '../domain/institution/operationalGroups';

describe('Arena operational groups 2026/2027', () => {
  it('freezes exactly four primary and four lower-secondary discipline groups', () => {
    expect(OPERATIONAL_GROUPS).toHaveLength(8);
    expect(OPERATIONAL_GROUPS.filter((group) => group.order === 'primaria').map((group) => group.code)).toEqual([
      'P-G01', 'P-G02', 'P-G03', 'P-G04',
    ]);
    expect(OPERATIONAL_GROUPS.filter((group) => group.order === 'secondaria').map((group) => group.code)).toEqual([
      'S-G01', 'S-G02', 'S-G03', 'S-G04',
    ]);
  });

  it('maps the agreed disciplines to the correct secondary groups', () => {
    expect(getOperationalGroupForDiscipline('secondaria', 'italiano')?.code).toBe('S-G01');
    expect(getOperationalGroupForDiscipline('secondaria', 'latino')?.code).toBe('S-G01');
    expect(getOperationalGroupForDiscipline('secondaria', 'religione')?.code).toBe('S-G01');
    expect(getOperationalGroupForDiscipline('secondaria', 'matematica')?.code).toBe('S-G02');
    expect(getOperationalGroupForDiscipline('secondaria', 'tecnologia')?.code).toBe('S-G02');
    expect(getOperationalGroupForDiscipline('secondaria', 'secondaLingua')?.code).toBe('S-G03');
    expect(getOperationalGroupForDiscipline('secondaria', 'educazioneFisica')?.code).toBe('S-G04');
  });

  it('uses the same four-area architecture in primary with order-specific disciplines', () => {
    expect(getOperationalGroupForDiscipline('primaria', 'religione')?.code).toBe('P-G01');
    expect(getOperationalGroupForDiscipline('primaria', 'tecnologia')?.code).toBe('P-G02');
    expect(getOperationalGroupForDiscipline('primaria', 'inglese')?.code).toBe('P-G03');
    expect(getOperationalGroupForDiscipline('primaria', 'musica')?.code).toBe('P-G04');
    expect(getOperationalGroupForDiscipline('primaria', 'latino')).toBeNull();
  });

  it('deduplicates group membership when one teacher declares several disciplines in the same group', () => {
    const groups = getOperationalGroupsForDisciplines('secondaria', ['matematica', 'scienze', 'tecnologia']);
    expect(groups.map((group) => group.code)).toEqual(['S-G02']);
  });

  it('keeps Educazione civica and AI Literacy transversal instead of creating a fifth group', () => {
    expect(getOperationalGroupForDiscipline('primaria', 'educazioneCivica')).toBeNull();
    expect(getOperationalGroupForDiscipline('secondaria', 'educazioneCivica')).toBeNull();
    expect(TRANSVERSAL_AXES['educazione-civica'].routing).toBe('NUCLEUS');
    expect(TRANSVERSAL_AXES['ai-literacy'].routing).toBe('NUCLEUS');
  });
});
