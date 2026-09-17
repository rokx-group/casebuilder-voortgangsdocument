import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewportSize: { width: 1440, height: 900 } });
await p.goto('http://localhost:8899/mockups/branche-audio-visueel-v2.html');
await p.waitForTimeout(3000);
await p.screenshot({ path: process.argv[2] + '/av-hero.png' });
await p.locator('.eisen2').scrollIntoViewIfNeeded(); await p.waitForTimeout(500);
await p.screenshot({ path: process.argv[2] + '/av-eisen.png' });
await b.close(); console.log('ok');
