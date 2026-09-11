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
  /* Alles onder de hero van de homepage. Anders dan de drie hierboven zit
     dit niet in élke mockup maar alleen in de versies die er nog staan: de
     homepage is één ontwerp waarvan alleen de hero verschilt, en dat is
     precies wat er te kiezen valt. Vandaar `alleen`.

     De grenzen zijn hier merktekens en geen begin- en eindtag, omdat het om
     een reeks secties gaat en niet om één element. Ze staan er ook voor de
     lezer: wie het bestand opent ziet meteen dat dit stuk elders vandaan
     komt en hier niet met de hand bijgewerkt moet worden.

     De opmaak hoort bij deze markup en staat in assets/homepage-onder.css. */
  { naam: "homepage-onder", bestand: "onderdelen/homepage-onder.html",
    alleen: /^homepage-v(1|2)\.html$/,
    patroon: /<!-- ══ gedeelde homepage-inhoud · begin[\s\S]*?<!-- ══ gedeelde homepage-inhoud · eind ══ -->/,
    omhullen: (inhoud) =>
      "<!-- ══ gedeelde homepage-inhoud · begin — zie mockups/onderdelen/homepage-onder.html ══ -->\n" +
      inhoud + "\n<!-- ══ gedeelde homepage-inhoud · eind ══ -->" },
];

for (const o of ONDERDELEN) o.inhoud = readFileSync(join(MAP, o.bestand), "utf8").trimEnd();

/** Welk navigatie-item is hier actief? Terug te vinden aan de linktekst. */
function actiefItem(nav) {
  const m = nav.match(/<a[^>]*class="[^"]*\bon\b[^"]*"[^>]*>([^<]+)<\/a>/);
  if (!m) return null;
  // "Zelf configureren" is geen tabblad meer maar zit in het menu onder
  // Flightcases. Pagina's die het als actief item hadden — de configurator
  // en laten-controleren — markeren nu de tak waar het onder valt.
  return m[1] === "Zelf configureren" ? "Flightcases" : m[1];
}

/** Zet class="on" op het item met deze tekst. */
function markeer(nav, tekst) {
  if (!tekst) return nav;
  // De megamenu's even opzij: daarbinnen staan dezelfde woorden nog een
  // keer, en die mogen de markering niet opvangen. Eruit knippen en
  // terugzetten werkt — afkappen bij het eerste paneel zou alles erna
  // buiten bereik laten.
  //
  // Elk paneel eindigt op <!-- /megamenu -->. Eerst zocht dit op drie
  // sluitende </div>'s achter elkaar, en dat hield op te kloppen zodra er
  // een tweede paneel met een andere opbouw bij kwam. Een eindmerk telt
  // niet mee met de nesting, dus maakt het niet uit wat erin staat.
  const panelen = [];
  const kaal = nav.replace(/<div class="megamenu">[\s\S]*?<!-- \/megamenu -->/g, (p) => {
    panelen.push(p);
    return `\u0000MENU${panelen.length - 1}\u0000`;
  });
  const veilig = tekst.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const uit = kaal.replace(new RegExp(`(<a href="[^"]*")(>${veilig}</a>)`), '$1 class="on"$2');
  return uit.replace(/\u0000MENU(\d+)\u0000/g, (_, i) => panelen[+i]);
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
    if (o.alleen && !o.alleen.test(naam)) continue;
    const m = s.match(o.patroon);
    if (!m) continue;
    const vervanging = o.naam === "nav" ? markeer(o.inhoud, actiefItem(m[0]))
                     : o.omhullen ? o.omhullen(o.inhoud)
                     : o.inhoud;
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
