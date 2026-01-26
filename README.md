# governance

Reusable agent skills for project governance, including Architecture Decision Records (ADRs) and Change Requests (CRs).

> **AI Disclaimer**: This project uses AI and may produce inaccurate results. Verify all critical outputs.

### Available Skills

| Skill | Description |
|-------|-------------|
| [governance](skills/governance/SKILL.md) | Creates ADRs for architectural decisions and CRs for requirement changes |

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
