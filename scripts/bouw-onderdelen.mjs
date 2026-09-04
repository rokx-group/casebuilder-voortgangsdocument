#!/usr/bin/env node
/**
 * Zet header, nav en footer in elke mockup gelijk aan het gedeelde onderdeel.
 *
 * Deze drie blokken stonden 48 keer in de repo. Dat liep uiteen: zeven
 * verschillende headers, waarvan sommige het zoekveld als <form> en andere
 * als <div>, met twee verschillende placeholders. Niemand had dat besloten
 * — het gebeurde doordat elke nieuwe mockup van een bestaande werd gekopieerd.
 *
 * Waarom een build-stap en geen include: de mockups worden lokaal via
 * file:// geopend en beoordeeld. Daar blokkeert Chrome fetch(), dus een
 * partial die op het moment zelf wordt opgehaald is precies dán weg. De
 * bestanden blijven dus standalone; dit script schrijft ze bij.
 *
 * De CSS stond al in assets/brand.css en blijft daar — geen enkele mockup
 * schrijft er lokaal overheen (gecontroleerd, 0 van de 65).
 *
 * Het actieve navigatie-item blijft staan: welk item class="on" had, houdt
 * dat. Dat is het enige dat legitiem per pagina verschilt.
 *
 * Gebruik:  node scripts/bouw-onderdelen.mjs          (schrijft)
 *           node scripts/bouw-onderdelen.mjs --check  (meldt alleen)
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const wortel = join(dirname(fileURLToPath(import.meta.url)), "..");
const MAP = join(wortel, "mockups");
const alleenMelden = process.argv.includes("--check");

const ONDERDELEN = [
  { naam: "header", bestand: "onderdelen/header.html", patroon: /<header class="main">[\s\S]*?<\/header>/ },
  { naam: "nav",    bestand: "onderdelen/nav.html",    patroon: /<nav class="primary">[\s\S]*?<\/nav>/ },
  { naam: "footer", bestand: "onderdelen/footer.html", patroon: /<footer>[\s\S]*?<\/footer>/ },
];

for (const o of ONDERDELEN) o.inhoud = readFileSync(join(MAP, o.bestand), "utf8").trimEnd();

/** Welk navigatie-item is hier actief? Terug te vinden aan de linktekst. */
function actiefItem(nav) {
  const m = nav.match(/<a[^>]*class="[^"]*\bon\b[^"]*"[^>]*>([^<]+)<\/a>/);
  return m ? m[1] : null;
}

/** Zet class="on" op het item met deze tekst. */
function markeer(nav, tekst) {
  if (!tekst) return nav;
  return nav.replace(
    new RegExp(`(<a href="[^"]*")(>${tekst.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}</a>)`),
    '$1 class="on"$2'
  );
}

const bestanden = readdirSync(MAP)
  .filter((f) => f.endsWith(".html") && !f.endsWith("-varianten.html"))
  .sort();

let gewijzigd = 0, ongemoeid = 0;
const afwijkend = [];

for (const naam of bestanden) {
  const pad = join(MAP, naam);
  let s = readFileSync(pad, "utf8");
  const voor = s;

  for (const o of ONDERDELEN) {
    const m = s.match(o.patroon);
    if (!m) continue;
    const vervanging = o.naam === "nav" ? markeer(o.inhoud, actiefItem(m[0])) : o.inhoud;
    if (m[0] !== vervanging) afwijkend.push(`${naam} · ${o.naam}`);
    s = s.replace(o.patroon, () => vervanging);
  }

  if (s === voor) { ongemoeid++; continue; }
  gewijzigd++;
  if (!alleenMelden) writeFileSync(pad, s);
}

console.log(alleenMelden
  ? `${afwijkend.length} blokken wijken af in ${gewijzigd} bestanden (${ongemoeid} al gelijk)`
  : `${gewijzigd} bestanden bijgeschreven, ${ongemoeid} waren al gelijk`);
if (alleenMelden) for (const a of afwijkend.slice(0, 40)) console.log("   ", a);
