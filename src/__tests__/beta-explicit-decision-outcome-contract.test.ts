import { describe, expect, it } from 'vitest';

const modules = import.meta.glob('../features/beta/InstitutionalDecisionPanel.tsx', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const panelSource = Object.values(modules)[0] ?? '';

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
