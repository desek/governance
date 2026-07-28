#!/usr/bin/env bats
# Copyright Daniel Grenemark 2026

setup() {
    load test_helpers/setup.bash
}

@test "ADR template has source-branch field" {
    grep -q "^source-branch:" "$ADR_TEMPLATE"
}

@test "ADR template has source-commit field" {
    grep -q "^source-commit:" "$ADR_TEMPLATE"
}

@test "ADR template has no copyright metadata field" {
    ! grep -qE "^[[:space:]]*copyright:" "$ADR_TEMPLATE"
}

@test "ADR template has no version metadata field" {
    ! grep -qE "^[[:space:]]*version:" "$ADR_TEMPLATE"
}

@test "ADR template states the reference boundary inside an HTML comment" {
    # Extract only the text inside HTML comment blocks, then assert the
    # boundary instruction lives there so it never renders in a created ADR.
    # Close a comment block only on a bare `-->` line so Mermaid arrows
    # (`X --> Y`) inside the block do not terminate extraction early.
    comment_text="$(awk '/<!--/{c=1} c{print} /^[[:space:]]*-->[[:space:]]*$/{c=0}' "$ADR_TEMPLATE")"
    echo "$comment_text" | grep -qi "Governance identifiers"
    echo "$comment_text" | grep -qi "commit"
}
