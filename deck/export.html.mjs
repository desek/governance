/**
 * Exports the deck as a standalone, openable HTML file.
 *
 * This is the artifact you can hand someone. Unlike the published page it has
 * no router, so it opens straight from disk over file:// where the single-page
 * build only ever reaches its not-found route.
 *
 * open-slide implements this export in the browser, not the CLI: it renders
 * every page through React, keeps the resulting markup, inlines the readable
 * CSS, and ships a few lines of vanilla JavaScript for scale-to-fit and
 * keyboard navigation. There is no `open-slide export-html` to call, so this
 * script drives the real UI and catches the download.
 *
 * What it produces is a static snapshot. Entrance animations and the morph
 * transitions between pages do not survive, because only the settled markup is
 * captured. For motion, use the video capture instead.
 *
 * Usage:
 *   node export.html.mjs [path/to/built/dir]   # defaults to dist-single/
 *
 * Writes to html-export/. Exits non-zero if the export never arrives.
 *
 * @agents-index Drives open-slide's in-browser HTML export to produce a standalone deck file.
 */

import { existsSync, mkdirSync, rmSync, statSync } from 'node:fs';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { chromium } from 'playwright-chromium';

const SLIDE_ID = 'checkpoint-distill';
const PORT = 8974;
/** The export renders and rasterises every page, so it is far from instant. */
const EXPORT_TIMEOUT_MS = 120_000;

const sourceDir = path.resolve(process.argv[2] ?? path.join(import.meta.dirname, 'dist-single'));
const outDir = path.join(import.meta.dirname, 'html-export');

if (!existsSync(path.join(sourceDir, 'index.html'))) {
  console.error(`FAIL: no build at ${sourceDir}/index.html — run "npm run build:single" first`);
  process.exit(1);
}

// A browser refuses to execute a module script served as octet-stream, so a
// multi-file build needs real types for its chunks, not just for the document.
const CONTENT_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
};

/**
 * Serves the built directory with SPA fallback so client-side routes resolve.
 *
 * @param {string} dir - Absolute path to the directory to serve.
 * @param {number} port - Port to listen on.
 * @returns {import('node:http').Server} The listening server.
 */
function serve(dir, port) {
  return http
    .createServer((req, res) => {
      let file = path.join(dir, req.url.split('?')[0]);
      if (!existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(dir, 'index.html');
      res.setHeader('Content-Type', CONTENT_TYPES[path.extname(file)] ?? 'application/octet-stream');
      res.end(fs.readFileSync(file));
    })
    .listen(port);
}

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

const server = serve(sourceDir, PORT);
const browser = await chromium.launch();
let savedPath = null;

try {
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 }, acceptDownloads: true });
  const page = await context.newPage();

  await page.goto(`http://127.0.0.1:${PORT}/s/${SLIDE_ID}`, { waitUntil: 'load' });
  // The export walks slide.default, so the deck module has to have loaded.
  await page.waitForTimeout(3000);

  const downloadPromise = page.waitForEvent('download', { timeout: EXPORT_TIMEOUT_MS });
  await page.getByRole('button', { name: 'Download' }).click();
  await page.getByRole('menuitem', { name: 'Export as HTML' }).click();

  const download = await downloadPromise;
  savedPath = path.join(outDir, download.suggestedFilename());
  await download.saveAs(savedPath);
} finally {
  await browser.close();
  server.close();
}

if (!savedPath || !existsSync(savedPath)) {
  console.error('FAIL: the export never produced a download');
  process.exit(1);
}

// A .zip means the deck referenced same-origin assets that had to travel
// alongside the markup; a bare .html means everything fitted in one file.
const kind = savedPath.endsWith('.zip') ? 'zip (html plus assets/)' : 'single html file';
console.log(`html export → ${savedPath} (${(statSync(savedPath).size / 1024).toFixed(0)} kB, ${kind})`);
