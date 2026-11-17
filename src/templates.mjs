// HTML templates for insilicoterminal.com/learn. Pure functions: data in, HTML string out.

export const SITE = "https://insilicoterminal.com";
export const BASE = "/learn";
export const TRADE_URL = "https://insilicoterminal.com/#/trade";
export const DOCS_URL = "https://docs.insilicoterminal.com/documentation";

const FROG_PATH =
  "M481 65.0605V104.994L384.62 176.696L355.144 271.062L472.475 407.684H376.813C341.357 365.826 294.963 312.633 259.171 271.062L276.216 232.604L140.224 317.774L240.948 331.137L307.355 406.337C218.277 406.407 12.999 406.495 12.6543 406.495L0 390.538L29.7529 244.567L325.431 0L481 65.0605Z";

export const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const ARROW = `<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4.5 11.5l7-7M5.5 4.5h6v6" stroke="currentColor" stroke-width="1.5" stroke-linecap="square"/></svg>`;

export const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-20 -40 522 488"><rect x="-20" y="-40" width="522" height="488" fill="#0a0a0a"/><mask id="e"><rect x="-20" y="-40" width="522" height="488" fill="#fff"/><circle cx="344.058" cy="68.0205" r="22.254" fill="#000"/></mask><path d="${FROG_PATH}" fill="#00E997" mask="url(#e)"/></svg>`;

/** Full logo: official frog mark + wordmark paths (wordmark recoloured to currentColor). */
export function logo(wordmarkInner) {
  return `<svg viewBox="0 0 1671 408" role="img" aria-label="Insilico Terminal" width="115" height="28">
<mask id="logo-eye"><rect width="482" height="408" fill="#fff"/><circle cx="344.058" cy="68.0205" r="22.254" fill="#000"/></mask>
<path d="${FROG_PATH}" fill="currentColor" mask="url(#logo-eye)"/>${wordmarkInner}</svg>`;
}

const catSlug = (c) => c.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const pad = (n) => String(n).padStart(2, "0");

function head({ title, description, canonical, type = "website", jsonld = [] }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${esc(canonical)}">
<meta name="theme-color" content="#0a0a0a">
<meta property="og:site_name" content="Insilico Terminal">
<meta property="og:type" content="${type}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${esc(canonical)}">
<meta name="twitter:card" content="summary">
<meta name="twitter:site" content="@InsilicoTrading">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<link rel="icon" href="${BASE}/assets/favicon.svg" type="image/svg+xml">
<link rel="preload" href="${BASE}/assets/fonts/BerkeleyMono-Regular.otf" as="font" type="font/otf" crossorigin>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap">
<link rel="stylesheet" href="${BASE}/assets/styles.css">
${jsonld.map((j) => `<script type="application/ld+json">${JSON.stringify(j).replace(/</g, "\\u003c")}</script>`).join("\n")}
</head>
<body>`;
}

function nav(logoSvg) {
  return `<header class="nav">
  <div class="nav__left">
    <a class="nav__logo" href="${SITE}/" aria-label="Insilico Terminal home">${logoSvg}</a>
    <nav class="nav__links" aria-label="Primary">
      <a href="${TRADE_URL}">Trade</a>
      <a href="${DOCS_URL}" rel="noopener">Docs<span class="ext" aria-hidden="true">↗</span></a>
      <a href="${BASE}/" aria-current="page">Learn</a>
    </nav>
  </div>
  <a class="btn" href="${TRADE_URL}">Trade Now ${ARROW}</a>
</header>`;
}

function footer() {
  return `<footer class="foot">
  <div class="wrap foot__grid">
    <a class="back" href="${SITE}/">← Back to Insilico Terminal</a>
    <nav class="foot__links" aria-label="Footer">
      <a href="${DOCS_URL}" rel="noopener">Docs</a>
      <a href="https://x.com/InsilicoTrading" rel="noopener">X</a>
      <a href="https://www.youtube.com/channel/UCgghHNmUsrM72Bx3hqdI1vQ" rel="noopener">YouTube</a>
      <a href="https://discord.gg/uARfuV4zrV" rel="noopener">Discord</a>
      <a href="mailto:contact@insilicoterminal.com">Contact</a>
    </nav>
  </div>
</footer>`;
}

const level = (a) =>
  `<span class="lvl lvl--${a.levelIndex + 1}"><span class="lvl__bars" aria-hidden="true"><i></i><i></i><i></i></span>${esc(a.level)}</span>`;

function card(a) {
  const search = [a.title, a.short, a.excerpt, a.category, a.level].join(" ").toLowerCase();
  return `<li class="card" data-cat="${catSlug(a.category)}" data-search="${esc(search)}">
  <a href="${a.url}">
    <div class="cover cover--${a.theme}">${a.coverSvg}</div>
    <div class="card__body">
      <p class="card__meta"><span>${esc(a.category)}</span>${level(a)}</p>
      <h3>${esc(a.short)}</h3>
      <p class="card__excerpt">${esc(a.excerpt)}</p>
      <p class="card__foot"><span>${a.minutes} min read</span>${ARROW}</p>
    </div>
  </a>
</li>`;
}

const SCRIPT = `<script>
(function () {
  var cat = "all", q = "";
  var cards = [].slice.call(document.querySelectorAll(".cards .card"));
  function apply() {
    var shown = 0;
    cards.forEach(function (c) {
      var ok = (cat === "all" || c.getAttribute("data-cat") === cat) && (!q || c.getAttribute("data-search").indexOf(q) > -1);
      c.hidden = !ok; if (ok) shown++;
    });
    [].forEach.call(document.querySelectorAll("[data-filter]"), function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-filter") === cat)); });
    var empty = document.querySelector(".cards-empty"); if (empty) empty.hidden = shown > 0;
    var count = document.querySelector(".library__count"); if (count) count.textContent = shown + (shown === 1 ? " Guide" : " Guides");
  }
  var lib = document.getElementById("library");
  document.addEventListener("click", function (e) {
    var copy = e.target.closest(".cli__copy");
    if (copy) {
      var lines = [].map.call(copy.closest(".cli").querySelectorAll(".l"), function (n) { return n.textContent; });
      navigator.clipboard.writeText(lines.join("\\n")).then(function () {
        copy.textContent = "Copied"; setTimeout(function () { copy.textContent = "Copy"; }, 1400);
      });
      return;
    }
    var f = e.target.closest("[data-filter]");
    if (f) {
      cat = f.getAttribute("data-filter"); apply();
      if (f.hasAttribute("data-jump") && lib) lib.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
  var input = document.getElementById("q");
  if (input) {
    input.addEventListener("input", function () { q = input.value.trim().toLowerCase(); apply(); });
    input.addEventListener("keydown", function (e) { if (e.key === "Enter" && lib) { e.preventDefault(); lib.scrollIntoView({ behavior: "smooth", block: "start" }); } });
    document.addEventListener("keydown", function (e) {
      if (e.key === "/" && document.activeElement.tagName !== "INPUT" && !e.metaKey && !e.ctrlKey) { e.preventDefault(); input.focus(); }
    });
  }
  var toc = document.querySelector(".toc");
  if (toc) {
    if (window.matchMedia("(max-width: 1023px)").matches) toc.removeAttribute("open");
    var links = [].slice.call(toc.querySelectorAll("a[href^='#']"));
    var byId = {}; links.forEach(function (l) { byId[l.getAttribute("href").slice(1)] = l; });
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting && byId[en.target.id]) {
            links.forEach(function (l) { l.removeAttribute("aria-current"); });
            byId[en.target.id].setAttribute("aria-current", "true");
          }
        });
      }, { rootMargin: "-80px 0px -70% 0px" });
      Object.keys(byId).forEach(function (id) { var h = document.getElementById(id); if (h) io.observe(h); });
    }
  }
})();
</script>`;

export function hubPage({ articles, track, topics, logoSvg }) {
  const canonical = `${SITE}${BASE}/`;
  const max = Math.max(...topics.map((t) => t.count));
  const jsonld = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Insilico Learn",
      url: canonical,
      description: "Execution, order flow and risk guides from the Insilico Terminal team.",
      hasPart: articles.map((a) => ({ "@type": "Article", headline: a.title, url: `${SITE}${a.url}` })),
    },
  ];
  return `${head({ title: "Insilico Learn: Markets and Execution, Explained", description: "How order books, liquidity, fills and risk work in crypto markets, and the trading terminal tools built around them. Guides from the Insilico Terminal team.", canonical, jsonld })}
${nav(logoSvg)}
<main>
  <section class="intro dotfield">
    <div class="wrap intro__grid">
      <div class="intro__text">
        <p class="eyebrow">Insilico Learn</p>
        <h1>How the market works,<br><em>seen from the terminal.</em></h1>
        <p class="intro__sub">Order books, liquidity, fills, funding and risk, explained plainly. Each guide breaks down what's happening in the market and how to read it and act on it from the terminal.</p>
        <label class="prompt">
          <span class="prompt__caret" aria-hidden="true">&gt;</span>
          <span class="sr-only">Search guides</span>
          <input id="q" type="search" placeholder="Search guides" autocomplete="off" spellcheck="false">
          <kbd aria-hidden="true">/</kbd>
        </label>
      </div>
      <div class="widget" aria-label="Topics">
        <div class="widget__bar"><span>Topics</span><span class="muted">${articles.length} Guides</span></div>
        <ul class="topics">
          ${topics
            .map(
              (t) => `<li><button type="button" data-filter="${catSlug(t.name)}" data-jump><span class="topics__name">${esc(t.name)}</span><span class="topics__bar" aria-hidden="true"><i style="width:${Math.round((t.count / max) * 100)}%"></i></span><span class="topics__n">${t.count}</span></button></li>`,
            )
            .join("\n          ")}
        </ul>
      </div>
    </div>
  </section>

  <section class="track" aria-labelledby="track-title">
    <div class="wrap">
      <div class="track__head">
        <div>
          <p class="eyebrow">Start Here</p>
          <h2 id="track-title">Terminal 101</h2>
        </div>
        <p>New to the terminal? Read these ${track.length} first, in order.</p>
      </div>
      <ol class="steps">
        ${track
          .map(
            (a) => `<li>
          <a class="step" href="${a.url}">
            <span class="step__node">${pad(a.step)}</span>
            <span class="step__meta">Step ${a.step} · ${a.minutes} min read</span>
            <h3>${esc(a.short)}</h3>
            <p>${esc(a.excerpt)}</p>
            <span class="arrow-link">${a.step === 1 ? "Start Here" : "Read Guide"} ${ARROW}</span>
          </a>
        </li>`,
          )
          .join("\n        ")}
      </ol>
    </div>
  </section>

  <section class="library" id="library" aria-labelledby="library-title">
    <div class="wrap">
      <div class="library__head">
        <h2 id="library-title">All Guides <span class="library__count">${articles.length} Guides</span></h2>
        <div class="filters" role="group" aria-label="Filter by topic">
          <button type="button" data-filter="all" aria-pressed="true">All</button>
          ${topics.map((t) => `<button type="button" data-filter="${catSlug(t.name)}" aria-pressed="false">${esc(t.name)}</button>`).join("\n          ")}
        </div>
      </div>
      <ul class="cards">
        ${articles.map(card).join("\n")}
      </ul>
      <p class="cards-empty" hidden>No guides match your search.</p>
    </div>
  </section>
</main>
${footer()}
${SCRIPT}
</body>
</html>
`;
}

export function articlePage({ a, track, related, logoSvg }) {
  const canonical = `${SITE}${a.url}`;
  const jsonld = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: a.title,
      description: a.excerpt,
      articleSection: a.category,
      proficiencyLevel: a.level,
      timeRequired: `PT${a.minutes}M`,
      mainEntityOfPage: canonical,
      author: { "@type": "Organization", name: "Insilico Terminal", url: SITE },
      publisher: { "@type": "Organization", name: "Insilico Terminal", url: SITE },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Learn", item: `${SITE}${BASE}/` },
        { "@type": "ListItem", position: 2, name: a.title, item: canonical },
      ],
    },
  ];
  if (a.faq.length)
    jsonld.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: a.faq.map((q) => ({ "@type": "Question", name: q.q, acceptedAnswer: { "@type": "Answer", text: q.a } })),
    });

  const trackBar = a.step
    ? `<nav class="progress" aria-label="Terminal 101 progress">
        <span class="progress__label">Terminal 101 · Step ${a.step} of ${track.length}</span>
        <ol>${track
          .map((t) => `<li><a href="${t.url}"${t === a ? ' aria-current="step"' : ""}${t.step < a.step ? ' class="done"' : ""}><span>${pad(t.step)}</span>${esc(t.short)}</a></li>`)
          .join("")}</ol>
      </nav>`
    : "";

  const docs = a.docs.length
    ? `<aside class="docs-panel" aria-label="Related documentation">
        <div class="docs-panel__bar">Documentation</div>
        <ul>${a.docs.map((d) => `<li><a href="${esc(d.url)}" rel="noopener">${esc(d.title)} <span aria-hidden="true">↗</span></a></li>`).join("")}</ul>
      </aside>`
    : "";

  return `${head({ title: `${a.title} | Insilico Learn`, description: a.excerpt, canonical, type: "article", jsonld })}
${nav(logoSvg)}
<main>
  <article>
    <header class="ahead">
      <div class="wrap ahead__grid">
        <div class="ahead__text">
          <p class="crumbs"><a href="${BASE}/">Learn</a><span class="sep" aria-hidden="true">/</span><a href="${BASE}/#library">${esc(a.category)}</a></p>
          <h1>${esc(a.title)}</h1>
          <p class="ahead__dek">${esc(a.excerpt)}</p>
          <p class="chips"><span class="chip">${esc(a.category)}</span><span class="chip">${level(a)}</span><span class="chip">${a.minutes} min read</span></p>
        </div>
        <div class="cover cover--${a.theme} ahead__cover">${a.coverSvg}</div>
      </div>
      ${trackBar ? `<div class="wrap">${trackBar}</div>` : ""}
    </header>

    <div class="wrap abody">
      <aside class="aside">
        <details class="toc" open>
          <summary>On This Page</summary>
          <ol>${a.toc.map((t) => `<li><a href="#${t.id}">${t.html}</a></li>`).join("")}</ol>
        </details>
        <div class="try">
          <p class="try__title">Try It in the Terminal</p>
          <p>Connect an exchange and follow along with this guide.</p>
          <a class="btn" href="${TRADE_URL}">Trade Now ${ARROW}</a>
        </div>
      </aside>
      <div class="prose">
        <p class="lede">${a.ledeHtml}</p>
${a.bodyHtml}
        ${docs}
      </div>
    </div>
  </article>

  <section class="more" aria-labelledby="more-title">
    <div class="wrap">
      <h2 id="more-title">Keep Learning</h2>
      <ul class="cards cards--3">
        ${related.map(card).join("\n")}
      </ul>
    </div>
  </section>

  <section class="cta">
    <div class="wrap">
      <div class="cta__box dotfield">
        <div>
          <p class="cta__title">Power tools for all.</p>
          <p class="cta__sub">Professional grade order, position and execution management, built by traders.</p>
        </div>
        <a class="btn btn--lg" href="${TRADE_URL}">Trade Now ${ARROW}</a>
      </div>
    </div>
  </section>
</main>
${footer()}
${SCRIPT}
</body>
</html>
`;
}
