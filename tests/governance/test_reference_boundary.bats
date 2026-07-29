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
    done < <(cd "$REPO_ROOT" && grep -rnEI "$REFERENCE_PATTERN" . --exclude-dir=.git --exclude-dir=node_modules --exclude-dir=out)

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

@test "SKILL.md states the boundary rule and links to the guide" {
    # Documentation-content guard for the boundary rule's entry point: the skill
    # index must state the rule and reach the full guidance within one link, so
    # an agent loading the skill encounters it without opening the reference.
    local skill="${REPO_ROOT}/skills/governance/SKILL.md"
    # The rule is stated: identifiers must not cross into the implementation.
    grep -qi "Governance Reference Boundary" "$skill"
    grep -qi "MUST NOT.*written into source code" "$skill"
    # A one-hop markdown link to the guide's boundary section is present.
    grep -q "cr-guide.md#governance-reference-boundary" "$skill"
}

@test "cr-guide documents pattern, territories, and commit mechanism" {
    # Documentation-content guard for the full boundary specification: the guide
    # must define the reference pattern, enumerate both territories as lists, and
    # name Git commit metadata as the mechanism for linking implementation to doc.
    local guide="${REPO_ROOT}/skills/governance/reference/cr-guide.md"
    # The pattern definition appears verbatim (the same string setup.bash greps).
    grep -qF "$REFERENCE_PATTERN" "$guide"
    # Both territories are enumerated as their own sections.
    grep -qi "Permitted territory" "$guide"
    grep -qi "Prohibited territory" "$guide"
    # Git commit metadata is named as the permitted linking mechanism.
    grep -qi "commit messages, branch names" "$guide"
}

@test "doc-updater instruction names no governance identifier" {
    # Documentation-content guard for the corrected workflow step: the removed
    # instruction that directed an identifier into project docs must be gone, and
    # no governance identifier may appear anywhere in the workflow reference.
    local wf="${REPO_ROOT}/skills/governance/reference/cr-implementation-workflow.md"
    # The retired "reference the CR ID" instruction is absent.
    ! grep -qi "reference the CR ID" "$wf"
    # The replacement directs describing behavior without naming the doc.
    grep -qi "do NOT name the governance" "$wf"
    # No governance identifier appears in the file at all.
    ! grep -qE "$REFERENCE_PATTERN" "$wf"
}

@test "no strip-fields instruction remains and AGENTS.md records the template exception" {
    # Documentation-content guard for the retired strip-these-fields guidance:
    # neither document may instruct omitting the removed template fields, and
    # AGENTS.md must record the two templates as a copyright-frontmatter exception.
    local skill="${REPO_ROOT}/skills/governance/SKILL.md"
    local agents="${REPO_ROOT}/AGENTS.md"
    # No surviving instruction tells an agent to omit or strip the removed fields.
    ! grep -qiE "(omit|strip|remove).*(copyright|version)" "$skill"
    ! grep -qiE "(omit|strip|remove).*(copyright|version)" "$agents"
    # The reworded convention states created documents carry no template metadata.
    grep -qi "no template metadata" "$skill"
    # AGENTS.md records the two templates as an explicit exception.
    grep -qi "explicit exception to the copyright frontmatter rule" "$agents"
    grep -qi "two governance templates" "$agents"
}
