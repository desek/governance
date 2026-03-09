---
name: agents
description: Guidelines and instructions for AI agents working on this repository, including coding standards, git workflow, and copyright requirements.
metadata:
  copyright: Copyright Daniel Grenemark 2026
  version: "0.0.1"
---

# AGENTS.md

<project_purpose>
This repository creates **reusable skills** that are distributed and installed via `npx skills add`. The `skills/` folder is the source directory for all skill implementations. Agents **MUST NOT** add skills to `.claude/` or `.junie/` directories in this repository — those are consumer-side installation targets, not source locations. All skill source files, templates, reference documentation, and supporting artifacts **MUST** reside under `skills/`.
</project_purpose>

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
- `docs/llms.txt`: Index of all documentation files under `docs/`, formatted as an [llms.txt](https://llmstxt.org/) file for LLM-friendly consumption. Use this file to quickly discover available reference documentation — including Change Requests, ADRs, Anthropic guides, and skill specifications — before searching individual files. Update it whenever files are added to or removed from `docs/`.
</efficiency_files>
</principles>

<efficiency_maintenance>
- **`.deepwiki`**: Document repositories with complex implementations or custom packages used
- **`.gitignore`**: Review and update after adding new dependencies, build artifacts, or IDE-specific files
- **`docs/llms.txt`**: Update whenever documentation files are added to or removed from `docs/`
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

<release_please>
This repository uses [Release Please](https://github.com/googleapis/release-please) to automate versioning and releases. Configuration is split across two files:

- **`release-please-config.json`**: Defines per-skill package settings (release type, component name, tag format).
- **`.release-please-manifest.json`**: Tracks the current version of each skill.

Each skill under `skills/` is configured as a separate package with `"release-type": "simple"`, which tracks version in `version.txt` and generates a `CHANGELOG.md` per skill directory.

**Key settings:**
- `"separate-pull-requests": true` — Each skill gets its own release PR so changes are released independently.
- `"include-component-in-tag": true` — Produces tags like `governance-v1.2.0` to prevent collisions between skills.
- `"include-v-in-tag": true` — Conventional `v`-prefixed semver tags.

**When modifying an existing skill:**
- Commit messages **MUST** follow Conventional Commits. Release Please uses these to determine version bumps and generate changelogs automatically.
- No manual version changes are needed — Release Please updates `version.txt` and `CHANGELOG.md` via its release PR.

**When adding a new skill** (e.g., `skills/my-new-skill`):
1. Create the skill directory with `SKILL.md` under `skills/my-new-skill/`.
2. Create `skills/my-new-skill/version.txt` with initial content `0.0.0`.
3. Add the package entry to `release-please-config.json`:
   ```json
   "skills/my-new-skill": {
     "release-type": "simple",
     "component": "my-new-skill",
     "include-component-in-tag": true,
     "include-v-in-tag": true
   }
   ```
4. Add `"skills/my-new-skill": "0.0.0"` to `.release-please-manifest.json`.
</release_please>
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

**Note:** Governance documents (CRs and ADRs) **MUST** omit the `metadata.copyright` and `metadata.version` fields. Only `name` and `description` are required in their frontmatter.

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
