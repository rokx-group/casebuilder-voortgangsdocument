/**
 * De inhoud van de branchepagina's.
 *
 * Overgenomen uit de bestaande mockups (mockups/branche-*.html), niet
 * opnieuw geschreven. Die teksten zijn al op de schrijftoon van het merk
 * afgestemd: een werkplaatsdetail in plaats van een belofte, en een getal
 * in plaats van een bijvoeglijk naamwoord.
 *
 * Defensie is volledig uitgewerkt omdat dat de tak is die deze doorloop
 * moet bewijzen. De andere vijf hebben hun kop en hun eisen, zodat een
 * bezoeker die daar landt iets echts leest en niet een lege pagina.
 *
 * Let op bij het aanvullen: in dit segment noemen wij geen klantnamen, en
 * de cijfers uit de oude brandbook-generatie (Dakar, NPS, prijzen) zijn
 * niet bevestigd en mogen hier niet staan.
 */

export type Eis = { nr: string; kop: string; tekst: string };

export type Branche = {
  pad: string;
  naam: string;
  kop: string;
  lead: string;
  eisenKop: string;
  eisenLead: string;
  eisen: Eis[];
  /** Waar we op af te rekenen zijn. Bewust geen klantverhalen. */
  bewijsKop?: string;
  bewijsLead?: string;
  bewijs?: Eis[];
};

export const BRANCHES: Record<string, Branche> = {
  defensie: {
    pad: "defensie",
    naam: "Defensie",
    kop: "Transport dat aantoonbaar voldoet",
    lead: "Materiaalkeuze, documentatie en keuring liggen vóór de eerste zaagsnede vast. Wij bouwen naar specificatie en leveren het dossier mee.",
    eisenKop: "Vijf eisen die vooraf vastliggen",
    eisenLead:
      "Bij defensie begint het bij de specificatie, niet bij de maat. Wat hieronder staat bepaalt de bouw, en staat in de offerte.",
    eisen: [
      {
        nr: "01",
        kop: "Schokwaarden",
        tekst: "Val- en trilproeven volgens de opgegeven norm, met meetrapport bij oplevering.",
      },
      {
        nr: "02",
        kop: "Materiaalherkomst",
        tekst: "Herleidbaar per charge. Plaatmateriaal, beslag en schuim, elk met certificaat.",
      },
      {
        nr: "03",
        kop: "Klimaat en afdichting",
        tekst: "Stof- en waterdicht tot de gevraagde klasse, met drukventiel waar nodig.",
      },
      {
        nr: "04",
        kop: "Merking",
        tekst: "Volgens je eigen codering, gefreesd of geëtst, niet als sticker.",
      },
    ],
    bewijsKop: "Waarop je ons kunt afrekenen",
    bewijsLead:
      "In dit segment noemen wij geen klanten. Wat wij wél kunnen laten zien is hoe we werken en wat er wordt vastgelegd.",
    bewijs: [
      {
        nr: "01",
        kop: "Testrapport bij elke serie",
        tekst: "Val-, tril- en klimaattest op het eerste exemplaar, met meetwaarden en foto's.",
      },
      {
        nr: "02",
        kop: "Dossier per order",
        tekst:
          "Materiaalcertificaten, tekening met revisie, en de afwijkingen die zijn goedgekeurd.",
      },
      {
        nr: "03",
        kop: "Productie in Nederland",
        tekst: "Eén locatie in Doesburg. Geen tussenschakels, geen onderaanneming buiten de EU.",
      },
    ],
  },

  "audio-visueel": {
    pad: "audio-visueel",
    naam: "Audio-visueel",
    kop: "Cases die een heel seizoen meegaan",
    lead: "Het verschil met een gewone kist zit niet in één zware klap, maar in duizend kleine. Laden, lossen, stapelen, weer laden.",
    eisenKop: "Wat een tourcase moet overleven",
    eisenLead: "Wat hieronder staat bepaalt of een case na één seizoen nog dicht gaat.",
    eisen: [
      {
        nr: "01",
        kop: "Wielen die blijven",
        tekst:
          "Zwenkwielen met rem op een verstevigde bodem, de plek waar een case als eerste stukgaat.",
      },
      {
        nr: "02",
        kop: "Stapelbaar",
        tekst: "Een stapelrand die past op de kist eronder, ook als die van een andere maat is.",
      },
      {
        nr: "03",
        kop: "Snel open",
        tekst: "Sloten die met handschoenen aan te bedienen zijn, in het donker, op tijd.",
      },
    ],
  },

  "broadcast-en-media": {
    pad: "broadcast-en-media",
    naam: "Broadcast en media",
    kop: "Een case die vaker open gaat dan dicht",
    lead: "Wat hieronder staat bepaalt hoe snel er gedraaid kan worden.",
    eisenKop: "Vier dingen die op locatie tellen",
    eisenLead: "Op locatie is de kist geen opslag maar werkblad.",
    eisen: [
      {
        nr: "01",
        kop: "Uitpakken in volgorde",
        tekst: "De indeling volgt de opbouw, zodat niemand hoeft te zoeken terwijl de klok loopt.",
      },
      {
        nr: "02",
        kop: "Kabeldoorvoer",
        tekst: "Aansluiten met het deksel dicht, zodat de case in bedrijf kan blijven staan.",
      },
      {
        nr: "03",
        kop: "Gewicht per man",
        tekst: "Wat één persoon moet kunnen tillen bepaalt waar we de scheiding leggen.",
      },
    ],
  },

  "industrie-en-machinebouw": {
    pad: "industrie-en-machinebouw",
    naam: "Industrie en machinebouw",
    kop: "Wat een industriële case anders maakt",
    lead: "Het verschil zit zelden in de buitenmaat. Het zit in wat eromheen moet kloppen als de kist elke maand opnieuw de deur uit gaat.",
    eisenKop: "Waar het hier om draait",
    eisenLead: "Een case die naar de klant meegaat is een visitekaartje en gereedschap tegelijk.",
    eisen: [
      {
        nr: "01",
        kop: "Gewicht en zwaartepunt",
        tekst:
          "Boven de vijftig kilo bepaalt het zwaartepunt de indeling: waar de wielen komen, waar je tilt.",
      },
      {
        nr: "02",
        kop: "Vaste plek per onderdeel",
        tekst: "Uitgefreesd schuim, zodat je bij het inpakken ziet wat er nog ontbreekt.",
      },
      {
        nr: "03",
        kop: "Herhaalbaar",
        tekst: "Dezelfde case over twee jaar nog een keer, met dezelfde tolerantie.",
      },
    ],
  },

  "meet-en-testapparatuur": {
    pad: "meet-en-testapparatuur",
    naam: "Meet- en testapparatuur",
    kop: "Instrumenten die hun kalibratie houden",
    lead: "Bij meetapparatuur zit het werk niet in de kist maar erin. Wat hieronder staat bepaalt de uitfrezing, en staat in de offerte.",
    eisenKop: "Vier dingen die het interieur bepalen",
    eisenLead: "De buitenkant is de makkelijke helft.",
    eisen: [
      {
        nr: "01",
        kop: "Schokdemping op maat",
        tekst: "Het instrument bepaalt de hardheid van het schuim, niet andersom.",
      },
      {
        nr: "02",
        kop: "Aansluitingen bereikbaar",
        tekst: "Meten zonder uitpakken waar dat kan, met doorvoeren op de juiste hoogte.",
      },
      {
        nr: "03",
        kop: "Klimaat",
        tekst: "Drukventiel en afdichting, zodat condens niet in de behuizing trekt.",
      },
    ],
  },

  schaalmodellen: {
    pad: "schaalmodellen",
    naam: "Schaalmodellen",
    kop: "Er is geen tweede exemplaar",
    lead: "Dat verandert elke afweging: liever te veel schuim dan één keer te weinig.",
    eisenKop: "Vier dingen bij een onvervangbaar model",
    eisenLead: "Een model dat beschadigd aankomt, is niet te vervangen door een nieuwe bestelling.",
    eisen: [
      {
        nr: "01",
        kop: "Dragen op de sterke punten",
        tekst: "Het model rust waar het stevig is, niet op een uitstekend detail.",
      },
      {
        nr: "02",
        kop: "Uitnemen zonder aanraken",
        tekst: "Lussen of een uitneembare bodem, zodat niemand het model hoeft vast te pakken.",
      },
      {
        nr: "03",
        kop: "Stofvrij",
        tekst: "Een afdichting die stof buiten houdt, want stof afnemen kan niet altijd.",
      },
    ],
  },
};
