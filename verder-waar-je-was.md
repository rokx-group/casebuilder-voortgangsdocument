# Verder waar je was

Kort: de site onthoudt het laatst bekeken product of de laatste categorie, en
biedt dat één keer aan als strook. Besloten op 12 september 2026; gebouwd in
`mockups/assets/laatst.js`.

## Waarom

Zeventig procent van de orders begint als aanvraag, maar een deel van de
bezoekers oriënteert zich eerst: welke case hoort bij mijn gitaar, en wat kost
die. Die mensen komen terug. Zonder geheugen beginnen ze elke keer opnieuw bij
het begin van de boom (toepassing → categorie → apparaat).

Dit is bewust géén personalisatiesysteem. Eén regel: laat zien waar je was, met
de categorie erboven, en laat het weghalen.

## Waar hij staat, en waarom niet op de homepage

Allebei kan. De strook is eerst op de homepage gebouwd, direct onder de hero,
en daarna verplaatst naar de shop.

- **Shop (gekozen).** Daar ben je aan het rondkijken; een verwijzing naar wat je
  eerder bekeek hoort bij die handeling en concurreert niet met de drie
  ingangen.
- **Homepage (afgevallen, wél mogelijk).** Sterker signaal voor wie terugkomt,
  maar de homepage moet in het eerste scherm één vraag stellen — "hoe wil je
  beginnen?" — en een vierde ingang verzwakt dat.
- **Derde optie, niet gekozen:** klein in de bovenbalk op elke pagina. Altijd
  zichtbaar, maar dan staat het ook in de weg tijdens het bestellen.

Terugzetten op de homepage is één blok markup verplaatsen naar
`mockups/onderdelen/homepage-onder.html` plus de opmaak in
`assets/homepage-onder.css`; het script hoeft niet te veranderen.

## Hoe het werkt

- **Onthouden.** Een pagina die onthouden mag worden zet op `<body>`:
  `data-onthoud='{"naam":"…","pagina":"…html","categorie":"…","categoriepagina":"…html"}'`,
  of roept `window.cbOnthoud({…})` aan. Dat laatste doet de productpagina, die
  per product wisselt.
- **Tonen.** De pagina met de strook heeft `[data-verder]`; het script vult naam
  en links in en haalt `hidden` weg. Staat er niets, dan blijft de strook weg.
- **Opslag.** `localStorage`, sleutel `cb-laatst`, in try/catch. Er gaat niets
  naar een server; er staat geen profiel in, alleen de laatste pagina.
- **Vervaltermijn.** Dertig dagen. Daarna toont hij niets meer.
- **Weghalen.** "Vergeet dit" wist de sleutel en verbergt de strook.

## Veiligheid en privacy

- Links uit de opslag worden alleen gebruikt als ze op een gewone paginanaam
  lijken (`naam.html`, eventueel met `#anker`). Een `javascript:`-link uit een
  aangepaste opslag komt er niet in.
- Namen gaan via `textContent`, nooit als opmaak.
- Op de echte site hoort dit achter cookietoestemming: het is een
  voorkeurscookie, geen noodzakelijke. Zonder toestemming: niets opslaan, niets
  tonen.

## Wat er nog moet gebeuren

- Koppelen aan de cookiebanner zodra die er is.
- Bepalen of de shop ook "verder waar je was" toont als je uit een andere
  toepassing komt, of alleen binnen dezelfde.
