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

@test "iterate template entry carries change, reason, and evidence" {
    grep -qi '\*\*Change:\*\*' "$ITERATE_TEMPLATE"
    grep -qi '\*\*Reason:\*\*' "$ITERATE_TEMPLATE"
    grep -qi '\*\*Evidence:\*\*' "$ITERATE_TEMPLATE"
}

@test "iterate template carries an optional supersession reference" {
    grep -qi '\*\*Supersedes:\*\*' "$ITERATE_TEMPLATE"
    grep -qi 'optional' "$ITERATE_TEMPLATE"
}

@test "iterate template has no disposition field" {
    # Genuine absence: the disposition machinery is gone from the entry shape.
    ! grep -qi 'disposition' "$ITERATE_TEMPLATE"
    ! grep -qi 'discarded' "$ITERATE_TEMPLATE"
    ! grep -qi 'partially-kept' "$ITERATE_TEMPLATE"
}

@test "iterate template has no entry state field" {
    # Genuine absence: open and settled entry states are removed.
    ! grep -qi '\*\*State' "$ITERATE_TEMPLATE"
    ! grep -qi 'settled' "$ITERATE_TEMPLATE"
}

@test "iterate template has no distillation section" {
    # Genuine absence: no distillation, patterns, or anti-patterns section.
    ! grep -qiE '^##.*distillation' "$ITERATE_TEMPLATE"
    ! grep -qiE '^##.*patterns' "$ITERATE_TEMPLATE"
    ! grep -qiE 'anti-patterns' "$ITERATE_TEMPLATE"
}

@test "iterate template carries a derived current-state section" {
    grep -q '^## What Stands Now' "$ITERATE_TEMPLATE"
    grep -qi 'DERIVED' "$ITERATE_TEMPLATE"
    grep -qi 'regenerated' "$ITERATE_TEMPLATE"
}

@test "iterate template keeps the append-only rule for entries" {
    grep -qi 'append-only within a session' "$ITERATE_TEMPLATE"
    # The prohibition wraps across a line break in the template, so match its
    # single-line tokens rather than the full sentence.
    grep -qi 'Never delete' "$ITERATE_TEMPLATE"
    grep -qi 'overwrite an earlier entry' "$ITERATE_TEMPLATE"
}
