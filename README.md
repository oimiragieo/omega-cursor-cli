# Omega Cursor CLI

Portable skill pack for running Cursor Agent CLI headless from multiple agent surfaces (Cursor, Codex/Codex-like agents, Antigravity, and VS Code tasks).

## Core idea

The shared runtime lives in `.claude/skills/omega-cursor-cli/`.

- Main script: `.claude/skills/omega-cursor-cli/scripts/ask-cursor.mjs`
- Setup check: `.claude/skills/omega-cursor-cli/scripts/verify-setup.mjs`
- No MCP required

Other folders (`.agents`, `.agent`, `.cursor`, `.vscode`) point their host agent to the shared script.

## Quick start

1. Ensure Node.js 18+ is installed.
2. Install Cursor Agent CLI if needed:

```bash
npm install -g @cursor/agent
```

3. Verify setup:

```bash
node .claude/skills/omega-cursor-cli/scripts/verify-setup.mjs
```

4. Run headless Cursor Agent:

```bash
node .claude/skills/omega-cursor-cli/scripts/ask-cursor.mjs "Summarize this repository"
```

## Script options

```bash
node .claude/skills/omega-cursor-cli/scripts/ask-cursor.mjs "PROMPT" \
  [--model MODEL] \
  [--json] \
  [--yolo] \
  [--trust] \
  [--timeout-ms 120000]
```

- `--model`: forwards to `cursor-agent --model`
- `--json`: maps to `cursor-agent --output-format json`
- `--yolo`: maps to `cursor-agent --yolo` (`--force`) — auto-approves all tool calls
- `--trust`: maps to `cursor-agent --trust` — trusts the workspace without prompting (headless only)
- `--timeout-ms`: wrapper-side timeout (exit code `124` on timeout)
- `--sandbox`: **deprecated** alias for `--yolo`

## Environment variables

| Variable                     | Default            | Description                                                                                                                        |
| ---------------------------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| `CURSOR_AGENT_CMD_PATH`      | _(auto-detected)_  | Windows only. Override the absolute path to `cursor-agent.cmd` used as a fallback when `agent` and `cursor-agent` are not on PATH. |
| `ASK_CURSOR_MAX_STDIN_BYTES` | `52428800` (50 MB) | Maximum number of bytes accepted from stdin. Prompts exceeding this limit are rejected with exit code `1`.                         |

## Direct CLI equivalent

```bash
cursor-agent --print --output-format text "PROMPT"
```

Optional additions: `--model ...`, `--output-format json`, `--force`.

## Model notes

Cursor recommends `auto` by default. You can pass explicit models with `--model`, for example:

- `claude-4.6-opus`
- `claude-4.6-sonnet`
- `composer-1.5`
- `gemini-3.1-pro`
- `gpt-5.3-codex`

For the exact models available to your account, run `cursor-agent --list-models` and check: https://cursor.com/docs/models

## Repo structure

- `.claude/`: commands + shared skill/runtime
- `.agents/`: Codex/Codex-like skill entrypoint
- `.agent/`: Antigravity entrypoint
- `.cursor/rules/`: Cursor routing rules
- `.vscode/tasks.json`: Ask/verify tasks

## License

MIT License (Non-Commercial) in `LICENSE`.
