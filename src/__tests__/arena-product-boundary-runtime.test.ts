import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(path, 'utf8');

describe('Arena product-boundary runtime containment', () => {
  it('does not persist pupil/classroom operational state in the legacy compatibility hook', () => {
    const source = read('src/features/classroom/hooks/useClassroomSocialState.ts');

    const forbiddenPersistentKeys = [
      'curman_classroomStudentFeedback',
      'curman_shuffledStudentMap',
      'curman_exclusionsList',
      'curman_cooperativeGroups',
      'curman_activeClassTheme',
      'curman_classroomLayout',
      'curman_activeCooperativeMethod',
    ];

    forbiddenPersistentKeys.forEach(key => {
      expect(source, `legacy Arena runtime must not persist ${key}`).not.toContain(key);
    });
    expect(source).not.toContain('localStorage.getItem');
    expect(source).not.toContain('localStorage.setItem');
  });

  it('normalizes legacy classroom/social planning modes away from the canonical Arena state', () => {
    const source = read('src/store/useCurriculumStore.ts');

    expect(source).toContain('ARENA_OWNED_PROG_TABS');
    expect(source).toContain("'home'");
    expect(source).toContain("'annuale'");
    expect(source).toContain("'uda'");
    expect(source).toContain("'certificazione'");
    expect(source).toContain('normalizeArenaProgTab');
    expect(source).toContain('setActiveProgTab: (activeProgTab) => set({ activeProgTab: normalizeArenaProgTab(activeProgTab) })');
    expect(source).toContain("key === 'activeProgTab'");
  });

  it('keeps Classroom and Social out of canonical primary navigation', () => {
    const sidebar = read('src/features/navigation/components/AppSidebar.tsx');
    const routing = read('src/features/navigation/appRouting.ts');

    expect(sidebar).not.toContain('Registro d’Aula');
    expect(sidebar).not.toContain('Registro d\'Aula');
    expect(sidebar).not.toContain('Social');
    expect(routing).toContain("if (pathname.startsWith('/classroom')) return 'progetta-annuale';");
    expect(routing).toContain("if (pathname.startsWith('/social')) return 'dashboard';");
  });
});
