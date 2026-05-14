import type { Meta, StoryObj } from '@storybook/react-vite'

import { ToastProvider, toast } from '@/components/organisms/toast.tsx'
import { Button } from '@/components/ui/button.tsx'

const meta: Meta = {
  title: 'Organisms/ToastProvider',
  component: ToastProvider,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <>
        <ToastProvider />
        <Story />
      </>
    ),
  ],
  parameters: { layout: 'centered' },
}

export default meta
type Story = StoryObj

export const KuraTones: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button onClick={() => toast.success('Mobile verified')}>Success</Button>
      <Button
        onClick={() => toast.info('Manual entry — fill details in Step 2')}
        variant="outline"
      >
        Info
      </Button>
      <Button
        onClick={() => toast.warning('Verify patient before continuing')}
        variant="outline"
      >
        Warning
      </Button>
      <Button
        onClick={() => toast.danger('Consent declined — counter-sign required')}
        variant="destructive"
      >
        Danger
      </Button>
    </div>
  ),
}

export const ReceptionistFlow: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button
        onClick={() =>
          toast.success('Sok Sreymom checked in · Q-001', {
            description: 'Visit ready for clinician review.',
          })
        }
      >
        Check-in toast
      </Button>
      <Button
        onClick={() => toast.success('Forte Insurance eligible · 80% coverage')}
        variant="outline"
      >
        Eligibility toast
      </Button>
      <Button onClick={() => toast.success('Teleconsult skipped')} variant="outline">
        Skip-teleconsult toast
      </Button>
    </div>
  ),
}
