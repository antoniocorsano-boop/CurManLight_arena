import { describe, expect, it } from 'vitest';
import planningWorkspaceSource from '../features/progettazione/PlanningWorkspace.tsx?raw';
import planningIndexSource from '../features/progettazione/index.ts?raw';
import legacyPlanningSource from '../features/progettazione/components/ProgettazioneTab.tsx?raw';
import supportGuideSource from '../features/session/components/SupportGuideView.tsx?raw';
import supportVerificationSource from '../features/session/components/SupportVerificationView.tsx?raw';

describe('M4-S4 Arena / Atlas / Docente OS surface boundary', () => {
  it('keeps the primary Arena planning route on the boundary hub', () => {
    expect(planningIndexSource).toContain("PlanningWorkspace as ProgettazioneTab");
    expect(planningWorkspaceSource).toContain('data-teacher-surface="planning-boundary-hub"');
    expect(planningWorkspaceSource).toContain('data-surface-boundary="arena-atlas-docente-os"');
    expect(planningWorkspaceSource).toContain('Arena · governa');
    expect(planningWorkspaceSource).toContain('Curriculum Atlas · naviga');
    expect(planningWorkspaceSource).toContain('Docente OS · opera');
  });

  it('does not expose broad operational authoring from the primary Arena route', () => {
    expect(legacyPlanningSource).toContain('Compilatore Unità di Apprendimento');
    expect(planningWorkspaceSource).not.toContain('ProgettazioneTabBase');
    expect(planningWorkspaceSource).not.toContain('handleGenerateUda');
    expect(planningWorkspaceSource).not.toContain('saveProgDraft');
    expect(planningWorkspaceSource).not.toContain('handleCloneUdaAdaptive');
    expect(planningWorkspaceSource).not.toContain('Riusa e importa localmente');
    expect(planningWorkspaceSource).not.toContain('Programmazione Annuale delle Attività');
  });

  it('presents Curriculum Atlas as read-only navigation, never authority', () => {
    expect(planningWorkspaceSource).toContain('https://antoniocorsano-boop.github.io/Curriculum-Atlas/');
    expect(planningWorkspaceSource).toContain('Anteprima S1 pubblica · sola consultazione.');
    expect(planningWorkspaceSource).toContain('L’anteprima non approva né modifica il curricolo.');
    expect(planningWorkspaceSource).toContain('Atlas è una proiezione di consultazione e non trasferisce autorità.');
    expect(planningWorkspaceSource).toContain("sourceProduct: 'curmanlight-arena'");
    expect(planningWorkspaceSource).toContain('masterId: CANONICAL_MASTER_ID');
    expect(planningWorkspaceSource).toContain('masterVersion: INSTITUTE_CURRICULUM_CURRENT_SOURCE.sourceVersion');
    expect(planningWorkspaceSource).toContain('discipline: input.discipline');
    expect(planningWorkspaceSource).toContain('order: input.order');
    expect(planningWorkspaceSource).toContain('classLevel: input.targetClass');
    expect(planningWorkspaceSource).toContain('data-atlas-handoff="read-only-context"');
  });

  it('keeps the Docente OS transition explicit and versioned', () => {
    expect(planningWorkspaceSource).toContain('<PlanningHandoffPreview />');
    expect(planningWorkspaceSource).toContain('Docente OS deve accettarlo prima di usarlo');
    expect(supportGuideSource).toContain('Arena prepara un contesto curricolare versionato');
    expect(supportVerificationSource).toContain('Docente OS dovrà accettarlo prima di usarlo');
  });

  it('teaches the same three-layer model in support surfaces', () => {
    expect(supportGuideSource).toContain('Esplorare relazioni in Curriculum Atlas');
    expect(supportGuideSource).toContain('Curriculum Atlas rende il curricolo leggibile e navigabile');
    expect(supportVerificationSource).toContain('Confine Arena · Atlas · Docente OS');
    expect(supportVerificationSource).toContain('Arena governa il curricolo; Curriculum Atlas lo rende navigabile in sola lettura; Docente OS possiede programmazione annuale, UDA, lezioni e materiali.');
  });
});
