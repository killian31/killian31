# Design system — killian-steunou.com

The site is a **single-page academic "research log"**: dense, honest, typography-first.
It should read like the personal page of a working researcher, not a product landing page.

`peek/` is a standard research-paper project page template and is **out of scope** — never restyle it.

## Principles

1. **Content over chrome.** Lists and hairlines, not viewport-tall "scenes". No gradient orbs,
   no glassmorphism cards, no marketing headlines. Copy is first-person and factual.
2. **One page.** Everything lives on `index.html` behind anchor navigation
   (`#news`, `#publications`, `#background`, `#projects`, `#demos`, `#writing`, `#contact`).
   Old hub pages (`blog.html`, `demos.html`, `research.html`) are meta-refresh redirects — keep them.
3. **Plain HTML/CSS/JS, no build step.** GitHub Pages serves the files as-is; keeps the site light
   (carbon badge in footer is a feature, not decoration).
4. **Mobile first in practice.** Most visitors are on phones: no horizontal scroll,
   ≥44px touch targets, photo shrinks and name stays in the first viewport.

## Tokens (see `:root` in style.css)

| Role | Light | Dark |
|---|---|---|
| Background | `#f7f2ea` warm paper | `#161310` warm near-black |
| Text | `#211c17` | `#ede3d6` |
| Accent (terracotta) | `#b05842` | `#d68a6e` |
| Secondary (sage) | `#82967c` | `#a0b098` |

- The **connected-dots canvas** (`#neural-bg`, drawn in script.js) uses these exact RGB values —
  keep `getColors()` in sync with `--accent-rgb` / `--sage-rgb`.
- Terracotta = interactive/emphasis. Sage = secondary meta (venues, demo affordances). No third color.

## Type

- **Fraunces** (500, italic for accents) — display: name, section titles, card titles. Serif = the researcher voice.
- **Inter** (400/500/600) — body and UI.
- **System mono stack** (`--font-mono`) — all metadata: dates, kickers, section labels, link rows, tags. The mono meta is what gives the "log" feel; don't replace it with pills or chips.

## Recurring components

- `.section-label` — mono uppercase label with terracotta dot. The only section heading; no rhetorical sentence-headlines.
- `.news-item` — mono date column + prose body; `.latest` gets a pulsing dot. Older entries fold into `<details class="news-older">`. **To add news: prepend a `.news-item`, move `latest` class, push the oldest visible item into the details.**
- `.pub-card` — hairline card: mono venue/year, serif title, authors (self in `<strong>`), one-sentence TL;DR, mono link row. Thumbnail optional (`.no-thumb`).
- `.cv-item` — logo + role + mono dates + one-line note. Two columns (experience / education), stacks on mobile.
- `.project-card` / `.demo-card` / `.report-item` / `.writing-item` — same grammar: serif title, muted description, mono tags/links.

## Don'ts

- No scroll-reveal animations on the homepage (the only motion: dots canvas, hover lifts, news pulse).
- No emoji as icons; no badge/pill tag clouds; no "Let's connect!" copy.
- Don't add a second accent color or cool-toned grays — everything stays warm.
- Don't move News/Publications below the fold order: hero → news → publications is the researcher-first hierarchy.
- Footer keeps: carbon badge, ClustrMaps visitor map, copyright. They're deliberate.

## Maintenance map

| Change | File |
|---|---|
| Add news / publication / project | `index.html` (one block, follow existing markup) |
| Add blog post | `blog/*.html` (self-contained or use `.blog-article` classes) + `#writing` list + `#news` entry |
| Add demo | copy a `demo_*.html`, edit title/iframe + `#demos` card |
| Colors/type | `style.css` `:root` (+ `getColors()` in `script.js`) |
