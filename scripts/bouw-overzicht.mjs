#!/usr/bin/env node
/**
 * Bouwt mockups/overzicht.html: twee tabbladen op één vel.
 *
 *   Pagina's     elke mockup als klein voorbeeld, gegroepeerd per familie.
 *   Componenten  elke band die ergens in een mockup staat, gegroepeerd per
 *                soort — dus alle hero's bij elkaar, alle slotsecties bij
 *                elkaar. Zo zie je wat er te kiezen valt zonder tien
 *                pagina's langs te gaan.
 *
 * Waarom gegenereerd en niet met de hand: er komen voortdurend pagina's en
 * banden bij. Een handgeschreven overzicht loopt binnen een week achter, en
 * een overzicht dat niet klopt is erger dan geen overzicht — dan zoek je iets
 * dat er wel is.
 *
 * De componenten worden niet gekopieerd maar uit de bron gehaald:
 * homepage-v6.html?uitsnede=belofte toont die ene band met de opmaak van die
 * pagina eromheen (zie assets/uitsnede.js). Eén bron, geen tweede versie die
 * uit de pas loopt.
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
  { id: "homepage",   titel: "Homepage",        uitleg: "Negen concurrerende concepten. Hun hero ís het concept, dus die houden hun eigen maat.", test: (n) => /^homepage/.test(n) },
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

/* Volgorde waarin banden op een pagina voorkomen, van boven naar onder. Die
   volgorde is de indeling van het componententabblad: je leest hem zoals je
   een pagina leest, niet alfabetisch.

   De samenstelpagina doet zelf ook aan data-band, maar dan als naam van een
   keuzerij en niet als ontwerp. Die hoort hier dus niet in. */
const BANDEN = [
  ["hero",        "Hero",              "De kop met beeld. Het concept van een versie zit hier in."],
  ["belofte",     "Belofte-band",      "De strook met feiten direct onder de hero."],
  ["routes",      "Drie ingangen",     "Waar begin je — configureren, zeggen wat je vervoert, of kijken."],
  ["klanten",     "Klanten",           "Logo's en een citaat. Namen in plaats van bijvoeglijke naamwoorden."],
  ["bewijs",      "Bewijs",            "Waarom de prijs klopt zonder offerte."],
  ["branches",    "Branches",          "De markten waar de cases terechtkomen."],
  ["proces",      "Proces",            "Van maat naar kade, of van mail naar kist."],
  ["modellen",    "Assortiment",       "De vijf modellen, met of zonder grote prijs."],
  ["prijsopbouw", "Prijs uitgesplitst","Eén voorbeeldkist helemaal uitgerekend."],
  ["eencase",     "Ook één case",      "De kleine koper, expliciet welkom geheten."],
  ["zelfdoen",    "Zelf configureren", "De configurator als tweede ingang."],
  ["huisstijl",   "Kleur en logo",     "Paneelkleuren en opdruk op het deksel."],
  ["aanvraag",    "Offertepaneel",     "Het aanvraagformulier met sleepzone."],
  ["zakelijk",    "Zakelijk",          "Series, staffels, op rekening, herhaalorders."],
  ["herhaalorder","Bijbestellen",      "De strook voor wie ingelogd terugkomt."],
  ["vertrouwen",  "Vertrouwen",        "Sinds 1987, eigen werkplaats, geen tussenhandel."],
  ["omweg",       "De omweg",          "Waarom het zonder offerte sneller gaat."],
  ["geenmatch",   "Niets gevonden",    "Wat er gebeurt als je object er niet bij staat."],
  ["onderdelen",  "Onderdelen",        "Zelf bouwen: profielen, hoeken, zaagservice."],
  ["slot",        "Afsluiting",        "De laatste zet naar de configurator of de aanvraag."],
];
/* Deze pagina kiest banden, hij levert ze niet. */
const GEEN_BRON = new Set(["homepage-samenstellen.html"]);

const bestanden = readdirSync(MAP)
  .filter((n) => n.endsWith(".html") && !NEGEER.has(n))
  .sort();

const groepen = new Map(GROEPEN.map((g) => [g.id, []]));
const banden = new Map(BANDEN.map(([id]) => [id, []]));
const onbekend = new Set();

for (const naam of bestanden) {
  const bron = readFileSync(join(MAP, naam), "utf8");

  /* Banden uit dezelfde leesronde: het bestand is toch al ingelezen. Alleen
     bronnen die uitsnede.js laden tellen mee — zonder dat script toont
     ?uitsnede= de hele pagina in plaats van die ene band, en dan staat er
     een pagina in een componententegel. */
  if (!GEEN_BRON.has(naam) && /assets\/uitsnede\.js/.test(bron)) {
    for (const m of bron.matchAll(/data-band="([a-z-]+)"/g)) {
      if (banden.has(m[1])) banden.get(m[1]).push(naam);
      else onbekend.add(`${m[1]} (${naam})`);
    }
  }
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

/* Titels komen uit de bron en zijn daar niet allemaal gelijk geschreven: de
   meeste gebruiken een letterlijke —, sommige de entiteit &mdash;. Zonder
   eerst te ontcijferen escapet ontsnap() die ampersand nog een keer, en dan
   staat er "&mdash;" in het bijschrift. Dus terug naar tekens, dan pas
   escapen. */
const ontcijfer = (t) => t
  .replace(/&mdash;/g, "\u2014").replace(/&ndash;/g, "\u2013")
  .replace(/&middot;/g, "\u00b7").replace(/&nbsp;/g, " ")
  .replace(/&eacute;/g, "\u00e9").replace(/&Eacute;/g, "\u00c9")
  .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
  .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
const ontsnap = (t) => ontcijfer(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const tegel = (p) => `<figure class="s-${p.soort}">
        <figcaption><span class="n">${ontsnap(p.naam)}</span>${p.maat ? `<span class="maat">${p.maat}</span>` : ""}</figcaption>
        <div class="raam"><iframe src="${p.naam}" loading="lazy" title="${ontsnap(p.titel)}"></iframe></div>
        <a class="uit" href="${p.naam}" target="_blank" rel="noopener">${ontsnap(p.titel)} &#8599;</a>
      </figure>`;

/* Kader op 1440 breed, teruggeschaald naar een kwart. De hoogte komt van de
   band zelf via postMessage — zie het script onderaan de pagina. */
const bandtegel = (bestand, band) => `<figure class="comp">
        <figcaption><span class="n">${ontsnap(bestand.replace(/\.html$/, ""))}</span></figcaption>
        <div class="venster" data-schaal=".25"><div class="houder">
          <iframe src="${bestand}?uitsnede=${band}" loading="lazy" title="${ontsnap(band)} uit ${ontsnap(bestand)}"></iframe>
        </div></div>
        <a class="uit" href="${bestand}?uitsnede=${band}" target="_blank" rel="noopener">Los bekijken &#8599;</a>
      </figure>`;

const bandsecties = BANDEN.filter(([id]) => banden.get(id).length).map(([id, titel, uitleg]) => {
  const bronnen = banden.get(id);
  return `
    <section id="b-${id}">
      <h2>${titel} <span>${ontsnap(uitleg)}</span> <b>${bronnen.length}</b></h2>
      <div class="rooster">${bronnen.map((b) => bandtegel(b, id)).join("")}</div>
    </section>`;
}).join("");

const bandsprong = BANDEN.filter(([id]) => banden.get(id).length)
  .map(([id, titel]) => `<a href="#b-${id}">${titel} <i>${banden.get(id).length}</i></a>`).join("");

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
  text-transform:uppercase;font-size:9px;letter-spacing:.1em}
/* Alleen de bovenkant, verkleind: zo passen er veel naast elkaar en valt een
   afwijkende hero binnen een groep meteen op. */
.raam{height:206px;overflow:hidden;background:var(--bg)}
.raam iframe{width:1400px;height:840px;border:0;transform:scale(.25);transform-origin:0 0}
.uit{font:500 11px 'DM Sans',sans-serif;color:var(--dark);text-decoration:none;
  padding:9px 10px;border-top:1px solid var(--rule);margin-top:auto;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.uit:hover{color:var(--cyan);background:var(--void)}

/* ── tabbladen ────────────────────────────────────────────────
   Twee vragen die je aan dit vel stelt: "welke pagina's zijn er" en
   "welke bouwstenen zijn er". Dat zijn twee overzichten, geen twee
   groepen in hetzelfde overzicht — vandaar tabbladen en geen kop erbij.
   De keuze staat in de hash, zodat een tabblad deelbaar is. */
.tabbladen{display:flex;background:var(--void);padding:0 28px;gap:0}
.tabbladen a{font-family:'Barlow Condensed',sans-serif;font-weight:600;text-transform:uppercase;
  font-size:16px;letter-spacing:.04em;color:rgba(255,255,255,.5);text-decoration:none;
  padding:13px 22px;border-bottom:3px solid transparent;display:flex;align-items:baseline;gap:9px}
.tabbladen a:hover{color:#fff}
.tabbladen a.on{color:#fff;border-bottom-color:var(--cyan)}
.tabbladen a i{font:500 10px 'IBM Plex Mono',monospace;font-style:normal;color:var(--cyan)}
.blad{display:none}
.blad.on{display:block}

/* ── componenttegel ───────────────────────────────────────────
   Anders dan een paginategel: een band heeft geen vaste hoogte. De
   uitsnede meldt zijn eigen hoogte terug en het kader groeit mee, zodat
   een specband van 100px geen scherm wit krijgt en een hero niet wordt
   afgekapt. Tot die melding binnen is staat er een lage plaatshouder. */
figure.comp .venster{height:120px;overflow:hidden;background:var(--bg);
  transition:height .18s ease;position:relative}
figure.comp .venster::after{content:"laden…";position:absolute;inset:0;display:flex;
  align-items:center;justify-content:center;font:500 10px 'IBM Plex Mono',monospace;
  letter-spacing:.14em;text-transform:uppercase;color:var(--rule)}
figure.comp .venster.geladen::after{display:none}
figure.comp .houder{width:1440px}
figure.comp .venster iframe{width:1440px;height:600px;border:0;display:block;
  pointer-events:none;transform:scale(.25);transform-origin:top left}
</style>
</head>
<body>
<header>
  <span class="ey">// overzicht &middot; gegenereerd, niet met de hand bijgehouden</span>
  <h1>Alles op één vel</h1>
  <p>Twee tabbladen: <b>Pagina's</b> is elke mockup als klein voorbeeld, alleen de bovenkant.
    <b>Componenten</b> is elke band die ergens in een mockup staat, gegroepeerd per soort &mdash;
    alle hero's bij elkaar, alle slotsecties bij elkaar. Die banden zijn geen kopie: ze worden
    uit de versie zelf gehaald, dus wat je hier ziet is wat daar staat.
    Bijwerken: <code>node scripts/bouw-overzicht.mjs</code></p>
</header>

<div class="tabbladen">
  <a href="#paginas" data-blad="paginas" class="on">Pagina&rsquo;s <i>${bestanden.length}</i></a>
  <a href="#componenten" data-blad="componenten">Componenten <i>${[...banden.values()].reduce((n, v) => n + v.length, 0)}</i></a>
</div>

<div class="blad on" id="blad-paginas">
  <nav>${sprong}</nav>
  ${secties}
</div>

<div class="blad" id="blad-componenten">
  <nav>${bandsprong}</nav>
  ${bandsecties}
</div>

<script>
/* Tabbladen. De hash bepaalt welk blad open staat, zodat je een tabblad kunt
   delen en de terugknop werkt. Een sprong naar een sectie (#b-hero) hoort bij
   het componentenblad; die openen we dus mee, anders klik je op een link die
   niets lijkt te doen. */
(function () {
  var bladen = document.querySelectorAll('.blad');
  var tabs = document.querySelectorAll('.tabbladen a');
  function kies(naam) {
    bladen.forEach(function (b) { b.classList.toggle('on', b.id === 'blad-' + naam); });
    tabs.forEach(function (t) { t.classList.toggle('on', t.dataset.blad === naam); });
  }
  function uitHash() {
    var h = location.hash.slice(1);
    if (h === 'componenten' || h.indexOf('b-') === 0) return kies('componenten');
    kies('paginas');
  }
  addEventListener('hashchange', uitHash);
  uitHash();
})();

/* Hoogte van een uitsnede. De band meet zichzelf en meldt het terug
   (assets/uitsnede.js); van buitenaf meten kan niet zodra de browser file://
   als aparte oorsprong ziet, en dat doet Chrome. */
addEventListener('message', function (e) {
  if (!e.data || e.data.soort !== 'cb-uitsnede') return;
  document.querySelectorAll('figure.comp iframe').forEach(function (frame) {
    if (frame.contentWindow !== e.source) return;
    var venster = frame.closest('.venster');
    var schaal = parseFloat(venster.dataset.schaal) || 0.25;
    frame.style.height = e.data.hoogte + 'px';
    venster.style.height = Math.ceil(e.data.hoogte * schaal) + 'px';
    venster.classList.add('geladen');
  });
});
</script>
</body>
</html>
`);

const totaal = [...groepen.values()].reduce((n, v) => n + v.length, 0);
const totaalBanden = [...banden.values()].reduce((n, v) => n + v.length, 0);
console.log(`overzicht.html bijgewerkt — ${totaal} pagina's, ${totaalBanden} componenten`);
for (const g of GROEPEN) {
  const n = groepen.get(g.id).length;
  if (n) console.log(`  ${String(n).padStart(3)}  ${g.titel}`);
}
/* Een band zonder regel in BANDEN valt stil uit het overzicht. Dat is precies
   het soort misser waar dit script voor bestaat, dus die melden we. */
for (const b of onbekend) console.log(`  let op: band zonder omschrijving — ${b}`);
const leeg = BANDEN.filter(([id]) => !banden.get(id).length).map(([id]) => id);
if (leeg.length) console.log(`  ongebruikt in BANDEN: ${leeg.join(", ")}`);
