import { describe, expect, it } from 'vitest';

const modules = import.meta.glob('../features/beta/TeamReviewWorkspace.tsx', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const source = Object.values(modules)[0] ?? '';

describe('Arena guided team meeting', () => {
  it('offers a simple point-by-point meeting path', () => {
    expect(source).toContain('data-guided-team-meeting');
    expect(source).toContain('Riunione guidata');
    expect(source).toContain('Inizia dai punti da discutere');
    expect(source).toContain('Punto da affrontare ora');
    expect(source).toContain('Perché ne parliamo?');
    expect(source).toContain('Decidi questo punto con il team');
  });

  it('moves the team toward the next open point and a clear ending', () => {
    expect(source).toContain('Arena prepara il prossimo punto ancora aperto.');
    expect(source).toContain('Avete affrontato tutti i punti aperti.');
    expect(source).toContain('decisioni del team');
    expect(source).toContain('non è l’approvazione dell’Istituto');
  });
});
