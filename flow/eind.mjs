import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewportSize: { width: 1440, height: 1000 } });
const fouten = [], kapot = [];
p.on('pageerror', e => fouten.push(e.message));
p.on('response', r => { if (r.status() >= 400) kapot.push(r.url().split('/').pop()); });
await p.goto('http://localhost:8899/mockups/branche-defensie-v3.html');
await p.waitForTimeout(1200);

const secties = await p.evaluate(() =>
  [...document.querySelectorAll('body > section, body > div.pluspunten')].map(e => ({
    klas: (e.className || '(geen)').split(' ')[0],
    h: Math.round(e.getBoundingClientRect().height),
  })));
secties.forEach(s => console.log(`  ${String(s.h).padStart(4)}px  ${s.klas}${s.h < 60 ? '   ← verdacht laag' : ''}`));

// zijn er lay-outs die per ongeluk in één kolom vallen?
const rasters = await p.evaluate(() =>
  [['.kisten .vier', 4], ['.eisen2 .indeling', 2], ['.spec2 .raster', 2], ['.pluspunten .wrap', 0]]
    .map(([sel, verwacht]) => {
      const e = document.querySelector(sel);
      if (!e) return sel + ': ONTBREEKT';
      const k = getComputedStyle(e).gridTemplateColumns.split(' ').filter(Boolean).length;
      return `${sel}: ${k} kolommen${verwacht && k !== verwacht ? '  ← verwacht ' + verwacht : ''}`;
    }));
console.log(); rasters.forEach(r => console.log('  ' + r));
console.log();
console.log(kapot.length ? '  ONTBREEKT: ' + [...new Set(kapot)].join(', ') : '  geen 404s');
console.log(fouten.length ? '  JS-FOUTEN: ' + fouten.join(' | ') : '  geen javascriptfouten');
await b.close();
