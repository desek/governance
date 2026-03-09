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
