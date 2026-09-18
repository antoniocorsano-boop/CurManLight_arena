import { describe, expect, it } from 'vitest';

function firstSource(modules: Record<string, string>): string {
  return Object.values(modules)[0] ?? '';
}

const workspaceSource = firstSource(import.meta.glob(
  '../features/documents/components/FontiWorkspace.tsx',
  { query: '?raw', import: 'default', eager: true },
) as Record<string, string>);

const taskSource = firstSource(import.meta.glob(
  '../features/documents/components/LocalCurriculumMigrationPreflightTask.tsx',
  { query: '?raw', import: 'default', eager: true },
) as Record<string, string>);

const componentsIndexSource = firstSource(import.meta.glob(
  '../features/documents/components/index.ts',
  { query: '?raw', import: 'default', eager: true },
) as Record<string, string>);

describe('R7C6C explicit local-data preflight surface', () => {
  it('keeps the technical check behind progressive disclosure in Fonti', () => {
    expect(componentsIndexSource).toContain("FontiWorkspace as FontiTab");
    expect(workspaceSource).toContain('Controllo tecnico dei dati curricolari locali');
    expect(workspaceSource).toContain('data-r7c6c-preflight-disclosure');
    expect(workspaceSource).toContain('LocalCurriculumMigrationPreflightTask');
  });

  it('requires an explicit user action and states that current persistence is unchanged', () => {
    expect(taskSource).toContain('Esegui controllo in copia');
    expect(taskSource).toContain('legacy-only');
    expect(taskSource).toContain('Non apre il database produttivo del nuovo dominio');
    expect(taskSource).toContain('Esporta ricevuta');
    expect(taskSource).toContain('Elimina ricevuta');
    expect(taskSource).not.toContain('dual-write');
    expect(taskSource).not.toContain('new-domain-primary');
  });
});
