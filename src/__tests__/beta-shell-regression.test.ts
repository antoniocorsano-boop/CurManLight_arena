import { describe, expect, it } from 'vitest';

function firstSource(modules: Record<string, string>): string {
  return Object.values(modules)[0] ?? '';
}

const headerSource = firstSource(import.meta.glob('../features/navigation/components/AppHeader.tsx', {
  query: '?raw', import: 'default', eager: true,
}) as Record<string, string>);

const sidebarSource = firstSource(import.meta.glob('../features/navigation/components/AppSidebar.tsx', {
  query: '?raw', import: 'default', eager: true,
}) as Record<string, string>);

const mobileSource = firstSource(import.meta.glob('../features/navigation/components/MobileBottomNav.tsx', {
  query: '?raw', import: 'default', eager: true,
}) as Record<string, string>);

const homeSource = firstSource(import.meta.glob('../features/session/components/DashboardView.tsx', {
  query: '?raw', import: 'default', eager: true,
}) as Record<string, string>);

const navigationIndexSource = firstSource(import.meta.glob('../features/navigation/index.ts', {
  query: '?raw', import: 'default', eager: true,
}) as Record<string, string>);

const appSource = firstSource(import.meta.glob('../App.tsx', {
  query: '?raw', import: 'default', eager: true,
}) as Record<string, string>);

describe('Arena Beta canonical shell regression guard', () => {
  it('keeps the runtime header independent from the legacy image logo and primary AI jargon', () => {
    expect(headerSource).not.toContain('curmanlight_v20_logo.png');
    expect(headerSource).not.toContain('<img');
    expect(headerSource).not.toMatch(/Co-pilota Chat|Baseline d['’]Aula|Connettore LLM|Pubblicazione SCORM|Importazione studenti/i);
    expect(headerSource).toContain('data-beta-shell="canonical"');
    expect(headerSource).toContain('Curricolo d’istituto');
  });

  it('keeps primary navigation aligned with the institutional Beta journey', () => {
    for (const text of ['Consulta il curricolo', 'Rivedi le proposte', 'Controlla le fonti', 'Crea un documento']) {
      expect(sidebarSource).toContain(text);
    }

    expect(sidebarSource).not.toMatch(/Spazio d['’]Aula|UDA condivise|WikiLLM|Compilatore UDA|Progettazione UDA|Pilota Sperimentale/i);
    expect(mobileSource).not.toMatch(/Progetta|Classe|Social|Copilot/i);
    expect(mobileSource).toContain('Curricolo');
    expect(mobileSource).toContain('Revisione');
    expect(mobileSource).toContain('Fonti');
    expect(mobileSource).toContain('Documenti');
  });

  it('does not present local state as votes, consensus or technical compliance on the Home', () => {
    expect(homeSource).not.toMatch(/Votazione|Voti Registrati|Unione Consensi|Merger|\.cml|IndexedDB|Dexie|Service Worker|WCAG|GDPR/i);
    expect(homeSource).toContain('Preparare, controllare e decidere non sono la stessa azione');
    expect(homeSource).toContain('Decidi solo con autorità verificata');
    expect(homeSource).toContain('non attribuisce l’autorizzazione a decidere');
  });

  it('exposes only one navigation shell from the navigation package', () => {
    expect(navigationIndexSource).not.toMatch(/AppShell|TopBar|components\/Sidebar/);
    expect(appSource).toContain('AppHeader');
    expect(appSource).toContain('AppSidebar');
    expect(appSource).toContain('MobileBottomNav');
  });
});
