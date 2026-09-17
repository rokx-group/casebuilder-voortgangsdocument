import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewportSize: { width: 1440, height: 900 } });
const fouten = []; p.on('pageerror', e => fouten.push(e.message));
await p.goto('http://localhost:8899/mockups/branche-defensie-v2.html');
await p.waitForTimeout(700);
for (const [naam, sel] of [['werkplaatsband', '.band'], ['uitspraak', '.uitspraak']]) {
  const el = p.locator(sel).first();
  await el.scrollIntoViewIfNeeded();
  await p.waitForTimeout(400);
  const box = await el.boundingBox();
  console.log(naam.padEnd(16), '|', box ? Math.round(box.width) + ' x ' + Math.round(box.height) : '?');
  await p.screenshot({ path: `${process.argv[2]}/${naam}.png` });
}
console.log(fouten.length ? 'JS-FOUTEN: ' + fouten.join(' | ') : 'geen javascriptfouten');
await b.close();
