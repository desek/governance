---
name: reconcile-cr
description: Slash command that reconciles one iteration ledger into governance. Derives what stands from the ledger and its checkpoint commits, shows one reconciliation plan, rewrites each covered Change Request in place to describe the standing behaviour, records a Reconciliation section, creates a retroactive Change Request for unattributed changes, and closes the ledger. Changes no code. Trigger with /reconcile-cr [ledger path or slug].
license: Apache-2.0
metadata:
  copyright: Copyright Daniel Grenemark 2026
  version: "0.0.1"
---

# /reconcile-cr

Reconciles one **iteration ledger** into governance. An iteration session rolls forward: the code that stands after it is the ground truth, and the Change Requests it covered still describe the behaviour first specified. This skill rewrites those Change Requests so that they describe what stands, records each divergence, and writes a **retroactive CR** for every standing change that no covered Change Request describes. The checkpoint commits are the evidence; the ledger is the narrative.

## Invocation

| Command | Behaviour |
|---------|-----------|
| `/reconcile-cr` | Uses the single unreconciled ledger in the tree. With more than one, refuse and list them. With none, report that nothing is to reconcile. |
| `/reconcile-cr {ledger path}` | Reconciles the ledger at that path. |
| `/reconcile-cr {slug}` | Reconciles the ledger `docs/cr/iterations/{YYYY-MM-DD}-{slug}.md`. |

An unreconciled ledger is a ledger under `docs/cr/iterations/`, or a legacy ledger at `docs/cr/CR-XXXX-iterate.md`, whose frontmatter has no `reconciled:` field. A ledger that already carries `reconciled:` is refused.

### Legacy ledgers

A legacy ledger at `docs/cr/CR-XXXX-iterate.md` is accepted. Every entry is treated as attributed to `CR-XXXX`, and its checkpoint commits are the `checkpoint(CR-XXXX-iterate)` commits.

### Exploration ledgers

A ledger whose `crs` list is empty is an exploration ledger. Every standing change of an exploration ledger goes into a retroactive CR.

## Procedure

### Step 1: Derive what stands

1. Read the ledger entries in order. Honour every supersession: an entry that a later entry supersedes does not stand, except for the part the superseding entry says it left alone.
2. Map each entry to the checkpoint commit that added it, with `git log --grep 'Iteration: {slug}'`, or for a legacy ledger with `git log --grep '^checkpoint(CR-XXXX-iterate)'`.
3. Compare the derived state with the working tree. Run `git status --porcelain` on the files that the ledger entries touch. If any such file has uncommitted changes, refuse to reconcile, name those files, and change no document. The ground truth must be committed.

### Step 2: Route each standing change

1. Group the standing changes by their attribution: a covered CR or `none`.
2. Confirm each attribution against the diff of its checkpoint commit (`git show {sha}`).
3. A change whose attribution is ambiguous, or which touches the behaviour of two CRs, is routed to the CR whose requirements it changes. List that routing in the plan.

### Step 3: Show the reconciliation plan once

Before any document is written, show one table: each covered CR, the requirements, acceptance criteria, and scope items that change, and each retroactive CR that will be created. Each row names the ledger entry and the short SHA of its checkpoint commit. Wait for one user answer. This is the only stop of the procedure; it exists because a misrouted change rewrites the wrong governance document. No file under `docs/` changes before the user answers.

### Step 4: Rewrite each covered CR in place

1. Change the Proposed Change, Requirements, Scope Boundaries, Acceptance Criteria, and Model-Based Testing sections so that they describe the behaviour that stands.
2. Add each superseded approach to Alternative Approaches Considered of the CR it was attributed to, with the reason the ledger gives.
3. Do not keep the original text inline. Git history holds it.

### Step 5: Record the reconciliation

1. Add a Reconciliation section to each rewritten CR, from the governance CR template: one row per divergence, with the original statement in short form, the reconciled statement, the ledger entry, and the short SHA of its checkpoint commit.
2. Update the frontmatter `date` and set `reconciled:`. The status stays `implemented`.

### Step 6: Create a retroactive CR for unattributed changes

Changes attributed `none`, and every standing change of an exploration ledger, go into a new CR made from the governance CR template, with status `implemented`, frontmatter `origin: retroactive`, and the ledger path in Related Items. The retroactive CR is a complete CR, with requirements and Gherkin acceptance criteria that the standing code satisfies.

### Step 7: Keep Layer 2 consistent

When a document under `docs/specification/` already describes behaviour that the reconcile changes, update that document in the same commit. Do not create a new Layer 2 document.

### Step 8: Close the ledger

1. Set `reconciled:` (the date) and `reconciled-into:` (the list of rewritten and retroactive CR identifiers) in the ledger frontmatter.
2. Stage only the documents this reconcile changed, by path, and commit them with the subject `docs(cr): reconcile {CR-IDs} with iteration {slug}`.

## Safety Rules

- `/reconcile-cr` **MUST NOT** change any file outside `docs/`. Its output is governance documents only.
- `/reconcile-cr` **MUST NOT** change code.
- `/reconcile-cr` **MUST NOT** run destructive Git operations: no reset, rebase, amend, force push, or checkout that discards changes.
- `/reconcile-cr` **MUST NOT** write any document before the user answers the plan of Step 3.
- `/reconcile-cr` **MUST NOT** stage the entire working tree.
