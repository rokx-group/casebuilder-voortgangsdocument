#!/usr/bin/env node
/**
 * Meet de sectiehoogtes van een mockup in een echte browser, op 1440 × 900.
 *
 * De wireframes noemen per sectie een hoogte in pagina-pixels. Die moeten uit
 * het ontwerp komen en niet uit een schatting: hoogtes hangen af van clamp(),
 * regelafbreking en lettermetriek, en dat kun je niet uit de HTML aflezen.
 *
 * Gebruik:  node scripts/meet-hoogtes.mjs mockups/homepage.html
 *           node scripts/meet-hoogtes.mjs            (alle mockups)
 *
 * Stuurt Chrome headless aan via het DevTools-protocol. Geen dependencies.
 */
import { spawn } from "node:child_process";
import { readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

const wortel = join(dirname(fileURLToPath(import.meta.url)), "..");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const POORT = 9333;
const BREEDTE = 1440, HOOGTE = 900;

const METEN = `(() => {
  const uit = [];
  for (const el of document.body.children) {
    if (el.tagName === 'SCRIPT' || el.classList.contains('vouwmeet') ||
        el.classList.contains('vouwlijn') || el.classList.contains('versiebalk')) continue;
    const r = el.getBoundingClientRect();
    if (!r.height) continue;
    let naam = el.tagName.toLowerCase();
    if (naam === 'div' || naam === 'section') {
      naam = [...el.classList].find(c => !/^(ruit|ruit-dark|ruit-veld|ruit-aanzet|beslag|tight|wrap)$/.test(c)) || naam;
    }
    uit.push({ naam, h: Math.round(r.height), top: Math.round(r.top + scrollY) });
  }
  return { secties: uit, totaal: Math.round(document.documentElement.scrollHeight) };
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

async function meet(ws, bestand) {
  const url = "file://" + resolve(wortel, bestand);
  let id = 0;
  await stuur(ws, ++id, "Page.enable");
  await stuur(ws, ++id, "Emulation.setDeviceMetricsOverride",
    { width: BREEDTE, height: HOOGTE, deviceScaleFactor: 1, mobile: false });
  await stuur(ws, ++id, "Page.navigate", { url });
  // wachten tot de weblettertypen geladen zijn — die bepalen de regelafbreking
  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 250));
    const { result } = await stuur(ws, ++id, "Runtime.evaluate",
      { expression: "document.readyState === 'complete' && document.fonts.status === 'loaded'", returnByValue: true });
    if (result.value) break;
  }
  const { result } = await stuur(ws, ++id, "Runtime.evaluate", { expression: METEN, returnByValue: true });
  return result.value;
}

const doelen = process.argv.slice(2).length
  ? process.argv.slice(2)
  : readdirSync(join(wortel, "mockups")).filter((f) => f.endsWith(".html")).map((f) => "mockups/" + f);

const chrome = spawn(CHROME, [
  "--headless=new", `--remote-debugging-port=${POORT}`, "--no-first-run",
  "--disable-gpu", "--hide-scrollbars", `--window-size=${BREEDTE},${HOOGTE}`,
  "about:blank",
], { stdio: "ignore" });

try {
  // Het browser-eindpunt kent Page.* niet; we hebben een tabblad nodig.
  await verbind(`http://127.0.0.1:${POORT}/json/version`);
  const tabs = await verbind(`http://127.0.0.1:${POORT}/json/list`);
  const tab = tabs.find((t) => t.type === "page");
  if (!tab) throw new Error("geen tabblad gevonden om in te meten");
  const ws = new WebSocket(tab.webSocketDebuggerUrl);
  await new Promise((k, f) => { ws.onopen = k; ws.onerror = f; });

  for (const doel of doelen) {
    const { secties, totaal } = await meet(ws, doel);
    console.log(`\n── ${doel} · ${BREEDTE} × ${HOOGTE} · totaal ${totaal}px`);
    for (const s of secties) {
      const vouw = s.top < HOOGTE && s.top + s.h > HOOGTE ? "  ← de vouw loopt hier doorheen" : "";
      console.log(`   --h:${String(s.h).padEnd(5)} ${s.naam.padEnd(22)} op ${String(s.top).padEnd(6)}${vouw}`);
    }
  }
  ws.close();
} finally {
  chrome.kill();
}
