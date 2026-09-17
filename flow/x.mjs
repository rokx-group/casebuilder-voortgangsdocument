import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewportSize: { width: 1440, height: 1000 } });
await p.goto('http://localhost:8899/mockups/branche-defensie-v3.html');
await p.waitForTimeout(900);
await p.locator('.toneel').scrollIntoViewIfNeeded(); await p.waitForTimeout(500);
await p.screenshot({ path: process.argv[2] + '/lijnen.png' });
await b.close(); console.log('ok');
