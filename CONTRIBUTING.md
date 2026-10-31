# Contributing

Project decisions live in `frontend/docs/decisions.md` (D86 for this plugin), priorities in `frontend/ROADMAP.md`.

## Formatting and checks

- `pnpm format` formats the repository; `pnpm check` runs the format check, the ASCII hyphen check and the tests. CI runs `pnpm check`.
- `pnpm validate:claude` runs `claude plugin validate --strict` on the marketplace and the plugin. It needs Claude Code, so CI does not run it: run it before each release.
- Never write a token into a file, a test or an example.

## Editing rules

`plugins/draftr/skills/design/references/editing-rules.md` is generated from `backend/src/mcp/tools/mcp.instructions.ts`, because Claude Code cuts server instructions at 4,096 characters. After changing the instructions, run `pnpm sync:rules` with `backend` next to this repository. `pnpm check` fails while they differ; without `backend`, as in CI, that test is skipped.

## Testing against the sandbox

Copy the repository, point `url` in both MCP files at `http://127.0.0.1:3002/mcp`, then add the copy as a local marketplace in each client and install the plugin:

- Claude Code: pipe `{"token":"..."}` to `claude plugin configure draftr@draftr --values-stdin`.
- Codex: set `DRAFTR_TOKEN`. `codex exec` cancels `apply_commands`, which the server marks as destructive, because it cannot ask for approval; test edits in an interactive session.

Take the token from the ignored `backend/.local/agent-sandbox.json` and do not print it.

## Releases

Raise `version` in both manifests and `package.json` together: clients keep the old copy while the version stands still. The name `draftr` is permanent, since a rename breaks installed copies.
