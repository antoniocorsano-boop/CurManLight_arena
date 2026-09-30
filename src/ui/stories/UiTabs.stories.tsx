import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from 'storybook/test';
import { UiTabs } from '../components/UiTabs';

const meta: Meta<typeof UiTabs> = {
  title: 'UI System/UiTabs',
  component: UiTabs,
  tags: ['autodocs'],
  parameters: {
    a11y: {
      test: 'error',
    },
  },
};

export default meta;
type Story = StoryObj<typeof UiTabs>;

export const Default: Story = {
  args: {
    ariaLabel: 'Sezioni curricolari',
    tabs: [
      { id: 'curricolo', label: 'Curricolo', content: <p>Contenuto curricolo</p> },
      { id: 'evidenze', label: 'Evidenze', content: <p>Contenuto evidenze</p> },
      { id: 'storico', label: 'Storico', content: <p>Contenuto storico</p> },
    ],
    defaultTab: 'curricolo',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const tablist = canvas.getByRole('tablist', { name: 'Sezioni curricolari' });
    const tabs = canvas.getAllByRole('tab');

    await expect(tablist).toBeVisible();
    await expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    await expect(tabs[0]).toHaveAttribute('tabindex', '0');

    await userEvent.click(tabs[0]);
    await userEvent.keyboard('{ArrowRight}');

    await expect(tabs[1]).toHaveFocus();
    await expect(tabs[1]).toHaveAttribute('aria-selected', 'true');
    await expect(canvas.getByRole('tabpanel')).toHaveTextContent('Contenuto evidenze');
  },
};

export const ResponsiveCompact: Story = {
  args: {
    ariaLabel: 'Sezioni di qualificazione',
    tabs: [
      { id: 'curricolo', label: 'Curricolo verticale d’istituto', content: <p>Curricolo</p> },
      { id: 'evidenze', label: 'Evidenze di qualificazione', content: <p>Evidenze</p> },
      { id: 'storico', label: 'Storico delle revisioni', content: <p>Storico</p> },
      { id: 'raccordi', label: 'Raccordi interdisciplinari', content: <p>Raccordi</p> },
    ],
    defaultTab: 'curricolo',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const tablist = canvas.getByRole('tablist', { name: 'Sezioni di qualificazione' });
    const tabs = canvas.getAllByRole('tab');

    await expect(tablist).toBeVisible();
    await expect(window.getComputedStyle(tablist).overflowX).toBe('auto');

    for (const tab of tabs) {
      const panelId = tab.getAttribute('aria-controls');
      await expect(panelId).toBeTruthy();
      await expect(canvasElement.querySelector(`#${CSS.escape(panelId!)}`)).toBeInTheDocument();
    }
  },
};
