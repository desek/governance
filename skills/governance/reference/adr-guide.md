# ADR Reference Guide

Detailed guidance for creating and managing Architecture Decision Records.

## Table of Contents

- [When to Create an ADR](#when-to-create-an-adr)
- [ADR Lifecycle](#adr-lifecycle)
- [Best Practices](#best-practices)
- [Document Numbering](#document-numbering)

## When to Create an ADR

Create an ADR when making decisions about:

- **Technology stack selection**: Frameworks, libraries, platforms
- **System architecture patterns**: Microservices, monolith, event-driven
- **Data storage and management**: Database choices, caching strategies
- **Integration patterns**: External service dependencies, APIs
- **Security architecture**: Authentication, authorization approaches
- **Infrastructure and deployment**: Cloud providers, CI/CD pipelines
- **Performance and scalability**: Optimization strategies, scaling approaches
- **Development tools and workflow**: Build tools, testing frameworks

## ADR Lifecycle

| Status | Description |
|--------|-------------|
| **Proposed** | ADR is drafted and awaiting review |
| **Accepted** | Decision has been approved and will be implemented |
| **Rejected** | Alternative approach was chosen, reasoning documented |
| **Deprecated** | Decision is superseded by a newer ADR |
| **Superseded** | Replaced by another ADR, with reference to new decision |

### Status Transitions

```
proposed → accepted → deprecated/superseded
proposed → rejected
```

- An ADR starts as `proposed`
- After review, it becomes `accepted` or `rejected`
- Accepted ADRs may later become `deprecated` or `superseded` by newer decisions

## Best Practices

### One Decision Per ADR

Keep each ADR focused on a single architectural decision. If you find yourself documenting multiple decisions, split them into separate ADRs and link them together.

### Immutable Records

Never delete or modify accepted ADRs. If a decision needs to change:
1. Create a new ADR with the updated decision
2. Set the old ADR status to `superseded`
3. Add a reference to the new ADR in the old one

### Clear Context

Document thoroughly:
- The problem or need driving the decision
- Constraints (technical, business, timeline)
- Forces influencing the decision

### Consider Alternatives

List at least 2-3 alternatives considered:
- Describe each alternative briefly
- Explain why it was not chosen
- Be honest about trade-offs

### Document Consequences

Include both positive and negative outcomes:
- Benefits gained from the decision
- Risks or downsides accepted
- Technical debt introduced (if any)

### Link Related ADRs

Reference related or dependent architectural decisions:
- Use relative links to other ADRs
- Explain the relationship (depends on, supersedes, relates to)

## Document Numbering

ADRs use sequential four-digit numbering:

- First ADR: `ADR-0001-{title}.md`
- Second ADR: `ADR-0002-{title}.md`

**File naming rules:**
- Use lowercase letters, numbers, and hyphens only
- Keep titles short but descriptive
- Example: `ADR-0001-use-postgresql.md`

Check existing documents in the project's `docs/adr/` folder to determine the next available number.
