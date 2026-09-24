# Copyright Daniel Grenemark 2026

# Resolve the repository root relative to this helper file.
# test_helpers/ is at tests/governance/test_helpers/, so root is three levels up.
REPO_ROOT="$(cd "$(dirname "${BATS_TEST_FILENAME}")/../.." && pwd)"

# Template paths
CR_TEMPLATE="${REPO_ROOT}/skills/governance/templates/CR.md"
ADR_TEMPLATE="${REPO_ROOT}/skills/governance/templates/ADR.md"
GOVERNANCE_SKILL="${REPO_ROOT}/skills/governance/SKILL.md"
CR_GUIDE="${REPO_ROOT}/skills/governance/reference/cr-guide.md"
DOCS_INDEX="${REPO_ROOT}/docs/llms.txt"

# Governance reference pattern: a governance identifier is one of the five
# governed prefixes (CR, ADR, FR, NFR, AC) followed by a hyphen and one or more
# digits. This is the single source of truth for the boundary check; the
# boundary test greps the repository for it and the prefix test exercises it.
REFERENCE_PATTERN='(CR|ADR|FR|NFR|AC)-[0-9]+'

# Permitted-territory allowlist: repository-root-relative paths where the
# reference pattern is legitimately allowed to appear. Directory prefixes end
# in a trailing slash and match every file beneath them; entries without a
# trailing slash match that exact file. Adding a new permitted path is a
# single-line addition to this array (NFR-2). The membership is authoritative:
#   - the governance corpus (docs/cr/, docs/adr/) and its index (docs/llms.txt)
#   - the four governance-skill files whose examples use concrete digit forms
#   - the boundary test's own machinery, which must embed the pattern to run
REFERENCE_ALLOWLIST=(
    "docs/cr/"
    "docs/adr/"
    "docs/llms.txt"
    "skills/governance/templates/CR.md"
    "skills/governance/templates/ADR.md"
    "skills/governance/reference/cr-guide.md"
    "skills/governance/reference/adr-guide.md"
    "tests/governance/test_reference_boundary.bats"
    "tests/governance/test_helpers/setup.bash"
)

# reference_path_is_allowed <repo-relative-path>
# Returns 0 when the given path falls within the permitted-territory allowlist,
# 1 otherwise. A path is permitted when it exactly equals an allowlist file
# entry or begins with an allowlist directory prefix (a trailing-slash entry).
reference_path_is_allowed() {
    local path="$1"
    local entry
    for entry in "${REFERENCE_ALLOWLIST[@]}"; do
        case "$entry" in
            */)
                # Directory prefix: match any path beneath it.
                [[ "$path" == "$entry"* ]] && return 0
                ;;
            *)
                # Exact file entry.
                [[ "$path" == "$entry" ]] && return 0
                ;;
        esac
    done
    return 1
}

# comment_block_text <file>
# Emits the contents of the file's properly delimited HTML comment blocks,
# without the delimiters. A block opens only on a bare `<!--` line and closes
# only on a bare `-->` line, so single-line comments and rendered body text are
# never captured and a Mermaid arrow (`X --> Y`) inside a block does not end
# extraction early.
comment_block_text() {
    awk '/^[[:space:]]*<!--[[:space:]]*$/{c=1;next} /^[[:space:]]*-->[[:space:]]*$/{c=0;next} c' "$1"
}
