/**
 * Builds the deck as a single self-contained HTML file.
 *
 * `open-slide build` emits an index.html plus an assets/ directory. That is
 * correct for a site but awkward as a committed doc artifact: every rebuild
 * churns a handful of content-hashed filenames, and the page only works if the
 * whole directory travels together. This produces one file instead, with the
 * JavaScript, CSS, Geist woff2 faces, and favicon all inlined, so `docs/deck/`
 * holds exactly one HTML page and one video.
 *
 * open-slide sets `configFile: false`, so a user vite.config.ts is ignored and
 * `OpenSlideConfig` exposes no plugin hook. The supported way in is
 * `createViteConfig`, which hands back the same InlineConfig the CLI uses; this
 * script appends to it and drives Vite directly.
 *
 * Usage:
 *   node build.singlefile.mjs          # → dist-single/index.html
 *
 * @agents-index Builds the checkpoint-distill deck into one self-contained HTML file.
 */

import { readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { build } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { createViteConfig } from '@open-slide/core/vite';

const OUT_DIR = path.resolve(import.meta.dirname, 'dist-single');

/**
 * Wraps vite-plugin-singlefile so it cannot rewrite `base`.
 *
 * The plugin pins `base` to './' so the bundle also works over file://.
 * open-slide passes `import.meta.env.BASE_URL` straight to
 * <BrowserRouter basename>, where './' normalises to '/./' and matches no
 * route. The page then renders blank with no error, only a console warning, so
 * this failure is invisible to any check that does not look at pixels.
 *
 * Vite derives BASE_URL from the resolved base, so a later `config` hook or a
 * `define` cannot win. The base has to stay untouched from the start.
 *
 * @returns {import('vite').Plugin} The plugin with `base` stripped from its config patch.
 */
function singleFileKeepingBase() {
  const plugin = viteSingleFile({ useRecommendedBuildConfig: false });
  const inner = plugin.config;
  if (!inner) return plugin;

  return {
    ...plugin,
    config(...args) {
      const handler = typeof inner === 'function' ? inner : inner.handler;
      const patch = handler.apply(this, args);
      if (patch && typeof patch === 'object' && 'base' in patch) {
        const { base: _dropped, ...rest } = patch;
        return rest;
      }
      return patch;
    },
  };
}

/**
 * Inlines the favicon as a data URI and removes the leftover assets directory.
 *
 * vite-plugin-singlefile inlines script and style tags but leaves `<link
 * rel="icon">` alone, which would keep a two-file output for the sake of one
 * icon.
 *
 * @param {string} outDir - Absolute path to the build output directory.
 * @returns {void}
 * @throws {Error} If index.html is missing, i.e. the Vite build did not emit.
 */
function inlineFavicon(outDir) {
  const indexPath = path.join(outDir, 'index.html');
  let html = readFileSync(indexPath, 'utf8');

  html = html.replace(/href="([^"]*\/([^"/]+\.ico))"/g, (match, href, filename) => {
    const iconPath = path.join(outDir, 'assets', filename);
    try {
      const encoded = readFileSync(iconPath).toString('base64');
      return `href="data:image/x-icon;base64,${encoded}"`;
    } catch {
      return match;
    }
  });

  writeFileSync(indexPath, html);
  rmSync(path.join(outDir, 'assets'), { recursive: true, force: true });
}

const config = await createViteConfig({ userCwd: import.meta.dirname, mode: 'build' });
config.plugins.push(singleFileKeepingBase());
config.build = {
  ...config.build,
  outDir: OUT_DIR,
  // Inline every asset regardless of size; the woff2 faces are the point.
  assetsInlineLimit: Number.MAX_SAFE_INTEGER,
  cssCodeSplit: false,
  // One file is by definition one oversized chunk.
  chunkSizeWarningLimit: Number.MAX_SAFE_INTEGER,
  rollupOptions: { output: { inlineDynamicImports: true } },
};

await build(config);
inlineFavicon(OUT_DIR);

const bytes = readFileSync(path.join(OUT_DIR, 'index.html')).length;
console.log(`single-file deck → ${path.join(OUT_DIR, 'index.html')} (${(bytes / 1024 / 1024).toFixed(2)} MB)`);
