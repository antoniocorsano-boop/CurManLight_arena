import type { Meta, StoryObj } from '@storybook/react';
import { UiStatusMessage } from '../components/UiStatusMessage';

const meta: Meta<typeof UiStatusMessage> = {
  title: 'UI System/UiStatusMessage',
  component: UiStatusMessage,
  tags: ['autodocs'],
  argTypes: {
    type: { control: 'select', options: ['info', 'success', 'warning', 'error', 'unverifiable', 'loading'] },
  },
};

export default meta;
type Story = StoryObj<typeof UiStatusMessage>;

export const Info: Story = {
  args: {
    type: 'info',
    children: 'Il documento è stato salvato localmente.',
  },
};

export const Success: Story = {
  args: {
    type: 'success',
    children: 'Esportazione completata. Il file è stato scaricato.',
  },
};

export const Warning: Story = {
  args: {
    type: 'warning',
    children: 'Il lavoro è stato modificato dopo questa esportazione.',
  },
};

export const Error: Story = {
  args: {
    type: 'error',
    children: 'Impossibile generare il documento. Riprova più tardi.',
  },
};

export const Unverifiable: Story = {
  args: {
    type: 'unverifiable',
    children: 'Non è possibile confrontare questa esportazione con il lavoro attuale.',
  },
};

export const Loading: Story = {
  args: {
    type: 'loading',
    children: 'Generazione del documento in corso...',
  },
};
