#!/usr/bin/env node
/**
 * Bouwt de ontwerpweergave in index.html opnieuw op uit de mockups.
 *
 * De fasepagina toont per sjabloon een wireframe én het echte ontwerp. Dat
 * ontwerp is een ingesloten kopie van de mockups, met alle stijlregels
 * achter `.dv` gezet zodat ze niet lekken naar de fasepagina zelf.
 * Paginaspecifieke regels krijgen `.dv[data-page="…"]`.
 *
 * Zonder dit script moest die kopie met de hand worden nagetypt, en dan
 * loopt hij achter zodra het merk verandert — precies wat er gebeurd was:
 * de ingesloten weergave toonde nog de oude header van drie balken.
 *
 * Gebruik: node scripts/bouw-ontwerpweergave.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const wortel = join(dirname(fileURLToPath(import.meta.url)), "..");
const DOEL = join(wortel, "index.html");
const BRAND = join(wortel, "mockups/assets/brand.css");
const PAGINAS = [
  { naam: "categorie", bestand: "mockups/categorie.html" },
  { naam: "home", bestand: "mockups/homepage.html" },
];

/** Selectors die geen voorvoegsel krijgen maar een vervanging. */
const VERVANG = { ":root": "", body: "", html: null };

function voorvoeg(selectorlijst, wortelSel) {
  return selectorlijst
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => (s in VERVANG ? (VERVANG[s] === null ? null : wortelSel) : `${wortelSel} ${s}`))
    .filter(Boolean)
    .join(",");
}

/** Minimale CSS-herschrijver: comments eruit, elke selector achter de wortel. */
function schaalIn(css, wortelSel) {
  let rest = css.replace(/\/\*[\s\S]*?\*\//g, "");
  let uit = "";
  while (rest.length) {
    const haak = rest.indexOf("{");
    if (haak === -1) break;
    const kop = rest.slice(0, haak).trim();
    let diepte = 0;
    let i = haak;
    for (; i < rest.length; i++) {
      if (rest[i] === "{") diepte++;
      else if (rest[i] === "}" && --diepte === 0) break;
    }
    const body = rest.slice(haak + 1, i);
    rest = rest.slice(i + 1);
    if (!kop) continue;
    if (kop.startsWith("@media") || kop.startsWith("@supports")) {
      const binnen = schaalIn(body, wortelSel);
      if (binnen) uit += `${kop}{${binnen}}`;
    } else if (kop.startsWith("@")) {
      uit += `${kop}{${body}}`;
    } else {
      const sel = voorvoeg(kop, wortelSel);
      if (sel) uit += `${sel}{${body.trim()}}`;
    }
  }
  return uit;
}

function tussen(tekst, start, eind, wat) {
  const a = tekst.indexOf(start);
  const b = a === -1 ? -1 : tekst.indexOf(eind, a + start.length);
  if (a === -1 || b === -1) throw new Error(`${wat} niet gevonden`);
  return { a, b, inhoud: tekst.slice(a + start.length, b) };
}

let css = schaalIn(readFileSync(BRAND, "utf8"), ".dv");
const html = {};

for (const { naam, bestand } of PAGINAS) {
  const bron = readFileSync(join(wortel, bestand), "utf8");
  const wortelSel = `.dv[data-page="${naam}"]`;
  css += schaalIn(tussen(bron, "<style>", "</style>", `stijlblok in ${bestand}`).inhoud, wortelSel);
  html[naam] = tussen(bron, "<body>", "</body>", `body in ${bestand}`).inhoud.trim();
}

let doel = readFileSync(DOEL, "utf8");

const cssblok = tussen(doel, "/* @gegenereerd:ontwerpweergave-css */", "/* @einde:ontwerpweergave-css */", "CSS-markers");
doel =
  doel.slice(0, cssblok.a + "/* @gegenereerd:ontwerpweergave-css */".length) +
  "\n" + css + "\n  " +
  doel.slice(cssblok.b);

for (const { naam } of PAGINAS) {
  const start = `<!-- @gegenereerd:ontwerpweergave-html:${naam} -->`;
  const eind = `<!-- @einde:ontwerpweergave-html:${naam} -->`;
  const blok = tussen(doel, start, eind, `HTML-markers voor ${naam}`);
  doel = doel.slice(0, blok.a + start.length) + "\n" + html[naam] + "\n" + doel.slice(blok.b);
}

writeFileSync(DOEL, doel);
console.log(`ontwerpweergave bijgewerkt — ${css.length} tekens css, ${PAGINAS.length} pagina's`);
