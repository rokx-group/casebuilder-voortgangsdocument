import { chromium } from 'playwright';
const b = await chromium.launch();
const kapot = [], fouten = [];
for (const pg of ['case-voor-v3', 'shop-v1', 'homepage-v2', 'branche-defensie-v3']) {
  const p = await b.newPage({ viewportSize: { width: 1440, height: 900 } });
  p.on('response', r => { if (r.status() >= 400) kapot.push(pg + ': ' + r.url().split('/').pop()); });
  p.on('pageerror', e => fouten.push(pg + ': ' + e.message));
  await p.goto(`http://localhost:8899/mockups/${pg}.html`);
  await p.waitForTimeout(700);
  if (await p.locator('.vervoer-knop').count()) {
    await p.click('.vervoer-knop');
    await p.fill('.vervoer-veld input', 'les paul');
    await p.waitForTimeout(350);
  }
  const n = await p.locator('.vervoer-lijst li').count();
  console.log(pg.padEnd(22), '| suggesties:', n);
  await p.close();
}
console.log(kapot.length ? 'KAPOT: ' + [...new Set(kapot)].join(', ') : 'geen 404s meer');
console.log(fouten.length ? 'JS-FOUTEN: ' + fouten.join(' | ') : 'geen javascriptfouten');
await b.close();
