import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const panelPath = fileURLToPath(new URL('../features/beta/InstitutionalDecisionPanel.tsx', import.meta.url));
const panelSource = readFileSync(panelPath, 'utf8');

describe('BETA-G4 explicit institutional outcome contract', () => {
  it('does not preselect an institutional decision outcome', () => {
    expect(panelSource).toContain("useState<DecisionOutcomeSelection>('')");
    expect(panelSource).not.toContain("useState<InstitutionalDecisionOutcome>('approve')");
    expect(panelSource).toContain('<option value="" disabled>Seleziona un esito…</option>');
  });

  it('blocks preview and recording until an outcome is chosen explicitly', () => {
    expect(panelSource).toContain('if (!controlsMayOpen || !outcome) return;');
    expect(panelSource).toContain('|| !outcome');
    expect(panelSource).toContain('disabled={busy || !outcome || !rationale.trim()}');
  });

  it('explains the no-default safety boundary to the human decision maker', () => {
    expect(panelSource).toContain('Nessun esito è preselezionato.');
  });
});
