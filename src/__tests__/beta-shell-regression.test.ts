import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

function source(path: string): string {
  return readFileSync(path, 'utf8');
}

describe('Arena Beta canonical shell regression guard', () => {
  it('keeps the runtime header independent from the legacy image logo and primary AI jargon', () => {
    const header = source('src/features/navigation/components/AppHeader.tsx');

    expect(header).not.toContain('curmanlight_v20_logo.png');
    expect(header).not.toContain('<img');
    expect(header).not.toMatch(/Co-pilota Chat|Baseline d['’]Aula|Connettore LLM|Pubblicazione SCORM|Importazione studenti/i);
    expect(header).toContain('data-beta-shell="canonical"');
    expect(header).toContain('Curricolo d’istituto');
  });

  it('keeps primary navigation aligned with the institutional Beta journey', () => {
    const sidebar = source('src/features/navigation/components/AppSidebar.tsx');
    const mobile = source('src/features/navigation/components/MobileBottomNav.tsx');

    for (const text of ['Consulta il curricolo', 'Rivedi le proposte', 'Controlla le fonti', 'Crea un documento']) {
      expect(sidebar).toContain(text);
    }

    expect(sidebar).not.toMatch(/Spazio d['’]Aula|UDA condivise|WikiLLM|Compilatore UDA|Progettazione UDA|Pilota Sperimentale/i);
    expect(mobile).not.toMatch(/Progetta|Classe|Social|Copilot/i);
    expect(mobile).toContain('Curricolo');
    expect(mobile).toContain('Revisione');
    expect(mobile).toContain('Fonti');
    expect(mobile).toContain('Documenti');
  });

  it('does not present local state as votes, consensus or technical compliance on the Home', () => {
    const home = source('src/features/session/components/DashboardView.tsx');

    expect(home).not.toMatch(/Votazione|Voti Registrati|Unione Consensi|Merger|\.cml|IndexedDB|Dexie|Service Worker|WCAG|GDPR/i);
    expect(home).toContain('Preparare, controllare e decidere non sono la stessa azione');
    expect(home).toContain('Decidi solo con autorità verificata');
    expect(home).toContain('non attribuisce l’autorizzazione a decidere');
  });

  it('exposes only one navigation shell from the navigation package', () => {
    const barrel = source('src/features/navigation/index.ts');
    const app = source('src/App.tsx');

    expect(barrel).not.toMatch(/AppShell|TopBar|components\/Sidebar/);
    expect(app).toContain('AppHeader');
    expect(app).toContain('AppSidebar');
    expect(app).toContain('MobileBottomNav');
  });
});
