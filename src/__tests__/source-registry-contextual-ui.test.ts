import { describe, expect, it } from 'vitest';
import {
  normalizeKnowledgeSourceLifecycle,
  type CustomKbDoc,
} from '../features/documents/lib/localKnowledgeStore';
import {
  buildLocalSourceGovernanceRecord,
  classifyLocalKnowledgeSourceForContext,
} from '../features/documents/lib/localSourceGovernance';
import fontiSource from '../features/documents/components/FontiTab.tsx?raw';

const FINGERPRINT = 'a'.repeat(64);

const verifiedSource = (overrides: Partial<CustomKbDoc> = {}): CustomKbDoc => normalizeKnowledgeSourceLifecycle({
  id: 'vol-custom-context',
  title: 'Fonte di contesto',
  subtitle: 'Documento locale',
  content: 'Contenuto esatto della versione verificata',
  importedAt: '2026-09-05T05:00:00.000Z',
  authorityStatus: 'LOCAL_VERIFIED',
  verifiedAt: '2026-09-05T05:05:00.000Z',
  ingestionMethod: 'TEXT_FILE',
  extractionStatus: 'READY',
  ...overrides,
});

describe('CML-DRIVE-01 contextual source registry', () => {
  it('bridges R7B1 verification into governance without promoting local authority', () => {
    const source = verifiedSource();
    const governance = buildLocalSourceGovernanceRecord(source, 'local:teacher-1', FINGERPRINT, {
      instituteId: 'school:1',
      schoolOrder: 'secondaria',
      discipline: 'Tecnologia',
    });

    expect(governance.verificationStatus).toBe('verified');
    expect(governance.authorityLevel).toBe('personal');
    expect(governance.validFor.userIds).toEqual(['local:teacher-1']);
    expect(governance.validFor.instituteIds).toEqual(['school:1']);
    expect(governance.validFor.disciplines).toEqual(['Tecnologia']);
    expect(governance.provenance.verifiedBy).toBe('local:teacher-1');
  });

  it('accepts only the exact verified version in the matching context', () => {
    const source = verifiedSource();
    const governance = buildLocalSourceGovernanceRecord(source, 'local:teacher-1', FINGERPRINT, {
      instituteId: 'school:1',
      schoolOrder: 'secondaria',
      discipline: 'Tecnologia',
    });

    const matching = classifyLocalKnowledgeSourceForContext(source, governance, FINGERPRINT, {
      at: '2026-09-05',
      userId: 'local:teacher-1',
      instituteId: 'school:1',
      schoolOrder: 'secondaria',
      discipline: 'Tecnologia',
    });
    const otherDiscipline = classifyLocalKnowledgeSourceForContext(source, governance, FINGERPRINT, {
      at: '2026-09-05',
      userId: 'local:teacher-1',
      instituteId: 'school:1',
      schoolOrder: 'secondaria',
      discipline: 'Italiano',
    });

    expect(matching.status).toBe('valid-evidence');
    expect(matching.validForContext).toBe(true);
    expect(otherDiscipline.status).toBe('context-mismatch');
    expect(otherDiscipline.validForContext).toBe(false);
  });

  it('fails closed when the current payload fingerprint differs from the verified version', () => {
    const source = verifiedSource();
    const governance = buildLocalSourceGovernanceRecord(source, 'local:teacher-1', FINGERPRINT);

    const evaluation = classifyLocalKnowledgeSourceForContext(source, governance, 'b'.repeat(64), {
      at: '2026-09-05',
      userId: 'local:teacher-1',
    });

    expect(evaluation.status).toBe('stale-version');
    expect(evaluation.validForContext).toBe(false);
    expect(evaluation.evidenceEligible).toBe(false);
  });

  it('keeps verified but extraction-incomplete material valid only for consultation', () => {
    const source = verifiedSource({ extractionStatus: 'OCR_REQUIRED' });
    const governance = buildLocalSourceGovernanceRecord(source, 'local:teacher-1', FINGERPRINT);

    const evaluation = classifyLocalKnowledgeSourceForContext(source, governance, FINGERPRINT, {
      at: '2026-09-05',
      userId: 'local:teacher-1',
    });

    expect(evaluation.status).toBe('valid-consult-only');
    expect(evaluation.validForContext).toBe(true);
    expect(evaluation.evidenceEligible).toBe(false);
  });

  it('exposes the contextual registry and the fail-closed queue in the Fonti surface', () => {
    expect(fontiSource).toContain('Fonti valide per me / per questo contesto');
    expect(fontiSource).toContain('Fonti disponibili ma non utilizzabili nel contesto');
    expect(fontiSource).toContain('data-source-context-status={evaluation.status}');
    expect(fontiSource).toContain('Arena non dichiarerà valida alcuna fonte locale');
    expect(fontiSource).toContain('Conferma verifica nel contesto');
  });
});
