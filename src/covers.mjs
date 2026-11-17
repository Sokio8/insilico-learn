// Cover art generator for insilicoterminal.com/learn.
// Terminal-HUD illustrations: hairline geometry, dot-matrix fills, hard corners, flat colour.
// cover(motif, { theme }) returns standalone 16:9 <svg> markup.

export const MOTIFS = [
  'terminal', 'chase', 'sizing', 'cli', 'slippage', 'dom', 'cortex', 'tape',
  'layout', 'hotkeys', 'venues', 'hyperliquid', 'timeframe', 'basket', 'chort', 'news', 'knife',
];

const FONT = "'Berkeley Mono', ui-monospace, monospace";

const THEMES = {
  black: {
    bg: '#0A0A0A', ink: '#FAFAFA', ink2: '#A3A3A3', mid: '#2B2B2B', line: '#383838', panel: '#121212',
    accent: '#00E997', onAccent: '#0A0A0A', sell: '#FC4A6D', onSell: '#0A0A0A', onInk: '#0A0A0A',
    hollow: false, dot: 'rgba(250,250,250,0.14)', half: '#8A8A8A',
  },
  green: {
    bg: '#00E997', ink: '#0A0A0A', ink2: 'rgba(10,10,10,0.55)', mid: 'rgba(10,10,10,0.16)', line: 'rgba(10,10,10,0.34)',
    panel: '#00DA8D', accent: '#0A0A0A', onAccent: '#00E997', sell: '#0A0A0A', onSell: '#00E997', onInk: '#00E997',
    hollow: true, dot: 'rgba(10,10,10,0.22)', half: '#0A0A0A',
  },
  white: {
    bg: '#FAFAFA', ink: '#0A0A0A', ink2: '#6B6B6B', mid: '#DADADA', line: '#CCCCCC', panel: '#F1F1F1',
    accent: '#00B377', onAccent: '#FAFAFA', sell: '#FC4A6D', onSell: '#FAFAFA', onInk: '#FAFAFA',
    hollow: false, dot: 'rgba(10,10,10,0.13)', half: '#8C8C8C',
  },
};

const LINKS = ['#3B82F6', '#F59E0B', '#EC4899', '#8B5CF6', '#14B8A6'];

const FROG = 'M481 65.0605V104.994L384.62 176.696L355.144 271.062L472.475 407.684H376.813C341.357 365.826 294.963 312.633 259.171 271.062L276.216 232.604L140.224 317.774L240.948 331.137L307.355 406.337C218.277 406.407 12.999 406.495 12.6543 406.495L0 390.538L29.7529 244.567L325.431 0L481 65.0605Z'
  + 'M321.804 68.0205a22.254 22.254 0 1 0 44.508 0a22.254 22.254 0 1 0 -44.508 0Z';

let uid = 0;

// ---------- primitives ----------

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
const num = (v) => String(Math.round(v * 10) / 10);
const KEYS = {
  sw: 'stroke-width', da: 'stroke-dasharray', op: 'opacity', fs: 'font-size', fw: 'font-weight',
  ta: 'text-anchor', ls: 'letter-spacing', lc: 'stroke-linecap', lj: 'stroke-linejoin', fr: 'fill-rule',
};
function at(o) {
  let s = '';
  for (const k in o) {
    const v = o[k];
    if (v === undefined || v === null || v === false) continue;
    s += ` ${KEYS[k] || k}="${typeof v === 'number' ? num(v) : esc(v)}"`;
  }
  return s;
}
const rect = (x, y, w, h, o = {}) => `<rect x="${num(x)}" y="${num(y)}" width="${num(Math.max(0, w))}" height="${num(Math.max(0, h))}"${at(o)}/>`;
const line = (x1, y1, x2, y2, o = {}) => `<line x1="${num(x1)}" y1="${num(y1)}" x2="${num(x2)}" y2="${num(y2)}"${at(o)}/>`;
const pts = (p) => p.map(([x, y]) => `${num(x)},${num(y)}`).join(' ');
const pline = (p, o = {}) => `<polyline points="${pts(p)}"${at({ fill: 'none', ...o })}/>`;
const pgon = (p, o = {}) => `<polygon points="${pts(p)}"${at(o)}/>`;
const circ = (cx, cy, r, o = {}) => `<circle cx="${num(cx)}" cy="${num(cy)}" r="${num(r)}"${at(o)}/>`;
const txt = (x, y, s, o = {}) => `<text x="${num(x)}" y="${num(y)}"${at(o)}>${esc(s)}</text>`;
const fmt = (v) => String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

function rng(seed) {
  let a = (seed * 2654435761) >>> 0 || 1;
  return () => {
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------- shared building blocks ----------

// Fill styles: accent (buy), sell, ink, half (dot-matrix), hatch, outline, mid.
function fill(c, kind, sw = 3) {
  const { P } = c;
  switch (kind) {
    case 'accent': return { fill: P.accent };
    case 'sell': return P.hollow ? { fill: c.u('hs'), stroke: P.ink, sw } : { fill: P.sell };
    case 'ink': return { fill: P.ink };
    case 'half': return { fill: c.u('h'), stroke: P.ink2, sw: 2 };
    case 'hatch': return { fill: c.u('x'), stroke: P.ink2, sw: 2 };
    case 'outline': return { fill: P.panel, stroke: P.ink, sw };
    default: return { fill: P.mid };
  }
}
const sellStroke = (c, sw) => (c.P.hollow ? { stroke: c.P.ink, sw, da: '16 9' } : { stroke: c.P.sell, sw });
const onFill = (c, kind) => ({ accent: c.P.onAccent, sell: c.P.hollow ? c.P.ink : c.P.onSell, ink: c.P.onInk })[kind] || c.P.ink;

function panel(c, x, y, w, h, title = '', { hdr = 40, link } = {}) {
  const { P } = c;
  let s = rect(x, y, w, h, { fill: P.panel, stroke: P.line, sw: 2 });
  if (hdr) {
    s += line(x, y + hdr, x + w, y + hdr, { stroke: P.line, sw: 2 });
    let tx = x + 16;
    if (link) {
      s += rect(x, y, w, 10, { fill: link });
      s += circ(x + 26, y + hdr / 2 + 4, 11, { fill: link });
      tx = x + 46;
    }
    if (title) s += txt(tx, y + hdr / 2 + 8, title, { fill: P.ink2, fs: 18, ls: 1 });
    for (let i = 0; i < 3; i++) s += rect(x + w - 26 - i * 18, y + hdr / 2 - 3, 8, 8, { fill: P.line });
  }
  return s;
}

// Candles following path(t) in [0,1] (1 = top of box) with seeded noise.
function candles(c, x, y, w, h, n, { seed = 1, path, vol = 0.05, frac = 0.6 } = {}) {
  const { P } = c;
  const r = rng(seed);
  const f = path || ((t) => 0.5 + 0.28 * Math.sin(t * 6.1 + seed) + 0.12 * Math.sin(t * 17 + seed * 2));
  const step = w / n;
  const bw = Math.max(3, step * frac);
  const wsw = Math.max(2, Math.min(4, step * 0.16));
  const Y = (v) => y + h * (1 - Math.min(1, Math.max(0, v)));
  let prev = f(0);
  let s = '';
  const out = [];
  for (let i = 0; i < n; i++) {
    const close = f((i + 1) / n) + (r() - 0.5) * vol * 2;
    const open = prev;
    const hi = Math.max(open, close) + r() * vol;
    const lo = Math.min(open, close) - r() * vol;
    prev = close;
    const cx = x + step * (i + 0.5);
    const up = close >= open;
    const top = Y(Math.max(open, close));
    const bh = Math.max(3, Y(Math.min(open, close)) - top);
    if (up || !P.hollow) {
      const col = up ? P.accent : P.sell;
      s += line(cx, Y(hi), cx, Y(lo), { stroke: col, sw: wsw });
      s += rect(cx - bw / 2, top, bw, bh, { fill: col });
    } else {
      s += line(cx, Y(hi), cx, top, { stroke: P.ink, sw: wsw });
      s += line(cx, top + bh, cx, Y(lo), { stroke: P.ink, sw: wsw });
      s += bw > 8 ? rect(cx - bw / 2 + 1.5, top + 1.5, bw - 3, bh - 3, { fill: 'none', stroke: P.ink, sw: 3 })
        : rect(cx - bw / 2, top, bw, bh, { fill: P.ink2 });
    }
    out.push([cx, Y(close)]);
  }
  return { s, pts: out, Y };
}

function tag(c, x, y, w, h, label, kind, { ta = 'middle', fs } = {}) {
  const { P } = c;
  const f = kind === 'sell' && P.hollow ? { fill: P.bg, stroke: P.ink, sw: 3 } : fill(c, kind);
  const tc = kind === 'sell' && P.hollow ? P.ink : onFill(c, kind);
  const size = fs || Math.min(h * 0.5, 20);
  const tx = ta === 'middle' ? x + w / 2 : x + 12;
  return rect(x, y, w, h, f) + txt(tx, y + h / 2 + size * 0.36, label, { fill: tc, fs: size, fw: 700, ta, ls: 1 });
}

function arrowHead(x, y, dir, s, o) {
  const m = { up: [[x, y], [x - s, y + s * 1.2], [x + s, y + s * 1.2]], down: [[x, y], [x - s, y - s * 1.2], [x + s, y - s * 1.2]], right: [[x, y], [x - s * 1.2, y - s], [x - s * 1.2, y + s]], left: [[x, y], [x + s * 1.2, y - s], [x + s * 1.2, y + s]] };
  return pgon(m[dir], o);
}

// Square-headed key: ring head, shaft, teeth.
function key(x, y, L, color, holeFill) {
  const hs = L * 0.34;
  const t = L * 0.075;
  const sy = y + hs / 2;
  let s = rect(x, y, hs, hs, { fill: color });
  s += rect(x + hs * 0.3, y + hs * 0.3, hs * 0.4, hs * 0.4, { fill: holeFill });
  s += rect(x + hs - 1, sy - t / 2, L - hs + 1, t, { fill: color });
  s += rect(x + L - t * 1.2, sy, t * 1.2, t * 2.6, { fill: color });
  s += rect(x + L - t * 3.4, sy, t * 1.2, t * 1.9, { fill: color });
  s += rect(x + L - t * 5.6, sy, t, t * 2.3, { fill: color });
  return s;
}

function lock(x, y, sz, color, holeFill) {
  const sw = sz * 0.11;
  let s = pline([[x + sz * 0.24, y + sz * 0.46], [x + sz * 0.24, y + sw / 2], [x + sz * 0.76, y + sw / 2], [x + sz * 0.76, y + sz * 0.46]], { stroke: color, sw, lj: 'miter' });
  s += rect(x, y + sz * 0.42, sz, sz * 0.58, { fill: color });
  s += rect(x + sz * 0.44, y + sz * 0.58, sz * 0.12, sz * 0.24, { fill: holeFill });
  return s;
}

function check(x, y, sz, color, sw) {
  return pline([[x + sz * 0.16, y + sz * 0.52], [x + sz * 0.42, y + sz * 0.76], [x + sz * 0.86, y + sz * 0.26]], { stroke: color, sw: sw || sz * 0.14, lj: 'miter', lc: 'square' });
}

function cross(x, y, sz, color, sw) {
  return line(x, y, x + sz, y + sz, { stroke: color, sw }) + line(x + sz, y, x, y + sz, { stroke: color, sw });
}

function frog(x, y, w, color) {
  const k = w / 482;
  return `<path transform="translate(${num(x)} ${num(y)}) scale(${k.toFixed(5)})" d="${FROG}" fill="${color}" fill-rule="evenodd"/>`;
}

// ---------- motifs (draw into a W x H box; W 1040-1440, H 760-920) ----------

const DRAW = {
  // Faithful miniature of the real Insilico Terminal workspace (dark UI regardless of theme;
  // the theme colour shows around it as the backdrop).
  terminal(c) {
    const { W, H } = c;
    const D = { bg: '#0A0A0A', panel: '#111111', head: '#161616', line: '#262626', mid: '#1F1F1F', ink: '#FAFAFA', ink2: '#A3A3A3', ink3: '#6B6B6B', g: '#00E997', gd: '#0B4D35', r: '#FC4A6D', rd: '#4A1620', y: '#F59E0B' };
    const r = rng(11);
    const T = (x, y, s, fill, fs, o = {}) => txt(x, y, s, { fill, fs, ...o });
    const box = (x, y, w, h, title) => {
      let s = rect(x, y, w, h, { fill: D.panel, stroke: D.line, sw: 1.5 });
      s += rect(x, y, w, 22, { fill: D.head }) + line(x, y + 22, x + w, y + 22, { stroke: D.line, sw: 1.5 });
      s += rect(x + 8, y + 8, 6, 6, { fill: D.g }) + T(x + 20, y + 15.5, title, D.ink2, 11);
      for (let i = 0; i < 3; i++) s += rect(x + w - 14 - i * 13, y + 8, 6, 6, { fill: D.ink3 });
      return s;
    };
    let s = rect(0, 0, W, H, { fill: D.bg, stroke: D.line, sw: 2 });

    // ticker strip
    s += rect(0, 0, W, 22, { fill: D.panel });
    const tick = [['BTC-USD', '118,711'], ['ETH-USDT', '3,842.6'], ['SOL-USDT', '181.09'], ['HYPE-USD', '44.82'], ['BTC-PERP', '118,645'], ['DOGE-USDT', '0.2234'], ['XRP-USDT', '3.112']];
    let tx = 8;
    tick.forEach(([sym, px], i) => {
      const up = i % 3 !== 1;
      s += rect(tx, 5, 50, 13, { fill: up ? D.g : D.r }) + T(tx + 25, 15, up ? '+0.55%' : '-0.41%', D.bg, 9.5, { ta: 'middle', fw: 700 });
      s += T(tx + 58, 15.5, `${sym} ${px}`, D.ink, 11, { fw: 700 });
      tx += 58 + (sym.length + px.length + 1) * 6.6 + 22;
    });

    // header bar
    s += line(0, 70, W, 70, { stroke: D.line, sw: 1.5 });
    s += frog(14, 30, 34, D.g) + T(56, 55, 'INSILICO TERMINAL', D.g, 19, { fw: 700, ls: 1 });
    ['HOTKEYS', 'PRIVACY', 'DESIGNER', 'SOUND', 'REDUCE', 'LAYOUTS', 'ORDERS', 'POSITIONS', 'SETTINGS', 'FAST'].forEach((l, i) => {
      const x = 300 + i * 62;
      s += rect(x + 22, 31, 16, 14, { fill: 'none', stroke: i === 6 ? D.y : D.ink2, sw: 2 }) + T(x + 30, 60, l, D.ink2, 8.5, { ta: 'middle' });
    });
    s += rect(W - 112, 36, 10, 10, { fill: D.g }) + T(W - 96, 45, 'HEALTHY', D.ink2, 10) + rect(W - 30, 34, 18, 2.5, { fill: D.ink2 }) + rect(W - 30, 40, 18, 2.5, { fill: D.ink2 }) + rect(W - 30, 46, 18, 2.5, { fill: D.ink2 });
    s += T(10, 84, 'Main', D.ink, 11, { fw: 700 }) + T(46, 84, '+ NEW', D.g, 10);

    const top = 92;
    // ---- left: place order ----
    const lw = 232;
    s += box(0, top, lw, 470, 'Place Order');
    s += rect(8, top + 32, lw - 16, 22, { fill: D.mid, stroke: D.line, sw: 1 }) + T(16, top + 47, 'LIMIT SCALE', D.ink, 11, { fw: 700 });
    ['0.08424', '10,000.29'].forEach((v, i) => {
      const x = 8 + i * ((lw - 16) / 2 + 4);
      s += T(x, top + 70, i ? 'USD' : 'BTC', D.ink2, 10) + rect(x, top + 74, (lw - 24) / 2, 22, { fill: D.bg, stroke: D.line, sw: 1 }) + T(x + 6, top + 89, v, D.ink, 11);
    });
    s += rect(8, top + 106, lw - 16, 4, { fill: D.line }) + rect(8, top + 106, (lw - 16) * 0.3, 4, { fill: D.g }) + rect(8 + (lw - 16) * 0.3 - 4, top + 102, 8, 12, { fill: D.g });
    ['$100', '$500', '$1.0k', '$2.0k', '$5.0k', '$10k', '$20k', 'CLR'].forEach((l, i) => {
      const x = 8 + (i % 4) * 54, y = top + 122 + Math.floor(i / 4) * 28;
      s += rect(x, y, 50, 22, { fill: D.mid }) + T(x + 25, y + 15, l, D.ink, 10, { ta: 'middle' });
    });
    ['Price Range', 'Total Orders', 'Price Distribution', 'Size Distribution'].forEach((l, i) => {
      const y = top + 194 + i * 58;
      s += T(8, y, l, D.ink2, 10);
      if (i === 0) {
        s += rect(8, y + 6, 104, 22, { fill: D.bg, stroke: D.line, sw: 1 }) + T(14, y + 21, '118712', D.ink, 11);
        s += rect(120, y + 6, 104, 22, { fill: D.bg, stroke: D.line, sw: 1 }) + T(126, y + 21, '118712', D.ink, 11);
      } else {
        const p = [0, 0.12, 0.5, 0.5][i];
        s += rect(8, y + 16, lw - 16, 3, { fill: D.line }) + rect(8 + (lw - 16) * p - 4, y + 11, 8, 12, { fill: D.g });
        s += T(8, y + 38, i === 1 ? '30' : 'CUBIC   EXPONENTIAL', i === 1 ? D.ink : D.y, 9.5);
      }
    });
    s += T(8, top + 424, 'POST    REDUCE    TP/SL', D.ink2, 9.5);
    s += rect(8, top + 431, (lw - 20) / 2, 32, { fill: D.gd }) + T(8 + (lw - 20) / 4, top + 451, 'BUY / LONG', D.g, 11, { ta: 'middle', fw: 700 });
    s += rect(12 + (lw - 20) / 2, top + 431, (lw - 20) / 2, 32, { fill: D.rd }) + T(12 + (lw - 20) * 0.75, top + 451, 'SELL / SHORT', D.r, 11, { ta: 'middle', fw: 700 });
    // market
    const my = top + 478;
    s += box(0, my, lw, H - my, 'Market');
    s += rect(8, my + 32, lw - 16, 40, { fill: D.bg, stroke: D.line, sw: 1 }) + T(16, my + 58, 'BTC-USD', D.ink, 14, { fw: 700 }) + T(lw - 16, my + 58, '118710.0', D.r, 14, { ta: 'end', fw: 700 });
    [['Position', '-0.01000 BTC', D.r], ['Notional', '+0.01 %', D.g], ['Entry', '118725.0', D.ink], ['Open Interest', '38,675', D.ink], ['24h Volume', '3,559,721,551', D.ink], ['Funding', '0.0020%', D.r]].forEach(([k, v, col], i) => {
      const y = my + 92 + i * 16;
      if (y < H - 6) s += T(8, y, k, D.ink2, 10) + T(lw - 8, y, v, col, 10, { ta: 'end' });
    });

    // ---- center: chart ----
    const cx = lw + 8, cw = 704, ch = 470;
    s += box(cx, top, cw, ch, 'Chart  BTC-USD 1h');
    s += T(cx + 10, top + 42, '1m  5m  15m  1h  4h  1d     Indicators', D.ink2, 10.5);
    s += T(cx + 10, top + 62, 'BTC-USD · 1h · hyperliquid', D.ink, 12, { fw: 700 }) + T(cx + 210, top + 62, 'O 118,761  H 118,800  L 118,710  C 118,710', D.r, 10.5);
    const ax = cx + cw - 70;
    const cd = candles({ P: { accent: D.g, sell: D.r, hollow: false } }, cx + 10, top + 76, ax - cx - 20, ch - 104, 68, { seed: 19, vol: 0.035, frac: 0.55, path: (t) => 0.32 + 0.38 * t + 0.12 * Math.sin(t * 9) + 0.07 * Math.sin(t * 23) });
    s += cd.s;
    for (let i = 0; i < 9; i++) {
      const y = top + 84 + i * ((ch - 110) / 8);
      s += line(cx + 10, y, ax, y, { stroke: D.mid, sw: 1 }) + T(ax + 8, y + 4, fmt(120400 - i * 800), D.ink3, 9.5);
    }
    const sellY = top + 160, buyY = top + 236;
    s += line(cx + 10, sellY, ax, sellY, { stroke: D.r, sw: 1.5 }) + rect(ax - 92, sellY - 9, 40, 18, { fill: D.r }) + T(ax - 72, sellY + 4, '-0.01', D.bg, 10, { ta: 'middle', fw: 700 });
    s += rect(ax, sellY - 10, 68, 20, { fill: D.r }) + T(ax + 34, sellY + 4, '118,725', D.bg, 10, { ta: 'middle', fw: 700 });
    s += line(cx + 10, buyY, ax, buyY, { stroke: D.g, sw: 1.5, da: '6 4' }) + rect(ax - 190, buyY - 9, 130, 18, { fill: D.panel, stroke: D.g, sw: 1 }) + T(ax - 125, buyY + 4, 'PO · BUY LIMIT 0.0084', D.g, 9.5, { ta: 'middle' });
    s += rect(ax, buyY - 10, 68, 20, { fill: D.g }) + T(ax + 34, buyY + 4, '117,777', D.bg, 10, { ta: 'middle', fw: 700 });
    // positions
    const py = top + ch + 8;
    s += box(cx, py, cw, H - py, 'Positions (3)  All Accounts');
    const cols = ['Account', 'Symbol', 'Entry', 'Liquidation', 'Size', 'Unrealized', 'Realized', 'Funding'];
    cols.forEach((l, i) => { s += T(cx + 12 + i * 82, py + 42, l, D.ink2, 10); });
    [['1', 'BTC', '118,725.00', '205,973.48', '0.01000 BTC', '+0.15 USD', '0', '+0.027'], ['6', 'XBTUSDT', '118,628.80', '0', '0.0005 XBT', '+0.00 USDT', '0', '-'], ['8', 'SOLUSDT', '181.090', '879.637', '1.0 SOL', '-0.06 USDT', '-0.04', '-']].forEach((row, j) => {
      const y = py + 70 + j * 30;
      if (y > H - 8) return;
      s += line(cx + 1, y - 18, cx + cw - 1, y - 18, { stroke: D.line, sw: 1 });
      row.forEach((v, i) => {
        const col = i === 1 ? D.r : i === 3 ? D.y : i === 5 ? (v.startsWith('-') ? D.r : D.g) : D.ink;
        s += T(cx + 12 + i * 82, y, v, col, 10.5, { fw: i === 1 ? 700 : 400 });
      });
      s += rect(cx + cw - 74, y - 13, 32, 17, { fill: D.mid }) + T(cx + cw - 58, y - 1, 'Close', D.ink, 8.5, { ta: 'middle' });
      s += rect(cx + cw - 38, y - 13, 26, 17, { fill: D.mid }) + T(cx + cw - 25, y - 1, 'Mkt', D.ink, 8.5, { ta: 'middle' });
    });

    // ---- orderbook ----
    const ox = cx + cw + 8, ow = 228, oh = 548;
    s += box(ox, top, ow, oh, 'Orderbook');
    const rows = 16, rh = 13.5;
    const midY = top + 32 + rows * rh + 8;
    for (let i = 0; i < rows; i++) {
      const y = top + 30 + i * rh;
      const len = (0.15 + r() * 0.75) * 90 + (i > 12 ? 30 : 0);
      s += rect(ox + 4, y, len, rh - 2, { fill: D.rd }) + T(ox + 8, y + 10, fmt(10 + r() * 600) + (r() > 0.6 ? 'k' : ''), D.ink, 9.5) + T(ox + ow - 8, y + 10, fmt(118730 - i), D.r, 9.5, { ta: 'end' });
    }
    s += T(ox + ow / 2, midY + 26, '118710.0', D.r, 24, { ta: 'middle', fw: 700 });
    for (let i = 0; i < rows; i++) {
      const y = midY + 44 + i * rh;
      const len = (0.15 + r() * 0.75) * 90 + (i === 6 ? 70 : 0);
      s += rect(ox + 4, y, len, rh - 2, { fill: D.gd }) + T(ox + 8, y + 10, fmt(10 + r() * 700) + (r() > 0.6 ? 'k' : ''), D.ink, 9.5) + T(ox + ow - 8, y + 10, fmt(118709 - i), D.g, 9.5, { ta: 'end' });
    }

    // ---- trades + liquidations ----
    const trx = ox + ow + 8, trw = W - trx;
    s += box(trx, top, trw, oh, 'Trades + Liquidations');
    for (let i = 0; i < 36; i++) {
      const y = top + 30 + i * 14.5;
      const buy = r() > 0.55;
      const big = i === 2 || i === 9 || i === 21;
      if (big) s += rect(trx + 2, y, trw - 4, 13, { fill: buy ? D.gd : D.rd });
      s += pgon(buy ? [[trx + 10, y + 3], [trx + 6, y + 10], [trx + 14, y + 10]] : [[trx + 10, y + 10], [trx + 6, y + 3], [trx + 14, y + 3]], { fill: buy ? D.g : D.r });
      s += rect(trx + 22, y + 3, 8, 8, { fill: i % 5 === 0 ? D.ink2 : D.y });
      s += T(trx + 40, y + 10, fmt(118590 + r() * 40), buy ? D.g : D.r, 9.5) + T(trx + trw - 30, y + 10, '$' + (r() * 30 + 1).toFixed(1) + 'k', D.ink, 9.5, { ta: 'end' }) + T(trx + trw - 6, y + 10, '2s', D.ink3, 9, { ta: 'end' });
    }

    // ---- complex orders ----
    const coy = top + oh + 8, cow = W - ox;
    s += box(ox, coy, cow, H - coy, 'Complex Orders');
    s += T(ox + 10, coy + 38, '+ CREATE    EDIT    DELETE', D.ink2, 10);
    s += rect(ox + 8, coy + 44, cow - 110, 16, { fill: D.gd, stroke: D.g, sw: 1 }) + T(ox + 14, coy + 56, '100% Longs', D.ink, 10.5, { fw: 700 }) + T(ox + cow - 12, coy + 56, 'Equal L/S', D.g, 10, { ta: 'end' });
    [['BTC-USD Perp', '118,711', '+0.55%'], ['BTC-USDT-SWAP', '118,626', '+0.43%'], ['BTC-USDT', '118,620', '+0.44%']].forEach(([sym, px, ch2], j) => {
      const y = coy + 76 + j * 14;
      if (y > H - 6) return;
      s += T(ox + 10, y, sym, D.g, 10, { fw: 700 }) + T(ox + 170, y, '20', D.ink, 10) + T(ox + 230, y, px, D.ink, 10) + T(ox + 320, y, ch2, D.g, 10) + rect(ox + cow - 26, y - 10, 14, 13, { fill: D.r });
    });
    return s;
  },

  // Chort: chart with order flags, fill markers, a scale ladder with its AVG line, and the right-click menu.
  chort(c) {
    const { W, H, P } = c;
    const sellCol = P.hollow ? P.ink : P.sell;
    let s = panel(c, 0, 0, W, H, 'CHORT  BTC-USD');
    ['1m', '5m', '15m', '1h', '4h', '1D', '200T'].forEach((t, i) => {
      const x = 24 + i * 72;
      if (t === '1h') s += rect(x - 8, 52, 58, 30, { fill: P.accent });
      s += txt(x + 21, 73, t, { fill: t === '1h' ? P.onAccent : P.ink2, fs: 17, fw: 700, ta: 'middle' });
    });
    const cx = 24, cy = 100, cw = W - 230, ch = H - 140;
    const cd = candles(c, cx, cy, cw, ch, 46, { seed: 23, vol: 0.03, frac: 0.58, path: (t) => (t < 0.62 ? 0.38 + 0.5 * t + 0.06 * Math.sin(t * 20) : 0.69 - 0.42 * (t - 0.62) + 0.04 * Math.sin(t * 26)) });
    s += cd.s;
    const Y = cd.Y;
    const ax = cx + cw + 10;
    for (let i = 0; i <= 6; i++) {
      const y = cy + (i * ch) / 6;
      s += line(ax, y, ax + 12, y, { stroke: P.line, sw: 2 }) + txt(ax + 20, y + 6, fmt(66000 - i * 700), { fill: P.ink2, fs: 16 });
    }
    const lineTag = (v, label, kind, { dash, w = 170, x } = {}) => {
      const y = Y(v);
      const col = kind === 'sell' ? sellCol : kind === 'ink' ? P.ink2 : P.accent;
      const tx = x ?? ax - w - 6;
      const t = kind === 'ink'
        ? rect(tx, y - 16, w, 32, { fill: P.ink }) + txt(tx + w / 2, y + 6, label, { fill: P.onInk, fs: 16, fw: 700, ta: 'middle', ls: 1 })
        : tag(c, tx, y - 16, w, 32, label, kind, { fs: 16 });
      return line(cx, y, ax, y, { stroke: col, sw: kind === 'accent' && !dash ? 4 : 2.5, da: dash }) + t;
    };
    // scale ladder + AVG
    const ladder = [0.44, 0.39, 0.34, 0.29, 0.24];
    ladder.forEach((v, i) => {
      const y = Y(v);
      s += line(cx + cw * 0.55, y, ax, y, { stroke: P.accent, sw: 2, da: '10 8' });
      s += rect(ax - 108, y - 11, 102, 22, { fill: P.panel, stroke: P.accent, sw: 2 }) + txt(ax - 57, y + 6, `SCALE ${i + 1}`, { fill: P.accent, fs: 14, fw: 700, ta: 'middle' });
    });
    s += lineTag(0.31, 'AVG 63,100', 'accent', { w: 150, x: cx + cw * 0.55 - 170 });
    // position + stop + liquidation
    s += lineTag(0.56, 'LONG 0.40  +312', 'ink', { w: 220, x: cx + 12 });
    s += lineTag(0.15, 'STOP 62,430', 'sell', { dash: '14 8', w: 150 });
    s += line(cx, Y(0.05), ax, Y(0.05), { stroke: P.ink2, sw: 2, da: '4 8' }) + txt(cx + 12, Y(0.05) - 10, 'LIQ 62,010', { fill: P.ink2, fs: 15, fw: 700 });
    // fill markers
    [8, 15, 22].forEach((i) => {
      const [x] = cd.pts[i];
      const y = Y(0.3 + i * 0.012) + 70;
      s += arrowHead(x, y - 18, 'up', 11, { fill: P.accent });
    });
    [31, 35].forEach((i) => {
      const [x, y] = cd.pts[i];
      s += arrowHead(x, y - 46, 'down', 11, fill(c, 'sell', 2));
    });
    // right-click menu
    const mx = cx + cw * 0.3, my = Y(0.75) - 10;
    s += rect(mx, my, 330, 170, { fill: P.panel, stroke: P.ink, sw: 2 });
    s += rect(mx + 6, my + 6, 318, 46, { fill: P.accent }) + txt(mx + 22, my + 36, 'Place order @ 64,950', { fill: P.onAccent, fs: 19, fw: 700 });
    for (let i = 0; i < 3; i++) s += rect(mx + 22, my + 76 + i * 30, 180 - i * 40, 10, { fill: P.mid });
    s += pgon([[mx - 4, my - 34], [mx - 4, my - 4], [mx + 6, my - 13], [mx + 14, my + 2], [mx + 19, my - 1], [mx + 11, my - 15], [mx + 22, my - 16]], { fill: P.ink, stroke: P.bg, sw: 2 });
    return s;
  },

  chase(c) {
    const { W, H, P } = c;
    const ax = 116;
    const rows = 14;
    const rh = H / rows;
    let s = '';
    const seg = 8;
    const sw = (W - ax) / seg;
    const bid = [11, 11, 10, 9, 9, 8, 7, 6];
    const ask = [8, 7, 7, 6, 5, 5, 4, 3];
    const yc = (row) => row * rh + rh / 2;
    const stair = (lv) => {
      const p = [];
      lv.forEach((row, k) => { p.push([ax + k * sw, yc(row)], [ax + (k + 1) * sw, yc(row)]); });
      return p;
    };
    const bp = stair(bid);
    const ap = stair(ask);
    s += pgon([...bp, [W, H], [ax, H]], { fill: c.u('h') });
    s += pgon([...ap, [W, 0], [ax, 0]], { fill: c.u('xs') });
    for (let i = 0; i <= rows; i++) s += line(ax, i * rh, W, i * rh, { stroke: P.line, sw: 1.5 });
    for (let i = 0; i < rows; i++) s += txt(ax - 16, yc(i) + 6, fmt(64340 - i * 10), { fill: P.ink2, fs: 17, ta: 'end' });
    s += pline(ap, { ...sellStroke(c, 6) });
    s += pline(bp, { stroke: P.ink, sw: 6 });
    // order markers: rest at best bid, re-placed each time the bid moves
    const marks = [];
    bid.forEach((row, k) => { if (k === 0 || row !== bid[k - 1]) marks.push([ax + k * sw + sw * 0.34, yc(row)]); });
    const ms = Math.min(rh * 0.7, 42);
    for (let i = 1; i < marks.length; i++) {
      const [x0, y0] = marks[i - 1];
      const [x1, y1] = marks[i];
      s += pline([[x0 + ms / 2, y0], [x1, y0], [x1, y1 + ms / 2 + 6]], { stroke: P.accent, sw: 3, da: '8 6' });
      s += arrowHead(x1, y1 + ms / 2 + 2, 'up', 8, { fill: P.accent });
    }
    marks.forEach(([x, y], i) => {
      if (i === marks.length - 1) return;
      s += rect(x - ms / 2, y - ms / 2, ms, ms, { fill: P.bg, stroke: P.accent, sw: 4 });
    });
    const [lx, ly] = marks[marks.length - 1];
    const big = ms * 1.45;
    s += rect(lx - big / 2, ly - big / 2, big, big, { fill: P.accent, stroke: P.bg, sw: 4 });
    s += tag(c, lx + big / 2 + 14, ly - 20, 120, 40, 'CHASE', 'accent', { fs: 19 });
    s += txt(ax + 14, yc(bid[0]) - 14, 'BEST BID', { fill: P.ink, fs: 17, fw: 700 });
    s += txt(ax + 14, yc(ask[0]) - 14, 'BEST ASK', { fill: P.hollow ? P.ink : P.sell, fs: 17, fw: 700 });
    return s;
  },

  sizing(c) {
    const { W, H, P } = c;
    let s = '';
    const S = Math.min(H - 150, W * 0.4);
    const gy = (H - (S + 110)) / 2;
    const gap = 6;
    const cs = (S - 9 * gap) / 10;
    s += txt(0, gy - 16, 'ACCOUNT  $10,000', { fill: P.ink2, fs: 18, ls: 1 });
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        const hot = i === 0 && j === 9;
        s += rect(j * (cs + gap), gy + i * (cs + gap), cs, cs, { fill: hot ? P.accent : P.mid });
      }
    }
    const hx = 9 * (cs + gap) + cs;
    s += rect(hx - cs - 6, gy - 6, cs + 12, cs + 12, { fill: 'none', stroke: P.accent, sw: 3 });
    s += pline([[hx + 6, gy + cs / 2], [hx + 22, gy + cs / 2], [hx + 22, gy + S + 62]], { stroke: P.accent, sw: 3 });
    s += tag(c, hx + 22 - 250, gy + S + 44, 250, 40, 'RISK 1% = $100', 'accent', { fs: 18 });

    const opW = W * 0.075;
    const op = (x, kind) => {
      const cy = H / 2;
      const bw = opW * 0.6;
      if (kind === 'div') {
        return rect(x - bw / 2, cy - 5, bw, 10, { fill: P.ink }) + rect(x - 7, cy - 30, 14, 14, { fill: P.ink }) + rect(x - 7, cy + 16, 14, 14, { fill: P.ink });
      }
      return rect(x - bw / 2, cy - 16, bw, 10, { fill: P.ink }) + rect(x - bw / 2, cy + 6, bw, 10, { fill: P.ink });
    };
    s += op(S + opW / 2 + 8, 'div');
    const rw = W * 0.16;
    const mx = S + opW + 16;
    const mw = W - mx - opW - rw - 16;
    const yE = H * 0.4;
    const yS = H * 0.72;
    s += rect(mx, yE, mw, yS - yE, { fill: c.u('hs') });
    s += candles(c, mx + 10, H * 0.06, mw - 110, yE - H * 0.06 + 20, 9, { seed: 5, path: (t) => 0.55 + 0.35 * t - 0.25 * Math.sin(t * 5) }).s;
    s += line(mx, yE, mx + mw, yE, { stroke: P.ink, sw: 4 });
    s += line(mx, yS, mx + mw, yS, sellStroke(c, 4));
    s += tag(c, mx, yE + 10, 104, 34, 'ENTRY', 'ink', { fs: 16 });
    s += tag(c, mx, yS + 10, 90, 34, 'STOP', 'sell', { fs: 16 });
    const bxk = mx + mw - 50;
    s += line(bxk, yE + 14, bxk, yS - 14, { stroke: P.ink, sw: 3 });
    s += arrowHead(bxk, yE + 4, 'up', 10, { fill: P.ink }) + arrowHead(bxk, yS - 4, 'down', 10, { fill: P.ink });
    s += line(bxk - 22, yE, bxk + 22, yE, { stroke: P.ink, sw: 3 }) + line(bxk - 22, yS, bxk + 22, yS, { stroke: P.ink, sw: 3 });
    s += txt(bxk - 16, (yE + yS) / 2 + 7, '2%', { fill: P.ink, fs: 22, fw: 700, ta: 'end' });
    s += op(mx + mw + opW / 2 + 8, 'eq');
    const rx = W - rw;
    const units = 10;
    const top = H * 0.08;
    const uh = (H * 0.84 - (units - 1) * 6) / units;
    for (let i = 0; i < units; i++) s += rect(rx, top + i * (uh + 6), rw, uh, { fill: P.accent });
    s += rect(rx - 8, top - 8, rw + 16, H * 0.84 + 16, { fill: 'none', stroke: P.ink, sw: 3 });
    s += txt(rx + rw / 2, top + H * 0.84 + 44, '$5,000 SIZE', { fill: P.ink, fs: 20, fw: 700, ta: 'middle' });
    return s;
  },

  cli(c) {
    const { W, H, P } = c;
    const hdr = 52;
    let s = panel(c, 0, 0, W, H, 'insilico  ~  cli', { hdr });
    const fs = Math.round(Math.min((H - 100) / 8.6, W * 0.075));
    const lh = fs * 1.3;
    const x0 = 64;
    let y = hdr + fs * 1.5;
    const cw = fs * 0.6;
    const cmd = (word, args) => {
      let o = txt(x0, y, '>', { fill: P.accent, fs, fw: 700 });
      o += txt(x0 + cw * 2, y, word, { fill: P.ink, fs, fw: 700 });
      let ax = x0 + cw * (3 + word.length);
      args.forEach((a) => { o += rect(ax, y - fs * 0.62, a * cw, fs * 0.66, { fill: P.mid }); ax += (a + 1) * cw; });
      return o;
    };
    const resp = (len, ok = true) => {
      let o = rect(x0 + cw * 2, y - fs * 0.42, fs * 0.36, fs * 0.36, { fill: ok ? P.accent : P.ink2 });
      o += rect(x0 + cw * 3.2, y - fs * 0.36, len * cw * 0.6, fs * 0.24, { fill: P.ink2 });
      return o;
    };
    s += line(x0 - 28, hdr + 24, x0 - 28, H - 24, { stroke: P.line, sw: 2 });
    s += cmd('buy', [3, 4]); y += lh;
    s += resp(14); y += lh * 0.8;
    s += cmd('chase', [3, 5]); y += lh;
    s += resp(18); y += lh * 0.8;
    s += cmd('twap', [3, 2, 3]); y += lh;
    s += resp(10, false); y += lh * 0.8;
    s += txt(x0, y, '>', { fill: P.accent, fs, fw: 700 });
    s += rect(x0 + cw * 2, y - fs * 0.82, cw * 1.1, fs * 1.02, { fill: P.accent });
    // pixel-matrix prompt glyph
    const bmp = ['XX...........', '.XX..........', '..XX.........', '...XX........', '..XX.........', '.XX..........', 'XX.....XXXXXX'];
    const wide = W / H > 1.4;
    const p = wide ? Math.min(36, (W * 0.3) / 13) : 22;
    const gx = W - 13 * p - (wide ? 60 : 44);
    const gy = wide ? (H - 7 * p) / 2 + 30 : H - 7 * p - 44;
    bmp.forEach((row, ri) => [...row].forEach((ch, ci) => {
      const x = gx + ci * p;
      const yy = gy + ri * p;
      s += ch === 'X' ? rect(x + 3, yy + 3, p - 6, p - 6, { fill: P.accent }) : rect(x + p / 2 - 3, yy + p / 2 - 3, 6, 6, { fill: P.mid });
    }));
    return s;
  },

  slippage(c) {
    const { W, H, P } = c;
    const r = rng(11);
    let s = '';
    const lw = W * 0.52;
    const n = 9;
    const top = H * 0.02;
    const lh = (H * 0.96) / n;
    const bx = 120;
    const eaten = 5;
    const lens = [];
    for (let i = 0; i < n; i++) {
      const y = top + (n - 1 - i) * lh;
      const len = (0.35 + 0.6 * r()) * (lw - bx - 40);
      lens.push(len);
      s += txt(bx - 14, y + lh / 2 + 6, fmt(64200 + i * 10), { fill: P.ink2, fs: 17, ta: 'end' });
      if (i < eaten) s += rect(bx, y + 5, len, lh - 10, { fill: c.u('xs'), stroke: P.hollow ? P.ink : P.sell, sw: 2, da: '8 6' });
      else s += rect(bx, y + 5, len, lh - 10, fill(c, 'sell'));
    }
    const ax = bx + 56;
    const aw = 64;
    const atop = top + (n - eaten) * lh + 8;
    s += rect(ax, atop + 36, aw, H - atop - 36, { fill: P.accent });
    s += pgon([[ax + aw / 2, atop - 6], [ax - 22, atop + 40], [ax + aw + 22, atop + 40]], { fill: P.accent });
    for (let i = 0; i < eaten; i++) {
      const y = top + (n - 1 - i) * lh + lh / 2;
      s += rect(ax + aw + 18, y - 7, 14, 14, { fill: P.ink });
    }
    const brx = lw - 10;
    const y0 = top + (n - 1) * lh + lh / 2;
    const y1 = top + (n - eaten) * lh + lh / 2;
    s += pline([[brx - 16, y0], [brx, y0], [brx, y1], [brx - 16, y1]], { stroke: P.ink, sw: 4 });
    s += txt(brx - 26, y1 - 26, 'SLIPPAGE', { fill: P.ink, fs: 18, fw: 700, ta: 'end' });

    const dx = lw + 34;
    for (let y = 10; y < H; y += 22) s += rect(dx - 3, y, 6, 8, { fill: P.line });
    s += rect(dx - 34, H / 2 - 22, 68, 44, { fill: P.bg, stroke: P.ink, sw: 3 });
    s += txt(dx, H / 2 + 8, 'VS', { fill: P.ink, fs: 22, fw: 700, ta: 'middle' });

    const rx = dx + 60;
    const rwid = W - rx;
    const bandY = H * 0.6;
    const bandH = lh - 10;
    s += rect(rx, bandY, rwid, bandH, fill(c, 'sell'));
    s += rect(rx, bandY + bandH + 18, rwid, bandH, fill(c, 'sell'));
    const axisY = H * 0.9;
    s += line(rx, axisY, W, axisY, { stroke: P.ink, sw: 3 });
    const k = 6;
    const sl = rwid / k;
    const bs = Math.min(56, sl * 0.5);
    const priceY = H * 0.16;
    s += line(rx, priceY, W, priceY, { stroke: P.ink, sw: 3, da: '10 8' });
    s += txt(rx, priceY - 16, 'TWAP  6 x 1/6', { fill: P.ink, fs: 18, fw: 700 });
    for (let i = 0; i < k; i++) {
      const cx = rx + sl * (i + 0.5);
      s += line(cx, axisY - 10, cx, axisY + 10, { stroke: P.ink, sw: 3 });
      s += txt(cx, axisY + 36, `t${i + 1}`, { fill: P.ink2, fs: 16, ta: 'middle' });
      const by = H * 0.3 + (i % 2) * 8;
      s += rect(cx - bs / 2, by, bs, bs, { fill: P.accent });
      s += line(cx, by + bs, cx, bandY - 14, { stroke: P.accent, sw: 3 });
      s += arrowHead(cx, bandY - 4, 'down', 9, { fill: P.accent });
      s += rect(cx - bs / 2, bandY, bs, bandH, { fill: P.bg, stroke: P.accent, sw: 3 });
      s += rect(cx - 6, priceY - 6, 12, 12, { fill: P.ink });
    }
    return s;
  },

  dom(c) {
    const { W, H, P } = c;
    const r = rng(21);
    let s = '';
    const rows = 20;
    const rh = H / rows;
    const pw = W * 0.2;
    const px = (W - pw) / 2;
    const colW = px - 14;
    const fs = Math.min(rh * 0.46, 20);
    const wallA = 4;
    const wallB = 15;
    for (let i = 0; i < rows; i++) {
      const y = i * rh;
      const askRow = i < rows / 2;
      const d = askRow ? rows / 2 - 1 - i : i - rows / 2;
      let len = (0.12 + 0.35 * r() + d * 0.025) * colW;
      if (i === wallA) len = colW * 0.78;
      if (i === wallB) len = colW * 0.97;
      if (askRow) s += rect(px + pw + 8, y + 4, len, rh - 8, fill(c, 'sell', 2));
      else s += rect(px - 8 - len, y + 4, len, rh - 8, fill(c, 'accent'));
      const best = i === rows / 2 - 1 || i === rows / 2;
      if (best) s += rect(px, y + 2, pw, rh - 4, askRow ? (P.hollow ? { fill: P.bg, stroke: P.ink, sw: 3 } : { fill: P.sell }) : { fill: P.accent });
      const pc = best ? (askRow ? (P.hollow ? P.ink : P.onSell) : P.onAccent) : P.ink2;
      s += txt(px + pw / 2, y + rh / 2 + fs * 0.36, fmt(64300 - i * 5), { fill: pc, fs, ta: 'middle', fw: best ? 700 : 400 });
      if (i !== wallB && i !== wallA) {
        const sx = askRow ? px + pw + 18 + len : px - 18 - len;
        s += txt(sx, y + rh / 2 + fs * 0.34, (0.2 + r() * 4).toFixed(2), { fill: P.ink2, fs: fs * 0.85, ta: askRow ? 'start' : 'end' });
      }
    }
    s += line(px, 0, px, H, { stroke: P.line, sw: 2 }) + line(px + pw, 0, px + pw, H, { stroke: P.line, sw: 2 });
    const wy = wallB * rh;
    s += rect(-6, wy - 4, W + 12, rh + 8, { fill: 'none', stroke: P.ink, sw: 4 });
    s += txt(px - 26, wy + rh / 2 + fs * 0.36, 'WALL 250.00', { fill: P.onAccent, fs, fw: 700, ta: 'end' });
    s += rect(px + pw + 8, wy + 4, 34, rh - 8, { fill: P.ink });
    return s;
  },

  cortex(c) {
    const { W, H, P } = c;
    let s = '';
    const rw = W * 0.25;
    s += rect(0, 0, rw, H, { fill: P.panel, stroke: P.ink, sw: 4 });
    s += txt(20, 34, 'CORTEX', { fill: P.ink, fs: 20, fw: 700, ls: 2 });
    const units = 7;
    const uh = (H - 70) / units;
    for (let i = 0; i < units; i++) {
      const y = 54 + i * uh;
      s += rect(16, y, rw - 32, uh - 12, { fill: P.bg, stroke: P.line, sw: 2 });
      s += rect(30, y + 14, rw * 0.42, uh - 40, { fill: c.u('h') });
      for (let k = 0; k < 3; k++) s += rect(rw - 50 - k * 26, y + (uh - 12) / 2 - 7, 14, 14, { fill: (i + k) % 3 === 0 ? P.mid : P.accent });
    }
    const ew = W * 0.15;
    const ex = W - ew;
    const eh = H * 0.62;
    s += panel(c, ex, 0, ew, eh, 'VENUE');
    const r = rng(31);
    for (let i = 0; i < 10; i++) {
      const y = 52 + i * ((eh - 64) / 10);
      const len = (0.2 + 0.7 * r()) * (ew - 28);
      s += rect(ex + ew - 14 - len, y, len, (eh - 64) / 10 - 8, fill(c, i < 5 ? 'sell' : 'accent', 2));
    }
    const lanes = ['TWAP', 'CHASE', 'STOP', 'SCALE'];
    const ly0 = H * 0.09;
    const lgap = (eh - ly0 * 2) / (lanes.length - 1);
    lanes.forEach((name, i) => {
      const y = ly0 + i * lgap;
      s += line(rw, y, ex - 10, y, { stroke: P.ink2, sw: 3 });
      s += arrowHead(ex - 2, y, 'right', 9, { fill: P.ink2 });
      const span = ex - rw;
      const px = rw + span * (0.22 + ((i * 0.23) % 0.5));
      const bw = 132;
      for (let k = 1; k <= 3; k++) s += rect(px - k * 26, y - 5, 10, 10, { fill: P.accent, op: 1 - k * 0.25 });
      s += tag(c, px, y - 22, bw, 44, name, 'accent', { fs: 18 });
    });
    const lwid = W * 0.26;
    const lhgt = H * 0.16;
    const sk = lhgt * 0.45;
    const lx = rw + (ex - rw - lwid) / 2 + W * 0.05;
    const lyy = H - lhgt - 40;
    const edge = 20;
    s += pgon([[lx + sk, lyy], [lx + lwid + sk, lyy], [lx + lwid, lyy + lhgt], [lx, lyy + lhgt]], { fill: P.panel, stroke: P.ink, sw: 4, lj: 'miter' });
    s += rect(lx, lyy + lhgt, lwid, edge, { fill: P.ink });
    s += pgon([[lx + lwid, lyy + lhgt], [lx + lwid + sk, lyy], [lx + lwid + sk, lyy + edge], [lx + lwid, lyy + lhgt + edge]], { fill: P.ink2 });
    s += frog(lx + sk / 2 + lwid / 2 - 28, lyy + lhgt / 2 - 24, 56, P.ink2);
    const cyl = lyy + lhgt / 2;
    s += line(rw, cyl, lx - 110, cyl, { stroke: P.ink2, sw: 3, da: '10 8' });
    s += line(lx - 60, cyl, lx + sk / 2 - 6, cyl, { stroke: P.ink2, sw: 3, da: '10 8' });
    s += cross(lx - 100, cyl - 16, 32, P.hollow ? P.ink : P.sell, 6);
    s += tag(c, lx + lwid + sk + 20, lyy + lhgt / 2 - 18, 128, 36, 'OFFLINE', 'sell', { fs: 17 });
    s += txt(lx + sk, lyy - 16, 'LAPTOP CLOSED', { fill: P.ink2, fs: 17, ls: 1 });
    return s;
  },

  tape(c) {
    const { W, H, P } = c;
    let s = '';
    const tw = W * 0.56;
    s += panel(c, 0, 0, tw, H, 'TIME & SALES');
    const rh = 36;
    const rows = Math.floor((H - 56) / rh);
    const liq0 = Math.floor(rows * 0.3);
    const liq1 = Math.floor(rows * 0.8);
    const r = rng(41);
    let price = 64250;
    const sellC = P.hollow ? P.ink : P.sell;
    for (let i = 0; i < rows; i++) {
      const y = 48 + i * rh;
      const liq = i >= liq0 && i < liq1;
      const buy = !liq && r() > 0.5;
      price -= liq ? 18 + (i - liq0) * 6 : (r() - 0.5) * 8;
      const size = liq ? 0.35 + ((i - liq0) / (liq1 - liq0)) * 0.65 : 0.06 + r() * 0.2;
      if (liq) s += rect(2, y + 2, tw - 4, rh - 4, { fill: P.hollow ? 'rgba(10,10,10,0.12)' : 'rgba(252,74,109,0.16)' });
      s += txt(18, y + rh / 2 + 6, `12:04:${String(10 + i).padStart(2, '0')}`, { fill: P.ink2, fs: 16 });
      s += txt(tw * 0.27, y + rh / 2 + 6, fmt(price), { fill: buy ? P.accent : sellC, fs: 17, fw: liq ? 700 : 400 });
      const bw = size * (tw * 0.42);
      s += rect(tw * 0.5, y + 7, bw, rh - 14, fill(c, buy ? 'accent' : 'sell', 2));
      if (liq) s += txt(tw - 16, y + rh / 2 + 6, 'LIQ', { fill: sellC, fs: 15, fw: 700, ta: 'end' });
    }
    const x0 = tw + 40;
    const cwid = W - x0;
    const steps = 6;
    const sw = (cwid * 0.62) / steps;
    const p = [];
    let yy = H * 0.1;
    for (let i = 0; i < steps; i++) {
      p.push([x0 + i * sw, yy], [x0 + (i + 1) * sw, yy]);
      yy += H * 0.045 + i * H * 0.022;
    }
    const by = Math.min(H * 0.7, yy + 30);
    const bxc = x0 + cwid * 0.62;
    s += pline(p, { ...sellStroke(c, 6), lj: 'miter' });
    s += line(bxc, p[p.length - 1][1], bxc, by, sellStroke(c, 6));
    const R = Math.min(cwid * 0.42, H * 0.26);
    const spikes = [];
    for (let i = 0; i < 32; i++) {
      const a = (i / 32) * Math.PI * 2 - Math.PI / 2;
      const rr = i % 2 === 0 ? R * (i % 4 === 0 ? 1 : 0.8) : R * 0.42;
      spikes.push([bxc + Math.cos(a) * rr, by + Math.sin(a) * rr]);
    }
    s += pgon(spikes, { fill: P.hollow ? P.ink : P.sell });
    s += rect(bxc - R * 0.36, by - 22, R * 0.72, 44, { fill: P.bg });
    s += txt(bxc, by + 8, 'LIQ', { fill: sellC, fs: 24, fw: 700, ta: 'middle', ls: 2 });
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      s += line(bxc + Math.cos(a) * R * 1.08, by + Math.sin(a) * R * 1.08, bxc + Math.cos(a) * R * 1.22, by + Math.sin(a) * R * 1.22, sellStroke(c, 4));
    }
    return s;
  },

  layout(c) {
    const { W, H, P } = c;
    const g = 16;
    let s = '';
    const cells = [
      [0, 0, 0.5, 0.58, 0, 'CHART'], [0.5, 0, 0.25, 0.58, 0, 'BOOK'], [0.75, 0, 0.25, 0.34, 1, 'ORDER'],
      [0.75, 0.34, 0.25, 0.24, 2, 'TAPE'], [0, 0.58, 0.36, 0.42, 0, 'POSITIONS'], [0.36, 0.58, 0.39, 0.42, 1, 'CHART'],
      [0.75, 0.58, 0.25, 0.42, 3, 'DOM'],
    ];
    const r = rng(51);
    cells.forEach(([fx, fy, fw, fh, li, name], i) => {
      const x = fx * W + (fx ? g / 2 : 0);
      const y = fy * H + (fy ? g / 2 : 0);
      const w = fw * W - (fx ? g / 2 : 0) - (fx + fw < 1 ? g / 2 : 0);
      const h = fh * H - (fy ? g / 2 : 0) - (fy + fh < 1 ? g / 2 : 0);
      if (i === 3) {
        s += rect(x, y, w, h, { fill: 'none', stroke: LINKS[li], sw: 3, da: '10 8' });
        s += rect(x - 70, y + 34, w, h, { fill: P.panel, stroke: P.ink, sw: 3 });
        s += rect(x - 70, y + 34, w, 6, { fill: LINKS[li] });
        s += circ(x - 44, y + 56, 9, { fill: LINKS[li] });
        s += txt(x - 24, y + 62, name, { fill: P.ink2, fs: 18, ls: 1 });
        const mx = x - 70 + w / 2;
        const my = y + 34 + h / 2 + 14;
        s += line(mx - 30, my, mx + 30, my, { stroke: P.ink, sw: 4 }) + line(mx, my - 30, mx, my + 30, { stroke: P.ink, sw: 4 });
        ['up', 'down', 'left', 'right'].forEach((d) => {
          const o = { up: [mx, my - 38], down: [mx, my + 38], left: [mx - 38, my], right: [mx + 38, my] }[d];
          s += arrowHead(o[0], o[1], d, 9, { fill: P.ink });
        });
        return;
      }
      s += panel(c, x, y, w, h, name, { link: LINKS[li], hdr: 44 });
      const ix = x + 16;
      const iy = y + 60;
      const iw = w - 32;
      const ih = h - 76;
      if (name === 'CHART') s += candles(c, ix, iy, iw, ih, Math.max(8, Math.round(iw / 26)), { seed: 13 + i }).s;
      else if (name === 'BOOK' || name === 'DOM') {
        const n = Math.floor(ih / 24);
        for (let k = 0; k < n; k++) {
          const len = (0.2 + 0.7 * r()) * iw;
          s += rect(ix + iw - len, iy + k * 24, len, 16, fill(c, k < n / 2 ? 'sell' : 'accent', 2));
        }
      } else if (name === 'POSITIONS') {
        for (let k = 0; k < 4 && 30 + k * 44 < ih; k++) {
          s += rect(ix, iy + k * 44, 30, 28, fill(c, k % 2 ? 'sell' : 'accent', 2));
          s += rect(ix + 44, iy + k * 44 + 9, iw * (0.3 + 0.4 * r()), 10, { fill: P.mid });
        }
      } else if (name === 'ORDER') {
        s += rect(ix, iy, iw, 34, { fill: P.bg, stroke: P.line, sw: 2 });
        s += rect(ix, iy + 46, iw, 34, { fill: P.bg, stroke: P.line, sw: 2 });
        const bh = Math.max(30, ih - 96);
        s += rect(ix, iy + 92, iw / 2 - 6, bh, { fill: P.accent }) + rect(ix + iw / 2 + 6, iy + 92, iw / 2 - 6, bh, fill(c, 'sell'));
      }
    });
    return s;
  },

  hotkeys(c) {
    const { W, H, P } = c;
    let s = '';
    const side = W / H > 1.4;
    const kbW = side ? W * 0.72 : W;
    const k = Math.min(H / 4.4, kbW / 6.9);
    const ks = k * 0.88;
    const rows = ['QWERTY', 'ASDFGH', 'ZXCVBN'];
    const offs = [0, k * 0.3, k * 0.75];
    const kbH = k * 4;
    const kbY = side ? (H - kbH) / 2 : 20;
    const hot = { B: ['BUY', 'accent'], S: ['SELL', 'sell'], C: ['CXL', 'ink'] };
    const keyAt = (x, y, w, label) => {
      const h = hot[label];
      if (h) {
        const f = h[1] === 'sell' && P.hollow ? { fill: P.bg, stroke: P.ink, sw: 6 } : fill(c, h[1]);
        const tc = h[1] === 'sell' && P.hollow ? P.ink : onFill(c, h[1]);
        let o = rect(x, y - ks * 0.1, w, ks, f);
        o += rect(x - 8, y - ks * 0.1 - 8, w + 16, ks + 16, { fill: 'none', stroke: P.ink, sw: 3 });
        o += txt(x + ks * 0.14, y + ks * 0.26, label, { fill: tc, fs: ks * 0.3, fw: 700 });
        o += txt(x + ks * 0.14, y + ks * 0.76, h[0], { fill: tc, fs: ks * 0.25, fw: 700 });
        return o;
      }
      let o = rect(x, y, w, ks, { fill: P.panel, stroke: P.ink2, sw: 3 });
      o += rect(x + 2, y + ks * 0.86, w - 4, ks * 0.14 - 2, { fill: P.mid });
      o += txt(x + ks * 0.14, y + ks * 0.36, label, { fill: P.ink2, fs: ks * 0.26 });
      return o;
    };
    rows.forEach((row, ri) => {
      [...row].forEach((ch, ci) => { s += keyAt(offs[ri] + ci * k, kbY + ri * k, ks, ch); });
    });
    s += keyAt(k * 1.4, kbY + 3 * k, k * 4 - k * 0.12, '');
    const lx = side ? kbW + 50 : 0;
    const lw = side ? W - lx : W;
    const ly = side ? kbY : kbY + kbH + 50;
    const lh = side ? kbH - k * 0.12 : H - ly;
    s += panel(c, lx, ly, lw, lh, 'HOTKEYS');
    const map = [['B', 'BUY MKT', 'accent'], ['S', 'SELL MKT', 'sell'], ['C', 'CANCEL', 'ink'], ['F', 'FLATTEN', ''], ['G', 'CHASE', '']].slice(0, side ? 5 : 3);
    const mh = (lh - 60) / map.length;
    map.forEach(([kk, act, kind], i) => {
      const y = ly + 54 + i * mh;
      const box = Math.min(mh - 14, 46);
      s += kind ? tag(c, lx + 18, y, box, box, kk, kind, { fs: box * 0.45 }) : rect(lx + 18, y, box, box, { fill: P.bg, stroke: P.line, sw: 2 }) + txt(lx + 18 + box / 2, y + box / 2 + 7, kk, { fill: P.ink2, fs: box * 0.45, ta: 'middle' });
      s += txt(lx + 34 + box, y + box / 2 + 7, act, { fill: kind ? P.ink : P.ink2, fs: 20, fw: kind ? 700 : 400 });
    });
    return s;
  },

  venues(c) {
    const { W, H, P } = c;
    let s = '';
    const m = Math.min(W, H);
    const hs = m * 0.34;
    const hx = W / 2 - hs / 2;
    const hy = H / 2 - hs / 2;
    const nb = m * 0.21;
    const nodes = [[0.09, 0.14], [0.06, 0.5], [0.09, 0.86], [0.91, 0.14], [0.94, 0.5], [0.91, 0.86]];
    const kinds = ['half', 'ink', 'hatch', 'grid', 'stripes', 'outline'];
    nodes.forEach(([fx, fy], i) => {
      const cx = Math.min(Math.max(fx * W, nb / 2 + 4), W - nb / 2 - 4);
      const cy = Math.min(Math.max(fy * H, nb / 2 + 4), H - nb / 2 - 4);
      const left = fx < 0.5;
      const sx = left ? hx : hx + hs;
      const sy = hy + hs * (0.2 + 0.3 * (i % 3));
      const ex = left ? cx + nb / 2 : cx - nb / 2;
      const mx = (sx + ex) / 2;
      const route = [[sx, sy], [mx, sy], [mx, cy], [ex, cy]];
      s += pline(route, { stroke: P.ink2, sw: 4, lj: 'miter' });
      const pk = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
      const [px, py] = pk(route[2], route[3], 0.5);
      s += rect(px - 10, py - 10, 20, 20, { fill: P.accent });
      const [qx, qy] = pk(route[0], route[1], 0.5);
      s += rect(qx - 7, qy - 7, 14, 14, { fill: P.accent });
      const x = cx - nb / 2;
      const y = cy - nb / 2;
      const kind = kinds[i];
      if (kind === 'grid') {
        s += rect(x, y, nb, nb, { fill: P.panel, stroke: P.ink, sw: 3 });
        const q = (nb - 24) / 3;
        for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) if ((a + b) % 2 === 0) s += rect(x + 12 + a * q, y + 12 + b * q, q - 6, q - 6, { fill: P.ink });
      } else if (kind === 'stripes') {
        s += rect(x, y, nb, nb, { fill: P.panel, stroke: P.ink, sw: 3 });
        for (let a = 0; a < 5; a++) s += rect(x + 12, y + 14 + a * ((nb - 24) / 5), (nb - 24) * (1 - a * 0.15), (nb - 24) / 5 - 8, { fill: a < 2 ? (P.hollow ? P.ink : P.sell) : P.accent });
      } else if (kind === 'outline') {
        s += rect(x, y, nb, nb, { fill: P.panel, stroke: P.ink, sw: 3 });
        s += rect(x + nb * 0.25, y + nb * 0.25, nb * 0.5, nb * 0.5, { fill: 'none', stroke: P.ink, sw: 6 });
      } else if (kind === 'ink') {
        s += rect(x, y, nb, nb, { fill: P.ink });
        s += rect(x + nb * 0.38, y + nb * 0.38, nb * 0.24, nb * 0.24, { fill: P.bg });
      } else {
        s += rect(x, y, nb, nb, { fill: P.panel, stroke: P.ink, sw: 3 });
        s += rect(x + 8, y + 8, nb - 16, nb - 16, { fill: kind === 'half' ? c.u('h') : c.u('x') });
      }
      s += rect(x + nb - 22, y - 9, 18, 18, { fill: P.accent });
    });
    s += rect(hx - 18, hy - 18, hs + 36, hs + 36, { fill: 'none', stroke: P.ink2, sw: 2, da: '6 6' });
    s += rect(hx, hy, hs, hs, { fill: P.accent });
    s += frog(hx + hs * 0.16, hy + hs * 0.2, hs * 0.68, P.onAccent);
    return s;
  },

  hyperliquid(c) {
    const { W, H, P } = c;
    let s = '';
    const ww = W * 0.42;
    const wh = H * 0.6;
    const wy = H * 0.28;
    s += rect(0, wy, ww, wh, { fill: P.panel, stroke: P.ink, sw: 5 });
    s += rect(0, wy, ww, wh * 0.2, { fill: P.mid });
    s += line(0, wy + wh * 0.2, ww, wy + wh * 0.2, { stroke: P.ink, sw: 5 });
    const clx = ww - ww * 0.28;
    const cly = wy + wh * 0.44;
    s += rect(clx, cly, ww * 0.28 + 24, wh * 0.26, { fill: P.ink });
    s += rect(clx + 26, cly + wh * 0.13 - 12, 24, 24, { fill: P.accent });
    s += key(32, wy + wh * 0.38, ww * 0.5, P.ink, P.panel);
    s += txt(32, wy + wh - 30, 'MASTER WALLET', { fill: P.ink2, fs: 20, ls: 2 });
    s += txt(28, wy + wh * 0.1 + 8, '0x7a3f...91c2', { fill: P.ink, fs: 18 });

    const ax = W * 0.56;
    const aw = W - ax;
    const kL = Math.min(aw * 0.62, 380);
    const ky = H * 0.04;
    s += key(ax, ky, kL, P.accent, P.bg);
    s += txt(ax + kL + 24, ky + kL * 0.17 + 8, 'API WALLET', { fill: P.accent, fs: 22, fw: 700, ls: 2 });
    const linkY = ky + kL * 0.17;
    s += pline([[ww + 24, cly + wh * 0.13], [ww + (ax - ww) / 2, cly + wh * 0.13], [ww + (ax - ww) / 2, linkY], [ax - 22, linkY]], { stroke: P.accent, sw: 4, da: '12 8' });
    s += arrowHead(ax - 8, linkY, 'right', 10, { fill: P.accent });

    const py = H * 0.34;
    const ph = H - py;
    s += panel(c, ax, py, aw, ph, 'PERMISSIONS');
    const perms = [['TRADE', true], ['CANCEL', true], ['WITHDRAW', false]];
    const rh = (ph - 56) / perms.length;
    perms.forEach(([name, ok], i) => {
      const y = py + 48 + i * rh;
      const bs = Math.min(rh - 24, 64);
      const by = y + (rh - bs) / 2;
      if (i) s += line(ax + 16, y, ax + aw - 16, y, { stroke: P.line, sw: 2 });
      s += txt(ax + 24, by + bs / 2 + 9, name, { fill: ok ? P.ink : (P.hollow ? P.ink : P.sell), fs: 26, fw: 700, ls: 1 });
      if (ok) {
        s += rect(ax + aw - 24 - bs, by, bs, bs, { fill: P.accent });
        s += check(ax + aw - 24 - bs, by, bs, P.onAccent);
      } else {
        s += lock(ax + aw - 24 - bs, by - 4, bs + 4, P.hollow ? P.ink : P.sell, P.panel);
        s += line(ax + 22, by + bs / 2 + 1, ax + 24 + 8 * 15.6 + 4, by + bs / 2 + 1, { stroke: P.hollow ? P.ink : P.sell, sw: 4 });
      }
    });
    return s;
  },

  timeframe(c) {
    const { W, H, P } = c;
    let s = '';
    const g = 40;
    const pw = (W - g) / 2;
    const tabs = ['1m', '5m', '1h', '4h', '1D'];
    const head = (x, sel) => {
      let o = panel(c, x, 0, pw, H, '', { hdr: 56 });
      tabs.forEach((t, i) => {
        const tx = x + 16 + i * 70;
        if (t === sel) o += tag(c, tx, 10, 60, 36, t, 'accent', { fs: 20 });
        else o += txt(tx + 30, 35, t, { fill: P.ink2, fs: 20, ta: 'middle' });
      });
      return o;
    };
    s += head(0, '1m');
    s += candles(c, 18, 80, pw - 36, H - 104, Math.round((pw - 36) / 7.5), { seed: 61, vol: 0.03, frac: 0.55, path: (t) => 0.35 + 0.3 * t + 0.14 * Math.sin(t * 14) + 0.06 * Math.sin(t * 41) }).s;
    const rx = pw + g;
    s += head(rx, '1D');
    const n = 9;
    const cd = candles(c, rx + 18, 80, pw - 36, H - 104, n, { seed: 62, vol: 0.08, frac: 0.62, path: (t) => 0.12 + 0.72 * t + 0.12 * Math.sin(t * 9) });
    s += cd.s;
    const step = (pw - 36) / n;
    const hx = rx + 18 + step * 0.06;
    const hw = step * 0.88;
    s += rect(hx, 70, hw, H - 84, { fill: 'none', stroke: P.ink, sw: 3, da: '10 6' });
    s += pline([[hx, 70], [pw - 2, 66]], { stroke: P.ink, sw: 3, da: '10 6' });
    s += pline([[hx, H - 14], [pw - 2, H - 4]], { stroke: P.ink, sw: 3, da: '10 6' });
    return s;
  },

  basket(c) {
    const { W, H, P } = c;
    let s = '';
    const assets = [['BTC', 0.32, 'accent'], ['ETH', 0.22, 'ink'], ['SOL', 0.16, 'half'], ['HYPE', 0.13, 'hatch'], ['LINK', 0.1, 'outline'], ['AVAX', 0.07, 'mid']];
    const lw = W * 0.4;
    const bx = W * 0.62;
    const bw = W - bx;
    const by = 0;
    const bh = H;
    s += rect(bx, by, bw, bh, { fill: P.panel, stroke: P.ink, sw: 5 });
    s += txt(bx + 20, by + 36, 'BASKET  6 LEGS', { fill: P.ink, fs: 20, fw: 700, ls: 1 });
    s += line(bx, by + 56, bx + bw, by + 56, { stroke: P.ink, sw: 3 });
    const btnH = 70;
    const inner = bh - 56 - btnH - 48;
    let yy = by + 72;
    const segs = [];
    assets.forEach(([name, w, kind]) => {
      const hgt = inner * w - 8;
      s += rect(bx + 16, yy, bw - 32, hgt, fill(c, kind, 3));
      const tc = kind === 'accent' ? P.onAccent : kind === 'ink' ? P.onInk : P.ink;
      if (hgt > 26) {
        const ty = yy + Math.min(hgt / 2 + 7, 30);
        const lbg = kind === 'half' || kind === 'hatch' ? rect(bx + 24, ty - 20, 70, 26, { fill: P.panel }) + rect(bx + bw - 90, ty - 20, 66, 26, { fill: P.panel }) : '';
        s += lbg + txt(bx + 30, ty, name, { fill: tc, fs: 18, fw: 700 }) + txt(bx + bw - 30, ty, `${Math.round(w * 100)}%`, { fill: tc, fs: 18, ta: 'end' });
      }
      segs.push(yy + hgt / 2);
      yy += hgt + 8;
    });
    s += tag(c, bx + 16, by + bh - btnH - 16, bw - 32, btnH, 'SEND BASKET', 'accent', { fs: 22 });
    const cols = 2;
    const cellW = lw / cols;
    const cellH = H / 3;
    assets.forEach(([name, w, kind], i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const sz = Math.min(cellW, cellH) * (0.45 + w * 1.6);
      const x = col * cellW + (cellW - sz) / 2 + (row % 2 ? 14 : -14);
      const y = row * cellH + (cellH - sz) / 2;
      const ex = bx - 14;
      const ey = segs[i];
      const mx = lw + 30 + i * ((bx - lw - 60) / 6);
      s += pline([[x + sz, y + sz / 2], [mx, y + sz / 2], [mx, ey], [ex, ey]], { stroke: P.ink2, sw: 3, lj: 'miter' });
      s += arrowHead(bx - 4, ey, 'right', 9, { fill: P.ink2 });
      s += rect(x, y, sz, sz, fill(c, kind, 3));
      const tc = kind === 'accent' ? P.onAccent : kind === 'ink' ? P.onInk : P.ink;
      s += (kind === 'half' || kind === 'hatch' ? rect(x + 10, y + 10, 72, 28, { fill: P.panel }) : '') + txt(x + 16, y + 32, name, { fill: tc, fs: 18, fw: 700 });
    });
    return s;
  },

  // News: a live feed with ticker tags, price change since the post, and quick buy/sell buttons.
  news(c) {
    const { W, H, P } = c;
    let s = panel(c, 0, 0, W * 0.74, H, 'NEWS');
    const fw = W * 0.74;
    const items = [
      { h: 'MACRO DESK', age: '4s', tag: '$BTC', chg: '+1.8%', up: true, lines: [0.92, 0.7], fresh: true },
      { h: 'SOL CORE', age: '41s', tag: '$SOL', chg: '+3.2%', up: true, lines: [0.85, 0.55] },
      { h: 'MARKETS WIRE', age: '2m', tag: '$ETH', chg: '-0.9%', up: false, lines: [0.95, 0.8, 0.4] },
      { h: 'EXCHANGE STATUS', age: '6m', tag: '$HYPE', chg: '+0.4%', up: true, lines: [0.6] },
    ];
    let y = 56;
    for (const it of items) {
      const ih = 52 + it.lines.length * 26 + 52;
      if (y + ih > H - 10) break;
      if (it.fresh) s += rect(8, y - 6, fw - 16, ih, { fill: 'none', stroke: P.accent, sw: 3 });
      s += rect(24, y + 4, 40, 40, { fill: it.fresh ? P.accent : P.mid });
      s += rect(80, y + 10, 190, 14, { fill: P.ink }) + txt(fw - 32, y + 24, it.age, { fill: P.ink2, fs: 18, fw: 700, ta: 'end' });
      it.lines.forEach((l, i) => { s += rect(80, y + 52 + i * 26, (fw - 130) * l, 12, { fill: P.mid }); });
      const ty = y + 52 + it.lines.length * 26 + 8;
      s += tag(c, 80, ty, 96, 32, it.tag, 'ink', { fs: 17 });
      s += txt(192, ty + 23, it.chg, { fill: it.up ? P.accent : (P.hollow ? P.ink : P.sell), fs: 19, fw: 700 });
      s += tag(c, fw - 260, ty, 110, 32, 'BUY', 'accent', { fs: 16 });
      s += tag(c, fw - 140, ty, 110, 32, 'SELL', 'sell', { fs: 16 });
      y += ih + 12;
    }
    // notification toast + bell
    const bx = fw + 40, bw = W - bx;
    s += rect(bx, 40, bw, 150, { fill: P.panel, stroke: P.ink, sw: 3 });
    s += rect(bx + 24, 70, 44, 40, { fill: P.accent }) + rect(bx + 38, 112, 16, 8, { fill: P.accent });
    s += rect(bx + 88, 74, bw - 120, 14, { fill: P.ink }) + rect(bx + 88, 102, (bw - 120) * 0.7, 12, { fill: P.mid });
    s += tag(c, bx + 24, 140, 96, 30, '$BTC', 'ink', { fs: 15 });
    // sound waves
    for (let i = 0; i < 3; i++) s += rect(bx + 40 + i * 70, 260 + i * 0, 36, 160 - i * 40, fill(c, i === 0 ? 'accent' : 'half', 2));
    s += txt(bx, 470, 'NOTIFY', { fill: P.ink, fs: 22, fw: 700, ls: 2 }) + txt(bx, 506, 'SOUND', { fill: P.ink2, fs: 22, fw: 700, ls: 2 }) + txt(bx, 542, 'FILTER', { fill: P.ink2, fs: 22, fw: 700, ls: 2 });
    for (let i = 0; i < 3; i++) s += rect(bx + bw - 64, 450 + i * 36, 56, 26, fill(c, i === 0 ? 'accent' : 'outline', 2));
    return s;
  },
  // Knife: a liquidation cascade on high volume, then a big opposite candle on low volume, with the fill marker at the turn.
  knife(c) {
    const { W, H, P } = c;
    const sellCol = P.hollow ? P.ink : P.sell;
    let s = panel(c, 0, 0, W * 0.72, H, 'BTC  1M');
    const cw = W * 0.72;
    const top = 60, ch = H * 0.62, vTop = top + ch + 30, vh = H - vTop - 24;
    // price path: drift, cascade, low, spring
    const bars = [
      [0.80, 0.82], [0.82, 0.79], [0.79, 0.80], [0.80, 0.77], [0.77, 0.78], [0.78, 0.74],
      [0.74, 0.66], [0.66, 0.52], [0.52, 0.34], [0.34, 0.16], [0.16, 0.08],
      [0.08, 0.30], [0.30, 0.38], [0.38, 0.35], [0.35, 0.44], [0.44, 0.48],
    ];
    const vols = [0.12, 0.10, 0.09, 0.14, 0.10, 0.2, 0.45, 0.7, 0.92, 1.0, 0.85, 0.22, 0.16, 0.1, 0.14, 0.12];
    const n = bars.length, step = (cw - 60) / n, bw = step * 0.62;
    const Y = (v) => top + ch * (1 - v);
    bars.forEach(([o, cl], i) => {
      const x = 30 + step * (i + 0.5);
      const up = cl > o;
      const hi = Math.max(o, cl) + 0.02, lo = Math.min(o, cl) - (i === 10 ? 0.06 : 0.02);
      const col = up ? P.accent : sellCol;
      s += line(x, Y(hi), x, Y(lo), { stroke: col, sw: 4 });
      if (up || !P.hollow) s += rect(x - bw / 2, Y(Math.max(o, cl)), bw, Math.max(4, Y(Math.min(o, cl)) - Y(Math.max(o, cl))), { fill: col });
      else s += rect(x - bw / 2 + 2, Y(Math.max(o, cl)) + 2, bw - 4, Math.max(4, Y(Math.min(o, cl)) - Y(Math.max(o, cl))) - 4, { fill: 'none', stroke: P.ink, sw: 3 });
      const vhh = vh * vols[i];
      s += rect(x - bw / 2, vTop + vh - vhh, bw, vhh, i >= 6 && i <= 10 ? fill(c, 'sell', 2) : i === 11 ? { fill: P.accent } : { fill: P.mid });
      // skull-ish liquidation markers
      if (i >= 7 && i <= 10) s += rect(x - 9, Y(lo) + 14, 18, 18, { fill: P.ink }) + rect(x - 5, Y(lo) + 19, 4, 4, { fill: P.bg }) + rect(x + 1, Y(lo) + 19, 4, 4, { fill: P.bg });
    });
    // annotate the signal candle
    const sx = 30 + step * 11.5;
    s += rect(sx - bw, Y(0.33), bw * 2, Y(0.03) - Y(0.33), { fill: 'none', stroke: P.accent, sw: 3, da: '10 6' });
    s += tag(c, sx + bw + 10, Y(0.28), 240, 34, 'BIG CANDLE, LOW VOL', 'accent', { fs: 15 });
    s += arrowHead(sx, Y(0.02) + 26, 'up', 12, { fill: P.accent });
    s += line(30, Y(0.14), cw - 30, Y(0.14), { stroke: P.ink2, sw: 2, da: '6 8' }) + txt(40, Y(0.14) - 10, 'RESTING BIDS', { fill: P.ink2, fs: 15, fw: 700 });
    // right: liquidation feed rows + empty ask book
    const fx = cw + 30, fw = W - fx;
    s += rect(fx, 0, fw, H * 0.5, { fill: P.panel, stroke: P.line, sw: 2 }) + txt(fx + 16, 30, 'LIQUIDATIONS', { fill: P.ink2, fs: 17, ls: 1 });
    for (let i = 0; i < 7; i++) {
      const y = 56 + i * 44;
      const w = fw - 40 - (i % 3) * 40 - i * 6;
      s += rect(fx + 12, y, 22, 22, { fill: P.ink }) + rect(fx + 44, y + 2, w * 0.55, 18, fill(c, 'sell', 2)) + rect(fx + 52 + w * 0.55, y + 5, 60, 12, { fill: P.mid });
    }
    const by = H * 0.5 + 24;
    s += rect(fx, by, fw, H - by, { fill: P.panel, stroke: P.line, sw: 2 }) + txt(fx + 16, by + 30, 'BOOK', { fill: P.ink2, fs: 17, ls: 1 });
    const rowsY = by + 48, rh = (H - rowsY - 20) / 8;
    for (let i = 0; i < 8; i++) {
      const y = rowsY + i * rh;
      const ask = i < 4;
      const len = ask ? (i === 3 ? 30 : 10 + i * 4) : 60 + (8 - i) * 30;
      s += rect(fx + fw - 16 - len, y + 4, len, rh - 8, ask ? fill(c, 'sell', 2) : { fill: P.accent });
      if (ask && i === 1) s += txt(fx + 16, y + rh / 2 + 6, 'THIN ASKS', { fill: P.ink, fs: 15, fw: 700 });
    }
    return s;
  },
};

// ---------- assembly ----------

function defs(id, P, gridStep, gridR) {
  const sellDot = P.hollow ? P.ink : P.sell;
  return '<defs>'
    + `<pattern id="${id}-g" width="${gridStep}" height="${gridStep}" patternUnits="userSpaceOnUse"><circle cx="${gridStep / 2}" cy="${gridStep / 2}" r="${gridR}" fill="${P.dot}"/></pattern>`
    + `<pattern id="${id}-h" width="12" height="12" patternUnits="userSpaceOnUse"><rect x="3.5" y="3.5" width="5" height="5" fill="${P.half}"/></pattern>`
    + `<pattern id="${id}-ha" width="14" height="14" patternUnits="userSpaceOnUse"><rect x="5" y="5" width="4" height="4" fill="${P.accent}"/></pattern>`
    + `<pattern id="${id}-hs" width="14" height="14" patternUnits="userSpaceOnUse"><rect x="5" y="5" width="4" height="4" fill="${sellDot}"/></pattern>`
    + `<pattern id="${id}-x" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect x="0" y="0" width="3" height="14" fill="${P.half}"/></pattern>`
    + `<pattern id="${id}-xs" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect x="0" y="0" width="3" height="16" fill="${sellDot}"/></pattern>`
    + '</defs>';
}

function corners(w, h, m, len, color, sw) {
  const o = { stroke: color, sw, fill: 'none' };
  return pline([[m, m + len], [m, m], [m + len, m]], o) + pline([[w - m - len, m], [w - m, m], [w - m, m + len]], o)
    + pline([[m, h - m - len], [m, h - m], [m + len, h - m]], o) + pline([[w - m - len, h - m], [w - m, h - m], [w - m, h - m - len]], o);
}

export function cover(motif, { theme = 'black' } = {}) {
  const P = THEMES[theme] || THEMES.black;
  const draw = DRAW[motif] || DRAW.terminal;
  const id = `ic${++uid}-${MOTIFS.includes(motif) ? motif : 'terminal'}-${theme[0] || 'b'}`;
  const u = (name) => `url(#${id}-${name})`;
  const vw = 1600;
  const vh = 900;
  const c = { W: 1440, H: 760, P, id, u };
  const body = rect(0, 0, vw, vh, { fill: P.bg }) + rect(0, 0, vw, vh, { fill: u('g') })
    + corners(vw, vh, 24, 28, P.ink2, 2)
    + `<g transform="translate(80 70)">${draw(c)}</g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${vw} ${vh}" font-family="${FONT.replace(/"/g, '&quot;')}" role="img" aria-hidden="true">${defs(id, P, 32, 1.6)}${body}</svg>`;
}
