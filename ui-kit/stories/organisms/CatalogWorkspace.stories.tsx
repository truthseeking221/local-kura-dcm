import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { Icon } from '@/components/atoms/icon.tsx'
import { Kbd } from '@/components/atoms/kbd.tsx'
import { SectionLabel } from '@/components/atoms/section-label.tsx'
import { CatalogNavItem } from '@/components/molecules/catalog-nav-item.tsx'
import { FilterBar } from '@/components/molecules/filter-bar.tsx'
import { FilterGroup } from '@/components/molecules/filter-group.tsx'
import {
  KeyboardHint,
  KeyboardHintsBar,
} from '@/components/molecules/keyboard-hint.tsx'
import { SearchInput } from '@/components/molecules/search-input.tsx'
import { CatalogWorkspace } from '@/components/organisms/catalog-workspace.tsx'
import { Button } from '@/components/ui/button.tsx'
import {
  ToggleGroup,
  ToggleGroupItem,
} from '@/components/ui/toggle-group.tsx'

const meta = {
  title: 'Organisms/CatalogWorkspace',
  component: CatalogWorkspace,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof CatalogWorkspace>

export default meta
type Story = StoryObj

const NAV_ITEMS = [
  { id: 'general', label: 'General Health', icon: 'tabler:stethoscope', count: 7 },
  { id: 'stds', label: 'STDs', icon: 'tabler:shield-plus', count: 37 },
  { id: 'cancer', label: 'Cancer', icon: 'tabler:crosshair', count: 40 },
  { id: 'cardiology', label: 'Cardiology', icon: 'tabler:heartbeat', count: 21 },
  { id: 'diabetes', label: 'Diabetes', icon: 'tabler:droplet', count: 10 },
]

const ROWS = [
  ['Complete Blood Count (CBC)', 'HAEM · POPULAR', '$8.00'],
  ['Blood Glucose (Fasting)', 'BIOCHEM · POPULAR', '$5.00'],
  ['Lipid Panel', 'BIOCHEM · POPULAR', '$12.00'],
  ['Urinalysis', 'URINE · POPULAR', '$6.00'],
  ['Blood pressure', 'VITALS', '$0.00'],
]

function WorkspaceDemo({ hints = true }: { hints?: boolean }) {
  const [active, setActive] = useState('general')
  const [query, setQuery] = useState('')
  const [price, setPrice] = useState('any')
  const [coverage, setCoverage] = useState('all')

  return (
    <CatalogWorkspace
      className="w-[960px]"
      sidebar={
        <>
          <CatalogNavItem
            label="Bundles"
            count={12}
            shortcut="1"
            emphasized
            icon={<Icon name="tabler:cube" size={15} className="text-[var(--brand-600)]" />}
            onClick={() => setActive('bundles')}
            active={active === 'bundles'}
          />
          <div className="my-1 border-t border-[var(--border)]" aria-hidden />
          <SectionLabel as="div" className="block px-2 pb-1 pt-2 text-[var(--ink-400)]">
            Panels
          </SectionLabel>
          {NAV_ITEMS.map((item) => (
            <CatalogNavItem
              key={item.id}
              label={item.label}
              count={item.count}
              active={active === item.id}
              icon={
                <Icon
                  name={item.icon}
                  size={15}
                  className={active === item.id ? 'text-[var(--brand-600)]' : undefined}
                />
              }
              onClick={() => setActive(item.id)}
            />
          ))}
        </>
      }
      search={
        <SearchInput
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onClear={query ? () => setQuery('') : undefined}
          placeholder="Search test, service, package"
          trailing={query ? null : <Kbd>/</Kbd>}
          inputClassName="h-7 text-[11.5px]"
          iconSize={12}
        />
      }
      toolbarTrailing={
        <ToggleGroup
          type="single"
          value="USD"
          variant="outline"
          size="sm"
          className="h-7 rounded-[var(--radius-sm)] border border-[var(--border-strong)] bg-[var(--surface-2)] p-0.5"
        >
          <ToggleGroupItem value="USD" className="h-[22px] min-w-0 !rounded-[var(--radius-xs)] border-0 px-2 text-[10.5px]">
            USD
          </ToggleGroupItem>
          <ToggleGroupItem value="KHR" className="h-[22px] min-w-0 !rounded-[var(--radius-xs)] border-0 px-2 text-[10.5px]">
            KHR
          </ToggleGroupItem>
        </ToggleGroup>
      }
      filters={
        <FilterBar className="flex-wrap gap-x-2 gap-y-1.5 text-[11px]">
          <FilterGroup label="Price" icon={<Icon name="tabler:filter" size={13} />}>
            <ToggleGroup
              type="single"
              value={price}
              onValueChange={(value) => value && setPrice(value)}
              variant="outline"
              size="sm"
              className="flex-wrap gap-1 rounded-none"
            >
              {['any', 'free', 'lt25'].map((value) => (
                <ToggleGroupItem
                  key={value}
                  value={value}
                  className="h-6 min-w-0 !rounded-full px-[9px] text-[11px]"
                >
                  {value === 'any' ? 'Any' : value === 'free' ? 'Free' : '≤ $25'}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </FilterGroup>
          <FilterGroup label="Coverage">
            <ToggleGroup
              type="single"
              value={coverage}
              onValueChange={(value) => value && setCoverage(value)}
              variant="outline"
              size="sm"
              className="flex-wrap gap-1 rounded-none"
            >
              {['all', 'covered', 'not-covered'].map((value) => (
                <ToggleGroupItem
                  key={value}
                  value={value}
                  className="h-6 min-w-0 !rounded-full px-[9px] text-[11px]"
                >
                  {value === 'all' ? 'All' : value === 'covered' ? 'Covered' : 'Not covered'}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </FilterGroup>
        </FilterBar>
      }
      hints={
        hints ? (
          <KeyboardHintsBar className="gap-x-3.5 gap-y-1 text-[10.5px]">
            <KeyboardHint keys="/" kbdClassName="h-[18px] min-w-[18px] text-[9.5px]">
              search
            </KeyboardHint>
            <KeyboardHint keys={['↑', '↓']} kbdClassName="h-[18px] min-w-[18px] text-[9.5px]">
              navigate
            </KeyboardHint>
            <KeyboardHint keys="Space" kbdClassName="h-[18px] min-w-[18px] text-[9.5px]">
              add/remove
            </KeyboardHint>
          </KeyboardHintsBar>
        ) : null
      }
      minHeight={420}
    >
      <div className="px-3.5 py-1.5">
        {ROWS.map(([name, meta, priceText]) => (
          <div
            key={name}
            className="grid grid-cols-[minmax(0,1fr)_74px_92px] items-center gap-[9px] border-b border-[var(--border)] py-1.5"
          >
            <div className="min-w-0">
              <div className="truncate text-[12.5px] font-medium text-[var(--ink-900)]">
                {name}
              </div>
              <div className="text-[9.5px] font-bold tracking-[0.04em] text-[var(--brand-600)]">
                {meta}
              </div>
            </div>
            <span className="text-right text-[12px] font-[650] tabular-nums">
              {priceText}
            </span>
            <Button size="xs" variant="outline" className="h-[26px]">
              <Icon name="tabler:plus" size={11} />
              Add
            </Button>
          </div>
        ))}
      </div>
    </CatalogWorkspace>
  )
}

export const Default: Story = {
  render: () => <WorkspaceDemo />,
}

export const WithoutHints: Story = {
  render: () => <WorkspaceDemo hints={false} />,
}

export const Playground: Story = {
  args: {
    sidebarWidth: 196,
    minHeight: 420,
  },
  render: (args) => (
    <CatalogWorkspace
      {...args}
      className="w-[760px]"
      sidebar={<CatalogNavItem label="General Health" count={7} active />}
      search={<SearchInput placeholder="Search" />}
    >
      <div className="p-4 text-sm text-muted-foreground">Slotted result region</div>
    </CatalogWorkspace>
  ),
}
