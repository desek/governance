/**
 * iterate-reconcile — a capture-first deck, second in the series after
 * checkpoint-distill.
 *
 * @agents-index Loop-variant deck teaching the implement, iterate, reconcile lifecycle of a Change Request.
 *
 * Copyright Daniel Grenemark 2026
 *
 * Like checkpoint-distill this is a *loop variant*: nothing is step-gated, every
 * entrance is a mount-triggered CSS animation with `both` fill, every page carries
 * a transition, and the last page is `Reset`, bare ground identical to frame 0,
 * so the capture's first and last frames match.
 *
 * The primitives (Facets, Backdrop, Frame, Label, Heading, Terminal, FilePanel,
 * Note) are copied from checkpoint-distill rather than imported, so each deck is
 * isolated and either can change without moving the other. The rationale for
 * each primitive is documented at its definition in that deck and repeated here
 * only where the reasoning is load-bearing for editing this copy.
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

/**
 * Page heading. One line per page at `headline-lg`.
 *
 * `size` drops to `headline-md` (78px) for a heading the CR fixes word for word
 * that is too long for one line at 103px; `nowrap` makes an overflow visible in
 * the PNG check instead of letting it wrap silently.
 */
function Heading({
  children,
  delay = 60,
  size = T.section,
}: {
  children: ReactNode;
  delay?: number;
  size?: number;
}) {
  return (
    <div
      className="g-rise"
      style={{
        fontSize: size,
        whiteSpace: 'nowrap',
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


/** `headline-md`: for the CR's long headings and the single closing line. */
const MD = 78;

/** Example ledger slug and date shared by every page, so the story is one session. */
const LEDGER = 'docs/cr/iterations/2026-10-28-tighten-retry.md';

/* ------------------------------------------------------------------ pages */

/** The premise: a specification is written before anyone has seen the result. */
function Problem() {
  return (
    <Frame station={0}>
      <Label tone={C.discarded}>the problem</Label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 80 }}>
        <div style={{ flex: 1 }}>
          <Heading>One-shots are hard.</Heading>
          <Note tone={C.dim} delay={520}>
            the requirements are written before anyone has seen the result
          </Note>
          <Note delay={900}>→ the first implementation is approximately right</Note>
        </div>
        <Facets
          seed={5}
          radius={190}
          tone={C.partial}
          segments={13}
          turn={{ from: 0, to: 20, ms: 1400 }}
          className="g-pop"
          style={{ animationDelay: '200ms', flexShrink: 0 }}
        />
      </div>
    </Frame>
  );
}

/** Step one: implement the CRs, which ends by naming the iteration command. */
function Implement() {
  return (
    <Frame station={1}>
      <Label tone={C.kept}>step 1 · implement</Label>
      <Heading>Ship the first version</Heading>
      <div style={{ marginTop: 34 }}>
        <Terminal
          delay={200}
          command="/implement-cr CR-XXXX CR-YYYY"
          lines={[
            { text: '✓ checkpoint(CR-XXXX): retry the upload', tone: C.kept },
            { text: '✓ checkpoint(CR-YYYY): show the retry banner', tone: C.kept },
            { text: 'CR-XXXX  status: implemented' },
            { text: 'CR-YYYY  status: implemented' },
            { text: 'next: /iterate-cr CR-XXXX CR-YYYY', tone: C.accent },
          ]}
        />
      </div>
      <Note tone={C.dim} delay={1400}>
        it works. it is not quite what you meant.
      </Note>
    </Frame>
  );
}

/** Step two: the iteration session, its ledger, and per-entry attribution. */
function Iterate() {
  return (
    <Frame station={2}>
      <Label tone={C.partial}>step 2 · iterate</Label>
      <Heading size={MD}>
        <div style={{ lineHeight: 1.1 }}>
          Now you see it.
          <br />
          Now you know what you meant.
        </div>
      </Heading>
      <div style={{ display: 'flex', gap: 46, marginTop: 18, alignItems: 'flex-start' }}>
        <Terminal
          delay={240}
          width={700}
          command="/iterate-cr CR-XXXX CR-YYYY"
          lines={[
            { text: 'you name what to try' },
            { text: 'the agent changes it' },
            { text: 'the agent records it', tone: C.text },
          ]}
        />
        <FilePanel
          delay={1300}
          width={890}
          path={LEDGER}
          lines={[
            { text: '### Attempt 1 — five retries, exponential', tone: C.dim },
            { text: '  CR: CR-XXXX · checkpoint(CR-XXXX-iterate)', tone: C.text },
            { text: '### Attempt 2 — banner after the second failure', tone: C.dim },
            { text: '  CR: CR-YYYY · checkpoint(CR-YYYY-iterate)', tone: C.text },
            { text: '### Attempt 3 — offline export', tone: C.dim },
            { text: '  CR: none · checkpoint(iterate-tighten-retry)', tone: C.partial },
          ]}
        />
      </div>
      <Note delay={2400}>→ every entry is a checkpoint commit · Iteration: tighten-retry</Note>
    </Frame>
  );
}

/** The drift: the CR still states the first guess while the code moved on. */
function Drift() {
  return (
    <Frame station={3}>
      <Label tone={C.discarded}>the drift</Label>
      <Heading size={MD}>The CR still says what you first thought</Heading>
      <div style={{ display: 'flex', gap: 46, marginTop: 40, alignItems: 'flex-start' }}>
        <FilePanel
          delay={200}
          width={795}
          path="docs/cr/CR-XXXX-retry.md"
          lines={[
            { text: 'The client MUST retry', tone: C.text },
            { text: '3 times, every 5 s.', tone: C.discarded },
          ]}
        />
        <FilePanel
          delay={700}
          width={795}
          path="src/upload.retry.ts"
          lines={[
            { text: 'const RETRIES = 5;', tone: C.kept },
            { text: 'const BACKOFF = exponential;', tone: C.kept },
          ]}
        />
      </div>
      <Note tone={C.discarded} delay={1500}>
        → the requirement no longer matches the code that stands
      </Note>
    </Frame>
  );
}

/** Step three: one plan, the CR rewritten in place, a retroactive CR for `none`. */
function Reconcile() {
  return (
    <Frame station={4}>
      <Label tone={C.knowledge}>step 3 · reconcile</Label>
      <Heading>The iteration is the ground truth</Heading>
      <div style={{ display: 'flex', gap: 46, marginTop: 34, alignItems: 'flex-start' }}>
        <Terminal
          delay={200}
          width={760}
          command="/reconcile-cr tighten-retry"
          lines={[
            { text: 'one plan, one answer:' },
            { text: 'rewrite CR-XXXX   ← attempt 1', tone: C.text },
            { text: 'rewrite CR-YYYY   ← attempt 2', tone: C.text },
            { text: 'retroactive CR    ← attempt 3 (none)', tone: C.partial },
            { text: 'proceed? yes', tone: C.kept },
          ]}
        />
        <FilePanel
          delay={1500}
          width={830}
          path="docs/cr/CR-XXXX-retry.md"
          lines={[
            { text: 'reconciled: 2026-10-28', tone: C.dim },
            { text: '## Reconciliation', tone: C.knowledge },
            { text: 'original:   retry 3 times, every 5 s', tone: C.dim },
            { text: 'reconciled: retry 5 times, exponential' },
            { text: 'entry:      2026-10-28-tighten-retry.md #1', tone: C.dim },
            { text: 'commit:     a1b2c3d', tone: C.dim },
          ]}
        />
      </div>
      <Note tone={C.dim} delay={2600}>
        → it changes documents only. never code.
      </Note>
    </Frame>
  );
}

/** The other entry: iterate with no CR, and let reconciliation write one afterwards. */
function Explore() {
  return (
    <Frame station={5}>
      <Label tone={C.partial}>or start without a CR</Label>
      <Heading>Explore first, govern after</Heading>
      <div style={{ display: 'flex', gap: 46, marginTop: 34, alignItems: 'flex-start' }}>
        <Terminal
          delay={200}
          width={760}
          command="/iterate-cr"
          lines={[
            { text: 'crs: []  exploration session' },
            { text: 'every entry is CR: none' },
            { text: '' },
            { text: '❯ /reconcile-cr', tone: C.text },
          ]}
        />
        <FilePanel
          delay={1400}
          width={830}
          path="docs/cr/CR-YYYY-offline-export.md"
          lines={[
            { text: 'status: implemented' },
            { text: 'origin: retroactive', tone: C.partial },
            { text: '' },
            { text: '## Related Items', tone: C.knowledge },
            { text: 'docs/cr/iterations/2026-10-28-offline-export.md', tone: C.dim },
          ]}
        />
      </div>
    </Frame>
  );
}

/** The payoff: the reconciled CR as the next session reads it. */
function Payoff() {
  return (
    <Frame station={6}>
      <Label tone={C.knowledge}>the payoff</Label>
      <div style={{ display: 'flex', gap: 60, marginTop: 22, alignItems: 'center' }}>
        <FilePanel
          delay={140}
          width={1040}
          path="docs/cr/CR-XXXX-retry.md"
          lines={[
            { text: 'status: implemented', tone: C.dim },
            { text: 'reconciled: 2026-10-28', tone: C.dim },
            { text: '' },
            { text: 'The client MUST retry 5 times', tone: C.text },
            { text: 'with exponential backoff.', tone: C.text },
            { text: '' },
            { text: '## Reconciliation  1 row · a1b2c3d', tone: C.knowledge },
          ]}
        />
        <div className="g-pop" style={{ animationDelay: '600ms', flexShrink: 0 }}>
          <MorphElement id="cr-solid">
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
      <Note tone={C.kept} delay={1500}>
        → the next session reads this before it writes a line
      </Note>
      <div
        className="g-rise"
        style={{
          marginTop: 24,
          fontSize: MD,
          fontWeight: 700,
          color: '#ffffff',
          whiteSpace: 'nowrap',
          animationDelay: '1800ms',
        }}
      >
        The CR describes what you kept.
      </div>
    </Frame>
  );
}

/** The lifecycle, its supporting skills, and the one line worth copying. */
function Cta() {
  const steps: Array<[string, string, string]> = [
    ['/governance', 'author the change request', C.dim],
    ['/implement-cr', 'ship the first version', C.kept],
    ['/iterate-cr', 'adjust it, with a ledger', C.partial],
    ['/reconcile-cr', 'make the CR say what stands', C.knowledge],
  ];

  return (
    <Frame station={7}>
      <Label tone={C.knowledge}>the loop</Label>
      <Heading size={MD}>Author, implement, iterate, reconcile</Heading>
      <div style={{ display: 'flex', gap: 70, alignItems: 'center' }}>
        <div style={{ flex: 1, marginTop: 20 }}>
          {steps.map(([cmd, does, tone], i) => (
            <div
              key={cmd}
              className="g-slide"
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: 22,
                padding: '8px 0',
                animationDelay: `${300 + i * 110}ms`,
              }}
            >
              <span style={{ fontFamily: MONO, fontSize: T.mono, color: tone, width: 330 }}>
                {cmd}
              </span>
              <span style={{ fontFamily: MONO, fontSize: T.small, color: C.dim }}>{does}</span>
            </div>
          ))}
          <div
            className="g-fade"
            style={{
              marginTop: 14,
              fontFamily: MONO,
              fontSize: T.small,
              color: C.dim,
              animationDelay: '800ms',
            }}
          >
            with /checkpoint-commit · /checkpoint-read · /checkpoint-distill
          </div>
        </div>
        <MorphElement id="cr-solid">
          <Facets
            seed={7}
            radius={170}
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
          marginTop: 30,
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
 * The wrap page: ground alone, identical to frame 0.
 *
 * Without it the capture ends mid-content and the loop is a jump cut. The empty
 * span gives the page one short animation, so the capture measures a beat
 * instead of taking its 3s fallback for a page with no animation.
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

/** The wrap covers every station at once, so the planes get longer to travel home. */
const WRAP_MORPH_MS = 1100;

/** Opacity-only default transition; the backdrop morph carries the motion. */
export const transition: SlideTransition = {
  duration: 240,
  exit: { duration: 200, easing: EASE_IN, keyframes: [{ opacity: 1 }, { opacity: 0 }] },
  enter: {
    duration: 240,
    delay: 40,
    easing: EASE_OUT,
    keyframes: [{ opacity: 0 }, { opacity: 1 }],
  },
  morph: { duration: MORPH_MS, easing: EASE_STANDARD },
};

/** The boundary into `Reset`: content fades, the planes glide home to station 0. */
Reset.transition = {
  ...transition,
  morph: { duration: WRAP_MORPH_MS, easing: EASE_STANDARD },
} satisfies SlideTransition;

export const meta: SlideMeta = {
  title: 'iterate-reconcile',
  createdAt: '2026-10-28T12:00:00.000Z',
};

export default [
  Problem,
  Implement,
  Iterate,
  Drift,
  Reconcile,
  Explore,
  Payoff,
  Cta,
  Reset,
] satisfies Page[];
