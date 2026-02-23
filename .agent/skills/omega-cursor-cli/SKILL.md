---
name: omega-cursor-cli
description: Use when Antigravity should run Cursor Agent CLI headless for analysis or brainstorming tasks.
---

# Omega Cursor CLI (Antigravity entry)

Run from project root:

```bash
node .claude/skills/omega-cursor-cli/scripts/ask-cursor.mjs "USER_PROMPT"
```

Use `--model`, `--json`, `--yolo`, `--trust`, and `--timeout-ms` as needed.
If setup fails, run:

```bash
node .claude/skills/omega-cursor-cli/scripts/verify-setup.mjs
```
