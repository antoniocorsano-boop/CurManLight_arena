import { describe, expect, it } from 'vitest';
import panelSource from '../features/documents/components/InstituteSourceReviewPanel.tsx?raw';
import workspaceSource from '../features/documents/components/FontiWorkspace.tsx?raw';

describe('R7C7B institute source remediation workbench', () => {
  it('is exposed from the canonical Fonti workspace', () => {
    expect(workspaceSource).toContain("import { InstituteSourceReviewPanel } from './InstituteSourceReviewPanel'");
    expect(workspaceSource).toContain('<InstituteSourceReviewPanel />');
  });

  it('keeps corrected-source evidence local and source-bound', () => {
    expect(panelSource).toContain("crypto.subtle.digest('SHA-256'");
    expect(panelSource).toContain('arena-institute-source-review-receipts-v1');
    expect(panelSource).toContain('CORRECTED_SOURCE_VERSION_LINKED');
    expect(panelSource).toContain('candidateSource.sha256 === SOURCE_SHA256');
  });

  it('does not let acknowledgement masquerade as remediation', () => {
    expect(panelSource).toContain('ACKNOWLEDGED_REQUIRES_CORRECTED_SOURCE');
    expect(panelSource).toContain('Segna preso in carico');
    expect(panelSource).toContain('Conferma correzione verificata');
  });

  it('requires explicit human decisions for scope and identity', () => {
    expect(panelSource).toContain('SCOPE_SECOND_YEAR_AND_LATER');
    expect(panelSource).toContain('SCOPE_CLASS_ONE');
    expect(panelSource).toContain('IDENTITY_NORMALIZE_CANONICAL_PRESERVE_SOURCE_LABEL');
    expect(panelSource).toContain('Registra decisione');
  });

  it('supports receipt continuity without claiming semantic or institutional completion', () => {
    expect(panelSource).toContain('Esporta ricevute');
    expect(panelSource).toContain('Importa ricevute');
    expect(panelSource).toContain('la revisione semantica resta separata');
    expect(panelSource).toContain('nessun contenuto diventa automaticamente adottato, istituzionale o nazionale');
  });
});
