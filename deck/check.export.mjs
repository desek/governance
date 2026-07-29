/**
 * Verifies the exported deck by opening it the way a reader will.
 *
 * This deck fails silently. Content pushed past the canvas edge, a page that
 * captured mid-animation, an export that produced eight empty frames: all of
 * them exit 0 and produce a plausible-looking file. Only rendering the artifact
 * catches them.
 *
 * It checks the shipped file rather than the build it came from, and over
 * file:// rather than a server, because opening it from disk is the entire
 * reason this artifact exists.
 *
 * Usage:
 *   node check.export.mjs [path/to/exported.html]
 *
 * Defaults to html-export/checkpoint-distill.html. Exits non-zero with a
 * diagnosis on failure.
 *
 * @agents-index Opens the exported deck from disk and fails if any page is blank or errored.
 */

import { existsSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright-chromium';

/** Below this much text a page is blank or half-captured, not merely sparse. */
const MIN_PAGE_TEXT = 20;

const target = path.resolve(
  process.argv[2] ?? path.join(import.meta.dirname, 'html-export', 'checkpoint-distill.html'),
);

if (!existsSync(target)) {
  const hint = existsSync(target.replace(/\.html$/, '.zip'))
    ? 'found a .zip instead — the export only yields a single file when driven from the single-file build'
    : 'run "npm run export:html" first';
  console.error(`FAIL: no export at ${target} — ${hint}`);
  process.exit(1);
}

const browser = await chromium.launch();
const failures = [];

try {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  const consoleErrors = [];
  page.on('pageerror', (err) => consoleErrors.push(err.message));
  page.on('console', (msg) => msg.type() === 'error' && consoleErrors.push(msg.text()));

  await page.goto(pathToFileURL(target).href, { waitUntil: 'load' });
  await page.waitForTimeout(2500);

  const report = await page.evaluate(() => {
    const pages = Array.from(document.querySelectorAll('.os-page'));
    return {
      count: pages.length,
      counterTotal: document.getElementById('os-total')?.textContent ?? '',
      // innerText ignores hidden elements, so read textContent to measure every
      // page rather than only the one on screen.
      lengths: pages.map((p) => p.textContent.trim().length),
    };
  });

  if (report.count === 0) {
    failures.push('no pages in the export — it captured nothing');
  }
  if (report.counterTotal !== String(report.count)) {
    failures.push(`counter says ${report.counterTotal} pages but ${report.count} are present`);
  }

  const blank = report.lengths
    .map((len, i) => ({ page: i + 1, len }))
    .filter(({ len }) => len < MIN_PAGE_TEXT);
  if (blank.length > 0) {
    failures.push(`blank pages: ${blank.map((b) => `${b.page} (${b.len} chars)`).join(', ')}`);
  }
  if (consoleErrors.length > 0) {
    failures.push(`console errors: ${consoleErrors.slice(0, 3).join(' | ')}`);
  }

  if (failures.length === 0) {
    console.log(`OK: export opens from disk, ${report.count} pages, all with content`);
  }
} finally {
  await browser.close();
}

if (failures.length > 0) {
  for (const failure of failures) console.error(`FAIL: ${failure}`);
  process.exit(1);
}
