import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewportSize: { width: 1440, height: 1000 } });
const fouten = [], kapot = [];
p.on('pageerror', e => fouten.push(e.message));
p.on('response', r => { if (r.status() >= 400) kapot.push(r.url().split('/').pop()); });
await p.goto('http://localhost:8899/mockups/branche-defensie-v3.html');
await p.waitForTimeout(1200);

// verwachte bandbreedte per blok: te laag = ingestort, te hoog = opmaak weg
const grens = { kop4:[520,900], pluspunten:[30,70], statement:[400,760], klanten:[180,300],
  hangar:[300,600], eisen2:[700,1400], constructie:[850,1200], kisten:[600,900],
  spec2:[500,900], slot4:[500,900], uitleg:[400,700] };
const s = await p.evaluate(() => [...document.querySelectorAll('body > section')]
  .map(e => [e.className.split(' ')[0], Math.round(e.getBoundingClientRect().height)]));
let mis = 0;
for (const [k, h] of s) {
  const g = grens[k];
  const ok = g && h >= g[0] && h <= g[1];
  if (!ok) mis++;
  console.log(`  ${String(h).padStart(4)}px  ${k.padEnd(13)} ${ok ? '' : g ? '← buiten ' + g.join('-') : '← onbekend'}`);
}
const r = await p.evaluate(() => [['.kisten .vier',4],['.eisen2 .indeling',2],['.spec2 .raster',2],['.hangar .paneel',0]]
  .map(([sel,v]) => { const e=document.querySelector(sel); if(!e) return sel+': ONTBREEKT';
    const k=getComputedStyle(e).gridTemplateColumns.split(' ').filter(Boolean).length;
    const pos=getComputedStyle(e).position;
    return `${sel}: ${v?k+' kolommen':pos}${v&&k!==v?'  ← verwacht '+v:''}`; }));
console.log(); r.forEach(x => console.log('  ' + x));
console.log();
console.log(kapot.length ? '  ONTBREEKT: '+[...new Set(kapot)].join(', ') : '  geen 404s');
console.log(fouten.length ? '  JS-FOUTEN: '+fouten.join(' | ') : '  geen javascriptfouten');
console.log(mis ? `  ${mis} blok(ken) buiten bereik` : '  alle blokken binnen bereik');
await p.locator('.hangar').scrollIntoViewIfNeeded(); await p.waitForTimeout(400);
await p.screenshot({ path: process.argv[2] + '/na-herstel.png' });
await b.close();
