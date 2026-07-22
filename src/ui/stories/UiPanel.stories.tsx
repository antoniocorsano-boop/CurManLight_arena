import type { Meta, StoryObj } from '@storybook/react';
import { UiPanel } from '../components/UiPanel';
import { UiButton } from '../components/UiButton';

const meta: Meta<typeof UiPanel> = {
  title: 'UI System/UiPanel',
  component: UiPanel,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof UiPanel>;

export const Default: Story = {
  args: {
    title: 'Programmazione annuale di Tecnologia',
    description: 'Classe Seconda B — Anno scolastico 2025/2026',
    children: (
      <p className="text-[14px] text-ui-text">
        Il curricolo verticale di Tecnologia copre le competenze trasversali dalla scuola dell'infanzia alla secondaria di primo grado.
      </p>
    ),
  },
};

export const WithActions: Story = {
  render: () => (
    <UiPanel
      title="Scarica il curricolo"
      description="Scegli il formato del documento da esportare"
      actions={<UiButton variant="primary" size="small">DOCX</UiButton>}
    >
      <p className="text-[13px] text-ui-text-secondary">
        Il documento verrà generato con i dati attuali della programmazione.
      </p>
    </UiPanel>
  ),
};

export const Subtle: Story = {
  args: {
    variant: 'subtle',
    title: 'Note aggiuntive',
    children: (
      <p className="text-[13px] text-ui-text-secondary">
        Queste note sono visibili solo all'insegnante e non vengono incluse nei documenti esportati.
      </p>
    ),
  },
};
