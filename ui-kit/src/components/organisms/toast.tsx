import { toast as sonnerToast } from 'sonner'

import { Toaster } from '../ui/sonner.tsx'

/**
 * ToastProvider — Sonner provider preconfigured with Kura defaults
 * (bottom-right, max 3 stacked, prototype-expanded toasts).
 *
 * Mount once at the app root. Trigger toasts anywhere via
 * `import { toast } from '@kura/ui-kit'`.
 */
function ToastProvider(props: Parameters<typeof Toaster>[0]) {
  return (
    <Toaster
      position="bottom-right"
      visibleToasts={3}
      richColors
      closeButton
      {...props}
    />
  )
}

/**
 * `toast` — re-exported sonner with the brand-aligned tone names. Sonner's
 * `toast.error` is aliased to `toast.danger` so consumers stay in the Kura
 * status-tone vocabulary (success / info / warning / danger).
 */
const toast = Object.assign(sonnerToast, {
  danger: sonnerToast.error,
})

export { ToastProvider, toast }
