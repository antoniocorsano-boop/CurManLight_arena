import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';
import { UiConfirmDialog } from '../components/UiConfirmDialog';

const meta: Meta<typeof UiConfirmDialog> = {
  title: 'UI System/UiConfirmDialog',
  component: UiConfirmDialog,
  tags: ['autodocs'],
  parameters: {
    a11y: {
      test: 'error',
    },
  },
};

export default meta;
type Story = StoryObj<typeof UiConfirmDialog>;

function DialogWrapper({
  title,
  message,
  confirmLabel,
  variant,
}: {
  title: string;
  message: string;
  confirmLabel: string;
  variant: 'danger' | 'primary';
}) {
  const [open, setOpen] = useState(true);
  return (
    <div>
      <button onClick={() => setOpen(true)} className="px-4 py-2 bg-ui-action text-white rounded-ui-control text-[14px]">
        Apri dialog
      </button>
      <UiConfirmDialog
        open={open}
        title={title}
        message={message}
        confirmLabel={confirmLabel}
        variant={variant}
        onConfirm={() => setOpen(false)}
        onCancel={() => setOpen(false)}
      />
    </div>
  );
}

export const DangerConfirm: Story = {
  render: () => (
    <DialogWrapper
      title="Azzera la memoria"
      message="Questa operazione cancellerà tutte le decisioni, i testi personalizzati e le UDA salvate. I file scaricati sul tuo dispositivo non verranno eliminati."
      confirmLabel="Azzera"
      variant="danger"
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const dialog = await canvas.findByRole('dialog');

    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute('aria-labelledby');
    await expect(dialog).toHaveAttribute('aria-describedby');
    await expect(canvas.getByRole('heading', { name: 'Azzera la memoria' })).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Annulla' })).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Azzera' })).toBeVisible();
  },
};

export const PrimaryConfirm: Story = {
  render: () => (
    <DialogWrapper
      title="Esporta il curricolo"
      message="Vuoi generare il documento in formato DOCX? Il file verrà scaricato automaticamente."
      confirmLabel="Scarica"
      variant="primary"
    />
  ),
};
