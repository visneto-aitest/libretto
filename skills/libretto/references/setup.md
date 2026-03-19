# Setup

Use this reference before first use in a workspace, or before relying on `snapshot` analysis to understand a page.

## When to Use This

- Libretto has not been initialized in the current workspace.
- You want to use `snapshot --objective ... --context ...`.
- The workspace needs an AI provider configured for page analysis.

## Workflow

- Run `npx libretto init` for first-time workspace setup.
- Configure an AI provider with `npx libretto ai configure openai|anthropic|gemini|vertex`.
- If credentials are already available, the provider configuration step is usually enough.
- `npx libretto ai configure ...` writes `.libretto/config.json` in the workspace.
- After setup, open the target page and use `snapshot` with both `--objective` and `--context`.

## Config File

Libretto reads workspace config from `.libretto/config.json`.

- The file is usually created or updated by `npx libretto ai configure ...`.
- API credentials still come from your shell environment or `.env`. The config file stores the selected model, not the secret itself.
- `viewport` is an optional top-level setting and is used by `open` and `run` when you do not pass `--viewport`.
- Viewport precedence is: CLI `--viewport` flag, then `.libretto/config.json`, then the default `1366x768`.

Example:

```json
{
  "version": 1,
  "ai": {
    "model": "openai/gpt-5.4",
    "updatedAt": "2026-01-01T00:00:00.000Z"
  },
  "viewport": {
    "width": 1280,
    "height": 800
  }
}
```

## Commands

```bash
npx libretto init
npx libretto ai configure openai
npx libretto ai configure anthropic
npx libretto ai configure gemini
npx libretto ai configure vertex
npx libretto open https://app.example.com --viewport 1440x900
npx libretto run ./integration.ts main --viewport 1440x900
npx libretto snapshot \
  --objective "Find the sign-in form and submit button" \
  --context "I opened the login page and need the form fields and the submit action."
```

## Notes

- Do not rely on raw screenshots from `exec` when page understanding matters. Use `snapshot`.
- If snapshot analysis is not configured yet, ask the user to complete setup before depending on it for page interpretation.
- If you want a persistent default viewport for the workspace, add `viewport` to `.libretto/config.json` instead of repeating `--viewport` on every command.
