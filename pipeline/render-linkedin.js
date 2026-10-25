// CyberWatch AI LinkedIn featured image, 1200x627
// usage: node render-linkedin.js card.json out.png
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const cardPath = process.argv[2];
const outPath = process.argv[3] || 'out.png';
const c = JSON.parse(fs.readFileSync(cardPath, 'utf8'));

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

const NAVY = c.navy || '#0D2E7A';
const INK = c.ink || '#071024';
const ACCENT = c.accent || '#4D8DFF';
const photo = dataUri(c.photo);

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1200px;height:627px}
body{font-family:'Inter',sans-serif;-webkit-font-smoothing:antialiased;overflow:hidden}
.card{position:relative;width:1200px;height:627px;overflow:hidden;background:${INK}}
.photo{position:absolute;top:0;bottom:0;right:0;width:520px;z-index:0;
  background-image:url('${photo || ''}');background-size:cover;
  background-position:${c.photoFocus || 'center'};
  filter:saturate(.55) contrast(1.06) brightness(.85)}
.tint{position:absolute;top:0;bottom:0;right:0;width:520px;z-index:1;
  background:linear-gradient(180deg, rgba(13,46,122,.52), rgba(7,16,36,.62))}
.panel{position:absolute;top:0;bottom:0;left:0;width:760px;z-index:2;
  background:linear-gradient(135deg, ${NAVY} 0%, ${INK} 78%)}
.feather{position:absolute;top:0;bottom:0;left:700px;width:190px;z-index:3;
  background:linear-gradient(90deg, ${INK} 0%, rgba(7,16,36,.88) 38%, rgba(7,16,36,.45) 70%, rgba(7,16,36,0) 100%)}
.edge{position:absolute;top:0;bottom:0;left:0;width:8px;z-index:6;background:${ACCENT}}
.brand{position:absolute;z-index:5;left:72px;top:62px;display:flex;align-items:center;gap:14px}
.mark{width:30px;height:30px;border-radius:8px;border:2.5px solid ${ACCENT};
  display:flex;align-items:center;justify-content:center}
.mark i{width:10px;height:10px;border-radius:50%;background:${ACCENT};display:block}
.brand .wm{font-size:17px;font-weight:700;letter-spacing:.17em;color:#fff;text-transform:uppercase}
.body{position:absolute;z-index:5;left:72px;top:168px;width:580px}
h1{font-size:${c.size || 52}px;line-height:1.08;letter-spacing:-.032em;font-weight:800;color:#fff}
h1 .ac{color:${ACCENT}}
.sub{margin-top:24px;font-size:21px;line-height:1.45;font-weight:400;
  color:rgba(255,255,255,.70);max-width:520px}
.foot{position:absolute;z-index:5;left:72px;bottom:60px;display:flex;align-items:center;gap:16px;
  font-size:16px;font-weight:600;letter-spacing:.04em;color:rgba(255,255,255,.80)}
.foot .bar{width:40px;height:2px;background:${ACCENT}}
</style></head><body>
<div class="card">
  <div class="photo"></div><div class="tint"></div>
  <div class="panel"></div><div class="feather"></div><div class="edge"></div>
  <div class="brand"><span class="mark"><i></i></span><span class="wm">CyberWatch AI</span></div>
  <div class="body">
    <h1>${nl(c.headline)}${c.headlineAccent ? ` <span class="ac">${nl(c.headlineAccent)}</span>` : ''}</h1>
    ${c.sub ? `<div class="sub">${nl(c.sub)}</div>` : ''}
  </div>
  <div class="foot"><span class="bar"></span><span>${esc(c.foot || 'cyberwatchai.com')}</span></div>
</div></body></html>`;

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 627 }, deviceScaleFactor: 2 });
  await p.setContent(html, { waitUntil: 'load' });
  await p.screenshot({ path: outPath });
  await b.close();
  console.log('wrote', outPath);
})();
