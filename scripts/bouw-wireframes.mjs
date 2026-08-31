#!/usr/bin/env node
/**
 * Schrijft per sjabloon een losse wireframepagina op ware grootte, uit de
 * wireframes die in index.html staan. Eén bron: het document blijft leidend,
 * de losse pagina is er voor als je hem groot wilt zien.
 *
 * Gebruik: node scripts/bouw-wireframes.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const wortel = join(dirname(fileURLToPath(import.meta.url)), "..");
const doc = readFileSync(join(wortel, "index.html"), "utf8");

/* Stempel op de stylesheet, zodat een browser nooit een oude versie blijft
   tonen na een wijziging. Anders lijkt een correctie niet doorgevoerd. */
const merk = (pad) =>
  createHash("sha1").update(readFileSync(join(wortel, "mockups", pad))).digest("hex").slice(0, 8);
const CSSMERK = merk("assets/wireframe.css");

/** Sjablonen die het achtergrondraster niet krijgen — daar leest het rustiger. */
const ZONDER_RASTER = ["homepage"];

/** Sjabloon-id → bestandsnaam van de wireframepagina. */
const NAMEN = {
  homepage: "homepage", categorie: "categorie", "pdp-onderdeel": "onderdeel",
  casetype: "casetype", overzicht: "flightcases", "case-voor-categorie": "case-voor-gitaar",
  "case-voor-resultaat": "case-voor-gibson-les-paul", servicehub: "service",
  content: "service-levertijden", zoekresultaat: "zoeken", formulier: "laten-controleren",
  bevestiging: "bedankt", account: "account", checkout: "checkout", tool: "configurator",
};

function sluit(tekst, start) {
  let diepte = 0;
  for (const m of tekst.slice(start).matchAll(/<div\b|<\/div>/g)) {
    diepte += m[0].startsWith("<div") ? 1 : -1;
    if (diepte === 0) return start + m.index + m[0].length;
  }
  throw new Error("geen sluitende </div>");
}

let aantal = 0;
for (const [id, bestandsnaam] of Object.entries(NAMEN)) {
  const fig = doc.indexOf(`id="wf-${id}">`);
  if (fig === -1) { console.log(`  overgeslagen: ${id} — geen wireframe in index.html`); continue; }

  // titel en url uit de figcaption
  const kop = doc.slice(fig, doc.indexOf("</figcaption>", fig));
  const pad = (kop.match(/<h3>(.*?)<\/h3>/) || [, id])[1];
  const meta = (kop.match(/<span class="wfmeta">(.*?)<\/span>/) || [, ""])[1].replace(/<[^>]+>/g, "");

  const a = doc.indexOf('<div class="wfpage"', fig);
  if (a === -1) { console.log(`  overgeslagen: ${id} — nog geen wfpage`); continue; }
  let blok = doc.slice(a, sluit(doc, a));

  // op ware grootte: schaal 1, en de vouwlijnen op elke schermhoogte
  const totaal = [...blok.matchAll(/--h:(\d+)/g)].reduce((s, m) => s + Number(m[1]), 0);
  blok = blok.replace(/<div class="wfpage"[^>]*>/,
    `<div class="wfpage${ZONDER_RASTER.includes(id) ? " geen-raster" : ""}">`);
  // De vouw wordt in de browser getekend, op de werkelijke vensterhoogte
  // van degene die kijkt — zie mockups/assets/vouwlijn.js.
  blok = blok.replace(/<div class="vouw">[\s\S]*?<\/div>/g, "");

  const html = `<!doctype html>
<html lang="nl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Casebuilder — ${pad}, wireframe op ware grootte</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;900&family=DM+Sans:wght@400;500;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/wireframe.css?${CSSMERK}">
</head>
<body>

<div class="blad-kop">
  <b>${pad} · wireframe</b>
  <span>${meta}</span>
  <span class="rechts">1440 px breed · ware grootte · totaal ${totaal.toLocaleString("nl-NL")} px</span>
</div>

${blok}

<script src="assets/vouwlijn.js"></script>
<script src="assets/versies.js"></script>
</body>
</html>
`;
  writeFileSync(join(wortel, "mockups", `${bestandsnaam}.html`), html);
  console.log(`  ${bestandsnaam}.html — ${totaal} px`);
  aantal++;
}
console.log(`${aantal} wireframepagina's geschreven`);
