import { describe, expect, it } from 'vitest';
import revisionSource from '../features/curriculum/components/RevisioneTab.tsx?raw';
import planningComponentSource from '../features/beta/PlanningHandoffPreview.tsx?raw';
import planningBoundarySource from '../features/beta/planningHandoffPreview.ts?raw';

describe('Beta teacher surface authority boundary', () => {
  it('does not expose the simulated institutional workflow in teacher revision', () => {
    expect(revisionSource).not.toContain('StructuredProposalStarter');
    expect(revisionSource).not.toContain('CanonicalProposalsSection');
    expect(revisionSource).not.toContain('Crea proposta strutturata');
    expect(revisionSource).not.toContain('Prepara per revisione');
    expect(revisionSource).not.toContain('Prendi in carico');
    expect(revisionSource).not.toContain('Ammetti alla decisione');
    expect(revisionSource).not.toContain('InstitutionalDecisionPanel');
  });

  it('does not feed unadopted revisionArchive data into planning handoff', () => {
    expect(planningComponentSource).not.toContain('revisionArchive');
    expect(planningBoundarySource).not.toContain('input.revisionArchive');
    expect(planningBoundarySource).toContain("createEmptyRevisionArchive('1970-01-01T00:00:00.000Z')");
  });
});
