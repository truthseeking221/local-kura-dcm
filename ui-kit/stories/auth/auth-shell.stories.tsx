import type { Meta, StoryObj } from '@storybook/react-vite'

import { AuthShell } from '@/components/organisms/auth-shell.tsx'
import { Skeleton } from '@/components/ui/skeleton.tsx'

import { KuraAuthLogo } from './_components/kura-auth-logo.tsx'

const meta: Meta = {
  title: 'Auth/AuthShell',
  component: AuthShell,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
}

export default meta
type Story = StoryObj

function PlaceholderCard() {
  return (
    <div className="w-[460px] rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-xs)] [[data-density='compact']_&]:w-[380px] [[data-density='comfortable']_&]:w-[540px]">
      <p className="text-center text-k-body text-[var(--ink-500)]">
        Card slot — typically a SignInCard / VerifyEmailCard / CheckInboxCard.
      </p>
    </div>
  )
}

export const Default: Story = {
  render: () => (
    <AuthShell logo={<KuraAuthLogo />}>
      <PlaceholderCard />
    </AuthShell>
  ),
}

export const Playground: Story = {
  argTypes: {
    eyebrow: { control: 'text' },
    footer: { control: 'text' },
  },
  args: {
    eyebrow: '',
    footer: '',
  },
  render: (args) => {
    const a = args as { eyebrow?: string; footer?: string }
    return (
      <AuthShell
        eyebrow={a.eyebrow || undefined}
        footer={a.footer || undefined}
        logo={<KuraAuthLogo />}
      >
        <PlaceholderCard />
      </AuthShell>
    )
  },
}

export const WithCustomFooter: Story = {
  render: () => (
    <AuthShell
      footer="Kura · Receptionist platform"
      logo={<KuraAuthLogo />}
    >
      <PlaceholderCard />
    </AuthShell>
  ),
}

export const WithCustomLogo: Story = {
  name: 'WithCustomLogo — consumer-supplied mark',
  render: () => (
    <AuthShell
      eyebrow="SIGN IN TO YOUR ORG"
      footer="Custom org · Demo"
      logo={
        <span className="inline-flex size-[40px] items-center justify-center rounded-[var(--radius)] bg-[var(--brand-500)] text-k-h font-bold text-[var(--ink-0)]">
          K
        </span>
      }
    >
      <PlaceholderCard />
    </AuthShell>
  ),
}

export const WithCardSkeleton: Story = {
  name: 'WithCardSkeleton — /callback loading state',
  render: () => (
    <AuthShell logo={<KuraAuthLogo />}>
      <div className="w-[460px] space-y-5 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-xs)] [[data-density='compact']_&]:w-[380px] [[data-density='comfortable']_&]:w-[540px]">
        <div className="space-y-2">
          <Skeleton className="mx-auto h-5 w-3/4" />
          <Skeleton className="mx-auto h-5 w-1/2" />
        </div>
        <div className="flex justify-center gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="size-10 rounded-[var(--radius-sm)]" />
          ))}
        </div>
        <Skeleton className="h-11 w-full rounded-[var(--radius)]" />
      </div>
    </AuthShell>
  ),
}
