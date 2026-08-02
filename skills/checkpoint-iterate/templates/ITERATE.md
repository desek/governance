---
name: iterate-ledger
description: Session ledger for a last-mile iteration session against an implemented Change Request. Records each attempt as what changed, why it was tried, and the evidence observed, names any earlier entry a later one supersedes, and derives what currently stands from the entries.
cr: "CR-XXXX"
opened: "{YYYY-MM-DD when the session was opened}"
source-branch: "{Git branch the session started from, from `git rev-parse --abbrev-ref HEAD`}"
source-commit: "{short commit hash the session started from, from `git rev-parse --short HEAD`}"
worktree: "{absolute path of the working tree the session was opened in, from `git rev-parse --show-toplevel`}"
---

<!--
=============================================================================
ITERATION SESSION LEDGER
=============================================================================

This ledger is maintained by the agent during a last-mile iteration session.
It is the sole durable record of session state: it survives context loss, so a
fresh agent reconstructs the session from this file plus the checkpoint commits
alone.

ROLL FORWARD. The session moves in one direction. Each entry records work the
agent did: what changed, why it was tried, and what the evidence showed. A
change left in the working tree is KEPT, implicitly and without confirmation —
that is what "left in the tree" means. Nothing asks the user to classify or
confirm an entry.

SUPERSESSION. When a later change undoes or replaces earlier work, the new entry
names the earlier entry it supersedes and states why the earlier work no longer
stands. A partial reversal needs no special field: the superseding entry says in
prose what it replaced and what it left alone, because that describes the work
rather than classifies it.

APPEND-ONLY (entries). Entries are append-only within a session. Never delete,
rewrite, or overwrite an earlier entry, even when a later entry supersedes it. A
superseded attempt is retained in full: it is the record of an approach that was
tried, which exists nowhere else, and removing it defeats the purpose of the
ledger. The "What Stands Now" section below is the sole exception to append-only
— it is regenerated, not appended.

NO LIFECYCLE. There is no status field and no closing date, because no command
sets one. The session ends when the user stops iterating; the last entry is the
last entry, and `git log` on this file says when each one landed.

FRONTMATTER. No `metadata.copyright` or `metadata.version` field appears in this
frontmatter, consistent with the convention for documents under `docs/cr/`.
=============================================================================
-->

# Iteration Session Ledger: {short title of what this session is closing}

## Session Context

<!--
What this session is trying to close, and the state it starts from. Reference
the governing Change Request rather than restating it: the CR records what was
specified beforehand, this ledger records what was attempted afterwards.
-->

* **Governing Change Request:** CR-XXXX — {one-line reminder of what it delivered}
* **Gap being closed:** {what about the delivered implementation is not yet what was wanted}
* **Starting point:** branch `{source-branch}` at commit `{source-commit}`, working tree `{worktree}`

## Attempt Ledger

<!--
One numbered entry per attempt, in the order attempted. Each entry is readable
in isolation: a reader recovering context can understand any single attempt
without reading the whole ledger.

Copy the shape below for each new attempt. Append the entry after the agent has
made the change and run the checks. Never edit an earlier entry.
-->

### Attempt 1 — {short name of what was tried}

* **Change:** {what was changed — the files or surfaces touched, and what was done to them}
* **Reason:** {why it was tried — the gap it aims to close, and why this change should close it}
* **Evidence:** {the observed behaviour after the change — checks run, output seen, what the evidence shows}
* **Supersedes:** {optional — the earlier attempt this change undoes or replaces, and why that earlier work no longer stands. Omit when this attempt supersedes nothing.}

## What Stands Now

<!--
DERIVED, not appended. This section is regenerated from the entries above: read
them in order, honour every supersession, and state what currently stands as a
result. It is the one part of the ledger exempt from the append-only rule, and
it is rewritten in place whenever the entries change. Keep it short — it is a
summary of the entry list, never a substitute for it.
-->

* {the current state of the working tree, derived by reading the entries in order and honouring their supersessions}
