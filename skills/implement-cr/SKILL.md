---
name: implement-cr
description: Slash command that implements one or more approved or draft Change Requests end to end, strictly in argument order, following the operating_model change_flow with subagents created only through the Workflow tool. Commits each step through /checkpoint-commit, recovers context with /checkpoint-read, and ends by naming /iterate-cr. Trigger with /implement-cr CR-XXXX [more CRs ...].
argument-hint: "<CR-ID | docs/cr/CR-*.md> [more CRs ...]"
license: Apache-2.0
metadata:
  copyright: Copyright Daniel Grenemark 2026
  version: "0.0.1"
---

# /implement-cr

Implement the CRs in `$ARGUMENTS`. This command does not author CRs; authoring goes through the **governance** skill.

**Usage:** `/implement-cr <CR-ID | docs/cr/CR-*.md> [more CRs ...]`

## Preconditions

The procedure per CR is the `change_flow` of the `operating_model` block, with the `subagent_creation`, `task_delegation`, `continuous_commit`, `testing`, and `user_scenario_testing` blocks of the consumer's agent instructions. This skill depends on those blocks; when they are loaded, apply them, do not restate them.

**Fallback.** When those blocks are absent from the agent instructions, follow `skills/governance/reference/cr-implementation-workflow.md` instead, so a consumer without them still gets a working implementation step.

## Tools

- Create subagents only through the `Workflow` tool. Load the **workflow-authoring** skill before the first workflow.
- Every `agent()` call passes model `claude-opus-5-5` and effort `low`. The oracle of the `mandate` block is the exception: it uses model `claude-fable-5-1` and effort `high`. A tier that the task states stays permitted.
- Commit through the `/checkpoint-commit` workflow and recover context through `/checkpoint-read`.

## 1. Parse

- Each argument is a CR ID (`CR-NNNN`) or a path under `docs/cr/`.
- If `$ARGUMENTS` is empty, stop and print: `usage: /implement-cr <CR-ID | docs/cr/CR-*.md> [more CRs ...]`.

## 2. Resolve all arguments first

- Each argument must match exactly one `docs/cr/CR-NNNN-*.md` that is not a `-validation-report`, `-rollback-log`, or `-iterate` file.
- Files under `docs/cr/iterations/` are iteration ledgers and **MUST NOT** be resolved as a CR.
- If any argument fails, stop before any work, name the failed argument, and make no commit.

## 3. Recover context

Run `/checkpoint-read` before the first CR, and again whenever the run resumes after context loss. When a CR in the argument list already has checkpoint commits, continue that CR from its last checkpoint rather than from its start, and do not repeat a CR that already completed.

## 4. Run each CR, strictly sequentially

In argument order. A CR starts only after the previous CR completes, so it reads the tree the previous CR left.

1. **Layer 0:** write the intent statement from the CR.
2. **Review:** a separate agent in a workflow, which did not author the CR, reviews it. On approval, set frontmatter `status: approved`.
3. **Layer 2:** update the docs first.
4. **Layer 3:** implement the code from the spec diff. Delegate each unit of work per `task_delegation`, with the fixed 8-section prompt.
5. **Commit** each coherent step through the `/checkpoint-commit` workflow with the scope `CR-NNNN`, so the subject is `checkpoint(CR-NNNN): ...`.
6. **Gate destructive changes** with a rollback log per `core_principles`.
7. **Verify** against the CR acceptance criteria, then against the intent. Use a user scenario per `testing` where the CR has a user surface.

If a CR fails review or verification, stop. Do not start later CRs.

## 5. Report

- One line per CR: `CR-NNNN status: completed|failed|not-started`.
- For a failed CR, add the failed step.
- Set frontmatter `status: implemented` on each completed CR.
- End the report with the `/iterate-cr` command that covers every completed CR, for example `/iterate-cr CR-XXXX CR-YYYY`, as the next step for post-implementation adjustment.
