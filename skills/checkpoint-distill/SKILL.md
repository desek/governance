---
name: checkpoint-distill
description: Slash command that reads the durable artifacts a completed unit of work leaves behind, identifies knowledge that should outlive the change, ranks it by leverage against decay risk, and on per-tier approval writes it into the project's standing instructions as narrative in which every rule travels with the reasoning that produced it. Trigger with /checkpoint-distill CR-XXXX or /checkpoint-distill --branch.
license: Apache-2.0
metadata:
  copyright: Copyright Daniel Grenemark 2026
  version: "0.1"
---

# /checkpoint-distill

Turns the artifacts of finished work into standing guidance a future session inherits. A coding agent is episodic: each session begins without the context of the last one — what was tried, what failed, what stuck, and why. Standing instructions carry that across the gap, but only if something deliberately puts the knowledge there. This skill reads the durable record a unit of work leaves behind, extracts the constraints, failure narratives, and foot-guns worth keeping, ranks them, and — on explicit per-tier approval — writes them into the project's standing instructions as narrative rather than as a list of bare rules.

A bare rule does not survive contact with inconvenience. "Do X" tells a future reader what, not why, so the first time the constraint is awkward it gets changed or stripped as arbitrary. "We tried Y, it broke for reason Z, so the rule is X" survives, because the reader can evaluate whether Z still applies. The reasoning is the load-bearing part; the rule is a summary of it. That is why this skill writes narrative that carries the mechanism, the cost, and the history behind each rule, and never a stripped constraint.

**Usage:**

| Invocation | Scope |
|---|---|
| `/checkpoint-distill CR-XXXX` | Change Request scoped: analyses that Change Request's durable artifacts. **This is the default mode.** |
| `/checkpoint-distill --branch` | Branch scoped: analyses the current branch's commits, delimited by the merge base with the default branch. |

Both scopes name a semantic unit of work. There is deliberately **no** mode that analyses an arbitrary count of most-recent commits: a commit count is neither a semantically bounded unit nor stable across a merge, so a window of *N* commits silently changes meaning the moment history is squashed. If a scope is not supplied and cannot be resolved, the skill asks rather than inventing a commit window.

## Invocation Contract

The two scopes above are the only two the skill accepts. Everything below constrains how they behave.

### Change Request scope is the default

Invoked with a Change Request identifier and no other argument, the skill scopes the entire analysis to that Change Request's artifacts. It bounds the work by the unit the identifier names, never by a count of recent commits. Change Request scope is the default because it is the scope whose material survives a squash merge: the tracked documents a Change Request leaves behind persist unchanged through the merge, whereas commit-borne reasoning does not.

### Branch scope is delimited by the merge base

Invoked with `--branch`, the skill analyses the commits on the current branch that are not present on the default branch. The analysed range is delimited by the **merge base** of the current branch with the default branch — the commit at which the branch diverged — so the range is exactly the branch's own work and nothing inherited from the trunk. The range is defined by that divergence point, not by a fixed number of commits back from the tip.

### Refusal on an unresolvable identifier

Before any analysis, the skill resolves the supplied Change Request identifier to its governing document.

- **If the identifier resolves to no Change Request document:** the skill **MUST** refuse to run, **MUST** report which identifier could not be resolved, and **MUST** produce no analysis. It does not fall back to a commit window, guess a neighbouring identifier, or analyse anything in place of the document it could not find. A named refusal is the correct outcome, because an analysis of the wrong unit is worse than none.

## Analysis Is Read-Only by Default

The skill's default behaviour is **analysis without modification**.

- In its default mode the skill reads its inputs, presents its findings, and **stops**. It **MUST NOT** modify any file, and it **MUST NOT** write to the standing instructions, while analysing.
- Writing happens **only** after explicit approval, and approval is **per tier**: the findings are ranked into tiers, and the user may accept one tier while declining another. Only an approved tier is ever written.
- There is deliberately **no** invocation that writes every tier without the user having selected them. No flag, argument, or mode applies all findings in one step. The gate between a candidate and the standing instructions is always a human choosing that tier, because a wrong rule written into standing instructions is authoritative and unexamined, and inherited by every future session. Skipping the selection is the one thing this skill will not offer.

The mechanics of input resolution, candidate identification and ranking, the approval exchange, and the written output are specified in the sections that follow.

## Portability

This skill encodes nothing about the structure, section naming, or subject matter of any particular project, so it is usable unchanged in any repository. It discovers the shape of the target standing instructions by reading them at the time it runs, and it never assumes a fixed sectioning, index, or naming convention. The invocation contract above refers only to concepts every project shares — a unit of work, a default branch, a merge base, a document that either resolves or does not.

## Governance Reference Boundary

Standing instructions are prohibited territory for governance identifiers. Guidance this skill writes therefore describes the **practice** and **MUST NOT** name the Change Request, iteration session, or commit that produced it. This SKILL file is itself prohibited territory: every identifier placeholder in it is written in a digitless form (`CR-XXXX`, `{CR_ID}`) precisely so no digit-form governance identifier appears where the boundary forbids it.

## Safety Rules

- **MUST** treat Change Request scope as the default and refuse, by name, an identifier that resolves to no document.
- **MUST NOT** define a mode that analyses an arbitrary count of most-recent commits.
- **MUST NOT** modify any file while in the default analysis mode.
- **MUST NOT** provide any invocation that writes every tier without the user having selected them.
- **MUST NOT** perform destructive Git operations: `git reset`, `git rebase`, `git commit --amend`, `git push --force`.
