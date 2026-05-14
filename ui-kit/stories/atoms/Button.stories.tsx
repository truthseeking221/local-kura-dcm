import type { Meta, StoryObj } from '@storybook/react-vite'
import { AlertTriangle, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button.tsx'
import { Icon } from '@/components/atoms/icon.tsx'

const meta = {
  title: 'Atoms/Button',
  component: Button,
  tags: ['autodocs'],
  args: {
    children: 'Continue',
    variant: 'default',
    size: 'default',
    tone: 'default',
    disabled: false,
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'outline', 'ghost', 'link', 'destructive'],
    },
    size: {
      control: 'select',
      options: ['default', 'xs', 'sm', 'lg', 'icon', 'icon-xs', 'icon-sm', 'icon-lg'],
    },
    tone: {
      control: 'select',
      options: ['default', 'warning', 'danger'],
    },
  },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/PLACEHOLDER',
    },
  },
}

export const Playground: Story = {}

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="default">Default</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
      <Button variant="destructive">Destructive</Button>
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button size="xs">xs</Button>
      <Button size="sm">sm</Button>
      <Button size="default">default</Button>
      <Button size="lg">lg</Button>
    </div>
  ),
}

export const WithIcons: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button>
        <Icon name="tabler:plus" />
        New walk-in
      </Button>
      <Button variant="outline">
        <Icon name="tabler:search" />
        Search
      </Button>
      <Button variant="ghost">
        Continue
        <Icon name="tabler:chevron-right" />
      </Button>
    </div>
  ),
}

export const IconOnly: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Button size="icon-xs" variant="ghost" aria-label="Search">
        <Icon name="tabler:search" />
      </Button>
      <Button size="icon-sm" variant="ghost" aria-label="Search">
        <Icon name="tabler:search" />
      </Button>
      <Button size="icon" variant="ghost" aria-label="Search">
        <Icon name="tabler:search" />
      </Button>
      <Button size="icon-lg" variant="ghost" aria-label="Search">
        <Icon name="tabler:search" />
      </Button>
    </div>
  ),
}

export const Disabled: Story = {
  args: { disabled: true },
}

export const WarningTone: Story = {
  name: 'Tone — warning (outline)',
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="outline" tone="warning">
        <AlertTriangle />
        Re-check eligibility
      </Button>
      <Button variant="outline" size="sm" tone="warning">
        <AlertTriangle />
        Re-check eligibility
      </Button>
    </div>
  ),
}

export const DangerTone: Story = {
  name: 'Tone — danger (outline)',
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="outline" tone="danger">
        <Trash2 />
        Delete policy
      </Button>
      <Button variant="outline" size="sm" tone="danger">
        <Trash2 />
        Delete policy
      </Button>
    </div>
  ),
}

export const ToneIgnoredOnSolid: Story = {
  name: 'Tone — ignored on solid variants',
  render: () => (
    <div className="flex flex-col items-start gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="default" tone="warning">
          <AlertTriangle />
          Default + warning
        </Button>
        <Button variant="secondary" tone="warning">
          <AlertTriangle />
          Secondary + warning
        </Button>
        <Button variant="ghost" tone="warning">
          <AlertTriangle />
          Ghost + warning
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        <code>tone</code> is honored only on <code>variant=&quot;outline&quot;</code>. Solid variants intentionally ignore the prop.
      </p>
    </div>
  ),
}
