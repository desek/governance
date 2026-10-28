# Copyright Daniel Grenemark 2026

# Resolve the repository root relative to this helper file.
REPO_ROOT="$(cd "$(dirname "${BATS_TEST_FILENAME}")/../.." && pwd)"

SKILL_DIR="${REPO_ROOT}/skills/reconcile-cr"
SKILL_MD="${SKILL_DIR}/SKILL.md"
