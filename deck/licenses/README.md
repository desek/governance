# Vendored font licenses

The deck embeds Geist and Geist Mono directly in its exported artifact rather
than linking a webfont CDN, so it redistributes the font software. The SIL Open
Font License 1.1 permits that, and requires the copyright notice and license to
travel with the fonts.

- `geist-OFL.txt` — Geist, Copyright 2024 The Geist Project Authors
- `geist-mono-OFL.txt` — Geist Mono, Copyright 2024 The Geist Project Authors

Upstream: https://github.com/vercel/geist-font

Neither declares a Reserved Font Name, so the OFL's renaming restriction does
not apply. A short notice is also carried inside the deck's own stylesheet, so
it is embedded in the exported HTML alongside the font data itself.
