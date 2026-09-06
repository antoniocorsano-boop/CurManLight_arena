import { describe, expect, it } from 'vitest';
import workspaceSource from '../features/curriculum/CurriculumWorkspace.tsx?raw';
import baselineSource from '../lib/curriculumBaseline.ts?raw';
import currentSource from '../domain/curriculum/institute/currentSource.ts?raw';

describe('canonical curriculum entry', () => {
  it('makes the unified master the first curriculum surface', () => {
    expect(workspaceSource).toContain('data-canonical-curriculum-entry');
    expect(workspaceSource).toContain('Curricolo verticale integrale 3–14');
    expect(workspaceSource).toContain('Baseline corrente');
    expect(workspaceSource).toContain('Apri il curricolo integrale');
    expect(workspaceSource).toContain('Classi I · II · III · IV · V');
    expect(workspaceSource).toContain('Non è ancora il curricolo vigente dell’Istituto.');
  });

  it('keeps the legacy local curriculum behind an explicit non-canonical disclosure', () => {
    expect(workspaceSource).toContain('data-legacy-curriculum-disclosure');
    expect(workspaceSource).toContain('Archivio locale precedente');
    expect(workspaceSource).toContain('non il master curricolare corrente');
    expect(workspaceSource).toContain('Torna al curricolo corrente');
    expect(workspaceSource).toContain('{showingLegacyWorkspace && (');
  });

  it('binds the canonical entry to the same master registered by the domain', () => {
    expect(currentSource).toContain('CAN-CURR-MASTER-00_Curricolo_verticale_integrale_unificato_3-14_2026-2027');
    expect(currentSource).toContain('12eWTPUZBJxZixd6-p8drNAaW5_eL8qWpXZUSDyZZAv4');
    expect(workspaceSource).toContain('INSTITUTE_CURRICULUM_CURRENT_SOURCE.driveFileId');
    expect(workspaceSource).toContain('CANONICAL_MASTER_URL');
  });

  it('does not allow the compatibility baseline to regain canonical authority', () => {
    expect(baselineSource).toContain('NON è la baseline curricolare canonica');
    expect(baselineSource).toContain('getCanonicalCurriculumMasterIdentity');
    expect(baselineSource).toContain('Non aggiorna CAN-CURR-MASTER-00');
  });
});
