---
description: Route a request through omega-cursor-cli headless cursor-agent runner
argument-hint: '[request]'
allowed-tools: Bash, Read
---

Use this command as a generic entrypoint for analysis or brainstorming.

```bash
node .claude/skills/omega-cursor-cli/scripts/ask-cursor.mjs "PROMPT"
```

Optional flags: `--model MODEL`, `--json`, `--yolo`, `--trust`, `--timeout-ms N`.
