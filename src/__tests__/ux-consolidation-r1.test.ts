import { describe, expect, it } from 'vitest';

function firstSource(modules: Record<string, string>): string {
  return Object.values(modules)[0] ?? '';
}

const caseAware = firstSource(import.meta.glob('../features/beta/CaseAwareRevisionSurface.tsx', { query: '?raw', import: 'default', eager: true }) as Record<string, string>);
const shell = firstSource(import.meta.glob('../features/beta/CaseScopedExperienceShell.tsx', { query: '?raw', import: 'default', eager: true }) as Record<string, string>);
const shellCss = firstSource(import.meta.glob('../features/beta/CaseScopedExperienceShell.css', { query: '?raw', import: 'default', eager: true }) as Record<string, string>);
const inbox = firstSource(import.meta.glob('../features/beta/SharedReviewCaseInbox.tsx', { query: '?raw', import: 'default', eager: true }) as Record<string, string>);
const mobile = firstSource(import.meta.glob('../features/navigation/components/MobileBottomNav.tsx', { query: '?raw', import: 'default', eager: true }) as Record<string, string>);

describe('UX_CONSOLIDATION_R1', () => {
  it('keeps one case-scoped workframe and separates user, communication and technical layers', () => {
    expect(caseAware).toContain('<CaseScopedExperienceShell');
    expect(caseAware).toContain('<CaseScopedCurriculumWorkSession');
    expect(shell).toContain('data-ux-layering="L1-L2-L3"');
    expect(shell).toContain('data-hcm-level="1"');
    expect(shell).toContain('data-hcm-level="2"');
    expect(shell).toContain('data-hcm-level="3"');
    expect(shell).toContain('data-case-ux-workframe');
    expect(shell).toContain('workframeRef.current.scrollTop = 0');
  });

  it('keeps stage changes inside a stable mobile viewport instead of extending the page', () => {
    expect(shellCss).toContain('height: clamp(24rem, calc(100dvh - 13.5rem), 44rem)');
    expect(shellCss).toContain('overflow-y: auto');
    expect(shellCss).toContain('scrollbar-gutter: stable');
    expect(shellCss).toContain('[data-case-scoped-curriculum-work-session] > section:first-child');
  });

  it('keeps shared-case technical metadata out of level 1', () => {
    expect(inbox).toContain('data-hcm-level="1"');
    expect(inbox).toContain('data-hcm-level="2"');
    expect(inbox).toContain('data-hcm-level="3"');
    expect(inbox).toContain('Come funziona l’assegnazione');
    expect(inbox).toContain('Verifica e tracciabilità');
    expect(inbox.indexOf('data-hcm-level="3"')).toBeLessThan(inbox.indexOf('Caso {reviewCase.id}'));
  });

  it('projects the canonical four mobile destinations and keeps document services secondary', () => {
    expect(mobile).toContain('Il mio lavoro');
    expect(mobile).toContain('Curricolo');
    expect(mobile).toContain("handleTabSwitch('progetta-annuale')");
    expect(mobile).toContain('Riesame');
    expect(mobile).toContain('data-secondary-navigation-entry="hamburger"');
  });
});
