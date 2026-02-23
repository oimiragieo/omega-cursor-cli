---
description: Verify omega-cursor-cli setup (Node + Cursor Agent CLI)
allowed-tools: Bash, Read
---

Run from project root:

```bash
node .claude/skills/omega-cursor-cli/scripts/verify-setup.mjs
```

If setup reports missing Cursor Agent CLI, install with:

```bash
npm install -g @cursor/agent
```

If authentication is needed, run `cursor-agent login`.
