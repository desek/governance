# CR-0014 Validation Report

## Summary
Requirements: 18/18 | Acceptance Criteria: 12/12 | Tests: 14/18 | Gaps: 4

Requirements count is FR-1..FR-15 (15) plus NFR-1..NFR-3 (3) = 18, all PASS.
Acceptance Criteria AC-1..AC-12 all PASS.
Test Strategy: 13 "Tests to Add" + 1 "Tests to Modify" = 14 specified entries; 4 of the "Tests to Add" entries were never implemented (all four are documentation-content grep tests in `test_reference_boundary.bats`). 14 of 18 specified tests exist and pass. The four missing tests are recorded as gaps.

Validation basis: branch `fix/governance-reference-leaks` at HEAD `8eab405`, diffed against `cfcb537` (merge-base with `origin/main`). Quality gate `bats -r tests/` run locally: **21/21 pass, exit 0**. Boundary-failure behavior confirmed by injecting a temporary untracked violation (see AC-5).

## Requirement Verification

| Req # | Description | Status | Evidence (file:line / test name) |
|-------|-------------|--------|----------------------------------|
| FR-1 | Document the boundary as a normative rule naming both territories | PASS | `skills/governance/reference/cr-guide.md:151-187` (permitted 159-167, prohibited 169-175); `skills/governance/SKILL.md:22-26` |
| FR-2 | Define the reference pattern as CR/ADR/FR/NFR/AC + digits | PASS | `cr-guide.md:157`; `tests/governance/test_helpers/setup.bash:15` (`REFERENCE_PATTERN='(CR|ADR|FR|NFR|AC)-[0-9]+'`) |
| FR-3 | State commit messages, branch names, PR descriptions as permitted link mechanism | PASS | `cr-guide.md:179`; `SKILL.md:26` |
| FR-4 | Skill contains no instruction to write an identifier into code/tests/docs | PASS | Prior instruction removed at `cr-implementation-workflow.md:223-226`; enforced by boundary test (`bats` test 19) |
| FR-5 | Doc-updater directed to describe behavior without naming its governance doc | PASS | `cr-implementation-workflow.md:223-226` ("do NOT name the governance document ... Provenance belongs in commit metadata") |
| FR-6 | Automated test fails when pattern appears outside permitted territory | PASS | `tests/governance/test_reference_boundary.bats:15-44`; behaviorally confirmed (see AC-5) |
| FR-7 | Test reports offending path AND matched identifier on failure | PASS | `test_reference_boundary.bats:35-41`; injection produced `ZZ_scratch_violation_probe.md: FR-99` |
| FR-8 | Hardcoded corpus-entry index test replaced by a structural one | PASS | `tests/checkpoint-read/test_skill_structure.bats:36-45` (assertion `grep -qE '\]\((cr\|adr)/[^)]+\.md\)'`) |
| FR-9 | Every existing boundary violation in the repo corrected | PASS | Two known violations fixed (workflow step 7; `test_skill_structure.bats` CR-0012 test); boundary test 19 passes with zero violations |
| FR-10 | CR and ADR templates carry no metadata.copyright / metadata.version | PASS | `templates/CR.md` and `templates/ADR.md` diff removes the `metadata:` block; `bats` tests 11, 12, 16, 17 pass |
| FR-11 | Each template contains a commented boundary instruction | PASS | `templates/CR.md` guideline #9; `templates/ADR.md` guideline #3; `bats` tests 13, 18 pass |
| FR-12 | Instruction names Git commit messages as the linking mechanism | PASS | Both templates: "the link ... belongs in the commit message"; template tests grep `-qi "commit"` (tests 13, 18) |
| FR-13 | Instruction is an HTML comment (absent from rendered doc) | PASS | Instruction sits inside `<!-- ... -->`; `test_cr_template.bats:24-32` / `test_adr_template.bats:24-32` extract comment text via awk and assert membership |
| FR-14 | SKILL.md and AGENTS.md no longer instruct stripping the removed fields | PASS | `SKILL.md:41` and `:69` reworded to "no template metadata"; `AGENTS.md:121` reframed as exception, not a strip instruction |
| FR-15 | AGENTS.md copyright section records the templates as an explicit exception | PASS | `AGENTS.md:121` ("the two governance templates ... are an explicit exception to the copyright frontmatter rule above") |
| NFR-1 | Boundary test runs in the existing Bats suite, no new dependency | PASS | Executes under `bats -r tests/` as tests 19-21; only uses grep/awk/bash |
| NFR-2 | Allowlist held in one location; adding a path is a single-line change | PASS | `setup.bash:25-35` `REFERENCE_ALLOWLIST` bash array, one path per line; a new path is one added line |
| NFR-3 | Boundary doc reachable from SKILL.md within one link | PASS | `SKILL.md:26` links to `reference/cr-guide.md#governance-reference-boundary` |

## Acceptance Criteria Verification

| AC # | Description | Status | Evidence |
|------|-------------|--------|----------|
| AC-1 | Boundary rule stated in SKILL.md with a link to the guide | PASS | `SKILL.md:22-26` (rule + `#governance-reference-boundary` link). Note: no automated test guards this (see Gaps). |
| AC-2 | Reference pattern defined; both territories enumerated as lists | PASS | `cr-guide.md:157` (pattern), `:159-167` (permitted list), `:169-175` (prohibited list). No automated test (see Gaps). |
| AC-3 | Commit metadata named as traceability mechanism; embedding prohibited | PASS | `cr-guide.md:179`. No automated test (see Gaps). |
| AC-4 | Skill no longer instructs embedding an identifier | PASS | `cr-implementation-workflow.md:223-226`. No automated test (see Gaps). |
| AC-5 | A violation in a prohibited path fails the suite, naming path + identifier | PASS | Injected untracked `ZZ_scratch_violation_probe.md` with `FR-99`; test 1 of the boundary file failed with `not ok 1 ... ZZ_scratch_violation_probe.md: FR-99`; temp file removed, tree clean |
| AC-6 | Governance corpus not reported as a violation | PASS | `bats` test 19 passes; corpus paths allowlisted at `setup.bash:26-28` |
| AC-7 | Index test names no specific document | PASS | `test_skill_structure.bats:36` name "llms.txt contains governance corpus entries"; assertion is structural, no identifier |
| AC-8 | Template metadata fields gone; name/description retained | PASS | `bats` tests 11, 12, 16, 17 pass; `templates/CR.md:1-2` / `templates/ADR.md:1-2` retain `name` + `description` |
| AC-9 | Templates carry the boundary instruction naming the commit message | PASS | `bats` tests 13, 18 pass |
| AC-10 | Boundary instruction does not render (inside HTML comment) | PASS | Instruction lives inside the `<!-- ... -->` guideline block of both templates; `test_cr_template.bats:29` / `test_adr_template.bats:29` awk-extract only comment content and assert the instruction is found there |
| AC-11 | Strip-fields instructions retired; AGENTS.md records the exception | PASS | `SKILL.md:41`, `:69` (no strip instruction); `AGENTS.md:121` records the exception. No automated test (see Gaps). |
| AC-12 | Full suite passes; boundary reports zero violations | PASS | `bats -r tests/` → 21/21, exit 0 |

## Test Strategy Verification

| Test File | Test Name | Specified | Exists | Matches Spec |
|-----------|-----------|-----------|--------|--------------|
| `test_reference_boundary.bats` | `no governance references outside permitted paths` | Yes | Yes (line 15) | Yes — passes; failure prints path + identifier |
| `test_reference_boundary.bats` | `governance corpus contains references` | Yes | Yes (line 46) | Yes — passes; asserts corpus non-empty |
| `test_reference_boundary.bats` | `reference pattern matches all governed prefixes` | Yes | Yes (line 55) | Yes — 5 positive + 1 negative sample |
| `test_cr_template.bats` | `CR template has no copyright metadata field` | Yes | Yes (line 16) | Yes |
| `test_cr_template.bats` | `CR template has no version metadata field` | Yes | Yes (line 20) | Yes |
| `test_cr_template.bats` | `CR template states the reference boundary` | Yes | Yes (line 24, named `... inside an HTML comment`) | Yes — also covers AC-10 |
| `test_adr_template.bats` | `ADR template has no copyright metadata field` | Yes | Yes (line 16) | Yes |
| `test_adr_template.bats` | `ADR template has no version metadata field` | Yes | Yes (line 20) | Yes |
| `test_adr_template.bats` | `ADR template states the reference boundary` | Yes | Yes (line 24) | Yes |
| `test_reference_boundary.bats` | `SKILL.md states the boundary rule and links to the guide` | Yes | **No** | **Missing** — covers AC-1/NFR-3 |
| `test_reference_boundary.bats` | `cr-guide documents pattern, territories, and commit mechanism` | Yes | **No** | **Missing** — covers AC-2/AC-3 |
| `test_reference_boundary.bats` | `doc-updater instruction names no governance identifier` | Yes | **No** | **Missing** — covers AC-4 |
| `test_reference_boundary.bats` | `no strip-fields instruction remains and AGENTS.md records the template exception` | Yes | **No** | **Missing** — covers AC-11 |
| `test_skill_structure.bats` | `llms.txt contains CR-0012 entry` → `llms.txt contains governance corpus entries` | Yes (modify) | Yes (line 36) | Yes — renamed and re-asserted structurally |

Specified test entries present and passing: 14/18. Four specified "Tests to Add" rows are absent from the implemented `test_reference_boundary.bats`, which contains only three tests instead of the seven the Test Strategy enumerates for that file.

## Diff Coverage

| File | +/- | Mapped Requirements |
|------|-----|---------------------|
| `AGENTS.md` | +1/-1 | FR-14, FR-15, AC-11 |
| `skills/governance/SKILL.md` | +7/-1 | FR-1, FR-3, FR-14, NFR-3, AC-1, AC-11 |
| `skills/governance/reference/cr-guide.md` | +35/-0 | FR-1, FR-2, FR-3, AC-2, AC-3 |
| `skills/governance/reference/cr-implementation-workflow.md` | +4/-1 | FR-4, FR-5, AC-4 |
| `skills/governance/templates/CR.md` | +12/-3 | FR-10, FR-11, FR-12, FR-13, AC-8, AC-9, AC-10 |
| `skills/governance/templates/ADR.md` | +27/-3 | FR-10, FR-11, FR-12, FR-13, AC-8, AC-9, AC-10 |
| `tests/checkpoint-read/test_skill_structure.bats` | +7/-2 | FR-8, AC-7 |
| `tests/governance/test_cr_template.bats` | +18/-0 | FR-10 (tests), FR-11, FR-13, AC-8, AC-9, AC-10 |
| `tests/governance/test_adr_template.bats` | +18/-0 | FR-10 (tests), FR-11, FR-13, AC-8, AC-9, AC-10 |
| `tests/governance/test_helpers/setup.bash` | +48/-0 | FR-2, FR-6, NFR-2 |
| `tests/governance/test_reference_boundary.bats` | +64/-0 | FR-6, FR-7, FR-9, NFR-1, AC-5, AC-6, AC-12 |
| `docs/cr/CR-0014-...implementation.md` | +619/-0 | The CR document itself (governance corpus) |

### Unmapped changed files
None. Every changed file maps to at least one requirement, and every changed file appears in the CR's Affected Components. No stray changes outside the declared scope.

## Notes on Specific Verification Targets

- **FR-7 (failure reporting):** Verified by reading the failure code (`test_reference_boundary.bats:35-41`), not just presence. Line 35 extracts the matched identifier with `grep -oE "$REFERENCE_PATTERN" | head -n1`; lines 40-41 print `${rel_path}: ${identifier}` per violation. Behaviorally confirmed: the injected probe produced `ZZ_scratch_violation_probe.md: FR-99`.
- **NFR-2 (single-line allowlist add):** The allowlist is a bash array (`setup.bash:25-35`) with one repo-relative path per line; adding a permitted path is a single new array line. Claim holds.
- **AC-10 (instruction does not render):** Confirmed the instruction sits inside `<!-- ... -->` in both templates. `templates/ADR.md` places it in a dedicated comment block (guideline #3); `templates/CR.md` places it in the existing guideline comment block (guideline #9). The template tests assert membership by extracting only comment text via awk before grepping.
- **FR-14 / FR-15:** Read the current text directly. `SKILL.md:41` and `:69` no longer instruct stripping the removed fields (they now state a created document "carries its own name and description ... and no template metadata"). `AGENTS.md:121` records the two templates as an explicit exception to the copyright frontmatter rule.
- **Risk 7 (whole-file allowlist blind spot):** The implemented allowlist (`setup.bash:29-32`) allowlists `templates/CR.md`, `templates/ADR.md`, `reference/cr-guide.md`, and `reference/adr-guide.md` by exact path. This matches Risk 7's description precisely: a genuine stray identifier introduced into any of those four files would not be caught by the boundary test. The accepted, bounded blind spot documented in Risk 7 is faithfully reflected by the implementation. The review's U1 (normalise placeholders to eliminate the blind spot) was not adopted; the Risk 7 accept-as-written path was taken, consistent with the finalized CR.
- **`docs/adr/` allowlist entry (`setup.bash:27`):** The directory does not yet exist in the repository (forward-looking, as the reviewer noted). Harmless: the allowlist prefix simply matches nothing today.

## Gaps

1. **Test Strategy row missing — `SKILL.md states the boundary rule and links to the guide`** (covers AC-1, NFR-3). The finalized Test Strategy enumerates this test in `test_reference_boundary.bats`, but the file contains no such test. AC-1 and NFR-3 are met by documentation content (`SKILL.md:22-26`) and verified here by inspection, but the promised automated guard is absent. Suggested minimal fix: add a bats test asserting `SKILL.md` contains the boundary rule text and a markdown link to `cr-guide.md#governance-reference-boundary`.

2. **Test Strategy row missing — `cr-guide documents pattern, territories, and commit mechanism`** (covers AC-2, AC-3). Not present in `test_reference_boundary.bats`. Content is met (`cr-guide.md:151-187`) and verified by inspection. Suggested minimal fix: add a bats test grepping `cr-guide.md` for the pattern definition, both territory lists, and the commit-metadata statement.

3. **Test Strategy row missing — `doc-updater instruction names no governance identifier`** (covers AC-4). Not present. Content is met (`cr-implementation-workflow.md:223-226`) and verified by inspection. Suggested minimal fix: add a bats test asserting the doc-updater step does not contain the reference pattern and does not contain "reference the CR ID".

4. **Test Strategy row missing — `no strip-fields instruction remains and AGENTS.md records the template exception`** (covers AC-11). Not present. Content is met (`SKILL.md:41`, `:69`; `AGENTS.md:121`) and verified by inspection. Suggested minimal fix: add a bats test asserting `SKILL.md`/`AGENTS.md` carry no omit-those-fields instruction and that `AGENTS.md` records the template exception.

All four gaps are the same class: reviewer-added Test Strategy coverage rows (the CR's "Coverage: 1 (fixed)" note added four grep-based rows for AC-1/2/3/4/11) that were never implemented in `test_reference_boundary.bats`. No Functional or Non-Functional Requirement and no Acceptance Criterion is unmet — every FR, NFR, and AC is satisfied by verifiable file:line content plus, for the behavioral criteria (AC-5, AC-6, AC-12), passing test evidence. The gap is strictly the absence of the four documentation-content regression tests the finalized CR committed to adding.
