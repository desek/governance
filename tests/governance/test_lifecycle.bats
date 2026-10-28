#!/usr/bin/env bats
# Copyright Daniel Grenemark 2026

setup() {
    load test_helpers/setup.bash
}

# Emits the body of the CR Lifecycle section of the governance skill.
lifecycle_section() {
    awk '/^## CR Lifecycle$/{c=1;next} /^## /{c=0} c' "$GOVERNANCE_SKILL"
}

@test "governance SKILL.md documents the five-step lifecycle" {
    section="$(lifecycle_section)"
    [ -n "$section" ]
    for cmd in /implement-cr /iterate-cr /reconcile-cr; do
        echo "$section" | grep -qF "$cmd"
    done
    for step in Author Implement Iterate Reconcile End; do
        echo "$section" | grep -q "\*\*${step}"
    done
    [ "$(echo "$section" | grep -c '```mermaid')" -eq 1 ]
}

@test "governance SKILL.md documents the exploration entry point" {
    section="$(lifecycle_section)"
    echo "$section" | grep -qi "exploration"
    echo "$section" | grep -qi "retroactive"
}
