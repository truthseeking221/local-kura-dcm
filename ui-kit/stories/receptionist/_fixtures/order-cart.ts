import type {
  OrderCartBundle,
  OrderCartGroup,
  OrderCartProps,
  OrderCartResultPill,
} from '@/components/organisms/order-cart.tsx'

/**
 * Storybook fixtures for `<OrderCart>`. Mirrors the canonical Figma scenarios
 * (Empty, Loaded, LoadedExpanded) used by the receptionist sidebar branch.
 *
 * Prices are pre-formatted strings here — the kit organism takes ReactNode
 * `priceText` / `subtotalText` (caller owns currency formatting). It's safe
 * for a fixture file to do its own formatting; `formatUsd` is an app concern.
 */

function usd(n: number): string {
  return `$${n.toFixed(2)}`
}

export const ORDER_CART_EMPTY_GROUPS: OrderCartGroup[] = [
  {
    key: 'vitals',
    label: 'Vitals',
    count: 1,
    subtotalText: usd(0),
    items: [
      {
        id: 'vit-pkg',
        kind: 'vitals',
        name: 'Vital signs package',
        priceText: usd(0),
      },
    ],
  },
  {
    key: 'telecon',
    label: 'Telecon',
    count: 1,
    subtotalText: usd(0),
    items: [
      {
        id: 'telecon',
        kind: 'telecon',
        name: 'Teleconsultation',
        priceText: usd(0),
      },
    ],
  },
]

export const ORDER_CART_EMPTY_PROPS = {
  itemCount: 0,
  groups: [],
  patientPaysText: '$0.00',
  stillNeeded: [],
  onAddFirst: () => {},
  onExpand: () => {},
} satisfies Pick<
  OrderCartProps,
  'itemCount' | 'groups' | 'patientPaysText' | 'stillNeeded' | 'onAddFirst' | 'onExpand'
>

export const ORDER_CART_LOADED_GROUPS: OrderCartGroup[] = [
  {
    key: 'lab',
    label: 'Lab tests',
    count: 4,
    subtotalText: usd(152),
    items: [
      { id: 'brca1', kind: 'lab', name: 'BRCA1 - mutation analysis', priceText: usd(55) },
      { id: 'braf', kind: 'lab', name: 'BRAF - mutation analysis', priceText: usd(63) },
      { id: 'phos', kind: 'lab', name: 'Phosphate - Urine', priceText: usd(12) },
      { id: 'ica', kind: 'lab', name: 'Ionized calcium - Arterial blood', priceText: usd(22) },
    ],
  },
  {
    key: 'vitals',
    label: 'Vitals',
    count: 1,
    subtotalText: usd(0),
    items: [
      {
        id: 'vit-pkg',
        kind: 'vitals',
        name: 'Vital signs package',
        priceText: usd(0),
      },
    ],
  },
]

export const ORDER_CART_LOADED_BUNDLES: OrderCartBundle[] = [
  {
    id: 'diabetes',
    title: 'Diabetes follow-up',
    subtitle: 'Known T2D, 3-month review',
    ordersCount: 4,
  },
  {
    id: 'cardiac',
    title: 'Cardiac risk screen',
    subtitle: 'Chest pain or family history',
    ordersCount: 5,
  },
]

export const ORDER_CART_EXPANDED_BUNDLES: OrderCartBundle[] = [
  {
    id: 'diabetes',
    title: 'Diabetes follow-up',
    subtitle: 'Known T2D, 3-month review',
    ordersCount: 4,
    onCancel: () => {},
  },
  {
    id: 'cardiac',
    title: 'Cardiac risk screen',
    subtitle: 'Chest pain or family history',
    ordersCount: 5,
    defaultExpanded: true,
    onCancel: () => {},
    children: [
      { id: 'gp', kind: 'lab', name: 'GP consultation (visit fee)', priceText: usd(15) },
      { id: 'ecg', kind: 'lab', name: 'ECG — 12 lead', priceText: usd(22) },
      {
        id: 'lipid',
        kind: 'lab',
        name: 'Lipid Panel',
        priceText: usd(12),
        subtitle: 'HDL, LDL, Total cholesterol, Triglycerides,\nCholesterol ratio',
      },
      { id: 'bp', kind: 'lab', name: 'Blood pressure', priceText: null },
      {
        id: 'cbc',
        kind: 'lab',
        name: 'Complete Blood Count (CBC)',
        priceText: usd(8),
        subtitle: 'Hemoglobin, Hematocrit, WBC count, Platelet\ncount, MCV, MCH',
      },
    ],
  },
]

export const ORDER_CART_RESULTS_PILLS: OrderCartResultPill[] = [
  {
    id: 'first',
    tone: 'first',
    iconName: 'tabler:zap',
    label: 'First results',
    etaText: '~ 2h',
    meta: 'internal lab',
  },
  {
    id: 'last',
    tone: 'last',
    iconName: 'tabler:hourglass',
    label: 'Last internal',
    etaText: '~ 2h',
    meta: 'internal lab',
  },
  {
    id: 'all',
    tone: 'all',
    iconName: 'tabler:alert-circle',
    label: 'All results',
    etaText: '~ 1d',
    meta: 'external: HbA1c, Kidney\nFunction',
  },
]
