import { chromium } from 'playwright';
const b = await chromium.launch();
const fouten = [], kapot = [];
for (const pg of ['branche-defensie-v3','case-voor-v3','homepage-v2','shop-v1','case-voor-gibson-les-paul-v2','case-aanvragen-v1']) {
  const p = await b.newPage({ viewportSize: { width: 1440, height: 800 } });
  p.on('pageerror', e => fouten.push(pg + ': ' + e.message));
  p.on('response', r => { const u = r.url(); if (r.status() >= 400 && u.includes('localhost')) kapot.push(pg + ':' + u.split('/').pop()); });
  await p.goto(`http://localhost:8899/mockups/${pg}.html`);
  await p.waitForTimeout(700);
  const m = await p.evaluate(() => {
    const i = document.querySelector('header.main .merk img');
    return { logo: i ? i.naturalWidth > 0 : false,
             megamenu: !!document.querySelector('nav.primary .megamenu'),
             voet: !!document.querySelector('footer.voet') };
  });
  console.log(`  ${pg.padEnd(30)} logo:${m.logo ? 'ok ' : 'FOUT'}  megamenu:${m.megamenu ? 'ok ' : 'FOUT'}  voet:${m.voet ? 'ok' : 'FOUT'}`);
  await p.close();
}
console.log();
console.log(kapot.length ? '  ONTBREEKT: ' + [...new Set(kapot)].join(', ') : '  geen 404s');
console.log(fouten.length ? '  JS-FOUTEN: ' + [...new Set(fouten)].join(' | ') : '  geen javascriptfouten');
await b.close();
