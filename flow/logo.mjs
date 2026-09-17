import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewportSize: { width: 1440, height: 400 } });
const mislukt = [];
p.on('requestfailed', r => mislukt.push(r.url().split('/').pop() + ' — ' + r.failure()?.errorText));
p.on('response', r => { if (r.status() >= 400) mislukt.push(r.status() + ' ' + r.url().split('/').pop()); });
await p.goto('http://localhost:8899/mockups/branche-defensie-v3.html');
await p.waitForTimeout(900);
const m = await p.evaluate(() => {
  const i = document.querySelector('header.main .merk img');
  if (!i) return { img: 'GEEN IMG-ELEMENT' };
  const s = getComputedStyle(i);
  return { src: i.getAttribute('src'), geladen: i.naturalWidth > 0,
           natuurlijk: i.naturalWidth + 'x' + i.naturalHeight,
           getoond: Math.round(i.getBoundingClientRect().width) + 'x' + Math.round(i.getBoundingClientRect().height),
           display: s.display, opacity: s.opacity, hoogte_css: s.height };
});
console.log(JSON.stringify(m, null, 1));
console.log(mislukt.length ? 'mislukt: ' + mislukt.join(', ') : 'alle verzoeken geslaagd');
await b.close();
