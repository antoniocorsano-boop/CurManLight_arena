import { describe, expect, it } from 'vitest';

const modules = import.meta.glob('../features/curriculum/components/RevisioneTab.tsx', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const source = Object.values(modules)[0] ?? '';

describe('Arena teacher curriculum workspace language', () => {
  it('keeps the teacher-oriented review workspace visible', () => {
    expect(source).toContain('Il mio lavoro nel curricolo');
    expect(source).toContain('da esaminare');
    expect(source).toContain('già esaminate');
    expect(source).toContain('modifiche proposte');
    expect(source).toContain('Perché è in revisione?');
    expect(source).toContain('Prima di scegliere, controlla tre cose');
  });

  it('uses complete professional actions without turning them into team decisions', () => {
    expect(source).toContain('Conferma proposta');
    expect(source).toContain('Propongo una modifica');
    expect(source).toContain('Mantieni testo precedente');
    expect(source).toContain('Rinvia al confronto');
    expect(source).toContain('non è una decisione del team');
    expect(source).toContain('non approva né modifica da solo il curricolo dell’Istituto');
  });
});
