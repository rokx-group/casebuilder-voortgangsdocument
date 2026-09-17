import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewportSize: { width: 1440, height: 1000 } });
const fouten = [], kapot = [];
p.on('pageerror', e => fouten.push(e.message));
p.on('response', r => { const u=r.url(); if (r.status()>=400 && u.includes('localhost')) kapot.push(u.split('/').pop()); });
await p.goto('http://localhost:8899/mockups/branche-audio-visueel-v2.html');
await p.waitForTimeout(1200);
const grens = { kop4:[520,900], pluspunten:[30,70], statement:[400,760], klanten:[100,300],
  hangar:[300,600], eisen2:[700,1500], constructie:[850,1200], kisten:[600,900],
  spec2:[500,900], slot4:[500,900], uitleg:[350,700] };
const s = await p.evaluate(() => [...document.querySelectorAll('body > section')]
  .map(e => [e.className.split(' ')[0], Math.round(e.getBoundingClientRect().height)]));
let mis = 0;
for (const [k,h] of s) { const g=grens[k]; const ok=g&&h>=g[0]&&h<=g[1]; if(!ok)mis++;
  console.log(`  ${String(h).padStart(4)}px  ${k.padEnd(13)}${ok?'':g?'← buiten '+g.join('-'):'← onbekend'}`); }
const m = await p.evaluate(() => ({
  h1: document.querySelector('h1')?.textContent.trim().replace(/\s+/g,' '),
  logo: (()=>{const i=document.querySelector('header.main .merk img');return i?i.naturalWidth>0:false})(),
  voet: !!document.querySelector('footer.voet'), bron: !!document.querySelector('.beeldbron'),
  video: document.querySelector('.kop4 iframe')?.src.includes('6_GvJoC-Y24'),
}));
console.log(); console.log(' ', JSON.stringify(m));
console.log(kapot.length?'  ONTBREEKT: '+[...new Set(kapot)].join(', '):'  geen 404s');
console.log(fouten.length?'  JS-FOUTEN: '+fouten.join(' | '):'  geen javascriptfouten');
console.log(mis?`  ${mis} blok buiten bereik`:'  alle blokken binnen bereik');
await b.close();
