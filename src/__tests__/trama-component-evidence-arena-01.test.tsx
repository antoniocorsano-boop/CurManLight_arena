import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { UiConfirmDialog } from '../ui/components/UiConfirmDialog';
import { UiTabs } from '../ui/components/UiTabs';
import tooltipSource from '../components/ui/Tooltip.tsx?raw';

describe('TRAMA component evidence — Arena slice 01', () => {
  it('UiConfirmDialog exposes native dialog semantics and labelled content', () => {
    render(
      <UiConfirmDialog
        open={true}
        title="Conferma eliminazione"
        message="Questa operazione non può essere annullata."
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-labelledby');
    expect(dialog).toHaveAttribute('aria-describedby');
    expect(screen.getByRole('heading', { name: 'Conferma eliminazione' })).toBeInTheDocument();
  });

  it('UiTabs implements roving tabindex and automatic keyboard activation', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <UiTabs
        onChange={onChange}
        tabs={[
          { id: 'a', label: 'A', content: <p>Pannello A</p> },
          { id: 'b', label: 'B', content: <p>Pannello B</p> },
          { id: 'c', label: 'C', content: <p>Pannello C</p> },
        ]}
      />
    );

    const tabs = screen.getAllByRole('tab');
    expect(tabs[0]).toHaveAttribute('tabindex', '0');
    expect(tabs[1]).toHaveAttribute('tabindex', '-1');

    tabs[0].focus();
    await user.keyboard('{ArrowRight}');

    expect(tabs[1]).toHaveFocus();
    expect(tabs[1]).toHaveAttribute('aria-selected', 'true');
    expect(tabs[1]).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Pannello B');
    expect(onChange).toHaveBeenLastCalledWith('b');
  });

  it('UiTabs supports ArrowLeft wrap plus Home and End', async () => {
    const user = userEvent.setup();

    render(
      <UiTabs
        tabs={[
          { id: 'a', label: 'A', content: <p>A</p> },
          { id: 'b', label: 'B', content: <p>B</p> },
          { id: 'c', label: 'C', content: <p>C</p> },
        ]}
      />
    );

    const tabs = screen.getAllByRole('tab');
    tabs[0].focus();

    await user.keyboard('{ArrowLeft}');
    expect(tabs[2]).toHaveFocus();

    await user.keyboard('{Home}');
    expect(tabs[0]).toHaveFocus();

    await user.keyboard('{End}');
    expect(tabs[2]).toHaveFocus();
  });

  it('UiTabs exposes aria-controls only when the referenced panel exists', async () => {
    const user = userEvent.setup();

    render(
      <UiTabs
        tabs={[
          { id: 'a', label: 'A', content: <p>Pannello A</p> },
          { id: 'b', label: 'B', content: <p>Pannello B</p> },
        ]}
      />
    );

    const tabs = screen.getAllByRole('tab');
    const firstPanel = screen.getByRole('tabpanel');

    expect(tabs[0]).toHaveAttribute('aria-controls', firstPanel.id);
    expect(document.getElementById(tabs[0].getAttribute('aria-controls')!)).toBe(firstPanel);
    expect(tabs[1]).not.toHaveAttribute('aria-controls');

    tabs[0].focus();
    await user.keyboard('{ArrowRight}');

    const secondPanel = screen.getByRole('tabpanel');
    expect(tabs[0]).not.toHaveAttribute('aria-controls');
    expect(tabs[1]).toHaveAttribute('aria-controls', secondPanel.id);
    expect(document.getElementById(tabs[1].getAttribute('aria-controls')!)).toBe(secondPanel);
  });

  it('UiTabs falls back to a reachable first tab when defaultTab is invalid', () => {
    render(
      <UiTabs
        defaultTab="missing"
        tabs={[
          { id: 'a', label: 'A', content: <p>Pannello A</p> },
          { id: 'b', label: 'B', content: <p>Pannello B</p> },
        ]}
      />
    );

    const tabs = screen.getAllByRole('tab');
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    expect(tabs[0]).toHaveAttribute('tabindex', '0');
    expect(tabs[1]).toHaveAttribute('tabindex', '-1');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Pannello A');
  });

  it('UiTabs preserves a reachable fallback when the active tab is removed', () => {
    const { rerender } = render(
      <UiTabs
        defaultTab="b"
        tabs={[
          { id: 'a', label: 'A', content: <p>Pannello A</p> },
          { id: 'b', label: 'B', content: <p>Pannello B</p> },
        ]}
      />
    );

    expect(screen.getByRole('tab', { name: 'B' })).toHaveAttribute('aria-selected', 'true');

    rerender(
      <UiTabs
        tabs={[
          { id: 'a', label: 'A', content: <p>Pannello A</p> },
          { id: 'c', label: 'C', content: <p>Pannello C</p> },
        ]}
      />
    );

    const tabs = screen.getAllByRole('tab');
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    expect(tabs[0]).toHaveAttribute('tabindex', '0');
    expect(tabs[1]).toHaveAttribute('tabindex', '-1');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Pannello A');
  });

  it('UiTabs binds the selected tab to the active tabpanel', () => {
    render(
      <UiTabs
        defaultTab="b"
        tabs={[
          { id: 'a', label: 'A', content: <p>A</p> },
          { id: 'b', label: 'B', content: <p>B</p> },
        ]}
      />
    );

    const active = screen.getByRole('tab', { name: 'B' });
    const panel = screen.getByRole('tabpanel');
    expect(active).toHaveAttribute('aria-controls', panel.id);
    expect(panel).toHaveAttribute('aria-labelledby', active.id);
  });

  it('legacy Tooltip remains explicitly pointer-only and must not be extended by this slice', () => {
    expect(tooltipSource).toContain('onMouseEnter');
    expect(tooltipSource).toContain('onMouseLeave');
    expect(tooltipSource).not.toContain('onFocus');
    expect(tooltipSource).not.toContain('role="tooltip"');
  });
});
