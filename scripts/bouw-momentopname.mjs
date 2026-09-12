#!/usr/bin/env node
/**
 * Maakt momentopnames van mockups die hun inhoud met een script opbouwen.
 *
 * De ingesloten ontwerpweergave in index.html neemt alleen HTML en CSS mee.
 * Dat gaat goed zolang een mockup in zijn HTML staat, maar de shop maakt zijn
 * tabbladen, filters en vijfenvijftig kaarten uit een array in een script.
 * In de weergave stond die pagina daardoor leeg: "0 cases", geen tabbladen.
 * Dat is erger dan een ruw ontwerp, want het ziet er af uit en klopt niet.
 *
 * Dit script opent elke mockup in een kop-loze browser, laat de scripts hun
 * werk doen, en schrijft de uitgewerkte DOM weg in mockups/momentopnames/.
 * De generator gebruikt die als hij bestaat.
 *
 * Waarom een apart script en niet in de generator:
 * - de generator moet blijven draaien zonder browser, ook op Windows;
 * - de momentopname gaat mee in de repo, dus iedereen bouwt hetzelfde
 *   document, of hij nu Chrome heeft of niet.
 *
 * Elke momentopname draagt de vingerafdruk van zijn bron. Verandert de
 * mockup of het script erachter, dan zegt de generator dat de momentopname
 * verouderd is in plaats van stilletjes iets ouds te tonen.
 *
 * Gebruik: node scripts/bouw-momentopname.mjs [naam ...]
 *   zonder naam: alle sjablonen langs. Met naam: alleen wat daarop lijkt.
 */
import { spawn } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { basename, dirname, join } from "node:path";
import { platform, env, argv } from "node:process";
import { PAGINAS, variantenVan, vingerafdruk, tussen, MOMENTOPNAMEN, MOMENTKOP } from "./bouw-ontwerpweergave.mjs";

const wortel = join(dirname(fileURLToPath(import.meta.url)), "..");
const POORT = 9222 + (process.pid % 300);

/* Genoeg verschil om een momentopname te rechtvaardigen. Elke pagina heeft
   wel íets van een script (de versiebalk, het meetlint), dus een paar
   elementen erbij zegt niets; een kwart erbij wel. */
const DREMPEL = 1.25;

function chromePad() {
  if (env.CHROME_PATH) return env.CHROME_PATH;
  const kandidaten = {
    darwin: [
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      "/Applications/Chromium.app/Contents/MacOS/Chromium",
    ],
    win32: [
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
      "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    ],
    linux: ["/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser"],
  }[platform] || [];
  const gevonden = kandidaten.find((p) => existsSync(p));
  if (!gevonden) {
    throw new Error(
      "geen Chrome gevonden. Zet het pad in CHROME_PATH, bijvoorbeeld:\n" +
      "  CHROME_PATH='/pad/naar/chrome' node scripts/bouw-momentopname.mjs"
    );
  }
  return gevonden;
}

async function haal(url) {
  for (let i = 0; i < 100; i++) {
    try { const r = await fetch(url); if (r.ok) return await r.json(); } catch { /* nog niet op */ }
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error("de browser reageert niet");
}

function stuur(ws, id, methode, params = {}) {
  return new Promise((klaar, faal) => {
    const tijd = setTimeout(() => faal(new Error(`geen antwoord op ${methode}`)), 60000);
    const luister = (e) => {
      const bericht = JSON.parse(e.data);
      if (bericht.id !== id) return;
      clearTimeout(tijd);
      ws.removeEventListener("message", luister);
      bericht.error ? faal(new Error(bericht.error.message)) : klaar(bericht.result);
    };
    ws.addEventListener("message", luister);
    ws.send(JSON.stringify({ id, method: methode, params }));
  });
}

const wacht = (ms) => new Promise((r) => setTimeout(r, ms));

/* In de browser: de uitgewerkte DOM, zonder wat bij de losse mockup hoort.
   De versiebalk en het meetlint zijn hulpmiddelen voor ons, geen ontwerp. */
const UITLEZEN = `(() => {
  const kopie = document.body.cloneNode(true);
  for (const weg of kopie.querySelectorAll('script,.versiebalk,.meetlint,#meetlint')) weg.remove();
  return JSON.stringify({
    html: kopie.innerHTML,
    elementen: document.body.querySelectorAll('*').length,
    fouten: (window.__momentfouten || []).slice(0, 3),
  });
})()`;

/** Ruwe telling van de elementen die al in de bron staan. De generator
    knipt de body op dezelfde manier uit, ook als er attributen op staan. */
function elementenInBron(bestand) {
  const bron = readFileSync(join(wortel, bestand), "utf8");
  const lijf = tussen(bron, "<body>", "</body>", `body in ${bestand}`).inhoud;
  return (lijf.match(/<(?!\/|!)[a-zA-Z]/g) || []).length;
}

const filters = argv.slice(2);
const bestanden = [];
for (const { naam, bestand, overslaan = [] } of PAGINAS) {
  for (const variant of variantenVan(bestand, naam)) {
    if (overslaan.includes(variant.id)) continue;
    if (filters.length && !filters.some((f) => variant.bestand.includes(f))) continue;
    bestanden.push({ sleutel: `${naam}-${variant.id}`, bestand: variant.bestand });
  }
}

const chrome = spawn(chromePad(), [
  "--headless=new", `--remote-debugging-port=${POORT}`, "--no-first-run",
  "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=1",
  "--window-size=1440,1000", "about:blank",
], { stdio: "ignore" });

let id = 0;
const geschreven = [];
const overgeslagen = [];
try {
  await haal(`http://127.0.0.1:${POORT}/json/version`);
  const tab = (await haal(`http://127.0.0.1:${POORT}/json/list`)).find((t) => t.type === "page");
  const ws = new WebSocket(tab.webSocketDebuggerUrl);
  await new Promise((k) => ws.addEventListener("open", k, { once: true }));
  await stuur(ws, ++id, "Page.enable");

  mkdirSync(MOMENTOPNAMEN, { recursive: true });

  for (const { sleutel, bestand } of bestanden) {
    await stuur(ws, ++id, "Page.navigate", { url: `file://${join(wortel, bestand)}` });
    await wacht(1600);
    // De lettertypen bepalen de opmaak, niet de DOM, maar wachten erop
    // voorkomt dat een script meet voordat het iets te meten heeft.
    await stuur(ws, ++id, "Runtime.evaluate", { expression: "document.fonts.ready", awaitPromise: true });
    await wacht(500);
    const uit = JSON.parse(
      (await stuur(ws, ++id, "Runtime.evaluate", { expression: UITLEZEN, returnByValue: true })).result.value
    );

    const pad = join(MOMENTOPNAMEN, basename(bestand));
    const inBron = elementenInBron(bestand);
    if (uit.elementen < inBron * DREMPEL) {
      // Deze pagina staat in zijn eigen HTML; een momentopname zou alleen
      // een tweede kopie zijn die kan gaan afwijken.
      if (existsSync(pad)) { rmSync(pad); overgeslagen.push(`${sleutel} (momentopname niet meer nodig, verwijderd)`); }
      else overgeslagen.push(`${sleutel} (${uit.elementen} elementen, staat in de HTML)`);
      continue;
    }
    writeFileSync(pad, `${MOMENTKOP(bestand, vingerafdruk(bestand))}\n${uit.html.trim()}\n`);
    geschreven.push(`${sleutel}: ${inBron} → ${uit.elementen} elementen`);
  }
  ws.close();
} finally {
  chrome.kill();
}

for (const r of geschreven) console.log(`  momentopname: ${r}`);
for (const r of overgeslagen) console.log(`  overgeslagen: ${r}`);
// Een momentopname van een mockup die niet meer bestaat, blijft anders staan.
for (const naam of existsSync(MOMENTOPNAMEN) ? readdirSync(MOMENTOPNAMEN) : []) {
  if (!bestanden.some((b) => basename(b.bestand) === naam) && !filters.length) {
    rmSync(join(MOMENTOPNAMEN, naam));
    console.log(`  opgeruimd: ${naam} hoort bij geen sjabloon meer`);
  }
}
console.log(`${geschreven.length} momentopnames, ${overgeslagen.length} overgeslagen`);
