/**
 * Smoke-checks the single-file deck build by actually rendering it.
 *
 * This deck fails silently. A wrong router basename, a font that never
 * resolves, or content pushed past the canvas edge all produce a valid HTML
 * file, exit code 0, and a blank or broken page that no build step notices.
 * The single-file build has already produced exactly that once: vite-plugin-
 * singlefile rewrote `base` to './', the router basename became '/./', and the
 * page rendered empty with nothing but a console warning.
 *
 * So the build is not considered green until a browser has opened the artifact
 * and found content in it. This is the gate CI runs after building.
 *
 * Usage:
 *   node check.singlefile.mjs [path/to/dist-single]
 *
 * Exits non-zero with a diagnosis on failure.
 *
 * @agents-index Renders the built single-file deck headlessly and fails if it is blank or errored.
 */

import { existsSync } from 'node:fs';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright-chromium';

const SLIDE_ID = 'checkpoint-distill';
const PORT = 8973;
/** Below this much rendered text the page is blank or half-mounted, not merely sparse. */
const MIN_TEXT_LENGTH = 200;

const outDir = path.resolve(process.argv[2] ?? path.join(import.meta.dirname, 'dist-single'));
const indexPath = path.join(outDir, 'index.html');

if (!existsSync(indexPath)) {
  console.error(`FAIL: no build at ${indexPath} — run "npm run build:single" first`);
  process.exit(1);
}

const CONTENT_TYPES = { '.html': 'text/html', '.ico': 'image/x-icon' };

/**
 * Serves the built directory with SPA fallback so client-side routes resolve.
 *
 * Requests for paths that do not exist on disk fall back to index.html, which
 * is what any static host serving a single-page app does.
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

const server = serve(outDir, PORT);
const browser = await chromium.launch();
const failures = [];

try {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  const consoleErrors = [];
  page.on('pageerror', (err) => consoleErrors.push(err.message));
  page.on('console', (msg) => msg.type() === 'error' && consoleErrors.push(msg.text()));

  await page.goto(`http://127.0.0.1:${PORT}/s/${SLIDE_ID}`, { waitUntil: 'load' });
  await page.waitForTimeout(3500);

  const bodyText = await page.evaluate(() => document.body.innerText);

  if (bodyText.length < MIN_TEXT_LENGTH) {
    failures.push(`page rendered ${bodyText.length} characters of text (expected at least ${MIN_TEXT_LENGTH}) — likely a blank or unmounted page`);
  }
  // A wrong basename does not error; the router simply matches nothing and the
  // app renders its not-found route, which still contains plenty of text.
  if (/not found/i.test(bodyText)) {
    failures.push(`slide route resolved to the not-found page — check the router basename`);
  }
  if (consoleErrors.length > 0) {
    failures.push(`console errors: ${consoleErrors.slice(0, 3).join(' | ')}`);
  }

  if (failures.length === 0) {
    console.log(`OK: single-file deck renders (${bodyText.length} characters, no console errors)`);
  }
} finally {
  await browser.close();
  server.close();
}

if (failures.length > 0) {
  for (const failure of failures) console.error(`FAIL: ${failure}`);
  process.exit(1);
}
