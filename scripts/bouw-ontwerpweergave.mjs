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
  // Deze drie hebben (nog) geen wireframe; de basis wordt overgeslagen en
  // alleen de ontwerpversies worden opgepikt.
  { naam: "shop", bestand: "mockups/shop.html", overslaan: ["wireframe"] },
  { naam: "aanvraag", bestand: "mockups/case-aanvragen.html", overslaan: ["wireframe"] },
  { naam: "product", bestand: "mockups/product.html", overslaan: ["wireframe"] },
];

/**
 * De wortel staat twee keer in de selector. Dat leest raar, maar het is het
 * enige wat de ingesloten weergave beschermt tegen de fasepagina zelf.
 *
 * index.html heeft eigen opmaak voor `.wrap`, `section`, `h1`, `p`, `.chip`,
 * `.card` — allemaal namen die in de mockups ook voorkomen. Met één `.dv`
 * ervoor woog een mockupregel even zwaar als een regel van de fasepagina, en
 * dan wint de laatste in het bestand. Zo kreeg elke `.wrap` in de weergave
 * `flex-direction:column` mee: de navigatie klapte over de koptekst heen.
 * Erger nog waren de eigenschappen die de mockup helemaal niet noemt — de
 * fasepagina zette ronde hoeken op `.chip`, terwijl het merk geen ronde
 * hoeken kent. Dat viel niemand op, want de weergave rendert gewoon door.
 *
 * `.dv.dv` weegt zwaarder dan elke regel van de fasepagina. Samen met de
 * terugzetregel hieronder begint elk element in de weergave weer bij de
 * browserstandaard, en bouwt de mockup zijn eigen opmaak daarbovenop.
 */
const WORTEL = ".dv.dv";

/**
 * Zet alles binnen de weergave terug naar de browserstandaard, vóór de
 * mockupregels. `revert` rolt alleen de opmaak van de fasepagina terug en
 * laat de browserstandaard staan, dus een tabel blijft een tabel. De wortel
 * zelf doet niet mee: die hoort bij de fasepagina (het kader, en
 * `container-type` waar alle @container-regels op steunen).
 */
const TERUGZET = `${WORTEL} *,${WORTEL} *::before,${WORTEL} *::after{all:revert}`;

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

/**
 * De ingesloten kopie komt in index.html te staan (de wortel), de mockup zelf
 * staat in mockups/. Elk relatief pad wijst daardoor een map te hoog. Zonder
 * deze herschrijving zijn alle afbeeldingen, video's en links in de
 * ontwerpweergave stuk — en dat valt niet op, want de pagina rendert gewoon
 * door: je ziet een gebroken beeld, geen foutmelding.
 *
 * Alles met een eigen schema (http:, mailto:, data:), een anker (#) of een
 * pad vanaf de wortel (/) blijft ongemoeid.
 */
function herschrijfPaden(tekst, map) {
  const laatStaan = /^(?:[a-z][a-z0-9+.-]*:|\/\/|\/|#|$)/i;
  const voor = (pad) => (laatStaan.test(pad) ? pad : `${map}/${pad}`);
  return tekst
    .replace(/\b(href|src|poster)=("|')([^"']*)\2/gi,
      (_, attr, q, pad) => `${attr}=${q}${voor(pad)}${q}`)
    .replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/gi,
      (_, q, pad) => `url(${q}${voor(pad)}${q})`);
}

let css = TERUGZET + schaalIn(readFileSync(BRAND, "utf8"), WORTEL);
const html = {};

/**
 * Varianten: naast `homepage.html` mag `homepage-v6.html` bestaan. Die wordt
 * automatisch opgepikt en krijgt een eigen blok, zodat twee versies van
 * hetzelfde sjabloon naast elkaar te bekijken zijn zonder dat de een de ander
 * overschrijft. Handig als er aan twee versies tegelijk gewerkt wordt.
 */
/* Stond hier eerder voor ontwerpen die op een vast raster waren getekend
   en in de smalle kolom braken. Sinds de @media-regels container queries
   worden (zie schaalIn) schalen ze wél mee, en de case-voor-ontwerpen
   werden juist het probleem: ze werden niet gegenereerd, dus bleef er een
   met de hand getypte kopie staan met links zonder mockups/-voorvoegsel.
   Leeg laten betekent: alles wordt gegenereerd. */
const NIET_RESPONSIEF = [];

/* Bestandsnaam → stam waar hij op leek te horen. Pas ná de hele lus weten we
   of hij elders alsnog is opgepikt: service-levertijden-v1.html lijkt een
   variant van service.html, maar heeft een eigen ingang in PAGINAS. */
const MOGELIJK_GEMIST = new Map();
const OPGEPIKT = new Set();

function variantenVan(bestand, naam) {
  if (naam && NIET_RESPONSIEF.includes(naam)) return [{ id: "wireframe", bestand }];
  const map = join(wortel, dirname(bestand));
  const stam = basename(bestand, ".html");
  // X.html is de wireframe; elk bestand X-<iets>.html is een ontwerpversie.
  // Het achtervoegsel ís de naam: v1, v1-video, v2 — geen genummerde reeks,
  // want een wireframe is geen versie van een ontwerp.
  const uit = [{ id: "wireframe", bestand }];
  const gemist = [];
  for (const naam of readdirSync(map).sort()) {
    // Alleen achtervoegsels die met v+cijfer beginnen tellen als versie —
    // anders zou service-levertijden.html een variant van service.html zijn.
    const m = naam.match(new RegExp(`^${stam}-(v\\d[\\w-]*)\\.html$`));
    if (m) { uit.push({ id: m[1], bestand: `${dirname(bestand)}/${naam}` }); continue; }
    // Ziet er wél uit als een ontwerpversie (eindigt op -v<cijfer>.html) maar
    // valt door het patroon, bijvoorbeeld casetype-hoedcase-v1.html. Dat
    // verdween tot nu toe geruisloos uit de weergave; nu zegt het script het.
    if (naam.startsWith(`${stam}-`) && /-v\d[\w-]*\.html$/.test(naam)) gemist.push(naam);
  }
  for (const naam of gemist) MOGELIJK_GEMIST.set(naam, stam);
  return uit;
}

for (const { naam, bestand, overslaan = [] } of PAGINAS) {
  for (const variant of variantenVan(bestand, naam)) {
    if (overslaan.includes(variant.id)) continue;
    const sleutel = `${naam}-${variant.id}`;
    OPGEPIKT.add(basename(variant.bestand));
    const bron = readFileSync(join(wortel, variant.bestand), "utf8");
    const wortelSel = `${WORTEL}[data-page="${sleutel}"]`;
    const map = dirname(variant.bestand);

    /* Een mockup laadt naast brand.css ook eigen stylesheets — de draaiende
       kist, de suggestielijst, de gedeelde homepage-inhoud. Die stonden
       hier niet in, dus de ingesloten weergave toonde de kist zonder
       panelen en de lijst zonder opmaak. brand.css staat er al globaal in
       en slaan we over; alles met een eigen schema (fonts) ook. */
    for (const m of bron.matchAll(/<link\b[^>]*rel=["']stylesheet["'][^>]*>/gi)) {
      const href = (m[0].match(/href=["']([^"']+)["']/) || [])[1];
      if (!href || /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(href) || href.endsWith("brand.css")) continue;
      const pad = join(wortel, map, href);
      let stijl;
      try { stijl = readFileSync(pad, "utf8"); }
      catch { console.warn(`  let op: ${href} uit ${variant.bestand} niet gevonden`); continue; }
      css += schaalIn(herschrijfPaden(stijl, dirname(`${map}/${href}`)), wortelSel);
    }

    css += schaalIn(
      herschrijfPaden(tussen(bron, "<style>", "</style>", `stijlblok in ${variant.bestand}`).inhoud, map),
      wortelSel
    );
    // Het meetlint hoort bij de losse mockup, niet bij de ingesloten kopie.
    html[sleutel] = herschrijfPaden(
      tussen(bron, "<body>", "</body>", `body in ${variant.bestand}`).inhoud, map
    )
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "")
      .trim();
  }
}

/* Een ontwerp dat door het naampatroon valt verdween tot nu toe geruisloos
   uit de weergave. Nu zegt het script welke, en waarom. */
for (const [naam, stam] of MOGELIJK_GEMIST) {
  if (OPGEPIKT.has(naam)) continue;
  console.warn(`  let op: ${naam} valt buiten de weergave — past niet op ${stam}-v<cijfer>`);
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
