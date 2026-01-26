---
name: governance
description: Creates Architecture Decision Records (ADRs) and Change Requests (CRs) for project governance. Use when making architectural decisions, documenting technology choices, or requesting changes to project requirements, features, or scope.
metadata:
  author: desek
  version: "1.0"
---

# Governance Documentation

Creates and manages governance documents for software projects: Architecture Decision Records (ADRs) for architectural decisions and Change Requests (CRs) for requirement changes.

## When to Create Documents

### Architecture Decision Records (ADRs)

Create an ADR when making decisions about:
- Technology stack selection (frameworks, libraries, platforms)
- System architecture patterns (microservices, monolith, event-driven)
- Data storage and management strategies
- Integration patterns and external service dependencies
- Security architecture and authentication approaches
- Infrastructure and deployment architecture
- Performance and scalability strategies
- Development tools and workflow decisions

### Change Requests (CRs)

Create a CR when:
- Adding new features or functionality not in the original requirements
- Modifying existing feature behavior or user workflows
- Removing or deprecating functionality
- Making significant changes to non-functional requirements (performance, security, scalability)
- Changing project scope, timeline, or success criteria
- Responding to user feedback that requires requirement adjustments

## Creating an ADR

1. Read the ADR template: [templates/ADR.md](templates/ADR.md)
2. Create a new file in the project's `docs/adr/` folder
3. Name the file using the pattern: `ADR-NNNN-{short-title}.md` (e.g., `ADR-0001-use-postgresql.md`)
4. Fill in all required sections from the template
5. Set initial status to `proposed`

### ADR Lifecycle

| Status | Description |
|--------|-------------|
| **Proposed** | ADR is drafted and awaiting review |
| **Accepted** | Decision has been approved and will be implemented |
| **Rejected** | Alternative approach was chosen, reasoning documented |
| **Deprecated** | Decision is superseded by a newer ADR |
| **Superseded** | Replaced by another ADR, with reference to new decision |

### ADR Best Practices

- **One Decision Per ADR**: Keep each ADR focused on a single architectural decision
- **Immutable Records**: Never delete or modify accepted ADRs; create new ones to supersede them
- **Clear Context**: Document the problem, constraints, and forces driving the decision
- **Consider Alternatives**: List at least 2-3 alternatives considered and why they were not chosen
- **Consequences**: Document both positive and negative outcomes of the decision
- **Link Related ADRs**: Reference related or dependent architectural decisions

## Creating a CR

1. Read the CR template: [templates/CR.md](templates/CR.md)
2. Create a new file in the project's `docs/cr/` folder
3. Name the file using the pattern: `CR-NNNN-{short-title}.md` (e.g., `CR-0001-add-user-auth.md`)
4. Fill in all required sections from the template
5. Set initial status to `proposed`

### CR Lifecycle

| Status | Description |
|--------|-------------|
| **Proposed** | CR is created and awaiting review |
| **Approved** | Stakeholders have approved the change |
| **Implemented** | Change has been developed and merged |
| **Rejected** | Change was declined with reasoning documented |
| **On-Hold** | Change is postponed for future consideration |
| **Cancelled** | Change is no longer needed or relevant |
| **Obsolete** | Change is outdated due to external factors or superseded requirements |

### CR Requirements

- Use **MUST** keywords only for unambiguous requirements (RFC 2119)
- Write acceptance criteria using Given-When-Then formula (Gherkin)
- Use Mermaid diagrams for all visualizations
- Ensure comprehensive detail (minimum 250 lines for complex changes)
- Validate implementation details using DeepWiki MCP against source repositories
- Include test strategy for all code changes

## Document Numbering

Both ADRs and CRs use sequential four-digit numbering:
- First ADR: `ADR-0001-{title}.md`
- First CR: `CR-0001-{title}.md`

Check existing documents in the project's `docs/adr/` and `docs/cr/` folders to determine the next available number.

## Templates

- **ADR Template**: [templates/ADR.md](templates/ADR.md) - Complete template with all sections and guidance
- **CR Template**: [templates/CR.md](templates/CR.md) - Comprehensive template with detailed guidelines
