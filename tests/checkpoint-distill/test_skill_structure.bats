#!/usr/bin/env bats
# Copyright Daniel Grenemark 2026
#
# Structure and workflow-content tests for the checkpoint-distill skill. These
# assert the skill files exist, are registered for release and listed for users,
# and that SKILL.md documents each load-bearing behaviour of the distillation
# workflow. Content assertions grep the skill prose so that a behaviour silently
# dropped from the workflow fails the suite.
#
# This test file and its setup helper live under a path that is NOT on the
# governance reference boundary allowlist, so every identifier placeholder here
# uses a digitless form (CR-XXXX). Writing a digit-form governance identifier
# into this file would fail the boundary test.

setup() {
    load test_helpers/setup.bash
}

@test "SKILL.md exists at correct path" {
    [ -f "$SKILL_MD" ]
}

@test "version.txt exists with valid semver content" {
    [[ "$(cat "${SKILL_DIR}/version.txt")" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]
}

@test "CHANGELOG.md exists" {
    [ -f "${SKILL_DIR}/CHANGELOG.md" ]
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

@test "SKILL.md documents Change Request scope as the default" {
    grep -qi 'Change Request scope is the default' "$SKILL_MD"
    grep -qi 'This is the default mode' "$SKILL_MD"
}

@test "SKILL.md documents branch scope delimited by merge base" {
    grep -qi 'Branch scope is delimited by the merge base' "$SKILL_MD"
    grep -qi 'merge base' "$SKILL_MD"
}

@test "SKILL.md defines no recent-commit-count mode" {
    # Positive half: the prohibition on a commit-count window is stated outright.
    grep -qi 'no.*mode that analyses an arbitrary count of most-recent commits' "$SKILL_MD"
    # Genuine-absence half: no invocation accepts a commit count. If a
    # recent-commit-count mode were ever added it would surface as an invocation
    # taking a number or a count flag after the command, so assert none exists.
    # This fails loudly the moment such a mode is introduced, rather than passing
    # merely because the prohibition prose is present.
    ! grep -qE '/checkpoint-distill[[:space:]]+(-n|--count|--last|--recent|--number|[0-9]+)' "$SKILL_MD"
}

@test "SKILL.md names all four inputs" {
    grep -qi 'Change Request document' "$SKILL_MD"
    grep -qi 'validation report' "$SKILL_MD"
    grep -qi 'iteration ledger' "$SKILL_MD"
    grep -qi 'Checkpoint commits' "$SKILL_MD"
}

@test "SKILL.md requires an availability report before findings" {
    grep -qi 'availability report' "$SKILL_MD"
    grep -qi 'precede any finding' "$SKILL_MD"
}

@test "SKILL.md documents the squash merge consequence" {
    grep -qi 'do not survive a squash merge' "$SKILL_MD"
    grep -qi 'before the branch merges' "$SKILL_MD"
}

@test "skill requires ledger findings to be ranked not copied" {
    skill_package_has 'input, not passthrough'
    skill_package_has "ledger's closing findings"
    skill_package_has 'unranked'
}

@test "SKILL.md requires reading standing instructions first" {
    grep -qi "read the project's standing instructions" "$SKILL_MD"
    grep -qi 'Before a single candidate is identified' "$SKILL_MD"
}

@test "SKILL.md documents all five candidate categories" {
    grep -qi 'Invariants' "$SKILL_MD"
    grep -qi 'Failure narratives' "$SKILL_MD"
    grep -qi 'Reusable patterns' "$SKILL_MD"
    grep -qi 'Foot-guns' "$SKILL_MD"
    grep -qi 'Drift' "$SKILL_MD"
}

@test "SKILL.md documents the three scoring dimensions" {
    grep -qi 'Leverage' "$SKILL_MD"
    grep -qi 'Decay risk' "$SKILL_MD"
    grep -qi 'cost of the rule being broken' "$SKILL_MD"
}

@test "SKILL.md documents three ranked tiers" {
    grep -qi 'Must add' "$SKILL_MD"
    grep -qi 'Recommended' "$SKILL_MD"
    grep -qi 'Optional' "$SKILL_MD"
}

@test "SKILL.md defaults to analysis without modification" {
    grep -qi 'analysis without modification' "$SKILL_MD"
}

@test "SKILL.md requires per-tier approval" {
    grep -qi 'Approval is per tier' "$SKILL_MD"
}

@test "SKILL.md offers no write-all-tiers invocation" {
    # Positive half: the prohibition on writing every tier without selection is
    # stated outright.
    grep -qi 'No invocation writes every tier without selection' "$SKILL_MD"
    # Genuine-absence half: a write-all shortcut would surface as an apply-all
    # style flag on the command. Assert no such flag exists, so this fails the
    # moment a bypass invocation is introduced rather than passing merely on the
    # presence of the prohibition prose.
    ! grep -qiE '\-\-(all|apply-all|write-all|auto|force-apply|yes)' "$SKILL_MD"
}

@test "SKILL.md requires findings to trace to a source" {
    grep -qi 'trace to a specific source artifact' "$SKILL_MD"
    grep -qi 'file location' "$SKILL_MD"
    grep -qi 'commit hash' "$SKILL_MD"
}

@test "skill requires narrative output carrying reasoning" {
    skill_package_has 'narrative prose'
    skill_package_has 'The mechanism'
    skill_package_has 'The cost of breaking it'
    skill_package_has 'The history'
}

@test "SKILL.md requires discovering the target structure" {
    grep -qi 'discovered by reading it' "$SKILL_MD"
    grep -qi 'never assumed' "$SKILL_MD"
}

@test "skill requires correcting contradicted statements" {
    skill_package_has 'corrects that statement in place'
    skill_package_has 'does not add a new, true statement alongside the stale one'
}

@test "SKILL.md forbids naming the source document in written guidance" {
    grep -qiE 'MUST NOT.*name the Change Request' "$SKILL_MD"
    grep -qi 'describes the.*practice' "$SKILL_MD"
}

@test "SKILL.md forbids deleting existing guidance" {
    grep -qi 'it never deletes' "$SKILL_MD"
    grep -qiE 'MUST NOT.*remove existing content' "$SKILL_MD"
    grep -qi 'raised as a separate finding for explicit approval' "$SKILL_MD"
}

@test "SKILL.md encodes no project-specific structure" {
    # Positive half: the portability guarantee is stated.
    grep -qi 'encodes nothing about the structure' "$SKILL_MD"
    # Genuine-absence half: to be usable unchanged in any repository the skill
    # must discover the target standing-instructions document at run time rather
    # than hardcode one. If it named a concrete standing-instructions file such
    # as AGENTS.md or CLAUDE.md as THE write target, the grep would find it and
    # the test would fail -- these tokens are exactly what a project-specific
    # encoding of the target would introduce, so this is not a vacuous check.
    ! grep -qE '(AGENTS|CLAUDE)\.md' "$SKILL_MD"
}

@test "release-please-config contains the component" {
    grep -q '"skills/checkpoint-distill"' "${REPO_ROOT}/release-please-config.json"
    grep -q '"component": "checkpoint-distill"' "${REPO_ROOT}/release-please-config.json"
}

@test "release-please-manifest contains the skill" {
    grep -q '"skills/checkpoint-distill"' "${REPO_ROOT}/.release-please-manifest.json"
}

@test "README lists the skill in Available Skills" {
    grep -q 'checkpoint-distill' "${REPO_ROOT}/README.md"
}

@test "llms.txt lists the Change Request entry" {
    # The documentation index carries an entry for this Change Request. Match it
    # by the skill slug in the linked filename rather than by its digit-form
    # identifier, which this test file may not contain under the boundary rule.
    grep -q 'checkpoint-distill' "${REPO_ROOT}/docs/llms.txt"
}

@test "SKILL.md documents refusal on an unresolvable identifier" {
    grep -qi 'refuse to run' "$SKILL_MD"
    grep -qi 'report which identifier could not be resolved' "$SKILL_MD"
}

@test "SKILL.md documents degradation to available inputs" {
    grep -qi 'Graceful Degradation' "$SKILL_MD"
    grep -qi 'degrading to the Change Request document alone' "$SKILL_MD"
}

@test "skill requires ruled-out candidates to be stated with a reason" {
    skill_package_has 'reported as ruled out, with the reason'
    skill_package_has 'never dropped silently'
}

@test "SKILL.md documents the closing checkpoint commit and landed-or-deferred report" {
    grep -qi 'checkpoint commit for the governing Change Request' "$SKILL_MD"
    grep -qi 'What landed' "$SKILL_MD"
    grep -qi 'What was deferred' "$SKILL_MD"
}

@test "SKILL.md documents idempotent re-analysis" {
    grep -qi 'idempotent' "$SKILL_MD"
    grep -qi 'proposes nothing new' "$SKILL_MD"
}

@test "skill requires cross-referencing an existing rule rather than restating it" {
    skill_package_has 'cross-references the existing rule rather than restating it'
}
