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
