import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { ScanInput } from '@/components/molecules/scan-input.tsx'

const scanInputStoryFrame = 'w-[min(420px,calc(100vw-3rem))]'
const scanInputWorkflowFrame = 'w-[min(460px,calc(100vw-3rem))]'

const meta = {
  title: 'Molecules/ScanInput',
  component: ScanInput,
  tags: ['autodocs'],
  args: { onScan: () => undefined },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof ScanInput>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState('')
    return (
      <div className={scanInputStoryFrame}>
        <ScanInput
          value={value}
          onChange={setValue}
          onScan={() => undefined}
          placeholder="Scan tube barcode — collect"
        />
      </div>
    )
  },
}

export const States: Story = {
  render: () => (
    <div className={`grid ${scanInputStoryFrame} gap-5`}>
      <ScanInput
        onScan={() => undefined}
        placeholder="Scan tube barcode"
        helperText="Scan a tube to start"
      />
      <ScanInput
        onScan={() => undefined}
        defaultValue="660100172636"
        state="success"
        helperText="Tube 4 marked collected"
      />
      <ScanInput
        onScan={() => undefined}
        defaultValue="???"
        state="error"
        helperText="Barcode does not match this order"
      />
      <ScanInput
        onScan={() => undefined}
        disabled
        placeholder="Scanner disconnected"
      />
    </div>
  ),
}

export const WithCustomIcon: Story = {
  render: () => (
    <div className={`grid ${scanInputStoryFrame} gap-5`}>
      <ScanInput icon="tabler:id-badge-2" onScan={() => undefined} placeholder="Scan patient ID card" />
      <ScanInput icon="tabler:qrcode" onScan={() => undefined} placeholder="Scan booking QR code" />
    </div>
  ),
}

export const InWorkflow: Story = {
  render: () => {
    const [value, setValue] = useState('')
    const [state, setState] = useState<'default' | 'success' | 'error'>('default')
    const [helper, setHelper] = useState<string | undefined>()
    const [count, setCount] = useState(0)

    const handleScan = (scanned: string) => {
      const ok = /^\d{12}$/.test(scanned)
      setState(ok ? 'success' : 'error')
      setHelper(ok ? `Tube ${count + 1} marked collected` : 'Invalid barcode — re-scan the tube')
      if (ok) setCount((n) => n + 1)
      window.setTimeout(() => {
        setState('default')
        setHelper(undefined)
      }, 1200)
    }

    return (
      <div className={`${scanInputWorkflowFrame} space-y-2`}>
        {state === 'default' ? (
          <ScanInput
            value={value}
            onChange={setValue}
            onScan={handleScan}
            autoFocus
            placeholder="Scan tube barcode — collect"
          />
        ) : (
          <ScanInput
            value={value}
            onChange={setValue}
            onScan={handleScan}
            state={state}
            helperText={helper ?? ''}
            autoFocus
            placeholder="Scan tube barcode — collect"
          />
        )}
        <p className="text-xs text-muted-foreground">
          Type a 12-digit number and press Enter to simulate a successful scan;
          anything else triggers the error state. Collected so far: <strong>{count}</strong>.
        </p>
      </div>
    )
  },
}
