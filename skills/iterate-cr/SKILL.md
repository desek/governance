---
name: iterate-cr
description: Slash command that runs a last-mile iteration session against zero, one, or many implemented Change Requests. Opens a roll-forward ledger under docs/cr/iterations/, records each change with what was done, why it was tried, what the evidence showed, and the Change Request it is attributed to, notes where a later change supersedes an earlier one, and checkpoint-commits every change continuously. Trigger with /iterate-cr [CR-XXXX ...].
license: Apache-2.0
metadata:
  copyright: Copyright Daniel Grenemark 2026
  version: "0.0"
---

# /iterate-cr

Runs an **iteration session** that closes the last-mile gap between implemented Change Requests and the behaviour that was actually wanted. A specification is written before the code exists, so the delivered result is approximately right rather than exactly right. Closing that gap is an interactive loop the user drives: the user names what to try, the agent makes the change and reports what it observed, the user says what to try next. This skill records that loop as a **roll-forward ledger** at `docs/cr/iterations/{YYYY-MM-DD}-{slug}.md`, so the reasoning — including every approach a later change superseded — survives the session instead of evaporating with the agent's context. A ledger is not owned by one Change Request, so it has its own identity: the date it was opened and a short slug.

**Usage:**

| Invocation | Effect |
|---|---|
| `/iterate-cr` | Opens an exploration session with no Change Request (`crs:` empty) |
| `/iterate-cr CR-XXXX` | Opens a session against that Change Request, or resumes the one open ledger that covers it |
| `/iterate-cr CR-XXXX CR-YYYY` | Opens a session that covers every named Change Request, or resumes the one open ledger that covers them |

That is the whole surface. There is **no** close sub-command and **no** status sub-command, because neither would tell anyone anything the repository does not already hold. The ledger is a tracked document with a Git history: what the session has recorded is in the file, and when each entry landed is in `git log`. A session ends when the user stops iterating, which needs no ceremony to announce. Reconciling an accepted session into governance is a separate, deliberate step the user runs with `/reconcile-cr`.

Every named Change Request **MUST** resolve to an existing Change Request document. There is no implicit "current session".

## The Roll-Forward Model

An iteration session moves in one direction, and the ledger records that motion rather than adjudicating it. Three properties define the model.

- **Kept is implicit.** A change made, checked, and left in the working tree stands. That is what "left in the tree" means, and nothing confirms it — there is no verdict, disposition, or classification for the ordinary outcome.
- **Supersession is explicit.** When a later change undoes or replaces earlier work, the new entry names the earlier entry it supersedes and states why the earlier work no longer stands. A partial reversal needs no special label: the superseding entry says in prose what it replaced and what it left alone. The earlier entry is **never** edited, rewritten, or deleted when superseded — it is the record of an approach that was tried, which is exactly the material later distillation cannot get anywhere else.
- **What stands is derived.** The current state is read forward from the entries, honouring supersessions, rather than maintained by hand. Regenerating that derived summary is not a breach of the append-only rule, which governs the entries themselves.

## Role Split

The division of labour governs every step below. It is fixed and **MUST NOT** be reassigned.

- **The user** initiates the session, names each thing to try next, and paces the loop, continuing until they say the session is done. Direction and pace are the user's; the agent does not ask for a judgment on each result.
- **The agent** makes the code change, runs the project's checks, and — as a side effect of that work, not as a separate step that collects a judgment — writes the ledger entry and creates the commit. The agent is the recorder for every change, because it is the party present at all of them and already writing to the repository.

The user is therefore never asked to maintain a notebook alongside the work. Their contribution is direction; the recording happens on its own as the agent does the work it was already doing.

**Initiation is user-only.** A session **MUST** be opened by explicit user invocation. It **MUST NOT** be started automatically, and **MUST NOT** be spawned by the implementation pipeline. The whole point is that a human has looked at the delivered result and judged it not yet right.

## Workflow

Follow these steps in order.

### Step 1: Resolve and Validate the Covered Change Requests

Read zero or more identifiers from `$ARGUMENTS`.

- For each named identifier, confirm a Change Request document exists at `docs/cr/{CR_ID}-*.md`. Files under `docs/cr/iterations/` and files ending in `-iterate.md`, `-validation-report.md`, or `-rollback-log.md` are not Change Request documents.
- **If any named document does not exist:** refuse to open a session against a Change Request whose document does not exist, report which identifier could not be resolved, and **STOP**. No ledger is created when any identifier is unresolved, even if the others resolve.
- **If no identifier is named:** the session is an exploration session; continue to Step 2 with an empty scope.

### Step 2: Create or Resume the Ledger

Find the open ledgers that cover the named Change Requests. An open ledger is a ledger under `docs/cr/iterations/` whose `crs:` lists every named Change Request and whose frontmatter carries no `reconciled:`, or a legacy ledger at `docs/cr/{CR_ID}-iterate.md` (from the predecessor `/checkpoint-iterate` skill) when exactly one Change Request is named and that file carries no `reconciled:`.

- **If more than one open ledger covers the named Change Requests:** refuse to act, list the ledgers found, and **STOP** rather than guessing which session is meant. The same applies to an invocation with no identifier when the user asks to resume and more than one open exploration ledger exists.
- **If exactly one open ledger covers them:** resume it (see below). A legacy ledger is resumed in place, at its legacy path, when it is the only open ledger that covers that Change Request.
- **If the only ledger that covers them carries `reconciled:`:** the ledger is closed. The agent **MUST NOT** append to a ledger whose frontmatter carries `reconciled:`; tell the user that the ledger is reconciled and that new adjustments open a new session, then open a new ledger only on that instruction.
- **If none exists:** create `docs/cr/iterations/{YYYY-MM-DD}-{slug}.md` from the bundled template at `templates/ITERATE.md`. The slug is a short kebab-case name for what the session closes. Record in its frontmatter the covered Change Requests (`crs:`, an empty list for exploration), the start date (`opened:`), the branch and commit the session starts from (`source-branch:`, `source-commit:`), and the working tree it was opened in (`worktree:`). `reconciled:` and `reconciled-into:` stay absent; only `/reconcile-cr` sets them. The ledger carries no lifecycle status, because nothing sets one.

**Resuming.** Append to the existing ledger — **MUST NOT** recreate, rewrite, or remove any previously recorded entry. Resuming reconstructs session state without asking the user further questions, through the re-hydration procedure below. A ledger the user stopped iterating on months ago resumes exactly like one abandoned an hour ago: the entries say what stands, and appending to them is the only thing a session ever does.

When resuming, before proposing any new change the agent reports the recovered state: what stands now, and which approaches an entry records as superseded. An approach an earlier entry records as superseded **MUST NOT** be proposed again without stating that it was already eliminated and why it is being revisited.

### Step 3: Loop Over Changes

The loop has four movements, and the user paces it. Repeat until the user says the session is done.

1. The user says what to try next.
2. The agent makes the code change for that idea and runs the project's checks.
3. The agent appends the ledger entry — what was changed, why it was tried, what the evidence showed, and its attribution — and, where the change undoes or replaces earlier work, names the earlier entry it supersedes and why. It then creates the commit, on its own initiative, through the `/checkpoint-commit` workflow (see Commit Protocol).
4. The agent waits for the user's next instruction.

**Attribution.** Each entry carries a `CR:` field that names the one covered Change Request whose behaviour the change alters, or the literal `none` when the change adds behaviour that no covered Change Request describes. In an exploration session every entry is `none`. The agent writes the attribution as part of the entry, the same way it writes the reason and the evidence; it is a proposal, and `/reconcile-cr` finalises the routing.

The agent does not pause to ask for a verdict, a disposition, or a classification: anything left in the working tree is kept, and the only reversal the ledger records is a later entry superseding an earlier one. A superseded entry is never deleted from the ledger — retaining it is the entire point, because it is the failure narrative that exists nowhere else.

**The session ends when the user stops.** Nothing marks it closed, and nothing needs to: the last entry is the last entry, and `git log` says when it landed. Asked at any point what the session has done, the agent answers by reading the ledger it is already maintaining, which is the same answer a status command would have produced at the cost of a command to remember.

The session draws no conclusions from its own ledger: it writes no patterns, no anti-patterns, and no distillation, and it neither invokes nor depends on any other skill beyond the checkpoint commit and checkpoint read workflows it uses for commits and context recovery. A ledger holds what was done, why, and what stands, and that is a complete input for a later reconciliation and distillation the user runs when they choose to.

## Commit Protocol

Every change made during a session is committed continuously through the `/checkpoint-commit` workflow, without waiting to be asked. The session does not invent a parallel commit mechanism; it passes `/checkpoint-commit` an explicit scope, trailer, and path list, and distinguishes its commits by **scoping the identifier**, not by changing the type.

**The scope follows the attribution of the entry:**

```text
checkpoint({CR_ID}-iterate): {summary}     # entry attributed to a covered CR, e.g. checkpoint(CR-XXXX-iterate)
checkpoint(iterate-{slug}): {summary}      # entry attributed none, e.g. checkpoint(iterate-tune-retry)
```

The unsuffixed form `checkpoint({CR_ID}): {summary}` **MUST NOT** be used by a session — it is reserved for the core agentic implementation workflow.

**Trailer and body.** Every session commit carries the trailer `Iteration: {slug}`. Its body restates the change, the reason, and the evidence of its entry as bullet points, so the commit is a self-contained copy of the entry.

**Why the scope is suffixed rather than the type replaced.** Reusing the `checkpoint` type keeps session work visible to the context-recovery history query, whose pattern matches `^checkpoint.*:` — which is correct, because iteration work is part of what a later session needs to recover. The scope and the trailer keep session work separable by query alone:

```bash
git log --grep '^checkpoint(CR-XXXX):'          # core implementation only
git log --grep '^checkpoint(CR-XXXX-iterate):'  # every iteration change to one CR, across sessions
git log --grep 'Iteration: {slug}'              # every commit of one session, whatever CR it touched
git log --grep '^checkpoint.*:'                 # all of it, the default recovery view
```

**Code and evidence are committed atomically.** A checkpoint that contains code changes **MUST** also contain, in the same commit, the ledger entry for the change it embodies. Change and evidence are never separated across commits, so each entry maps to exactly one commit and that commit's diff is the evidence of what the entry changed.

**Scoped staging.** The path list passed to `/checkpoint-commit` holds only the paths the change touched and the ledger. A session **MUST NOT** stage the entire working tree.

**A superseding change that removes earlier code leaves an entry.** After the working tree is reverted to replace an earlier approach, the commit still carries its entry and its scoped subject, and is found by the trailer or by the ledger path:

```bash
git log --grep 'Iteration: {slug}' -- docs/cr/iterations/{YYYY-MM-DD}-{slug}.md
```

## Re-hydration and Concurrency

**Re-hydration after context loss.** The ledger lives on disk, so it survives context loss entirely. Recovering a cleared or new session takes exactly **one** user action — the same invocation used to open the session — after which the agent reconstructs state with no further questions:

1. Run `/checkpoint-read` to recover the most recent checkpoint.
2. Read every covered Change Request and the full ledger, including **every** entry, superseded ones alike.
3. Read the session checkpoint commits with the scoped queries: `git log --grep 'Iteration: {slug}'`, and `git log --grep '^checkpoint(CR-XXXX-iterate):'` for each covered Change Request (the only query for a legacy ledger).
4. Compare the working tree against the last commit. Uncommitted changes belong to work in flight; record them as an entry, do not adjudicate them.
5. Report the recovered state to the user: what stands now, and which approaches an entry records as superseded.

Reading the superseded entries matters as much as reading the rest: a re-hydrated agent **MUST NOT** re-propose an approach a later entry records as superseded without stating that it was already eliminated and why it is being revisited.

**Concurrency.** Two sessions may run at once, but not in the same working tree. The constraint is Git, not the ledger: staging would otherwise sweep one session's in-flight changes into the other's commit, misattributing work and cross-contaminating both ledgers. Three rules make concurrency safe:

- **One active session per working tree.** A second concurrent session runs in its own Git worktree. This is the primary isolation and the only mechanism that fully separates the two. (Creating the worktree stays with the user; the skill does not create it.)
- **Scoped staging.** A session stages **only** the paths it touched — its ledger and the files of the change in hand — and **MUST NOT** stage the entire working tree. This bounds the damage if two sessions do share a tree.
- **Explicit identification.** There is no implicit "current session". Where more than one open ledger matches an invocation, the skill refuses and lists the ledgers found rather than selecting one.

**Foreign-worktree detection.** The ledger records the working tree it was opened in. A session resumed in a working tree other than the one it records **MUST** be detected and reported to the user, rather than proceeding silently against a different tree.

**Governance reference boundary.** The ledger lives under `docs/cr/`, which is permitted territory for governance identifiers, so it may name its covered Change Requests freely. This boundary still applies to the ledger's own content: an entry describes the work and its evidence, and does not reach into the project's standing instructions, which remain prohibited territory for governance identifiers.

## Safety Rules

- **MUST NOT** perform destructive Git operations: `git reset`, `git rebase`, `git commit --amend`, `git push --force`. Reverting to supersede an earlier change is limited to the working tree.
- **MUST** refuse to open a session against a Change Request whose document does not exist, naming the unresolved identifier.
- **MUST NOT** append to a ledger whose frontmatter carries `reconciled:`.
- **MUST** refuse and list the ledgers when more than one open ledger covers the named Change Requests.
- **MUST NOT** edit, rewrite, or delete an earlier entry when a later entry supersedes it.
