---
name: deck-readme
description: How the governance walkthrough deck is authored, built, and captured to video.
metadata:
  copyright: Copyright Daniel Grenemark 2026
  version: "0.0.1"
---

# Deck

The governance walkthrough, authored as an [open-slide](https://open-slide.dev)
deck. This is the **master** — the static page and the video under `docs/deck/`
are both built from it, and neither should be edited directly.

A Remotion implementation of the same walkthrough was retired once open-slide
could capture a deck frame by frame. Two renderers meant two versions of one
design drifting apart; there is now a single source.

## Layout

```
deck/
  slides/checkpoint-distill/index.tsx   the deck — one file, by open-slide convention
  open-slide.config.ts
  package.json
```

Visual and motion rules live in `DESIGN.md` at the repository root. Read it
before changing anything that moves.

## Commands

```bash
npm install

npm run dev          # author with hot reload
npm run build        # static site → dist/
npm run export:png   # one PNG per page → png-export/
npm run capture      # single MP4 of the whole deck → video-export/
```

`export:png` is the visual-verification loop. Each file is exactly 1920×1080 —
the canvas as the audience sees it — and reading the images back catches the
whole class of defects that arithmetic misses: content cropped past the bottom
edge, a heading that wrapped, type too small to read.

A still cannot catch a motion defect. For anything that moves, capture the video
and look at frames across a boundary, not at settled pages.

## Publishing an update

1. Edit `slides/checkpoint-distill/index.tsx`.
2. `npm run export:png` and read every changed page.
3. `npm run capture`, then diff the first and last frames — the loop closes when
   the per-channel difference stays near zero. The seam is the one defect nobody
   notices until it ships.
4. Copy `dist/` and the MP4 into `docs/deck/` and commit both.

## Tooling caveat

The deck uses `MorphElement` and `useIsActivePage`, and the capture uses
`open-slide video`. None of the three is in the published `@open-slide/core`
yet — they exist in a fork pending release upstream.

`package.json` therefore pins the published version, which is the correct target
state but cannot currently build this deck. Until the release lands, point the
dependency at a local checkout of the fork to build or capture:

```bash
npm install --no-save /path/to/open-slide/packages/core
```

Remove that override once the features ship; nothing else needs to change.

Capture also needs `ffmpeg` on `PATH` and a Chromium for Playwright
(`npx playwright install chromium`).
