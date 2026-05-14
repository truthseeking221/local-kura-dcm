import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "../../lib/cn"

// NOTE: Kura customization.
// Adds `tone` cva variant with `default | warning | danger`. Tone tints
// (border + text + hover-bg) are applied via `compoundVariants` ONLY when
// `variant === 'outline'`; solid variants ignore the prop. Reads the
// canonical status-tone token pairs from tokens.css:
//   warning -> --warn-500 / --status-warning-fg / --status-warning-bg
//   danger  -> --danger-500 / --status-danger-fg / --status-danger-bg
// Hover-bg deliberately uses --status-warning-bg / --status-danger-bg (which
// are re-keyed for [data-theme='dark']) rather than --warn-50 / --danger-50
// (which are light-only). Stock shadcn variants/sizes are preserved.
const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        xs: "h-6 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
      tone: {
        default: "",
        warning: "",
        danger: "",
      },
    },
    compoundVariants: [
      {
        variant: "outline",
        tone: "warning",
        class:
          "border-[var(--warn-500)] text-[var(--status-warning-fg)] hover:bg-[var(--status-warning-bg)]",
      },
      {
        variant: "outline",
        tone: "danger",
        class:
          "border-[var(--danger-500)] text-[var(--status-danger-fg)] hover:bg-[var(--status-danger-bg)]",
      },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
      tone: "default",
    },
  }
)

/**
 * Button — shadcn primitive themed via `theme.css`.
 *
 * The optional `tone` prop tints the chrome of `variant="outline"` ONLY:
 * - `tone="warning"` → `--warn-500` border, `--status-warning-fg` text, `--status-warning-bg` hover.
 * - `tone="danger"`  → `--danger-500` border, `--status-danger-fg` text, `--status-danger-bg` hover.
 *
 * Reserved for warning/danger CTAs that ALSO carry an icon + text label per
 * the brand non-negotiable: status by color alone is forbidden. Solid
 * variants (`default`, `destructive`, `secondary`, `ghost`, `link`) ignore
 * this prop — only `variant="outline"` tints.
 *
 * When `aria-invalid` is set on a `tone="danger"` (or `tone="warning"`)
 * outline button, the base `aria-invalid:border-destructive` style wins by
 * CSS selector specificity (an attribute-pseudo-selector outranks the plain-
 * class compoundVariant tint). This is intentional — `aria-invalid` always
 * over-paints a tone tint because it indicates a validation error, which is
 * the higher-priority signal.
 */
function Button({
  className,
  variant = "default",
  size = "default",
  tone = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      data-tone={tone}
      className={cn(buttonVariants({ variant, size, tone, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
export type ButtonTone = NonNullable<VariantProps<typeof buttonVariants>["tone"]>
