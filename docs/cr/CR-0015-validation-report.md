# CR-0015 Validation Report

## Summary
Requirements: 49/49 | Acceptance Criteria: 26/26 | Tests: 59/59 | Gaps: 0

- Functional Requirements FR-1..FR-42: 42/42 PASS
- Non-Functional Requirements NFR-1..NFR-7: 7/7 PASS
- Acceptance Criteria AC-1..AC-26: 26/26 PASS
- Test Strategy rows: 34/34 specified, 34/34 implemented and passing (22 in `test_skill_structure.bats`, 12 in `test_iterate_template.bats`)
- Full suite `bats -r tests/`: 59/59 pass (TAP plan `1..59`, 0 `not ok`), governance boundary test (test 53) included and passing

Diff base: `8f51fde` (tip of main). Branch: `feat/cr-reconciliation-guidance`, HEAD `ea1d00d`. Twelve changed files, all within the CR's Affected Components; no stray files.

Note (non-blocking): FR-31 (entry written `open` at attempt start, before the code change) is stated verbatim in the bundled template's ENTRY STATES block and is load-bearing across the re-hydration and close rules. The Step 3 happy-path loop in SKILL.md lists the entry write as step 5 (after the verdict), a presentational compression of the same rule rather than a contradiction of it. Recorded as PASS with this observation so the reader has the honest signal.

## Requirement Verification

### Functional Requirements

| Req # | Description | Status | Evidence (file:line / test name) |
|-------|-------------|--------|----------------------------------|
| FR-1 | Skill at `skills/checkpoint-iterate/` with SKILL.md, version.txt, CHANGELOG.md | PASS | `skills/checkpoint-iterate/{SKILL.md,version.txt,CHANGELOG.md}` present; version.txt=`0.1.0`; CHANGELOG.md=`# Changelog` (correct pre-release seed, matches existing skills' seed). Tests: `SKILL.md exists at correct path`, `version.txt exists with valid semver content` |
| FR-2 | Slash command accepts a governing CR identifier | PASS | SKILL.md:16-20 usage table |
| FR-3 | User-invocation only, never auto/pipeline-spawned | PASS | SKILL.md:33. Test: `SKILL.md states the session is user-initiated and never auto-started` |
| FR-4 | Close invocation ends session and triggers distillation | PASS | SKILL.md:19,73-75,127-131. Test: `documents all three invocation forms` |
| FR-5 | Status invocation reports session, count, dispositions | PASS | SKILL.md:20,69-71. Test: `documents all three invocation forms` |
| FR-6 | Create ledger at `docs/cr/{CR_ID}-iterate.md` when none | PASS | SKILL.md:49-51 |
| FR-7 | Resume existing open ledger, append not recreate | PASS | SKILL.md:52. Test: `documents resume rather than restart` |
| FR-8 | Refuse missing CR, report unresolved identifier | PASS | SKILL.md:44. Test: `documents refusing a missing Change Request` |
| FR-9 | Agent writes every entry, user not required to author | PASS | SKILL.md:29,31,64. Test: `assigns recording to the agent` |
| FR-10 | Record user disposition, never infer/substitute | PASS | SKILL.md:28,64,140 |
| FR-11 | Agent creates every commit without being asked | PASS | SKILL.md:65-66,78-79 |
| FR-12 | Report evidence before disposition requested | PASS | SKILL.md:62. Test: `requires evidence before disposition` |
| FR-13 | Ledger frontmatter: CR, status, start date, close date, branch, commit | PASS | `templates/ITERATE.md`:4-10. Tests: template CR/status/source-branch/source-commit field tests |
| FR-14 | Ledger carries no copyright/version metadata | PASS | `templates/ITERATE.md`:4-11 (none). Tests: `no copyright metadata field`, `no version metadata field` |
| FR-15 | Ledger has session context, attempt ledger, distillation sections | PASS | `templates/ITERATE.md`:45,57,100. Test: `has the three required sections` |
| FR-16 | Numbered entry: hypothesis, surface, evidence, disposition | PASS | `templates/ITERATE.md`:69-75 |
| FR-17 | Disposition exactly one of kept/discarded/partially-kept | PASS | `templates/ITERATE.md`:75,79-91. Test: `documents all three dispositions` |
| FR-18 | partially-kept states which portion survives/reverted | PASS | `templates/ITERATE.md`:93-98. Test: `documents the partial-keep split` |
| FR-19 | Discarded entries retained, never deleted/overwritten | PASS | `templates/ITERATE.md`:23-29. Test: `states that discarded entries are retained` |
| FR-20 | Continuous commit via existing checkpoint workflow | PASS | SKILL.md:78-79 |
| FR-21 | Every session commit uses `checkpoint({CR_ID}-iterate):` | PASS | SKILL.md:81-85. Live: all 6 phase commits use the scoped form (`git log --grep '^checkpoint(CR-0015-iterate):'`). Test: `specifies the scoped checkpoint subject form` |
| FR-22 | Unsuffixed `checkpoint({CR_ID}):` reserved for core workflow | PASS | SKILL.md:87. Live: only `ea1d00d` finalize uses unsuffixed. Test: `reserves the unsuffixed form for the implementation workflow` |
| FR-23 | Code checkpoint contains its ledger entry atomically | PASS | SKILL.md:97 |
| FR-24 | Revert limited to working tree, no history rewrite | PASS | SKILL.md:139. Test: `contains no destructive Git commands` |
| FR-25 | Closing sets status closed, closing date, populates distillation | PASS | SKILL.md:127-131 |
| FR-26 | Distillation separates patterns from anti-patterns | PASS | SKILL.md:130; `templates/ITERATE.md`:112,118. Test: `separates patterns from anti-patterns` |
| FR-27 | Route close through existing distillation workflow | PASS | SKILL.md:131 |
| FR-28 | Distilled guidance names practice, not CR/session | PASS | SKILL.md:135. Enforced by boundary test 53 `no governance references outside permitted paths` |
| FR-29 | Registered in release config + manifest | PASS | `release-please-config.json`:22-28; `.release-please-manifest.json`:5. Tests: `release-please-config contains checkpoint-iterate component`, `release-please-manifest contains the skill` |
| FR-30 | README skill listing + docs/llms.txt CR entry | PASS | `README.md`:33; `docs/llms.txt`:21. Test: `README lists the skill in Available Skills` |
| FR-31 | Entry written `open` at attempt start, before code change | PASS | `templates/ITERATE.md`:31-36 (ENTRY STATES, verbatim). See Summary note on the SKILL.md loop ordering |
| FR-32 | Session cannot close while any entry open | PASS | SKILL.md:75,127; `templates/ITERATE.md`:35-36. Test: `forbids closing while an entry is open` |
| FR-33 | Ledger records the working tree it was opened in | PASS | `templates/ITERATE.md`:10. Test: `iterate template has a worktree field` |
| FR-34 | Resume reads CR + all settled entries (incl. discarded) + checkpoint commits before proposing | PASS | SKILL.md:54,109-110. Test: `documents the re-hydration procedure` |
| FR-35 | Resume reports recovered state (settled/eliminated/in-flight) | PASS | SKILL.md:54,112. Test: `documents the re-hydration procedure` |
| FR-36 | Resume reconciles open entry, requests disposition before new work | PASS | SKILL.md:113 |
| FR-37 | Never re-propose a discarded approach silently | PASS | SKILL.md:54,115. Test: `forbids silently retrying an eliminated approach` |
| FR-38 | Scoped staging only; never stage whole tree | PASS | SKILL.md:120. Test: `forbids staging the whole working tree` |
| FR-39 | Every invocation identifies CR; refuse+list on ambiguity | PASS | SKILL.md:22,45,121. Test: `documents refusing an ambiguous invocation` |
| FR-40 | Foreign-worktree detection and reporting | PASS | SKILL.md:123. Test: `documents foreign-worktree detection` |
| FR-41 | Concurrent sessions in separate worktrees; one per tree | PASS | SKILL.md:117-119. Test: `requires worktree isolation for concurrent sessions` |
| FR-42 | Session commits matchable by `^checkpoint.*:` and separable by subject query | PASS | SKILL.md:89-95. Live: `git log --grep '^checkpoint.*:'` returns iterate + finalize commits; scoped/unsuffixed greps separate cleanly |

### Non-Functional Requirements

| Req # | Description | Status | Evidence |
|-------|-------------|--------|----------|
| NFR-1 | Ledger append-only within a session | PASS | `templates/ITERATE.md`:23-29 |
| NFR-2 | Skill bundles its own template (installs independently) | PASS | Template lives inside the skill dir: `skills/checkpoint-iterate/templates/ITERATE.md`; SKILL.md:51 references the bundled path |
| NFR-3 | No new runtime/test framework/tooling dependency | PASS | Diff adds only markdown + `.bats` reusing existing bats; no new dep in any changed file |
| NFR-4 | Skill files carry no boundary-violating governance identifiers | PASS | Boundary test 53 `no governance references outside permitted paths` passes with the new files present |
| NFR-5 | Entries readable in isolation | PASS | `templates/ITERATE.md`:60-61 |
| NFR-6 | Re-hydration takes exactly one user action, no follow-up questions | PASS | SKILL.md:107 ("exactly one user action ... with no further questions") and the 5-step procedure 109-113 requires no additional user input to reconstruct state |
| NFR-7 | Ledger is the sole durable record | PASS | `templates/ITERATE.md`:18-21 |

## Acceptance Criteria Verification

| AC # | Description | Status | Evidence |
|------|-------------|--------|----------|
| AC-1 | Session opens with ledger, frontmatter, three sections | PASS | Template field + section tests (CR/status/source-branch/source-commit/worktree/no-copyright/no-version/three-sections); SKILL.md:49-52 |
| AC-2 | Opening against missing CR is refused | PASS | Test: `documents refusing a missing Change Request`; SKILL.md:44 |
| AC-3 | Second invocation resumes, does not restart | PASS | Test: `documents resume rather than restart`; SKILL.md:52 |
| AC-4 | Attempt recorded with disposition (one of three, user-supplied) | PASS | Test: `documents all three dispositions` + `assigns recording to the agent`; SKILL.md:64 |
| AC-5 | Partial keep records the split | PASS | Test: `documents the partial-keep split`; `templates/ITERATE.md`:93-98 |
| AC-6 | Discarded attempts survive in ledger | PASS | Test: `states that discarded entries are retained`; `templates/ITERATE.md`:23-29 |
| AC-7 | Code changes checkpointed with evidence, scoped subject | PASS | Test: `specifies the scoped checkpoint subject form`; SKILL.md:81-85,97. Live: phase commits pair code+ledger under scoped subject |
| AC-8 | Session commits separable from implementation commits | PASS | Tests: scoped-form + `reserves the unsuffixed form`; SKILL.md:89-95. Live: grep separation confirmed |
| AC-9 | Closing populates distillation | PASS | SKILL.md:129-130; template distillation section test |
| AC-10 | Anti-patterns derive from discarded work | PASS | SKILL.md:130; `templates/ITERATE.md`:118; test `separates patterns from anti-patterns` |
| AC-11 | Distilled guidance names practices, not documents | PASS | SKILL.md:135; enforced project-wide by boundary test 53 |
| AC-12 | Skill registered and discoverable | PASS | Tests: release-config/manifest/README; `docs/llms.txt`:21 CR entry (diff-verified) |
| AC-13 | No destructive Git operation | PASS | Test: `contains no destructive Git commands`; SKILL.md:139 |
| AC-14 | User initiates, nothing else does | PASS | Test: `user-initiated and never auto-started`; SKILL.md:33 |
| AC-15 | Agent records without being asked | PASS | Test: `assigns recording to the agent`; SKILL.md:65-66 |
| AC-16 | Evidence precedes the verdict | PASS | Test: `requires evidence before disposition`; SKILL.md:62 |
| AC-17 | Session status is reportable | PASS | SKILL.md:69-71; test `documents all three invocation forms` covers the status form |
| AC-18 | One action re-hydrates a cleared session | PASS | Test: `documents the re-hydration procedure`; SKILL.md:107-113 |
| AC-19 | Interrupted attempt settled before work continues | PASS | SKILL.md:113; re-hydration procedure test |
| AC-20 | Eliminated approaches not silently retried | PASS | Test: `forbids silently retrying an eliminated approach`; SKILL.md:115 |
| AC-21 | Cannot close with work unjudged | PASS | Test: `forbids closing while an entry is open`; SKILL.md:75 |
| AC-22 | Concurrent sessions do not contaminate | PASS | Tests: `forbids staging the whole working tree` + `worktree isolation`; SKILL.md:117-121 |
| AC-23 | Ambiguous invocation refused, not guessed | PASS | Test: `documents refusing an ambiguous invocation`; SKILL.md:45,121 |
| AC-24 | Resumed session detects a foreign working tree | PASS | Test: `documents foreign-worktree detection`; SKILL.md:123 |
| AC-25 | Session commits remain visible to context recovery | PASS | SKILL.md:89-95. Live: `git log --grep '^checkpoint.*:'` returns the iterate commits |
| AC-26 | Suite passes with boundary intact | PASS | `bats -r tests/` = 59/59, boundary test 53 passes |

## Test Strategy Verification

All 34 specified rows are implemented and pass (22 structure + 12 template). Full suite reruns clean at 59/59.

| Test File | Test Name | Specified | Exists | Matches Spec |
|-----------|-----------|-----------|--------|--------------|
| test_skill_structure.bats | SKILL.md exists at correct path | yes | yes | yes |
| test_skill_structure.bats | version.txt exists with valid semver content | yes | yes | yes |
| test_skill_structure.bats | SKILL.md frontmatter has required fields | yes | yes | yes |
| test_skill_structure.bats | SKILL.md contains no destructive Git commands | yes | yes | yes |
| test_skill_structure.bats | release-please-config contains checkpoint-iterate component | yes | yes | yes |
| test_skill_structure.bats | release-please-manifest contains the skill | yes | yes | yes |
| test_skill_structure.bats | README lists the skill in Available Skills | yes | yes | yes |
| test_skill_structure.bats | SKILL.md documents all three invocation forms | yes | yes | yes |
| test_skill_structure.bats | SKILL.md documents refusing a missing Change Request | yes | yes | yes |
| test_skill_structure.bats | SKILL.md documents resume rather than restart | yes | yes | yes |
| test_skill_structure.bats | SKILL.md states the session is user-initiated and never auto-started | yes | yes | yes |
| test_skill_structure.bats | SKILL.md forbids closing while an entry is open | yes | yes | yes |
| test_skill_structure.bats | SKILL.md documents refusing an ambiguous invocation | yes | yes | yes |
| test_skill_structure.bats | SKILL.md documents foreign-worktree detection | yes | yes | yes |
| test_skill_structure.bats | SKILL.md forbids silently retrying an eliminated approach | yes | yes | yes |
| test_skill_structure.bats | SKILL.md assigns recording to the agent | yes | yes | yes |
| test_skill_structure.bats | SKILL.md requires evidence before disposition | yes | yes | yes |
| test_skill_structure.bats | SKILL.md documents the re-hydration procedure | yes | yes | yes |
| test_skill_structure.bats | SKILL.md requires worktree isolation for concurrent sessions | yes | yes | yes |
| test_skill_structure.bats | SKILL.md forbids staging the whole working tree | yes | yes | yes |
| test_skill_structure.bats | SKILL.md specifies the scoped checkpoint subject form | yes | yes | yes |
| test_skill_structure.bats | SKILL.md reserves the unsuffixed form for the implementation workflow | yes | yes | yes |
| test_iterate_template.bats | iterate template has a worktree field | yes | yes | yes |
| test_iterate_template.bats | iterate template documents the open and settled entry states | yes | yes | yes |
| test_iterate_template.bats | iterate template has governing CR field | yes | yes | yes |
| test_iterate_template.bats | iterate template has status field | yes | yes | yes |
| test_iterate_template.bats | iterate template has source-branch and source-commit fields | yes | yes | yes |
| test_iterate_template.bats | iterate template has no copyright metadata field | yes | yes | yes |
| test_iterate_template.bats | iterate template has no version metadata field | yes | yes | yes |
| test_iterate_template.bats | iterate template has the three required sections | yes | yes | yes |
| test_iterate_template.bats | iterate template documents all three dispositions | yes | yes | yes |
| test_iterate_template.bats | iterate template documents the partial-keep split | yes | yes | yes |
| test_iterate_template.bats | iterate template separates patterns from anti-patterns | yes | yes | yes |
| test_iterate_template.bats | iterate template states that discarded entries are retained | yes | yes | yes |

## Diff Coverage

| File | +/- | Mapped Requirements |
|------|-----|---------------------|
| skills/checkpoint-iterate/SKILL.md | +142 | FR-2..FR-12, FR-20..FR-28, FR-31..FR-42, NFR-2/4/6; AC-2..AC-4,AC-7..AC-25 |
| skills/checkpoint-iterate/templates/ITERATE.md | +118 | FR-13..FR-19, FR-31, FR-33, NFR-1/5/7; AC-1,AC-5,AC-6,AC-9,AC-10 |
| skills/checkpoint-iterate/version.txt | +1 | FR-1 |
| skills/checkpoint-iterate/CHANGELOG.md | +1 | FR-1 |
| release-please-config.json | +6 | FR-29; AC-12 |
| .release-please-manifest.json | +2/-1 | FR-29; AC-12 |
| README.md | +1 | FR-30; AC-12 |
| docs/llms.txt | +1 | FR-30; AC-12 |
| tests/checkpoint-iterate/test_skill_structure.bats | +122 | FR-1,FR-3..FR-12,FR-20..FR-42; AC-2..AC-4,AC-13..AC-26 |
| tests/checkpoint-iterate/test_iterate_template.bats | +70 | FR-13..FR-19,FR-33; AC-1,AC-5,AC-6,AC-9,AC-10 |
| tests/checkpoint-iterate/test_helpers/setup.bash | +11 | Test infrastructure (path resolution) |
| docs/cr/CR-0015-checkpoint-iterate.md | +813 | The CR document itself |

### Unmapped changed files
None. Every changed file maps to the CR's Affected Components (the CR document itself, `docs/cr/CR-0015-checkpoint-iterate.md`, is the governing spec and expected in the diff).

## Gaps

None.

Observation (non-blocking, not a gap): The Step 3 attempt loop in `SKILL.md`:56-67 lists the ledger-entry write as step 5 (after the user's verdict), whereas FR-31 and the template's ENTRY STATES block (`templates/ITERATE.md`:31-36) require the entry to be written `open` at the moment the attempt starts, before the code change. The requirement is genuinely and verbatim present in the bundled template and is load-bearing for the re-hydration (SKILL.md:111,113) and close (SKILL.md:75) rules, so FR-31 is satisfied. If a future edit wants the SKILL.md happy-path loop to read consistently with the open-at-start semantics, inserting an explicit "write the entry as `open`" step between current steps 1 and 2 would remove the presentational tension. Minimal, optional, and does not affect any AC or test.
