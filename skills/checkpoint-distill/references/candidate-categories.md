---
name: candidate-categories
description: The five categories a distillation candidate may belong to, the source-tracing rule every candidate must satisfy, and how an iteration ledger's closing findings are treated as input rather than passthrough.
metadata:
  copyright: Copyright Daniel Grenemark 2026
  version: "0.1"
---

# Candidate Categories and Sourcing

Load this when identifying candidates, after the standing instructions have been read in full.

## The five candidate categories

Candidates are drawn from exactly five categories. Every proposal names the category it belongs to, so the reader can weigh it against its kind.

1. **Invariants the code now depends on that nothing explains.** A constraint the implementation silently relies on — an ordering, a shared assumption, a contract between two components — that is load-bearing but undocumented, so the next change breaks it without warning.
2. **Failure narratives.** A path that was tried and abandoned, with the reason it failed. This is the highest-value category and the hardest to reconstruct after the fact: a pattern that worked is visible in the code, but a pattern that was eliminated is visible nowhere, so the next agent attempts it again at full cost unless something marks it as already ruled out.
3. **Reusable patterns.** A shape or approach that solved the problem well and will recur — worth naming so it is reached for deliberately rather than reinvented.
4. **Foot-guns that cost real debugging time.** A sharp edge that already consumed a measurable amount of someone's session — a non-obvious ordering, a silent failure mode, a tool that lies about success. The evidence of cost is what qualifies it; a hypothetical hazard that cost nothing is not yet a candidate.
5. **Drift.** An existing statement in the standing instructions that current reality now contradicts. Drift is not an addition — it is a correction the analysis surfaces, so a stale rule is fixed rather than left to mislead alongside a newer one.

## Every candidate traces to a source

Every candidate **MUST** trace to a specific source artifact, identified by **file location** (path and section, heading, or line) or by **commit hash**. A candidate with no citable origin is not a finding — it is the skill's own inference, and inference is exactly what this analysis exists to replace with evidence.

Where the reasoning behind a candidate **cannot be reconstructed from its sources** — the ledger records that an approach was discarded but not why, or a validation gap is noted without the cause that produced it — the skill **MUST NOT** record the candidate on a guessed rationale. It **MUST** instead query for the missing context and leave the candidate out until the reasoning is supplied. A rule written on an invented "why" is worse than no rule, because it is authoritative and unexamined; the missing reasoning is requested, never inferred.

## The iteration ledger is input, not passthrough

The iteration ledger's closing findings are the richest single input this analysis has, and the most easily mishandled. They are **input to be reconciled and ranked**, never content to be copied through. The skill **MUST NOT** write a ledger's closing findings into the standing instructions unranked.

The distinction is the point of the skill. **The ledger records what one session learned** — unranked, scoped to that session, unreconciled against anything the project already knows. **This skill decides what every future session should know** — which of those findings generalise beyond the session that produced them, which are already documented, and where each one ranks against every other candidate. A single session cannot see whether its own finding generalises or duplicates existing guidance; that judgement requires the wider view this analysis takes.

So every ledger finding is treated as a raw candidate: reconciled against the standing instructions, deduplicated, scored, and tiered alongside candidates from every other input — or, where it does not survive that reconciliation, ruled out with its reason stated.
