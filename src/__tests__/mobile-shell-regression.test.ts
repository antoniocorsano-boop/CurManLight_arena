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

const cssSource = firstSource(import.meta.glob('../index.css', {
  query: '?raw', import: 'default', eager: true,
}) as Record<string, string>);

describe('MOBILE-SHELL regression contract', () => {
  it('uses the CurManLight brand mark as the single mobile navigation trigger', () => {
    expect(headerSource).toContain('data-mobile-navigation-trigger="brand"');
    expect(headerSource).toContain('data-brand-mark="curmanlight"');
    expect(headerSource).toContain("mobileNavigationOpen ? 'Chiudi la navigazione' : 'Apri la navigazione'");
    expect(headerSource).toContain('<X className="h-5 w-5"');
    expect(headerSource).toContain('<Layers3 className="h-5 w-5"');
    expect(headerSource).not.toContain('<Menu ');
  });

  it('keeps settings focused on tools and maintenance', () => {
    expect(headerSource).toContain('data-settings-entry="canonical"');
    expect(headerSource).toContain('aria-label="Impostazioni"');
    expect(headerSource).toContain('<Settings className="h-5 w-5"');
    expect(headerSource).toContain('data-settings-menu="canonical"');
    expect(headerSource).toContain('Strumenti e impostazioni');
    expect(headerSource).toContain('data-assistant-entry="bounded"');
    expect(headerSource).toContain('Apri Assistente Arena');
    expect(headerSource).toContain('Copia della sessione');
    expect(headerSource).toContain('Azzera i dati locali');
  });

  it('turns the avatar into a dedicated personal and institutional profile entry', () => {
    expect(headerSource).toContain('data-profile-entry="canonical"');
    expect(headerSource).toContain('data-profile-menu="canonical"');
    expect(headerSource).toContain('Profilo e accesso');
    expect(headerSource).toContain('data-profile-scope="personal"');
    expect(headerSource).toContain('data-profile-scope="institutional"');
    expect(headerSource).toContain('data-development-no-institution="explicit"');
    expect(headerSource).toContain('Puoi continuare a lavorare senza collegare una scuola.');
    expect(headerSource).toContain('Le decisioni istituzionali restano non disponibili.');
    expect(headerSource).toContain('Collega account cloud (facoltativo)');
    expect(headerSource).toContain('Sincronizza i file');
    expect(headerSource).toContain('Disconnetti account cloud');
    expect(headerSource).not.toContain('data-session-identity="status"');
  });

  it('alternates Entra and Esci for the authenticated team session', () => {
    expect(headerSource).toContain('data-team-signin="canonical"');
    expect(headerSource).toContain('<span>Entra</span>');
    expect(headerSource).toContain('data-team-signout="canonical"');
    expect(headerSource).toContain('<span>Esci</span>');
    expect(headerSource).toContain('Accedi al lavoro del team con il tuo account Beta.');
    expect(headerSource).toContain('Termina la sessione del lavoro del team; il profilo locale resta sul dispositivo.');
    expect(headerSource).toContain("target.searchParams.set('betaIdentity', '1')");
  });

  it('synchronizes the visual mobile-menu state when navigation closes', () => {
    expect(headerSource).toContain('arena:mobile-navigation-closed');
    expect(sidebarSource).toContain("window.dispatchEvent(new CustomEvent('arena:mobile-navigation-closed'))");
  });

  it('uses a floating mobile dock with semantic navigation states and safe-area spacing', () => {
    for (const icon of ['Home', 'Layers', 'ClipboardCheck', 'BookOpenCheck', 'FileText']) {
      expect(mobileSource).toContain(icon);
    }
    expect(mobileSource).toContain('data-mobile-dock="floating"');
    expect(mobileSource).toContain('data-mobile-dock-reserved-space="canonical"');
    expect(mobileSource).toContain('h-[calc(5.75rem+env(safe-area-inset-bottom))]');
    expect(mobileSource).toContain('left-4 right-4');
    expect(mobileSource).toContain('rounded-[1.4rem]');
    expect(mobileSource).toContain("aria-current={activeTab === 'dashboard' ? 'page' : undefined}");
    expect(mobileSource).toContain('env(safe-area-inset-bottom)');
    expect(mobileSource).toContain('bg-indigo-600 text-white');
    expect(mobileSource).not.toContain('right-[22%]');
    expect(mobileSource).not.toContain('text-[9px]');
  });

  it('prevents viewport-wide horizontal scrolling while keeping wide objects scrollable', () => {
    expect(cssSource).toContain('#main-content');
    expect(cssSource).toContain('overflow-x: hidden');
    expect(cssSource).toContain('#main-content table');
    expect(cssSource).toContain('#main-content pre');
    expect(cssSource).toContain('overflow-x: auto');
    expect(cssSource).toContain('-webkit-overflow-scrolling: touch');
  });

  it('enforces one mobile gutter and section rhythm for teacher-facing surfaces', () => {
    expect(cssSource).toContain('--ui-mobile-gutter: 16px');
    expect(cssSource).toContain('--ui-mobile-section-gap: 12px');
    expect(cssSource).toContain('[data-teacher-surface]');
    expect(cssSource).toContain('padding: var(--ui-mobile-gutter)');
    expect(cssSource).toContain('margin-top: var(--ui-mobile-section-gap)');
  });
});
