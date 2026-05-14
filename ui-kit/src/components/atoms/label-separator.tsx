import { type ComponentProps } from 'react'

import { cn } from '../../lib/cn.ts'

/**
 * LabelSeparator — horizontal hairline with a centred uppercase label,
 * e.g. `OR CAPTURE NEW` between primary input and alternative methods.
 *
 * For a plain rule without text, use `<Separator />` from `@kura/ui-kit/ui/separator`.
 */
function LabelSeparator({ className, children, ...props }: ComponentProps<'div'>) {
  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      data-slot="label-separator"
      className={cn(
        'flex items-center gap-3 text-k-xs font-semibold uppercase tracking-k-caps text-muted-foreground',
        className,
      )}
      {...props}
    >
      <span aria-hidden className="h-px flex-1 bg-border" />
      <span>{children}</span>
      <span aria-hidden className="h-px flex-1 bg-border" />
    </div>
  )
}

export { LabelSeparator }
