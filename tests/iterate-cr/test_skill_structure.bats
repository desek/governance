#!/usr/bin/env bats
# Copyright Daniel Grenemark 2026
#
# Structure and workflow-content tests for the iterate-cr skill. These
# assert the skill files exist, are registered for release and listed for users,
# and that SKILL.md documents each load-bearing behaviour of the iteration
# session workflow. Content assertions grep the skill prose so that a behaviour
# silently dropped from the workflow fails the suite.

setup() {
    load test_helpers/setup.bash
}

@test "SKILL.md exists at correct path" {
    [ -f "$SKILL_MD" ]
}

@test "version.txt exists with valid semver content" {
    [[ "$(cat "${SKILL_DIR}/version.txt")" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]
}

@test "SKILL.md frontmatter has required fields" {
    grep -q '^name:' "$SKILL_MD"
    grep -q '^description:' "$SKILL_MD"
    grep -q '^license:' "$SKILL_MD"
    grep -q 'metadata:' "$SKILL_MD"
}

@test "SKILL.md contains no destructive Git commands" {
    # Filter out lines that document prohibitions (MUST NOT / do not / never),
    # then assert no surviving line issues a destructive Git operation.
    ! grep -vE '(MUST NOT|must not|do not|never|NOT)' "$SKILL_MD" | grep -qE 'git (reset|rebase|commit|push --force|amend)'
}

@test "release-please-config contains iterate-cr component" {
    grep -q '"skills/iterate-cr"' "${REPO_ROOT}/release-please-config.json"
    grep -q '"component": "iterate-cr"' "${REPO_ROOT}/release-please-config.json"
}

@test "release-please-manifest contains the skill" {
    grep -q '"skills/iterate-cr"' "${REPO_ROOT}/.release-please-manifest.json"
}

@test "README lists the skill in Available Skills" {
    grep -q 'iterate-cr' "${REPO_ROOT}/README.md"
}

@test "SKILL.md accepts zero, one, or many CRs" {
    grep -q '^| `/iterate-cr` |' "$SKILL_MD"
    grep -q '^| `/iterate-cr CR-XXXX` |' "$SKILL_MD"
    grep -q '^| `/iterate-cr CR-XXXX CR-YYYY` |' "$SKILL_MD"
}

@test "SKILL.md requires every named CR to resolve" {
    grep -qi 'Every named Change Request \*\*MUST\*\* resolve' "$SKILL_MD"
    grep -qi 'No ledger is created when any identifier is unresolved' "$SKILL_MD"
}

@test "SKILL.md opens an exploration ledger with an empty crs list" {
    grep -qi 'exploration' "$SKILL_MD"
    grep -q 'an empty list for exploration' "$SKILL_MD"
}

@test "SKILL.md creates the ledger under docs/cr/iterations" {
    grep -q 'docs/cr/iterations/{YYYY-MM-DD}-{slug}.md' "$SKILL_MD"
}

@test "SKILL.md attributes each entry to a CR or none" {
    grep -q '`CR:` field' "$SKILL_MD"
    grep -q 'literal `none`' "$SKILL_MD"
}

@test "SKILL.md refuses to append to a reconciled ledger" {
    grep -qE 'MUST NOT\*\* append to a ledger whose frontmatter carries `reconciled:`' "$SKILL_MD"
    grep -qi 'open a new session' "$SKILL_MD"
}

@test "SKILL.md resumes a legacy ledger" {
    grep -q 'docs/cr/{CR_ID}-iterate.md' "$SKILL_MD"
    grep -qi 'legacy ledger is resumed in place' "$SKILL_MD"
}

@test "SKILL.md refuses ambiguous ledgers" {
    grep -qi 'more than one open ledger covers the named Change Requests' "$SKILL_MD"
}

@test "SKILL.md commits through checkpoint-commit" {
    grep -q '/checkpoint-commit' "$SKILL_MD"
    grep -qi 'in the same commit, the ledger entry' "$SKILL_MD"
}

@test "SKILL.md scopes commits by attribution" {
    grep -q 'checkpoint(CR-XXXX-iterate)' "$SKILL_MD"
    grep -q 'checkpoint(iterate-' "$SKILL_MD"
    grep -q 'Iteration: {slug}' "$SKILL_MD"
    grep -qi 'restates the change, the reason, and the evidence' "$SKILL_MD"
}

@test "SKILL.md re-hydrates from ledger and checkpoints" {
    grep -q 'Run `/checkpoint-read`' "$SKILL_MD"
    grep -q "git log --grep 'Iteration: {slug}'" "$SKILL_MD"
}

@test "SKILL.md defines no close or status sub-command" {
    # Genuine absence. Neither sub-command reports anything the tracked ledger
    # and its Git history do not already hold, so both cost a command to
    # remember and return nothing for it.
    ! grep -q 'iterate-cr close' "$SKILL_MD"
    ! grep -q 'iterate-cr status' "$SKILL_MD"
}

@test "SKILL.md documents refusing a missing Change Request" {
    grep -qi 'refuse to open a session against a Change Request whose document does not exist' "$SKILL_MD"
    grep -qi 'report which identifier could not be resolved' "$SKILL_MD"
}

@test "SKILL.md documents resume rather than restart" {
    grep -qi 'resume it' "$SKILL_MD"
    grep -qi 'recreate, rewrite, or remove any previously recorded entry' "$SKILL_MD"
}

@test "SKILL.md states the session is user-initiated and never auto-started" {
    grep -qi 'Initiation is user-only' "$SKILL_MD"
    grep -qi 'spawned by the implementation pipeline' "$SKILL_MD"
}

@test "SKILL.md documents refusing an ambiguous invocation" {
    grep -qi 'list the ledgers found' "$SKILL_MD"
    grep -qi 'rather than guessing which session is meant' "$SKILL_MD"
}

@test "SKILL.md documents foreign-worktree detection" {
    grep -qi 'Foreign-worktree detection' "$SKILL_MD"
    grep -qi 'resumed in a working tree other than the one it records' "$SKILL_MD"
}

@test "SKILL.md forbids silently retrying an eliminated approach" {
    # Retuned to the roll-forward model: the prohibition binds to an approach a
    # later entry records as SUPERSEDED, not to a discarded disposition.
    grep -qi 'records as superseded' "$SKILL_MD"
    grep -qi 'already eliminated and why it is being revisited' "$SKILL_MD"
}

@test "SKILL.md assigns recording to the agent" {
    # Retuned Role Split: the agent writes the entry and commits as a side effect
    # of the work, not as a separate verdict-then-write step.
    grep -qi 'side effect of that work' "$SKILL_MD"
    grep -qi 'writes the ledger entry and creates the commit' "$SKILL_MD"
    grep -qi 'the agent is the recorder' "$SKILL_MD"
}

@test "SKILL.md records the evidence the entry observed" {
    grep -qi 'what the evidence showed' "$SKILL_MD"
}

@test "SKILL.md documents the re-hydration procedure" {
    grep -qi 'Re-hydration after context loss' "$SKILL_MD"
    grep -qi 'Read every covered Change Request and the full ledger' "$SKILL_MD"
    grep -qi 'Read the session checkpoint commits' "$SKILL_MD"
    # Retuned recovery: uncommitted work is recorded as an entry, not reconciled
    # as an open entry, since entry states no longer exist.
    grep -qi 'record them as an entry' "$SKILL_MD"
    grep -qi 'do not adjudicate' "$SKILL_MD"
}

@test "SKILL.md requires worktree isolation for concurrent sessions" {
    grep -qi 'One active session per working tree' "$SKILL_MD"
    grep -qi 'own Git worktree' "$SKILL_MD"
}

@test "SKILL.md forbids staging the whole working tree" {
    grep -qi 'Scoped staging' "$SKILL_MD"
    grep -qi 'stage the entire working tree' "$SKILL_MD"
}

@test "SKILL.md specifies the scoped checkpoint subject form" {
    # The session commit subject scopes the identifier with the -iterate suffix.
    grep -q 'checkpoint({CR_ID}-iterate)' "$SKILL_MD"
}

@test "SKILL.md reserves the unsuffixed form for the implementation workflow" {
    grep -qi 'reserved for the core agentic implementation workflow' "$SKILL_MD"
}

# --- Roll-forward model assertions (CR-XXXX) ---------------------------------
# The retuned iteration session replaces the disposition machinery with a
# roll-forward ledger. The tests below pin each load-bearing property of that
# model, so a behaviour silently reverted to the old disposition form fails.

@test "SKILL.md states that a change left in the tree is kept" {
    grep -qi 'Kept is implicit' "$SKILL_MD"
    grep -qi 'left in the working tree stands' "$SKILL_MD"
}

@test "SKILL.md documents supersession naming the earlier entry" {
    grep -qi 'names the earlier entry it supersedes' "$SKILL_MD"
    grep -qi 'why the earlier work no longer stands' "$SKILL_MD"
}

@test "SKILL.md forbids editing a superseded entry" {
    grep -qiE 'MUST NOT.*edit, rewrite, or delete an earlier entry' "$SKILL_MD"
}

@test "SKILL.md requests no disposition from the user" {
    grep -qi 'does not pause to ask for a verdict, a disposition, or a classification' "$SKILL_MD"
}

@test "SKILL.md defines no disposition vocabulary" {
    # Genuine absence: the retuned skill defines no required entry field valued
    # kept, discarded, or partially-kept. If the three-word vocabulary were
    # reintroduced as a required field it would surface here.
    ! grep -qi 'partially-kept' "$SKILL_MD"
    ! grep -qi 'kept, discarded' "$SKILL_MD"
}

@test "SKILL.md defines no open or settled entry state" {
    # Genuine absence: entry states are gone. "open" legitimately survives for a
    # session's status, but no entry carries a settled state.
    ! grep -qi 'settled' "$SKILL_MD"
    ! grep -qi 'open or settled' "$SKILL_MD"
}

@test "SKILL.md ends the session without a closing ceremony" {
    # The session ends when the user stops. The record of that is the ledger
    # itself plus its Git history, not a status field a command must set.
    grep -qi 'The session ends when the user stops' "$SKILL_MD"
    grep -qi 'Nothing marks it closed' "$SKILL_MD"
}

@test "SKILL.md performs no distillation" {
    grep -qi 'writes no patterns, no anti-patterns, and no distillation' "$SKILL_MD"
}

@test "SKILL.md declares no dependency on the distillation skill" {
    grep -qi 'neither invokes nor depends on any other skill' "$SKILL_MD"
    # Genuine absence: the close-time hand-off is gone, so the sibling skill is
    # not named anywhere in the workflow.
    ! grep -qi 'checkpoint-distill' "$SKILL_MD"
}

@test "SKILL.md states the session is paced by the user" {
    grep -qi 'until the user says the session is done' "$SKILL_MD"
}

@test "SKILL.md retains the safety rules" {
    grep -qi 'destructive Git operations' "$SKILL_MD"
    grep -qi 'refuse to open a session against a Change Request whose document does not exist' "$SKILL_MD"
    grep -qi 'One active session per working tree' "$SKILL_MD"
    grep -qi 'Scoped staging' "$SKILL_MD"
    grep -qi 'Foreign-worktree detection' "$SKILL_MD"
}

@test "README iterate row describes no disposition" {
    # The user-facing listing drops disposition language. Isolate the
    # iterate-cr row and assert it carries no disposition wording.
    row="$(grep -F '[iterate-cr]' "${REPO_ROOT}/README.md")"
    ! echo "$row" | grep -qiE 'disposition|discarded|partially-kept'
}

@test "SKILL.md frontmatter description omits disposition and distillation" {
    # The retuned frontmatter no longer names the removed behaviour: no
    # disposition vocabulary and no session distillation.
    desc="$(grep '^description:' "$SKILL_MD")"
    ! echo "$desc" | grep -qiE 'disposition|discarded|partially-kept|distil'
}
