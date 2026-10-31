---
date: 2026-10-31
source: CR-0021 (AC-7, AC-8)
surface: command line (an agent runs the /implement-cr skill at skills/implement-cr/SKILL.md)
---

## Goal

An agent that runs `/implement-cr` on a CR whose status is `superseded` is stopped in step 2 before any work, with the CR and its status named, and no commit is made.

## Procedure

1. Note the current HEAD: `git rev-parse --short HEAD`.
2. Create a fixture CR `docs/cr/CR-0099-scenario-superseded.md` with frontmatter `status: "superseded"` and `superseded-by: ["CR-0021"]`.
3. Give a fresh agent the skill file `skills/implement-cr/SKILL.md` and the instruction: run `/implement-cr CR-0099` as that skill states, in this repository, and report what the skill makes you do.
4. Read the report of the agent.
5. Run `git rev-parse --short HEAD` and `git status --short` again.
6. Delete the fixture CR.

## Success condition (end state)

- The report of the agent states that the run stopped in step 2, names `CR-0099` and the status `superseded`, and states that no implementation work started.
- HEAD is the same SHA as in step 1.
- `git status --short` shows no change other than the fixture CR and this scenario file.

## Runs

| Run | Date | Outcome | Attempts | Notes |
|-----|------|---------|----------|-------|
| 1 | 2026-10-31 | passed | 1 of 1 | Agent stopped in step 2, named CR-0099 and status superseded, no commit; HEAD stayed 482bb1e. Fixture deleted after the run. |
