---
name: readme
description: Overview of the Governance project, providing reusable agent skills for project governance including Architecture Decision Records (ADRs), Change Requests (CRs), and checkpoint commits.
metadata:
  copyright: Copyright Daniel Grenemark 2026
  version: "0.0.1"
---

# governance

Reusable agent skills for project governance, including Architecture Decision Records (ADRs), Change Requests (CRs), and checkpoint commits.

> **AI Disclaimer**: This project uses AI and may produce inaccurate results. Verify all critical outputs.

### Dogfooding: We Use What We Build

This repository uses its own governance skill to manage changes and the results speak for themselves. Browse our [Change Requests](docs/cr) to see real examples of how AI agents document and track modifications to this project.

What you'll find there:
- **Structured decision-making**: Each CR captures the motivation, current state, proposed changes, and implementation plan in a consistent format
- **Clear traceability**: From initial request through implementation, every change is documented with stakeholders, priorities, and target versions
- **Living documentation**: These aren't theoretical templates—they're actual records of how this skill evolved

When you install these skills, your AI coding agent gains the same capabilities: creating well-structured Architecture Decision Records and Change Requests that keep your project's history clear and your team aligned, plus checkpoint commits to preserve work-in-progress state.

### Available Skills

| Skill | Description |
|-------|-------------|
| [governance](skills/governance/SKILL.md) | Creates ADRs for architectural decisions and CRs for requirement changes |
| [checkpoint-commit](skills/checkpoint-commit/SKILL.md) | Slash command that creates governance checkpoint commits linked to Change Requests |

### Checkpoint Hooks (Claude Code)

Automate checkpoint creation using Claude Code prompt-based hooks. When Claude finishes responding, the hook evaluates whether uncommitted changes exist and triggers `/checkpoint-commit` automatically. Copy the hook configuration to your `.claude/settings.json`:

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "prompt",
            "prompt": "You are evaluating whether Claude should create a checkpoint before stopping. Context: $ARGUMENTS\n\nCheck if:\n1. There are uncommitted changes in the repository\n2. The stop_hook_active field is false (to prevent infinite loops)\n\nIf stop_hook_active is true, respond with {\"ok\": true}.\nIf there are uncommitted changes and stop_hook_active is false, respond with {\"ok\": false, \"reason\": \"/checkpoint-commit\"}.\nIf there are no uncommitted changes, respond with {\"ok\": true}.",
            "timeout": 30
          }
        ]
      }
    ]
  }
}
```

See [checkpoint-hooks.md](skills/governance/reference/checkpoint-hooks.md) for complete documentation on prompt-based hooks and best practices.

### Installation

Install skills using the [skills CLI](https://github.com/vercel-labs/skills):

```bash
# Install all skills from this repository
npx skills add desek/governance

# List available skills without installing
npx skills add desek/governance --list

# Install to specific agents
npx skills add desek/governance -a claude-code -a opencode

# Install globally (available across all projects)
npx skills add desek/governance -g
```

#### Installation Options

| Option | Description |
|--------|-------------|
| `-g, --global` | Install to user directory instead of project |
| `-a, --agent <agents...>` | Target specific agents (e.g., `claude-code`, `codex`) |
| `-s, --skill <skills...>` | Install specific skills by name |
| `-l, --list` | List available skills without installing |
| `-y, --yes` | Skip all confirmation prompts |
| `--all` | Install all skills to all agents without prompts |

#### Supported Agents

Skills can be installed to many coding agents including Claude Code, Codex, Cursor, OpenCode, GitHub Copilot, and more. See the [full list of supported agents](https://github.com/vercel-labs/skills#supported-agents).

### Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to report issues, submit pull requests, and follow project conventions.

### License

This project is licensed under the Apache License, Version 2.0. See the [LICENSE](LICENSE) file for details.
