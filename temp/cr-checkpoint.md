<change_request>
@__SPEC_PATH__
</change_request>

<objective>
Create an iterative Git checkpoint for the `change_request` commit that includes all staged and unstaged changes.
</objective>

<instructions>
1. Analyze all staged and unstaged changes in the current repository.
   - List changed files (unstaged + staged + untracked):
     - `git status --porcelain=v1`
     - `git diff --name-status`
     - `git diff --name-status --staged`
     - `git ls-files --others --exclude-standard`
   - Read the actual diffs (whole repo, then per-file as needed):
     - `git diff`
     - `git diff --staged`
     - `git diff -- {path}`
     - `git diff --staged -- {path}`
     - For untracked files, view a diff against empty:
       - `git diff --no-index -- /dev/null {path}`
2. Write a one-sentence summary of the change.
3. Create a commit message in this exact structure:
   - Subject line: `checkpoint: {one sentence summary}`
   - Body: a detailed summary of the changes (multiple sentences / bullet points).
4. Stage everything (including unstaged changes) and commit using the message above.
   - Use CLI commands that work for both tracked and untracked files:
     - `git add -A`
     - `git commit -m "checkpoint(CR-xxxx): {one sentence summary}" -m "{detailed summary of the changes}"`
5. Do NOT reset the branch, rebase, amend, or perform any other Git operations beyond creating this single checkpoint commit.
</instructions>