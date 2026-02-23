---
description: Brainstorm ideas via omega-cursor-cli headless runner
argument-hint: '[challenge or question]'
allowed-tools: Bash, Read
---

1. Build a brainstorming prompt from the user request.
2. Run:

```bash
node .claude/skills/omega-cursor-cli/scripts/ask-cursor.mjs "PROMPT"
```

3. Return stdout to the user.
