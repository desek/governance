/**
 * checkpoint-distill — a capture-first deck.
 *
 * This is a *loop variant*: a deck authored to be recorded rather than
 * presented. Three consequences follow, and they are what separate this file
 * from an ordinary deck.
 *
 * Nothing is step-gated. Every entrance is a mount-triggered CSS animation with
 * `both` fill, so a headless capture that pauses animations on appearance and
 * drives `currentTime` can seek the whole page. A `<Step>`-driven deck arrives
 * with every step already revealed, so no content is lost — but its reveals
 * register no animations, and the deck falls back to one MP4 per page, losing
 * the inter-page transitions along with the reveal motion.
 *
 * Every page carries a transition, because the capture records the viewer's own
 * transition animations between pages rather than compositing a crossfade at
 * encode time.
 *
 * The last page is `Reset`: bare ground, matching what frame 0 renders before
 * the opening page's entrances start. The capture walks pages in order and
 * stops, so a closing transition only fires if there is a page left to leave
 * for — without `Reset` the file would end mid-content and the wrap would be a
 * jump cut. With it, the first and last frames are identical.
 *
 * Content and palette mirror the Remotion cut of the same walkthrough, so the
 * two renders read as one piece of work.
 */

// Geist ships as font files rather than a stylesheet link, so the woff2 travels
// inside the exported artifact instead of being fetched from Google's CDN at
// view time. The export is meant to be opened from disk, and a webfont request
// it cannot make is a silent fallback to system faces that shifts every
// measured layout. Variable rather than static: one file covers 100 to 900,
// which is fewer bytes than the three static weights this deck uses.
import '@fontsource-variable/geist';
import '@fontsource-variable/geist-mono';
import {
  type DesignSystem,
  MorphElement,
  type Page,
  type SlideMeta,
  type SlideTransition,
  useIsActivePage,
} from '@open-slide/core';
import type { CSSProperties, ReactNode } from 'react';

/** Ground, surfaces, and the two accents. Lifted from the film's design system. */
const C = {
  bg: '#0d1117',
  raised: '#161b22',
  inset: '#0a0e14',
  text: '#e6edf3',
  dim: '#8b949e',
  line: '#30363d',
  accent: '#f0883e',
  knowledge: '#a371f7',
  kept: '#3fb950',
  partial: '#d29922',
  discarded: '#f85149',
} as const;

const SANS = '"Geist Variable", -apple-system, BlinkMacSystemFont, system-ui, sans-serif';
const MONO = '"Geist Mono Variable", ui-monospace, SFMono-Regular, Menlo, monospace';

/** Type scale, derived from the 1080-wide baseline scaled to the 1920 canvas. */
const T = { section: 103, body: 62, mono: 32, small: 27, label: 26 } as const;

/** Safe area. Key content stays inside this margin on every page. */
const SAFE = { x: 142, y: 178 } as const;

const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';

export const design: DesignSystem = {
  palette: { bg: C.bg, text: C.text, accent: C.accent },
  fonts: { display: SANS, body: SANS },
  typeScale: { hero: T.section, body: T.body },
  radius: 10,
};

/**
 * Deck stylesheet.
 *
 * Entrances are plain mount-triggered animations rather than step-gated rules —
 * see the module docstring. `both` fill leaves each element in its resting state,
 * which is also what a still export reads.
 */
const css = `
/* Geist and Geist Mono: Copyright 2024 The Geist Project Authors
   (https://github.com/vercel/geist-font), licensed under the SIL Open Font
   License 1.1. Full text in deck/licenses/. This notice travels with the
   embedded font data into the exported artifact, as the OFL requires. */

@keyframes gRise { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
@keyframes gSlide { from { opacity: 0; transform: translateX(-26px); } to { opacity: 1; transform: translateX(0); } }
@keyframes gFade { from { opacity: 0; } to { opacity: 1; } }
@keyframes gPop { from { opacity: 0; transform: scale(0.82); } to { opacity: 1; transform: scale(1); } }
@keyframes gSpin { from { transform: rotate(var(--g-from, 0deg)); } to { transform: rotate(var(--g-to, 0deg)); } }
@keyframes gCrush { from { transform: translateY(0) scaleY(1); opacity: 1; } to { transform: translateY(-96px) scaleY(0.06); opacity: 0; } }
@keyframes gCaret { 0%, 45% { opacity: 1; } 50%, 100% { opacity: 0; } }
@keyframes gDraw { from { stroke-dashoffset: var(--g-len, 900); } to { stroke-dashoffset: 0; } }

.g-rise  { animation: gRise 620ms ${EASE} both; }
.g-slide { animation: gSlide 560ms ${EASE} both; }
.g-fade  { animation: gFade 520ms ease-out both; }
.g-pop   { animation: gPop 560ms ${EASE} both; }
.g-crush { animation: gCrush 620ms cubic-bezier(0.66, 0, 0.86, 0.2) both; }
.g-caret { animation: gCaret 1s steps(1) infinite; }
.g-draw  { animation: gDraw 900ms ${EASE} both; }

/* Spin lives on its own element, never alongside an entrance class. Both set the
   \`animation\` shorthand at equal specificity, so pairing them on one node drops
   whichever rule appears first — silently, and only in the browser.

   Finite, not infinite, and that is the whole point. The runtime remounts the
   outgoing page to snapshot it, and a fresh mount restarts an infinite animation
   at zero — so an ambient spin visibly snapped back at every cut. A finite turn
   whose resting style is its own end angle survives the remount, because a
   frozen instance renders exactly where the live page left off. */
.g-spin  { animation: gSpin var(--g-spin, 3000ms) linear both; }
`;

/**
 * How long a morph glide runs, and therefore how long anything waiting on a
 * clone to land must wait. One constant because the two drifting apart is the
 * failure mode: a reveal either pops before the clone arrives or hangs after it.
 */
const MORPH_MS = 640;

/**
 * Every animation this deck defines, so one rule can freeze them all.
 *
 * Listed rather than derived: a class added to the stylesheet and missed here
 * would keep animating on a snapshot instance and quietly corrupt a morph, which
 * is the hardest defect in this file to see.
 */
const ANIMATED = [
  'g-rise',
  'g-slide',
  'g-fade',
  'g-pop',
  'g-crush',
  'g-spin',
  'g-drift',
  'g-breathe',
  'g-caret',
];

/**
 * Stylesheet that pins every animation to its settled state.
 *
 * The runtime mounts more than one instance of a page: the audience-facing one,
 * a fresh instance of the outgoing page whose rects are snapshotted for a morph,
 * plus thumbnails, overview, presenter preview and print. Only the first should
 * animate — `morph.md` rule 5.
 *
 * Every entrance here fills `both`, so an ungated instance renders its 0%
 * keyframe: invisible, offset, or mid-crush. A morph measured against that
 * starts from garbage. Removing the animation lets each element fall back to its
 * own base style, and the base styles in this deck *are* the settled state —
 * which is why one blanket rule suffices and no component needs to know whether
 * it is being watched.
 *
 * The scoping is not decoration. A `<style>` element applies to the whole
 * document, not to the subtree that rendered it, so an unscoped rule mounted by
 * the outgoing snapshot would disable the *incoming* page's entrances for the
 * entire boundary. That page then renders settled while the transition plays and
 * replays from zero the moment the outgoing layer unmounts, which looks like the
 * deck showing its answer before animating it.
 *
 * The morph overlay is scoped too, and for a different reason. A clone is meant
 * to be a still snapshot the runtime glides; left animating, its entrances run
 * inside the overlay, and because the capture treats anything under the overlay
 * as part of the boundary, the longest of them is measured as the boundary's
 * duration. One panel whose lines finish at 2.2s then stretches a 640ms cut into
 * a 2.2s one.
 */
const FROZEN_SCOPES = ['[data-g-frozen]', '[data-osd-morph-layer]'];

const FREEZE = FROZEN_SCOPES.map(
  (scope) =>
    `${scope} :is(${ANIMATED.map((c) => `.${c}`).join(',')}) { animation: none !important; }`,
).join('\n');

/** Deterministic pseudo-random, so a re-render and a re-capture produce identical geometry. */
const rand = (seed: number): number => {
  const v = Math.sin(seed * 12.9898) * 43758.5453;
  return v - Math.floor(v);
};

/**
 * A faceted low-poly disc, shaded from a fixed light direction.
 *
 * The same construction the film uses: a jittered polygon triangulated from its
 * centre, with each facet's tone taken from a Lambert term rather than at random.
 * Random per-facet shading reads as confetti; a shared light makes neighbouring
 * facets agree and the form appears.
 */
function Facets({
  seed,
  radius,
  tone,
  segments = 11,
  wire = false,
  turn,
  className,
  style,
}: {
  seed: number;
  radius: number;
  tone: string;
  segments?: number;
  /** Stroke only, no fill. The backdrop reads as structure rather than mass. */
  wire?: boolean;
  /**
   * Rotation across this page, in degrees, over `ms`.
   *
   * `from` is the previous page's `to` wherever a solid carries across a cut, so
   * the turn continues rather than restarting. Omitted entirely on the backdrop:
   * a plane that is still turning would put the deck's first and last frames
   * degrees apart, and those two frames have to match to close the loop.
   */
  turn?: { from: number; to: number; ms: number };
  className?: string;
  style?: CSSProperties;
}) {
  const pts = Array.from({ length: segments }, (_, i) => {
    const a = (i / segments) * Math.PI * 2;
    const r = radius * (0.87 + rand(seed + i * 7.3) * 0.26);
    return [Math.cos(a) * r, Math.sin(a) * r] as const;
  });

  return (
    <div className={className} style={{ lineHeight: 0, ...style }}>
      <svg
        width={radius * 2}
        height={radius * 2}
        viewBox={`${-radius} ${-radius} ${radius * 2} ${radius * 2}`}
        className={turn ? 'g-spin' : undefined}
        style={
          turn
            ? ({
                overflow: 'visible',
                /* Resting style is the end angle: see the `.g-spin` note. */
                transform: `rotate(${turn.to}deg)`,
                '--g-from': `${turn.from}deg`,
                '--g-to': `${turn.to}deg`,
                '--g-spin': `${turn.ms}ms`,
              } as CSSProperties)
            : { overflow: 'visible' }
        }
        aria-hidden
      >
        {pts.map((p, i) => {
          const mid = ((i + 0.5) / segments) * Math.PI * 2;
          /* Lambert against a light from the upper left, flattened to an alpha ramp. */
          const lambert = Math.max(0, Math.cos(mid) * -0.55 + Math.sin(mid) * -0.72) * 0.85 + 0.15;
          const next = pts[(i + 1) % segments];
          return (
            <polygon
              key={i}
              points={`0,0 ${p[0]},${p[1]} ${next[0]},${next[1]}`}
              fill={tone}
              fillOpacity={wire ? 0 : 0.18 + lambert * 0.62}
              stroke={tone}
              strokeOpacity={wire ? 0.1 + lambert * 0.22 : 0.4}
              strokeWidth={1}
            />
          );
        })}
      </svg>
    </div>
  );
}

/** How far a depth-1 plane travels between two adjacent stations, in canvas px. */
const STRIDE = 190;

/**
 * The persistent world every page sits in.
 *
 * Each plane keeps one morph id for the whole deck, so the runtime pairs it
 * across every cut and FLIP-glides it rather than fading it out and back in.
 * Depth is expressed as *how far that id moves between two stations*: the near
 * plane covers more ground than the far one, which is parallax in its literal
 * form — one continuous move at different rates, never a restart.
 *
 * This is a deliberate departure from `morph.md`'s "don't morph decoration".
 * That rule guards against tagging elements just in case, because every morph id
 * promises the audience it is the same object. Here the promise is exactly true
 * and is the point: the world persists, and travelling through it is what the
 * parallax is for.
 */
/**
 * Plane positions avoid the right-hand band where the accent solids sit, and
 * that is a constraint rather than a layout preference.
 *
 * Because the planes morph, the runtime clones them into its overlay for the
 * length of every boundary, and per `morph.md` the overlay travels above both
 * pages. A plane whose path crosses an accent solid therefore draws its
 * wireframe *over* that solid mid-cut, which reads as the background jumping to
 * the front. Keeping the two apart is what avoids it while keeping the parallax.
 */
const PLANES = [
  { id: 'bd-far', x: 880, y: 40, radius: 300, depth: 0.3, seed: 21, segments: 15 },
  { id: 'bd-mid', x: 190, y: 620, radius: 230, depth: 0.68, seed: 33, segments: 12 },
  { id: 'bd-near', x: 560, y: 880, radius: 160, depth: 1.15, seed: 47, segments: 10 },
] as const;

function Backdrop({ station }: { station: number }) {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0 }} aria-hidden>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.55,
          backgroundImage: `linear-gradient(${C.line} 1px, transparent 1px), linear-gradient(90deg, ${C.line} 1px, transparent 1px)`,
          backgroundSize: '160px 160px',
          maskImage: 'radial-gradient(ellipse at 50% 45%, #000 0%, transparent 78%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 50% 45%, #000 0%, transparent 78%)',
        }}
      />
      {PLANES.map((p) => (
        <MorphElement key={p.id} id={p.id}>
          <div
            style={{
              position: 'absolute',
              left: p.x - station * STRIDE * p.depth,
              top: p.y,
              lineHeight: 0,
            }}
          >
            <Facets seed={p.seed} radius={p.radius} tone={C.line} segments={p.segments} wire />
          </div>
        </MorphElement>
      ))}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse at 50% 50%, transparent 30%, ${C.bg} 88%)`,
        }}
      />
    </div>
  );
}

/**
 * Page shell: ground, backdrop, safe area, and vertical centring.
 *
 * `station` is the page's position along the world the backdrop describes. It is
 * passed rather than derived because the wrap page deliberately reuses station
 * 0 — the planes travel home at the loop point instead of advancing one more
 * step.
 */
function Frame({
  children,
  station,
  style,
}: {
  children: ReactNode;
  station: number;
  style?: CSSProperties;
}) {
  const active = useIsActivePage();
  return (
    <div
      data-g-frozen={active ? undefined : ''}
      style={{
        position: 'absolute',
        inset: 0,
        background: C.bg,
        color: C.text,
        fontFamily: SANS,
        overflow: 'hidden',
        ...style,
      }}
    >
      <style>{css}</style>
      {!active && <style>{FREEZE}</style>}
      <Backdrop station={station} />
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          height: '100%',
          boxSizing: 'border-box',
          padding: `${SAFE.y}px ${SAFE.x}px`,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        {children}
      </div>
    </div>
  );
}

/** Uppercase monospace station label. Establishes the instrument register. */
function Label({
  children,
  tone = C.dim,
  delay = 0,
}: {
  children: ReactNode;
  tone?: string;
  delay?: number;
}) {
  return (
    <div
      className="g-fade"
      style={{
        fontFamily: MONO,
        fontSize: T.label,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        color: tone,
        animationDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/** Page heading. One line per page — the canvas has no room for two at this size. */
function Heading({ children, delay = 60 }: { children: ReactNode; delay?: number }) {
  return (
    <div
      className="g-rise"
      style={{
        fontSize: T.section,
        fontWeight: 700,
        letterSpacing: '-0.02em',
        marginTop: 20,
        animationDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/** One line of terminal output. */
type Out = { text: string; tone?: string };

/**
 * A terminal panel: prompt, command, then output lines.
 *
 * Set on the inset surface so a console reads as a recess cut into the page
 * rather than a card sitting on it.
 */
function Terminal({
  command,
  lines,
  delay = 0,
  width = '100%',
}: {
  command: string;
  lines: Out[];
  delay?: number;
  width?: number | string;
}) {
  return (
    <div
      className="g-rise"
      style={{
        width,
        background: C.inset,
        border: `1px solid ${C.line}`,
        borderRadius: 10,
        fontFamily: MONO,
        overflow: 'hidden',
        animationDelay: `${delay}ms`,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '14px 20px',
          borderBottom: `1px solid ${C.line}`,
        }}
      >
        {[C.discarded, C.partial, C.kept].map((t) => (
          <span
            key={t}
            style={{ width: 12, height: 12, borderRadius: 6, background: t, opacity: 0.7 }}
          />
        ))}
        <span style={{ marginLeft: 10, fontSize: 22, color: C.dim, letterSpacing: '0.1em' }}>
          claude code
        </span>
      </div>
      <div style={{ padding: '22px 26px' }}>
        <div style={{ fontSize: T.mono, display: 'flex', gap: 14 }}>
          <span style={{ color: C.kept }}>❯</span>
          <span>
            {command}
            <span className="g-caret" style={{ color: C.accent }}>
              ▌
            </span>
          </span>
        </div>
        {lines.map((l, i) => (
          <div
            key={l.text || `blank-${i}`}
            className="g-fade"
            style={{
              marginTop: i === 0 ? 20 : 8,
              minHeight: '1.4em',
              fontSize: T.small,
              color: l.tone ?? C.dim,
              animationDelay: `${delay + 420 + i * 130}ms`,
            }}
          >
            {l.text}
          </div>
        ))}
      </div>
    </div>
  );
}

/** One line of file content. */
type FileLine = { text: string; tone?: string };

/** A file panel: path header above content lines. The path is always shown. */
function FilePanel({
  path,
  lines,
  delay = 0,
  width = '100%',
}: {
  path: string;
  lines: FileLine[];
  delay?: number;
  width?: number | string;
}) {
  return (
    <div
      className="g-rise"
      style={{
        width,
        background: C.raised,
        border: `1px solid ${C.line}`,
        borderRadius: 10,
        fontFamily: MONO,
        overflow: 'hidden',
        animationDelay: `${delay}ms`,
      }}
    >
      <div
        style={{
          padding: '14px 22px',
          borderBottom: `1px solid ${C.line}`,
          fontSize: 24,
          color: C.knowledge,
        }}
      >
        {path}
      </div>
      <div style={{ padding: '20px 22px' }}>
        {lines.map((l, i) => (
          <div
            key={l.text || `blank-${i}`}
            className="g-fade"
            style={{
              fontSize: T.small,
              lineHeight: 1.55,
              minHeight: '1.55em',
              color: l.tone ?? C.text,
              animationDelay: `${delay + 260 + i * 110}ms`,
            }}
          >
            {l.text}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Closing line beneath a page's body. Monospace, so it reads as a machine note. */
function Note({
  children,
  tone = C.accent,
  delay,
}: {
  children: ReactNode;
  tone?: string;
  delay: number;
}) {
  return (
    <div
      className="g-fade"
      style={{
        marginTop: 30,
        fontFamily: MONO,
        fontSize: 30,
        color: tone,
        animationDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ pages */

/** The premise: a cost the viewer recognises, so they want the tool before seeing it. */
function Problem() {
  return (
    <Frame station={0}>
      <Label tone={C.discarded}>the problem</Label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 80 }}>
        <div style={{ flex: 1 }}>
          <Heading>You already tried that. Six weeks ago.</Heading>
          <Note tone={C.dim} delay={520}>
            it did not work then either
          </Note>
          <Note delay={900}>→ nothing in the repo remembers why</Note>
        </div>
        <Facets
          seed={3}
          radius={190}
          tone={C.discarded}
          segments={13}
          turn={{ from: 0, to: 20, ms: 1400 }}
          className="g-pop"
          style={{ animationDelay: '200ms', flexShrink: 0 }}
        />
      </div>
    </Frame>
  );
}

/** Step one: the command that records a unit of work, and the subject it writes. */
function Commit() {
  return (
    <Frame station={1}>
      <Label tone={C.kept}>step 1 · record the work</Label>
      <Heading>Every unit of work leaves a trace</Heading>
      <div style={{ marginTop: 34 }}>
        <Terminal
          delay={200}
          command='/checkpoint-commit CR-XXXX "phase 2 complete"'
          lines={[
            { text: 'analysing working tree…' },
            { text: '  4 files changed, 118 insertions' },
            { text: '✓ checkpoint(CR-XXXX): phase 2 complete', tone: C.kept },
          ]}
        />
      </div>
      <Note tone={C.dim} delay={1300}>
        the subject links the change to the document that asked for it
      </Note>
    </Frame>
  );
}

/** Step two: the ledger, and the discarded attempt that exists nowhere else. */
function Iterate() {
  return (
    <Frame station={2}>
      <Label tone={C.partial}>step 2 · record what you tried</Label>
      <Heading>The last mile gets a ledger</Heading>
      <div style={{ display: 'flex', gap: 46, marginTop: 30, alignItems: 'flex-start' }}>
        <Terminal
          delay={180}
          width={760}
          command="/checkpoint-iterate CR-XXXX"
          lines={[
            { text: 'session opened' },
            { text: 'you name what to try' },
            { text: 'the agent changes code, runs checks' },
            { text: 'you rule: keep · discard · keep part', tone: C.text },
          ]}
        />
        <FilePanel
          delay={1500}
          width={790}
          path="docs/cr/CR-XXXX-iterate.md"
          lines={[
            { text: '## Attempt 1', tone: C.dim },
            { text: '  widen the cache key' },
            { text: '  disposition: discarded', tone: C.discarded },
            { text: '  why: invalidation storms under load', tone: C.discarded },
            { text: '## Attempt 2', tone: C.dim },
            { text: '  move the guard earlier' },
            { text: '  disposition: partially-kept', tone: C.partial },
          ]}
        />
      </div>
      <Note delay={2950}>→ the discarded attempt is written down. it exists nowhere else.</Note>
    </Frame>
  );
}

/** The merge: commits are destroyed, the ledger is a file and survives. */
function Merge() {
  return (
    <Frame station={3}>
      <Label tone={C.discarded}>then you merge</Label>
      <Heading>Squash merge deletes commits</Heading>
      <div style={{ display: 'flex', gap: 70, marginTop: 40, alignItems: 'flex-start' }}>
        <div style={{ width: 620, position: 'relative', height: 300 }}>
          {['CR reviewed', 'phase 1', 'phase 2', 'phase 3', 'finalized', 'docs updated'].map(
            (c, i) => (
              <div
                key={c}
                className="g-crush"
                style={{
                  /*
                   * Crush is the deck's one exit animation, so unlike every
                   * entrance its settled state is *gone*. The resting style has
                   * to say so: a frozen instance renders base styles, and left
                   * at the default these six would reappear intact on the
                   * outgoing snapshot — the commits flashing back at the exact
                   * moment the page has finished arguing they were destroyed.
                   */
                  opacity: 0,
                  position: 'absolute',
                  top: i * 46,
                  left: 0,
                  width: 560,
                  padding: '11px 20px',
                  background: C.raised,
                  borderLeft: `5px solid ${C.kept}`,
                  borderRadius: 8,
                  fontFamily: MONO,
                  fontSize: 25,
                  whiteSpace: 'nowrap',
                  animationDelay: `${200 + i * 40}ms`,
                }}
              >
                checkpoint: {c}
              </div>
            ),
          )}
          <div
            className="g-pop"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: 600,
              padding: '13px 20px',
              background: C.raised,
              borderLeft: `5px solid ${C.accent}`,
              borderRadius: 8,
              fontFamily: MONO,
              fontSize: 25,
              animationDelay: '820ms',
            }}
          >
            feat: the whole change, in one commit
          </div>
          <div
            className="g-fade"
            style={{
              position: 'absolute',
              top: 96,
              left: 0,
              fontFamily: MONO,
              fontSize: 28,
              color: C.discarded,
              animationDelay: '1120ms',
            }}
          >
            six commit bodies, gone from main
          </div>
        </div>
        <div
          className="g-rise"
          style={{
            flex: 1,
            background: C.raised,
            border: `2px solid ${C.kept}`,
            borderRadius: 10,
            padding: '30px 32px',
            fontFamily: MONO,
            animationDelay: '1150ms',
          }}
        >
          <div style={{ fontSize: 26, color: C.kept, letterSpacing: '0.12em' }}>STILL THERE</div>
          <div style={{ marginTop: 18, fontSize: 29, lineHeight: 1.6 }}>
            docs/cr/CR-XXXX-iterate.md
          </div>
          <div style={{ marginTop: 14, fontSize: 27, color: C.dim, lineHeight: 1.55 }}>
            it is a tracked file, not commit metadata
          </div>
        </div>
      </div>
    </Frame>
  );
}

/** Step three: the tiered report, with origin classification and the approval gate. */
function Distil() {
  return (
    <Frame station={4}>
      <Label tone={C.knowledge}>step 3 · promote what lasts</Label>
      <Heading>It reads the ledger, then ranks</Heading>
      <div style={{ marginTop: 34 }}>
        <Terminal
          delay={200}
          command="/checkpoint-distill CR-XXXX"
          lines={[
            { text: 'inputs: change request ✓  validation report ✓  ledger ✓  commits ✓' },
            { text: '' },
            { text: 'MUST ADD   [in-project]      stage only the paths you touched', tone: C.kept },
            {
              text: 'MUST ADD   [out-of-project]  the CLI lies about success — re-test on upgrade',
              tone: C.accent,
            },
            { text: 'OPTIONAL   [in-project]      prefer the shorter fixture', tone: C.dim },
            { text: '' },
            { text: 'apply which tiers? nothing is written until you say.', tone: C.knowledge },
          ]}
        />
      </div>
      <Note tone={C.dim} delay={1700}>
        → a workaround expires and says how to check. a rule does not.
      </Note>
    </Frame>
  );
}

/** The payoff: the rule that lands, carrying mechanism, cost, and history. */
function Payoff() {
  return (
    <Frame station={5}>
      <Label tone={C.knowledge}>the payoff</Label>
      <div style={{ display: 'flex', gap: 60, marginTop: 22, alignItems: 'center' }}>
        <FilePanel
          delay={140}
          width={1040}
          path="AGENTS.md"
          lines={[
            { text: '## Order the guard before the cache read', tone: C.knowledge },
            { text: '' },
            { text: 'The guard is what bounds the key space, so' },
            { text: 'reading first admits an unbounded key and' },
            { text: 'evicts live entries once traffic rises.' },
            { text: '' },
            { text: 'Widening the key was tried first. It reads', tone: C.dim },
            { text: 'as the obvious fix and holds under test,', tone: C.dim },
            { text: 'then storms on invalidation under real load.', tone: C.dim },
          ]}
        />
        <div className="g-pop" style={{ animationDelay: '600ms', flexShrink: 0 }}>
          <MorphElement id="knowledge-solid">
            <Facets
              seed={7}
              radius={150}
              tone={C.knowledge}
              segments={16}
              turn={{ from: 0, to: 38, ms: 2600 }}
            />
          </MorphElement>
        </div>
      </div>
      <Note tone={C.kept} delay={1700}>
        → the next session reads this before it writes a line
      </Note>
      <div
        className="g-rise"
        style={{
          marginTop: 24,
          fontSize: 78,
          fontWeight: 700,
          color: '#ffffff',
          animationDelay: '2000ms',
        }}
      >
        Nobody tries the cache key again.
      </div>
    </Frame>
  );
}

/** The set, and the one line worth copying. Hands back to the opening page. */
function Cta() {
  const skills: Array<[string, string, string]> = [
    ['/governance', 'author the change request', C.dim],
    ['/checkpoint-commit', 'record a unit of work', C.kept],
    ['/checkpoint-read', 'recover context in a new session', C.dim],
    ['/checkpoint-iterate', 'log the last mile, including what failed', C.partial],
    ['/checkpoint-distill', 'promote what should outlive it', C.knowledge],
  ];

  return (
    <Frame station={6}>
      <Label tone={C.knowledge}>the set</Label>
      <div style={{ display: 'flex', gap: 70, alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <Heading>Five skills, one loop</Heading>
          <div style={{ marginTop: 26 }}>
            {skills.map(([cmd, does, tone], i) => (
              <div
                key={cmd}
                className="g-slide"
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 22,
                  padding: '10px 0',
                  animationDelay: `${300 + i * 110}ms`,
                }}
              >
                <span style={{ fontFamily: MONO, fontSize: T.mono, color: tone, width: 400 }}>
                  {cmd}
                </span>
                <span style={{ fontFamily: MONO, fontSize: T.small, color: C.dim }}>{does}</span>
              </div>
            ))}
          </div>
        </div>
        <MorphElement id="knowledge-solid">
          <Facets
            seed={7}
            radius={190}
            tone={C.knowledge}
            segments={16}
            turn={{ from: 38, to: 62, ms: 1700 }}
            style={{ flexShrink: 0 }}
          />
        </MorphElement>
      </div>
      <div
        className="g-rise"
        style={{
          marginTop: 34,
          alignSelf: 'flex-start',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 20,
          border: `2px solid ${C.kept}`,
          borderRadius: 10,
          padding: '20px 30px',
          fontFamily: MONO,
          fontSize: T.mono,
          animationDelay: '1100ms',
        }}
      >
        <span style={{ color: C.kept }}>❯</span>
        <span>npx skills add desek/governance</span>
      </div>
    </Frame>
  );
}

/**
 * The wrap page: ground alone, no content.
 *
 * `open-slide video` walks pages in order and stops, so the deck's own closing
 * transition only ever fires if there is a page after the last one to leave for.
 * Without this page `Cta.transition` is dead code and the file ends mid-content,
 * which makes the loop point a jump cut.
 *
 * Its settled state is bare ground, which is also what frame 0 renders — every
 * entrance in this deck fills `both` from `opacity: 0`, so the opening page is
 * empty until its animations start. Matching those two frames is what makes the
 * wrap invisible.
 *
 * The empty span is load-bearing: a page with no animation at all measures as
 * unmeasurable and takes the capture's 3s fallback, holding a blank screen for
 * far longer than a breath. One short fade sets the beat explicitly instead.
 */
function Reset() {
  return (
    <Frame station={0}>
      <span className="g-fade" style={{ animationDuration: '200ms' }} />
    </Frame>
  );
}

/* ------------------------------------------------------- transitions & meta */

const EASE_IN = 'cubic-bezier(0.4, 0, 1, 1)';
const EASE_OUT = 'cubic-bezier(0, 0, 0.2, 1)';

const EASE_STANDARD = 'cubic-bezier(0.4, 0, 0.2, 1)';

/**
 * How long the planes take to travel home at the wrap.
 *
 * The loop point covers every station at once rather than one, so it is given
 * room to read as deliberate travel back to the opening rather than a snap.
 */
const WRAP_MORPH_MS = 1100;

/**
 * Module default transition — opacity only, with the backdrop morphing beneath.
 *
 * `morph.md` rule 1: while clones glide, a transform-bearing enter slides the
 * rest of the page too, and the two motions compete. Every boundary in this deck
 * morphs the backdrop, so every boundary gives its motion to the clones and
 * fades everything else. That is also why the RISE this deck briefly used is
 * gone: it was correct for a deck that cuts, wrong for one that travels.
 *
 * The 240ms fade against a 640ms morph sits inside the 2-4x band the reference
 * recommends.
 */
export const transition: SlideTransition = {
  duration: 240,
  exit: {
    duration: 200,
    easing: EASE_IN,
    keyframes: [{ opacity: 1 }, { opacity: 0 }],
  },
  enter: {
    duration: 240,
    delay: 40,
    easing: EASE_OUT,
    keyframes: [{ opacity: 0 }, { opacity: 1 }],
  },
  morph: { duration: MORPH_MS, easing: EASE_STANDARD },
};

/**
 * The wrap.
 *
 * On `Reset`, not on `Cta`: a transition governs the boundary *into* the page it
 * is attached to, so this fires on p7 → p8. Hanging it on `Cta` would slow the
 * entrance to the closing page instead, which is a different boundary and reads
 * as a lull right before the payoff.
 *
 * `Reset` sits back at station 0, so this is the one boundary where the planes
 * run the whole world backwards instead of advancing a step. Content fades out
 * and does not return, leaving the glide alone on screen — the closing shot is
 * the camera flying home, which is what makes the cut back to the opening read
 * as continuous rather than as a restart.
 */
Reset.transition = {
  duration: 240,
  exit: {
    duration: 200,
    easing: EASE_IN,
    keyframes: [{ opacity: 1 }, { opacity: 0 }],
  },
  enter: {
    duration: 240,
    delay: 40,
    easing: EASE_OUT,
    keyframes: [{ opacity: 0 }, { opacity: 1 }],
  },
  morph: { duration: WRAP_MORPH_MS, easing: EASE_STANDARD },
} satisfies SlideTransition;

export const meta: SlideMeta = {
  title: 'checkpoint-distill',
  createdAt: '2026-07-28T21:00:00.000Z',
};

export default [Problem, Commit, Iterate, Merge, Distil, Payoff, Cta, Reset] satisfies Page[];
