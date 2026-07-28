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

@test "SKILL.md forbids closing while an entry is open" {
    grep -qi 'be closed while any entry remains open' "$SKILL_MD"
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
    grep -qi 'already eliminated and why it is being revisited' "$SKILL_MD"
}

@test "SKILL.md assigns recording to the agent" {
    grep -qi 'writes the ledger entry and creates the commit' "$SKILL_MD"
    grep -qi 'the agent is the recorder' "$SKILL_MD"
}

@test "SKILL.md requires evidence before disposition" {
    grep -qi 'report evidence before requesting a disposition' "$SKILL_MD"
    grep -qi 'disposition is requested, so the verdict is rendered against observed behaviour' "$SKILL_MD"
}

@test "SKILL.md documents the re-hydration procedure" {
    grep -qi 'Re-hydration after context loss' "$SKILL_MD"
    grep -qi 'Read the governing Change Request and the full ledger' "$SKILL_MD"
    grep -qi 'Read the checkpoint commits for that Change Request' "$SKILL_MD"
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
