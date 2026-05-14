import type { Meta, StoryObj } from '@storybook/react-vite'
import { ScanLine } from 'lucide-react'

import { MediaFrame } from '@/components/molecules/media-frame.tsx'

const meta = {
  title: 'Molecules/MediaFrame',
  component: MediaFrame,
  tags: ['autodocs', 'module:receptionist'],
  args: {
    tone: 'default',
    dashed: false,
    bg: 'surface',
    padding: 'md',
    children: (
      <>
        <ScanLine size={48} strokeWidth={1} className="text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Camera preview placeholder</p>
      </>
    ),
  },
  argTypes: {
    tone: { control: 'inline-radio', options: ['default', 'danger'] },
    dashed: { control: 'boolean' },
    bg: { control: 'inline-radio', options: ['surface', 'muted', 'white'] },
    padding: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof MediaFrame>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Playground: Story = {
  args: {
    tone: 'default',
    dashed: false,
    bg: 'surface',
    padding: 'md',
  },
}

export const Tones: Story = {
  name: 'Tones (default / danger) — danger pairs with caption per brand rule',
  render: () => (
    <div className="grid grid-cols-2 gap-4 w-[640px]">
      <div className="space-y-2">
        <MediaFrame bg="white">
          <img
            src="https://api.qrserver.com/v1/create-qr-code/?size=168x168&data=kura-demo"
            alt="Demo QR code"
            width={168}
            height={168}
          />
        </MediaFrame>
        <p className="text-center text-xs text-muted-foreground">Live</p>
      </div>
      <div className="space-y-2">
        <MediaFrame tone="danger" bg="white">
          <img
            src="https://api.qrserver.com/v1/create-qr-code/?size=168x168&data=kura-demo"
            alt="Expired demo QR code"
            width={168}
            height={168}
            className="opacity-30"
          />
        </MediaFrame>
        <p className="text-center text-xs font-semibold uppercase tracking-wide text-[var(--danger-700)]">
          Expired
        </p>
      </div>
    </div>
  ),
}

export const Dashed: Story = {
  name: 'Dashed (capture target) vs. solid (rendered media)',
  render: () => (
    <div className="grid grid-cols-2 gap-4 w-[640px]">
      <MediaFrame dashed bg="muted" padding="lg">
        <ScanLine size={48} strokeWidth={1} className="text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Camera preview placeholder</p>
      </MediaFrame>
      <MediaFrame bg="white">
        <img
          src="https://api.qrserver.com/v1/create-qr-code/?size=224x224&data=kura-telegram"
          alt="Rendered Telegram QR"
          width={224}
          height={224}
        />
      </MediaFrame>
    </div>
  ),
}

export const WhiteBackground: Story = {
  name: 'Backgrounds — surface / muted / white (white locked to QR readability)',
  render: () => (
    <div className="grid grid-cols-3 gap-4 w-[720px]">
      <div className="space-y-2">
        <MediaFrame bg="surface">
          <img
            src="https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=surface"
            alt="QR on surface bg"
            width={140}
            height={140}
          />
        </MediaFrame>
        <p className="text-center text-xs text-muted-foreground">bg=&quot;surface&quot;</p>
      </div>
      <div className="space-y-2">
        <MediaFrame bg="muted">
          <img
            src="https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=muted"
            alt="QR on muted bg"
            width={140}
            height={140}
          />
        </MediaFrame>
        <p className="text-center text-xs text-muted-foreground">bg=&quot;muted&quot;</p>
      </div>
      <div className="space-y-2">
        <MediaFrame bg="white">
          <img
            src="https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=white"
            alt="QR on white bg (scan-readable)"
            width={140}
            height={140}
          />
        </MediaFrame>
        <p className="text-center text-xs text-muted-foreground">
          bg=&quot;white&quot; — locked to QR-scan-readability cases (dark mode does not invert).
        </p>
      </div>
    </div>
  ),
}

export const WithIconPlaceholder: Story = {
  name: 'Icon + caption placeholder (canonical empty/idle state)',
  render: () => (
    <MediaFrame dashed bg="muted" padding="lg" className="w-[420px]">
      <ScanLine size={48} strokeWidth={1} className="text-muted-foreground" />
      <p className="text-sm text-muted-foreground">Camera preview placeholder</p>
    </MediaFrame>
  ),
}
