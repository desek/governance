# CR-0017 Validation Report

## Summary
Requirements: 28/28 | Acceptance Criteria: 18/18 | Tests: 123/123 | Gaps: 0

Scope: `feat/tune-iterate-and-distill`, range `d29a47f...9b397f7` (merge-base `d29a47f`).
Branch diff touches 11 files, all within the CR's Affected Components (plus the CR document itself). No stray changed files.
Verification command (`bats -r tests/`, per the CR): 123 tests, exit 0, 0 failures.
Documentation-only audit; no source modified.

## Requirement Verification

### Functional Requirements
| Req # | Description | Status | Evidence (file:line / test name) |
|---|---|---|---|
| FR-1 | No disposition/verdict required before an entry is recorded | PASS | `skills/checkpoint-iterate/SKILL.md:73`; test `SKILL.md requests no disposition from the user` |
| FR-2 | A change left in the tree is treated as kept | PASS | `skills/checkpoint-iterate/SKILL.md:28`; test `SKILL.md states that a change left in the tree is kept` |
| FR-3 | Does not define kept/discarded/partially-kept as required entry fields | PASS | grep of `skills/checkpoint-iterate/` returns no `discarded`/`partially-kept` (only prohibitory prose); `templates/ITERATE.md:62-68` has no disposition field; tests `SKILL.md defines no disposition vocabulary`, `iterate template has no disposition field` |
| FR-4 | Records supersession naming the earlier entry and why | PASS | `SKILL.md:29,70`; `templates/ITERATE.md:78`; tests `SKILL.md documents supersession naming the earlier entry`, `iterate template carries an optional supersession reference` |
| FR-5 | Never edits/rewrites/deletes a superseded entry | PASS | `SKILL.md:29,136`; test `SKILL.md forbids editing a superseded entry` |
| FR-6 | Defines no open/settled states; close not blocked by an entry | PASS | grep returns no `settled`/entry-state text in `skills/checkpoint-iterate/`; tests `SKILL.md defines no open or settled entry state`, `iterate template has no entry state field` |
| FR-7 | Entry carries change, reason, evidence; optional supersession; no other required field | PASS | `templates/ITERATE.md:75-78`; test `iterate template entry carries change, reason, and evidence` |
| FR-8 | Derives what stands; regenerable summary exempt from append-only | PASS | `SKILL.md:30`; `templates/ITERATE.md:80-90`; test `iterate template carries a derived current-state section` |
| FR-9 | Leaves pace to the user until they say done | PASS | `SKILL.md:36,66`; test `SKILL.md states the session is paced by the user` |
| FR-10 | Agent maintains ledger as side effect, without pausing to collect a judgment | PASS | `SKILL.md:37`; test `SKILL.md assigns recording to the agent` |
| FR-11 | Does not distil or draw conclusions from its own ledger | PASS | `SKILL.md:81,93`; test `SKILL.md performs no distillation` |
| FR-12 | Does not hand off to / invoke / depend on the distillation skill | PASS | `SKILL.md:81`; no `checkpoint-distill` reference in SKILL.md (only unrelated CHANGELOG.md); test `SKILL.md declares no dependency on the distillation skill` |
| FR-13 | Closing = set status + record date, nothing further | PASS | `SKILL.md:81`; test `SKILL.md documents a close of status and date only` |
| FR-14 | Template has no distillation/patterns/anti-patterns section | PASS | `templates/ITERATE.md` (absent); test `iterate template has no distillation section` |
| FR-15 | Retains safety/isolation rules; removes the two disposition-bound bullets | PASS | `SKILL.md:132-136` (destructive Git, refuse missing CR, no editing superseded), `:124-128` (worktree isolation, scoped staging, foreign-worktree), `:53` (ambiguous-invocation refusal); no "verdict verbatim" / evidence-before-disposition bullet remains; test `SKILL.md retains the safety rules` |
| FR-16 | Retains re-hydration; no re-proposing a superseded approach silently | PASS | `SKILL.md:113-120,62`; tests `SKILL.md documents the re-hydration procedure`, `SKILL.md forbids silently retrying an eliminated approach` |
| FR-17 | Distillation draws candidates from ledger entries incl. superseded | PASS | `references/candidate-categories.md:29-37`; `checkpoint-distill/SKILL.md:121`; test `SKILL.md sources candidates from ledger entries` |
| FR-18 | Superseded entry treated as failure-narrative material | PASS | `references/candidate-categories.md:33`; test `SKILL.md treats a superseded entry as failure-narrative material` |
| FR-19 | Requires no findings section; proceeds normally when none present | PASS | `references/candidate-categories.md:41`; test `SKILL.md requires no findings section in the ledger` |
| FR-20 | Reads a legacy findings section as raw candidate material, not a conclusion | PASS | `references/candidate-categories.md:43`; test `SKILL.md reads a legacy findings section as raw candidates` |
| FR-21 | README, docs index, deck updated where they describe removed behaviour | PASS | `README.md:33`; `docs/llms.txt:23`; `deck/slides/checkpoint-distill/index.tsx` (diff removes `disposition:` labels and the keep-discard-keep-part verdict line); tests `README iterate row describes no disposition`, `llms.txt carries this Change Request's entry`, `deck ledger fragment shows no disposition` |
| FR-22 | Both skills' frontmatter descriptions updated | PASS | `checkpoint-iterate/SKILL.md:3`, `checkpoint-distill/SKILL.md:3`; tests `SKILL.md frontmatter description omits disposition and distillation`, `SKILL.md frontmatter description matches the retuned input handling` |

### Non-Functional Requirements
| Req # | Description | Status | Evidence |
|---|---|---|---|
| NFR-1 | No new runtime/test/tooling dependency | PASS | Branch diff adds no dependency manifest, runtime, or framework; changes are prose, template, deck fragment, and bats assertions only |
| NFR-2 | Iterate SKILL.md within the token budget | PASS | Measured out of band: `tiktoken` cl100k = 2,686 tokens for `skills/checkpoint-iterate/SKILL.md`, within the ~5,000-token skill-authoring budget |
| NFR-3 | Loop prose expressed as guidance, not RFC 2119 obligations | PASS | `SKILL.md:66-73` — the four loop movements are numbered guidance with no MUST/MUST NOT; obligation keywords reserved for safety/record-integrity rules |
| NFR-4 | Iterate skill usable with distillation absent | PASS | `SKILL.md:81` removes the close-time dependency; test `SKILL.md declares no dependency on the distillation skill` |
| NFR-5 | No governance identifiers violating the reference boundary | PASS | Governance boundary test `no governance references outside permitted paths` passes over all changed files (test 117) |
| NFR-6 | A ledger under the previous format remains readable by both skills without migration | PASS | Legacy ledger `docs/cr/CR-0016-iterate.md` carries old-format `State:`, `Disposition:`, and a `## Distillation` section; iterate re-hydration reads every entry as-is (`SKILL.md:113-120`) and distill reads the legacy findings section as raw candidate material (`candidate-categories.md:43`). Neither requires migration |

## Acceptance Criteria Verification
| AC # | Description | Status | Evidence |
|---|---|---|---|
| AC-1 | No verdict requested during the loop | PASS | `SKILL.md:73`; test `SKILL.md requests no disposition from the user` |
| AC-2 | A change left in the working tree is kept | PASS | `SKILL.md:28`; test `SKILL.md states that a change left in the tree is kept` |
| AC-3 | Supersession names the earlier entry | PASS | `SKILL.md:29,70`; test `SKILL.md documents supersession naming the earlier entry` |
| AC-4 | A superseded entry is preserved verbatim | PASS | `SKILL.md:29,136`; `templates/ITERATE.md:35-41`; test `SKILL.md forbids editing a superseded entry` |
| AC-5 | The disposition vocabulary is gone | PASS | grep of skill+template returns no required disposition fields; tests `SKILL.md defines no disposition vocabulary`, `iterate template has no disposition field` |
| AC-6 | Entry states are gone; close not blocked | PASS | tests `SKILL.md defines no open or settled entry state`, `iterate template has no entry state field` |
| AC-7 | What stands is derived and marked regenerated | PASS | `SKILL.md:30`; `templates/ITERATE.md:80-90`; test `iterate template carries a derived current-state section` |
| AC-8 | The session is paced by the user | PASS | `SKILL.md:36,66,71`; test `SKILL.md states the session is paced by the user` |
| AC-9 | Closing does nothing but close | PASS | `SKILL.md:81`; test `SKILL.md documents a close of status and date only` |
| AC-10 | The iteration skill does not distil | PASS | `SKILL.md:81,93`; tests `SKILL.md performs no distillation`, `SKILL.md declares no dependency on the distillation skill` |
| AC-11 | The template has no distillation section | PASS | test `iterate template has no distillation section` |
| AC-12 | Distillation sources candidates from the entries | PASS | `candidate-categories.md:29-37,41`; tests `SKILL.md sources candidates from ledger entries`, `SKILL.md requires no findings section in the ledger` |
| AC-13 | A superseded entry is failure-narrative material | PASS | `candidate-categories.md:33`; test `SKILL.md treats a superseded entry as failure-narrative material` |
| AC-14 | A legacy ledger still reads | PASS | Legacy `docs/cr/CR-0016-iterate.md` verified in old format (State/Disposition/Distillation); read by iterate (`SKILL.md:113-120`) and distill (`candidate-categories.md:43`) without migration, findings section ranked not copied; test `SKILL.md reads a legacy findings section as raw candidates` |
| AC-15 | Safety rules survive the retuning | PASS | `SKILL.md:132-136,124-128,53`; test `SKILL.md retains the safety rules` (plus refusal, foreign-worktree, and staging tests) |
| AC-16 | Documentation surfaces match retuned behaviour | PASS | `README.md:33`, `docs/llms.txt:23`, deck fragment, both frontmatters; tests `README iterate row describes no disposition`, `llms.txt carries this Change Request's entry`, `deck ledger fragment shows no disposition`, both frontmatter tests |
| AC-17 | Skill stays within its token budget | PASS | Out-of-band measurement (per CR Out-of-Band Verification): 2,686 tokens < ~5,000 budget |
| AC-18 | Suite passes with the boundary intact | PASS | `bats -r tests/` = 123/123, exit 0; governance boundary test 117 reports no violation |

## Test Strategy Verification
| Test File | Test Name | Specified | Exists | Matches Spec |
|---|---|---|---|---|
| tests/checkpoint-iterate/test_skill_structure.bats | SKILL.md states that a change left in the tree is kept | yes | yes | yes |
| tests/checkpoint-iterate/test_skill_structure.bats | SKILL.md documents supersession naming the earlier entry | yes | yes | yes |
| tests/checkpoint-iterate/test_skill_structure.bats | SKILL.md forbids editing a superseded entry | yes | yes | yes |
| tests/checkpoint-iterate/test_skill_structure.bats | SKILL.md requests no disposition from the user | yes | yes | yes |
| tests/checkpoint-iterate/test_skill_structure.bats | SKILL.md defines no disposition vocabulary | yes | yes | yes |
| tests/checkpoint-iterate/test_skill_structure.bats | SKILL.md defines no open or settled entry state | yes | yes | yes |
| tests/checkpoint-iterate/test_skill_structure.bats | SKILL.md documents a close of status and date only | yes | yes | yes |
| tests/checkpoint-iterate/test_skill_structure.bats | SKILL.md performs no distillation | yes | yes | yes |
| tests/checkpoint-iterate/test_skill_structure.bats | SKILL.md declares no dependency on the distillation skill | yes | yes | yes |
| tests/checkpoint-iterate/test_skill_structure.bats | SKILL.md states the session is paced by the user | yes | yes | yes |
| tests/checkpoint-iterate/test_skill_structure.bats | SKILL.md retains the safety rules | yes | yes | yes |
| tests/checkpoint-iterate/test_skill_structure.bats | SKILL.md records the evidence the entry observed (modify) | yes | yes | yes |
| tests/checkpoint-iterate/test_skill_structure.bats | SKILL.md forbids silently retrying an eliminated approach (modify) | yes | yes | yes |
| tests/checkpoint-iterate/test_skill_structure.bats | SKILL.md documents the re-hydration procedure (modify) | yes | yes | yes |
| tests/checkpoint-iterate/test_skill_structure.bats | SKILL.md assigns recording to the agent (modify) | yes | yes | yes |
| tests/checkpoint-iterate/test_skill_structure.bats | README iterate row describes no disposition | yes | yes | yes |
| tests/checkpoint-iterate/test_skill_structure.bats | SKILL.md frontmatter description omits disposition and distillation | yes | yes | yes |
| tests/checkpoint-iterate/test_iterate_template.bats | iterate template entry carries change, reason, and evidence | yes | yes | yes |
| tests/checkpoint-iterate/test_iterate_template.bats | iterate template carries an optional supersession reference | yes | yes | yes |
| tests/checkpoint-iterate/test_iterate_template.bats | iterate template has no disposition field | yes | yes | yes |
| tests/checkpoint-iterate/test_iterate_template.bats | iterate template has no entry state field | yes | yes | yes |
| tests/checkpoint-iterate/test_iterate_template.bats | iterate template has no distillation section | yes | yes | yes |
| tests/checkpoint-iterate/test_iterate_template.bats | iterate template carries a derived current-state section | yes | yes | yes |
| tests/checkpoint-iterate/test_iterate_template.bats | iterate template keeps the append-only rule for entries | yes | yes | yes |
| tests/checkpoint-iterate/test_iterate_template.bats | iterate template states that superseded entries are retained (modify) | yes | yes | yes |
| tests/checkpoint-iterate/test_iterate_template.bats | iterate template has the three required sections (modify) | yes | yes | yes |
| tests/checkpoint-distill/test_skill_structure.bats | SKILL.md sources candidates from ledger entries | yes | yes | yes |
| tests/checkpoint-distill/test_skill_structure.bats | SKILL.md treats a superseded entry as failure-narrative material | yes | yes | yes |
| tests/checkpoint-distill/test_skill_structure.bats | SKILL.md requires no findings section in the ledger | yes | yes | yes |
| tests/checkpoint-distill/test_skill_structure.bats | SKILL.md reads a legacy findings section as raw candidates | yes | yes | yes |
| tests/checkpoint-distill/test_skill_structure.bats | llms.txt carries this Change Request's entry | yes | yes | yes |
| tests/checkpoint-distill/test_skill_structure.bats | deck ledger fragment shows no disposition | yes | yes | yes |
| tests/checkpoint-distill/test_skill_structure.bats | SKILL.md frontmatter description matches the retuned input handling | yes | yes | yes |
| tests/checkpoint-distill/test_skill_structure.bats | skill requires ledger entries to be ranked not copied (retargeted, Phase 3) | yes | yes | yes |

Removed assertions (open/settled states, three dispositions, partial-keep split, patterns-vs-anti-patterns separation, close-block-on-open) confirmed absent from the retuned test files, corresponding to removed behaviour only.

Out-of-band (AC-17 / NFR-2): iterate `SKILL.md` measured at 2,686 cl100k tokens, within the ~5,000-token budget. Not asserted by the suite, per the CR.

## Diff Coverage
| File | +/- | Mapped Requirements |
|---|---|---|
| skills/checkpoint-iterate/SKILL.md | +78/-… | FR-1..FR-16, NFR-3, NFR-4, FR-22 |
| skills/checkpoint-iterate/templates/ITERATE.md | +96/-… | FR-3, FR-5, FR-6, FR-7, FR-8, FR-14 |
| skills/checkpoint-distill/SKILL.md | +6/-6 | FR-17, FR-19, FR-20, FR-22 |
| skills/checkpoint-distill/references/candidate-categories.md | +18/-… | FR-17, FR-18, FR-19, FR-20 |
| tests/checkpoint-iterate/test_skill_structure.bats | +99/-… | Test Strategy (iterate skill) |
| tests/checkpoint-iterate/test_iterate_template.bats | +68/-… | Test Strategy (iterate template) |
| tests/checkpoint-distill/test_skill_structure.bats | +52/-… | Test Strategy (distill), phase-sequencing retarget |
| README.md | +2/-2 | FR-21, AC-16 |
| docs/llms.txt | +1 | FR-21, AC-16 |
| deck/slides/checkpoint-distill/index.tsx | +15/-… | FR-21, AC-16 |
| docs/cr/CR-0017-tune-iterate-and-distill.md | +650 | The CR document itself |

### Unmapped changed files
None. All 11 changed files fall within the CR's declared Affected Components, plus the CR document itself.

## Gaps
None.
