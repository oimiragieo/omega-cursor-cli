---
description: Run cursor-agent request with yolo mode (auto-approve all) via omega-cursor-cli
argument-hint: '[prompt]'
allowed-tools: Bash, Read
---

Run:

```bash
node .claude/skills/omega-cursor-cli/scripts/ask-cursor.mjs "PROMPT" --yolo
```

This maps to `cursor-agent --yolo` (alias for `--force`). Auto-approves all tool calls.
Note: `--sandbox` still works as a deprecated alias for `--yolo`.
