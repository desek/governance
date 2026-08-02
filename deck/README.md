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
  licenses/                             OFL texts for the embedded fonts
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

Both halves are committed by hand. The Docs Deck workflow checks the page half
rather than producing it: on a pull request touching `deck/` it rebuilds the
export and fails when `docs/deck/checkpoint-distill.html` does not match, so a
stale export cannot reach `main` unnoticed.

The workflow used to rebuild on `main` and push the result. It cannot: the
default branch ruleset requires every change to arrive through a pull request,
and the Actions token has no bypass for it. A user-owned repository cannot grant
one, because the bypass list offers repository roles, deploy keys, and installed
GitHub Apps, and the Actions token is none of those. The push was rejected with
`GH013` while the workflow otherwise looked healthy, which left the export stale
and said nothing about it.

1. Edit `slides/checkpoint-distill/index.tsx`.
2. `npm run export:png` and read every changed page.
3. `npm run capture`, then diff the first and last frames. The loop closes when
   the per-channel difference stays near zero. The seam is the one defect nobody
   notices until it ships.
4. Copy the MP4 into `docs/deck/` and commit it.
5. Rebuild the page export and commit it in the same pull request:

   ```bash
   npm run build:single && npm run export:html && npm run check:export
   cp html-export/checkpoint-distill.html ../docs/deck/checkpoint-distill.html
   ```

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

## The fonts are embedded

Geist and Geist Mono ship inside the artifact as variable woff2, pulled in
through `@fontsource-variable/*` rather than a `fonts.googleapis.com` stylesheet
link. A file meant to be opened from disk cannot make a webfont request, and the
failure is silent: type falls back to system faces and every measured layout
shifts, with nothing logged.

Variable rather than static, because one file spans weight 100 to 900 and costs
less than the three static weights the deck uses. Verified pixel-identical to
the CDN rendering, and verified offline: with the network disabled the export
loads `Geist Variable` and `Geist Mono Variable` and makes no external request.

Both faces are SIL Open Font License 1.1, which permits embedding and
redistribution provided the notice and licence travel with the fonts. Neither
declares a Reserved Font Name. The full texts are vendored under `licenses/`,
and a short notice sits in the deck stylesheet so it is embedded in the exported
HTML beside the font data.
