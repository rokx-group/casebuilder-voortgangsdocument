import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewportSize: { width: 1440, height: 1000 } });
const fouten = []; p.on('pageerror', e => fouten.push(e.message));
await p.goto('http://localhost:8899/mockups/branche-defensie-v3.html');
await p.waitForTimeout(900);
const m = await p.evaluate(() => {
  const h = (s) => { const e = document.querySelector(s); return e ? Math.round(e.getBoundingClientRect().height) : null; };
  return { toneel: h('.toneel'), constructie: h('.constructie'), stuk: h('.stuk'), schaduw: h('.constructie .schaduw') };
});
console.log(JSON.stringify(m));
await p.locator('.toneel').scrollIntoViewIfNeeded(); await p.waitForTimeout(500);
await p.screenshot({ path: process.argv[2] + '/lijnen.png' });
console.log(fouten.length ? 'JS-FOUTEN: ' + fouten.join(' | ') : 'geen javascriptfouten');
await b.close();
