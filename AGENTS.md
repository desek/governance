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

<requirements>
<rfc2119>
Only use **MUST** keywords to define unambiguous requirements.
</rfc2119>

<gherkin>
Only specify acceptance criteria according to the Given-When-Then formula.
</gherkin>
</requirements>

<governance>
<adr>
An architecture decision record (ADR) is a document that captures an important architectural decision made along with its context and consequences.

All architectural decisions **MUST** be logged in the folder `docs/adr` following the template @docs/adr/TEMPLATE.md

Create an ADR when making decisions about:
- Technology stack selection (frameworks, libraries, platforms)
- System architecture patterns (microservices, monolith, event-driven)
- Data storage and management strategies
- Integration patterns and external service dependencies
- Security architecture and authentication approaches
- Infrastructure and deployment architecture
- Performance and scalability strategies
- Development tools and workflow decisions

Lifecycle:
1. **Proposed**: ADR is drafted and awaiting review
2. **Accepted**: Decision has been approved and will be implemented
3. **Rejected**: Alternative approach was chosen, reasoning documented
4. **Deprecated**: Decision is superseded by a newer ADR
5. **Superseded**: Replaced by ADR [number], with reference to new decision

Best Practices:
- **One Decision Per ADR**: Keep each ADR focused on a single architectural decision
- **Immutable Records**: Never delete or modify accepted ADRs; create new ones to supersede them
- **Clear Context**: Document the problem, constraints, and forces driving the decision
- **Consider Alternatives**: List at least 2-3 alternatives considered and why they were not chosen
- **Consequences**: Document both positive and negative outcomes of the decision
- **Date and Author**: Always include decision date and author(s)
- **Link Related ADRs**: Reference related or dependent architectural decisions
</adr>

<change_request>
A change request (CR) is a document that captures changes to project requirements, features, or scope along with their justification, impact, and implementation approach.

All requirement changes **MUST** be documented in the folder `docs/cr` following the template @docs/cr/TEMPLATE.md

Create a CR when:
- Adding new features or functionality not in the original requirements
- Modifying existing feature behavior or user workflows
- Removing or deprecating functionality
- Making significant changes to non-functional requirements (performance, security, scalability)
- Changing project scope, timeline, or success criteria
- Responding to user feedback that requires requirement adjustments

Lifecycle:
1. **Proposed**: CR is created and awaiting review
2. **Approved**: Stakeholders have approved the change
3. **Implemented**: Change has been developed and merged
4. **Rejected**: Change was declined with reasoning documented
5. **On-Hold**: Change is postponed for future consideration
6. **Cancelled**: Change is no longer needed or relevant
7. **Obsolete**: Change is outdated due to external factors or superseded requirements
</change_request>

<efficiency_maintenance>
- **`.deepwiki`**: Document repositories with complex implementations or custom packages used
- **`.gitignore`**: Review and update after adding new dependencies, build artifacts, or IDE-specific files
- **Frequency**: Update these files immediately when introducing new technologies or tools, not at project end
</efficiency_maintenance>
</governance>

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
