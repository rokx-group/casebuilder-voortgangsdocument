# Case-voor v4 — jouw volgende stop

## Ontwerprichting

Deze pagina is een doorverwijzende ingang. De bezoeker begint bij de eigen apparatuur of het eigen werk; de site helpt de volgende stap kiezen. De visuele lijn is: herkenning in de hero → werelden met fotografie → concrete webshopmodellen → ruimte voor een eigen aanvraag.

De zoekbalk staat direct in de eerste schermweergave. De drie sfeerbeelden worden alleen op verzoek gewisseld, zodat beweging het zoeken niet verstoort. De branchebeelden staan in een verspringende indeling met grote, aanklikbare foto's. De labels Branche, Webshop en Offerte staan bij de zoekresultaten, waar ze de bestemming verduidelijken.

Geen aantallen, populariteitsclaims, prijzen of beschikbaarheid toegevoegd: die moeten uit de catalogus komen. De oude 533-casesclaim en links van verschillende apparaten naar hetzelfde gitaarsjabloon zijn niet overgenomen.

## Klikbare voorbeeldroutes

- `Defensie` → `branche-defensie-v2.html`.
- `Camera` → `branche-broadcast-en-media-v1.html`.
- `Audio`, `Gitaar` of `Moving head` → `branche-audio-visueel-v2.html`.
- `Rackcase`, `Koffer` of `Hoedcase` → de betreffende productpagina op de echte CaseBuilder-webshop.
- Onbekende apparatuur, bijvoorbeeld `Midas M32` → aanvraag met de volledige zoekvraag in `?vervoeren=`. Er wordt geen ongecontroleerde productmatch verzonnen.
- Bij meerdere resultaten kiest de bezoeker zelf. De aanvraag blijft ook naast gevonden resultaten bereikbaar.

Dit is een beperkte, lokale ontwerpselectie, geen volledige cataloguszoekmachine. De bestaande gedeelde `toepassingen.js` is bewust niet gewijzigd: andere pagina's blijven hun huidige gedrag houden.

## Bestanden

- `mockups/case-voor-v4.html` — pagina.
- `mockups/assets/case-voor-v4.css` — paginaspecifieke stijl.
- `mockups/assets/case-voor-v4.js` — voorbeeldroutes, zoeken en sfeerwissel.
- Bestaande `brand.css`, `footer.css`, beeldbestanden en navigatiescripts — gedeelde afhankelijkheden.

## Fotografie en inhoud

Bestaande projectbeelden: `foto-audio-visueel.jpg`, `foto-industrie-en-machinebouw.jpg`, `foto-flightcase-beurs.jpg` en de drie productfoto's. Deze zijn visueel geïnspecteerd. De bestaande fotoverantwoording komt niet bij alle bestanden overeen met het huidige beeld; de oorspronkelijke rechten/provenance van die projectbeelden moeten voor productie worden bevestigd.

De aanvullende show-, studio- en defensiefoto's zijn al toegevoegd bij de brancheontwerpen. Zie `audio-visueel-bronnen.md` en `defensie-bronnen.md` voor herkomst. De naamsvermelding, licenties en bewerkingen worden op deze pagina vermeld. Ze illustreren een werkveld en gelden niet als bewijs van klantrelaties.

Webshopbestemmingen gecontroleerd op 18 september 2026:

- [Rackcase dubbel](https://www.casebuilder.com/nl-nl/flightcase-rackcase-dubbel-deksel.html)
- [Koffer](https://www.casebuilder.com/nl-nl/flightcase-koffer.html)
- [Hoedcase](https://www.casebuilder.com/nl-nl/flightcase-hoedcase.html)

## Controle en verdere uitwerking

Getest op 1440, 1024, 768, 390 en 320 pixels: geen horizontale paginaoverloop of ontbrekende beelden. Zoekroutes, behouden aanvraagtekst, toetsenbordbediening, Escape, sfeerwissel en veilige tekstweergave gecontroleerd. Geen JavaScript-runtimefouten tijdens de controle.

Na akkoord op het ontwerp: aansluiten op echte productdata en zoekwoorden, alleen passende producten als match tonen, en de verdere branche- en aanvraagpagina's op hetzelfde niveau brengen. De variant is lokaal; er is niets gepubliceerd.
