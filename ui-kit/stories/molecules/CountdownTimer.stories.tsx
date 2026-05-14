import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { CountdownTimer } from '@/components/molecules/countdown-timer.tsx'
import { Button } from '@/components/ui/button.tsx'

const meta: Meta = {
  title: 'Molecules/CountdownTimer',
  component: CountdownTimer,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
}

export default meta
type Story = StoryObj

export const Default: Story = {
  render: () => <CountdownTimer seconds={30} />,
}

export const ResendOtp: Story = {
  render: () => {
    const [generation, setGeneration] = useState(0)
    const [done, setDone] = useState(false)
    return (
      <div className="flex items-center gap-3">
        <Button
          variant="link"
          disabled={!done}
          onClick={() => {
            setGeneration((g) => g + 1)
            setDone(false)
          }}
        >
          {done ? (
            'Resend'
          ) : (
            <>
              Resend in{' '}
              <CountdownTimer
                key={generation}
                seconds={30}
                onComplete={() => setDone(true)}
                format={(s) => `${s}s`}
              />
            </>
          )}
        </Button>
      </div>
    )
  },
}

export const KhqrExpiry: Story = {
  render: () => {
    const [generation, setGeneration] = useState(0)
    const [expired, setExpired] = useState(false)
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="text-sm">
          {expired ? (
            'QR expired'
          ) : (
            <>
              Expires in{' '}
              <CountdownTimer
                key={generation}
                seconds={60}
                onComplete={() => setExpired(true)}
                format={(s) => {
                  const m = Math.floor(s / 60)
                  const r = s % 60
                  return `${m}:${String(r).padStart(2, '0')}`
                }}
              />
            </>
          )}
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setGeneration((g) => g + 1)
            setExpired(false)
          }}
        >
          {expired ? 'Regenerate QR' : 'Reset (demo)'}
        </Button>
      </div>
    )
  },
}
