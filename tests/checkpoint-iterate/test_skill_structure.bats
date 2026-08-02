#!/usr/bin/env bats
# Copyright Daniel Grenemark 2026
#
# Structure and workflow-content tests for the checkpoint-iterate skill. These
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

@test "release-please-config contains checkpoint-iterate component" {
    grep -q '"skills/checkpoint-iterate"' "${REPO_ROOT}/release-please-config.json"
    grep -q '"component": "checkpoint-iterate"' "${REPO_ROOT}/release-please-config.json"
}

@test "release-please-manifest contains the skill" {
    grep -q '"skills/checkpoint-iterate"' "${REPO_ROOT}/.release-please-manifest.json"
}

@test "README lists the skill in Available Skills" {
    grep -q 'checkpoint-iterate' "${REPO_ROOT}/README.md"
}

@test "SKILL.md documents all three invocation forms" {
    # Open/resume, close, and status must each be specified. The open form is the
    # bare invocation with an identifier; close and status are named sub-commands.
    grep -q 'checkpoint-iterate close' "$SKILL_MD"
    grep -q 'checkpoint-iterate status' "$SKILL_MD"
    grep -qi 'Opens a session' "$SKILL_MD"
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
    grep -qi 'list the open ledgers' "$SKILL_MD"
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
    grep -qi 'Read the governing Change Request and the full ledger' "$SKILL_MD"
    grep -qi 'Read the checkpoint commits for that Change Request' "$SKILL_MD"
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

@test "SKILL.md documents a close of status and date only" {
    grep -qi 'setting the ledger status to closed and recording the closing date' "$SKILL_MD"
    grep -qi 'nothing further' "$SKILL_MD"
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
    # checkpoint-iterate row and assert it carries no disposition wording.
    row="$(grep 'checkpoint-iterate' "${REPO_ROOT}/README.md")"
    ! echo "$row" | grep -qiE 'disposition|discarded|partially-kept'
}

@test "SKILL.md frontmatter description omits disposition and distillation" {
    # The retuned frontmatter no longer names the removed behaviour: no
    # disposition vocabulary and no session distillation.
    desc="$(grep '^description:' "$SKILL_MD")"
    ! echo "$desc" | grep -qiE 'disposition|discarded|partially-kept|distil'
}
