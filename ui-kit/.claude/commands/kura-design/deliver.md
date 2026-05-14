---
description: Designer delivery — verifies the build, updates API_SURFACE/CHANGELOGS/MIGRATION, bumps the version, syncs exports, creates a Conventional-Commits commit, tags the release, and pushes commit+tag together.
---

**Operate as the `developer` agent in its Phase 2 (Delivery) mode. Read `.claude/agents/developer.md` before you do anything else.** That file defines your tool boundaries, hard rules, and the verification skills you must invoke. This command is your step-by-step script; the agent file is your charter — both apply.

You are finalizing a design change in `@kura/ui-kit`. The developer (or a prior Claude session under `superpowers:executing-plans`) has already implemented the plan and the designer has reviewed the result in Storybook. Your job is to make the change shippable.

**Invoking this command IS the designer's explicit authorization to commit, tag, and push.** Do not second-guess that. Do not force-push.

## Workflow

### 1. Locate the plan

Determine which plan was executed:

- If the designer named a specific plan in their message, use it.
- Otherwise, list `.claude/plans/*.md` and pick the most recently modified file. Confirm the choice with the designer in one short message before proceeding if there is more than one recent plan.

Read the plan. The plan's "Public API delta" and "Versioning hint" sections drive everything below.

### 2. Determine what changed (ground truth from git, not from the plan)

Run `git status` and `git diff --stat`. Compare against the plan. If a file in the diff isn't covered by the plan (or vice versa), **stop and report** — the designer needs to decide whether to amend the plan or revert the unplanned change.

### 3. Verify the build BEFORE staging anything

Use the `superpowers:verification-before-completion` skill — evidence before assertions. Run, in this order, and bail on the first failure:

```
bun run typecheck
bun run lint
bun run build-storybook
```

If any of these fail, **stop**. Report the failure clearly to the designer with the relevant output. Do **not** proceed to documentation/version/commit until all three are green.

### 3.25 Token-first scan

Hex / rgba / arbitrary-px values in component or story source are a CLAUDE.md violation — every value must resolve to a token in `src/styles/tokens.css`. Run these greps against the staged tree; **every red flag must turn green** before continuing:

```bash
# Filter to additions ('+' lines) so removals during a token sweep don't trigger false positives.
DIFF='git diff --cached -- src/components/**/*.tsx stories/**/*.tsx'
eval $DIFF | grep -E '^\+' | grep -nE '\[#[0-9a-fA-F]{3,8}\]' && echo "❌ hex literal" || echo "✅ no hex"
eval $DIFF | grep -E '^\+' | grep -nE 'rounded-\[[0-9]+px\]' && echo "❌ rounded-[Npx]" || echo "✅ no raw radii"
eval $DIFF | grep -E '^\+' | grep -nE 'shadow-\[0_' | grep -v 'var(--brand-rgb)' && echo "❌ shadow literal" || echo "✅ no shadow literal"
# rgba check excludes the legitimate var(--brand-rgb) overlay pattern documented in CLAUDE.md.
eval $DIFF | grep -E '^\+' | grep -nE 'rgba\([0-9 ,.]+\)' | grep -v 'var(--brand-rgb)' && echo "❌ rgba literal" || echo "✅ no rgba"
```

If any flag, **stop and report**. The fix path is in `CLAUDE.md` § "Tokens are non-negotiable":

1. Replace with the closest token from `tokens.css`, or
2. Extend the scale via a separate `/kura-design:intake` (classification (c) — foundations), then resume the deliver, or
3. (Last resort) document the one-off with a JSDoc note explaining why no token applies, and confirm with the designer before proceeding.

Do not silently let a violation through.

### 3.5 Run Chromatic visual regression

Read `CHROMATIC_PROJECT_TOKEN` from the environment (`$CHROMATIC_PROJECT_TOKEN` in shell, or check `.env` if the project keeps one).

**If the token is unset:**

- Print a single line to the designer: `Chromatic skipped: CHROMATIC_PROJECT_TOKEN not set.`
- Continue to step 4. The kit must remain shippable for designers who haven't set up Chromatic yet.

**If the token is set:**

- Run `bun run chromatic` and capture the output.
- Chromatic prints a build URL of the form `https://www.chromatic.com/build?appId=...&number=N`. Extract that URL from the output.
- HALT and tell the designer:

  > Visual review pending at <build-url>. Approve all changes there, then reply `approved` to continue. If a change is unintended, reply `reject <component>` and I will stop the deliver — you can fix the regression and re-run `/kura-design:deliver`.

- Wait for the designer's reply.
- On `approved`: continue to step 4.
- On `reject <...>`: stop the deliver entirely. Do **not** commit, tag, or push. Report the reject message back to the designer; they will fix the regression and re-run `/kura-design:deliver` from scratch.

**Failure modes:**

- Chromatic CLI exits non-zero (network failure, auth error, etc.) → `bun run chromatic` will exit non-zero (the `--exit-zero-on-changes` flag only suppresses exits for visual deltas, not infra errors). Bail before step 4. Report the error verbatim to the designer.
- No build URL printed → if `chromatic` ran successfully but no URL was extracted, surface the raw output to the designer and ask them to provide the URL manually before continuing.

### 4. Update the public surface docs

Edit `API_SURFACE.md` to reflect the new/changed/removed exports exactly as listed in the plan. The table format and column conventions are already established in the file — match them. If a new export subpath (e.g. a new layer) was added, it must show up here.

### 5. Update / create CHANGELOGS.md

If `CHANGELOGS.md` does not exist, create it using the same shape as `core/CHANGELOGS.md` (see `../core/CHANGELOGS.md` in the workspace for the canonical layout):

```markdown
# Changelogs

## Unreleased

### Added
- ...

### Changed
- ...

### Fixed
- ...

### Removed
- ...
```

Append to (or create) the **Unreleased** section. Group entries under `Added` / `Changed` / `Fixed` / `Removed` / `Breaking` as appropriate. Each entry is one bullet describing the user-visible change (component name + what changed). Reference the plan path at the bottom of the section if there are several entries from one plan.

### 6. Update / create MIGRATION.md (only if there are breaking changes)

If the plan has breaking changes (renamed/removed export, changed prop signature, removed token, etc.), edit `MIGRATION.md` (creating it on first use, mirroring `core/MIGRATION.md`):

```markdown
# Migration guide — `@kura/ui-kit`

## v<next> — <one-line theme>

### Removed / Renamed / Changed
- `<Old>` → `<New>` (or the exact rename / removal)

### Migration
- Concrete codemod or grep-and-replace recipe for consumers.
```

If there are **no** breaking changes, do **not** create `MIGRATION.md`.

### 7. Bump `package.json` version

Apply the rules in CLAUDE.md:

- Pre-1.0 (`0.x.y`):
  - **Minor** for new component / new exported type / new prop or variant **OR** a breaking change (record the break in `MIGRATION.md`).
  - **Patch** for bug fix / internal refactor / story-only change.
- Post-1.0:
  - **Major** for any breaking change to the public surface.
  - **Minor** for additive only.
  - **Patch** for fixes/internals.

If the plan's "Versioning hint" disagrees with what the actual diff shows, trust the diff and explain the discrepancy in one sentence to the designer before bumping.

### 8. Sync `package.json#exports` if needed

If a new layer or new subpath was introduced (e.g. a new `hooks/` directory), add the corresponding entry to `exports` in the same shape as the existing entries. Do not remove existing entries unless the plan calls for it explicitly.

### 9. Final verification

Re-run typecheck + lint to confirm the doc/JSON edits didn't introduce any syntax issues:

```
bun run typecheck
bun run lint
```

Both must be green.

### 10. Commit

Stage only the files that are part of this delivery. Prefer `git add <path>` over `git add -A` to avoid catching unrelated working-tree noise. The expected file set is:

- The plan-driven `.tsx` / `.ts` / `.css` source files.
- `API_SURFACE.md`
- `CHANGELOGS.md`
- `MIGRATION.md` (if present and modified)
- `package.json`

Create the commit with a Conventional-Commits message. Scope is `(ui-kit)`. Choose the type from the diff:

- `feat(ui-kit): ...` — new component / new exported API / new variant
- `fix(ui-kit): ...` — bug fix
- `refactor(ui-kit): ...` — internal restructure with no API change
- `chore(ui-kit): ...` — non-source / tooling
- `feat(ui-kit)!: ...` — breaking change (also include a `BREAKING CHANGE:` footer)

Use a HEREDOC for the message body. Example:

```bash
git commit -m "$(cat <<'EOF'
feat(ui-kit): add ToastStack organism with retry action

- New `ToastStack` organism with `tone` (info/success/warning/danger) and `action` (retry/dismiss).
- Adds `ToastTone` type to organisms barrel.
- API_SURFACE, CHANGELOGS updated. Bumped to 0.x.0.

Plan: .claude/plans/2026-05-08-toast-stack.md

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

For breaking changes, include:

```
BREAKING CHANGE: <Old> renamed to <New>; consumers must update imports.
See MIGRATION.md for the exact recipe.
```

### 11. Tag the release

Create an **annotated** tag matching the new `package.json` version. Annotated tags (not lightweight) so the tag carries metadata:

```bash
NEW_VERSION=$(node -p "require('./package.json').version")
git tag -a "v${NEW_VERSION}" -m "v${NEW_VERSION}"
```

Tag format is `v<major>.<minor>.<patch>` (no `ui-kit/` prefix — each sub-package is its own git repo). If a tag at that version already exists, **stop** and report — never overwrite or `--force` an existing tag.

For breaking changes, the tag message body should mirror the relevant `MIGRATION.md` section so `git tag -n99 v<version>` shows the migration recipe inline.

### 12. Push commit + tag together

Push both in one operation. The designer's invocation of `/kura-design:deliver` is the explicit authorization for this push.

```bash
git push --follow-tags
```

`--follow-tags` only pushes annotated tags reachable from the commits being pushed, which matches exactly what we want: the new commit and its associated `v<version>` tag, nothing else.

If the push fails (auth, branch protection, divergent remote), **stop** and surface the error verbatim. Do not retry with `--force`. Do not push to a non-tracking branch silently.

### 13. Report back

Run `git status` to confirm the working tree is clean. Report to the designer:

- Commit SHA (short)
- Tag name (e.g. `v0.1.0`)
- Version bump (e.g. `0.0.0 → 0.1.0`)
- One-sentence summary of what changed
- One-line confirmation that both commit and tag pushed successfully

## Hard rules

- Do **not** stage or commit if any verification step failed. Fix first.
- Do **not** edit unrelated files. If you find pre-existing breakage, surface it to the designer; don't fix-and-fold.
- Do **not** amend an existing commit; always create a new one.
- Do **not** invent a version bump that disagrees with the diff. The diff is the source of truth.
- Do **not** force-push (`--force`, `--force-with-lease`).
- Do **not** overwrite or move an existing tag. If a tag at the target version already exists, stop.
- Do **not** push to a branch other than the one the designer is working on. If the current branch isn't tracking a remote, ask before pushing.
