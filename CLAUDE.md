# Libretto Monorepo

## Releasing a New Version

**Never manually edit `packages/libretto/package.json` version.** Use the release script:

```bash
scripts/prepare-release.sh [patch|minor|major]
```

This script:
1. Checks out and updates `main` (working tree must be clean)
2. Runs type-check and tests
3. Bumps the version in `packages/libretto/package.json`
4. Updates version in all SKILL.md files via `set-libretto-skill-version.mjs`
5. Syncs all mirrors (`pnpm sync:mirrors`) — READMEs, skill directories, `create-libretto` version
6. Validates mirror parity (`pnpm check:mirrors`)
7. Commits all changed files, pushes a `release-v*` branch, and opens a PR

The release CI workflow (`release.yml`) triggers automatically when the PR merges to `main`. It builds, runs tests, publishes to npm, and creates a GitHub release.

A version bump touches **all** of these files (not just `package.json`):
- `packages/libretto/package.json`
- `packages/libretto/skills/libretto/SKILL.md`
- `packages/libretto/skills/libretto-readonly/SKILL.md`
- `.agents/skills/libretto/SKILL.md`
- `.agents/skills/libretto-readonly/SKILL.md`
- `.claude/skills/libretto/SKILL.md`
- `.claude/skills/libretto-readonly/SKILL.md`
- `packages/create-libretto/package.json`
- `README.md` and `packages/libretto/README.md`

## Mirror System

Skill files and READMEs are mirrored across multiple locations. **Do not hand-edit the mirrored copies.** Edit source files only, then sync.

Source directories:
- `packages/libretto/skills/libretto/` — interactive Libretto skill (source of truth)
- `packages/libretto/skills/libretto-readonly/` — read-only diagnosis skill (source of truth)

Mirror targets (generated — never edit directly):
- `.agents/skills/libretto/` and `.agents/skills/libretto-readonly/`
- `.claude/skills/libretto/` and `.claude/skills/libretto-readonly/`

After any change to source skill files or READMEs:

```bash
pnpm sync:mirrors    # sync all mirrored files
pnpm check:mirrors   # validate everything is in sync
```
