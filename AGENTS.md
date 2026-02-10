---
name: agents
description: Guidelines and instructions for AI agents working on this repository, including coding standards, git workflow, and copyright requirements.
metadata:
  copyright: Copyright Daniel Grenemark 2026
  version: "0.0.1"
---

# AGENTS.md

<principles>
<focus>
Don't be an overachiever. Aim for perfection in execution rather than adding extras.
</focus>

<tools>
Use `deepwiki` MCP for project specific documentation and implementation details.
</tools>

<efficiency_files>
- `.deepwiki`: Repository for relevant DeepWiki repositories
- `.gitignore`: Keep accurate to avoid repository bloat
</efficiency_files>
</principles>

<efficiency_maintenance>
- **`.deepwiki`**: Document repositories with complex implementations or custom packages used
- **`.gitignore`**: Review and update after adding new dependencies, build artifacts, or IDE-specific files
- **Frequency**: Update these files immediately when introducing new technologies or tools, not at project end
</efficiency_maintenance>

<git_workflow>
<commits>
Agents **MUST** follow the [Conventional Commits](https://www.conventionalcommits.org/) specification for all commit messages and GitHub pull request titles.

Format:
```text
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

Common types:
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools

Example: `feat(automation): toggle light when front door is unlocked`
</commits>

<branch_protection>
- Force pushes are **BLOCKED** on protected branches. Always create new commits instead of rewriting history.
- Direct commits to `main` (the default branch) are **PROHIBITED**. All changes **MUST** go through a pull request.
</branch_protection>

<merge_strategy>
Pull requests **MUST** use squash merge only. The PR title will become the commit message, so ensure it follows the Conventional Commits format.

A **linear commit history is required**. Merge commits are not allowed. Use rebase or squash merge strategies to maintain a clean, linear history on the main branch.
</merge_strategy>
</git_workflow>

<copyright>
All new files **MUST** include a copyright header. Use the appropriate format based on file type:

**Markdown files** - Add to frontmatter metadata:
```yaml
---
name: <file-identifier>
description: <brief description of the file's purpose>
metadata:
  copyright: Copyright Daniel Grenemark 2026
  version: "0.0.1"
---
```

**TOML files** - Add as first line comment:
```toml
# Copyright Daniel Grenemark 2026
```

**Text files** - Add as first line comment:
```
# Copyright Daniel Grenemark 2026
```

**JSON files** - JSON does not support comments. Document copyright in accompanying README or skip.

**Note:** The LICENSE file at the repository root contains the full Apache 2.0 license text with copyright notice.
</copyright>
