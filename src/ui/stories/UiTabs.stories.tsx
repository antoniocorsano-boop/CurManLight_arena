import type { Meta, StoryObj } from '@storybook/react';
import { UiTabs } from '../components/UiTabs';

const meta: Meta<typeof UiTabs> = {
  title: 'UI System/UiTabs',
  component: UiTabs,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof UiTabs>;

export const Default: Story = {
  args: {
    tabs: [
      { id: 'curricolo', label: 'Curricolo', content: <p>Contenuto curricolo</p> },
      { id: 'evidenze', label: 'Evidenze', content: <p>Contenuto evidenze</p> },
      { id: 'storico', label: 'Storico', content: <p>Contenuto storico</p> },
    ],
    defaultTab: 'curricolo',
  },
};
