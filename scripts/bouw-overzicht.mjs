#!/usr/bin/env node
/**
 * Bouwt mockups/overzicht.html: elke mockup als klein voorbeeld, gegroepeerd
 * per familie.
 *
 * Waarom gegenereerd en niet met de hand: er komen voortdurend pagina's bij.
 * Een handgeschreven overzicht loopt binnen een week achter, en een overzicht
 * dat niet klopt is erger dan geen overzicht — dan zoek je iets dat er wel is.
 *
 * Draai na het toevoegen of hernoemen van een mockup:
 *   node scripts/bouw-overzicht.mjs
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const wortel = join(dirname(fileURLToPath(import.meta.url)), "..");
const MAP = join(wortel, "mockups");
const DOEL = join(MAP, "overzicht.html");

/* Volgorde is de volgorde op het vel. Eerste passende regel wint, dus van
   specifiek naar algemeen. `overig` vangt op wat nergens in past — als daar
   veel in belandt, mist er een groep. */
const GROEPEN = [
  { id: "homepage",   titel: "Homepage",        uitleg: "Acht concurrerende concepten. Hun hero ís het concept, dus die houden hun eigen maat.", test: (n) => /^homepage/.test(n) },
  { id: "case-voor",  titel: "Wat ga je vervoeren", uitleg: "De objectas: ingang per apparaat.", test: (n) => /^case-voor/.test(n) },
  { id: "casetype",   titel: "Casetypes",       uitleg: "Per model, met de maatvoering.", test: (n) => /^casetype/.test(n) },
  { id: "branches",   titel: "Branches",        uitleg: "De publieksas: ingang per markt.", test: (n) => /^branche/.test(n) },
  { id: "zakelijk",   titel: "Groot zakelijk",  uitleg: "Hoe je koopt, niet wie je bent.", test: (n) => /^(grote-spelers|speler-)/.test(n) },
  { id: "configurator", titel: "Configurator", uitleg: "Zelf tekenen, vijf stappen, prijs aan het eind.", test: (n) => /^configurator/.test(n) },
  { id: "bestellen",  titel: "Bestellen",       uitleg: "Winkelwagen, afrekenen, bevestiging en account.", test: (n) => /^(checkout|bedankt|account|winkelwagen)/.test(n) },
  { id: "catalogus",  titel: "Catalogus",       uitleg: "Overzicht, categorie, onderdeel, zoeken.", test: (n) => /^(flightcases|categorie|onderdeel|zoeken|overzicht-)/.test(n) },
  { id: "service",    titel: "Service en aanvraag", uitleg: "Alles rond bestellen, vragen en contact.", test: (n) => /^(service|contact|case-aanvragen|laten-controleren|zo-werkt-het|faq)/.test(n) },
  { id: "varianten",  titel: "Vergelijkpagina's", uitleg: "Varianten naast elkaar, met de afweging erbij.", test: (n) => /varianten|^concepten|^hero-voorstellen/.test(n) },
  { id: "overig",     titel: "Overig",          uitleg: "Wat in geen groep past.", test: () => true },
];

const NEGEER = new Set(["overzicht.html", "hero-controle.html"]);

const bestanden = readdirSync(MAP)
  .filter((n) => n.endsWith(".html") && !NEGEER.has(n))
  .sort();

const groepen = new Map(GROEPEN.map((g) => [g.id, []]));
for (const naam of bestanden) {
  const bron = readFileSync(join(MAP, naam), "utf8");
  const kop = bron.match(/class="[^"]*\bkop-(hoog|midden|laag)\b/);
  const titel = bron.match(/<title>([^<]*)<\/title>/);
  groepen.get(GROEPEN.find((g) => g.test(naam)).id).push({
    naam,
    maat: kop ? kop[1] : null,
    // Wireframes laden wireframe.css, ontwerpen brand.css. Dat onderscheid
    // is de eerste vraag die je bij een overzicht stelt.
    soort: /wireframe\.css/.test(bron) ? "wireframe" : /brand\.css/.test(bron) ? "ontwerp" : "los",
    titel: titel ? titel[1].replace(/^Casebuilder\s*[—-]\s*/, "") : naam,
  });
}

const ontsnap = (t) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const tegel = (p) => `<figure class="s-${p.soort}">
        <figcaption><span class="n">${ontsnap(p.naam)}</span>${p.maat ? `<span class="maat">${p.maat}</span>` : ""}</figcaption>
        <div class="raam"><iframe src="${p.naam}" loading="lazy" title="${ontsnap(p.titel)}"></iframe></div>
        <a class="uit" href="${p.naam}" target="_blank" rel="noopener">${ontsnap(p.titel)} &#8599;</a>
      </figure>`;

const secties = GROEPEN.filter((g) => groepen.get(g.id).length).map((g) => {
  const items = groepen.get(g.id);
  return `
    <section id="${g.id}">
      <h2>${g.titel} <span>${ontsnap(g.uitleg)}</span> <b>${items.length}</b></h2>
      <div class="rooster">${items.map(tegel).join("")}</div>
    </section>`;
}).join("");

const sprong = GROEPEN.filter((g) => groepen.get(g.id).length)
  .map((g) => `<a href="#${g.id}">${g.titel} <i>${groepen.get(g.id).length}</i></a>`).join("");

writeFileSync(DOEL, `<!doctype html>
<html lang="nl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Casebuilder — overzicht van alle mockups</title>
<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;900&family=DM+Sans:wght@400;500&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
:root{--rule:#D9DEE5;--bg:#F2F5F9;--dark:#003352;--mute:#6B7480;--cyan:#66C4E8;--void:#06121C}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);font:14px/1.5 'DM Sans',sans-serif;color:#1A1A1A}
header{background:var(--void);color:#fff;padding:26px 28px}
header h1{font-family:'Barlow Condensed',sans-serif;font-weight:900;text-transform:uppercase;
  font-size:27px;margin:6px 0 0;letter-spacing:.02em}
header p{color:rgba(255,255,255,.66);margin:9px 0 0;max-width:86ch;font-size:13.5px}
header .ey{font-family:'IBM Plex Mono',monospace;font-size:10px;letter-spacing:.18em;
  text-transform:uppercase;color:var(--cyan)}
nav{position:sticky;top:0;z-index:20;background:#fff;border-bottom:1px solid var(--rule);
  padding:0 28px;display:flex;flex-wrap:wrap;box-shadow:0 1px 3px rgba(0,40,70,.05)}
nav a{font-family:'Barlow Condensed',sans-serif;font-weight:600;text-transform:uppercase;
  font-size:14px;letter-spacing:.03em;color:var(--mute);text-decoration:none;padding:12px 15px;
  display:flex;align-items:baseline;gap:6px}
nav a:hover{color:var(--dark)}
nav a i{font:500 10px 'IBM Plex Mono',monospace;font-style:normal;color:var(--cyan)}
section{padding:24px 28px 4px;scroll-margin-top:44px}
section h2{font-family:'Barlow Condensed',sans-serif;font-weight:600;text-transform:uppercase;
  font-size:20px;color:var(--dark);letter-spacing:.02em;display:flex;align-items:baseline;gap:13px;
  border-bottom:1px solid var(--rule);padding-bottom:9px;margin:0 0 15px;flex-wrap:wrap}
section h2 span{font:400 12px 'DM Sans',sans-serif;color:var(--mute);text-transform:none;letter-spacing:0}
section h2 b{margin-left:auto;font:500 11px 'IBM Plex Mono',monospace;color:var(--mute)}
.rooster{display:grid;grid-template-columns:repeat(auto-fill,minmax(288px,1fr));gap:14px}
figure{margin:0;background:#fff;border:1px solid var(--rule);display:flex;flex-direction:column}
figure.s-wireframe{border-style:dashed}
figcaption{font:500 10px 'IBM Plex Mono',monospace;letter-spacing:.05em;color:var(--mute);
  padding:7px 10px;border-bottom:1px solid var(--rule);display:flex;gap:8px;align-items:center}
figcaption .n{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
figcaption .maat{margin-left:auto;background:var(--cyan);color:var(--void);padding:1px 6px;
  border-radius:2px;text-transform:uppercase;font-size:9px;letter-spacing:.1em}
/* Alleen de bovenkant, verkleind: zo passen er veel naast elkaar en valt een
   afwijkende hero binnen een groep meteen op. */
.raam{height:206px;overflow:hidden;background:var(--bg)}
.raam iframe{width:1400px;height:840px;border:0;transform:scale(.25);transform-origin:0 0}
.uit{font:500 11px 'DM Sans',sans-serif;color:var(--dark);text-decoration:none;
  padding:9px 10px;border-top:1px solid var(--rule);margin-top:auto;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.uit:hover{color:var(--cyan);background:var(--void)}
</style>
</head>
<body>
<header>
  <span class="ey">// overzicht &middot; gegenereerd, niet met de hand bijgehouden</span>
  <h1>Alle mockups op één vel</h1>
  <p>Elke pagina als klein voorbeeld, alleen de bovenkant, op 25%. Gestippelde rand = wireframe.
    Het blauwe label is de hero-maat, waar die gedeeld is. Klik de titel onderaan een tegel om
    de pagina op ware grootte te openen.
    Bijwerken na het toevoegen of hernoemen van een mockup: <code>node scripts/bouw-overzicht.mjs</code></p>
</header>
<nav>${sprong}</nav>
${secties}
</body>
</html>
`);

const totaal = [...groepen.values()].reduce((n, v) => n + v.length, 0);
console.log(`overzicht.html bijgewerkt — ${totaal} pagina's`);
for (const g of GROEPEN) {
  const n = groepen.get(g.id).length;
  if (n) console.log(`  ${String(n).padStart(3)}  ${g.titel}`);
}
