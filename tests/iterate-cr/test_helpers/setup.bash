# Copyright Daniel Grenemark 2026

# Resolve the repository root relative to this helper file.
# test_helpers/ is at tests/iterate-cr/test_helpers/, so root is three
# levels up.
REPO_ROOT="$(cd "$(dirname "${BATS_TEST_FILENAME}")/../.." && pwd)"

# Skill paths
SKILL_DIR="${REPO_ROOT}/skills/iterate-cr"
SKILL_MD="${SKILL_DIR}/SKILL.md"
ITERATE_TEMPLATE="${SKILL_DIR}/templates/ITERATE.md"
