import {
  OrderCart,
  type OrderCartGroup,
  type OrderCartGroupKey,
} from '@/components/organisms/order-cart.tsx'

import {
  type CartItem,
  type Patient,
  cartSubtotal,
} from '../../_fixtures/patient.ts'
import { ORDER_CART_EMPTY_PROPS } from '../../_fixtures/order-cart.ts'

function toOrderCartKind(kind: CartItem['kind']): OrderCartGroupKey {
  if (kind === 'vitals') return 'vitals'
  if (kind === 'telecon') return 'telecon'
  return 'lab'
}

const GROUP_LABEL: Record<OrderCartGroupKey, string> = {
  vitals: 'Vitals',
  telecon: 'Telecon',
  lab: 'Lab tests',
}

const GROUP_ORDER: OrderCartGroupKey[] = ['lab', 'vitals', 'telecon']
const TEST_ITEM_KINDS = new Set<CartItem['kind']>(['lab', 'imaging', 'ecg'])

function usd(n: number): string {
  return `$${n.toFixed(2)}`
}

function buildGroupsFromPatient(patient: Patient): OrderCartGroup[] {
  const buckets: Record<OrderCartGroupKey, { count: number; subtotal: number; items: OrderCartGroup['items'] }> = {
    lab: { count: 0, subtotal: 0, items: [] },
    vitals: { count: 0, subtotal: 0, items: [] },
    telecon: { count: 0, subtotal: 0, items: [] },
  }
  for (const item of patient.cart.items) {
    const kind = toOrderCartKind(item.kind)
    const bucket = buckets[kind]
    bucket.count += item.qty
    bucket.subtotal += item.price * item.qty
    bucket.items.push({
      id: item.id,
      kind,
      name: item.name,
      priceText: item.price === 0 ? null : usd(item.price),
    })
  }
  return GROUP_ORDER.filter((k) => buckets[k].items.length > 0).map((k) => ({
    key: k,
    label: GROUP_LABEL[k],
    count: buckets[k].count,
    subtotalText: usd(buckets[k].subtotal),
    items: buckets[k].items,
  }))
}

const DEFAULT_STILL_NEEDED = [
  'Book or skip teleconsult',
  'Take payment in Step 6 or mark pay-later',
]

export function CartRail({
  patient,
  showAutoItems = false,
  stillNeeded = DEFAULT_STILL_NEEDED,
}: {
  patient: Patient
  showAutoItems?: boolean
  stillNeeded?: string[]
}) {
  const hasTestsInCart = patient.cart.items.some((item) => TEST_ITEM_KINDS.has(item.kind))
  if (!hasTestsInCart && !showAutoItems) {
    return <OrderCart {...ORDER_CART_EMPTY_PROPS} className="!w-full" />
  }

  const groups = buildGroupsFromPatient(patient)
  const itemCount = patient.cart.items.reduce((sum, i) => sum + i.qty, 0)
  const patientPays = cartSubtotal(patient.cart.items)
  return (
    <OrderCart
      className="!w-full"
      itemCount={itemCount}
      groups={groups}
      patientPaysText={usd(patientPays)}
      stillNeeded={stillNeeded}
      onClear={() => {}}
      onExpand={() => {}}
    />
  )
}
