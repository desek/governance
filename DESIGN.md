---
version: alpha
name: Instrument Diagram
description: >-
  The visual identity of the governance walkthrough: an abstract technical
  low-poly style built entirely from generated geometry, authored as an
  open-slide deck and captured frame by frame to video.
omitted:
  - section: elevation
    reason: "Depth is carried by parallax planes and defocus, not by shadows or elevation levels."
colors:
  primary: "#f0883e"
  secondary: "#a371f7"
  neutral: "#30363d"
  surface: "#0d1117"
  surface-raised: "#161b22"
  surface-inset: "#0a0e14"
  on-surface: "#e6edf3"
  on-surface-muted: "#8b949e"
  on-surface-emphasis: "#ffffff"
  state-kept: "#3fb950"
  state-partial: "#d29922"
  state-discarded: "#f85149"
typography:
  headline-display:
    fontFamily: Geist
    fontSize: 149px
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: -0.025em
  headline-lg:
    fontFamily: Geist
    fontSize: 103px
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Geist
    fontSize: 78px
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Geist
    fontSize: 62px
    fontWeight: 400
    lineHeight: 1.45
  body-md:
    fontFamily: Geist
    fontSize: 43px
    fontWeight: 400
    lineHeight: 1.5
  code-lg:
    fontFamily: Geist Mono
    fontSize: 32px
    fontWeight: 400
    lineHeight: 1.4
  code-md:
    fontFamily: Geist Mono
    fontSize: 27px
    fontWeight: 400
    lineHeight: 1.55
  code-sm:
    fontFamily: Geist Mono
    fontSize: 26px
    fontWeight: 400
    lineHeight: 1.55
  label-caps:
    fontFamily: Geist Mono
    fontSize: 26px
    fontWeight: 400
    letterSpacing: 0.18em
spacing:
  safe-x: 142px
  safe-y: 178px
  station-gap: 2200px
  graticule: 118.46px
  chip-pitch: 74px
  stack: 26px
  block: 40px
rounded:
  sm: 8px
  md: 10px
  lg: 12px
  full: 9999px
components:
  terminal:
    backgroundColor: "{colors.surface-inset}"
    borderColor: "{colors.neutral}"
    textColor: "{colors.on-surface}"
    typography: "{typography.code-lg}"
    rounded: "{rounded.md}"
    padding: 26px
  filePanel:
    backgroundColor: "{colors.surface-raised}"
    borderColor: "{colors.neutral}"
    textColor: "{colors.on-surface}"
    typography: "{typography.code-sm}"
    rounded: "{rounded.md}"
    padding: 22px
  chip:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.on-surface}"
    typography: "{typography.code-md}"
    rounded: "{rounded.sm}"
    padding: 14px
  annotation:
    textColor: "{colors.on-surface-muted}"
    typography: "{typography.label-caps}"
  callout:
    borderColor: "{colors.state-kept}"
    textColor: "{colors.on-surface}"
    typography: "{typography.code-lg}"
    rounded: "{rounded.md}"
    padding: 30px
---

# DESIGN.md — Instrument Diagram

## Overview

This is the visual identity of a 33-second looping walkthrough of a governance
workflow. Its register is **instrument diagram**: something measured and machined
rather than illustrated. The viewer should feel they are reading an engineering
readout that happens to be beautiful, not watching a marketing animation.

It is mastered as an open-slide deck at `deck/slides/checkpoint-distill/`, and the
video is a capture of that deck rather than a separate artifact. There is one
source: the deck. A previous Remotion implementation was retired once open-slide
could capture a deck frame by frame, because two renderers meant two versions of
the same design drifting apart.

Three commitments follow from that, and every other decision here is downstream of
them.

**Everything is constructed, not drawn.** All geometry is generated from seeded
arithmetic at render time — triangulated discs, slabs, and rings, lit by a shared
light vector. There are no icons and no illustrations. Anything that looks hand-made
would break the claim that the image is instrumentation.

**The image is deterministic.** No unseeded randomness anywhere. The same frame
produces the same pixels on every render, which is what makes the film diffable and
what allows the loop to be verified numerically rather than by eye.

**Nothing decorative may cost legibility.** The film's payload is text: commands the
viewer is meant to type and file contents they are meant to read. Grain, vignette,
defocus, and motion blur are all held below the threshold where they begin to
compete with type. When a treatment and a word conflict, the word wins.

The tone is quiet and confident. It does not shout, it does not use exclamation, and
it never animates for its own sake — every movement either advances the argument or
establishes depth.

## Colors

The palette is a dark instrument ground with one warm accent and one cool accent,
plus a three-value state scale. It is deliberately small: with this much motion on
screen, a wide palette reads as noise.

**Surfaces** are three steps of near-black. `surface` (#0d1117) is the world ground
and the colour the film returns to between stations. `surface-raised` (#161b22) is
for panels that hold content — file listings, cards. `surface-inset` (#0a0e14) is
darker than the ground and is reserved for the terminal, so a console reads as a
recess cut into the page rather than a card sitting on it.

**Accents** carry meaning, never decoration. `primary` (#f0883e), a burnt amber, marks
the thing the viewer should attend to right now and is the film's signature colour.
`secondary` (#a371f7), a violet, is reserved exclusively for durable knowledge — the
standing instructions, the distillation step, the closing ring. A viewer who notices
only that violet means "this is what survives" has understood the film.

**State colours** are a closed set of three, used wherever an outcome is shown:
`state-kept` (#3fb950), `state-partial` (#d29922), `state-discarded` (#f85149). They
appear on ledger entries, commit markers, and callout borders. Because the set is
closed and consistent, a viewer learns it once in the ledger scene and reads it
without labels everywhere after.

**Neutral** (#30363d) draws every structural line: the graticule, panel borders,
dividing rules. It is never used for text.

Text sits at three weights. `on-surface` (#e6edf3) for body and headings,
`on-surface-muted` (#8b949e) for supporting prose and console output, and
`on-surface-emphasis` (pure white) for exactly one line in the film — the closing
statement. Reserving pure white for a single moment is what gives that moment force.

## Typography

Two families, no exceptions. **Geist** carries prose and headings. **Geist Mono**
carries everything the viewer could type or find in a file: commands, output, paths,
file contents, state labels, and technical annotations.

That split is the film's strongest legibility device. Monospace is not a stylistic
flourish here — it is a signal that says *this is a real artifact*. When a line is
monospaced, the viewer can trust that it is something that exists in a repository.

Sizes derive from a 1080px-wide layout baseline scaled to the 1920px composition.
`headline-display` (149px) appears only where it stands alone with no supporting
content. `headline-lg` (103px) is the working heading size for a station that also
carries a panel or a list; using the display size there overflows the frame, which is
a mistake the film made once and corrected. `headline-md` (78px) exists for the single
closing line, sized to hold one line rather than wrap.

Headings are 700 weight with negative tracking; everything else is 400. Two weights
is the whole range.

`label-caps` is the annotation style: monospace, uppercase, 0.18em tracking. It labels
each station without competing with the heading beneath it.

## Layout

The film is not a sequence of scenes. It is **one continuous world** laid out
horizontally, with seven stations spaced 2200px apart, travelled by a keyframed camera
that never reverses. Each station occupies one 1920×1080 frame of that world.

Within a station, content sits inside a safe area of 142px horizontally and 178px
vertically, and is vertically centred. That leaves roughly 724px of usable height,
which is the constraint that governs every composition decision: a display-sized
heading plus a list does not fit, and discovering that late is expensive.

The camera rhythm is fixed: **130 frames of hold, 55 frames of travel**. Station
content begins animating one full travel duration before arrival, so a station is
already in motion as it slides into frame. Starting on arrival instead leaves a
visible hole in the middle of every move.

Spacing follows a loose 26/40px rhythm — 26px between related lines, 40px between
blocks. Stacked repeating elements use a pitch derived from their own rendered height
rather than a round number, because a pitch smaller than the element overlaps.

**The graticule spacing is derived, not chosen.** It is computed so that the far
plane's total parallax shift is a whole number of cells, which is what allows the film
to loop. A round number breaks the loop the moment a station is added.

## Elevation & Depth

There are **no shadows and no elevation levels**. Depth is spatial and optical rather
than simulated, and it comes from three mechanisms working together.

**Parallax planes.** Four depths translate against the camera at different rates: the
graticule at 0.2, wireframe solids at 0.45, content at 1.0, and near facets at 1.35.
Content sits at exactly 1.0 and defines the plane the viewer is standing on.

**Defocus.** Blur is derived from each plane's distance from the content plane —
`|depth − 1| × 2.6px`. The content plane is therefore always the focus, and the far and
near planes both soften. This is what stops the graticule and the near facets
competing with text.

**Inverted atmosphere.** The far planes are wireframe and the near plane is solid,
which is the reverse of what haze would do in a landscape. That inversion is
deliberate: wire reads as *schematic* depth, which suits a diagram, where fog would
read as weather.

Panels are separated from the ground by tone and a 1px neutral border only. The
terminal recedes by being darker than the page, not by casting a shadow.

## Shapes

The shape language is **faceted low-poly**: every form is a set of triangles with
visible edges, flat-shaded from a single light vector arriving from the upper left.

Three generators produce every shape in the film. A **faceted disc** is a jittered
polygon triangulated from its centre, shaded as a dome — the workhorse form. A
**faceted slab** is a rectangle split into columns with a jittered interior seam,
shaded cylindrically so it reads as an extruded bar. A **faceted ring** is trapezoid
segments with opposing inner and outer normals, which gives it a bevelled machined
edge.

Lighting is what makes these read as solids. Shading each facet randomly produces a
field of unrelated brightnesses that the eye resolves as confetti; shading from a
shared light vector makes neighbouring facets agree, and the form appears. A tenth of
the shading term is left to per-facet variation, because a purely analytic surface
reads as plastic.

Facets carry meaning where a scene needs it. Displacing them radially shatters a
form, which is how a discarded attempt is shown; compressing their spacing crushes a
stack, which is how a squash merge is shown.

Rectangles are gently rounded — 8px on chips, 10px on panels and callouts, 12px on
cards, full on pills. The radii are small on purpose: enough to avoid harshness,
not enough to read as soft.

## Components

**Terminal.** The film's core unit and the reason it works as a walkthrough. A header
strip with three state-coloured dots, then a prompt line where the command types in
character by character, then output lines revealed in sequence. Typing is not
decoration — it gives the viewer time to read the invocation before its result
arrives. Set on `surface-inset` so it reads as a recess.

**File panel.** A path header in violet above content lines that appear in order. The
path is always shown, because knowing *where* an artifact lands is half of what makes
a workflow reproducible. Empty lines carry a minimum height so paragraph breaks
survive.

**Chip.** A monospace pill with a state-coloured left border, standing for one commit.
Stacked at a pitch derived from its own height.

**Annotation.** Uppercase monospace with wide tracking, optionally with a leader
line. Labels a station or a region. Carries no information the viewer needs — its
job is to establish the instrument register.

**Callout.** A bordered block in a state colour, used where something must be
asserted rather than shown.

**Mesh.** The renderer for all generated geometry; takes a facet set, a base hue, and
optional displacement, rotation, and wireframe mode.

**Plate.** A generated raster image composited under vector content with `lighten`
blending, which knocks out its opaque dark ground. Plates are confined to the content
plane, because the parallax planes must repeat exactly for the film to loop and a
generated image cannot be relied upon to tile at an arbitrary width.

## Motion

Motion is a section of this design system, not a decoration applied to it. The
piece is captured to video, and a capture is unforgiving in a way a live
presentation is not: every boundary plays back to back with nothing spoken over
it, so an indulgent transition is *more* obvious than it would be on stage, not
less.

### Transitions — one DNA, 140–280ms

The loudest signal of an amateur deck is six different transitions in one deck.
Variation lives in *which property* takes the small nudge, never in the timing or
the easing.

| | Value |
|---|---|
| Exit | 140–180ms, ease-in `cubic-bezier(0.4, 0, 1, 1)` |
| Enter | 200–280ms, ease-out `cubic-bezier(0, 0, 0.2, 1)`, delayed ~80ms |
| Magnitude ceiling | 12px translate or 3% scale |
| Opacity | always part of it — pure-transform reads stiff |

House transition is **RISE**: a 6px lift. The wrap uses **DISSOLVE**: pure
opacity, no transform. That choice is deliberate — with the same backdrop on
every page, a dissolve cross-fades only the content and the background never
moves, which makes the loop point the *least* eventful transition in the piece
rather than the most.

Never `linear` easing. Never `translateX(100%)`. Never a `clip-path` reveal.
Never blur on both the outgoing and incoming page at once — the eye cannot
fixate on anything during it.

### Morph — for continuity of meaning, not shape

Morph pairs the same object across two pages by a stable id and glides it. It is
reserved for cases where **the object is the story across the cut**, and there
are exactly two in this piece:

- **The ledger panel across the merge.** One page shows the iteration ledger; the
  next argues it survives the squash. Morphing it means the panel visibly
  persists while the commits crush away beside it — the argument is made by the
  motion rather than asserted by the copy.
- **The backdrop solids, on every boundary.** Each carries a stable id and a
  per-station position, so depth becomes *how far a given id travels between two
  stations*. That is parallax in its literal form: one continuous move, different
  distances per plane, no restart.

The backdrop case is a deliberate departure from the guidance against morphing
decoration. The warning guards against tagging elements speculatively, since a
morph id promises the audience it is the same object; here that promise is
exactly true and is the point.

Rules that are not optional:

- **Opacity-only enter/exit on morphing pages.** Clones own all the motion; a
  transform-bearing enter slides the rest of the page and fights them.
- **No transform on a morph node.** Rotation goes on a child; a transform on the
  node itself gets mis-scaled by the glide.
- **Geometry deterministic at mount.** Rects are snapshotted once at the cut.
  Anything measured after mount shifts the target mid-glide.
- **Only morph what is genuinely the same object.** A panel whose text differs on
  the two pages is two objects wearing one id, and the glide carries the old
  content into the new slot.

### The snapshot contract

The runtime mounts more than one instance of a page: the audience-facing one, a
fresh instance of the outgoing page whose rects are snapshotted for a morph, plus
thumbnails, overview and print. Only the first should animate.

- **Gate entrances behind `useIsActivePage()`.** Every entrance fills `both`, so
  an ungated instance renders its 0% keyframe — invisible, offset, or mid-crush —
  and a morph measured against it starts from garbage.
- **A resting style must equal the settled state, including for exits.** A frozen
  instance renders base styles, so the freeze only tells the truth when the base
  style *is* where the animation ends. Entrances get this free. An exit does not:
  something that crushes away rests visible and reappears intact on the snapshot.
- **Scope the freeze stylesheet.** A `<style>` element is document-wide. An
  unscoped freeze mounted by the outgoing snapshot disables the *incoming* page's
  entrances for the whole boundary, so it renders settled and then snaps back and
  replays — the deck showing its answer before animating it.

### Ambient motion

- **Infinite animations reset at every cut**, because the runtime remounts the
  outgoing page. They look like the right tool for ambient motion and are not.
  For anything that should carry across a boundary, use a finite animation whose
  resting style is its own end state.
- **An ambient animation still sets the page's length.** Page duration is the
  longest finite animation, so a slow background turn timed to cover the dwell
  becomes the measurement and inflates every page it touches.
- **Never put two classes that both set the `animation` shorthand on one
  element.** Equal specificity means the later rule wins outright — shorthands do
  not merge. Put ambient motion on an inner element and the entrance on the
  wrapper.

### Timeline

A page contributes its longest finite animation plus the run-wide dwell, then the
boundary. **A page with no finite animation costs a 3s fallback plus the dwell**,
making a "quick" static page the most expensive in the deck — give every page one
short animation to set its length explicitly.

The deck closes with a **wrap page**: a transition attaches to the page being
entered, so the last content page never gets an outgoing one. The wrap page holds
the bare background and carries the closing transition. It must match what frame 0
actually renders — which is not the first page, but the bare background, because
every `both`-filled entrance sits at `opacity: 0` before it starts.

## Do's and Don'ts

- Do reserve violet for durable knowledge, and amber for present attention
- Don't introduce a fourth state colour; the closed set of three is what makes states readable without labels
- Do use monospace for anything the viewer could type, find in a file, or copy
- Don't use the display heading size on a station that also carries a panel or list — it will not fit in the safe area
- Do derive repeating spacing from the rendered size of the thing being repeated
- Don't hand-pick a round number for anything that must survive the loop; derive it from the travel distance
- Do keep raster assets on the content plane only
- Don't apply a filter to a parallax layer; the layers span the whole world and filtering a surface that size is ruinous — filter the individual elements instead
- Do reserve pure white for the single closing line
- Don't let grain, vignette, or defocus reach a level where they compete with type
- Do verify every layout change with a rendered still; nothing here fails loudly, and overflowing content renders happily off-frame
- Do hold one transition DNA across the whole piece; vary the property, never the timing or easing
- Don't blur the outgoing and incoming page at the same time — the eye cannot fixate
- Do reserve morph for objects that are genuinely the same thing on both pages
- Don't reach for an infinite animation to carry motion across a cut; it resets at every boundary
- Do give every page one short finite animation, or it costs a 3s fallback instead of a dwell
- Don't trust a settled screenshot for motion; a still catches layout, never a reset, a replay, or a loop that fails to close
- Do check the seam by diffing the first and last frames — the loop is the one defect nobody notices until it ships
