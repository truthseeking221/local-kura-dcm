# Migration guide — `@kura/ui-kit`

## v0.3.0 — wizard frame consolidation + anti-proliferation policy

### Removed
- `WizardStepHeader` (molecule) — title + subtitle + right-aligned actions header pattern. Shipped briefly during the v0.3.0 train as part of the four-molecule wizard split; consolidated into `<WizardStepBody>` before release.
- `WizardCardSection` (molecule) — card-shaped section container. Shipped briefly; reverted because the pattern (`<section className="rounded-lg border bg-card p-5">`) is too thin to justify an export.
- `WizardFieldRow` (molecule) — N-column equal-width grid. Reverted for the same reason — `<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">` reads cleanly inline.
- `WizardFieldRowCols` (type) — accompanied `WizardFieldRow`.
- `WizardField` (molecule) — labelled wrapper around a form control. Reverted; replaced by an inline `<Label>` + child + helper block pattern at call sites.

Consumers of the v0.2.x line are not affected by these removals — none of these molecules existed in v0.2.x. The removals matter only for any branch that pulled the kit's `main` between the 9-commit Phase A delivery (`adf0835` `feat(ui-kit): add WizardLayout organism …`) and the consolidation (`0501001` `refactor(ui-kit)!: remove redundant Wizard* molecules; superseded by WizardStepBody`).

### Migration recipe

#### `<WizardStepHeader title subtitle actions>` → `<WizardStepBody>`

`WizardStepBody` is the consolidation. Wrap the step body in it; pass title, subtitle, and actions as props. Drop any outer `<div className="flex flex-col gap-6">` wrapper — `<WizardStepBody>` provides it.

Before:

```tsx
<div className="flex flex-col gap-6">
  <WizardStepHeader
    title="Capture identity"
    subtitle="Find a returning patient or pick a capture method."
    actions={<Button variant="outline" size="sm">Unlock fields</Button>}
  />
  <SectionA />
  <SectionB />
</div>
```

After:

```tsx
<WizardStepBody
  title="Capture identity"
  subtitle="Find a returning patient or pick a capture method."
  actions={<Button variant="outline" size="sm">Unlock fields</Button>}
>
  <SectionA />
  <SectionB />
</WizardStepBody>
```

`<WizardStepBody>` accepts an optional `gap` prop (`'sm' | 'md' | 'lg'`, default `'lg'` = `gap-6`) and an optional `as` prop (`'h1' | 'h2' | 'h3'`, default `'h2'`) for the heading level.

#### `<WizardCardSection>` → raw `<section>`

```tsx
<section className="rounded-[var(--radius-lg)] border border-border bg-card p-5">
  …
</section>
```

#### `<WizardFieldRow cols={3}>` → raw `<div>`

```tsx
<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">…</div>
```

For other column counts: `sm:grid-cols-2`, `sm:grid-cols-4`. Tailwind v4 scans literals — never compose the class with template strings.

#### `<WizardField label required locked helperText errorMessage>` → raw label + helper

```tsx
import { Label } from '@kura/ui-kit/ui/label'
import { Icon } from '@kura/ui-kit/atoms' // or your icon source

<div className="space-y-1.5">
  <Label htmlFor={fieldId} className="flex items-center gap-1.5">
    <span>Label text</span>
    {required ? <span aria-hidden className="text-destructive">*</span> : null}
    {locked ? <Icon name="tabler:lock" size={12} className="text-muted-foreground" /> : null}
  </Label>
  {/* input element */}
  {errorMessage ? (
    <p role="alert" className="text-xs text-[var(--status-danger-fg)]">{errorMessage}</p>
  ) : helperText ? (
    <p className="text-xs text-muted-foreground">{helperText}</p>
  ) : null}
</div>
```

The accessibility contract is unchanged: `htmlFor` ↔ input `id`, `role="alert"` on the error paragraph.

### Notes for app maintainers

- Apps consuming `@kura/ui-kit/receptionist` see two NEW exports (`WizardLayout`, `WizardStepFooter`) plus the existing four (`LockableField`, `ContextPickerPopover`, `ContextPickerItem`, `SubjectHeader`). No imports break.
- The CLAUDE.md policy refresh ratifies the existing pattern: apps own thin data-wiring shells around kit organisms (e.g., `apps/receptionist/src/shell/TopBar.tsx` wrapping `<AppHeader>`). No app-side migration is required by this release.
