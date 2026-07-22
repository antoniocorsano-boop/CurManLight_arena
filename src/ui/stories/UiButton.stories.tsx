import type { Meta, StoryObj } from '@storybook/react';
import { UiButton } from '../components/UiButton';

const meta: Meta<typeof UiButton> = {
  title: 'UI System/UiButton',
  component: UiButton,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'quiet', 'danger'] },
    size: { control: 'select', options: ['small', 'medium'] },
    disabled: { control: 'boolean' },
    loading: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof UiButton>;

export const Primary: Story = {
  args: {
    children: 'Scarica il curricolo',
    variant: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    children: 'DOC, ODF, PDF',
    variant: 'secondary',
  },
};

export const Quiet: Story = {
  args: {
    children: 'Copia negli appunti',
    variant: 'quiet',
  },
};

export const Danger: Story = {
  args: {
    children: 'Azzera memoria',
    variant: 'danger',
  },
};

export const Small: Story = {
  args: {
    children: 'Piccolo',
    size: 'small',
  },
};

export const Disabled: Story = {
  args: {
    children: 'Disabilitato',
    disabled: true,
  },
};

export const Loading: Story = {
  args: {
    children: 'Caricamento...',
    loading: true,
  },
};
