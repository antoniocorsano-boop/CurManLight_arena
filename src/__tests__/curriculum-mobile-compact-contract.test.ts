import { describe, expect, it } from 'vitest';
import curriculumExploreSource from '../features/curriculum/components/CurriculumExploreTrama.tsx?raw';

describe('Curriculum mobile compact contract', () => {
  it('collapses each nucleus to one disclosure on mobile while preserving the desktop expanded path', () => {
    expect(curriculumExploreSource).toContain('data-curriculum-card-density="compact-disclosure"');
    expect(curriculumExploreSource).toContain('data-curriculum-unit-disclosure');
    expect(curriculumExploreSource).toContain('data-curriculum-unit-summary');
    expect(curriculumExploreSource).toContain('data-curriculum-unit-expanded-content');
    expect(curriculumExploreSource).toContain('sm:hidden');
    expect(curriculumExploreSource).toContain("window.matchMedia('(min-width: 640px)')");
    expect(curriculumExploreSource).toContain('const [expanded, setExpanded] = useState(desktopLayout)');
    expect(curriculumExploreSource).toContain('data-open-curriculum-trama');
    expect(curriculumExploreSource).toContain('Vedi nella Trama');
    expect(curriculumExploreSource).toContain('data-relation-policy="same-nucleus-exact-only"');

    const expandedContentIndex = curriculumExploreSource.indexOf('data-curriculum-unit-expanded-content');
    const tramaIndex = curriculumExploreSource.indexOf('data-open-curriculum-trama');
    expect(expandedContentIndex).toBeGreaterThan(-1);
    expect(tramaIndex).toBeGreaterThan(expandedContentIndex);
  });

  it('keeps source references explicitly scoped when institutional context is not configured', () => {
    expect(curriculumExploreSource).toContain('data-curriculum-reference-scope');
    expect(curriculumExploreSource).toContain('Riferimenti del fascicolo sorgente');
    expect(curriculumExploreSource).toContain('data-curriculum-reference-context-warning');
    expect(curriculumExploreSource).toContain('non attestano, da soli, l’adozione da parte dell’istituto corrente');
    expect(curriculumExploreSource).toContain('Dal fascicolo sorgente:');
  });
});
