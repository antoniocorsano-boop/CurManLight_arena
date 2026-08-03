import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProcessoTab } from '../features/processo/components/ProcessoTab';

function renderProcesso(canConsolidate: boolean) {
  return render(
    <ProcessoTab
      activeProcessoTab="flusso"
      setActiveProcessoTab={vi.fn()}
      currentDisciplineDecided={0}
      currentDisciplineProps={[]}
      handleImportMergeCml={vi.fn()}
      canConsolidate={canConsolidate}
      progressPercent={0}
      totalDecisions={0}
      approvedCount={0}
      rejectedCount={0}
      customCount={0}
      localCurriculum={{}}
      discipline="Italiano"
      order="primaria"
      decisions={{}}
      customTexts={{}}
    />
  );
}

describe('CML-635B2 consolidamento UI', () => {
  it('keeps the CML input enabled when the capability is granted', () => {
    renderProcesso(true);
    expect(screen.getByLabelText(/Carica file di proposta/)).toBeEnabled();
    expect(screen.queryByText('Questa funzione non è disponibile per il ruolo dichiarato.')).not.toBeInTheDocument();
  });

  it('disables the CML input and exposes an accessible explanation when denied', () => {
    renderProcesso(false);
    const input = screen.getByLabelText(/Carica file di proposta/);
    expect(input).toBeDisabled();
    expect(input).toHaveAttribute('aria-describedby', 'processo-consolidation-capability-note');
    expect(screen.getByText('Questa funzione non è disponibile per il ruolo dichiarato.')).toBeVisible();
  });
});