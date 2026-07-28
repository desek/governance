---
name: checkpoint-iterate
description: Slash command that runs a last-mile iteration session against an implemented Change Request. Opens an attempt ledger, records every attempt with an explicit kept, discarded, or partially-kept disposition, checkpoint-commits code continuously, and closes by distilling the session into patterns and anti-patterns. Trigger with /checkpoint-iterate [CR-XXXX], /checkpoint-iterate close CR-XXXX, or /checkpoint-iterate status CR-XXXX.
license: Apache-2.0
metadata:
  copyright: Copyright Daniel Grenemark 2026
  version: "0.1"
---

# /checkpoint-iterate

Runs an **iteration session** that closes the last-mile gap between an implemented Change Request and the behaviour that was actually wanted. A specification is written before the code exists, so the delivered result is approximately right rather than exactly right. Closing that gap is an interactive loop: the user names what to try, the agent makes the change and reports the evidence, the user renders the verdict. This skill records that loop in a ledger at `docs/cr/{CR_ID}-iterate.md`, so the reasoning — including every discarded attempt — survives the session instead of evaporating with the agent's context.

**Usage:**

| Invocation | Effect |
|---|---|
| `/checkpoint-iterate CR-XXXX` | Opens a session against that Change Request, or resumes one already open |
| `/checkpoint-iterate close CR-XXXX` | Closes the active session and distils the ledger |
| `/checkpoint-iterate status CR-XXXX` | Reports the active session, its attempt count, and its dispositions so far |

Every invocation **MUST** identify its governing Change Request. There is no implicit "current session".

## Role Split

The division of labour governs every step below. It is fixed and **MUST NOT** be reassigned.

- **The user** initiates the session, names each thing to try next, and renders the verdict on each result. The verdict is the user's judgment; the agent records it and **MUST NOT** infer, assume, propose, or substitute its own.
- **The agent** makes the code change, runs the project's checks, reports the evidence, then writes the ledger entry and creates the commit. The agent is the recorder for every attempt, because it is the party present at all of them and already writing to the repository.

The user is therefore never asked to maintain a notebook alongside the work. Their contribution is direction and judgment; the recording is a side effect of the work the agent was already doing.

**Initiation is user-only.** A session **MUST** be opened by explicit user invocation. It **MUST NOT** be started automatically, and **MUST NOT** be spawned by the implementation pipeline. The whole point is that a human has looked at the delivered result and judged it not yet right.

## Workflow

Follow these steps in order.

### Step 1: Resolve and Validate the Governing Change Request

Read the identifier from `$ARGUMENTS` (for `close` and `status`, it follows the sub-command word).

- Confirm the governing Change Request document exists at `docs/cr/{CR_ID}-*.md`.
- **If the document does not exist:** refuse to open a session, report which identifier could not be resolved, and **STOP**. No ledger is created for an unresolved identifier.
- **If the identifier is omitted** and more than one ledger is open in the working tree: refuse to act, list the open ledgers, and **STOP** rather than guessing which session is meant.

### Step 2: Create or Resume the Ledger

Check for an existing ledger at `docs/cr/{CR_ID}-iterate.md`.

- **If none exists:** create it from the bundled template at `templates/ITERATE.md`. Record in its frontmatter the governing Change Request, an open status, the start date, the branch and commit the session starts from, and the working tree it was opened in.
- **If one exists and is open:** resume it. Append to the existing ledger — **MUST NOT** recreate, rewrite, or remove any previously recorded entry. Resuming reconstructs session state without asking the user further questions.

When resuming, before proposing any new attempt the agent reads the governing Change Request and every settled entry in the ledger, including discarded ones, then reports the recovered state: what has been settled, what approaches were eliminated, and what was in flight. An approach a settled entry records as `discarded` **MUST NOT** be proposed again without stating that it was already eliminated and why it is being revisited.

### Step 3: Loop Over Attempts

Each attempt is one pass through this loop. Repeat until the user closes the session.

1. **The user names the next thing to try.**
2. **The agent makes the code change** for that hypothesis and **runs the project's checks** (`bats -r tests/`).
3. **The agent reports the verification evidence to the user** — what was changed, what the checks produced. Evidence is reported **BEFORE** a disposition is requested, so the verdict is rendered against observed behaviour rather than an expectation.
4. **The user renders the verdict:** keep, discard, or keep part.
5. **The agent writes the ledger entry**, recording the hypothesis, the surface touched, the evidence, and the disposition — which is exactly one of `kept`, `discarded`, or `partially-kept`. The recorded disposition is the one the user supplied, transcribed verbatim; the agent does not infer it.
6. **The agent creates the commit** on its own initiative, without waiting to be asked, using the existing checkpoint commit workflow.

A `discarded` entry is never deleted from the ledger — retaining it is the entire point, because it is anti-pattern evidence that exists nowhere else.

### Step 4: Status

On a `status` invocation, report the active session for the given Change Request, its attempt count, and the dispositions recorded to date. Read-only: report state without modifying the ledger or Git.

### Step 5: Close

On a `close` invocation, end the session and distil the ledger. A session **MUST NOT** be closed while any entry remains open; report the open entry as requiring a disposition and stop. The full commit protocol and closing distillation are specified in the sections added below.

## Safety Rules

- **MUST NOT** perform destructive Git operations: `git reset`, `git rebase`, `git commit --amend`, `git push --force`. Reverting a discarded attempt is limited to the working tree.
- **MUST** record the user's verdict verbatim and **MUST NOT** infer, assume, or substitute a disposition.
- **MUST** report evidence before requesting a disposition.
- **MUST** refuse to open a session against a Change Request whose document does not exist, naming the unresolved identifier.
