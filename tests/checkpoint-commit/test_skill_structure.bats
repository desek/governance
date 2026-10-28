#!/usr/bin/env bats
# Copyright Daniel Grenemark 2026
#
# Content tests for the checkpoint-commit caller contract.

setup() {
    load test_helpers/setup.bash
}

@test "SKILL.md accepts a caller scope and path list" {
    grep -q 'Caller-supplied scope' "$SKILL_MD"
    grep -q 'CR-XXXX-iterate' "$SKILL_MD"
    grep -q 'iterate-{slug}' "$SKILL_MD"
    grep -qi 'trailer' "$SKILL_MD"
}

@test "SKILL.md skips CR detection and git add -A for a caller scope" {
    grep -q 'skip CR detection' "$SKILL_MD"
    grep -q 'pattern check' "$SKILL_MD"
    grep -q 'git add -- {path}' "$SKILL_MD"
    grep -q 'instead of running `git add -A`' "$SKILL_MD"
}
