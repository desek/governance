---
name: cr-0017-iterate-ledger
description: Session ledger for the last-mile iteration session against CR-0017, closing the gap between the retuned iteration session and a session that carries no ceremony the repository does not already record.
cr: "CR-0017"
opened: "2026-08-02"
source-branch: "feat/tune-iterate-and-distill"
source-commit: "1e54f67"
worktree: "/Users/desek/Repo/desek/governance"
---

# Iteration Session Ledger: Remove the ceremony the repository already records

## Session Context

* **Governing Change Request:** CR-0017 — retuned the iteration session around a roll-forward ledger and decoupled it from distillation.
* **Gap being closed:** The retuning removed the per-attempt disposition handshake but left the session's other ceremony standing: two sub-commands, `close` and `status`, plus the ledger lifecycle fields they exist to set and read. Neither reports anything the repository does not already hold, so both cost the user a command to remember and return nothing for it.
* **Starting point:** branch `feat/tune-iterate-and-distill` at commit `1e54f67`, working tree `/Users/desek/Repo/desek/governance`

## Attempt Ledger

### Attempt 1 — Remove the close and status sub-commands and the lifecycle fields behind them

* **Change:** Cut the invocation surface to the single bare form. In `skills/checkpoint-iterate/SKILL.md`: the usage table lost two rows and gained a paragraph stating that neither sub-command exists and why; the frontmatter description dropped both; Step 1 lost the sub-command parenthetical; Step 4 (Status) and Step 5 (Close) were removed and replaced with a paragraph in the loop stating that the session ends when the user stops. Step 2 no longer records an open status and resumes any ledger it finds rather than an open one, and the ambiguity refusal now speaks of ledgers that exist rather than ledgers that are open. In `templates/ITERATE.md`: the `status` and `closed` frontmatter fields were removed and a NO LIFECYCLE note added. `WORKFLOW.md` step 6c was retitled and rewritten from a close instruction to a stop. Four assertions in `tests/checkpoint-iterate/` were retargeted: the three-invocation-forms test became a single-form test plus a genuine-absence test for both sub-commands, the close-of-status-and-date test became an ends-without-ceremony test, the template status-field test became a no-lifecycle-fields test, and the ambiguity test follows the reworded refusal.
* **Reason:** A `status` command answers a question the agent can answer by reading the ledger it is already maintaining, and a `close` command sets a field nothing else reads. The ledger is a tracked document with a Git history: what was recorded is in the file, and when each entry landed is in `git log`. Ceremony that duplicates the repository's own record is friction with no return, and a lifecycle field no command sets would leave every ledger permanently and misleadingly marked open.
* **Evidence:** `bats -r tests/` passes 124 of 124, including the governance boundary test. The two removals are asserted as genuine absences rather than as prose: `! grep -q 'checkpoint-iterate close'` and `! grep -q 'checkpoint-iterate status'` against the skill file, and `! grep -q '^status:'` plus `! grep -q '^closed:'` against the template. Grepping the repository for the two sub-command forms now returns nothing outside this ledger and the governing Change Request.

## What Stands Now

* The iteration session has exactly one invocation, `/checkpoint-iterate CR-XXXX`, which opens a ledger or resumes any ledger it finds.
* The ledger carries no lifecycle status and no closing date. A session ends when the user stops iterating; the last entry and its commit are the record of that.
* Everything CR-0017 established stands unchanged: kept is implicit, supersession is explicit, what stands is derived, and the session neither distils nor depends on the distillation skill.
