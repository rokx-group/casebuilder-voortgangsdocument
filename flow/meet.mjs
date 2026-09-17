import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewportSize: { width: 1440, height: 950 } });
await p.goto('http://localhost:8899/mockups/branche-defensie-v3.html');
await p.waitForTimeout(800);
// waar zit de case écht, in de coördinaten van de svg?
const m = await p.evaluate(() => {
  const svg = document.querySelector('.lijnen'), img = document.querySelector('.stuk img');
  const r = svg.getBoundingClientRect(), s = img.getBoundingClientRect();
  const sx = 1200 / r.width, sy = 620 / r.height;
  const L = (s.left - r.left) * sx, R = (s.right - r.left) * sx;
  const T = (s.top - r.top) * sy, B = (s.bottom - r.top) * sy;
  // het masker toont een ellips van 60% x 58% rond het midden
  const cx = (L + R) / 2, cy = (T + B) / 2;
  return {
    vlak: [L, R, T, B].map(Math.round),
    midden: [Math.round(cx), Math.round(cy)],
    zichtbaar: { breedte: Math.round((R - L) * 0.60), hoogte: Math.round((B - T) * 0.58) },
  };
});
console.log(JSON.stringify(m));
await b.close();
