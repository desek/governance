# Copyright Daniel Grenemark 2026
# @agents-index Structure checks for the iterate-reconcile loop-variant deck, its committed exports, and its CI coverage.

setup() {
  REPO_ROOT="$(cd "$(dirname "${BATS_TEST_FILENAME}")/../.." && pwd)"
  DECK="${REPO_ROOT}/deck/slides/iterate-reconcile/index.tsx"
}

@test "deck source exists" {
  [ -f "$DECK" ]
}

@test "deck ends with Reset" {
  # The last entry of the default export array must be Reset, so the loop closes.
  last="$(sed -n '/^export default \[/,/^\]/p' "$DECK" | grep -v '^export default \[' | grep -v '^\]' | sed 's/[[:space:],]//g' | grep -v '^$' | tail -1)"
  [ "$last" = "Reset" ]
}

@test "deck states the premise" {
  grep -qF 'One-shots are hard' "$DECK"
  grep -qF 'the requirements are written before anyone has seen the result' "$DECK"
}

@test "deck names the shipped commands" {
  grep -qF '/implement-cr' "$DECK"
  grep -qF '/iterate-cr' "$DECK"
  grep -qF '/reconcile-cr' "$DECK"
  grep -qF 'origin: retroactive' "$DECK"
}

@test "deck does not name the retired command" {
  ! grep -qF 'checkpoint-iterate' "$DECK"
}

@test "exports are committed" {
  [ -f "${REPO_ROOT}/docs/deck/iterate-reconcile.html" ]
  [ -f "${REPO_ROOT}/docs/deck/iterate-reconcile.mp4" ]
}

@test "CI checks both decks" {
  wf="${REPO_ROOT}/.github/workflows/docs-deck.yml"
  grep -qF 'checkpoint-distill' "$wf"
  grep -qF 'iterate-reconcile' "$wf"
}
