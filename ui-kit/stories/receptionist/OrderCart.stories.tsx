import type { Meta, StoryObj } from '@storybook/react-vite'

import { SearchInput } from '@/components/molecules/search-input.tsx'
import { OrderCart } from '@/components/organisms/order-cart.tsx'
import { Button } from '@/components/ui/button.tsx'

import {
  ORDER_CART_EMPTY_PROPS,
  ORDER_CART_EXPANDED_BUNDLES,
  ORDER_CART_LOADED_BUNDLES,
  ORDER_CART_LOADED_GROUPS,
  ORDER_CART_RESULTS_PILLS,
} from './_fixtures/order-cart.ts'

/** Stub promo control — apps wire their real `<PromoCodeForm>` into `promoSlot`. */
function PromoStub() {
  return (
    <div className="flex items-center gap-1">
      <SearchInput
        density="compact"
        placeholder="PROMO CODE"
        inputClassName="uppercase"
      />
      <Button variant="outline" size="sm">
        Apply
      </Button>
    </div>
  )
}

function SplitBillStub() {
  return (
    <Button variant="outline" size="sm" className="w-full">
      Split bill
    </Button>
  )
}

const meta: Meta<typeof OrderCart> = {
  title: 'Receptionist/Order Cart',
  component: OrderCart,
  tags: ['autodocs', 'module:receptionist'],
  parameters: { layout: 'padded' },
}

export default meta
type Story = StoryObj<typeof OrderCart>

const STILL_NEEDED_LOADED = [
  'Book or skip teleconsult',
  'Take payment in Step 6 or mark pay-later',
]

const EXTERNAL_LAB_VN = {
  flagIcon: 'circle-flags:vn',
  label: 'VN lab',
  etaText: 'ETA 1d',
}

export const Empty: Story = {
  name: 'V1 — Empty / barebones',
  render: () => (
    <div className="flex justify-center bg-[var(--bg)] p-6">
      <OrderCart {...ORDER_CART_EMPTY_PROPS} />
    </div>
  ),
}

export const Loaded: Story = {
  name: 'V2 — Loaded with bundles',
  render: () => (
    <div className="flex justify-center bg-[var(--bg)] p-6">
      <OrderCart
        itemCount={15}
        bundles={ORDER_CART_LOADED_BUNDLES}
        groups={ORDER_CART_LOADED_GROUPS}
        patientPaysText="$244.00"
        stillNeeded={STILL_NEEDED_LOADED}
        resultsPills={ORDER_CART_RESULTS_PILLS}
        externalLab={EXTERNAL_LAB_VN}
        onClear={() => {}}
        onExpand={() => {}}
      />
    </div>
  ),
}

export const LoadedExpanded: Story = {
  name: 'V3 — Loaded + bundle expanded + promo',
  render: () => (
    <div className="flex justify-center bg-[var(--bg)] p-6">
      <OrderCart
        itemCount={17}
        bundles={ORDER_CART_EXPANDED_BUNDLES}
        groups={[]}
        patientPaysText="$266.00"
        showPromoSplit
        promoSubtotalText="$266.00"
        promoSlot={<PromoStub />}
        splitBillSlot={<SplitBillStub />}
        stillNeeded={STILL_NEEDED_LOADED}
        resultsPills={ORDER_CART_RESULTS_PILLS}
        externalLab={EXTERNAL_LAB_VN}
        onClear={() => {}}
        onExpand={() => {}}
      />
    </div>
  ),
}

export const SideBySide: Story = {
  name: 'All variants — side by side',
  render: () => (
    <div className="flex flex-wrap gap-6 bg-[var(--bg)] p-6">
      <OrderCart {...ORDER_CART_EMPTY_PROPS} />
      <OrderCart
        itemCount={15}
        bundles={ORDER_CART_LOADED_BUNDLES}
        groups={ORDER_CART_LOADED_GROUPS}
        patientPaysText="$244.00"
        stillNeeded={STILL_NEEDED_LOADED}
        resultsPills={ORDER_CART_RESULTS_PILLS}
        externalLab={EXTERNAL_LAB_VN}
        onClear={() => {}}
        onExpand={() => {}}
      />
      <OrderCart
        itemCount={17}
        bundles={ORDER_CART_EXPANDED_BUNDLES}
        groups={[]}
        patientPaysText="$266.00"
        showPromoSplit
        promoSubtotalText="$266.00"
        promoSlot={<PromoStub />}
        splitBillSlot={<SplitBillStub />}
        stillNeeded={STILL_NEEDED_LOADED}
        resultsPills={ORDER_CART_RESULTS_PILLS}
        externalLab={EXTERNAL_LAB_VN}
        onClear={() => {}}
        onExpand={() => {}}
      />
    </div>
  ),
}
