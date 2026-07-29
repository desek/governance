---
name: cr-0016-iterate-ledger
description: Session ledger for the last-mile iteration session against CR-0016, closing the gap between the delivered checkpoint-distill skill and the skill-authoring specification it must conform to.
cr: "CR-0016"
status: "open"
opened: "2026-07-28"
closed: ""
source-branch: "feat/checkpoint-distill"
source-commit: "ceabd4a"
worktree: "/Users/desek/Repo/desek/governance"
---

# Iteration Session Ledger: Bring checkpoint-distill within the skill-authoring budget

## Session Context

* **Governing Change Request:** CR-0016 — delivered the `checkpoint-distill` skill, which promotes the durable artifacts of completed work into the project's standing instructions.
* **Gap being closed:** The delivered `SKILL.md` was validated against CR-0016's own requirements, but never against the skill-authoring specification. Checking it after the fact found it ~38% over the specification's token budget (~6,880 against a ~5,000 target) with no `references/` directory, so none of the progressive disclosure the specification prescribes is in place. It is the outlier of the five skills in this repository: the next largest is roughly half its size.
* **Starting point:** branch `feat/checkpoint-distill` at commit `ceabd4a`, working tree `/Users/desek/Repo/desek/governance`
* **Continued:** 2026-07-28 at commit `fbc5433`, after a distillation run against this branch surfaced that the analysis does not distinguish knowledge the project owns from workarounds for defects in its dependencies. The ledger is append-only, so continuing after a close is an append and nothing more: the attempt below follows the earlier ones, and the distillation written at the first close stands as the record of what was concluded then. A later close appends its own distillation rather than editing that one.

## Attempt Ledger

### Attempt 1 — Move explanatory prose into references/ and leave SKILL.md as the workflow

* **State:** settled
* **Hypothesis:** The overflow is concentrated in explanatory material rather than in the workflow itself: the scoring rationale, the voice rules, the worked example, and the report template all explain *why* and *how well*, not *what to do next*. Moving those into `references/` files one level deep — each with a pointer stating when to load it — should bring `SKILL.md` under the ~5,000 token target without removing any guidance, since the specification's progressive disclosure exists precisely for this case. Splitting on the explanatory/procedural seam rather than by line count should also leave the workflow more readable, not less.
* **Surface touched:** `skills/checkpoint-distill/SKILL.md`; three new files under `skills/checkpoint-distill/references/` (`candidate-categories.md`, `scoring-and-tiers.md`, `writing-guidance.md`); `tests/checkpoint-distill/test_skill_structure.bats` and `tests/checkpoint-distill/test_helpers/setup.bash`. The test files are part of this attempt's surface because five of their assertions were coupled to the single-file layout the attempt changed.
* **Verification evidence:** `SKILL.md` went 250 to 186 lines and ~6,880 to ~4,814 tokens, moving from 38 percent over the ~5,000 target to under it. No guidance was deleted; all of it moved, and each of the three reference files is under 100 lines so none requires a table of contents. The governance boundary test passed throughout, and no digit-form identifier exists anywhere in the skill package.

    The first check run after the split returned 90 of 95, with five failures. Every one grepped a literal string in `SKILL.md` that had moved into a reference file; all five strings were confirmed still present in the package, so nothing had been lost. The failures were a wrong assumption in the tests rather than a regression in the skill: the requirements say the *skill* must document these behaviours, while the assertions demanded that one specific file carry the sentence. Widening those five assertions to grep the package — `SKILL.md` plus its one-level-deep `references/` — through a shared `skill_package_has` helper returned the suite to 95 of 95.
* **Disposition:** kept

### Attempt 2 — Classify every candidate as in-project or out-of-project

* **State:** settled
* **Hypothesis:** The analysis conflates two kinds of knowledge that need different handling. Some candidates describe **this project** — its conventions, its artifacts, knowledge the project owns and can change. Others describe a defect or quirk in something the project **depends on but does not control** — an external tool, a service, a harness capability — where the only available response is to route around it. The second kind is the common case, and it differs in three ways that matter: it expires when the upstream defect is fixed, it cannot be fixed from inside this repository, and written as a permanent project rule it becomes a lie the moment upstream changes.

    Classifying each candidate by origin before it is ranked, and requiring an out-of-project candidate to carry the upstream thing, the observed defect, the workaround, and **how to test whether it is still needed**, should let a reader tell at a glance whether a finding is project knowledge or a dependency workaround — and give the workaround an expiry condition rather than letting it calcify into a rule nobody dares remove.
* **Surface touched:** `skills/checkpoint-distill/SKILL.md`; `skills/checkpoint-distill/references/candidate-categories.md` and `references/writing-guidance.md`, both extended and their frontmatter descriptions updated to match; `tests/checkpoint-distill/test_skill_structure.bats`.
* **Verification evidence:** The suite went 95 to 101, with six new assertions covering the classification, the workaround framing, the mandatory re-test condition, the four parts an out-of-project candidate carries, the mixed-cause tiebreak, and the requirement that the report state each candidate's class. The boundary test passed and no digit-form identifier appeared anywhere in the package.

    One assertion failed on first run with grep status 2 rather than a content mismatch: the literal `**MUST**` in the search string is invalid as a regular expression. Replaced with a literal-safe string. This is a property of asserting prose by grep, not of the change under test.

    The token budget was the real finding. The addition pushed `SKILL.md` from ~4,973 to ~5,224 tokens, back over the limit the previous attempt had just brought it under. The space was reclaimed three ways rather than by dropping content: tightening the new section and moving its rationale into the reference; deduplicating the skill's own governance boundary rule, which was stated in full in two places, by applying the skill's own cross-reference-rather-than-restate rule to itself; and trimming a self-referential restatement in the approval section plus an intro paragraph the writing reference now owns. Final state is ~4,973 tokens, exactly where the previous attempt left it, with roughly 27 tokens of headroom.
* **Disposition:** kept

## Distillation

### Recommended Patterns

**Verify a new skill against the skill-authoring specification, not only against the change request that commissioned it.** A change request is authored by the same party that designs the skill, so validating the skill against it is a closed loop: full conformance proves the implementation matches the design, and says nothing about whether the design met the external specification. The specification's constraints — the token budget, progressive disclosure, the frontmatter rules — are invisible to that loop and go unchecked. Run the specification's own quality gate as a distinct step, at authoring time rather than after merge.

**Measure a document against a token budget in tokens, not lines.** A line count and a token count diverge sharply with prose density: this file passed the 500-line limit at 250 lines while failing the ~5,000-token limit at ~6,880, because long explanatory paragraphs carry far more tokens per line than terse step lists. A line check would have reported the document healthy. Where a budget is expressed in tokens, check it in tokens.

**Split a document on the explanatory-versus-procedural seam.** When a document must shrink, the productive cut is between what to do next and why it works — not an arbitrary line target. The procedural spine stays where the reader acts on it; the rationale moves behind a pointer that names when it is needed. This preserves every word of guidance while shortening what must be read to act, and it leaves the remaining document more readable rather than merely shorter.

**Assert behaviour against the whole package, not against a single file.** A test that greps a literal sentence in one file couples the test to a layout decision rather than to a requirement. When the requirement is that *the skill documents a behaviour*, the assertion belongs against the skill package — the entry document plus its references. Scoping to one file makes a legitimate restructure look like a regression and pressures the author to undo the restructure rather than fix the assertion.

### Anti-Patterns

**Deferring a specification check until after the work merges.** Checking conformance only after delivery means the finding lands as rework on a branch that is already reviewed, or after a squash merge when the reasoning behind each choice is gone. The specification's gate is cheap to run and should gate authoring, not follow it.

**Treating a passing validation as evidence of external conformance.** The validation of this skill recorded zero gaps across every requirement and acceptance criterion, all traced with file and line evidence, while the skill was 38 percent over the specification's token budget. The validation was correct and thorough about the wrong question. A validation report answers "does this match its specification"; it cannot answer "was the specification right", and reading it as though it does creates false confidence precisely where an external standard applies.

**Writing a content assertion as a literal grep against a fixed path.** Five assertions here named one file and one exact sentence. Both couplings are incidental to the requirement, and the file coupling broke the moment progressive disclosure — which the specification actively prescribes — moved the sentence one directory deeper. The test's failure carried no information about correctness, only about layout.
