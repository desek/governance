#!/usr/bin/env bats
# Copyright Daniel Grenemark 2026

setup() {
    load test_helpers/setup.bash
}

# Emits the body of a level-2 section of a Markdown file.
section_of() {
    awk -v h="$2" '$0==h{c=1;next} /^## /{c=0} c' "$1"
}

# Emits the Status Transitions code block of the CR guide.
transitions_block() {
    awk '/^### Status Transitions$/{s=1;next} s&&/^```/{if(c){exit}c=1;next} c' "$CR_GUIDE"
}

@test "CR template status enum equals the guide lifecycle table" {
    template="$(grep -m1 '^status:' "$CR_TEMPLATE" | sed 's/.*{\(.*\)}.*/\1/' | tr '|' '\n' | sed 's/^ *//;s/ *$//' | tr 'A-Z' 'a-z' | sort)"
    guide="$(section_of "$CR_GUIDE" '## CR Lifecycle' | grep -o '^| \*\*[^*]*\*\*' | sed 's/^| \*\*//;s/\*\*$//' | tr 'A-Z' 'a-z' | sort)"
    [ "$template" = "$guide" ]
    [ "$(echo "$guide" | wc -l | tr -d ' ')" -eq 8 ]
}

@test "CR template documents superseded-by" {
    grep -q '^superseded-by:.*superseded' "$CR_TEMPLATE"
}

@test "CR guide defines the Superseded CRs shape" {
    grep -q '^## Superseded CRs$' "$CR_GUIDE"
    section="$(section_of "$CR_GUIDE" '## Superseded CRs')"
    for word in Criterion Outcome Evidence; do
        echo "$section" | grep -q "$word"
    done
}

@test "CR guide lists the superseded transitions" {
    block="$(transitions_block)"
    for from in proposed approved on-hold implemented; do
        echo "$block" | grep -q "^${from} → superseded$"
    done
}

@test "implement-cr refuses closed statuses" {
    section="$(section_of "$IMPLEMENT_CR_SKILL" '## 2. Resolve all arguments first')"
    for status in superseded obsolete cancelled rejected; do
        echo "$section" | grep -q "$status"
    done
}
