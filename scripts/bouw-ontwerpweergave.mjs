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
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { basename, dirname, join } from "node:path";

const wortel = join(dirname(fileURLToPath(import.meta.url)), "..");
const DOEL = join(wortel, "index.html");
const BRAND = join(wortel, "mockups/assets/brand.css");
const PAGINAS = [
  { naam: "categorie", bestand: "mockups/categorie.html", overslaan: ["v1"] },
  // v1 is overal de wireframe, geen ontwerp — die slaan we over.
  { naam: "home", bestand: "mockups/homepage.html", overslaan: ["v1"] },
  { naam: "onderdeel", bestand: "mockups/onderdeel.html", overslaan: ["v1"] },
  { naam: "casetype", bestand: "mockups/casetype.html", overslaan: ["v1"] },
  { naam: "overzicht", bestand: "mockups/flightcases.html", overslaan: ["v1"] },
  { naam: "case-voor-categorie", bestand: "mockups/case-voor-gitaar.html", overslaan: ["v1"] },
  { naam: "case-voor-resultaat", bestand: "mockups/case-voor-gibson-les-paul.html", overslaan: ["v1"] },
  { naam: "servicehub", bestand: "mockups/service.html", overslaan: ["v1"] },
  { naam: "content", bestand: "mockups/service-levertijden.html", overslaan: ["v1"] },
  { naam: "zoekresultaat", bestand: "mockups/zoeken.html", overslaan: ["v1"] },
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
      // Een @media kijkt naar het browservenster, maar de ingesloten
      // weergave staat in een kolom die veel smaller is. Zuiver op breedte
      // gebaseerde queries worden daarom container queries, zodat de
      // mockup zich gedraagt naar de ruimte die hij hier echt krijgt.
      const alleenBreedte = /^@media\s*\(\s*(?:max|min)-width[^()]*\)\s*$/.test(kop);
      if (binnen) uit += `${alleenBreedte ? kop.replace(/^@media\s*/, "@container ") : kop}{${binnen}}`;
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

/**
 * Varianten: naast `homepage.html` mag `homepage-v2.html` bestaan. Die wordt
 * automatisch opgepikt en krijgt een eigen blok, zodat twee versies van
 * hetzelfde sjabloon naast elkaar te bekijken zijn zonder dat de een de ander
 * overschrijft. Handig als er aan twee versies tegelijk gewerkt wordt.
 */
function variantenVan(bestand) {
  const map = join(wortel, dirname(bestand));
  const stam = basename(bestand, ".html");
  const uit = [{ id: "v1", bestand }];
  for (const naam of readdirSync(map).sort()) {
    const m = naam.match(new RegExp(`^${stam}-v(\\d+)\\.html$`));
    if (m) uit.push({ id: `v${m[1]}`, bestand: `${dirname(bestand)}/${naam}` });
  }
  return uit;
}

for (const { naam, bestand, overslaan = [] } of PAGINAS) {
  for (const variant of variantenVan(bestand)) {
    if (overslaan.includes(variant.id)) continue;
    const sleutel = variant.id === "v1" ? naam : `${naam}-${variant.id}`;
    const bron = readFileSync(join(wortel, variant.bestand), "utf8");
    const wortelSel = `.dv[data-page="${sleutel}"]`;
    css += schaalIn(tussen(bron, "<style>", "</style>", `stijlblok in ${variant.bestand}`).inhoud, wortelSel);
    // Het meetlint hoort bij de losse mockup, niet bij de ingesloten kopie.
    html[sleutel] = tussen(bron, "<body>", "</body>", `body in ${variant.bestand}`).inhoud
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "")
      .trim();
  }
}

let doel = readFileSync(DOEL, "utf8");

const cssblok = tussen(doel, "/* @gegenereerd:ontwerpweergave-css */", "/* @einde:ontwerpweergave-css */", "CSS-markers");
doel =
  doel.slice(0, cssblok.a + "/* @gegenereerd:ontwerpweergave-css */".length) +
  "\n" + css + "\n  " +
  doel.slice(cssblok.b);

for (const sleutel of Object.keys(html)) {
  const start = `<!-- @gegenereerd:ontwerpweergave-html:${sleutel} -->`;
  const eind = `<!-- @einde:ontwerpweergave-html:${sleutel} -->`;
  // Een variant mag bestaan zonder dat er al een plek voor is in index.html.
  if (!doel.includes(start)) {
    console.log(`  overgeslagen: ${sleutel} — nog geen plek in index.html`);
    continue;
  }
  const blok = tussen(doel, start, eind, `HTML-markers voor ${sleutel}`);
  doel = doel.slice(0, blok.a + start.length) + "\n" + html[sleutel] + "\n" + doel.slice(blok.b);
}

writeFileSync(DOEL, doel);
console.log(`ontwerpweergave bijgewerkt — ${css.length} tekens css, ${PAGINAS.length} pagina's`);
