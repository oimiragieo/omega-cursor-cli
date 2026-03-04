# Omega Cursor CLI

> Portable headless skill for running Cursor Agent CLI from Claude Code, Codex, Antigravity, and VS Code — no MCP server required.

A zero-dependency Node.js wrapper that lets any agent platform invoke **Cursor Agent CLI** in non-interactive mode. Copy one folder into your project, run one verification step, and every supported agent surface can call Cursor Agent headlessly for analysis, brainstorming, and automated agentic tasks.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [CLI Reference](#cli-reference)
- [Configuration](#configuration)
- [Integration Guides](#integration-guides)
- [Deploying to Another Project](#deploying-to-another-project)
- [Usage Examples](#usage-examples)
- [Slash Commands](#slash-commands)
- [Development](#development)
- [Repository Structure](#repository-structure)
- [Resources](#resources)
- [License](#license)

---

## Features

- **Headless execution** — runs `cursor-agent --print --output-format text "…"` non-interactively
- **Cross-platform** — Windows (`cmd.exe` wrapper with `%`-escaping) and Unix/macOS (direct spawn) handled automatically
- **Automatic fallback** — tries `agent`, then `cursor-agent`, then platform-specific paths, then `npx -y @cursor/agent`
- **Multi-model** — supports Claude, GPT, Gemini, and Composer models via `--model`
- **Yolo mode** — `--yolo` auto-approves all tool calls for fully non-interactive pipelines
- **Workspace trust** — `--trust` suppresses workspace permission prompts in headless environments
- **JSON output** — structured output for automation pipelines
- **Timeout control** — wrapper-side `--timeout-ms` with exit code `124` on expiry
- **Stdin support** — pipe large prompts from files or other commands (50 MB default limit)
- **Zero runtime dependencies** — pure Node.js stdlib; no `npm install` needed to run
- **Multi-surface** — same script shared by Claude Code, Cursor, Codex, Antigravity, and VS Code

---

## Prerequisites

| Requirement      | Minimum version | Install                          |
| ---------------- | --------------- | -------------------------------- |
| Node.js          | 18+             | [nodejs.org](https://nodejs.org) |
| Cursor Agent CLI | latest          | `npm install -g @cursor/agent`   |

Cursor Agent CLI requires a one-time sign-in. Run `cursor-agent login` in a terminal and complete the authentication flow; credentials are cached and reused by all subsequent headless calls.

---

## Installation

### 1. Install Cursor Agent CLI

```bash
npm install -g @cursor/agent
```

Or use without a global install — the wrapper automatically falls back to `npx -y @cursor/agent`.

### 2. One-time authentication

```bash
cursor-agent login
# Complete the sign-in prompt. This only needs to happen once.
```

### 3. Copy the skill into your project

```bash
# From the omega-cursor-cli repo root:
cp -r .claude /path/to/your-project/
```

The `.claude` folder is the **only required piece**. All other folders (`.agents`, `.agent`, `.cursor`, `.vscode`) are optional integration shims for specific platforms.

### 4. Verify the setup

```bash
cd /path/to/your-project
node .claude/skills/omega-cursor-cli/scripts/verify-setup.mjs
```

Expected output when everything is ready:

```
OK  Node: v20.11.1
OK  Cursor Agent CLI: found
Headless mode ready. Use scripts/ask-cursor.mjs to run Cursor Agent.
```

---

## Quick Start

From your **project root** (the directory containing `.claude`):

```bash
# Ask Cursor Agent a question
node .claude/skills/omega-cursor-cli/scripts/ask-cursor.mjs "Summarize this repository in three bullet points"

# Review a file
node .claude/skills/omega-cursor-cli/scripts/ask-cursor.mjs "Review src/index.js for potential bugs"

# Auto-approve all tool calls (required for fully non-interactive use)
node .claude/skills/omega-cursor-cli/scripts/ask-cursor.mjs "Refactor this component" --yolo

# Trust the workspace without prompting
node .claude/skills/omega-cursor-cli/scripts/ask-cursor.mjs "Run the test suite" --yolo --trust
```

---

## CLI Reference

### Syntax

```
node .claude/skills/omega-cursor-cli/scripts/ask-cursor.mjs "PROMPT" [OPTIONS]
```

The `PROMPT` argument is required unless you are piping input from stdin.

### Options

| Option           | Short | Type                | Default    | Description                                                                                        |
| ---------------- | ----- | ------------------- | ---------- | -------------------------------------------------------------------------------------------------- |
| `PROMPT`         | —     | string (positional) | required   | The question or task for Cursor Agent.                                                             |
| `--model`        | `-m`  | string              | `auto`     | Model to use. Forwarded to `cursor-agent --model`. See [Model notes](#model-notes).                |
| `--json`         | —     | boolean             | `false`    | Map to `--output-format json` for structured output.                                               |
| `--yolo`         | —     | boolean             | `false`    | Auto-approve all tool calls (`cursor-agent --yolo`). Required for fully non-interactive pipelines. |
| `--trust`        | —     | boolean             | `false`    | Trust the workspace without prompting (`cursor-agent --trust`). Intended for headless-only use.    |
| `--approve-mcps` | —     | boolean             | `false`    | Automatically approve MCP server usage (`cursor-agent --approve-mcps`).                            |
| `--timeout-ms`   | —     | integer             | `0` (none) | Abort after N milliseconds. Exit code `124` on timeout. Must be a positive integer.                |
| `--help`         | `-h`  | boolean             | `false`    | Print usage and exit.                                                                              |
| `--sandbox`      | —     | boolean             | —          | **Deprecated.** Alias for `--yolo`. Will be removed in a future version.                           |
| `--`             | —     | sentinel            | —          | Everything after `--` is treated as part of the prompt. Useful when the prompt starts with `-`.    |

### Model notes

Cursor recommends `auto` by default, which selects the best available model for your account. Explicit model IDs can be passed with `--model`:

| Model ID            | Description                 |
| ------------------- | --------------------------- |
| `claude-4.6-opus`   | Anthropic Claude Opus 4.6   |
| `claude-4.6-sonnet` | Anthropic Claude Sonnet 4.6 |
| `composer-1.5`      | Cursor Composer 1.5         |
| `gemini-3.1-pro`    | Google Gemini Pro           |
| `gpt-5.3-codex`     | OpenAI GPT Codex            |

To list all models available to your account:

```bash
cursor-agent --list-models
```

See [cursor.com/docs/models](https://cursor.com/docs/models) for the current full list.

### Input methods

```bash
# Positional argument (most common)
node ask-cursor.mjs "Your prompt here"

# Stdin pipe
echo "Your prompt" | node ask-cursor.mjs

# Pipe a file for review
cat src/main.js | node ask-cursor.mjs "Review this code"

# Prompt containing flag-like text
node ask-cursor.mjs -- --this-is-not-a-flag but-it-is-the-prompt
```

### Direct CLI equivalent

The wrapper runs the following under the hood:

```bash
cursor-agent --print --output-format text "PROMPT"
# With optional additions:
#   --model claude-4.6-opus
#   --output-format json
#   --yolo
#   --trust
```

### Exit codes

| Code  | Meaning                                                 |
| ----- | ------------------------------------------------------- |
| `0`   | Success                                                 |
| `1`   | Error (CLI not found, invalid arguments, parse failure) |
| `124` | Timeout (`--timeout-ms` exceeded)                       |

---

## Configuration

### Environment variables

| Variable                     | Default            | Description                                                                                                                                                                                           |
| ---------------------------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ASK_CURSOR_MAX_STDIN_BYTES` | `52428800` (50 MB) | Maximum bytes accepted from stdin. Prompts exceeding this limit are rejected with exit code `1`.                                                                                                      |
| `CURSOR_AGENT_CMD_PATH`      | _(auto-detected)_  | **Windows only.** Absolute path to `cursor-agent.cmd`. Overrides the automatic fallback search, which checks `agent`, `cursor-agent`, `%LOCALAPPDATA%\cursor-agent\cursor-agent.cmd`, and then `npx`. |

#### Windows fallback resolution order

On Windows, the wrapper searches for the Cursor Agent binary in this order:

1. `agent` (on PATH)
2. `cursor-agent` (on PATH)
3. `CURSOR_AGENT_CMD_PATH` environment variable (if set)
4. `%LOCALAPPDATA%\cursor-agent\cursor-agent.cmd`
5. `%USERPROFILE%\AppData\Local\cursor-agent\cursor-agent.cmd`
6. `npx -y @cursor/agent`

To override step 3 explicitly:

```bash
# Windows PowerShell
$env:CURSOR_AGENT_CMD_PATH="C:\Users\you\AppData\Local\cursor-agent\cursor-agent.cmd"
node ask-cursor.mjs "Your prompt"

# Windows cmd.exe
set CURSOR_AGENT_CMD_PATH=C:\Users\you\AppData\Local\cursor-agent\cursor-agent.cmd
node ask-cursor.mjs "Your prompt"
```

---

## Integration Guides

### Claude Code

Claude Code automatically discovers `.claude/skills/`. Use the built-in slash commands:

```
/analyze    Review this README for completeness
/brainstorm 5 ideas for improving developer onboarding
/sandbox    Refactor this component (yolo mode)
/omega-cursor-setup
```

Or invoke the script directly from a Claude Code task prompt:

```bash
node .claude/skills/omega-cursor-cli/scripts/ask-cursor.mjs "YOUR PROMPT" --yolo
```

### Cursor IDE

Cursor reads `.claude/skills/` automatically. The `.cursor/rules/` files additionally route natural-language requests through the headless script.

1. Copy `.claude/` and `.cursor/` into your project.
2. In the Cursor agent, say: **"ask Cursor Agent to review this file"** — Cursor routes the request to `ask-cursor.mjs`.
3. For agentic tasks, include `--yolo` so Cursor Agent can take actions without prompting.

### Codex CLI (OpenAI)

Codex discovers skills under `.agents/skills/`.

1. Copy `.claude/` and `.agents/` into your project.
2. Codex automatically routes "ask Cursor" tasks through the registered skill.

### GitHub Copilot CLI

Use Copilot CLI headlessly and select a Cursor-compatible model via `COPILOT_MODEL`:

```bash
copilot -p "Review this function for bugs"
```

See [references/copilot-cli.md](.claude/skills/omega-cursor-cli/references/copilot-cli.md) for the full Copilot CLI reference.

### Antigravity IDE

Antigravity discovers skills under `.agent/skills/`.

1. Copy `.claude/` and `.agent/` into your project.
2. Use natural language in the Antigravity agent: **"use Cursor Agent to analyze the auth module"** — Antigravity runs `ask-cursor.mjs`.

### VS Code

Two tasks are included in `.vscode/tasks.json`:

1. Copy `.claude/` and `.vscode/` into your project.
2. Open the Command Palette → **Tasks: Run Task**.
3. Select **Ask Cursor** — enter a prompt when prompted. Output appears in the integrated terminal.
4. Select **Omega Cursor: Verify setup** to check Node and CLI availability.

---

## Deploying to Another Project

### Minimum (required for all platforms)

```bash
cp -r omega-cursor-cli/.claude /path/to/target-project/
```

This alone is sufficient for **Claude Code**, **Cursor**, and **GitHub Copilot CLI**.

### Full suite (optional, platform-specific)

```bash
# Codex CLI skill host
cp -r omega-cursor-cli/.agents /path/to/target-project/

# Antigravity IDE
cp -r omega-cursor-cli/.agent /path/to/target-project/

# VS Code tasks
cp -r omega-cursor-cli/.vscode /path/to/target-project/
```

After copying, run the verification script from the target project root:

```bash
cd /path/to/target-project
node .claude/skills/omega-cursor-cli/scripts/verify-setup.mjs
```

---

## Usage Examples

### Analysis and code review

```bash
# Summarize a project
node .claude/skills/omega-cursor-cli/scripts/ask-cursor.mjs \
  "List the main purpose of this project and its top-level folders in 3 short bullet points."

# Review a specific file
node .claude/skills/omega-cursor-cli/scripts/ask-cursor.mjs \
  "Review src/auth.js for security vulnerabilities and suggest fixes."

# Detailed architectural review
node .claude/skills/omega-cursor-cli/scripts/ask-cursor.mjs \
  "Analyze the component hierarchy in src/ and suggest improvements" \
  --model claude-4.6-opus
```

### Brainstorming

```bash
# General brainstorm
node .claude/skills/omega-cursor-cli/scripts/ask-cursor.mjs \
  "Brainstorm 5 ways to improve a CLI tool's first-run experience. One sentence each."

# Domain-specific
node .claude/skills/omega-cursor-cli/scripts/ask-cursor.mjs \
  "Generate 3 API design patterns for high-throughput event ingestion."
```

### Agentic tasks with yolo mode

`--yolo` auto-approves every tool call Cursor Agent makes. Use this for CI/CD pipelines and automated workflows where manual confirmation is not possible.

```bash
# Refactor without prompting for approval
node .claude/skills/omega-cursor-cli/scripts/ask-cursor.mjs \
  "Rename all snake_case variables to camelCase in src/utils.js" \
  --yolo

# Run tests and fix failures
node .claude/skills/omega-cursor-cli/scripts/ask-cursor.mjs \
  "Run the test suite and fix any failing tests" \
  --yolo --trust

# Full pipeline task
node .claude/skills/omega-cursor-cli/scripts/ask-cursor.mjs \
  "Apply the ESLint fixes across the entire src/ directory" \
  --yolo --timeout-ms 120000
```

### Model selection

```bash
# Use Claude Opus for complex analysis
node .claude/skills/omega-cursor-cli/scripts/ask-cursor.mjs \
  "Deep architectural review of this codebase" \
  --model claude-4.6-opus

# Use Claude Sonnet for balanced speed/quality
node .claude/skills/omega-cursor-cli/scripts/ask-cursor.mjs \
  "Summarize this PR diff" \
  --model claude-4.6-sonnet

# Use GPT for Codex-style tasks
node .claude/skills/omega-cursor-cli/scripts/ask-cursor.mjs \
  "Generate a SQL migration script" \
  --model gpt-5.3-codex

# Let Cursor pick automatically (default)
node .claude/skills/omega-cursor-cli/scripts/ask-cursor.mjs \
  "Review this component"
```

### JSON output for automation

```bash
# Structured output
node .claude/skills/omega-cursor-cli/scripts/ask-cursor.mjs \
  "List all exported functions in this module" \
  --json

# Parse with jq
node .claude/skills/omega-cursor-cli/scripts/ask-cursor.mjs \
  "Summarize in one sentence" \
  --json | jq -r '.'
```

### Stdin input

```bash
# Pipe a file for review
cat README.md | node .claude/skills/omega-cursor-cli/scripts/ask-cursor.mjs \
  "What sections are missing from this README?"

# Generate a commit message from a diff
git diff --cached | node .claude/skills/omega-cursor-cli/scripts/ask-cursor.mjs \
  "Write a concise conventional commit message for these changes."
```

### Timeout for CI/CD

```bash
# Abort after 2 minutes
node .claude/skills/omega-cursor-cli/scripts/ask-cursor.mjs \
  "Run the full test suite and report failures" \
  --yolo \
  --timeout-ms 120000

# Check exit code
node .claude/skills/omega-cursor-cli/scripts/ask-cursor.mjs "..." --timeout-ms 30000
if [ $? -eq 124 ]; then echo "Cursor Agent timed out"; fi
```

### GitHub Actions CI/CD integration

```yaml
- name: Install Cursor Agent CLI
  run: npm install -g @cursor/agent

- name: Authenticate
  run: cursor-agent login
  env:
    CURSOR_TOKEN: ${{ secrets.CURSOR_TOKEN }}

- name: Verify setup
  run: node .claude/skills/omega-cursor-cli/scripts/verify-setup.mjs

- name: Automated code review
  run: |
    node .claude/skills/omega-cursor-cli/scripts/ask-cursor.mjs \
      "Review the changes in this PR for security issues" \
      --model claude-4.6-sonnet \
      --yolo \
      --timeout-ms 300000
```

---

## Slash Commands

When using **Claude Code**, the following slash commands are available:

| Command                                          | Description                                                                       |
| ------------------------------------------------ | --------------------------------------------------------------------------------- |
| `/analyze [prompt or @file …]`                   | Analyze files or answer questions with Cursor Agent. Supports `@file` references. |
| `/brainstorm [challenge] [methodology] [domain]` | Generate ideas. Optionally specify a method (SCAMPER, design thinking) or domain. |
| `/sandbox [prompt or @file …]`                   | Run Cursor Agent with `--yolo` (auto-approve all tool calls).                     |
| `/omega-cursor [request]`                        | Flexible entry point: routes to analysis or agentic task as appropriate.          |
| `/omega-cursor-setup`                            | Verify Node.js and Cursor Agent CLI are installed and authenticated.              |

---

## Development

### Running tests

```bash
npm test
```

Tests are written for the Node.js native test runner (`node:test`). Coverage includes:

- **Unit tests** (`tests/ask-cursor.test.mjs`) — argument parsing (`parseCliArgs`), command construction (`buildCursorArgs`), executable resolution (`getExecutables`), prompt validation (`assertNonEmptyPrompt`), platform-specific behavior, deprecated `--sandbox` alias warning.
- **Integration tests** (`tests/ask-cursor.integration.test.mjs`) — end-to-end spawning with a stub `cursor-agent`, timeout handling (exit code `124`), stdin forwarding, JSON output, fallback chain behavior.

### CI gate

```bash
npm run test:ci
# Runs: tests + eslint + prettier check + changelog format check
```

### Linting and formatting

```bash
npm run lint:fix      # ESLint with auto-fix
npm run format        # Prettier (in-place)
npm run format:check  # Prettier (check only, used in CI)
```

### Changelog policy

Every pull request must add at least one entry under `## [Unreleased]` in `CHANGELOG.md`. CI enforces this:

```bash
npm run changelog:check
```

---

## Repository Structure

```
omega-cursor-cli/
├── .claude/                                  # Required — shared skill runtime
│   ├── commands/                             # Claude Code slash commands
│   │   ├── analyze.md
│   │   ├── brainstorm.md
│   │   ├── sandbox.md
│   │   ├── omega-cursor.md
│   │   └── omega-cursor-setup.md
│   └── skills/omega-cursor-cli/
│       ├── SKILL.md                          # Skill definition and trigger rules
│       ├── scripts/
│       │   ├── ask-cursor.mjs                # Main headless wrapper
│       │   ├── parse-args.mjs                # Pure CLI argument parser (exported)
│       │   └── verify-setup.mjs              # Node + CLI pre-flight check
│       └── references/                       # Reference documentation
│           ├── headless.md                   # Full headless CLI guide
│           ├── installation.md               # Node + Cursor Agent CLI setup
│           ├── auth.md                       # Authentication troubleshooting
│           ├── copy-and-run.md               # Portability guide
│           ├── cursor.md                     # Cursor IDE integration
│           ├── cursor-agent.md               # Cursor Agent CLI deep dive
│           ├── antigravity.md                # Antigravity IDE integration
│           ├── copilot-cli.md                # GitHub Copilot CLI guide
│           └── vscode.md                     # VS Code tasks guide
├── .agents/skills/omega-cursor-cli/          # Codex CLI skill entrypoint
├── .agent/skills/omega-cursor-cli/           # Antigravity IDE skill entrypoint
├── .cursor/rules/                            # Cursor routing rules
│   ├── omega-cursor-cli.mdc
│   └── omega-cursor-tools.mdc
├── .vscode/tasks.json                        # VS Code Ask/Verify tasks
├── tests/
│   ├── ask-cursor.test.mjs                   # Unit tests
│   └── ask-cursor.integration.test.mjs       # Integration tests
├── scripts/
│   └── check-changelog.mjs                   # CI changelog validator
├── package.json
├── CHANGELOG.md
├── LICENSE
└── README.md
```

---

## Resources

- [Cursor — Agent Skills](https://cursor.com/docs/context/skills)
- [Cursor — Models](https://cursor.com/docs/models)
- [Claude Code — Extend Claude with skills](https://code.claude.com/docs/en/skills)
- [GitHub Copilot — About Agent Skills](https://docs.github.com/en/copilot/concepts/agents/about-agent-skills)
- [VS Code — Use Agent Skills](https://code.visualstudio.com/docs/copilot/customization/agent-skills)
- [Codex — Agent Skills](https://developers.openai.com/codex/skills/)

---

## License

[MIT License (Non-Commercial)](LICENSE). Commercial use requires prior written permission from the copyright holder.

**Disclaimer:** Unofficial, third-party tool. Not affiliated with, endorsed by, or sponsored by Cursor or Anysphere.
