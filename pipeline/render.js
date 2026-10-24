const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const deckPath = process.argv[2] || path.join(__dirname, 'deck.json');
const outDir = process.argv[3] || path.join(__dirname, 'out');
const deck = JSON.parse(fs.readFileSync(deckPath, 'utf8'));
const M = deck.meta;

const esc = s => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const nl = s => esc(s).replace(/\n/g, '<br>');

function dataUri(p) {
  if (!p) return null;
  const abs = path.isAbsolute(p) ? p : path.join(__dirname, p);
  if (!fs.existsSync(abs)) return null;
  const ext = path.extname(abs).slice(1).toLowerCase();
  const mime = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
  return `data:${mime};base64,${fs.readFileSync(abs).toString('base64')}`;
}

const CSS = `
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1080px;height:1080px}
body{font-family:'Inter',sans-serif;-webkit-font-smoothing:antialiased;overflow:hidden}
.slide{position:relative;width:1080px;height:1080px;overflow:hidden}

/* ============ COVER (photo, dark) ============ */
.cover{background:#0C0D10}
.photo{position:absolute;top:0;bottom:0;right:0;width:582px;
  background-size:cover;background-position:var(--focus,center);z-index:0;
  filter:brightness(1.30) contrast(1.05) saturate(.97)}
.photo.empty{background:radial-gradient(120% 90% at 60% 20%,#343843 0%,#1C1F27 52%,#121419 100%)}
.panel{position:absolute;top:0;bottom:0;left:0;width:620px;z-index:1;background:#101216}
.feather{position:absolute;top:0;bottom:0;left:560px;width:190px;z-index:2;
  background:linear-gradient(90deg,#101216 0%,rgba(16,18,22,.92) 34%,rgba(16,18,22,.55) 66%,rgba(16,18,22,0) 100%)}
.vign{position:absolute;inset:0;z-index:3;background:
  linear-gradient(to bottom, rgba(10,11,14,.42) 0%, rgba(10,11,14,0) 20%,
    rgba(10,11,14,0) 68%, rgba(10,11,14,.68) 100%)}
.cover-body{position:absolute;z-index:4;left:88px;bottom:198px;width:536px}
h1{font-size:64px;line-height:1.05;letter-spacing:-.034em;font-weight:800;color:#fff}
h1 .ac{color:var(--accent)}
.sub{margin-top:28px;font-size:25px;line-height:1.46;font-weight:400;
  color:rgba(255,255,255,.72);letter-spacing:-.005em;max-width:500px}
.swipe{position:absolute;left:88px;bottom:86px;z-index:5;display:flex;align-items:center;gap:18px;
  font-size:17px;font-weight:700;letter-spacing:.20em;color:#FFFFFF}
.swipe .arrow{width:54px;height:2px;background:var(--accent);position:relative}
.swipe .arrow:after{content:"";position:absolute;right:0;top:-5px;width:12px;height:12px;
  border-top:2px solid var(--accent);border-right:2px solid var(--accent);
  transform:rotate(45deg)}

/* ============ INTERIOR (black, yellow title, white body) ============ */
.dark{background:#000}
.idea{position:absolute;left:88px;right:132px;top:50%;transform:translateY(-50%);z-index:4}
.num{display:flex;align-items:baseline;gap:26px;margin-bottom:32px}
.num .n{font-size:80px;line-height:1;font-weight:800;letter-spacing:-.04em;
  color:#FFFFFF}
.num .bar{flex:1;height:1px;background:rgba(255,255,255,.18);transform:translateY(-12px)}
h2{font-size:66px;line-height:1.06;letter-spacing:-.032em;font-weight:800;color:var(--accent)}
.body{margin-top:32px;font-size:28px;line-height:1.56;font-weight:400;
  color:#FFFFFF;max-width:742px;letter-spacing:-.003em}

/* ============ OUTRO ============ */
.outro{position:absolute;left:88px;right:132px;top:50%;transform:translateY(-50%);z-index:4}
.outro h2{font-size:74px}
.outro.big h2{font-size:88px;line-height:1.04;color:#FFFFFF}
.outro .body{margin-top:32px}
.cta{margin-top:60px;display:inline-flex;align-items:center;gap:16px;
  padding:19px 38px;border-radius:999px;background:var(--accent);color:#0A0B0D;
  font-size:23px;font-weight:700;letter-spacing:-.012em}
.cta .dotmark{width:9px;height:9px;border-radius:50%;background:#0A0B0D}

/* ============ FOLLOW (always last) ============ */
.follow{position:absolute;left:88px;right:132px;top:50%;transform:translateY(-50%);z-index:4}
.follow .kicker{font-size:17px;font-weight:700;letter-spacing:.22em;
  color:rgba(255,255,255,.48);margin-bottom:34px}
.follow h2{font-size:86px;line-height:1.03;letter-spacing:-.036em}
.follow .handle{margin-top:42px;display:inline-flex;align-items:center;gap:16px;
  padding:19px 38px;border-radius:999px;background:var(--accent);color:#0A0B0D;
  font-size:26px;font-weight:700;letter-spacing:-.012em}
.follow .note{margin-top:34px;font-size:26px;line-height:1.5;color:rgba(255,255,255,.72);max-width:700px}

/* ============ watermark ============ */
.wm{position:absolute;right:88px;bottom:88px;z-index:7;
  font-size:16px;font-weight:600;letter-spacing:.16em;color:rgba(255,255,255,.52)}
`;

function render(s, i, total) {
  if (s.type === 'cover') {
    const img = dataUri(s.photo);
    return { cls: 'cover', html: `
    <div class="photo ${img ? '' : 'empty'}" style="${img ? `background-image:url('${img}');` : ''}--focus:${s.photoFocus || 'center'}"></div>
    <div class="panel"></div><div class="feather"></div><div class="vign"></div>
    <div class="cover-body">
      <h1>${nl(s.headline)}<br><span class="ac">${nl(s.headlineAccent)}</span></h1>
      <div class="sub">${nl(s.sub)}</div>
    </div>
    ${s.swipe ? `<div class="swipe"><span class="arrow"></span>${esc(s.swipe)}</div>` : ''}` };
  }
  if (s.type === 'follow') {
    return { cls: 'dark', html: `
    <div class="follow">
      ${s.kicker ? `<div class="kicker">${esc(s.kicker)}</div>` : ''}
      <h2>${nl(s.title)}</h2>
      <div class="note">${nl(s.note)}</div>
      <div class="handle">${esc(M.handle)}</div>
    </div>` };
  }
  if (s.type === 'outro') {
    return { cls: 'dark', html: `
    <div class="outro${s.body ? '' : ' big'}">
      <h2>${nl(s.title)}</h2>
      ${s.body ? `<div class="body">${nl(s.body)}</div>` : ''}
      ${s.cta ? `<div class="cta"><span class="dotmark"></span>${esc(s.cta)}</div>` : ''}
    </div>` };
  }
  return { cls: 'dark', html: `
    <div class="idea">
      <div class="num"><span class="n">${esc(s.num)}</span><span class="bar"></span></div>
      <h2>${nl(s.title)}</h2>
      <div class="body">${nl(s.body)}</div>
    </div>` };
}

(async () => {
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1080 }, deviceScaleFactor: 1 });
  const total = deck.slides.length;

  for (let i = 0; i < total; i++) {
    const r = render(deck.slides[i], i, total);
    const isFollow = deck.slides[i].type === 'follow';
    const wm = (M.handle && !isFollow) ? `<div class="wm">${esc(M.handle)}</div>` : '';
    const html = `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head>
      <body style="--accent:${M.accent}"><div class="slide ${r.cls}">${r.html}${wm}</div></body></html>`;
    await page.setContent(html, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    const file = path.join(outDir, `slide-${String(i + 1).padStart(2, '0')}.png`);
    await page.locator('.slide').screenshot({ path: file });
    console.log('wrote', file);
  }
  await browser.close();
})();
