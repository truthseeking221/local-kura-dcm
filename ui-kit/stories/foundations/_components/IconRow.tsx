import { Icon } from '@/components/atoms/icon.tsx'

const ICONS: Array<{ name: string; label: string }> = [
  { name: 'tabler:search', label: 'search' },
  { name: 'tabler:bell', label: 'bell' },
  { name: 'tabler:user', label: 'user' },
  { name: 'tabler:calendar', label: 'calendar' },
  { name: 'tabler:shopping-cart', label: 'shopping-cart' },
  { name: 'tabler:activity', label: 'activity' },
  { name: 'tabler:circle-check', label: 'check-circle-2' },
  { name: 'tabler:alert-triangle', label: 'alert-triangle' },
  { name: 'tabler:chevron-right', label: 'chevron-right' },
]

const SIZES = [12, 14, 16, 20, 24, 28] as const

/**
 * Demonstrates the canonical kit icon sizes (12 / 14 / 16 / 20 / 24 / 28) at a
 * 1.5px stroke. Uses a representative spread of icons (rendered via Iconify's
 * `tabler` collection) to expose hairline issues at small sizes.
 */
export function IconSizeMatrix() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[480px] border-separate border-spacing-y-1 text-left">
        <thead>
          <tr>
            <th className="pr-4 text-[11px] font-mono text-muted-foreground">size</th>
            {ICONS.map((entry) => (
              <th key={entry.name} className="px-2 text-[11px] font-mono text-muted-foreground">
                {entry.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {SIZES.map((size) => (
            <tr key={size}>
              <td className="pr-4 text-[11px] font-mono text-foreground align-middle">{size}px</td>
              {ICONS.map((entry) => (
                <td key={entry.name} className="px-2 align-middle">
                  <Icon name={entry.name} size={size} strokeWidth={1.5} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
