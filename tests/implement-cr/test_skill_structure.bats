#!/usr/bin/env bats
# Copyright Daniel Grenemark 2026
#
# Structure and content tests for the implement-cr skill.

setup() {
    load test_helpers/setup.bash
}

@test "SKILL.md exists with required frontmatter" {
    [ -f "$SKILL_MD" ]
    grep -q '^name: implement-cr' "$SKILL_MD"
    grep -q '^description:' "$SKILL_MD"
    grep -q '^license:' "$SKILL_MD"
    grep -q 'metadata:' "$SKILL_MD"
    grep -q '^argument-hint:' "$SKILL_MD"
}

@test "SKILL.md stays under 500 lines" {
    [ "$(wc -l < "$SKILL_MD")" -lt 500 ]
}

@test "SKILL.md excludes the iterations directory" {
    grep -q 'docs/cr/iterations/.*MUST NOT.* be resolved as a CR' "$SKILL_MD"
}

@test "SKILL.md commits through checkpoint-commit" {
    grep -q '/checkpoint-commit' "$SKILL_MD"
    grep -q 'checkpoint(CR-NNNN)' "$SKILL_MD"
}

@test "SKILL.md recovers context with checkpoint-read" {
    grep -q 'Run `/checkpoint-read` before the first CR' "$SKILL_MD"
    grep -qi 'resumes after context loss' "$SKILL_MD"
    grep -qi 'last checkpoint' "$SKILL_MD"
}

@test "SKILL.md report names iterate-cr" {
    sed -n '/^## 5. Report/,$p' "$SKILL_MD" | grep -q '/iterate-cr'
}

@test "SKILL.md states preconditions and fallback" {
    for block in operating_model subagent_creation task_delegation continuous_commit testing user_scenario_testing; do
        grep -q "$block" "$SKILL_MD"
    done
    grep -q 'cr-implementation-workflow.md' "$SKILL_MD"
    [ -f "${REPO_ROOT}/skills/governance/reference/cr-implementation-workflow.md" ]
}

@test "SKILL.md keeps strict order and status implemented" {
    grep -q 'Resolve all arguments first' "$SKILL_MD"
    grep -q 'strictly sequentially' "$SKILL_MD"
    grep -q 'status: implemented' "$SKILL_MD"
}

@test "skill has version.txt" {
    [ "$(cat "${SKILL_DIR}/version.txt")" = "0.0.0" ]
}

@test "skill is registered for release" {
    grep -q '"skills/implement-cr"' "${REPO_ROOT}/release-please-config.json"
    grep -q '"component": "implement-cr"' "${REPO_ROOT}/release-please-config.json"
    grep -q '"skills/implement-cr": "0.0.0"' "${REPO_ROOT}/.release-please-manifest.json"
}
