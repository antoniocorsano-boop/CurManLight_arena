import { render } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { DashboardView } from '../features/session/components/DashboardView';
import type { UserRole } from '../types/curriculum';

function props(role: UserRole): ComponentProps<typeof DashboardView> {
  return {
    activeTab: 'dashboard', role, savedUda: [], decisions: {}, wizardStep: 1, progTitle: '', progStatus: 'bozza', documentExportHistory: [],
    handleDownloadCml: vi.fn(), handleTabSwitch: vi.fn(), setSelectedBrainDoc: vi.fn(), setWikiWorkspaceTab: vi.fn(), setShowSaveModal: vi.fn(),
    setActiveCurricoloView: vi.fn(), setActiveProgTab: vi.fn(), setSelectedUda: vi.fn(),
  };
}

describe('CML-633D Task 10 dashboard factual states', () => {
  it.each<UserRole>(['dipartimento', 'referente', 'dirigente', 'amministratore'])('does not invent metrics or compliance for %s', role => {
    const { container } = render(<DashboardView {...props(role)} />);
    expect(container).not.toHaveTextContent(/46\s*\/\s*46|94\.5%|8\s*\/\s*8|Conforme\s*\(WCAG|GDPR.*Conforme|Attivo e Cifrato|Attiva e protetta/i);
    expect(container).not.toHaveTextContent(/adotta la proposta formale deliberata|integrazione.*PTOF|autorità.*validazione/i);
    expect(container).not.toHaveTextContent(/pronto per essere inviato telematicamente|Scarica Dichiarazione/i);
    expect(container).toHaveTextContent(/non disponibile|non verificat|non configurat/i);
  });
});
