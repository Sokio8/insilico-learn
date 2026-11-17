// Static build for insilicoterminal.com/learn.
// content/*.md (frontmatter + Markdown) -> dist/learn/**/index.html
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import { Marked } from "marked";
import { cover, MOTIFS } from "./src/covers.mjs";
import { BASE, SITE, esc, favicon, logo, hubPage, articlePage } from "./src/templates.mjs";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const CONTENT = path.join(ROOT, "content");
const OUT = path.join(ROOT, "dist", BASE.slice(1));

const REQUIRED = ["title", "slug", "category", "level", "cover", "theme", "short", "excerpt"];
const THEMES = ["black", "green", "white"];
const LEVELS = ["Beginner", "Intermediate", "Advanced"];
// Library order: topics read roughly in the order a new user needs them.
const TOPICS = ["Terminal Basics", "Setup", "Security", "Execution", "Risk Management", "Order Flow", "Charting", "Terminal CLI", "Workspace", "Cortex", "Strategy"];
const CALLOUTS = { "Terminal tip": ["tip", "Terminal Tip"], "Risk note": ["risk", "Risk Note"], "In the docs": ["docs", "In the Docs"] };

const slugify = (s) =>
  s.toLowerCase().replace(/<[^>]+>/g, "").replace(/&[a-z#0-9]+;/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const stripTags = (s) => s.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, " ").trim();

// ---------- inline graphics (fenced ```book and ```bars blocks) ----------

// "key: value" header lines, then data lines.
function parseSpec(text) {
  const meta = {};
  const rows = [];
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const m = line.match(/^(title|side|buy|sell|unit|caption):\s*(.+)$/i);
    if (m) meta[m[1].toLowerCase()] = m[2].trim();
    else rows.push(line);
  }
  return { meta, rows };
}

const fmtNum = (n, d = 2) => Number(n).toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
const decimals = (s) => (String(s).split(".")[1] || "").length;

function vizFrame(title, body, caption) {
  return `<figure class="viz"><div class="viz__bar"><span class="dot"></span>${esc(title || "Example")}</div><div class="viz__body">${body}</div>${caption ? `<figcaption>${esc(caption)}</figcaption>` : ""}</figure>\n`;
}

// Order book ladder. Rows: "price size". A `buy:` or `sell:` size walks the book and shows each fill.
function renderBook(text) {
  const { meta, rows } = parseSpec(text);
  const side = (meta.side || "ask").toLowerCase() === "bid" ? "bid" : "ask";
  const levels = rows.map((r) => r.split(/\s+/)).map(([p, s]) => ({ ps: p, price: Number(p), size: Number(s) }));
  const dp = Math.max(...levels.map((l) => decimals(l.ps)));
  // Fill order: asks from lowest price up, bids from highest price down.
  const fillOrder = [...levels].sort((a, b) => (side === "ask" ? a.price - b.price : b.price - a.price));
  const order = Number(meta.buy || meta.sell || 0);
  let left = order;
  let cost = 0;
  for (const l of fillOrder) {
    l.fill = Math.min(l.size, Math.max(0, left));
    left -= l.fill;
    cost += l.fill * l.price;
  }
  const maxSize = Math.max(...levels.map((l) => l.size));
  const display = [...levels].sort((a, b) => b.price - a.price);
  const rowsHtml = display
    .map((l) => {
      const w = (l.size / maxSize) * 100;
      const fw = (l.fill / maxSize) * 100;
      return `<div class="book__row${l.fill ? " is-hit" : ""}"><span class="book__px book__px--${side}">${fmtNum(l.price, dp)}</span><span class="book__track"><i class="book__depth book__depth--${side}" style="width:${w.toFixed(1)}%"></i>${l.fill ? `<i class="book__fill" style="width:${fw.toFixed(1)}%"></i>` : ""}</span><span class="book__sz">${l.fill ? `<b>${l.fill}</b> / ` : ""}${l.size}</span></div>`;
    })
    .join("");
  let summary = "";
  if (order && left <= 0) {
    const best = fillOrder[0].price;
    const avg = cost / order;
    const worst = fillOrder.filter((l) => l.fill).pop().price;
    const bps = (Math.abs(avg - best) / best) * 1e4;
    summary = `<div class="book__sum"><span>${meta.buy ? "Market buy" : "Market sell"} <b>${order}</b></span><span>Avg fill <b>${fmtNum(avg, dp + 1)}</b></span><span>Worst level <b>${fmtNum(worst, dp)}</b></span><span>Slippage <b>${fmtNum(bps, 1)} bps</b></span></div>`;
  }
  const legend = order ? `<div class="viz__legend"><span><i class="sw sw--fill"></i>Filled by your order</span><span><i class="sw sw--${side}"></i>Resting ${side === "ask" ? "asks" : "bids"}</span></div>` : "";
  const head = `<div class="book__row book__row--head"><span>Price</span><span>Depth</span><span>${order ? "Fill/Size" : "Size"}</span></div>`;
  return vizFrame(meta.title, `<div class="book">${head}${rowsHtml}</div>${summary}${legend}`, meta.caption);
}

// Horizontal stacked bars. Rows: "Label: Segment 45, Segment 5 | note". The note replaces the total on the right.
function renderBars(text) {
  const { meta, rows } = parseSpec(text);
  const unit = meta.unit || "";
  const money = (v) => (unit === "$" ? `$${fmtNum(v, v % 1 ? 2 : 0)}` : `${fmtNum(v, v % 1 ? 2 : 0)}${unit}`);
  const parsed = rows.map((r) => {
    const [main, note] = r.split("|").map((s) => s.trim());
    const i = main.indexOf(":");
    const label = main.slice(0, i).trim();
    const segs = main
      .slice(i + 1)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => {
        const m = s.match(/^(.*?)\s+(-?[\d.]+)$/);
        return { name: m[1], value: Number(m[2]) };
      });
    return { label, segs, note, total: segs.reduce((a, s) => a + s.value, 0) };
  });
  const names = [...new Set(parsed.flatMap((r) => r.segs.map((s) => s.name)))];
  const tone = (name) => {
    if (/^(long|buy|bid)/i.test(name)) return "pos";
    if (/^(short|sell|ask|loss)/i.test(name)) return "neg";
    return `s${(names.filter((n) => !/^(long|buy|bid|short|sell|ask|loss)/i.test(n)).indexOf(name) % 4) + 1}`;
  };
  const max = Math.max(...parsed.map((r) => r.total));
  const rowsHtml = parsed
    .map(
      (r) =>
        `<div class="bars__row"><span class="bars__label">${esc(r.label)}</span><span class="bars__track">${r.segs
          .map((s) => `<i class="bars__seg bars__seg--${tone(s.name)}" style="width:${((s.value / max) * 100).toFixed(2)}%" title="${esc(`${s.name}: ${money(s.value)}`)}">${s.value / max > 0.12 ? `<em>${esc(money(s.value))}</em>` : ""}</i>`)
          .join("")}</span><span class="bars__total">${esc(r.note || money(r.total))}</span></div>`,
    )
    .join("");
  const legend = `<div class="viz__legend">${names.map((n) => `<span><i class="sw sw--${tone(n)}"></i>${esc(n)}</span>`).join("")}</div>`;
  return vizFrame(meta.title, `<div class="bars">${rowsHtml}</div>${legend}`, meta.caption);
}

function makeMarked() {
  const ids = new Set();
  const toc = [];
  const md = new Marked({
    gfm: true,
    renderer: {
      heading({ tokens, depth }) {
        const inner = this.parser.parseInline(tokens);
        if (depth > 3) return `<h${depth}>${inner}</h${depth}>\n`;
        let id = slugify(inner) || "section";
        for (let n = 2; ids.has(id); n++) id = `${slugify(inner)}-${n}`;
        ids.add(id);
        if (depth === 2) toc.push({ id, html: inner });
        return `<h${depth} id="${id}">${inner}<a class="anchor" href="#${id}" aria-label="Link to this section">#</a></h${depth}>\n`;
      },
      code({ text, lang }) {
        if (lang === "cli") {
          const body = text
            .split("\n")
            .filter((l) => l.trim())
            .map((l) => (l.trimStart().startsWith("#") ? `<span class="c">${esc(l)}</span>` : `<span class="l">${esc(l)}</span>`))
            .join("");
          return `<div class="cli"><div class="cli__bar"><span><span class="dot"></span>Terminal CLI</span><button class="cli__copy" type="button">Copy</button></div><pre>${body}</pre></div>\n`;
        }
        if (lang === "book") return renderBook(text);
        if (lang === "bars") return renderBars(text);
        return `<pre class="code"><code>${esc(text)}</code></pre>\n`;
      },
      blockquote({ tokens }) {
        const inner = this.parser.parse(tokens);
        const m = inner.match(/^<p><strong>([^<]+?):?<\/strong>:?\s*/);
        const callout = m && CALLOUTS[m[1].replace(/:$/, "")];
        if (callout) {
          const rest = inner.slice(m[0].length).replace(/^[a-z]/, (c) => c.toUpperCase());
          return `<aside class="callout callout--${callout[0]}"><span class="callout__label">${callout[1]}</span><p>${rest}</aside>\n`;
        }
        return `<aside class="callout">${inner}</aside>\n`;
      },
      table(token) {
        return `<div class="table">${this.constructor.prototype.table.call(this, token)}</div>\n`;
      },
      // A paragraph holding only an image becomes a captioned, click-to-enlarge figure.
      // Markdown: ![alt text](/learn/assets/figures/file.png "Caption shown under the image")
      paragraph({ tokens }) {
        const only = tokens.filter((t) => !(t.type === "text" && !t.text.trim()));
        if (only.length === 1 && only[0].type === "image") {
          const { href, title, text } = only[0];
          const cap = title || text;
          return `<figure class="shot"><a href="${esc(href)}" target="_blank" rel="noopener"><img src="${esc(href)}" alt="${esc(text)}" loading="lazy" decoding="async"></a>${cap ? `<figcaption>${esc(cap)}</figcaption>` : ""}</figure>\n`;
        }
        return `<p>${this.parser.parseInline(tokens)}</p>\n`;
      },
    },
  });
  return { md, toc };
}

function extractFaq(tokens) {
  const faq = [];
  let inFaq = false;
  let cur = null;
  for (const t of tokens) {
    if (t.type === "heading" && t.depth === 2) {
      inFaq = /frequently asked/i.test(t.text);
      continue;
    }
    if (!inFaq) continue;
    if (t.type === "heading" && t.depth === 3) {
      cur = { q: t.text, a: "" };
      faq.push(cur);
    } else if (cur && t.type === "paragraph") {
      cur.a += (cur.a ? " " : "") + t.text.replace(/\*\*|`/g, "");
    }
  }
  return faq.filter((f) => f.a);
}

const topicRank = (c) => (TOPICS.includes(c) ? TOPICS.indexOf(c) : TOPICS.length);

async function loadArticles() {
  const files = (await fs.readdir(CONTENT)).filter((f) => f.endsWith(".md"));
  const errors = [];
  const articles = [];
  for (const file of files) {
    const raw = await fs.readFile(path.join(CONTENT, file), "utf8");
    const { data, content } = matter(raw);
    const missing = REQUIRED.filter((k) => data[k] === undefined || data[k] === "");
    if (missing.length) errors.push(`${file}: missing ${missing.join(", ")}`);
    if (data.slug && `${data.slug}.md` !== file) errors.push(`${file}: slug "${data.slug}" does not match filename`);
    if (data.cover && !MOTIFS.includes(data.cover)) errors.push(`${file}: unknown cover motif "${data.cover}"`);
    if (data.theme && !THEMES.includes(data.theme)) errors.push(`${file}: unknown theme "${data.theme}"`);
    if (data.level && !LEVELS.includes(data.level)) errors.push(`${file}: level must be one of ${LEVELS.join(", ")}`);
    if (data.step !== undefined && !(Number.isInteger(data.step) && data.step > 0)) errors.push(`${file}: step must be a positive integer`);
    if (missing.length) continue;

    const { md, toc } = makeMarked();
    const tokens = md.lexer(content);
    const ledeIdx = tokens.findIndex((t) => t.type === "paragraph" || t.type === "heading");
    if (ledeIdx < 0 || tokens[ledeIdx].type !== "paragraph") {
      errors.push(`${file}: body must open with a lede paragraph`);
      continue;
    }
    const ledeHtml = md.parseInline(tokens[ledeIdx].text);
    tokens.splice(ledeIdx, 1);
    const bodyHtml = md.parser(tokens);
    const words = stripTags(ledeHtml + " " + bodyHtml).split(" ").length;

    articles.push({
      ...data,
      levelIndex: LEVELS.indexOf(data.level),
      docs: Array.isArray(data.docs) ? data.docs.filter((d) => d && d.title && d.url) : [],
      url: `${BASE}/${data.slug}/`,
      ledeHtml,
      bodyHtml,
      toc,
      minutes: Math.max(1, Math.round(words / 230)),
      faq: extractFaq(tokens),
      coverSvg: cover(data.cover, { theme: data.theme }),
    });
  }
  const slugs = articles.map((a) => a.slug);
  for (const s of new Set(slugs)) if (slugs.filter((x) => x === s).length > 1) errors.push(`duplicate slug ${s}`);
  const steps = articles.filter((a) => a.step).map((a) => a.step).sort((a, b) => a - b);
  if (steps.some((s, i) => s !== i + 1)) errors.push(`Terminal 101 steps must be 1..n without gaps (got ${steps.join(", ")})`);
  if (errors.length) throw new Error(`Content errors:\n  ${errors.join("\n  ")}`);
  return articles.sort(
    (a, b) =>
      topicRank(a.category) - topicRank(b.category) || a.category.localeCompare(b.category) ||
      (a.step ? 0 : 1) - (b.step ? 0 : 1) || a.levelIndex - b.levelIndex || a.short.localeCompare(b.short),
  );
}

// Next in the Terminal 101 track first, then the same topic, then the next guides in library order.
function relatedFor(a, all, track) {
  const picks = [];
  const add = (x) => x && x !== a && !picks.includes(x) && picks.push(x);
  if (a.step) add(track[a.step]);
  all.filter((x) => x.category === a.category).forEach(add);
  const i = all.indexOf(a);
  [...all.slice(i + 1), ...all.slice(0, i)].forEach(add);
  return picks.slice(0, 3);
}

async function main() {
  const articles = await loadArticles();
  if (!articles.length) throw new Error("No articles in content/");
  const track = articles.filter((a) => a.step).sort((a, b) => a.step - b.step);
  const topics = [...new Set(articles.map((a) => a.category))].map((name) => ({ name, count: articles.filter((a) => a.category === name).length }));

  const wordmark = await fs.readFile(path.join(ROOT, "public/assets/logo-wordmark.svg"), "utf8");
  const wordmarkInner = wordmark.replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "").replace(/fill="#00E997"/gi, 'fill="currentColor"');
  const logoSvg = logo(wordmarkInner);

  await fs.rm(path.join(ROOT, "dist"), { recursive: true, force: true });
  await fs.mkdir(path.join(OUT, "assets"), { recursive: true });
  await fs.cp(path.join(ROOT, "public/assets/fonts"), path.join(OUT, "assets/fonts"), { recursive: true });
  await fs.mkdir(path.join(ROOT, "public/assets/figures"), { recursive: true });
  await fs.cp(path.join(ROOT, "public/assets/figures"), path.join(OUT, "assets/figures"), { recursive: true });
  const missingFigs = [];
  for (const a of articles)
    for (const [, src] of a.bodyHtml.matchAll(/<img src="\/learn\/assets\/figures\/([^"]+)"/g))
      if (!(await fs.stat(path.join(ROOT, "public/assets/figures", decodeURIComponent(src))).catch(() => null))) missingFigs.push(`${a.slug}: ${src}`);
  if (missingFigs.length) throw new Error(`Missing figure files:\n  ${missingFigs.join("\n  ")}`);
  await fs.copyFile(path.join(ROOT, "src/styles.css"), path.join(OUT, "assets/styles.css"));
  await fs.writeFile(path.join(OUT, "assets/favicon.svg"), favicon);

  await fs.writeFile(path.join(OUT, "index.html"), hubPage({ articles, track, topics, logoSvg }));
  for (const a of articles) {
    const dir = path.join(OUT, a.slug);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, "index.html"), articlePage({ a, track, related: relatedFor(a, articles, track), logoSvg }));
  }

  const urls = [`${SITE}${BASE}/`, ...articles.map((a) => `${SITE}${a.url}`)];
  await fs.writeFile(
    path.join(OUT, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${u}</loc></url>`).join("\n")}\n</urlset>\n`,
  );

  console.log(`built ${articles.length} guides -> ${path.relative(ROOT, OUT)}`);
  for (const a of articles) console.log(`  ${a.step ? `#${a.step}` : "  "} ${a.category.padEnd(16)} ${a.level.padEnd(12)} ${String(a.minutes).padStart(2)} min  ${a.slug}`);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
