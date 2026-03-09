#!/usr/bin/env bats
# Copyright Daniel Grenemark 2026

setup() {
    load test_helpers/setup.bash
}

@test "SKILL.md exists at correct path" {
    [ -f "$SKILL_MD" ]
}

@test "version.txt exists with correct content" {
    [ "$(cat "${SKILL_DIR}/version.txt")" = "0.0.0" ]
}

@test "release-please-config.json contains checkpoint-read" {
    grep -q '"skills/checkpoint-read"' "${REPO_ROOT}/release-please-config.json"
}

@test "release-please-manifest contains checkpoint-read" {
    grep -q '"skills/checkpoint-read"' "${REPO_ROOT}/.release-please-manifest.json"
}

@test "SKILL.md frontmatter has required fields" {
    grep -q '^name:' "$SKILL_MD"
    grep -q '^description:' "$SKILL_MD"
    grep -q '^license:' "$SKILL_MD"
    grep -q 'metadata:' "$SKILL_MD"
}

@test "SKILL.md contains no destructive Git commands" {
    # Filter out lines that document prohibitions (MUST NOT / do not / never)
    ! grep -vE '(MUST NOT|must not|do not|never|NOT)' "$SKILL_MD" | grep -qE 'git (reset|rebase|commit|push --force|amend)'
}

@test "llms.txt contains CR-0012 entry" {
    grep -q 'CR-0012' "${REPO_ROOT}/docs/llms.txt"
}

@test "README.md contains checkpoint-read in Available Skills" {
    grep -q 'checkpoint-read' "${REPO_ROOT}/README.md"
}
