import { chromium } from 'playwright';
const b = await chromium.launch();
const kapot = [], fouten = [];
for (const pg of ['branche-defensie-v3', 'case-voor-v3', 'homepage-v2', 'shop-v1']) {
  const p = await b.newPage({ viewportSize: { width: 1440, height: 900 } });
  p.on('response', r => { if (r.status() >= 400) kapot.push(pg + ':' + r.url().split('/').pop()); });
  p.on('pageerror', e => fouten.push(pg + ': ' + e.message));
  await p.goto(`http://localhost:8899/mockups/${pg}.html`);
  await p.waitForTimeout(600);
  const n = await p.locator('footer.voet').count();
  const oud = await p.locator('footer:not(.voet)').count();
  console.log(pg.padEnd(22), '| nieuwe voet:', n, '| oude voet:', oud);
  if (pg === 'branche-defensie-v3') {
    await p.locator('footer.voet').scrollIntoViewIfNeeded();
    await p.waitForTimeout(400);
    await p.screenshot({ path: process.argv[2] + '/voet.png' });
  }
  await p.close();
}
console.log(kapot.length ? 'ONTBREEKT: ' + [...new Set(kapot)].join(', ') : 'geen 404s');
console.log(fouten.length ? 'JS-FOUTEN: ' + fouten.join(' | ') : 'geen javascriptfouten');
await b.close();
