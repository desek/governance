#!/usr/bin/env bats
# Copyright Daniel Grenemark 2026
#
# Ledger template tests for the checkpoint-iterate skill. These assert the
# bundled ITERATE.md template carries the frontmatter fields a session needs,
# omits the template-describing metadata that documents under docs/cr/ must not
# carry, provides the retuned ledger sections, and keeps the append-only rule
# that retains superseded entries.

setup() {
    load test_helpers/setup.bash
}

@test "iterate template has a worktree field" {
    grep -q '^worktree:' "$ITERATE_TEMPLATE"
}

@test "iterate template has governing CR field" {
    grep -q '^cr:' "$ITERATE_TEMPLATE"
}

@test "iterate template has status field" {
    grep -q '^status:' "$ITERATE_TEMPLATE"
}

@test "iterate template has source-branch and source-commit fields" {
    grep -q '^source-branch:' "$ITERATE_TEMPLATE"
    grep -q '^source-commit:' "$ITERATE_TEMPLATE"
}

@test "iterate template has no copyright metadata field" {
    ! grep -qE '^[[:space:]]*copyright:' "$ITERATE_TEMPLATE"
}

@test "iterate template has no version metadata field" {
    ! grep -qE '^[[:space:]]*version:' "$ITERATE_TEMPLATE"
}

@test "iterate template has the three required sections" {
    grep -q '^## Session Context' "$ITERATE_TEMPLATE"
    grep -q '^## Attempt Ledger' "$ITERATE_TEMPLATE"
    grep -q '^## What Stands Now' "$ITERATE_TEMPLATE"
}

@test "iterate template states that superseded entries are retained" {
    grep -qi 'APPEND-ONLY' "$ITERATE_TEMPLATE"
    grep -qi 'retained' "$ITERATE_TEMPLATE"
    grep -qi 'superseded' "$ITERATE_TEMPLATE"
}
