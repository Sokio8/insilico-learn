# Insilico Learn

Static site for `insilicoterminal.com/learn`: market and execution guides from the Insilico Terminal team.

## Run locally

```sh
npm install
npm run build   # content/*.md -> dist/learn/
npm run serve   # http://localhost:4321/learn/
```

## Layout

| Path | What it is |
|---|---|
| `content/*.md` | One guide per file (frontmatter + Markdown) |
| `public/assets/figures/` | UI screenshots used in guides |
| `public/assets/fonts/` | Berkeley Mono (licensed) |
| `src/templates.mjs` | Hub and article page templates |
| `src/styles.css` | Site styles |
| `src/covers.mjs` | Generated SVG cover art, one motif per guide |
| `build.mjs` | Markdown renderer and site build |

## Writing a guide

Frontmatter fields: `title`, `slug` (must match the file name), `category`, `level` (Beginner, Intermediate or Advanced), optional `step` (Terminal 101 order), `cover` (a motif from `src/covers.mjs`), `theme` (black, green or white), `short`, `excerpt`, and `docs` (list of `title` + `url`).

The first paragraph is the lede. Besides normal Markdown the renderer supports:

- ```` ```cli ```` blocks: terminal CLI commands; `#` lines are comments.
- Callouts: a blockquote starting with `**Terminal tip:**`, `**Risk note:**` or `**In the docs:**`.
- Screenshots: `![alt](/learn/assets/figures/file.png "Caption")` on its own line.
- ```` ```book ```` blocks: an order book ladder (`side:`, `buy:`/`sell:`, then `price size` lines); a market order walks the book and shows fills, average price and slippage.
- ```` ```bars ```` blocks: stacked horizontal bars (`Label: Segment 45, Segment 5 | note`).

The build fails on missing fields, unknown cover motifs, gaps in Terminal 101 steps, or screenshots that don't exist.

## Fonts

Berkeley Mono is a licensed font and its files are not in this repository. Before building, copy `BerkeleyMono-Regular.otf` and `BerkeleyMono-Bold.otf` from the Insilico design system (`assets/fonts/`) into `public/assets/fonts/`. Without them the site falls back to the next monospace font.
