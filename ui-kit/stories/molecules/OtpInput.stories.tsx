import type { Meta, StoryObj } from '@storybook/react-vite'
import { useEffect, useState } from 'react'

import { OtpInput } from '@/components/molecules/otp-input.tsx'
import { Button } from '@/components/ui/button.tsx'

const meta: Meta = {
  title: 'Molecules/OtpInput',
  component: OtpInput,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
}

export default meta
type Story = StoryObj

export const Default: Story = {
  render: () => {
    const [code, setCode] = useState('')
    return <OtpInput value={code} onChange={setCode} autoFocus />
  },
}

export const WithVerifyAndResend: Story = {
  render: () => {
    const [code, setCode] = useState('')
    const [verified, setVerified] = useState(false)
    const [secondsLeft, setSecondsLeft] = useState(30)

    useEffect(() => {
      if (secondsLeft <= 0) return
      const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000)
      return () => clearTimeout(t)
    }, [secondsLeft])

    const canVerify = code.length === 6 && !verified

    return (
      <div className="flex flex-col items-start gap-3">
        <OtpInput value={code} onChange={setCode} autoFocus disabled={verified} />
        <div className="flex items-center gap-3">
          <Button onClick={() => setVerified(true)} disabled={!canVerify}>
            {verified ? 'Verified' : 'Verify'}
          </Button>
          <button
            type="button"
            onClick={() => setSecondsLeft(30)}
            disabled={secondsLeft > 0}
            className="text-sm text-[var(--brand-700)] hover:underline disabled:cursor-not-allowed disabled:text-muted-foreground disabled:no-underline"
          >
            {secondsLeft > 0 ? `Resend in ${secondsLeft}s` : 'Resend'}
          </button>
        </div>
      </div>
    )
  },
}

export const FourDigit: Story = {
  render: () => {
    const [code, setCode] = useState('')
    return <OtpInput length={4} value={code} onChange={setCode} />
  },
}

export const Filled: Story = {
  render: () => {
    const [code, setCode] = useState('123456')
    return <OtpInput value={code} onChange={setCode} />
  },
}

export const Disabled: Story = {
  render: () => {
    const [code, setCode] = useState('123456')
    return <OtpInput value={code} onChange={setCode} disabled />
  },
}
