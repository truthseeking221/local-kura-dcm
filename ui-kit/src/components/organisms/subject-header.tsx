import { type ElementType, type ReactNode } from 'react'

import { cn } from '../../lib/cn.ts'

type SubjectHeaderProps = {
  /** Caller supplies the kit `<Avatar>` (initials, icon, image). */
  avatar: ReactNode
  /** Heading content. */
  title: ReactNode
  /** Heading element used for `title`. Default `h2` so consumers don't accidentally double-up `<h1>`. */
  as?: 'h1' | 'h2' | 'h3' | 'h4'
  /** Slot for a row of `<MetaPill>` (or any inline metadata). */
  pills?: ReactNode
  /** Right-aligned slot for trailing buttons. */
  actions?: ReactNode
  /** Right-most slot, typically a kit `<StatusPill>`. */
  status?: ReactNode
  /** Outer container className override. */
  className?: string
}

/**
 * Subject-centered header — avatar + title + meta pills + trailing
 * actions + status. Generic to any staff wizard centred on a subject
 * (patient for receptionist; sample/draw for phlebo). Slot-based so
 * conditional rendering happens at the call site; visual consistency is
 * enforced by the recommended children (`MetaPill`, `StatusPill`) being
 * kit primitives.
 *
 * Responsive shape is locked to a visual contract: avatar / title / meta-pill
 * dimensions and breakpoint micro-tuning (`max-[640px]:*`, `max-[359px]:*`)
 * use arbitrary `[Npx]` values intentionally — they express fixed slot
 * geometry, not density-aware spacing (see CLAUDE.md "Layout-only arbitrary
 * `[Npx]`"). At sub-359-px viewports the meta-pill text drops to `10px` —
 * a phone-edge chrome fallback, not body text (see CLAUDE.md body-min-11
 * carve-out).
 *
 * @kuraModules receptionist, phlebo
 */
function SubjectHeader({
  avatar,
  title,
  as = 'h2',
  pills,
  actions,
  status,
  className,
}: SubjectHeaderProps) {
  const Heading = as as ElementType
  return (
    <div
      data-slot="subject-header"
      className={cn(
        'sticky top-0 z-20 flex min-w-0 items-center justify-between gap-4 border-b border-border bg-[var(--surface)] px-6 py-3.5',
        'max-[640px]:grid max-[640px]:grid-cols-[40px_minmax(0,1fr)_minmax(116px,40%)] max-[640px]:grid-rows-[auto_auto] max-[640px]:items-start max-[640px]:gap-x-2.5 max-[640px]:gap-y-1 max-[640px]:bg-[color-mix(in_srgb,var(--surface)_94%,var(--brand-50))] max-[640px]:px-3 max-[640px]:py-[11px]',
        'max-[359px]:grid-cols-[36px_minmax(0,1fr)_minmax(102px,38%)] max-[359px]:gap-x-[7px] max-[359px]:gap-y-[5px] max-[359px]:px-2.5 max-[359px]:py-[9px]',
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-3.5 max-[640px]:contents">
        <span className="shrink-0 [&_[data-slot=avatar-fallback]]:text-[13.5px] [&_[data-slot=avatar-fallback]]:font-bold [&_[data-slot=avatar]]:size-[42px] max-[640px]:col-start-1 max-[640px]:row-span-2 max-[640px]:row-start-1 max-[640px]:self-start max-[640px]:[&_[data-slot=avatar-fallback]]:text-[12.5px] max-[640px]:[&_[data-slot=avatar]]:size-10 max-[359px]:[&_[data-slot=avatar-fallback]]:text-[11.5px] max-[359px]:[&_[data-slot=avatar]]:size-9">
          {avatar}
        </span>
        <div className="flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1 max-[640px]:contents">
          <Heading className="min-w-0 flex-none text-[16.5px] leading-[1.2] font-[760] text-[var(--ink-900)] max-[640px]:col-start-2 max-[640px]:row-start-1 max-[640px]:self-start max-[640px]:overflow-hidden max-[640px]:text-ellipsis max-[640px]:whitespace-nowrap max-[640px]:text-base max-[640px]:leading-[1.15] max-[359px]:text-[15px]">
            {title}
          </Heading>
          {pills ? (
            <span
              className={cn(
                'flex min-w-0 flex-wrap items-center gap-[7px]',
                '[&_[data-slot=meta-pill]]:min-w-0 [&_[data-slot=meta-pill]]:rounded-[var(--radius-sm)] [&_[data-slot=meta-pill]]:border-[var(--border-strong)] [&_[data-slot=meta-pill]]:bg-[var(--surface)] [&_[data-slot=meta-pill]]:px-[7px] [&_[data-slot=meta-pill]]:py-0.5 [&_[data-slot=meta-pill]]:text-[11px] [&_[data-slot=meta-pill]]:font-[620] [&_[data-slot=meta-pill]]:text-[var(--ink-600)] [&_[data-slot=meta-pill]]:tabular-nums',
                '[&_[data-slot=meta-pill]_[aria-hidden]]:text-[var(--brand-500)] [&_[data-slot=meta-pill]_[aria-hidden]]:opacity-70',
                'max-[640px]:col-start-2 max-[640px]:row-start-2 max-[640px]:flex-nowrap max-[640px]:gap-0 max-[640px]:self-start max-[640px]:overflow-x-auto max-[640px]:overflow-y-hidden max-[640px]:[scrollbar-width:none] max-[640px]:[&::-webkit-scrollbar]:hidden',
                'max-[640px]:[&_[data-slot=meta-pill]]:h-auto max-[640px]:[&_[data-slot=meta-pill]]:flex-none max-[640px]:[&_[data-slot=meta-pill]]:rounded-none max-[640px]:[&_[data-slot=meta-pill]]:border-0 max-[640px]:[&_[data-slot=meta-pill]]:bg-transparent max-[640px]:[&_[data-slot=meta-pill]]:p-0 max-[640px]:[&_[data-slot=meta-pill]]:text-xs max-[640px]:[&_[data-slot=meta-pill]]:leading-[1.3]',
                'max-[640px]:[&_[data-slot=meta-pill]_[aria-hidden]]:hidden max-[640px]:[&_[data-slot=meta-pill]:not(:first-child)]:relative max-[640px]:[&_[data-slot=meta-pill]:not(:first-child)]:ml-2 max-[640px]:[&_[data-slot=meta-pill]:not(:first-child)]:pl-2.5 max-[640px]:[&_[data-slot=meta-pill]:not(:first-child)::before]:absolute max-[640px]:[&_[data-slot=meta-pill]:not(:first-child)::before]:left-0 max-[640px]:[&_[data-slot=meta-pill]:not(:first-child)::before]:top-1/2 max-[640px]:[&_[data-slot=meta-pill]:not(:first-child)::before]:size-0.5 max-[640px]:[&_[data-slot=meta-pill]:not(:first-child)::before]:-translate-y-1/2 max-[640px]:[&_[data-slot=meta-pill]:not(:first-child)::before]:rounded-full max-[640px]:[&_[data-slot=meta-pill]:not(:first-child)::before]:bg-[var(--ink-300)] max-[640px]:[&_[data-slot=meta-pill]:not(:first-child)::before]:content-[\'\']',
                'max-[359px]:gap-[3px] max-[359px]:[&_[data-slot=meta-pill]]:text-[10px] max-[359px]:[&_[data-slot=meta-pill]:nth-child(3)]:hidden',
              )}
            >
              {pills}
            </span>
          ) : null}
        </div>
      </div>
      {actions ? (
        <span
          data-slot="subject-header-actions"
          className="ml-auto flex shrink-0 items-center gap-2 max-[640px]:col-start-3 max-[640px]:row-start-2 max-[640px]:ml-0 max-[640px]:w-full max-[640px]:min-w-0 max-[640px]:justify-end max-[640px]:self-start max-[640px]:justify-self-end"
        >
          {actions}
        </span>
      ) : null}
      {status ? (
        <span
          data-slot="subject-header-status"
          className="ml-auto flex shrink-0 items-center max-[640px]:col-start-3 max-[640px]:row-start-1 max-[640px]:ml-0 max-[640px]:min-w-0 max-[640px]:justify-self-end max-[640px]:self-center"
        >
          {status}
        </span>
      ) : null}
    </div>
  )
}

export { SubjectHeader }
