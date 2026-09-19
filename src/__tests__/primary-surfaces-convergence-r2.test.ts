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
    expect(curriculumWorkspaceSource).toContain('const [legacyOpen, setLegacyOpen] = useState(false)');
    expect(curriculumWorkspaceSource).not.toContain("activeCurricoloView !== 'home'");

    expect(appViewsSource).not.toContain('Stai consultando una copia locale. Prima di usarla nella progettazione');
    expect(appViewsSource).toContain('<CurriculumTab {...props} />');
  });

  it('routes Progettazione through the canonical three-layer boundary hub', () => {
    expect(planningIndexSource).toContain("PlanningWorkspace as ProgettazioneTab");
    expect(planningWorkspaceSource).toContain('data-teacher-surface="planning-boundary-hub"');
    expect(planningWorkspaceSource).toContain('data-surface-boundary="arena-atlas-docente-os"');
    expect(planningWorkspaceSource).toContain('Arena · governa');
    expect(planningWorkspaceSource).toContain('Curriculum Atlas · naviga');
    expect(planningWorkspaceSource).toContain('Docente OS · opera');
    expect(planningWorkspaceSource).toContain('Esplora in Curriculum Atlas');
    expect(planningWorkspaceSource).toContain('<PlanningHandoffPreview />');
    expect(planningWorkspaceSource).toContain('Verifica e tracciabilità');
  });

  it('quarantines broad UDA authoring from the primary Arena planning route', () => {
    expect(planningBaseSource).toContain('Smart Home con Blender 3D');
    expect(planningWorkspaceSource).not.toContain('ProgettazioneTabBase');
    expect(planningWorkspaceSource).not.toContain('Compilatore UDA');
    expect(planningWorkspaceSource).not.toContain('Archivio UDA locale');
    expect(planningWorkspaceSource).not.toContain('Programmazione Annuale delle Attività');
    expect(planningWorkspaceSource).not.toContain('Riusa e importa localmente');
    expect(planningWorkspaceSource).toContain('Cosa non si fa più in Arena');
  });

  it('keeps Riesame on the already conformant case-aware surface', () => {
    expect(appViewsSource).toContain('<CaseAwareRevisionSurface');
    expect(revisionSurfaceSource).toContain('data-revision-surface-mode="CASE_SCOPED"');
    expect(revisionSurfaceSource).toContain('data-revision-surface-mode="GENERAL"');
  });
});
