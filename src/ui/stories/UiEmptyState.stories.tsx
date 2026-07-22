import type { Meta, StoryObj } from '@storybook/react';
import { UiEmptyState } from '../components/UiEmptyState';
import { FileText } from 'lucide-react';
import { UiButton } from '../components/UiButton';

const meta: Meta<typeof UiEmptyState> = {
  title: 'UI System/UiEmptyState',
  component: UiEmptyState,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof UiEmptyState>;

export const Default: Story = {
  args: {
    icon: FileText,
    title: 'Non hai ancora prodotto documenti in questa sessione.',
    description: 'Quando esporterai un UDA, una programmazione o una relazione, il documento apparirà qui con il contesto della fonte.',
  },
};

export const WithAction: Story = {
  render: () => (
    <UiEmptyState
      icon={FileText}
      title="Nessun documento prodotto"
      description="Inizia esportando il curricolo verticale."
      action={<UiButton variant="primary" size="small">Scarica il curricolo</UiButton>}
    />
  ),
};

export const LongContent: Story = {
  args: {
    icon: FileText,
    title: 'La cronologia delle esportazioni è vuota.',
    description: 'CurManLight conserva le informazioni sulle ultime 5 esportazioni prodotte. I file vengono scaricati direttamente sul tuo dispositivo e non vengono mai caricati su servizi esterni.',
  },
};
