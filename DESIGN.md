# Design system: killian-steunou.com

A one-page researcher homepage, printed in one ink. It should read like a working researcher's page:
plain lists, a numbered bibliography, and one signature effect (the halftone portrait).

`peek/`, `videollm-survey/`, `moodio/` and `blog/nlp_metrics_visual_guide.html` are self-contained and **out of scope**. Never restyle them.

## Principles

1. **One ink.** Every colour in the page itself is the ink, the paper, or a mix of the two. Figures keep their
   original colours inside an ink-framed white mat (`.thumb`). No logos, no second accent, no gradients, no shadows.
2. **One page.** Everything lives on `index.html` behind anchors (`#news`, `#publications`, `#background`, `#projects`,
   `#writing`, `#contact`). `blog.html`, `demos.html`, `research.html` are meta-refresh redirects. Keep them.
3. **Plain HTML/CSS/JS, no build step.** GitHub Pages serves the files as they are.
4. **One effect.** The halftone portrait (`script.js`) prints in on load and scatters under the pointer. The citation
   cards are the only other motion. No scroll reveals, no background canvas. All motion is off under `prefers-reduced-motion`.

## Tokens (`:root` in style.css)

| Token | Light | Dark |
|---|---|---|
| `--paper` | bone `oklch(94.5% 0.01 90)` | Klein blue `oklch(36% 0.2 268)` |
| `--ink` | Klein blue `oklch(42% 0.24 268)` | bone `oklch(94.5% 0.01 90)` |
| `--ink-soft` / `--ink-wash` | `color-mix(in oklab, ink, paper)` | same |

Dark mode swaps paper and ink (like printing on blue stock) and follows the OS. There is no toggle.
Mix tints **in oklab**: in oklch the blue→bone hue path passes through green.

## Type

- **Schibsted Grotesk** 400/500/800: everything. 800 uppercase only for the name.
- **JetBrains Mono**: dates, section labels, link rows, tags.

## Components

- `.hero` + `#portrait`: the name and the halftone canvas. In dark mode the dots mark light areas instead of dark ones.
- `.lede`: the bio. `.cite` + `.cite-card` = a citation `[n]` with a hover/focus preview card linking to `#rn`.
- `.section`: mono label column + content. `.list.dated` = mono date column + text; `.rule` adds dashed separators.
- `.pubs` / `.pub#rN`: numbered bibliography (the number comes from the CSS counter, so keep `id="rN"` in the same order).
  `.no-thumb` for entries without an image. `:target` highlights the entry a citation jumped to.
- `.projects`: title, one line, mono links. Coursework reports fold into a `<details>`.
- Inner pages (demos, efficiency blog) use `.site-top`, `.page-hero`, `.embed`, `.blog-article`.

## Copy

First person and factual, in sentences that connect to each other (avoid a row of short clipped statements). No em dashes, no "not X but Y", no triads for rhythm, no sales words.

## Maintenance map

| Change | File |
|---|---|
| Add news | prepend an `<li>` to `#news .dated`; move the oldest visible item into `<details>` |
| Add publication | new `.pub` in `#publications`, renumber `id="rN"` and the `.cite` links in the lede |
| Add project | one `<li>` in `.projects` |
| Add blog post | `blog/*.html` + `#writing` + `#news` entry |
| Add demo | copy a `demo_*.html`, edit title/copy/iframe, link it from `#projects` |
| Colours/type | `style.css` `:root` (the canvas reads its colour from CSS, nothing to sync) |
