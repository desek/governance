# Copyright Daniel Grenemark 2026

# Resolve the repository root relative to this helper file.
# test_helpers/ is at tests/checkpoint-distill/test_helpers/, so root is three
# levels up.
REPO_ROOT="$(cd "$(dirname "${BATS_TEST_FILENAME}")/../.." && pwd)"

# Skill paths
SKILL_DIR="${REPO_ROOT}/skills/checkpoint-distill"
SKILL_MD="${SKILL_DIR}/SKILL.md"

# The skill package: SKILL.md plus its one-level-deep references/. Behaviour
# assertions grep the package rather than SKILL.md alone, because progressive
# disclosure legitimately moves explanatory prose out of SKILL.md into
# references/ — the requirement is that the skill documents the behaviour, not
# that any one file carries the sentence.
REFERENCES_DIR="${SKILL_DIR}/references"

# grep the whole skill package, quietly and case-insensitively.
skill_package_has() {
    grep -rqi -- "$1" "$SKILL_MD" "$REFERENCES_DIR"
}
