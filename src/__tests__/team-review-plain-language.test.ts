import { describe, expect, it } from 'vitest';

const modules = import.meta.glob('../features/beta/TeamReviewWorkspace.tsx', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const source = Object.values(modules)[0] ?? '';

describe('Arena team review plain language', () => {
  it('keeps implementation jargon out of the teacher-facing copy', () => {
    expect(source).not.toContain('Membership non leggibile');
    expect(source).not.toContain('accedi al workspace Beta');
    expect(source).not.toContain('contributori attivi attesi');
    expect(source).not.toContain('Copertura del team:');
    expect(source).not.toContain('contributi correnti');
    expect(source).not.toContain('Esito del team ·');
  });

  it('uses the vocabulary teachers need during review and meetings', () => {
    expect(source).toContain('Il lavoro del team');
    expect(source).toContain('Partecipazione del team');
    expect(source).toContain('pareri personali');
    expect(source).toContain('Da discutere');
    expect(source).toContain('Decisione del team');
    expect(source).toContain('Non è ancora l’approvazione dell’Istituto');
  });
});
