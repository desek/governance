# Copyright Daniel Grenemark 2026

# Resolve the repository root relative to this helper file.
# test_helpers/ is at tests/governance/test_helpers/, so root is three levels up.
REPO_ROOT="$(cd "$(dirname "${BATS_TEST_FILENAME}")/../.." && pwd)"

# Template paths
CR_TEMPLATE="${REPO_ROOT}/skills/governance/templates/CR.md"
ADR_TEMPLATE="${REPO_ROOT}/skills/governance/templates/ADR.md"
