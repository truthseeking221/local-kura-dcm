import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { AppSidebar, SidebarNavItem, useSidebar } from '@/components/organisms/app-sidebar.tsx'

import { Icon } from '@/components/atoms/icon.tsx'
const meta: Meta = {
  title: 'Organisms/AppSidebar',
  component: AppSidebar,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
}

export default meta
type Story = StoryObj

const NAV: { label: string; icon: string }[] = [
  { label: 'Reception', icon: 'tabler:home' },
  { label: 'Queue', icon: 'tabler:users' },
  { label: 'Patients', icon: 'tabler:users' },
  { label: 'Orders', icon: 'tabler:clipboard-list' },
  { label: 'Billing', icon: 'tabler:receipt' },
  { label: 'Documents', icon: 'tabler:file-text' },
  { label: 'Reports', icon: 'tabler:chart-bar' },
  { label: 'Settings', icon: 'tabler:settings' },
]

function HeaderWordmark() {
  const { collapsed } = useSidebar()
  return (
    <div className="flex items-center gap-2">
      <span aria-hidden className="flex size-7 shrink-0 items-center justify-center rounded-[var(--radius)] bg-[var(--brand-50)] font-bold text-[var(--brand-700)]">
        K
      </span>
      {!collapsed ? <span className="text-sm font-semibold">Kura Reception</span> : null}
    </div>
  )
}

function FooterDevBadge() {
  const { collapsed } = useSidebar()
  return (
    <span
      className="inline-flex items-center justify-center gap-1.5 rounded-[var(--radius-pill)] bg-[var(--brand-50)] px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--brand-700)]"
    >
      <span>DEV</span>
      {!collapsed ? <span className="font-medium normal-case tracking-normal">Test blank state</span> : null}
    </span>
  )
}

export const ReceptionistRail: Story = {
  render: () => {
    const [activeIndex, setActiveIndex] = useState(0)
    return (
      <div className="flex h-[640px] bg-[var(--bg)]">
        <AppSidebar
          defaultCollapsed={false}
          header={<HeaderWordmark />}
          footer={<FooterDevBadge />}
        >
          {NAV.map((item, index) => {
            return (
              <SidebarNavItem
                key={item.label}
                icon={<Icon name={item.icon} />}
                label={item.label}
                active={activeIndex === index}
                onClick={() => setActiveIndex(index)}
              />
            )
          })}
        </AppSidebar>
        <main className="flex-1 p-6">
          <p className="text-sm text-muted-foreground">
            Active route: <span className="font-semibold text-foreground">{NAV[activeIndex].label}</span>
          </p>
        </main>
      </div>
    )
  },
}

export const StartCollapsed: Story = {
  render: () => (
    <div className="flex h-[640px] bg-[var(--bg)]">
      <AppSidebar
        defaultCollapsed
        header={<HeaderWordmark />}
        footer={<FooterDevBadge />}
      >
        {NAV.map((item, index) => {
          const Icon = item.icon
          return (
            <SidebarNavItem
              key={item.label}
              icon={<Icon />}
              label={item.label}
              active={index === 0}
            />
          )
        })}
      </AppSidebar>
      <main className="flex-1 p-6 text-sm text-muted-foreground">
        Click the chevron in the sidebar footer to expand.
      </main>
    </div>
  ),
}
