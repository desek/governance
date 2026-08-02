---
name: checkpoint-iterate
description: Slash command that runs a last-mile iteration session against an implemented Change Request. Opens a roll-forward ledger, records each change with what was done, why it was tried, and what the evidence showed, notes where a later change supersedes an earlier one, and checkpoint-commits code continuously. Trigger with /checkpoint-iterate CR-XXXX.
license: Apache-2.0
metadata:
  copyright: Copyright Daniel Grenemark 2026
  version: "0.0"
---

# /checkpoint-iterate

Runs an **iteration session** that closes the last-mile gap between an implemented Change Request and the behaviour that was actually wanted. A specification is written before the code exists, so the delivered result is approximately right rather than exactly right. Closing that gap is an interactive loop the user drives: the user names what to try, the agent makes the change and reports what it observed, the user says what to try next. This skill records that loop as a **roll-forward ledger** at `docs/cr/{CR_ID}-iterate.md`, so the reasoning — including every approach a later change superseded — survives the session instead of evaporating with the agent's context.

**Usage:**

| Invocation | Effect |
|---|---|
| `/checkpoint-iterate CR-XXXX` | Opens a session against that Change Request, or resumes one already open |

That is the whole surface. There is **no** close sub-command and **no** status sub-command, because neither would tell anyone anything the repository does not already hold. The ledger is a tracked document with a Git history: what the session has recorded is in the file, and when each entry landed is in `git log`. A session ends when the user stops iterating, which needs no ceremony to announce.

Every invocation **MUST** identify its governing Change Request. There is no implicit "current session".

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

### Step 1: Resolve and Validate the Governing Change Request

Read the identifier from `$ARGUMENTS`.

- Confirm the governing Change Request document exists at `docs/cr/{CR_ID}-*.md`.
- **If the document does not exist:** refuse to open a session against a Change Request whose document does not exist, report which identifier could not be resolved, and **STOP**. No ledger is created for an unresolved identifier.
- **If the identifier is omitted** and more than one ledger exists in the working tree: refuse to act, list the ledgers found, and **STOP** rather than guessing which session is meant.

### Step 2: Create or Resume the Ledger

Check for an existing ledger at `docs/cr/{CR_ID}-iterate.md`.

- **If none exists:** create it from the bundled template at `templates/ITERATE.md`. Record in its frontmatter the governing Change Request, the start date, the branch and commit the session starts from, and the working tree it was opened in. The ledger carries no lifecycle status, because nothing sets one.
- **If one exists:** resume it. Append to the existing ledger — **MUST NOT** recreate, rewrite, or remove any previously recorded entry. Resuming reconstructs session state without asking the user further questions. A ledger the user stopped iterating on months ago resumes exactly like one abandoned an hour ago: the entries say what stands, and appending to them is the only thing a session ever does.

When resuming, before proposing any new change the agent reads the governing Change Request and every entry in the ledger, then reports the recovered state: what stands now, and which approaches an entry records as superseded. An approach an earlier entry records as superseded **MUST NOT** be proposed again without stating that it was already eliminated and why it is being revisited.

### Step 3: Loop Over Changes

The loop has four movements, and the user paces it. Repeat until the user says the session is done.

1. The user says what to try next.
2. The agent makes the code change for that idea and runs the project's checks (`bats -r tests/`).
3. The agent appends the ledger entry — what was changed, why it was tried, and what the evidence showed — and, where the change undoes or replaces earlier work, names the earlier entry it supersedes and why. It then creates the commit, on its own initiative, through the existing checkpoint commit workflow.
4. The agent waits for the user's next instruction.

The agent does not pause to ask for a verdict, a disposition, or a classification: anything left in the working tree is kept, and the only reversal the ledger records is a later entry superseding an earlier one. A superseded entry is never deleted from the ledger — retaining it is the entire point, because it is the failure narrative that exists nowhere else.

**The session ends when the user stops.** Nothing marks it closed, and nothing needs to: the last entry is the last entry, and `git log` says when it landed. Asked at any point what the session has done, the agent answers by reading the ledger it is already maintaining, which is the same answer a status command would have produced at the cost of a command to remember.

The session draws no conclusions from its own ledger: it writes no patterns, no anti-patterns, and no distillation, and it neither invokes nor depends on any other skill. A ledger holds what was done, why, and what stands, and that is a complete input for a later, deliberate distillation the user runs when they choose to.

## Commit Protocol

Code changes made during a session are committed continuously through the existing checkpoint commit workflow (`/checkpoint-commit`), without waiting to be asked. The session does not invent a parallel commit mechanism; it reuses the checkpoint one and distinguishes its commits by **scoping the identifier**, not by changing the type.

**Every session commit uses the scoped subject form:**

```text
checkpoint({CR_ID}-iterate): {summary}
```

The unsuffixed form `checkpoint({CR_ID}): {summary}` **MUST NOT** be used by a session — it is reserved for the core agentic implementation workflow.

**Why the scope is suffixed rather than the type replaced.** Reusing the `checkpoint` type keeps session work visible to the context-recovery history query, whose pattern matches `^checkpoint.*:` — which is correct, because iteration work is part of what a later session needs to recover. The `-iterate` suffix on the scope keeps session work separable from implementation work by a subject-line query alone:

```bash
git log --grep '^checkpoint(CR-XXXX):'          # core implementation only
git log --grep '^checkpoint(CR-XXXX-iterate):'  # iteration session only
git log --grep '^checkpoint.*:'                 # both, the default recovery view
```

**Code and evidence are committed atomically.** A checkpoint that contains code changes **MUST** also contain, in the same commit, the ledger entry for the change it embodies. Change and evidence are never separated across commits.

**A superseding change that removes earlier code leaves an entry.** After the working tree is reverted to replace an earlier approach, its commit touches the ledger alone — still a session checkpoint carrying the same scoped subject, identified by the path it changed rather than by a different subject convention:

```bash
git log --grep '^checkpoint(CR-XXXX-iterate):' -- docs/cr/CR-XXXX-iterate.md
```

## Re-hydration and Concurrency

**Re-hydration after context loss.** The ledger lives on disk, so it survives context loss entirely. Recovering a cleared or new session takes exactly **one** user action — the same invocation used to open the session — after which the agent reconstructs state with no further questions:

1. Read the governing Change Request and the full ledger, including **every** entry, superseded ones alike.
2. Read the checkpoint commits for that Change Request via the context-recovery history query.
3. Compare the working tree against the last commit. Uncommitted changes belong to work in flight; record them as an entry, do not adjudicate them.
4. Report the recovered state to the user: what stands now, and which approaches an entry records as superseded.

Reading the superseded entries matters as much as reading the rest: a re-hydrated agent **MUST NOT** re-propose an approach a later entry records as superseded without stating that it was already eliminated and why it is being revisited.

**Concurrency.** Two sessions may run at once, but not in the same working tree. The constraint is Git, not the ledger: the checkpoint staging would otherwise sweep one session's in-flight changes into the other's commit, misattributing work and cross-contaminating both ledgers. Three rules make concurrency safe:

- **One active session per working tree.** A second concurrent session runs in its own Git worktree. This is the primary isolation and the only mechanism that fully separates the two. (Creating the worktree stays with the user; the skill does not create it.)
- **Scoped staging.** A session stages **only** the paths it touched — its ledger and the files of the change in hand — and **MUST NOT** stage the entire working tree. This bounds the damage if two sessions do share a tree.
- **Explicit identification.** Every invocation names its Change Request; there is no implicit "current session". Where an invocation omits the identifier and more than one ledger exists in the working tree, the skill refuses and lists the ledgers found rather than selecting one.

**Foreign-worktree detection.** The ledger records the working tree it was opened in. A session resumed in a working tree other than the one it records **MUST** be detected and reported to the user, rather than proceeding silently against a different tree.

**Governance reference boundary.** The ledger lives under `docs/cr/`, which is permitted territory for governance identifiers, so it may name its governing Change Request freely. This boundary still applies to the ledger's own content: an entry describes the work and its evidence, and does not reach into the project's standing instructions, which remain prohibited territory for governance identifiers.

## Safety Rules

- **MUST NOT** perform destructive Git operations: `git reset`, `git rebase`, `git commit --amend`, `git push --force`. Reverting to supersede an earlier change is limited to the working tree.
- **MUST** refuse to open a session against a Change Request whose document does not exist, naming the unresolved identifier.
- **MUST NOT** edit, rewrite, or delete an earlier entry when a later entry supersedes it.
