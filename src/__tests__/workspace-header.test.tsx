import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { WorkspaceHeader } from '../features/workspace/components/WorkspaceHeader';

describe('CML-TARGET-P1.2 workspace grammar', () => {
  it('presents identity, context, object, status and the primary action as one hierarchy', () => {
    const onPrimaryAction = vi.fn();

    render(
      <WorkspaceHeader
        identity="Progettazione"
        context="Tecnologia · Secondaria di I grado"
        workObject="UDA corrente"
        status="Bozza"
        primaryAction={{ label: 'Continua progettazione', onClick: onPrimaryAction }}
        assistanceLabel="Apri assistenza"
      />,
    );

    expect(screen.getByRole('heading', { name: 'Progettazione' })).toBeInTheDocument();
    expect(screen.getByText('Tecnologia · Secondaria di I grado')).toBeInTheDocument();
    expect(screen.getByText('UDA corrente')).toBeInTheDocument();
    expect(screen.getByText('Bozza')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Continua progettazione' }));
    expect(onPrimaryAction).toHaveBeenCalledOnce();
    expect(screen.getByRole('button', { name: 'Apri assistenza' })).toBeInTheDocument();
  });

  it('does not invent unavailable context, object or status', () => {
    render(<WorkspaceHeader identity="Documenti" />);

    expect(screen.getByRole('heading', { name: 'Documenti' })).toBeInTheDocument();
    expect(screen.queryByTestId('workspace-context')).not.toBeInTheDocument();
    expect(screen.queryByTestId('workspace-work-object')).not.toBeInTheDocument();
    expect(screen.queryByTestId('workspace-status')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
