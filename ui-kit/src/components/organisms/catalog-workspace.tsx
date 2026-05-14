import {
  type CSSProperties,
  type ComponentProps,
  type ReactNode,
} from 'react'

import { cn } from '../../lib/cn.ts'

type CatalogWorkspaceProps = Omit<ComponentProps<'section'>, 'children'> & {
  /** Left rail content, typically grouped `<CatalogNavItem>` rows. */
  sidebar: ReactNode
  /** Search/control slot rendered as the primary toolbar control. */
  search: ReactNode
  /** Right side of the toolbar, e.g. currency toggle or view switcher. */
  toolbarTrailing?: ReactNode
  /** Filter strip slot. Usually `<FilterBar>` with `<FilterGroup>` children. */
  filters?: ReactNode
  /** Shortcut/helper strip slot. Usually `<KeyboardHintsBar>`. */
  hints?: ReactNode
  /** Result rows or cards. Caller owns domain-specific row rendering. */
  children: ReactNode
  /** Sidebar column width. Defaults to the receptionist orders prototype rail. */
  sidebarWidth?: number | string
  /** Optional fixed/workspace height. Use a CSS length such as `calc(100vh - 248px)`. */
  height?: CSSProperties['height']
  /** Minimum usable workspace height. */
  minHeight?: CSSProperties['minHeight']
  sidebarClassName?: string
  toolbarClassName?: string
  filterClassName?: string
  hintsClassName?: string
  bodyClassName?: string
}

function cssLength(value: number | string): string {
  return typeof value === 'number' ? `${value}px` : value
}

/**
 * CatalogWorkspace — operational catalogue shell with a scrollable category
 * rail, compact search toolbar, optional filter/hotkey strips, and a result
 * region.
 *
 * Universal. The organism owns workflow layout and rhythm; callers own data,
 * row content, business actions, and state.
 */
function CatalogWorkspace({
  sidebar,
  search,
  toolbarTrailing,
  filters,
  hints,
  children,
  sidebarWidth = 196,
  height,
  minHeight = 360,
  className,
  sidebarClassName,
  toolbarClassName,
  filterClassName,
  hintsClassName,
  bodyClassName,
  style,
  ...props
}: CatalogWorkspaceProps) {
  return (
    <section
      data-slot="catalog-workspace"
      className={cn(
        'overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-xs)]',
        className,
      )}
      {...props}
    >
      <div
        data-slot="catalog-workspace-grid"
        className="grid min-h-0"
        style={{
          gridTemplateColumns: `${cssLength(sidebarWidth)} minmax(0, 1fr)`,
          height,
          minHeight,
          ...style,
        }}
      >
        <aside
          data-slot="catalog-workspace-sidebar"
          className={cn(
            'flex min-h-0 flex-col gap-1.5 overflow-y-auto border-r border-[var(--border)] bg-[var(--surface-2)] px-1.5 py-2 [scrollbar-gutter:stable]',
            sidebarClassName,
          )}
        >
          {sidebar}
        </aside>
        <div data-slot="catalog-workspace-main" className="flex min-h-0 min-w-0 flex-col">
          <div
            data-slot="catalog-workspace-toolbar"
            className={cn(
              'flex items-center gap-2 border-b border-[var(--border)] px-3.5 py-[9px]',
              toolbarClassName,
            )}
          >
            <div className="min-w-0 flex-1">{search}</div>
            {toolbarTrailing ? <div className="shrink-0">{toolbarTrailing}</div> : null}
          </div>
          {filters ? (
            <div
              data-slot="catalog-workspace-filters"
              className={cn(
                'flex min-h-9 items-center border-b border-[var(--border)] bg-[var(--surface)] px-3.5 py-1.5',
                filterClassName,
              )}
            >
              {filters}
            </div>
          ) : null}
          {hints ? (
            <div
              data-slot="catalog-workspace-hints"
              className={cn(
                'border-b border-[var(--border)] bg-[var(--surface-2)] px-3.5 py-[7px]',
                hintsClassName,
              )}
            >
              {hints}
            </div>
          ) : null}
          <div
            data-slot="catalog-workspace-body"
            className={cn('min-h-0 flex-1 overflow-y-auto', bodyClassName)}
          >
            {children}
          </div>
        </div>
      </div>
    </section>
  )
}

export { CatalogWorkspace, type CatalogWorkspaceProps }
