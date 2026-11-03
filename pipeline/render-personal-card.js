// Divine Egyabeng personal LinkedIn card, 1080x1080
// usage: node render-personal-card.js card.json out.png
const fs = require('fs');
const { chromium } = require('playwright');

const cardPath = process.argv[2];
const outPath = process.argv[3] || 'out.png';
const c = JSON.parse(fs.readFileSync(cardPath, 'utf8'));

const esc = s => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const nl = s => esc(s).replace(/\n/g, '<br>');

const NAVY = '#0D2E7A';
const GOLD = '#E9A338';
const LIGHT = '#F2F4F9';

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1080px;height:1080px}
body{font-family:'Inter',sans-serif;-webkit-font-smoothing:antialiased;overflow:hidden}
.card{position:relative;width:1080px;height:1080px;overflow:hidden;display:flex;background:${LIGHT}}
.left{width:598px;flex:0 0 598px;background:${NAVY};padding:118px 56px 70px 62px;
  display:flex;flex-direction:column;position:relative}
.left:after{content:'';position:absolute;left:0;top:0;bottom:0;width:10px;background:${GOLD}}
.kicker{font-size:19px;font-weight:800;letter-spacing:.17em;text-transform:uppercase;
  color:${GOLD};margin-bottom:34px}
h1{font-size:${c.size || 58}px;line-height:1.08;letter-spacing:-.032em;font-weight:800;color:#fff}
h1 .ac{color:${GOLD}}
.sub{margin-top:30px;font-size:25px;line-height:1.5;font-weight:450;color:rgba(255,255,255,.88)}
.cta{margin-top:auto;padding-top:38px;font-size:24px;line-height:1.42;font-weight:700;color:#fff;
  border-top:3px solid rgba(233,163,56,.55);padding-top:30px}
.right{flex:1;position:relative;padding:62px 46px;display:flex;align-items:center;justify-content:center}
.right:before{content:'';position:absolute;inset:0;
  background:radial-gradient(circle at 70% 24%, rgba(13,46,122,.09), rgba(13,46,122,0) 62%)}
.vis{position:relative;width:100%}
.handle{position:absolute;right:42px;bottom:34px;font-size:20px;font-weight:700;
  letter-spacing:.02em;color:rgba(13,46,122,.52);z-index:9}

/* reusable mockup pieces */
.phone{width:386px;margin:0 auto;background:#fff;border-radius:34px;overflow:hidden;
  border:3px solid #d8ddea;box-shadow:0 26px 54px rgba(13,46,122,.20)}
.thread-head{background:#fff;border-bottom:2px solid #e8ebf3;padding:20px 22px;
  display:flex;align-items:center;gap:13px}
.thread-head .av{width:46px;height:46px;border-radius:50%;background:${NAVY};flex:0 0 46px;
  display:flex;align-items:center;justify-content:center;color:#fff;font-size:17px;font-weight:800}
.thread-head .nm{font-size:19px;font-weight:800;color:#13203c;line-height:1.2}
.thread-head .hd{font-size:15px;font-weight:600;color:#8b93a8;margin-top:3px}
.msgs{padding:22px 20px 26px;background:#f7f8fc;display:flex;flex-direction:column;gap:14px}
.bub{max-width:88%;padding:15px 17px;border-radius:18px;font-size:17px;line-height:1.42;
  background:#fff;color:#1b2440;border:2px solid #e6eaf4;border-bottom-left-radius:6px}
.bub.me{align-self:flex-end;background:${NAVY};color:#fff;border-color:${NAVY};
  border-bottom-left-radius:18px;border-bottom-right-radius:6px}
.fake{border-color:#E9A338;background:#fffaf1}
.lnk{color:#1a56c4;text-decoration:underline;word-break:break-all}
.flag{display:inline-flex;align-items:center;gap:8px;margin-top:11px;padding:7px 12px;
  border-radius:999px;background:${GOLD};color:#2a1b02;font-size:14px;font-weight:800;
  letter-spacing:.01em}
${c.css || ''}
</style></head><body>
<div class="card">
  <div class="left">
    ${c.kicker ? `<div class="kicker">${esc(c.kicker)}</div>` : ''}
    <h1>${nl(c.headline)}${c.headlineAccent ? ` <span class="ac">${nl(c.headlineAccent)}</span>` : ''}</h1>
    ${c.sub ? `<div class="sub">${nl(c.sub)}</div>` : ''}
    ${c.cta ? `<div class="cta">${nl(c.cta)}</div>` : ''}
  </div>
  <div class="right">
    <div class="vis">${c.visual || ''}</div>
    <div class="handle">@divine_egyabeng</div>
  </div>
</div></body></html>`;

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1080 }, deviceScaleFactor: 1 });
  await p.setContent(html, { waitUntil: 'load' });
  await p.screenshot({ path: outPath });
  await b.close();
  console.log('wrote', outPath);
})();
