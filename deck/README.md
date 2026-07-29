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

npm run dev            # author with hot reload
npm run build          # static site → dist/
npm run build:single   # one self-contained HTML file → dist-single/
npm run check:single   # render that file headlessly and assert it is not blank
npm run export:html    # standalone, openable HTML file → html-export/
npm run export:png     # one PNG per page → png-export/
npm run capture        # single MP4 of the whole deck → video-export/
```

`build:single` is what produces the committed page. `open-slide build` emits an
index.html plus a directory of content-hashed assets; inlining them into one
file keeps `docs/deck/` to a single page and a single video, and stops every
rebuild from churning a fresh set of filenames.

Always follow it with `check:single`. The build cannot tell a working page from
a blank one, and has shipped a blank one before: the inlining plugin rewrites
`base` to `./`, which open-slide turns into a router basename of `/./` that
matches no route. That failure exits 0 and logs a console warning nobody reads.

`export:png` is the visual-verification loop. Each file is exactly 1920×1080 —
the canvas as the audience sees it — and reading the images back catches the
whole class of defects that arithmetic misses: content cropped past the bottom
edge, a heading that wrapped, type too small to read.

A still cannot catch a motion defect. For anything that moves, capture the video
and look at frames across a boundary, not at settled pages.

## Publishing an update

The page half is automated: pushing deck changes to `main` runs the Docs Deck
workflow, which rebuilds `docs/deck/index.html` and commits it back. The video
half is still manual.

1. Edit `slides/checkpoint-distill/index.tsx`.
2. `npm run export:png` and read every changed page.
3. `npm run capture`, then diff the first and last frames. The loop closes when
   the per-channel difference stays near zero. The seam is the one defect nobody
   notices until it ships.
4. Copy the MP4 into `docs/deck/` and commit it. The page rebuilds itself.

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

## Three artifacts, three jobs

`docs/deck/` holds all three. They are not redundant.

| File | Job | Motion |
|---|---|---|
| `index.html` | the hosted page, full open-slide viewer | live |
| `checkpoint-distill.html` | standalone, opens from disk | settled states only |
| `checkpoint-distill.mp4` | the walkthrough as film | full |

The standalone file comes from open-slide's own HTML export, which renders every
page through React, keeps the markup, inlines the readable CSS, and ships a few
lines of vanilla JavaScript for scale-to-fit and arrow-key navigation. It has no
router, which is precisely why it opens over `file://` when the hosted page
cannot.

What it loses is motion. Pages are captured as markup and revealed by toggling
`hidden`, so entrance animations and the morph transitions between pages are
gone. Each page shows its settled state, which is the honest end of the
animation rather than a broken frame: on the merge page, for instance, the six
checkpoint commits have already crushed away. Reach for the MP4 when the motion
is the argument.

open-slide exposes this export only through its UI, so `export.html.mjs` drives
the real browser and catches the download. There is no CLI command to call.

## The page must be served, not opened

Double-clicking `docs/deck/index.html` shows the deck's not-found page. That is
not a build defect and no flag fixes it.

open-slide builds a single-page app on React Router's `BrowserRouter`, which
routes by URL path. A `file://` document has origin `null`, and Chrome refuses
any path-changing `pushState` or `replaceState` there with a `SecurityError`, so
the app can never reach `/s/checkpoint-distill` and falls through to not-found.
Only a hash-based router would work over `file://`, and open-slide does not use
one. The multi-file build had the same problem in a different costume: it
referenced `/assets/...` absolutely, which over `file://` resolves against the
filesystem root and loads nothing at all.

Serve it instead:

```bash
.agents/scripts/serve-deck.sh        # → http://127.0.0.1:8080/s/checkpoint-distill
```

The MP4 next to it has no such constraint and plays from disk.

## The fonts are not bundled

The deck pulls Geist and Geist Mono from `fonts.googleapis.com` through an
`@import` in its stylesheet, so the "self-contained" page is self-contained
apart from its typography: opened without a network it falls back to system
faces and every measured layout shifts. Vendoring the woff2 files through
`@fontsource` would close this; nothing depends on the `@import` staying.
