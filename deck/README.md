---
name: deck-readme
description: How the governance walkthrough deck is authored, built, and captured to video.
metadata:
  copyright: Copyright Daniel Grenemark 2026
  version: "0.0.1"
---

# Deck

The governance walkthrough, authored as an [open-slide](https://open-slide.dev)
deck. This is the **master**: the standalone page and the video under
`docs/deck/` are both built from it, and neither should be edited directly.

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

npm run dev            # author with hot reload
npm run build          # static site → dist/
npm run build:single   # inlined build, feeds the export → dist-single/
npm run export:html    # the shipped artifact → html-export/
npm run check:export   # open that artifact from disk and assert no page is blank
npm run export:png     # one PNG per page → png-export/
npm run capture        # single MP4 of the whole deck → video-export/
```

`export:html` produces what gets committed. Always follow it with
`check:export`: a deck that captured nothing still exports cleanly and exits 0,
so opening the file is the only thing that tells the difference.

`export:png` is the visual-verification loop. Each file is exactly 1920×1080 —
the canvas as the audience sees it — and reading the images back catches the
whole class of defects that arithmetic misses: content cropped past the bottom
edge, a heading that wrapped, type too small to read.

A still cannot catch a motion defect. For anything that moves, capture the video
and look at frames across a boundary, not at settled pages.

## Publishing an update

The page half is automated: pushing deck changes to `main` runs the Docs Deck
workflow, which re-exports `docs/deck/checkpoint-distill.html` and commits it
back. The video half is still manual.

1. Edit `slides/checkpoint-distill/index.tsx`.
2. `npm run export:png` and read every changed page.
3. `npm run capture`, then diff the first and last frames. The loop closes when
   the per-channel difference stays near zero. The seam is the one defect nobody
   notices until it ships.
4. Copy the MP4 into `docs/deck/` and commit it. The page re-exports itself.

## Tooling caveat

`open-slide video` is not in any published release of `@open-slide/core`. It
lives on a fork pending upstream release, which is why capture cannot run in
CI and step 3 above stays manual. Until it ships, point the dependency at a
local checkout of the fork to capture:

```bash
npm install --no-save /path/to/open-slide/packages/core
```

Everything else the deck needs, `MorphElement` and `useIsActivePage` included,
is in the published version it pins. Capture also needs `ffmpeg` on `PATH` and
a Chromium for Playwright (`npx playwright install chromium`).

## Two artifacts, and why `build:single` is not one of them

`docs/deck/` holds exactly two files:

| File | Job | Motion |
|---|---|---|
| `checkpoint-distill.html` | the deck, opens from disk | settled states only |
| `checkpoint-distill.mp4` | the walkthrough as film | full |

The standalone file comes from open-slide's own HTML export, which renders every
page through React, keeps the markup, inlines the readable CSS, and ships a few
lines of vanilla JavaScript for scale-to-fit and arrow-key navigation. It has no
router, which is why it opens over `file://` where a single-page build cannot.

What it loses is motion. Pages are captured as markup and revealed by toggling
`hidden`, so entrance animations and the morph transitions are gone. Each page
shows its settled state, which is the honest end of the animation rather than a
broken frame: on the merge page the six checkpoint commits have already crushed
away. Reach for the MP4 when the motion is the argument.

`build:single` still runs, but nothing it emits is shipped. The exporter bundles
same-origin assets into a **zip** whenever it finds any, and against a plain
`open-slide build` it finds five Geist `woff2` files and produces exactly that.
Inlining them first leaves nothing to collect, so the export comes out as one
openable file. That is the build's whole remaining job.

open-slide exposes this export only through its UI, so `export.html.mjs` drives
the real browser and catches the download. There is no CLI command to call.

## The fonts are not bundled

The deck pulls Geist and Geist Mono from `fonts.googleapis.com` through an
`@import` in its stylesheet, so the "self-contained" page is self-contained
apart from its typography: opened without a network it falls back to system
faces and every measured layout shifts. Vendoring the woff2 files through
`@fontsource` would close this; nothing depends on the `@import` staying.
