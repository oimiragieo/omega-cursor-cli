---
name: omega-cursor-cli
description: Use when the user asks to run Cursor Agent CLI headless from an agent workflow (analysis, brainstorming, second opinion, scripted CLI output). Trigger on requests like "ask cursor", "run cursor headless", "analyze with cursor", or "brainstorm with cursor".
---

# Omega Cursor CLI

Use the shared headless wrapper to run Cursor Agent from this project without MCP.

## Run

From project root:

```bash
node .claude/skills/omega-cursor-cli/scripts/ask-cursor.mjs "USER_PROMPT"
```

Supported options:

- `--model MODEL`
- `--json` (maps to `cursor-agent --output-format json`)
- `--yolo` (maps to `cursor-agent --yolo` / `--force`, auto-approves all tool calls)
- `--trust` (maps to `cursor-agent --trust`, trusts workspace without prompting)
- `--timeout-ms N`

## Setup and troubleshooting

1. Run:

```bash
node .claude/skills/omega-cursor-cli/scripts/verify-setup.mjs
```

2. If Cursor Agent is missing, install `@cursor/agent` globally or use `npx -y @cursor/agent`.
3. If auth is required, run `cursor-agent login` once.

See references:

- `references/headless.md`
- `references/installation.md`
- `references/auth.md`
- `references/copy-and-run.md`
