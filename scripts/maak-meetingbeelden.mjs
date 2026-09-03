#!/usr/bin/env node
/**
 * Snijdt de beelden voor de meetingtegels uit een mockup.
 *
 * De meetingpagina toont per gespreksonderwerp een uitsnede van het stuk
 * ontwerp waar het over gaat. Die uitsnedes met de hand maken loopt achter
 * zodra het ontwerp verandert — precies wat er met de ingesloten
 * ontwerpweergave gebeurd was. Dus: uit de mockup zelf, op commando.
 *
 * De uitsnedes worden niet op pixels vastgelegd maar op selectors. Hoogtes
 * hangen af van clamp(), regelafbreking en lettermetriek; die kun je niet
 * uit de HTML aflezen en ze verschuiven bij elke tekstwijziging.
 *
 * Gebruik: node scripts/maak-meetingbeelden.mjs
 *
 * Stuurt Chrome headless aan via het DevTools-protocol. Geen dependencies.
 */
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

const wortel = join(dirname(fileURLToPath(import.meta.url)), "..");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const POORT = 9334;
const BREEDTE = 1440, HOOGTE = 900;
const SCHAAL = 0.5; // 720px breed is ruim genoeg voor een tegel, ook op retina

const BRON = "mockups/homepage-v1.html";
const MAP = "mockups/assets/meeting-4sep";

/** Per meetingtegel: welk stuk pagina hoort erbij. `heel` = de hele pagina. */
const TEGELS = [
  { naam: "01-header",     selectors: ["header.main", "nav.primary"] },
  { naam: "02-hero",       selectors: [".hero", ".again"] },
  { naam: "03-ingangen",   selectors: ["section:has(.ingangen)"] },
  { naam: "04-modellen",   selectors: ["section.models"] },
  { naam: "05-vertrouwen", selectors: ["section.assure", "section.trust"] },
  { naam: "06-onderdelen", selectors: ["section.build", "section.closer"] },
  // Tegel 07 gaat over wat in geen enkel blok past. Daar hoort geen uitsnede bij:
  // de hele pagina als tegelbeeld is even hoog als de rest van de tab samen.
];

const METEN = (selectors) => `(() => {
  const sel = ${JSON.stringify(selectors)};
  const els = sel.map(s => document.querySelector(s));
  const mist = sel.filter((s, i) => !els[i]);
  if (mist.length) return { fout: 'niet gevonden: ' + mist.join(', ') };
  const rects = els.map(el => el.getBoundingClientRect());
  const top = Math.min(...rects.map(r => r.top)) + scrollY;
  const bot = Math.max(...rects.map(r => r.bottom)) + scrollY;
  return { y: Math.round(top), h: Math.round(bot - top) };
})()`;

async function verbind(url) {
  for (let poging = 0; poging < 50; poging++) {
    try {
      const r = await fetch(url);
      if (r.ok) return await r.json();
    } catch {}
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error("Chrome reageert niet op poort " + POORT);
}

function stuur(ws, id, method, params = {}) {
  return new Promise((klaar, fout) => {
    const luister = (ev) => {
      const bericht = JSON.parse(ev.data);
      if (bericht.id !== id) return;
      ws.removeEventListener("message", luister);
      bericht.error ? fout(new Error(bericht.error.message)) : klaar(bericht.result);
    };
    ws.addEventListener("message", luister);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

const chrome = spawn(CHROME, [
  "--headless=new", `--remote-debugging-port=${POORT}`, "--no-first-run",
  "--disable-gpu", "--hide-scrollbars", `--window-size=${BREEDTE},${HOOGTE}`,
  "about:blank",
], { stdio: "ignore" });

let id = 0;
try {
  await verbind(`http://127.0.0.1:${POORT}/json/version`);
  const tabs = await verbind(`http://127.0.0.1:${POORT}/json/list`);
  const tab = tabs.find((t) => t.type === "page");
  if (!tab) throw new Error("geen tabblad gevonden");
  const ws = new WebSocket(tab.webSocketDebuggerUrl);
  await new Promise((k, f) => { ws.onopen = k; ws.onerror = f; });

  await stuur(ws, ++id, "Page.enable");
  await stuur(ws, ++id, "Emulation.setDeviceMetricsOverride",
    { width: BREEDTE, height: HOOGTE, deviceScaleFactor: 1, mobile: false });
  await stuur(ws, ++id, "Page.navigate", { url: "file://" + resolve(wortel, BRON) });

  // wachten op de weblettertypen: die bepalen de regelafbreking en dus de hoogtes
  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 250));
    const { result } = await stuur(ws, ++id, "Runtime.evaluate",
      { expression: "document.readyState === 'complete' && document.fonts.status === 'loaded'", returnByValue: true });
    if (result.value) break;
  }
  // de versiebalk hoort bij de mockup, niet bij het ontwerp
  await stuur(ws, ++id, "Runtime.evaluate", {
    expression: "document.querySelectorAll('.versiebalk,.vouwlijn,.vouwmeet').forEach(el => el.remove())",
  });

  mkdirSync(join(wortel, MAP), { recursive: true });

  for (const tegel of TEGELS) {
    const { result } = await stuur(ws, ++id, "Runtime.evaluate",
      { expression: METEN(tegel.selectors), returnByValue: true });
    if (result.value.fout) throw new Error(`${tegel.naam}: ${result.value.fout}`);
    const { y, h } = result.value;
    const { data } = await stuur(ws, ++id, "Page.captureScreenshot", {
      format: "png",
      captureBeyondViewport: true,
      clip: { x: 0, y, width: BREEDTE, height: h, scale: SCHAAL },
    });
    const pad = join(MAP, tegel.naam + ".png");
    writeFileSync(join(wortel, pad), Buffer.from(data, "base64"));
    console.log(`   ${pad.padEnd(44)} ${BREEDTE}×${h} → ${Math.round(BREEDTE * SCHAAL)}×${Math.round(h * SCHAAL)}`);
  }
  ws.close();
} finally {
  chrome.kill();
}
