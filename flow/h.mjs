import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewportSize: { width: 1440, height: 900 } });
const fouten = []; p.on('pageerror', e => fouten.push(e.message));
await p.goto('http://localhost:8899/mockups/branche-audio-visueel-v2.html');
await p.waitForTimeout(1200);
const m = await p.evaluate(() => {
  const i = document.querySelector('.kop4 .beeldvlak img');
  return { foto: i ? i.naturalWidth > 0 : false, iframe: document.querySelectorAll('.kop4 iframe').length,
           hoogte: Math.round(document.querySelector('.kop4').getBoundingClientRect().height),
           bron: !!document.querySelector('.beeldbron') };
});
console.log(JSON.stringify(m));
await p.screenshot({ path: process.argv[2] + '/av-hero2.png' });
console.log(fouten.length ? 'JS-FOUTEN: ' + fouten.join(' | ') : 'geen javascriptfouten');
await b.close();
