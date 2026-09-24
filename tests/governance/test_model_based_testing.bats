#!/usr/bin/env bats
# Copyright Daniel Grenemark 2026

# Assertions over the optional Model-Based Testing section: the CR template
# body and guideline, the governance skill checklist, the CR guide, and the
# documentation index entry.

setup() {
    load test_helpers/setup.bash
}

heading_line() {
    grep -nx "$1" "$CR_TEMPLATE" | head -n1 | cut -d: -f1
}

@test "CR template has a model based testing section" {
    grep -qx "## Model-Based Testing" "$CR_TEMPLATE"
}

@test "CR template marks the model based testing section optional" {
    line="$(heading_line "## Model-Based Testing")"
    previous="$(sed -n "$((line - 1))p" "$CR_TEMPLATE")"
    [ "$previous" = "<!-- This is an optional element. Feel free to remove. -->" ]
}

@test "CR template places model based testing between test strategy and acceptance criteria" {
    mbt="$(heading_line "## Model-Based Testing")"
    ts="$(heading_line "## Test Strategy")"
    ac="$(heading_line "## Acceptance Criteria")"
    [ -n "$mbt" ] && [ -n "$ts" ] && [ -n "$ac" ]
    [ "$mbt" -gt "$ts" ]
    [ "$mbt" -lt "$ac" ]
}

@test "CR template defines model based testing as a run at the user surface" {
    text="$(comment_block_text "$CR_TEMPLATE")"
    echo "$text" | grep -qF "interacts with the real"
    echo "$text" | grep -qF "application at the user surface"
    echo "$text" | grep -qF "from the user's seat"
}

@test "CR template requires a user goal a user surface and a success condition per scenario" {
    grep -qF "User Goal" "$CR_TEMPLATE"
    grep -qF "User Surface" "$CR_TEMPLATE"
    grep -qF "Success Condition" "$CR_TEMPLATE"
}

@test "CR template ties each scenario to an acceptance criterion" {
    text="$(comment_block_text "$CR_TEMPLATE")"
    echo "$text" | grep -qF "name at least one acceptance criterion it proves"
    echo "$text" | grep -qF "introduce a success condition no criterion states"
    grep -qE "^\|.*\| Criteria Proved \|" "$CR_TEMPLATE"
}

@test "CR template states the success condition is an observable end state" {
    text="$(comment_block_text "$CR_TEMPLATE")"
    echo "$text" | grep -qF "be an observable end state, never a property"
    echo "$text" | grep -qF "of the transcript or the step count"
}

@test "CR template names the candidate user surfaces" {
    text="$(comment_block_text "$CR_TEMPLATE")"
    echo "$text" | grep -qF '`browser`, `command line`, and `HTTP request`'
    echo "$text" | grep -qF "surface named **MUST** be the one the user touches"
}

@test "CR template states the omission rule for a change with no user surface" {
    text="$(comment_block_text "$CR_TEMPLATE")"
    echo "$text" | grep -qF "removed when the change has no user surface"
    echo "$text" | grep -qF "documentation-only or configuration-only change"
}

@test "CR template keeps obligation language inside the optional section" {
    text="$(comment_block_text "$CR_TEMPLATE")"
    echo "$text" | grep -qF "The optionality governs only whether the section appears"
    echo "$text" | grep -qF "stays **MUST** or **MUST NOT**"
}

@test "CR template states model based testing replaces no automated test" {
    text="$(comment_block_text "$CR_TEMPLATE")"
    echo "$text" | grep -qF "sits above the automated tests of the Test Strategy"
    echo "$text" | grep -qF "replace any of them"
}

@test "CR template test strategy guidance points at model based testing" {
    # The pointer must fall inside the test strategy item, before the next item.
    item="$(comment_block_text "$CR_TEMPLATE" | awk '/^6\. TEST STRATEGY/{c=1} /^7\./{c=0} c')"
    echo "$item" | grep -qF "covered by the Model-Based Testing section"
}

@test "CR template requires no named tool for model based testing" {
    text="$(comment_block_text "$CR_TEMPLATE")"
    grep -qE "^\|.*\| Scenario Record \|" "$CR_TEMPLATE"
    echo "$text" | grep -qF "No skill, driver, tool, or directory is a precondition"
    echo "$text" | grep -qF "leaves the Scenario Record column empty"
}

@test "governance skill checklist decides whether model based testing applies" {
    grep -qF -- "- [ ] Decide whether the change has a user surface: fill in the Model-Based Testing section if it does, remove the section if it does not" "$GOVERNANCE_SKILL"
}

@test "governance skill records the section as optional in the flexible list" {
    # Read only the CR workflow's Flexible list, which ends at the next heading.
    flexible="$(awk '/^## CR Workflow/{w=1} w && /^\*\*Flexible/{f=1;next} f && /^#/{f=0} f' "$GOVERNANCE_SKILL")"
    echo "$flexible" | grep -qF "Presence of the Model-Based Testing section (governed by the user-surface test)"
    strict="$(awk '/^\*\*Strict/{s=1;next} s && /^\*\*Flexible/{s=0} s' "$GOVERNANCE_SKILL")"
    ! echo "$strict" | grep -qF "Model-Based Testing"
}

@test "governance skill model based testing wording carries no governance identifier" {
    ! grep -qE "$REFERENCE_PATTERN" "$GOVERNANCE_SKILL"
}

@test "CR guide documents the model based testing section" {
    grep -qx "### Model-Based Testing" "$CR_GUIDE"
    grep -qF "**User Goal**" "$CR_GUIDE"
    grep -qF "**User Surface**" "$CR_GUIDE"
    grep -qF "**Success Condition**" "$CR_GUIDE"
    grep -qF "**Criteria Proved**" "$CR_GUIDE"
}

@test "CR guide documents the omission rule and the layering" {
    grep -qF "A change with no user surface carries no section" "$CR_GUIDE"
    grep -qF "sits above the automated tests in the Test Strategy and replaces none of them" "$CR_GUIDE"
}

@test "documentation index carries one entry for the model based testing change" {
    [ "$(grep -c "model-based-testing-section" "$DOCS_INDEX")" -eq 1 ]
}
