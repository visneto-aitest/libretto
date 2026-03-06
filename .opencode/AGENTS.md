# OpenCode Configuration

This directory contains agent configurations for OpenCode.

## Making Changes

OpenCode (sst/opencode) is a fast-moving repository. Before modifying agent configs in `.opencode/agent/`, use the librarian to research the current syntax and conventions:

```
Ask the librarian to check sst/opencode for the correct syntax for [your change]
```

This prevents using deprecated patterns or incorrect tool/permission names.

## Libretto CLI AI Config Learnings

- Shared AI runtime configuration should live at `.libretto/config.json`.
- Keep config versioned at the top level (`version`) and AI settings under `ai`.
- Current AI config fields are `preset`, `commandPrefix`, and `updatedAt`.
- Use `CURRENT_CONFIG_VERSION` for the schema version constant in config helpers.
- Prefer reusing existing workspace-scoped Vitest fixtures from `packages/libretto-cli/src/test-fixtures.ts` instead of ad hoc temp-dir setup in individual tests.
