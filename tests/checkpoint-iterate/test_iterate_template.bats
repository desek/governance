#!/usr/bin/env bats
# Copyright Daniel Grenemark 2026
#
# Ledger template tests for the checkpoint-iterate skill. These assert the
# bundled ITERATE.md template carries the frontmatter fields a session needs,
# omits the template-describing metadata that documents under docs/cr/ must not
# carry, provides the three ledger sections, and documents the closed
# disposition vocabulary and the partial-keep split.

setup() {
    load test_helpers/setup.bash
}

@test "iterate template has a worktree field" {
    grep -q '^worktree:' "$ITERATE_TEMPLATE"
}

@test "iterate template documents the open and settled entry states" {
    grep -qi 'ENTRY STATES' "$ITERATE_TEMPLATE"
    grep -qi 'settled' "$ITERATE_TEMPLATE"
    grep -qi 'is marked `open`' "$ITERATE_TEMPLATE"
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
    grep -q '^## Distillation' "$ITERATE_TEMPLATE"
}

@test "iterate template documents all three dispositions" {
    grep -q 'kept' "$ITERATE_TEMPLATE"
    grep -q 'discarded' "$ITERATE_TEMPLATE"
    grep -q 'partially-kept' "$ITERATE_TEMPLATE"
}

@test "iterate template documents the partial-keep split" {
    grep -qi 'Portion kept' "$ITERATE_TEMPLATE"
    grep -qi 'Portion reverted' "$ITERATE_TEMPLATE"
}

@test "iterate template separates patterns from anti-patterns" {
    grep -q '^### Recommended Patterns' "$ITERATE_TEMPLATE"
    grep -q '^### Anti-Patterns' "$ITERATE_TEMPLATE"
}

@test "iterate template states that discarded entries are retained" {
    grep -qi 'APPEND-ONLY' "$ITERATE_TEMPLATE"
    grep -qi 'retained' "$ITERATE_TEMPLATE"
}
