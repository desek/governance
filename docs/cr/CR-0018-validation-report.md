# CR-0018 Validation Report

## Summary
Requirements: 26/26 | Acceptance Criteria: 16/16 | Tests: 143/143 | Gaps: 0

Scope: `docs/cr-model-based-testing`, range `f0deb2b..HEAD`.
Branch diff touches 7 files, all within the CR's Affected Components (plus the CR document itself). No stray changed files.
Verification command (`bats -r tests/`, per the CR): 143 tests, exit 0, 0 failures (124 existing plus 19 added).
Documentation-only audit; no source modified.

## Requirement Verification

### Functional Requirements
| Req # | Description | Status | Evidence (file:line / test name) |
|---|---|---|---|
| FR-1 | Section titled Model-Based Testing, optional marker verbatim on the line above | PASS | `templates/CR.md:361-362`; tests `CR template has a model based testing section`, `CR template marks the model based testing section optional` |
| FR-2 | Placed after Test Strategy, before Acceptance Criteria | PASS | `templates/CR.md:362`, `## Acceptance Criteria` follows at `:370`; test `CR template places model based testing between test strategy and acceptance criteria` |
| FR-3 | Guideline defines the method as a run at the user surface from the user's seat | PASS | `templates/CR.md:155-156`; test `CR template defines model based testing as a run at the user surface` |
| FR-4 | Four required fields per scenario | PASS | `templates/CR.md:157-158,366`; tests `CR template requires a user goal a user surface and a success condition per scenario`, `CR template ties each scenario to an acceptance criterion` |
| FR-5 | Success condition is an observable end state, never transcript or step count | PASS | `templates/CR.md:159-160`; test `CR template states the success condition is an observable end state` |
| FR-6 | Every scenario names an AC; no free-floating success condition | PASS | `templates/CR.md:163-164`; test `CR template ties each scenario to an acceptance criterion` |
| FR-7 | Surfaces `browser`, `command line`, `HTTP request`; surface the user touches | PASS | `templates/CR.md:161-162`; test `CR template names the candidate user surfaces` |
| FR-8 | Removed when no user surface; documentation-only and configuration-only named | PASS | `templates/CR.md:165-166`; test `CR template states the omission rule for a change with no user surface` |
| FR-9 | Optionality governs presence only; obligations stay MUST / MUST NOT | PASS | `templates/CR.md:167-168`; grep of item 10 finds no SHOULD, MAY, RECOMMENDED, or OPTIONAL obligation; test `CR template keeps obligation language inside the optional section` |
| FR-10 | Sits above automated tests, replaces none; test strategy points back | PASS | `templates/CR.md:108,169-170`; tests `CR template states model based testing replaces no automated test`, `CR template test strategy guidance points at model based testing` |
| FR-11 | No named skill, driver, tool, or directory as precondition | PASS | `templates/CR.md:171-172`; test `CR template requires no named tool for model based testing` |
| FR-12 | `Scenario Record` column, left empty without a convention | PASS | `templates/CR.md:366,172`; test `CR template requires no named tool for model based testing` |
| FR-13 | Skill checklist step and Flexible list line, no digit-form identifier | PASS | `SKILL.md:66,83`; tests `governance skill checklist decides whether model based testing applies`, `governance skill records the section as optional in the flexible list`, `governance skill model based testing wording carries no governance identifier` |
| FR-14 | Guide documents the section as level-three under Requirements | PASS | `reference/cr-guide.md:113-126` (inside `## Requirements` at `:60`, before `## Document Numbering` at `:128`); tests `CR guide documents the model based testing section`, `CR guide documents the omission rule and the layering` |
| FR-15 | Index entry verified, not duplicated | PASS | `docs/llms.txt:24` (added by the authoring commit); test `documentation index carries one entry for the model based testing change` |
| FR-16 | One assertion per Tests to Add row, no identifier in the file | PASS | 19 `@test` blocks in `tests/governance/test_model_based_testing.bats` matching the 19 table rows; grep for the reference pattern returns nothing |

### Non-Functional Requirements
| Req # | Description | Status | Evidence |
|---|---|---|---|
| NFR-1 | No new dependency | PASS | Diff adds prose, a template table, a helper function (awk), and bats assertions only |
| NFR-2 | Guidance inside HTML comment blocks | PASS | Guideline item 10 sits inside the guidelines comment (`templates/CR.md:153-172`, closed at `:174`); existing comment-extraction assertion passes unmodified |
| NFR-3 | Comment extraction opens/closes only on bare delimiter lines, not reusing the old expression | PASS | `tests/governance/test_helpers/setup.bash` `comment_block_text` |
| NFR-4 | No line starting with `copyright:` or `version:` in the template | PASS | Existing template assertions pass |
| NFR-5 | No other `docs/cr/` file modified | PASS | `git diff --name-only f0deb2b..HEAD -- docs/cr` lists only the CR document |
| NFR-6 | SKILL.md within the token budget | PASS | Only 2 lines added to `SKILL.md`; recording the measured count in the pull request is a PR-time step |
| NFR-7 | Template grows by at most 40 lines | PASS | `wc -l` = 564, growth 30 over 534 |
| NFR-8 | Reference boundary intact, new test file not allowlisted | PASS | Test `no governance references outside permitted paths` passes; allowlist unchanged |
| NFR-9 | `test_cr_template.bats` unmodified and passing | PASS | `git diff --quiet f0deb2b..HEAD -- tests/governance/test_cr_template.bats` exits 0 |
| NFR-10 | New files carry the copyright header | PASS | `test_model_based_testing.bats:2` |

## Acceptance Criteria Verification
| AC # | Description | Status | Evidence |
|---|---|---|---|
| AC-1 | Section exists and is optional | PASS | `templates/CR.md:361-362` (marker directly above the heading); tests `CR template has a model based testing section`, `CR template marks the model based testing section optional` |
| AC-2 | Between test strategy and acceptance criteria | PASS | test `CR template places model based testing between test strategy and acceptance criteria` |
| AC-3 | Defined as a run at the user surface | PASS | `templates/CR.md:155-156`; test `CR template defines model based testing as a run at the user surface` |
| AC-4 | Each scenario states four things | PASS | `templates/CR.md:157-158,366`; tests over the four columns |
| AC-5 | Success condition is an end state | PASS | test `CR template states the success condition is an observable end state` |
| AC-6 | No scenario floats free of a criterion | PASS | test `CR template ties each scenario to an acceptance criterion` |
| AC-7 | Candidate surfaces named | PASS | test `CR template names the candidate user surfaces` |
| AC-8 | No user surface, no section | PASS | test `CR template states the omission rule for a change with no user surface` |
| AC-9 | Optionality is not weaker language | PASS | test `CR template keeps obligation language inside the optional section`; manual grep of item 10 |
| AC-10 | Replaces no automated test; mutual pointers | PASS | tests `CR template states model based testing replaces no automated test`, `CR template test strategy guidance points at model based testing` |
| AC-11 | No prerequisite tool; Scenario Record column | PASS | test `CR template requires no named tool for model based testing` |
| AC-12 | Skill decides whether the section applies | PASS | `SKILL.md:66,83`; three governance skill tests; Strict list unchanged per diff |
| AC-13 | Guide documents the section | PASS | `cr-guide.md:113-126`; Table of Contents unchanged in diff; two guide tests |
| AC-14 | Index carries the document exactly once | PASS | test `documentation index carries one entry for the model based testing change`; the only `docs/llms.txt` change in range is the authoring commit's entry |
| AC-15 | Existing template guarantees survive | PASS | five `test_cr_template.bats` assertions pass; file unmodified |
| AC-16 | Suite passes with the boundary intact | PASS | `bats -r tests/`: 143 ok, 0 not ok; boundary assertion passes |

## Intent Check
Intent: a CR author can optionally include a section in which an AI agent tests the change from the user perspective by interacting with the real application; the section is omitted when there is no user surface. Held: the template carries the removable section with the user-seat definition (`templates/CR.md:155-156,361-367`), and the omission rule is stated in the template, the skill checklist, and the guide.

## Test Evidence
All 19 assertions in `tests/governance/test_model_based_testing.bats` pass, alongside the unmodified `tests/governance/test_cr_template.bats` and `tests/governance/test_reference_boundary.bats`.

## Diff Coverage
| File | +/- | Mapped Requirements |
|---|---|---|
| skills/governance/templates/CR.md | +30 | FR-1..FR-12, NFR-2, NFR-4, NFR-7 |
| skills/governance/SKILL.md | +2 | FR-13, NFR-6 |
| skills/governance/reference/cr-guide.md | +15 | FR-14 |
| tests/governance/test_model_based_testing.bats | +129 | FR-16, Test Strategy |
| tests/governance/test_helpers/setup.bash | +13 | NFR-3, Test Strategy |
| docs/llms.txt | +1 | FR-15, AC-14 |
| docs/cr/CR-0018-model-based-testing-section.md | +774 | The CR document itself |

### Unmapped changed files
None.

## Gaps
None.
