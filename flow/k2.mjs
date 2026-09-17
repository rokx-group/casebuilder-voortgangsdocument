import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewportSize: { width: 1440, height: 1000 } });
const fouten = []; p.on('pageerror', e => fouten.push(e.message));
await p.goto('http://localhost:8899/mockups/branche-defensie-v3.html');
await p.waitForTimeout(900);
const m = await p.evaluate(() => {
  const v = document.querySelector('.kisten .vier');
  const k = [...document.querySelectorAll('.kisten .kist')].map(e => Math.round(e.getBoundingClientRect().top));
  return { kolommen: v ? getComputedStyle(v).gridTemplateColumns.split(' ').length : 0,
           zelfde_rij: new Set(k).size === 1, aantal: k.length };
});
console.log(JSON.stringify(m));
await p.locator('.kisten').scrollIntoViewIfNeeded(); await p.waitForTimeout(500);
await p.screenshot({ path: process.argv[2] + '/kisten3.png' });
console.log(fouten.length ? 'JS-FOUTEN: ' + fouten.join(' | ') : 'geen javascriptfouten');
await b.close();
