# `@kura/ui-kit` — Storybook addon stack & visual-review workflow

**Date:** 2026-05-08
**Status:** Approved (addon list, Chromatic integration mode, intake/deliver touch points, version bump)
**Predecessor:** `2026-05-08-ui-kit-components-design.md` (the original Storybook setup)

## 0. Prerequisite — Storybook 10 upgrade (executed 2026-05-08)

The original plan was written against Storybook 9, but the addon ecosystem has moved to Storybook 10 (latest addon majors declare SB10 peer deps). Rather than pin every addon to its older SB9 line, the kit was upgraded SB9 → SB10 in the same session as part of this work. Concretely, this bumped:

- `storybook` 9.1.20 → 10.3.6
- `@storybook/react-vite` → 10.3.6
- `@storybook/addon-a11y` → 10.3.6
- `@storybook/addon-docs` → 10.3.6
- `@storybook/addon-themes` → 10.3.6
- `eslint-plugin-storybook` → 10.3.6

Verification after the bump (no addon work yet): `bun run typecheck` exit 0, `bun run lint` exit 0 (5 pre-existing fast-refresh warnings unchanged), `bun run build-storybook` exit 0 (clean build in ~7s, no breaking changes encountered). The existing `.storybook/main.ts` and `.storybook/preview.tsx` worked unchanged against SB10 — no codemods were required.

## 1. Context & scope

The kit's Storybook (v10 after the prerequisite bump above) runs three addons: `@storybook/addon-a11y`, `@storybook/addon-docs`, `@storybook/addon-themes`. The designer reviews components in Storybook against three toolbar dimensions (theme, density, module) and approves changes verbally before `/kura-design:deliver` tags and pushes.

This plan adds four addons that close specific gaps in that review loop:

- **No automated visual regression.** A typo in `--brand-500` ramp neighbors, a stray hard-coded color, or an accidental `mb-` change can pass typecheck/lint/build and ship undetected.
- **No side-by-side Figma overlay.** Designer flips between tabs to verify component-vs-design.
- **No way to force interaction states.** Hover/focus/active/disabled review requires manual mousing, which doesn't scale across N components × theme × density × module.
- **Module tags are invisible.** Stories already declare `module:receptionist | module:phlebo | module:patient`, but there's no visible indicator in the sidebar, so scanning the library by module is impossible.

This plan is a **tooling/infra/workflow change**. No `src/` code changes. No public `package.json#exports` change. Patch-level version bump.

## 2. Addon list

| Addon | Purpose | Story-author burden | SB9 compatible |
|---|---|---|---|
| `@chromatic-com/storybook` | Visual regression snapshots, designer-approved baselines | None (auto-snapshots every story) | Yes |
| `@storybook/addon-designs` | Embed Figma frame next to canvas | Optional `parameters.design` per story | Yes |
| `storybook-addon-pseudo-states` | Toolbar toggles for `:hover`, `:focus`, `:focus-visible`, `:active`, `:disabled` | None (global toolbar) | Yes |
| `@geometricpanda/storybook-addon-badges` | Render story tags as visible sidebar chips | None (consumes existing tags) | Yes |

**Rejected from the original request:**

- **`@storybook/addon-storysource`** — deprecated/removed in SB9. The story-source view it provided is now baked into `@storybook/addon-docs` (Code tab on Docs page, "Show code" toggle on canvas), which the kit already has installed.
- **Storybook Composition** — no second Storybook to compose. Worth revisiting if `apps/receptionist` (or future `apps/phlebo`, `apps/patient`) gain their own Storybooks.

**Deferred to a separate intake:**

- **`@storybook/addon-vitest`** — real test runner. Adopting it means writing `play()` functions per story going forward. Bundling with this round is too much; Chromatic already covers the visual-regression case the designer cares most about.
- **`@etchteam/storybook-addon-status`** — overlaps with the badges addon. Lifecycle states (`stable/beta/deprecated/experimental`) ride on the same tag system the badges addon visualizes.

## 3. Configuration

### 3.1 `package.json`

`devDependencies` grows by four entries (latest SB9-compatible versions selected at install time):

```jsonc
{
  "devDependencies": {
    // ...existing
    "@chromatic-com/storybook": "*",
    "@storybook/addon-designs": "*",
    "@geometricpanda/storybook-addon-badges": "*",
    "storybook-addon-pseudo-states": "*",
    "chromatic": "*"
  }
}
```

`scripts` grows by one:

```jsonc
{
  "scripts": {
    // ...existing
    "chromatic": "chromatic --exit-zero-on-changes"
  }
}
```

`--exit-zero-on-changes` is intentional: visual changes are **expected** during normal feature work and must not abort the deliver script. Designer approval is the gate, not exit code.

`version` bumps from `0.2.0` to `0.2.1`. Per CLAUDE.md, "story-only changes" / internal refactor = patch.

### 3.2 `.storybook/main.ts`

Append to the `addons` array:

```ts
addons: [
  '@storybook/addon-a11y',
  '@storybook/addon-docs',
  '@storybook/addon-themes',
  '@storybook/addon-designs',
  'storybook-addon-pseudo-states',
  '@geometricpanda/storybook-addon-badges',
  '@chromatic-com/storybook',
],
```

No other changes. The existing Vite/Tailwind config is untouched.

### 3.3 `.storybook/preview.tsx`

Add a `badgesConfig` parameter that maps existing story tags to visible badges:

```ts
parameters: {
  // ...existing
  badgesConfig: {
    'module:receptionist': { styles: { backgroundColor: 'var(--brand-500)', color: '#fff' }, title: 'Receptionist' },
    'module:phlebo':       { styles: { backgroundColor: 'var(--logo-navy)',  color: '#fff' }, title: 'Phlebo' },
    'module:patient':      { styles: { backgroundColor: 'var(--logo-cyan)',  color: 'var(--ink-900)' }, title: 'Patient' },
    'beta':       { styles: { backgroundColor: 'var(--warning-500)', color: 'var(--ink-900)' }, title: 'Beta' },
    'deprecated': { styles: { backgroundColor: 'var(--danger-500)',  color: '#fff' }, title: 'Deprecated' },
  },
},
```

CSS variable names above are placeholders — the developer resolves the actual token names from `src/styles/tokens.css` during implementation. If the badges addon does not accept CSS custom properties (it inlines styles into a JS object), substitute hex values pulled from `tokens.css` and add a one-line comment naming the token each hex came from, so future token edits stay traceable.

No other changes to `preview.tsx`. Existing Theme/Density/Module decorators stay as-is. Pseudo-states addon adds its own toolbar entry without configuration.

### 3.4 `.storybook/manager.ts`

No changes.

### 3.5 Per-story Figma URL (opt-in pattern)

Stories that have a Figma source declare it under `parameters.design`:

```ts
export const Default: Story = {
  parameters: { design: { type: 'figma', url: 'https://www.figma.com/file/...' } },
}
```

Stories without a Figma source omit the parameter. The Designs panel hides itself when no design is set. No deliver-time enforcement.

## 4. Workflow integration

### 4.1 `/kura-design:intake` template change

The intake plan template gains one optional section:

```markdown
## Figma reference
- Source: <Figma URL or "n/a — shadcn re-theme" / "n/a — no design source">
```

The developer wires the URL into `parameters.design` per affected story when present. The intake agent does not block plans that omit the section.

### 4.2 `/kura-design:deliver` — new step 3.5

Inserted between existing step 3 ("Verify the build") and step 4 ("Update the public surface docs"):

```markdown
### 3.5 Run Chromatic visual regression

Read `CHROMATIC_PROJECT_TOKEN` from env.

If unset:
- Print: "Chromatic skipped: CHROMATIC_PROJECT_TOKEN not set."
- Continue to step 4.

If set:
- Run `bun run chromatic`.
- Print the build URL Chromatic returns.
- HALT and tell the designer:
  "Visual review pending at <url>. Approve all changes there, then reply
   'approved' to continue. If a change is unintended, reply 'reject <component>'."
- Wait for the designer's reply.
- On 'approved', continue to step 4.
- On 'reject ...', stop the deliver entirely. Do not commit, tag, or push.
  The designer will fix the regression and re-run /kura-design:deliver.
```

**Failure semantics:**

- Token unset → graceful skip with a printed warning. The kit must remain shippable for designers who haven't set up Chromatic yet.
- Network failure during upload → `chromatic` exits non-zero; deliver bails before step 4 (before any commit/tag). Safe by default.
- Visual changes flagged but unreviewed → deliver pauses indefinitely. No auto-tag. Designer reviews and explicitly approves at the printed URL.
- Designer replies 'reject' → deliver aborts. No commit, no tag, no push. Designer fixes and reruns from scratch.

### 4.3 `developer.md` agent file

Add one line to the verification rules:

```markdown
- When `/kura-design:deliver` runs Chromatic, you HALT after printing the
  build URL until the designer replies "approved". You never tag or push
  while a Chromatic review is pending.
```

### 4.4 `expert-designer.md` agent file

No changes. The intake template change in 4.1 is read by the agent at runtime.

### 4.5 `CLAUDE.md`

Add a new section after "Storybook is the spec":

```markdown
### Storybook addon stack

The kit's Storybook runs four non-default addons that affect the design-review
experience:

- `@chromatic-com/storybook` — visual regression. Snapshots fire from
  `/kura-design:deliver` against `CHROMATIC_PROJECT_TOKEN`; designer approves
  at the printed URL before tag/push.
- `@storybook/addon-designs` — optional Figma overlay per story
  (`parameters.design`). Use when the component has a Figma source. Skip
  silently when not.
- `storybook-addon-pseudo-states` — toolbar toggles for `:hover`, `:focus`,
  `:focus-visible`, `:active`, `:disabled`. Stories don't author state
  variants for these — toggle them at review time.
- `@geometricpanda/storybook-addon-badges` — driven by story tags. The
  existing `module:receptionist | module:phlebo | module:patient` tags
  render as colored chips in the sidebar. Lifecycle tags (`beta`,
  `deprecated`) are also supported and configured in `preview.tsx`.

These are local-side only — they do not affect the public
`package.json#exports`.
```

### 4.6 `CHANGELOGS.md` Unreleased entry

Written by `/kura-design:deliver` per its existing step 5. The entry:

```markdown
## Unreleased

### Added
- Storybook addons: `@chromatic-com/storybook`, `@storybook/addon-designs`,
  `storybook-addon-pseudo-states`, `@geometricpanda/storybook-addon-badges`.
- `/kura-design:deliver` now runs Chromatic visual regression and pauses
  for designer approval before tag/push.
```

### 4.7 `MIGRATION.md`

Not created. No breaking changes — `package.json#exports` is unchanged, no exports renamed/removed, no prop signatures touched.

## 5. Public API delta

**None.** This plan does not add, remove, or rename any entry in `package.json#exports`. `API_SURFACE.md` is unchanged.

## 6. Versioning hint

**Patch** — `0.2.0 → 0.2.1`. Tooling and story-rendering improvements only.

## 7. Acceptance criteria

Implementation is done when all of the following are true:

1. `bun install` resolves all four new addons (and `chromatic`) against SB9 with zero peer warnings.
2. `bun run typecheck` passes.
3. `bun run lint` passes.
4. `bun run build-storybook` produces `storybook-static/` with no console errors.
5. `bun run storybook` boots and the toolbar shows: existing Theme / Density / Module **plus** new Pseudo-states dropdown.
6. Sidebar shows colored module badges next to story names that already carry `module:*` tags (`MetaPill`, `LockableField`, `IconChoiceCard`, `ContextPickerPopover`, `CollapsibleSection`, `SubjectHeader`).
7. A spot-check story (e.g. `Button.stories.tsx`) renders correctly under each of the four pseudo-state toggles without layout shift.
8. A spot-check story with `parameters.design` set to a Figma URL shows a Designs panel.
9. `bun run chromatic` runs without crashing when `CHROMATIC_PROJECT_TOKEN` is set; **gracefully no-ops** when unset (verified by unsetting the token locally and running deliver against a no-op diff).
10. `CLAUDE.md`, `/kura-design:intake` template, `/kura-design:deliver` script, and `developer.md` reflect the changes described in section 4.
11. `CHANGELOGS.md` has the Unreleased entry from section 4.6; `package.json` is `0.2.1`; `MIGRATION.md` is **not** created.

## 8. Out of scope

Explicitly excluded from this plan, to keep the round tight:

- **GitHub Actions / CI** for Chromatic. Local-driven deliver is the current contract; CI is a follow-up if a redundant safety net or PR-preview workflow is wanted.
- **`@storybook/addon-vitest`** and play-function tests. Separate intake when the team is ready to commit to authoring play functions.
- **Storybook Composition.** Revisit if a second Storybook is introduced.
- **Lifecycle status policy.** The badges addon supports `beta` / `deprecated` chips; deciding which components carry those tags is a separate decision.
- **Token-to-hex resolution for `badgesConfig`.** Picked at implementation time from `tokens.css`, not in this plan.

## 8.5 Known persistent warnings (accepted)

After the SB10 upgrade and addon installs, two warnings remain in `bun run storybook` / `bun run build-storybook`. Both have been investigated and accepted as upstream-blocked:

- **`@geometricpanda/storybook-addon-badges@2.0.5 depends on ^8.3.0`** — SB10's startup compat checker flags this. The addon's latest published version (2.0.5) declares peer deps against the pre-SB9 modular package architecture (`@storybook/blocks` etc. as separate packages). It still loads at runtime against SB10 because bun pulls the legacy `@storybook/blocks@8.6.14` as a transitive dep. **Resolution path:** wait for the maintainer to ship 3.x with SB10 support (tracked at github.com/storybookjs/storybook/issues/32836). When it lands, bump and remove this note.

- **`unable to find package.json for radix-ui`** — emitted by Storybook core's `getAutoRefs` (verified in `node_modules/storybook/dist/_node-chunks/chunk-H4PWFMMO.js:11895`). The function scans every dep's `package.json` looking for a Storybook composition `url` field. `radix-ui`'s wildcard exports (`./*`) cause node's resolver to throw an error type the function's catch doesn't silence. **Resolution path:** either upstream Storybook fix (broaden the catch), or refactor the kit's 10+ shadcn components to import from `@radix-ui/react-*` directly instead of the `radix-ui` umbrella. Both are out of scope for this work.

The previously-reported `Skipping docgen for ".storybook/preview.tsx"` warning was **fixed in this session** by scoping `react-docgen-typescript` to `src/**/*.{ts,tsx}` only via `reactDocgenTypescriptOptions.include` in `.storybook/main.ts`.

## 9. Risks & open questions

- **`badgesConfig` color format.** The addon's documented config inlines styles into a JS object. CSS custom properties (`var(--brand-500)`) may not resolve in that context. Implementation must verify and fall back to hex pulled from `tokens.css` if needed (see 3.3).
- **Chromatic project setup is a one-time prerequisite.** The first `/kura-design:deliver` run with a token will create the Chromatic project and ask the designer to approve every existing story as the baseline. That first review is large; subsequent runs only flag deltas.
- **Pseudo-states + theme/density/module combinatorics.** Chromatic snapshots multiply quickly when `addon-pseudo-states` is combined with the three existing toolbar dimensions. Default Chromatic snapshots only the canvas as rendered (not every toolbar combination), so this is not an immediate cost — but if per-state snapshots are wanted later, snapshot count and Chromatic billing grow with it.
