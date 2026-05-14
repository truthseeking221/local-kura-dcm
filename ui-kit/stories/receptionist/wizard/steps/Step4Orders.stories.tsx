import type { Meta, StoryObj } from '@storybook/react-vite'
import { type ReactNode, useState } from 'react'

import { Icon } from '@/components/atoms/icon.tsx'
import { Kbd } from '@/components/atoms/kbd.tsx'
import { CatalogNavItem } from '@/components/molecules/catalog-nav-item.tsx'
import { FilterBar } from '@/components/molecules/filter-bar.tsx'
import { FilterGroup } from '@/components/molecules/filter-group.tsx'
import {
  KeyboardHint,
  KeyboardHintsBar,
} from '@/components/molecules/keyboard-hint.tsx'
import { SearchInput } from '@/components/molecules/search-input.tsx'
import { CatalogWorkspace } from '@/components/organisms/catalog-workspace.tsx'
import { Badge } from '@/components/ui/badge.tsx'
import { Button } from '@/components/ui/button.tsx'
import {
  ToggleGroup,
  ToggleGroupItem,
} from '@/components/ui/toggle-group.tsx'
import { cn } from '@/lib/cn.ts'

import { CAPTURED_PATIENT, type Patient } from '../../_fixtures/patient.ts'

import { StepShell } from './_scaffold.tsx'

const meta: Meta = {
  title: 'Receptionist/Wizard/Steps/Step4 Orders',
  tags: ['autodocs', 'module:receptionist'],
  parameters: { layout: 'fullscreen' },
}
export default meta

type Story = StoryObj

const ORDERS_PATIENT: Patient = {
  ...CAPTURED_PATIENT,
  cart: {
    ccy: 'USD',
    items: [
      { id: 'vit-pkg', kind: 'vitals', name: 'Vital signs package', price: 0, qty: 1, auto: true },
      { id: 'telecon', kind: 'telecon', name: 'Teleconsultation', price: 0, qty: 1, auto: true },
    ],
  },
}

const PANEL_NAV = [
  { id: 'general-health', label: 'General Health', icon: 'tabler:stethoscope', count: 7 },
  { id: 'stds', label: 'STDs', icon: 'tabler:shield-plus', count: 37 },
  { id: 'cancer', label: 'Cancer', icon: 'tabler:crosshair', count: 40 },
  { id: 'hpv', label: 'HPV', icon: 'tabler:badge', count: 4 },
  { id: 'cardiology', label: 'Cardiology', icon: 'tabler:heartbeat', count: 21 },
  { id: 'liver', label: 'Liver', icon: 'tabler:oval-vertical', count: 31 },
  { id: 'kidney', label: 'Kidney', icon: 'tabler:yin-yang', count: 16 },
  { id: 'thyroid', label: 'Thyroid', icon: 'tabler:circles', count: 7 },
  { id: 'diabetes', label: 'Diabetes', icon: 'tabler:droplet', count: 10 },
  { id: 'lipid', label: 'Lipid', icon: 'tabler:binary-tree', count: 15 },
  { id: 'hepatitis', label: 'Hepatitis', icon: 'tabler:virus', count: 14 },
  { id: 'reproductive', label: 'Reproductive Health', icon: 'tabler:scissors', count: 12 },
  { id: 'ovarian', label: 'Ovarian Reserve', icon: 'tabler:affiliate', count: 5 },
  { id: 'premarital', label: 'Pre-marital', icon: 'tabler:users-group', count: 30 },
  { id: 'osteoporosis', label: 'Osteoporosis', icon: 'tabler:bone', count: 12 },
  { id: 'arthritis', label: 'Arthritis', icon: 'tabler:armchair', count: 47 },
  { id: 'allergy', label: 'Allergy', icon: 'tabler:sun', count: 49 },
  { id: 'vitamin', label: 'Vitamin', icon: 'tabler:pill', count: 12 },
  { id: 'food', label: 'Food', icon: 'tabler:bowl', count: 8 },
] as const

type SpecialtyTone = 'haem' | 'biochem' | 'urine' | 'vitals' | 'popular'

const TEST_ROWS: Array<{
  id: string
  name: string
  price: string
  highlighted?: boolean
  info?: boolean
  tags: Array<{ label: string; tone: SpecialtyTone }>
}> = [
  {
    id: 'cbc',
    name: 'Complete Blood Count (CBC)',
    price: '$8.00',
    highlighted: true,
    info: true,
    tags: [
      { label: 'HAEM', tone: 'haem' },
      { label: 'POPULAR', tone: 'popular' },
    ],
  },
  {
    id: 'glucose',
    name: 'Blood Glucose (Fasting)',
    price: '$5.00',
    info: true,
    tags: [
      { label: 'BIOCHEM', tone: 'biochem' },
      { label: 'POPULAR', tone: 'popular' },
    ],
  },
  {
    id: 'lipid-panel',
    name: 'Lipid Panel',
    price: '$12.00',
    info: true,
    tags: [
      { label: 'BIOCHEM', tone: 'biochem' },
      { label: 'POPULAR', tone: 'popular' },
    ],
  },
  {
    id: 'urinalysis',
    name: 'Urinalysis',
    price: '$6.00',
    info: true,
    tags: [
      { label: 'URINE', tone: 'urine' },
      { label: 'POPULAR', tone: 'popular' },
    ],
  },
  {
    id: 'blood-pressure',
    name: 'Blood pressure',
    price: '$0.00',
    tags: [{ label: 'VITALS', tone: 'vitals' }],
  },
  {
    id: 'bmi',
    name: 'Height / weight / BMI',
    price: '$0.00',
    tags: [{ label: 'VITALS', tone: 'vitals' }],
  },
  {
    id: 'temperature',
    name: 'Temperature',
    price: '$0.00',
    tags: [{ label: 'VITALS', tone: 'vitals' }],
  },
]

const BUNDLE_ROWS = [
  {
    id: 'annual',
    name: 'Annual health check-up',
    description: 'Routine screening bundle for adults 18+.',
    tests: '7 tests',
    total: '$95.00',
    action: 'Add bundle',
  },
  {
    id: 'preop',
    name: 'Pre-op screen',
    description: 'Pre-anaesthesia workup for elective surgery.',
    tests: '6 tests',
    total: '$110.00',
    action: 'Add 4 more',
  },
  {
    id: 'diabetes',
    name: 'Diabetes follow-up',
    description: 'Quarterly monitoring panel for diabetic patients.',
    tests: '4 tests',
    total: '$48.00',
    action: 'Add bundle',
  },
]

function OrdersStoryFrame({
  initialActive = 'general-health',
  initialCurrency = 'USD',
}: {
  initialActive?: string
  initialCurrency?: 'USD' | 'KHR'
}) {
  return (
    <StepShell
      patient={ORDERS_PATIENT}
      currentStep={4}
      doneThroughStep={3}
      asideWidth={392}
      showAutoCartItems
      cartStillNeeded={['Book or skip teleconsult']}
    >
      <OrdersWorkstation initialActive={initialActive} initialCurrency={initialCurrency} />
    </StepShell>
  )
}

function OrdersWorkstation({
  initialActive,
  initialCurrency,
}: {
  initialActive: string
  initialCurrency: 'USD' | 'KHR'
}) {
  const [active, setActive] = useState(initialActive)
  const [query, setQuery] = useState('')
  const [currency, setCurrency] = useState<'USD' | 'KHR'>(initialCurrency)
  const [price, setPrice] = useState('any')
  const [coverage, setCoverage] = useState('all')
  const showBundles = active === 'bundles'

  return (
    <CatalogWorkspace
      sidebar={<CatalogueSideNav active={active} onSelect={setActive} />}
      search={<OrderSearchInput query={query} onQueryChange={setQuery} />}
      toolbarTrailing={
        <CurrencyToggle currency={currency} onCurrencyChange={setCurrency} />
      }
      filters={
        <CatalogueFilterBar
          price={price}
          coverage={coverage}
          onPriceChange={setPrice}
          onCoverageChange={setCoverage}
        />
      }
      hints={<KeyboardHintStrip />}
      height="calc(100vh - 248px)"
      minHeight={520}
      bodyClassName="bg-[var(--surface)]"
    >
      {showBundles ? <BundleRows /> : <TestRows />}
    </CatalogWorkspace>
  )
}

function CatalogueSideNav({
  active,
  onSelect,
}: {
  active: string
  onSelect: (id: string) => void
}) {
  return (
    <>
      <div className="flex flex-col gap-px">
        <CatalogNavItem
          label="Bundles"
          icon={<CatalogueIcon name="tabler:cube" active />}
          count={12}
          shortcut="1"
          active={active === 'bundles'}
          emphasized
          title="Bundles · press 1"
          onClick={() => onSelect('bundles')}
        />
      </div>
      <div className="my-1 border-t border-[var(--border)]" aria-hidden />
      <div className="flex flex-col gap-px">
        <div className="px-2 pb-1 pt-2 text-k-xs font-bold uppercase tracking-k-caps text-[var(--ink-400)]">
          Panels
        </div>
        {PANEL_NAV.map((panel) => (
          <CatalogNavItem
            key={panel.id}
            label={panel.label}
            icon={
              <CatalogueIcon
                name={panel.icon}
                active={active === panel.id}
              />
            }
            count={panel.count}
            active={active === panel.id}
            title={panel.label}
            onClick={() => onSelect(panel.id)}
          />
        ))}
      </div>
    </>
  )
}

function CatalogueIcon({
  name,
  active,
}: {
  name: string
  active?: boolean
}) {
  return (
    <Icon
      name={name}
      size={15}
      className={cn(active ? 'text-[var(--brand-600)]' : 'text-[var(--ink-700)]')}
      aria-hidden
    />
  )
}

function OrderSearchInput({
  query,
  onQueryChange,
}: {
  query: string
  onQueryChange: (value: string) => void
}) {
  return (
    <SearchInput
      density="compact"
      value={query}
      onChange={(event) => onQueryChange(event.target.value)}
      onClear={query ? () => onQueryChange('') : undefined}
      placeholder="Search test, service, package"
      trailing={
        query ? null : (
          <Kbd className="h-[18px] min-w-[18px] rounded-[var(--radius-xs)] bg-[var(--surface)] px-1 text-[9.5px] opacity-70">
            /
          </Kbd>
        )
      }
    />
  )
}

function CurrencyToggle({
  currency,
  onCurrencyChange,
}: {
  currency: 'USD' | 'KHR'
  onCurrencyChange: (value: 'USD' | 'KHR') => void
}) {
  return (
    <ToggleGroup
      type="single"
      value={currency}
      onValueChange={(value) => {
        if (value === 'USD' || value === 'KHR') onCurrencyChange(value)
      }}
      variant="outline"
      size="sm"
      aria-label="Display currency"
      className="h-7 rounded-[var(--radius-sm)] border border-[var(--border-strong)] bg-[var(--surface-2)] p-0.5"
    >
      {(['USD', 'KHR'] as const).map((option) => (
        <ToggleGroupItem
          key={option}
          value={option}
          className="h-[22px] min-w-0 !rounded-[var(--radius-xs)] border-0 px-2 text-[10.5px] font-bold tracking-[0.02em] text-[var(--ink-500)] shadow-none hover:text-[var(--ink-700)] data-[state=on]:bg-[var(--surface)] data-[state=on]:text-[var(--ink-900)] data-[state=on]:shadow-[var(--shadow-sm)]"
        >
          {option}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}

function CatalogueFilterBar({
  price,
  coverage,
  onPriceChange,
  onCoverageChange,
}: {
  price: string
  coverage: string
  onPriceChange: (value: string) => void
  onCoverageChange: (value: string) => void
}) {
  return (
    <FilterBar
      className="flex-wrap gap-x-2 gap-y-1.5 text-k-xs"
      role="region"
      aria-label="Catalogue filters"
    >
      <FilterGroup
        label="Price"
        icon={<Icon name="tabler:filter" size={13} aria-hidden />}
        className="gap-2"
      >
        <FilterToggleGroup
          ariaLabel="Price filter"
          value={price}
          onValueChange={onPriceChange}
          options={[
            ['any', 'Any'],
            ['free', 'Free'],
            ['lt25', '≤ $25'],
            ['25to50', '$25–$50'],
            ['gt50', '$50+'],
          ]}
        />
      </FilterGroup>
      <div className="mx-1 h-4 w-px bg-[var(--border)]" aria-hidden />
      <FilterGroup label="Coverage" className="gap-2">
        <FilterToggleGroup
          ariaLabel="Coverage filter"
          value={coverage}
          onValueChange={onCoverageChange}
          options={[
            ['all', 'All'],
            ['covered', 'Covered'],
            ['not-covered', 'Not covered'],
          ]}
        />
      </FilterGroup>
    </FilterBar>
  )
}

function FilterToggleGroup({
  ariaLabel,
  value,
  onValueChange,
  options,
}: {
  ariaLabel: string
  value: string
  onValueChange: (value: string) => void
  options: Array<[string, string]>
}) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(next) => {
        if (next) onValueChange(next)
      }}
      variant="outline"
      size="sm"
      aria-label={ariaLabel}
      className="flex-wrap gap-1 rounded-none"
    >
      {options.map(([optionValue, label]) => (
        <ToggleGroupItem
          key={optionValue}
          value={optionValue}
          className="h-6 min-w-0 !rounded-full border border-[var(--border)] bg-[var(--surface)] px-[9px] text-[11px] font-semibold text-[var(--ink-700)] shadow-none hover:bg-[var(--surface-2)] data-[state=on]:border-[var(--brand-200)] data-[state=on]:bg-[var(--brand-50)] data-[state=on]:text-[var(--brand-700)]"
        >
          {label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}

const hintKbdClass =
  'h-[18px] min-w-[18px] rounded-[var(--radius-xs)] bg-[var(--surface)] px-[5px] text-[9.5px]'

function KeyboardHintStrip() {
  return (
    <KeyboardHintsBar className="gap-x-3.5 gap-y-1 text-[10.5px]">
      <KeyboardHint keys="/" kbdClassName={hintKbdClass} className="gap-1">
        search
      </KeyboardHint>
      <KeyboardHint keys={['↑', '↓']} kbdClassName={hintKbdClass} className="gap-1">
        navigate
      </KeyboardHint>
      <KeyboardHint keys="Space" kbdClassName={hintKbdClass} className="gap-1">
        add/remove
      </KeyboardHint>
      <KeyboardHint keys="Enter" kbdClassName={hintKbdClass} className="gap-1">
        add/remove
      </KeyboardHint>
      <KeyboardHint
        keys={['⇧', 'Enter']}
        keySeparator={<span className="font-semibold text-[var(--ink-400)]">+</span>}
        kbdClassName={hintKbdClass}
        className="gap-1"
      >
        add/remove &amp; next
      </KeyboardHint>
      <KeyboardHint keys="Esc" kbdClassName={hintKbdClass} className="gap-1">
        clear
      </KeyboardHint>
    </KeyboardHintsBar>
  )
}

function TestRows() {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-3.5 pb-0 pt-1.5">
      {TEST_ROWS.map((row) => (
        <TestRow key={row.id} row={row} />
      ))}
    </div>
  )
}

function TestRow({ row }: { row: (typeof TEST_ROWS)[number] }) {
  return (
    <div
      className={cn(
        'grid grid-cols-[minmax(0,1fr)_74px_92px_18px] items-center gap-[9px] border-b border-[var(--border)] py-1.5',
        row.highlighted && 'bg-[rgba(var(--brand-rgb),0.035)]',
      )}
    >
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="truncate text-k-sm font-medium leading-k-snug text-[var(--ink-900)]">
          {row.name}
        </span>
        <div className="flex flex-wrap items-center gap-1">
          {row.tags.map((tag) => (
            <SpecialtyBadge key={`${row.id}-${tag.label}`} tone={tag.tone}>
              {tag.label}
            </SpecialtyBadge>
          ))}
        </div>
      </div>
      <span className="text-right text-k-sm font-[650] text-[var(--ink-900)] tabular-nums">
        {row.price}
      </span>
      <Button
        type="button"
        size="xs"
        variant="outline"
        aria-label={`Add ${row.name}`}
        className="h-[26px] w-full gap-1 rounded-md border-[var(--brand-200)] bg-[var(--brand-50)] px-[9px] text-[11.5px] font-bold text-[var(--brand-700)] shadow-none hover:border-[var(--brand-300)] hover:bg-[var(--brand-100)] hover:text-[var(--brand-700)]"
      >
        <Icon name="tabler:plus" size={11} aria-hidden />
        Add
      </Button>
      {row.info ? (
        <button
          type="button"
          title="Show AI reason"
          aria-label={`Show reason for ${row.name}`}
          className="grid size-[18px] place-items-center rounded-full text-[var(--ink-300)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--ink-600)]"
        >
          <Icon name="tabler:info-circle" size={11} aria-hidden />
        </button>
      ) : (
        <span aria-hidden />
      )}
    </div>
  )
}

function SpecialtyBadge({ tone, children }: { tone: SpecialtyTone; children: ReactNode }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'rounded-[var(--radius-xs)] px-[5px] py-px text-[9.5px] font-bold uppercase leading-k-base tracking-k-wider',
        tone === 'haem' &&
          'border-[var(--danger-100)] bg-[var(--danger-50)] text-[var(--danger-600)]',
        tone === 'biochem' &&
          'border-[var(--brand-100)] bg-[var(--brand-50)] text-[var(--brand-600)]',
        tone === 'popular' &&
          'border-[var(--brand-100)] bg-[var(--brand-50)] text-[var(--brand-600)]',
        tone === 'urine' &&
          'border-[var(--warn-100)] bg-[var(--warn-50)] text-[var(--warn-600)]',
        tone === 'vitals' &&
          'border-[var(--warn-100)] bg-[var(--warn-50)] text-[var(--warn-600)]',
      )}
    >
      {children}
    </Badge>
  )
}

function BundleRows() {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-3.5 py-2.5">
      <div className="grid grid-cols-[minmax(0,1fr)_74px_92px] gap-3 border-b border-[var(--border)] px-0 pb-2 text-k-sm font-semibold text-[var(--ink-900)]">
        <span>Bundle</span>
        <span className="text-right">Tests</span>
        <span className="text-right">Total</span>
      </div>
      {BUNDLE_ROWS.map((bundle) => (
        <div
          key={bundle.id}
          className="grid grid-cols-[minmax(0,1fr)_74px_92px] items-center gap-3 border-b border-[var(--border)] py-2.5"
        >
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="grid size-8 place-items-center rounded-md bg-[var(--brand-50)] text-[var(--brand-700)]">
              <Icon name="tabler:cube" size={17} aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-k-body font-bold leading-k-tight text-[var(--ink-900)]">
                {bundle.name}
              </span>
              <span className="block truncate text-[11.5px] text-[var(--ink-500)]">
                {bundle.description}
              </span>
            </span>
          </div>
          <span className="text-right text-[11.5px] text-[var(--ink-500)]">{bundle.tests}</span>
          <span className="text-right text-k-sm font-[650] text-[var(--ink-900)] tabular-nums">
            {bundle.total}
          </span>
          <div className="col-span-3 flex justify-end">
            <Button
              type="button"
              size="xs"
              className="h-[26px] rounded-md bg-[var(--brand-600)] px-3 text-[11.5px] font-bold text-[var(--ink-0)] hover:bg-[var(--brand-700)]"
            >
              <Icon name="tabler:plus" size={11} aria-hidden />
              {bundle.action}
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}

export const BundlesTab: Story = {
  name: 'Step 4 — Orders workstation',
  render: () => <OrdersStoryFrame initialActive="general-health" />,
}

export const TestsTab: Story = {
  name: 'Step 4 — Tests catalogue',
  render: () => <OrdersStoryFrame initialActive="general-health" />,
}

export const WithExpansion: Story = {
  name: 'Step 4 — Bundles source',
  render: () => <OrdersStoryFrame initialActive="bundles" />,
}

export const KhrCurrency: Story = {
  name: 'Step 4 — KHR currency',
  render: () => <OrdersStoryFrame initialActive="general-health" initialCurrency="KHR" />,
}
