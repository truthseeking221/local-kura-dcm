import type { Meta, StoryObj } from '@storybook/react-vite'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button.tsx'
import { Toaster } from '@/components/ui/sonner.tsx'

const meta = {
  title: 'Atoms/Sonner (Toaster)',
  component: Toaster,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <>
        <Toaster />
        <Story />
      </>
    ),
  ],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Toaster>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Button onClick={() => toast.success('Manual entry — fill details in Step 2')}>
      Trigger toast
    </Button>
  ),
}

export const Tones: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button onClick={() => toast.success('Mobile verified')}>Success</Button>
      <Button onClick={() => toast.info('KHQR regenerated · 10 min expiry reset')} variant="outline">
        Info
      </Button>
      <Button onClick={() => toast.warning('Verify patient before continuing')} variant="outline">
        Warning
      </Button>
      <Button onClick={() => toast.error('Consent declined — counter-sign required')} variant="destructive">
        Error
      </Button>
    </div>
  ),
}

export const QueueAdded: Story = {
  render: () => (
    <Button onClick={() => toast.success('Sok Sreymom checked in · Q-001')}>
      Simulate check-in
    </Button>
  ),
}

export const WithAction: Story = {
  render: () => (
    <Button
      onClick={() =>
        toast.success('Policy removed', {
          action: {
            label: 'Undo',
            onClick: () => toast.success('Policy restored'),
          },
        })
      }
      variant="outline"
    >
      Action toast
    </Button>
  ),
}
