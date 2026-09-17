import { chromium } from 'playwright';
const U = 'https://flow--casebuilder-voortgangsdocument.netlify.app/mockups/';
const b = await chromium.launch();
const fouten = [];

async function loop(term) {
  const p = await b.newPage({ viewportSize: { width: 1440, height: 900 } });
  p.on('pageerror', e => fouten.push(`${term}: ${e.message}`));
  await p.goto(U + 'case-voor-v3');
  await p.click('.vervoer-knop');
  await p.fill('.vervoer-veld input', term);
  await p.waitForTimeout(400);
  await p.keyboard.press('Enter');
  await p.waitForTimeout(900);
  const waar = p.url().split('/mockups/')[1]?.split('?')[0] ?? p.url();
  const opgevangen = await p.locator('.ontvangst .wat').count()
    ? (await p.textContent('.ontvangst .wat'))?.trim()
    : (await p.locator('[data-vervoeren]').count() ? 'veld ingevuld' : '—');
  console.log(`"${term}"`.padEnd(26) + '→ ' + waar.padEnd(34) + '| ' + opgevangen);
  await p.close();
}

for (const t of ['f16 vleugel','straaljager','nachtkijker','gitaarcase','les paul',
                 'oscilloscoop','moving head','maquette','ik zoek een case voor een drone','qqzz'])
  await loop(t);

console.log('\n' + (fouten.length ? 'JS-FOUTEN:\n' + fouten.join('\n') : 'geen javascriptfouten op de hele doorloop'));
await b.close();
