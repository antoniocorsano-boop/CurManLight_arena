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

describe('MOBILE-SHELL-1 regression contract', () => {
  it('uses the CurManLight brand mark as the single mobile navigation trigger', () => {
    expect(headerSource).toContain('data-mobile-navigation-trigger="brand"');
    expect(headerSource).toContain('data-brand-mark="curmanlight"');
    expect(headerSource).toContain("mobileNavigationOpen ? 'Chiudi la navigazione' : 'Apri la navigazione'");
    expect(headerSource).toContain('<X className="h-5 w-5"');
    expect(headerSource).toContain('<Layers3 className="h-5 w-5"');
    expect(headerSource).not.toContain('<Menu ');
  });

  it('keeps settings, assistant and session actions semantically distinct', () => {
    expect(headerSource).toContain('data-settings-entry="canonical"');
    expect(headerSource).toContain('aria-label="Impostazioni"');
    expect(headerSource).toContain('<Settings className="h-5 w-5"');
    expect(headerSource).toContain('data-settings-menu="canonical"');
    expect(headerSource).toContain('data-assistant-entry="bounded"');
    expect(headerSource).toContain('Apri Assistente Arena');
    expect(headerSource).toContain('Gestisci una copia della sessione');
    expect(headerSource).toContain('data-session-identity="status"');
  });

  it('synchronizes the visual mobile-menu state when navigation closes', () => {
    expect(headerSource).toContain("arena:mobile-navigation-closed");
    expect(sidebarSource).toContain("window.dispatchEvent(new CustomEvent('arena:mobile-navigation-closed'))");
  });

  it('uses modern semantic mobile navigation states and safe-area spacing', () => {
    for (const icon of ['House', 'Layers', 'ClipboardCheck', 'BookOpenCheck', 'FileText']) {
      expect(mobileSource).toContain(icon);
    }
    expect(mobileSource).toContain("aria-current={activeTab === 'dashboard' ? 'page' : undefined}");
    expect(mobileSource).toContain("env(safe-area-inset-bottom)");
    expect(mobileSource).toContain("bg-indigo-50 font-extrabold text-indigo-700");
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
});
