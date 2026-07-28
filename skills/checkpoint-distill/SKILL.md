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

## Input Resolution

Before any finding is produced, the skill resolves the inputs its scope makes available and records which were present and which were absent. What it resolves depends on the scope.

### Change Request scope: four inputs, ranked by durability

A Change Request scoped run gathers up to four inputs. The first three are tracked files that survive a squash merge and are the load-bearing material; the fourth is commit-borne and available only before the branch merges.

| Input | Conventional location | Survives a squash merge |
|---|---|---|
| The Change Request document | `docs/cr/CR-XXXX-*.md` | yes |
| The validation report | `docs/cr/CR-XXXX-validation-report.md` | yes |
| The iteration ledger | `docs/cr/CR-XXXX-iterate.md` | yes |
| Checkpoint commits for the identifier | Git history, matched by subject scope (below) | no |

Resolve each of the three files at its conventional path. The Change Request document itself must resolve, or the run refuses per the invocation contract. The validation report and the iteration ledger are optional: a project may run neither an iteration session nor a validation pass, so either or both may be absent, and their absence is a normal state rather than an error.

**Checkpoint commits span two subject scopes.** A single Change Request's commits are written under two distinct subject forms, and gathering only one silently drops the other. Match **both**:

```bash
# The plain form: the core implementation workflow's checkpoints.
git log --grep '^checkpoint(CR-XXXX):'

# The iteration-session variant: carries the iteration-session reasoning.
git log --grep '^checkpoint(CR-XXXX-iterate):'

# Both together, which is what this skill gathers.
git log --grep '^checkpoint(CR-XXXX\(-iterate\)\?):'
```

The iteration-session commits carry the hypotheses, discarded attempts, and partial-keep reasoning that the plain implementation commits do not, so omitting the `-iterate` scope would drop the highest-value commit-borne material. Gathering for an identifier **MUST** match both scopes.

### Branch scope: the commit range delimited by the merge base

A branch scoped run has no Change Request document to resolve. Its input is the commits on the current branch that are not present on the default branch. Delimit that range by the **merge base** of the current branch with the default branch — the commit at which the branch diverged — so the range is exactly the branch's own work:

```bash
# The commits unique to this branch, delimited by the divergence point.
git log $(git merge-base HEAD <default-branch>)..HEAD
```

The range is defined by that divergence point, never by a fixed number of commits back from the tip. The default branch is discovered from the repository at run time rather than assumed to carry any particular name.

## Availability Report

The availability report is the load-bearing part of input resolution. It **MUST** precede any finding, so the reader learns which inputs the analysis rested on at the point they begin reading it, not after they have already trusted its conclusions.

- The report **MUST** name every input that was found and every input that was absent. An absent validation report or iteration ledger is stated as absent, not passed over in silence.
- When commit-borne input was unavailable, the report **MUST** say so plainly, and the analysis **MUST NOT** present itself as equivalent to one that had it. An analysis that could read the checkpoint commits and one that could not are different analyses drawing on different material; the reader needs to know which one they are holding. A thinner analysis that hides its thinness is the failure this report exists to prevent.

**Checkpoint commits do not survive a squash merge.** This project squash-merges pull requests, so a branch's individual checkpoint commits never reach the default branch — ten commits carrying per-phase reasoning collapse into one whose body is a pull request summary. Reading those commits therefore works **only in the window between the work finishing and the branch merging**. A run that needs the commit-borne input **MUST** happen before the branch merges; once it has merged, only the three file-borne inputs remain, and the availability report states that the commits were unavailable.

## Graceful Degradation

The skill is usable in a project that has neither an iteration ledger nor a validation report. When an optional input does not exist, the run **MUST** proceed on the inputs that do rather than failing — degrading to the Change Request document alone if that is all that resolves. Each absent input is named in the availability report, so degradation is visible rather than silent. The only input whose absence stops the run is the Change Request document in a Change Request scoped run, because there is then no unit of work to analyse; that refusal is governed by the invocation contract above.

## Candidate Identification

Once the inputs are resolved and their availability reported, the skill identifies the knowledge worth promoting. This is the read-only heart of the analysis: nothing is written here, and every candidate that emerges is a proposal for later per-tier approval, not a decision.

### Read the standing instructions in full before proposing anything

Before a single candidate is identified, the skill **MUST** read the project's standing instructions **in their entirety**. Already-documented knowledge must never be proposed again — re-proposing what the reader already has wastes the reader's minute and trains them to skim the report, which defeats the tiering that keeps the report short. Reading first is what makes an analysis idempotent: re-running it over an unchanged scope proposes nothing new, because everything promotable is already present.

Coverage is rarely all-or-nothing. Where the standing instructions **partially** cover a candidate — they state the rule but not its mechanism, or warn of the foot-gun but not the specific case that triggers it — the candidate is the **uncovered gap**, never the whole topic. The skill proposes the missing piece and cross-references what already exists, rather than restating the covered part.

### The five candidate categories

Candidates are drawn from exactly five categories. Every proposal names the category it belongs to, so the reader can weigh it against its kind.

1. **Invariants the code now depends on that nothing explains.** A constraint the implementation silently relies on — an ordering, a shared assumption, a contract between two components — that is load-bearing but undocumented, so the next change breaks it without warning.
2. **Failure narratives.** A path that was tried and abandoned, with the reason it failed. This is the highest-value category and the hardest to reconstruct after the fact: a pattern that worked is visible in the code, but a pattern that was eliminated is visible nowhere, so the next agent attempts it again at full cost unless something marks it as already ruled out.
3. **Reusable patterns.** A shape or approach that solved the problem well and will recur — worth naming so it is reached for deliberately rather than reinvented.
4. **Foot-guns that cost real debugging time.** A sharp edge that already consumed a measurable amount of someone's session — a non-obvious ordering, a silent failure mode, a tool that lies about success. The evidence of cost is what qualifies it; a hypothetical hazard that cost nothing is not yet a candidate.
5. **Drift.** An existing statement in the standing instructions that current reality now contradicts. Drift is not an addition — it is a correction the analysis surfaces, so a stale rule is fixed rather than left to mislead alongside a newer one.

### Every candidate traces to a source

Every candidate **MUST** trace to a specific source artifact, identified by **file location** (path and section, heading, or line) or by **commit hash**. A candidate with no citable origin is not a finding — it is the skill's own inference, and inference is exactly what this analysis exists to replace with evidence.

Where the reasoning behind a candidate **cannot be reconstructed from its sources** — the ledger records that an approach was discarded but not why, or a validation gap is noted without the cause that produced it — the skill **MUST NOT** record the candidate on a guessed rationale. It **MUST** instead query for the missing context and leave the candidate out until the reasoning is supplied. A rule written on an invented "why" is worse than no rule, because it is authoritative and unexamined; the missing reasoning is requested, never inferred.

### The iteration ledger is input, not passthrough

The iteration ledger's closing findings are the richest single input this analysis has, and the most easily mishandled. They are **input to be reconciled and ranked**, never content to be copied through. The skill **MUST NOT** write a ledger's closing findings into the standing instructions unranked.

The distinction is the point of the skill. **The ledger records what one session learned** — unranked, scoped to that session, unreconciled against anything the project already knows. **This skill decides what every future session should know** — which of those findings generalise beyond the session that produced them, which are already documented, and where each one ranks against every other candidate. A single session cannot see whether its own finding generalises or duplicates existing guidance; that judgement requires the wider view this analysis takes. So every ledger finding is treated as a raw candidate: reconciled against the standing instructions, deduplicated, scored, and tiered alongside candidates from every other input — or, where it does not survive that reconciliation, ruled out with its reason stated.

## Scoring and Ranking

### Three scoring dimensions

Each surviving candidate is scored on three dimensions:

1. **Leverage** — how much future work the rule saves or protects. How often the situation it governs recurs, and how many sessions inherit the benefit.
2. **Decay risk** — how likely the knowledge is to be lost or re-litigated if it is not written down. Reasoning that lives only in a session's memory, or in commits about to be squashed, has high decay risk; a fact already half-visible in the code has less.
3. **The cost of the rule being broken** — what it costs when a future session violates the constraint unknowingly. A foot-gun that wastes an hour scores below an invariant whose breach corrupts data.

### Three tiers, must-add to optional

The scored candidates are sorted into exactly three tiers, ordered by priority:

1. **Must add** — high leverage, high decay risk, or high cost of breakage. Knowledge whose loss the project cannot afford.
2. **Recommended** — clearly worth adding, but the project survives a delay.
3. **Optional** — genuine but marginal; a reader may reasonably decline it.

The tiers exist to keep the must-add set small, so the standing instructions grow slowly enough to stay read. When two candidates carry equivalent leverage but belong to different categories, **a failure narrative outranks the others**. A failure narrative prevents work that has already been proven wasteful — the single most expensive thing a future session can repeat — so at equal leverage it earns the higher tier over an invariant, pattern, or foot-gun of the same weight.

## Analysis Report

The report is read-only output: it presents the tiered candidates and stops, awaiting the per-tier approval specified later. It **MUST** be **scannable in about a minute**. The tiering serves that budget — a reader who trusts the must-add tier can act on it alone — but each entry must also be terse enough to read at a glance.

Every candidate in the report states three things, and no more than it needs to:

- **What it is** — the knowledge in a sentence, and its category.
- **Where it would live** — the section of the standing instructions it belongs in, or the existing statement it corrects.
- **Why it matters** — the leverage, and its source citation (file location or commit hash) so the reader can verify the claim against its origin.

### Ruled-out candidates are stated, never dropped

A candidate the analysis considers and decides **not** to propose — because it is already documented, because it does not generalise beyond its session, or because its reasoning could not be reconstructed — **MUST** be reported as ruled out, with the reason it was ruled out. It is never dropped silently. Stating the exclusion and its reason lets the reader catch a wrong call the skill made, and prevents the same candidate from being re-examined from scratch on the next run. A silent omission is indistinguishable from an oversight; a stated one is a decision the reader can review.

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
