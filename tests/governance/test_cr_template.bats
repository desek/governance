#!/usr/bin/env bats
# Copyright Daniel Grenemark 2026

setup() {
    load test_helpers/setup.bash
}

@test "CR template has source-branch field" {
    grep -q "^source-branch:" "$CR_TEMPLATE"
}

@test "CR template has source-commit field" {
    grep -q "^source-commit:" "$CR_TEMPLATE"
}

@test "CR template has no copyright metadata field" {
    ! grep -qE "^[[:space:]]*copyright:" "$CR_TEMPLATE"
}

@test "CR template has no version metadata field" {
    ! grep -qE "^[[:space:]]*version:" "$CR_TEMPLATE"
}

@test "CR template states the reference boundary inside an HTML comment" {
    # Extract only the text inside HTML comment blocks, then assert the
    # boundary instruction lives there so it never renders in a created CR.
    # Close a comment block only on a bare `-->` line so Mermaid arrows
    # (`X --> Y`) inside the block do not terminate extraction early.
    comment_text="$(awk '/<!--/{c=1} c{print} /^[[:space:]]*-->[[:space:]]*$/{c=0}' "$CR_TEMPLATE")"
    echo "$comment_text" | grep -qi "Governance identifiers"
    echo "$comment_text" | grep -qi "commit"
}
