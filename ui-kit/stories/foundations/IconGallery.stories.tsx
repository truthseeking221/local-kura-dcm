/**
 * Curated Iconify gallery for the Kura project. Search across the icons the
 * kit currently consumes (the `tabler:` set, our default chrome collection)
 * plus a hand-picked seed of `healthicons:`, `circle-flags:`, and
 * `simple-icons:` glyphs we expect to need across receptionist, phlebo, and
 * patient surfaces. Click any tile to copy its `<collection>:<name>` id.
 */
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useMemo, useState } from 'react'

import { Icon } from '@/components/atoms/icon.tsx'

const meta: Meta = {
  title: 'Foundations/Icon Gallery',
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
}

export default meta
type Story = StoryObj

// ── Seed catalogue ───────────────────────────────────────────────────────

type Entry = { id: string; tags: string[] }

/** Every Tabler icon currently referenced inside `src/` and `stories/`. */
const TABLER: Entry[] = [
  ['activity', 'pulse heartbeat vitals'],
  ['alert-circle', 'warning info'],
  ['alert-triangle', 'warning danger'],
  ['arrow-right', 'next forward'],
  ['banknote', 'cash money payment'],
  ['beaker', 'lab science'],
  ['bell', 'notification alert'],
  ['bold', 'editor text'],
  ['building', 'corporate facility'],
  ['calendar', 'date schedule'],
  ['camera', 'photo capture'],
  ['chart-bar', 'analytics report stats'],
  ['check', 'confirm done'],
  ['chevron-down', 'expand collapse'],
  ['chevron-left', 'previous'],
  ['chevron-right', 'next'],
  ['chevron-up', 'collapse'],
  ['chevrons-left', 'collapse double'],
  ['chevrons-right', 'expand double'],
  ['circle', 'shape ring'],
  ['circle-check', 'success confirmed'],
  ['circle-filled', 'radio dot'],
  ['clipboard-list', 'orders tasks'],
  ['clock', 'time schedule'],
  ['credit-card', 'payment card'],
  ['file-text', 'document file'],
  ['flask', 'lab science chemistry'],
  ['help-circle', 'help info'],
  ['home', 'reception dashboard'],
  ['hourglass', 'wait pending'],
  ['id-badge-2', 'patient identity'],
  ['info', 'info notice'],
  ['info-circle', 'info notice'],
  ['italic', 'editor text'],
  ['keyboard', 'shortcut'],
  ['languages', 'language translate'],
  ['list-check', 'checklist tasks'],
  ['loader-2', 'loading spinner'],
  ['lock', 'locked secure'],
  ['lock-open', 'unlock'],
  ['logout', 'sign out'],
  ['arrows-maximize', 'expand fullscreen'],
  ['message-circle', 'chat'],
  ['message-square', 'chat sms'],
  ['minus', 'subtract decrement'],
  ['octagon-x', 'error stop'],
  ['pencil', 'edit'],
  ['phone', 'call telephone'],
  ['plus', 'add increment'],
  ['qr-code', 'qr scan'],
  ['receipt', 'billing invoice'],
  ['refresh', 'reload retry'],
  ['scan', 'scan barcode'],
  ['search', 'find query'],
  ['send', 'submit share'],
  ['settings', 'preferences gear'],
  ['shield', 'security insurance'],
  ['shield-check', 'verified secure'],
  ['shopping-cart', 'cart order'],
  ['smartphone', 'mobile phone'],
  ['sparkles', 'ai magic'],
  ['stethoscope', 'doctor exam'],
  ['syringe', 'vaccine injection'],
  ['test-pipe', 'lab specimen'],
  ['trash', 'delete remove'],
  ['triangle', 'shape warning'],
  ['underline', 'editor text'],
  ['user', 'profile patient'],
  ['user-check', 'verified patient'],
  ['user-circle', 'profile avatar'],
  ['user-plus', 'new patient walk-in'],
  ['users', 'queue group'],
  ['video', 'teleconsult call'],
  ['wifi', 'connectivity nfc'],
  ['x', 'close cancel remove'],
  ['zap', 'fast urgent'],
].map(([id, tags]) => ({ id, tags: tags.split(' ') }))

/** Clinic-specific glyphs. */
const HEALTH: Entry[] = [
  ['syringe', 'vaccine injection shot'],
  ['injection', 'vaccine shot'],
  ['vaccine', 'immunisation'],
  ['rdt-result-positive', 'rdt test positive'],
  ['rdt-result-negative', 'rdt test negative'],
  ['blood-cells', 'haematology'],
  ['blood-bag', 'transfusion'],
  ['blood-pressure', 'bp vitals'],
  ['blood-pressure-monitor', 'bp device'],
  ['blood-rh-positive', 'blood type'],
  ['ecg', 'cardiac trace'],
  ['heart-cardiogram', 'ecg cardiac'],
  ['stethoscope', 'doctor exam'],
  ['doctor-male', 'physician'],
  ['doctor-female', 'physician'],
  ['nurse', 'staff'],
  ['patient', 'subject person'],
  ['ward', 'inpatient hospital'],
  ['hospital', 'facility'],
  ['ambulance', 'emergency'],
  ['microscope', 'lab pathology'],
  ['test-tubes', 'lab specimen'],
  ['lab-bench', 'lab workstation'],
  ['pills', 'meds pharmacy'],
  ['pill-1', 'capsule'],
  ['inhaler', 'respiratory'],
  ['x-ray', 'imaging'],
  ['mri', 'imaging'],
  ['ct-scan', 'imaging'],
  ['ultrasound', 'imaging'],
  ['paediatric', 'paediatrics children'],
  ['pregnant', 'maternity'],
].map(([id, tags]) => ({ id, tags: tags.split(' ') }))

/** Country-flag pills (use `strokeWidth={null}` so the colour fill is preserved). */
const FLAGS: Entry[] = [
  ['vn', 'vietnam vietnamese'],
  ['kh', 'cambodia khmer'],
  ['us', 'united states english'],
  ['gb', 'united kingdom english'],
  ['fr', 'france french'],
  ['cn', 'china chinese'],
  ['th', 'thailand thai'],
  ['la', 'laos lao'],
  ['my', 'malaysia malay'],
  ['sg', 'singapore'],
  ['id', 'indonesia'],
  ['ph', 'philippines'],
].map(([id, tags]) => ({ id, tags: tags.split(' ') }))

/** Brand logos for partner channels. */
const BRANDS: Entry[] = [
  ['telegram', 'chat messenger'],
  ['whatsapp', 'chat messenger'],
  ['gmail', 'email'],
  ['google', 'sso login'],
  ['apple', 'sso login ios'],
  ['microsoft', 'sso login'],
  ['stripe', 'payments'],
  ['mastercard', 'payments card'],
  ['visa', 'payments card'],
  ['paypal', 'payments'],
].map(([id, tags]) => ({ id, tags: tags.split(' ') }))

const SECTIONS: Array<{ key: string; title: string; collection: string; icons: Entry[]; preserveStroke?: boolean }> = [
  { key: 'tabler', title: 'Tabler — kit chrome', collection: 'tabler', icons: TABLER },
  { key: 'health', title: 'Healthicons — clinic glyphs', collection: 'healthicons', icons: HEALTH },
  { key: 'flags', title: 'Circle Flags — nation pills', collection: 'circle-flags', icons: FLAGS, preserveStroke: true },
  { key: 'brands', title: 'Simple Icons — brand logos', collection: 'simple-icons', icons: BRANDS, preserveStroke: true },
]

// ── Tile + grid ──────────────────────────────────────────────────────────

function IconTile({ id, collection, preserveStroke }: { id: string; collection: string; preserveStroke?: boolean }) {
  const fullId = `${collection}:${id}`
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(fullId)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch {
      // ignore (e.g. insecure context)
    }
  }
  return (
    <button
      type="button"
      onClick={copy}
      className="group flex flex-col items-center gap-2 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-3 text-left transition-colors hover:border-[var(--brand-500)] hover:bg-[var(--surface-2)]"
      aria-label={`Copy ${fullId}`}
    >
      <Icon
        name={fullId}
        size={24}
        strokeWidth={preserveStroke ? null : 1.5}
        className="text-[var(--ink-700)] group-hover:text-[var(--brand-700)]"
      />
      <span className="line-clamp-2 break-all text-center text-[10.5px] font-mono text-[var(--ink-500)]">
        {id}
      </span>
      {copied ? <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--success-600)]">Copied</span> : null}
    </button>
  )
}

function GallerySection({
  title,
  collection,
  icons,
  query,
  preserveStroke,
}: {
  title: string
  collection: string
  icons: Entry[]
  query: string
  preserveStroke?: boolean
}) {
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return icons
    return icons.filter((entry) => entry.id.includes(q) || entry.tags.some((t) => t.includes(q)))
  }, [icons, query])
  if (filtered.length === 0) return null
  return (
    <section className="space-y-3">
      <header className="flex items-baseline justify-between">
        <h3 className="text-sm font-semibold text-[var(--ink-900)]">{title}</h3>
        <span className="font-mono text-[11px] text-[var(--ink-500)]">
          {collection} · {filtered.length} / {icons.length}
        </span>
      </header>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(112px,1fr))] gap-2">
        {filtered.map((entry) => (
          <IconTile key={entry.id} id={entry.id} collection={collection} preserveStroke={preserveStroke} />
        ))}
      </div>
    </section>
  )
}

function Gallery() {
  const [query, setQuery] = useState('')
  return (
    <div className="flex h-screen flex-col bg-[var(--bg)]">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-[var(--border)] bg-[var(--surface)] px-6 py-4">
        <h2 className="text-base font-semibold text-[var(--ink-900)]">Iconify gallery</h2>
        <span className="text-[12px] text-[var(--ink-500)]">
          Click any tile to copy its <code className="font-mono">collection:name</code> id.
        </span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter by name or keyword (e.g. 'lab', 'vaccine', 'flag')"
          className="ml-auto h-9 w-[360px] rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface-2)] px-3 text-[13px] text-[var(--ink-700)] outline-none placeholder:text-[var(--ink-400)] focus-visible:border-[var(--brand-500)]"
        />
      </header>
      <div className="flex-1 space-y-8 overflow-y-auto px-6 py-6">
        {SECTIONS.map((section) => (
          <GallerySection
            key={section.key}
            title={section.title}
            collection={section.collection}
            icons={section.icons}
            query={query}
            preserveStroke={section.preserveStroke}
          />
        ))}
      </div>
    </div>
  )
}

export const Catalogue: Story = {
  name: 'Curated catalogue',
  render: () => <Gallery />,
}

export const SizeMatrixOnly: Story = {
  name: 'Size matrix',
  render: () => {
    const sizes = [12, 14, 16, 20, 24, 28] as const
    const samples = ['tabler:search', 'tabler:bell', 'tabler:user', 'tabler:calendar', 'tabler:shopping-cart', 'tabler:activity', 'tabler:circle-check', 'tabler:alert-triangle', 'tabler:chevron-right']
    return (
      <div className="bg-[var(--bg)] p-6">
        <table className="w-full max-w-[720px] border-separate border-spacing-y-1 text-left">
          <thead>
            <tr>
              <th className="pr-4 text-[11px] font-mono text-muted-foreground">size</th>
              {samples.map((id) => (
                <th key={id} className="px-2 text-[11px] font-mono text-muted-foreground">
                  {id.split(':')[1]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sizes.map((size) => (
              <tr key={size}>
                <td className="pr-4 align-middle text-[11px] font-mono text-foreground">{size}px</td>
                {samples.map((id) => (
                  <td key={id} className="px-2 align-middle">
                    <Icon name={id} size={size} strokeWidth={1.5} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  },
}
