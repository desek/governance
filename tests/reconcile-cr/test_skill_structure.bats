#!/usr/bin/env bats
# Copyright Daniel Grenemark 2026
#
# Structure and content tests for the reconcile-cr skill. Content assertions
# grep the skill prose so that a load-bearing behaviour dropped from the
# procedure fails the suite.

setup() {
    load test_helpers/setup.bash
}

@test "SKILL.md exists with required frontmatter" {
    [ -f "$SKILL_MD" ]
    grep -q '^name: reconcile-cr' "$SKILL_MD"
    grep -q '^description:' "$SKILL_MD"
    grep -q '^license:' "$SKILL_MD"
    grep -q 'metadata:' "$SKILL_MD"
}

@test "SKILL.md maps entries to checkpoint commits" {
    grep -q "git log --grep 'Iteration: {slug}'" "$SKILL_MD"
    grep -qi 'Confirm each attribution against the diff of its checkpoint commit' "$SKILL_MD"
}

@test "SKILL.md shows one plan before it writes" {
    plan="$(grep -n 'Step 3: Show the reconciliation plan once' "$SKILL_MD" | cut -d: -f1)"
    rewrite="$(grep -n 'Step 4: Rewrite each covered CR in place' "$SKILL_MD" | cut -d: -f1)"
    [ -n "$plan" ] && [ -n "$rewrite" ]
    [ "$plan" -lt "$rewrite" ]
}

@test "SKILL.md creates retroactive CRs" {
    grep -q 'origin: retroactive' "$SKILL_MD"
    grep -q 'status `implemented`' "$SKILL_MD"
}

@test "SKILL.md changes no file outside docs" {
    grep -q 'MUST NOT\*\* change any file outside `docs/`' "$SKILL_MD"
}

@test "SKILL.md contains no destructive Git commands" {
    ! grep -vE '(MUST NOT|must not|do not|never|NOT)' "$SKILL_MD" | grep -qE 'git (reset|rebase|commit|push --force|amend)'
}

@test "skill is registered for release" {
    grep -q '"skills/reconcile-cr"' "${REPO_ROOT}/release-please-config.json"
    grep -q '"component": "reconcile-cr"' "${REPO_ROOT}/release-please-config.json"
    grep -q '"skills/reconcile-cr"' "${REPO_ROOT}/.release-please-manifest.json"
}
