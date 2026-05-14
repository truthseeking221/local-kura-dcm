import {
  type ComponentProps,
  type ReactNode,
  createContext,
  useContext,
  useState,
} from 'react'

import { cn } from '../../lib/cn.ts'

import { Icon } from '../atoms/icon.tsx'
type SidebarContextValue = { collapsed: boolean }
const SidebarContext = createContext<SidebarContextValue>({ collapsed: false })

function useSidebar() {
  return useContext(SidebarContext)
}

type AppSidebarProps = Omit<ComponentProps<'aside'>, 'children'> & {
  /** Controlled collapsed state. Pair with `onCollapsedChange`. */
  collapsed?: boolean
  /** Default collapsed state when uncontrolled. */
  defaultCollapsed?: boolean
  /** Fires when the built-in Collapse button is clicked. */
  onCollapsedChange?: (next: boolean) => void
  /** Top slot — logo + wordmark. Wordmark should hide itself when collapsed via `useSidebar()`. */
  header?: ReactNode
  /** The main nav. Use `SidebarNavItem` children for auto-collapse behavior. */
  children?: ReactNode
  /** Footer slot below the main nav — locale picker, dev toggles, etc. */
  footer?: ReactNode
  /** Width when expanded. Defaults to 240px. */
  expandedWidth?: number
  /** Width when collapsed. Defaults to 56px. */
  collapsedWidth?: number
}

/**
 * AppSidebar — collapsible left rail with `header` / nav children / `footer`
 * slots and a built-in Collapse toggle. Owns the `collapsed` state (controlled
 * or uncontrolled) and exposes it to descendant `SidebarNavItem`s via
 * context, so labels hide automatically when collapsed.
 */
function AppSidebar({
  collapsed,
  defaultCollapsed = false,
  onCollapsedChange,
  header,
  children,
  footer,
  expandedWidth = 240,
  collapsedWidth = 56,
  className,
  style,
  ...props
}: AppSidebarProps) {
  const [internal, setInternal] = useState(defaultCollapsed)
  const isCollapsed = collapsed ?? internal

  function toggle() {
    const next = !isCollapsed
    if (collapsed === undefined) setInternal(next)
    onCollapsedChange?.(next)
  }

  return (
    <SidebarContext.Provider value={{ collapsed: isCollapsed }}>
      <aside
        data-slot="app-sidebar"
        data-collapsed={isCollapsed || undefined}
        className={cn(
          'flex shrink-0 flex-col border-r border-border bg-card transition-[width] duration-200 ease-out',
          className,
        )}
        style={{ width: isCollapsed ? collapsedWidth : expandedWidth, ...style }}
        {...props}
      >
        {header ? (
          <div className="flex h-14 items-center border-b border-border px-3">{header}</div>
        ) : null}
        <nav className="flex-1 overflow-y-auto p-2">{children}</nav>
        {footer ? (
          <div className="flex flex-col gap-2 border-t border-border p-2">{footer}</div>
        ) : null}
        <button
          type="button"
          onClick={toggle}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={cn(
            'flex h-10 w-full items-center gap-2 border-t border-border px-3 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground',
          )}
        >
          <span aria-hidden className="inline-flex size-5 items-center justify-center">
            {isCollapsed ? <Icon name="tabler:chevrons-right" size={16} /> : <Icon name="tabler:chevrons-left" size={16} />}
          </span>
          {!isCollapsed ? <span>Collapse</span> : null}
        </button>
      </aside>
    </SidebarContext.Provider>
  )
}

type SidebarNavItemProps = Omit<ComponentProps<'button'>, 'children'> & {
  /** Icon shown both collapsed and expanded. */
  icon: ReactNode
  /** Label shown when expanded. */
  label: ReactNode
  /** Optional trailing slot (badges, counts) — hidden when collapsed. */
  trailing?: ReactNode
  /** Visual + ARIA active state. */
  active?: boolean
}

/**
 * SidebarNavItem — a single nav row. Reads collapsed state from
 * `<AppSidebar>` via context and hides its label / trailing slot when
 * collapsed, so consumers don't have to thread props.
 */
function SidebarNavItem({
  icon,
  label,
  trailing,
  active,
  className,
  type = 'button',
  ...props
}: SidebarNavItemProps) {
  const { collapsed } = useSidebar()
  return (
    <button
      type={type}
      data-slot="sidebar-nav-item"
      data-active={active || undefined}
      data-collapsed={collapsed || undefined}
      aria-current={active ? 'page' : undefined}
      title={collapsed ? String(label) : undefined}
      className={cn(
        'flex h-9 w-full items-center gap-3 rounded-[var(--radius-sm)] px-2 text-sm text-muted-foreground transition-colors',
        'hover:bg-accent hover:text-foreground',
        'data-[active]:bg-[var(--surface-brand)] data-[active]:text-[var(--brand-700)]',
        'disabled:pointer-events-none disabled:opacity-50',
        '[&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:[stroke-width:1.5]',
        className,
      )}
      {...props}
    >
      <span aria-hidden className="inline-flex shrink-0 items-center justify-center">
        {icon}
      </span>
      {!collapsed ? (
        <>
          <span className="flex-1 truncate text-left">{label}</span>
          {trailing ? <span className="shrink-0">{trailing}</span> : null}
        </>
      ) : null}
    </button>
  )
}

export { AppSidebar, SidebarNavItem, useSidebar }
