# Copyright Daniel Grenemark 2026

# Resolve the repository root relative to this helper file.
# test_helpers/ is at tests/checkpoint-read/test_helpers/, so root is three levels up.
REPO_ROOT="$(cd "$(dirname "${BATS_TEST_FILENAME}")/../.." && pwd)"

# Skill paths
SKILL_DIR="${REPO_ROOT}/skills/checkpoint-read"
SKILL_MD="${SKILL_DIR}/SKILL.md"
