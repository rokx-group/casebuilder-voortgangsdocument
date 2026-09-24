#!/usr/bin/env node
/**
 * Bouwt de demopagina's voor de animaties.
 *
 *   mockups/demo-<animatie>.html   één pagina per animatie
 *   mockups/homepage-v13.html      de gekozen animaties samen, met film
 *   mockups/demo-overzicht.html    alle demo's op een rij, om doorheen te kijken
 *   mockups/assets/demos.js        dezelfde lijst voor de demobalk
 *
 * Alle pagina's hebben de homepage-inhoud uit scripts/demo-sjabloon.html.
 * data-animatie op de body kiest welke animatie mockups/assets/demo.js
 * aan die inhoud hangt. Een blok tussen <!-- alleen:slug --> en
 * <!-- /alleen --> komt alleen op de pagina met die slug.
 *
 * Deze lijst is de enige plek waar de demo's staan. Inhoud aanpassen doe
 * je in het sjabloon, en dan:
 *   node scripts/bouw-demo-animaties.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const hier = dirname(fileURLToPath(import.meta.url));
const mockups = join(hier, '..', 'mockups');
const sjabloon = readFileSync(join(hier, 'demo-sjabloon.html'), 'utf8');

const DEMOS = [
  { slug: 'homepage', titel: 'Homepage v13', bestand: 'homepage-v13.html', groep: 'Vastgesteld',
    uitleg: 'De gekozen richting samen: film in de hero, de ruit als onderlaag, de liniaal als scrollbalk, gefreesde objecten, hoekbeslag en titelblok.' },

  { slug: 'ruit-tekenen', titel: 'Ruit tekenen', groep: 'De ruit',
    uitleg: 'Elk raster tekent zich lijn voor lijn op zodra het vlak in beeld komt, zoals een plotter een vel opzet.' },
  { slug: 'ruit-meelezen', titel: 'Ruit meelezen', groep: 'De ruit',
    uitleg: 'Op de donkere vlakken volgt het veld de cursor, traag, als een loep over de tekening.' },
  { slug: 'ruit-onderlaag', titel: 'Ruit onderlaag', groep: 'De ruit',
    uitleg: 'Het raster schuift een derde trager dan de inhoud. Vastgesteld als standaard.' },

  { slug: 'titelblok', titel: 'Titelblok', groep: 'Uit de tekening',
    uitleg: 'Rechtsonder het titelblok van een technische tekening, dat per sectie het onderdeel en het bladnummer intypt.' },
  { slug: 'coordinaten', titel: 'Coördinaten', groep: 'Uit de tekening',
    uitleg: 'Kruisdraad met X en Y in de hero, hoogte per sectie, en de eerste, vaste liniaal.' },
  { slug: 'bemating', titel: 'Bemating', groep: 'Uit de tekening',
    uitleg: 'Maatlijnen met pijlpunten trekken zich langs de productfoto en de silhouetten, het getal telt op tot de maat.' },

  { slug: 'freesbaan', titel: 'Freesbaan', groep: 'Uit de machine',
    uitleg: 'De CNC freest het silhouet uit het schuim: contour, dan baan voor baan de uitsparing, met de freeskop in millimeters.' },
  { slug: 'levertijd', titel: 'Tien werkdagen', groep: 'Uit de machine',
    uitleg: 'Een meetlat van tien werkdagen die bij het scrollen dag voor dag volloopt en eindigt op een echte datum.' },

  { slug: 'hoekbeslag', titel: 'Hoekbeslag', groep: 'Uit het beslag',
    uitleg: 'De vier haken schuiven van buiten naar hun plek en klikken dicht, zoals de hoeken van een case.' },
  { slug: 'vlinderslot', titel: 'Vlinderslot', groep: 'Uit het beslag',
    uitleg: 'Op momenten van vast, zoals toevoegen aan de winkelwagen of een aanvraag versturen, klikt het vlinderslot dicht. Klik. Klaar.' },
  { slug: 'serienummer', titel: 'Serienummer', groep: 'Uit het beslag',
    uitleg: 'Een mechanische teller met het serienummer van de laatste case die de deur uitging, met wat er eerder vandaag vertrok.' },

  { slug: 'tekeningvel', titel: 'Tekeningvel', groep: 'Combinaties',
    uitleg: 'Hoekbeslag en titelblok samen: de pagina als een set tekeningen.' },
];
const bestand = d => d.bestand ?? `demo-${d.slug}.html`;

const vul = (slug, titel) => sjabloon
  .replace(/<!-- alleen:([\w,-]+) -->\n([\s\S]*?)<!-- \/alleen -->\n\n?/g,
    (_, voor, blok) => (voor.split(',').includes(slug) ? blok + '\n' : ''))
  .replaceAll('{{slug}}', slug)
  .replaceAll('{{titel}}', titel);

// De demo's
for (const d of DEMOS.filter(d => d.slug !== 'homepage')) {
  writeFileSync(join(mockups, bestand(d)), vul(d.slug, d.titel.toLowerCase()));
  console.log(`mockups/${bestand(d)}`);
}

/* Homepage v13: de gekozen animaties samen, en in de hero de bestaande
   film hero-v2 over de volle breedte in plaats van de foto ernaast. */
const film = `<div class="film" aria-hidden="true">
      <video autoplay muted loop playsinline preload="auto" poster="assets/hero-v2-poster.jpg">
        <source src="assets/hero-v2.webm" type="video/webm">
        <source src="assets/hero-v2.mp4" type="video/mp4">
      </video>
    </div>
    <div class="scrim" aria-hidden="true"></div>`;
const homepage = vul('homepage', 'homepage v13')
  .replace('<title>Casebuilder, demo homepage v13</title>', '<title>Casebuilder, homepage v13</title>')
  .replace('<header class="hero donker"', '<header class="hero hero-film donker"')
  .replace(/<!-- hero-beeld -->[\s\S]*?<!-- \/hero-beeld -->\n/, '')
  .replace('  <div class="wrap">\n    <div>\n      <p class="label">// Prijs direct', `  ${film}\n  <div class="wrap">\n    <div>\n      <p class="label">// Prijs direct`);
if (!homepage.includes('class="film"') || homepage.includes('hero-beeld')) throw new Error('hero van homepage v13 niet vervangen');
writeFileSync(join(mockups, 'homepage-v13.html'), homepage);
console.log('mockups/homepage-v13.html');

// De lijst voor de demobalk
writeFileSync(join(mockups, 'assets', 'demos.js'),
  `// Gegenereerd door scripts/bouw-demo-animaties.mjs, niet met de hand aanpassen.\nwindow.DEMOS = ${JSON.stringify(
    DEMOS.map(d => ({ slug: d.slug, titel: d.titel, bestand: bestand(d) })), null, 2)};\n`);
console.log('mockups/assets/demos.js');

// Het overzicht
const groepen = [...new Set(DEMOS.map(d => d.groep))];
const overzicht = `<!doctype html>
<html lang="nl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<!-- Gegenereerd door scripts/bouw-demo-animaties.mjs. -->
<title>Casebuilder, animaties</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;900&family=DM+Sans:wght@400;500;700&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/demo.css">
</head>
<body class="overzicht">
<header class="hero donker" data-ruit="veld">
  <div class="wrap">
    <div>
      <p class="label">// Animaties · ${DEMOS.length} pagina's</p>
      <h1>De site als technische tekening</h1>
      <p class="lead">Elke animatie op een eigen pagina, met dezelfde homepage-inhoud, zodat je ze los van elkaar kunt beoordelen. Met de pijlen in de demobalk blader je van de een naar de volgende.</p>
    </div>
  </div>
</header>
${groepen.map(groep => `<section class="sectie demogroep">
  <div class="wrap">
    <p class="label">// ${groep}</p>
    <ol class="demolijst">
      ${DEMOS.filter(d => d.groep === groep).map(d => `<li><a href="${bestand(d)}">
        <span class="nr">${String(DEMOS.indexOf(d) + 1).padStart(2, '0')}</span>
        <h3>${d.titel}</h3>
        <p>${d.uitleg}</p>
        <span class="link">Bekijk</span>
      </a></li>`).join('\n      ')}
    </ol>
  </div>
</section>`).join('\n')}
<script>
document.querySelectorAll('[data-ruit]').forEach(vlak => {
  const laag = document.createElement('div');
  laag.className = 'laag laag-' + vlak.dataset.ruit;
  laag.setAttribute('aria-hidden', 'true');
  vlak.prepend(laag);
});
</script>
</body>
</html>
`;
writeFileSync(join(mockups, 'demo-overzicht.html'), overzicht);
console.log('mockups/demo-overzicht.html');
