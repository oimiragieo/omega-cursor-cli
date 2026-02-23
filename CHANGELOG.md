# Changelog

## [Unreleased]

- Fix: rename `--sandbox` wrapper flag to `--yolo` (matching `cursor-agent --yolo`); `--sandbox` kept as a deprecated alias with a warning. `--force` was the wrong mapping — `--yolo` is the correct alias per the cursor-agent help.
- Fix: `--sandbox` in cursor-agent takes a value (`enabled`/`disabled`) and is unrelated to auto-approval; using `--yolo` eliminates the naming collision.
- Feat: add `--trust` flag mapping to `cursor-agent --trust` (trust workspace without prompting, headless-only).
- Fix: add `escapeCmdExeArg` to escape `%` in prompts passed through `cmd.exe` on Windows, preventing environment variable expansion.
- Fix: integration tests now stub both `agent` and `cursor-agent` shims so the first fallback candidate resolves immediately; `spawnSync` timeout raised to 30 s.
- Fix: stdin byte-limit calculation now uses 1-byte newlines consistently (matching `lines.join('\\n')`), removing the Windows-only 2-byte miscalculation.
- Fix: `process.exit(1)` in the stdin `close` handler replaced with `process.exitCode = 1` so buffered stderr is flushed before process termination.
- Fix: `verify-setup.mjs` now checks `agent --version` first, matching the fallback order in `getExecutables()`.
- Fix: CI workflow now runs `changelog:check`, consistent with `test:ci` in `package.json`.
- Fix: removed dead `format-output.mjs` (exported function was never imported).
- Docs: document `CURSOR_AGENT_CMD_PATH` and `ASK_CURSOR_MAX_STDIN_BYTES` environment variables in README.

## 2.0.0 — Cursor headless skill (no MCP)

- Portable `.claude` skill that runs Cursor Agent CLI in headless mode via scripts.
- Scripts: `ask-cursor.mjs` and `verify-setup.mjs`.
- Commands: `/analyze`, `/sandbox`, `/brainstorm`, `/omega-cursor`, `/omega-cursor-setup`.
- References: installation, auth, headless, copy-and-run, cursor, codex-like agents, antigravity, vscode, copilot-cli.
