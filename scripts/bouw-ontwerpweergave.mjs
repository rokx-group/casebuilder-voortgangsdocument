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
  { naam: "categorie", bestand: "mockups/categorie.html", overslaan: ["wireframe"] },
  // De wireframe is geen ontwerp; die slaan we hier over.
  { naam: "home", bestand: "mockups/homepage.html", overslaan: ["wireframe"] },
  { naam: "onderdeel", bestand: "mockups/onderdeel.html", overslaan: ["wireframe"] },
  { naam: "casetype", bestand: "mockups/casetype.html", overslaan: ["wireframe"] },
  { naam: "overzicht", bestand: "mockups/flightcases.html", overslaan: ["wireframe"] },
  { naam: "case-voor-categorie", bestand: "mockups/case-voor-gitaar.html", overslaan: ["wireframe"] },
  { naam: "case-voor-resultaat", bestand: "mockups/case-voor-gibson-les-paul.html", overslaan: ["wireframe"] },
  { naam: "servicehub", bestand: "mockups/service.html", overslaan: ["wireframe"] },
  { naam: "content", bestand: "mockups/service-levertijden.html", overslaan: ["wireframe"] },
  { naam: "zoekresultaat", bestand: "mockups/zoeken.html", overslaan: ["wireframe"] },
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
  // <body> mag attributen dragen (bijv. data-film op de videovarianten);
  // zoek daarom op de opening en spring naar het sluitende haakje.
  let a = tekst.indexOf(start);
  if (a === -1 && start === "<body>") {
    const m = tekst.match(/<body\b[^>]*>/);
    if (m) {
      const b0 = tekst.indexOf(eind, m.index + m[0].length);
      if (b0 !== -1) return { a: m.index, b: b0, inhoud: tekst.slice(m.index + m[0].length, b0) };
    }
  }
  const b = a === -1 ? -1 : tekst.indexOf(eind, a + start.length);
  if (a === -1 || b === -1) throw new Error(`${wat} niet gevonden`);
  return { a, b, inhoud: tekst.slice(a + start.length, b) };
}

let css = schaalIn(readFileSync(BRAND, "utf8"), ".dv");
const html = {};

/**
 * Varianten: naast `homepage.html` mag `homepage-v6.html` bestaan. Die wordt
 * automatisch opgepikt en krijgt een eigen blok, zodat twee versies van
 * hetzelfde sjabloon naast elkaar te bekijken zijn zonder dat de een de ander
 * overschrijft. Handig als er aan twee versies tegelijk gewerkt wordt.
 */
/* Sommige ontwerpen zijn op een vast raster getekend en breken in de
   ingesloten weergave, die smaller is dan een venster. Die tonen we
   niet verkleind maar alleen als wireframe, met de knop naar het
   volledige scherm — een kapot ontwerp beoordeelt niemand goed. */
const NIET_RESPONSIEF = ["case-voor-resultaat", "case-voor-categorie"];

function variantenVan(bestand, naam) {
  if (naam && NIET_RESPONSIEF.includes(naam)) return [{ id: "wireframe", bestand }];
  const map = join(wortel, dirname(bestand));
  const stam = basename(bestand, ".html");
  // X.html is de wireframe; elk bestand X-<iets>.html is een ontwerpversie.
  // Het achtervoegsel ís de naam: v1, v1-video, v2 — geen genummerde reeks,
  // want een wireframe is geen versie van een ontwerp.
  const uit = [{ id: "wireframe", bestand }];
  for (const naam of readdirSync(map).sort()) {
    // Alleen achtervoegsels die met v+cijfer beginnen tellen als versie —
    // anders zou service-levertijden.html een variant van service.html zijn.
    const m = naam.match(new RegExp(`^${stam}-(v\\d[\\w-]*)\\.html$`));
    if (m) uit.push({ id: m[1], bestand: `${dirname(bestand)}/${naam}` });
  }
  return uit;
}

for (const { naam, bestand, overslaan = [] } of PAGINAS) {
  for (const variant of variantenVan(bestand, naam)) {
    if (overslaan.includes(variant.id)) continue;
    const sleutel = `${naam}-${variant.id}`;
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
