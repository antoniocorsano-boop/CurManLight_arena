import { describe, expect, it } from 'vitest';
import appViewsSource from '../features/session/components/AppViewsLayer.tsx?raw';
import curriculumIndexSource from '../features/curriculum/index.ts?raw';
import curriculumWorkspaceSource from '../features/curriculum/CurriculumWorkspace.tsx?raw';
import planningIndexSource from '../features/progettazione/index.ts?raw';
import planningWorkspaceSource from '../features/progettazione/PlanningWorkspace.tsx?raw';
import planningBaseSource from '../features/progettazione/components/ProgettazioneTab.tsx?raw';
import revisionSurfaceSource from '../features/beta/CaseAwareRevisionSurface.tsx?raw';

describe('R2-A — convergenza delle superfici primarie', () => {
  it('routes Curricolo through the canonical workspace and keeps the legacy copy subordinate', () => {
    expect(curriculumIndexSource).toContain("CurriculumWorkspace as CurriculumTab");
    expect(curriculumWorkspaceSource).toContain('data-canonical-curriculum-entry');
    expect(curriculumWorkspaceSource).toContain('Curricolo verticale integrale 3–14');
    expect(curriculumWorkspaceSource).toContain('Non è ancora il curricolo vigente');
    expect(curriculumWorkspaceSource).toContain('data-legacy-curriculum-disclosure');
    expect(curriculumWorkspaceSource).toContain('non il master curricolare corrente');

    expect(appViewsSource).not.toContain('Stai consultando una copia locale. Prima di usarla nella progettazione');
    expect(appViewsSource).toContain('<CurriculumTab {...props} />');
  });

  it('routes Progettazione through a context-first workspace', () => {
    expect(planningIndexSource).toContain("PlanningWorkspace as ProgettazioneTab");
    expect(planningWorkspaceSource).toContain('data-teacher-surface="planning-context-first"');
    expect(planningWorkspaceSource).toContain('Prepara il lavoro della classe');
    expect(planningWorkspaceSource).toContain('Riferimento di lavoro');
    expect(planningWorkspaceSource).toContain('master ${INSTITUTE_CURRICULUM_CURRENT_SOURCE.sourceVersion} non vigente');
    expect(planningWorkspaceSource).toContain('data-human-next-action="start-current-planning"');
    expect(planningWorkspaceSource).toContain('Altri strumenti di progettazione');
    expect(planningWorkspaceSource).toContain('Verifica e tracciabilità');
  });

  it('does not render the legacy planning home with generic suggested UDA as the primary entry', () => {
    expect(planningBaseSource).toContain('Smart Home con Blender 3D');
    expect(planningWorkspaceSource).not.toContain('Smart Home con Blender 3D');
    expect(planningWorkspaceSource).toContain("if (activeProgTab === 'home')");
    expect(planningWorkspaceSource).not.toContain('<ProgettazioneTabBase {...props} />\n      </section>');
  });

  it('keeps Riesame on the already conformant case-aware surface', () => {
    expect(appViewsSource).toContain('<CaseAwareRevisionSurface');
    expect(revisionSurfaceSource).toContain('data-revision-surface-mode="CASE_SCOPED"');
    expect(revisionSurfaceSource).toContain('data-revision-surface-mode="GENERAL"');
  });
});
