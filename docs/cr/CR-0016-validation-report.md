# CR-0016 Validation Report

## Summary
Requirements: 43/43 (37 FR + 6 NFR) | Acceptance Criteria: 26/26 | Tests: 36/36 (suite 95/95) | Gaps: 0

Validated on branch `feat/checkpoint-distill` at checkpoint `9f1b9da`, diffed against `d6f2e1e` (tip of main). Quality gate `bats -r tests/` run locally: 95 passing, 0 failing. The checkpoint-distill test file contributes 36 tests, exactly matching the 36-row Test Strategy table. All ten changed files fall within the declared Affected Components; no stray files.

This is a documentation-only skill: its "behaviour" is a specified workflow. Each acceptance criterion is verified by a passing grep-based structure test asserting the load-bearing prose is present, not merely that a file exists — so evidence is passing test names from the runner, not bare file:line existence.

## Requirement Verification

| Req # | Description | Status | Evidence (file:line / test name) |
|---|---|---|---|
| FR-1 | Skill dir with SKILL.md, version.txt, CHANGELOG.md matching existing skills | PASS | `skills/checkpoint-distill/SKILL.md`, `version.txt:1` (`0.1.0`), `CHANGELOG.md:1`; identical shape to `skills/checkpoint-iterate/`. Tests 1-4 |
| FR-2 | Slash command accepting CR identifier; CR scope is the default | PASS | SKILL.md:20 (`**This is the default mode.**`), :29-31. Test "documents Change Request scope as the default" |
| FR-3 | Branch scoped mode delimited by merge base | PASS | SKILL.md:21, :33-35, :85-94. Test "documents branch scope delimited by merge base" |
| FR-4 | MUST NOT define an arbitrary N-most-recent-commits mode | PASS | SKILL.md:23, :247. Test "defines no recent-commit-count mode" asserts prose + genuine absence of `/checkpoint-distill (-n\|--count\|--last\|--recent\|--number\|[0-9]+)` |
| FR-5 | CR run gathers CR doc, validation report, iteration ledger where each exists | PASS | SKILL.md:61-68 (input table + resolution). Test "names all four inputs" |
| FR-6 | Also gather commits matching BOTH plain and `-iterate` subject scopes | PASS | SKILL.md:70-83; both greps shown (`checkpoint(CR-XXXX):` and `checkpoint(CR-XXXX-iterate):`), combined form at :80, "MUST match both scopes" at :83. Reviewer defect fully addressed |
| FR-7 | Report which inputs found/absent before any finding | PASS | SKILL.md:96-101 (`MUST precede any finding`). Test "requires an availability report before findings" |
| FR-8 | State when commit input unavailable; not equivalent to one that had it | PASS | SKILL.md:101 (`MUST NOT present itself as equivalent`). Test "documents the squash merge consequence" |
| FR-9 | Document commits gone after squash merge; needing them means run before merge | PASS | SKILL.md:103 (`only in the window between the work finishing and the branch merging`) |
| FR-10 | Refuse on unresolvable identifier; name it | PASS | SKILL.md:41 (`MUST refuse`, `MUST report which identifier`). Test "documents refusal on an unresolvable identifier" |
| FR-11 | Ledger closing findings reconciled and ranked, not copied unranked | PASS | SKILL.md:135-139 (`input, not passthrough`, `MUST NOT write ... unranked`). Test "requires ledger findings to be ranked not copied" |
| FR-12 | Read standing instructions in full before identifying candidates | PASS | SKILL.md:113-115 (`in their entirety`, `Before a single candidate`). Test "requires reading standing instructions first" |
| FR-13 | Partial coverage narrowed to the uncovered gap | PASS | SKILL.md:117 (`the candidate is the **uncovered gap**, never the whole topic`) |
| FR-14 | Candidates across invariants, failures, patterns, foot-guns, drift | PASS | SKILL.md:120-127 (five numbered categories). Test "documents all five candidate categories" |
| FR-15 | Failure narratives rank above equivalent-leverage categories | PASS | SKILL.md:124, :159 (`a failure narrative outranks the others`) |
| FR-16 | Score on leverage, decay risk, cost of breakage | PASS | SKILL.md:145-149. Test "documents the three scoring dimensions" |
| FR-17 | Sort into three tiers, must-add to optional | PASS | SKILL.md:153-157. Test "documents three ranked tiers" |
| FR-18 | Default to analysis without modification, present and stop | PASS | SKILL.md:45-47 (`reads its inputs, presents its findings, and **stops**`). Test "defaults to analysis without modification" |
| FR-19 | MUST NOT modify any file in default analysis mode | PASS | SKILL.md:47, :179, :248. Test "defaults to analysis without modification" |
| FR-20 | Approval per tier; approve one while declining another | PASS | SKILL.md:48, :180 (`only an approved tier is written`). Test "requires per-tier approval" |
| FR-21 | No invocation writes every tier without selection | PASS | SKILL.md:49, :181, :249. Test "offers no write-all-tiers invocation" asserts prose + genuine absence of `--(all\|apply-all\|write-all\|auto\|force-apply\|yes)` |
| FR-22 | Ruled-out candidate stated with reason, not omitted silently | PASS | SKILL.md:171-173 (`MUST be reported as ruled out`, `never dropped silently`). Test "requires ruled-out candidates to be stated with a reason" |
| FR-23 | Every finding traces to a source (file location or commit hash) | PASS | SKILL.md:131 (`MUST trace to a specific source artifact`). Test "requires findings to trace to a source" |
| FR-24 | MUST NOT record a finding whose reasoning can't be reconstructed; request context | PASS | SKILL.md:133 (`MUST NOT record the candidate on a guessed rationale ... MUST instead query for the missing context`) |
| FR-25 | Written as narrative prose, not bare constraints | PASS | SKILL.md:189-195. Test "requires narrative output carrying reasoning" |
| FR-26 | Each rule carries mechanism, cost, history | PASS | SKILL.md:191-193 (three bullets); worked example :197. Test "requires narrative output carrying reasoning" |
| FR-27 | Discover target structure by reading; assume no sectioning/index/naming | PASS | SKILL.md:199-201 (`discovered by reading it, never assumed`). Test "requires discovering the target structure" |
| FR-28 | Additions match target voice, formatting, cross-referencing | PASS | SKILL.md:203 |
| FR-29 | Cross-reference an existing rule rather than restate it | PASS | SKILL.md:205-207. Test "requires cross-referencing an existing rule rather than restating it" |
| FR-30 | Correct a contradicted statement rather than add alongside | PASS | SKILL.md:209-211 (`corrects that statement in place`, `does not add a new, true statement alongside the stale one`). Test "requires correcting contradicted statements" |
| FR-31 | Written guidance names the practice, not CR/session/commit | PASS | SKILL.md:213-215, :240-242. Test "forbids naming the source document in written guidance" |
| FR-32 | Never delete standing content; raise pruning as separate finding | PASS | SKILL.md:217-219. Test "forbids deleting existing guidance" |
| FR-33 | No destructive Git operations | PASS | SKILL.md:221-223, :250. Test "contains no destructive Git commands" |
| FR-34 | After writing, create checkpoint commit for governing CR | PASS | SKILL.md:225-227. Test "documents the closing checkpoint commit and landed-or-deferred report" |
| FR-35 | Report what landed and which tiers deferred with reason | PASS | SKILL.md:229-234. Same test as FR-34 (asserts `What landed` and `What was deferred`) |
| FR-36 | Registered in release config and manifest | PASS | `release-please-config.json:29-34`, `.release-please-manifest.json:6`. Tests "release-please-config contains the component", "release-please-manifest contains the skill" |
| FR-37 | README skill listing + docs index CR entry | PASS | `README.md:34`, `docs/llms.txt:22`. Tests "README lists the skill", "llms.txt lists the Change Request entry" |
| NFR-1 | No new runtime, test framework, or tooling dependency | PASS | Diff adds only markdown/json/bats-prose; reuses existing bats. No dependency manifests touched |
| NFR-2 | Usable with no ledger and no validation report; degrade | PASS | SKILL.md:105-107 (`degrading to the Change Request document alone`). Test "documents degradation to available inputs" |
| NFR-3 | Repeating analysis over unchanged scope yields no duplicates | PASS | SKILL.md:115 (`re-running it over an unchanged scope proposes nothing new`), :179. Test "documents idempotent re-analysis" |
| NFR-4 | Skill/tests/helpers use digitless identifiers | PASS | `grep -rnE 'CR-[0-9]' skills/checkpoint-distill/ tests/checkpoint-distill/` returns none; boundary test 89 passes |
| NFR-5 | Encode no project-specific structure/section naming/subject matter | PASS | SKILL.md:236-238 (Portability); worked example :197 explicitly generic. Test "encodes no project-specific structure" asserts genuine absence of `(AGENTS\|CLAUDE)\.md` |
| NFR-6 | Report scannable in about a minute | PASS | SKILL.md:161-169 (`scannable in about a minute`, three-item per-candidate shape) |

## Acceptance Criteria Verification

| AC # | Description | Status | Evidence |
|---|---|---|---|
| AC-1 | CR scope is the default; no commit-count bound | PASS | SKILL.md:20, :29-31, :23. Tests 6, 8 |
| AC-2 | Branch scope delimited by merge base | PASS | SKILL.md:33-35, :85-94. Test 7 |
| AC-3 | Unresolvable identifier refused and reported | PASS | SKILL.md:41. Test "documents refusal on an unresolvable identifier" |
| AC-4 | Inputs reported before findings | PASS | SKILL.md:96-101. Test "requires an availability report before findings" |
| AC-5 | Missing commit input stated, not hidden | PASS | SKILL.md:101, :103. Test "documents the squash merge consequence" |
| AC-6 | Degrades to inputs that exist | PASS | SKILL.md:105-107. Test "documents degradation to available inputs" |
| AC-7 | Ledger findings ranked, not copied | PASS | SKILL.md:135-139. Test "requires ledger findings to be ranked not copied" |
| AC-8 | Existing knowledge not re-proposed; partial gap proposed | PASS | SKILL.md:113-117. Test "requires reading standing instructions first" |
| AC-9 | Three tiers; failure narrative outranks equal-leverage peer | PASS | SKILL.md:153-159. Tests "documents three ranked tiers", "documents the three scoring dimensions" |
| AC-10 | Analysis modifies nothing; stops for approval | PASS | SKILL.md:45-47, :179. Test "defaults to analysis without modification" |
| AC-11 | Approval per tier | PASS | SKILL.md:180. Test "requires per-tier approval" |
| AC-12 | No invocation writes all tiers unselected | PASS | SKILL.md:49, :181. Test "offers no write-all-tiers invocation" (genuine-absence flag grep) |
| AC-13 | Ruled-out candidates stated with reason | PASS | SKILL.md:171-173. Test "requires ruled-out candidates to be stated with a reason" |
| AC-14 | Every finding traces to a source; unreconstructable not recorded | PASS | SKILL.md:131-133. Test "requires findings to trace to a source" |
| AC-15 | Written rules carry mechanism, cost, history as prose | PASS | SKILL.md:189-197. Test "requires narrative output carrying reasoning" |
| AC-16 | Target structure discovered, not assumed | PASS | SKILL.md:199-203. Test "requires discovering the target structure" |
| AC-17 | Contradicted statements corrected, not supplemented | PASS | SKILL.md:209-211. Test "requires correcting contradicted statements" |
| AC-18 | Guidance names practices, not documents | PASS | SKILL.md:213-215, :240-242. Test "forbids naming the source document in written guidance" |
| AC-19 | Existing guidance never deleted; pruning raised separately | PASS | SKILL.md:217-219. Test "forbids deleting existing guidance" |
| AC-20 | No destructive Git operation | PASS | SKILL.md:221-223, :250. Test "contains no destructive Git commands" |
| AC-21 | Writing produces checkpoint commit + landed/deferred report | PASS | SKILL.md:225-234. Test "documents the closing checkpoint commit and landed-or-deferred report" |
| AC-22 | Encodes no project-specific structure | PASS | SKILL.md:236-238. Test "encodes no project-specific structure" |
| AC-23 | Repeating analysis does not duplicate | PASS | SKILL.md:115, :179. Test "documents idempotent re-analysis" |
| AC-24 | Registered and discoverable (config, manifest, README, docs index) | PASS | Config :29-34; manifest :6; README :34; llms.txt :22. Four registration tests |
| AC-25 | Suite passes with boundary intact | PASS | `bats -r tests/` 95/95; boundary test 89 passes; NFR-4 grep clean |
| AC-26 | Existing rule cross-referenced, not restated | PASS | SKILL.md:205-207. Test "requires cross-referencing an existing rule rather than restating it" |

## Test Strategy Verification

Table lists 36 rows; 36 tests implemented in `tests/checkpoint-distill/test_skill_structure.bats`. Row count matches; no row silently dropped. All 36 pass.

| Test File | Test Name | Specified | Exists | Matches Spec |
|---|---|---|---|---|
| test_skill_structure.bats | SKILL.md exists at correct path | yes | yes | yes |
| test_skill_structure.bats | version.txt exists with valid semver content | yes | yes | yes (regex, not hardcoded) |
| test_skill_structure.bats | CHANGELOG.md exists | yes | yes | yes |
| test_skill_structure.bats | SKILL.md frontmatter has required fields | yes | yes | yes |
| test_skill_structure.bats | SKILL.md contains no destructive Git commands | yes | yes | yes |
| test_skill_structure.bats | SKILL.md documents Change Request scope as the default | yes | yes | yes |
| test_skill_structure.bats | SKILL.md documents branch scope delimited by merge base | yes | yes | yes |
| test_skill_structure.bats | SKILL.md defines no recent-commit-count mode | yes | yes | yes (prose + absence) |
| test_skill_structure.bats | SKILL.md names all four inputs | yes | yes | yes |
| test_skill_structure.bats | SKILL.md requires an availability report before findings | yes | yes | yes |
| test_skill_structure.bats | SKILL.md documents the squash merge consequence | yes | yes | yes |
| test_skill_structure.bats | SKILL.md requires ledger findings to be ranked not copied | yes | yes | yes |
| test_skill_structure.bats | SKILL.md requires reading standing instructions first | yes | yes | yes |
| test_skill_structure.bats | SKILL.md documents all five candidate categories | yes | yes | yes |
| test_skill_structure.bats | SKILL.md documents the three scoring dimensions | yes | yes | yes |
| test_skill_structure.bats | SKILL.md documents three ranked tiers | yes | yes | yes |
| test_skill_structure.bats | SKILL.md defaults to analysis without modification | yes | yes | yes |
| test_skill_structure.bats | SKILL.md requires per-tier approval | yes | yes | yes |
| test_skill_structure.bats | SKILL.md offers no write-all-tiers invocation | yes | yes | yes (prose + absence) |
| test_skill_structure.bats | SKILL.md requires findings to trace to a source | yes | yes | yes |
| test_skill_structure.bats | SKILL.md requires narrative output carrying reasoning | yes | yes | yes |
| test_skill_structure.bats | SKILL.md requires discovering the target structure | yes | yes | yes |
| test_skill_structure.bats | SKILL.md requires correcting contradicted statements | yes | yes | yes |
| test_skill_structure.bats | SKILL.md forbids naming the source document in written guidance | yes | yes | yes |
| test_skill_structure.bats | SKILL.md forbids deleting existing guidance | yes | yes | yes |
| test_skill_structure.bats | SKILL.md encodes no project-specific structure | yes | yes | yes (prose + absence) |
| test_skill_structure.bats | release-please-config contains the component | yes | yes | yes |
| test_skill_structure.bats | release-please-manifest contains the skill | yes | yes | yes |
| test_skill_structure.bats | README lists the skill in Available Skills | yes | yes | yes |
| test_skill_structure.bats | llms.txt lists the Change Request entry | yes | yes | yes |
| test_skill_structure.bats | SKILL.md documents refusal on an unresolvable identifier | yes | yes | yes |
| test_skill_structure.bats | SKILL.md documents degradation to available inputs | yes | yes | yes |
| test_skill_structure.bats | SKILL.md requires ruled-out candidates to be stated with a reason | yes | yes | yes |
| test_skill_structure.bats | SKILL.md documents the closing checkpoint commit and landed-or-deferred report | yes | yes | yes |
| test_skill_structure.bats | SKILL.md documents idempotent re-analysis | yes | yes | yes |
| test_skill_structure.bats | SKILL.md requires cross-referencing an existing rule rather than restating it | yes | yes | yes |

### Prohibition tests — verified genuine (test bodies read, not names trusted)

The CR's finalization claim that the three absence-asserting tests would fail if prohibited content were present is confirmed by reading each body:

- **`defines no recent-commit-count mode`** (bats:56-62): beyond the prose grep, `! grep -qE '/checkpoint-distill[[:space:]]+(-n|--count|--last|--recent|--number|[0-9]+)'` fails the moment any N-commit invocation is introduced. Genuine.
- **`offers no write-all-tiers invocation`** (bats:124-129): beyond the prose grep, `! grep -qiE '\-\-(all|apply-all|write-all|auto|force-apply|yes)'` fails if a bypass flag is added. Genuine.
- **`encodes no project-specific structure`** (bats:168-175): beyond the prose grep, `! grep -qE '(AGENTS|CLAUDE)\.md'` fails if the skill hardcodes a concrete standing-instructions target. Genuine.
- **`contains no destructive Git commands`** (bats:41): filters prohibition lines then asserts no surviving line issues `git reset|rebase|commit|push --force|amend`. The `git log --grep` and `git merge-base` usages in the skill do not match the destructive pattern. Genuine.

Independent confirmation of FR-27 / NFR-5: a manual scan of SKILL.md found no foreign project's section names, document organisation, or subject-matter examples. The one worked example (bats-adjacent, SKILL.md:197, a handle/lock race) is explicitly labelled "Worked shape (generic)" and encodes no repository's structure.

## Diff Coverage

| File | +/- | Mapped Requirements |
|---|---|---|
| skills/checkpoint-distill/SKILL.md | +250 | FR-2 through FR-35, NFR-2/3/5/6 |
| skills/checkpoint-distill/version.txt | +1 | FR-1 |
| skills/checkpoint-distill/CHANGELOG.md | +1 | FR-1 |
| release-please-config.json | +6 | FR-36, AC-24 |
| .release-please-manifest.json | +1/-1 | FR-36, AC-24 |
| README.md | +1 | FR-37, AC-24 |
| docs/llms.txt | +1 | FR-37, AC-24 |
| tests/checkpoint-distill/test_skill_structure.bats | +226 | Test Strategy (36 rows), AC-25 |
| tests/checkpoint-distill/test_helpers/setup.bash | +10 | Test Strategy (helper), NFR-4 |
| docs/cr/CR-0016-checkpoint-distill.md | +728 | The CR itself (governance corpus) |

### Unmapped changed files
None. Every changed file maps to the CR's Affected Components list, and every Functional/Non-Functional Requirement and AC maps to at least one changed file with specific evidence.

## Gaps
None.
