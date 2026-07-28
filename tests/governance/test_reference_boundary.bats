#!/usr/bin/env bats
# Copyright Daniel Grenemark 2026
#
# Enforces the governance reference boundary: governance identifiers (the
# reference pattern) may appear only inside the permitted territory (the
# governance corpus, its index, the governance-skill placeholder files, and
# this test's own machinery). Any occurrence elsewhere in the working tree is
# a boundary violation and fails the suite. The pattern and the permitted-path
# allowlist are defined once in test_helpers/setup.bash.

setup() {
    load test_helpers/setup.bash
}

@test "no governance references outside permitted paths" {
    # Grep the whole working tree for the reference pattern, skipping the Git
    # directory and binary files. Each match line is `path:lineno:content`; the
    # path is made repository-root-relative and checked against the allowlist.
    # Any match whose path is not permitted is recorded as a violation together
    # with the identifier that matched, so the failure locates itself (FR-7).
    local violations=()
    local line rel_path identifier

    while IFS= read -r line; do
        # Strip the leading "./" that grep prepends when scanning ".".
        rel_path="${line#./}"
        rel_path="${rel_path%%:*}"

        if reference_path_is_allowed "$rel_path"; then
            continue
        fi

        # Extract the specific identifier that triggered the match so the
        # report names both the file and the offending token.
        identifier="$(printf '%s\n' "$line" | grep -oE "$REFERENCE_PATTERN" | head -n1)"
        violations+=("${rel_path}: ${identifier}")
    done < <(cd "$REPO_ROOT" && grep -rnEI "$REFERENCE_PATTERN" . --exclude-dir=.git)

    if [ "${#violations[@]}" -ne 0 ]; then
        echo "Governance reference boundary violated in ${#violations[@]} location(s):"
        printf '  %s\n' "${violations[@]}"
        return 1
    fi
}

@test "governance corpus contains references" {
    # Guard against an exclusion or grep mistake that silently matches nothing:
    # the corpus itself must still contain identifiers, otherwise a dead check
    # would pass vacuously and provide no protection.
    run bash -c "cd '$REPO_ROOT' && grep -rnEI \"$REFERENCE_PATTERN\" docs/cr/"
    [ "$status" -eq 0 ]
    [ -n "$output" ]
}

@test "reference pattern matches all governed prefixes" {
    # The pattern must match each of the five governed prefixes and reject an
    # unrelated hyphenated token, so it neither under- nor over-matches.
    for sample in "CR-0001" "ADR-0123" "FR-3" "NFR-2" "AC-5"; do
        printf '%s\n' "$sample" | grep -qE "$REFERENCE_PATTERN"
    done

    # Negative case: a hyphenated token without a governed prefix must not match.
    ! printf '%s\n' "FOO-42" | grep -qE "$REFERENCE_PATTERN"
}
