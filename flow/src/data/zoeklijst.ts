/**
 * De zoeklijst: waar iemand op kan zoeken en waar hij dan uitkomt.
 *
 * Drie soorten, en die volgorde is de bedoeling van besluit 10:
 * eerst producten die je meteen kunt kopen, dan categorieën met cases,
 * dan branches en gidsen voor wie nog niet aan bestellen toe is.
 *
 * De categorieën komen uit mockups/assets/toepassingen.js, dat is de
 * bestaande lijst. De branches hebben hier veel meer zoekwoorden dan
 * daar, en dat is de kern van deze app: wie "f16 vleugel" typt kent
 * zijn case niet, maar wij kennen zijn wereld. Dat mag geen "niets
 * gevonden" opleveren.
 */

export type Soort = "product" | "categorie" | "branche";

export type Regel = {
  soort: Soort;
  naam: string;
  groep: string;
  pad: string;
  /** Woorden die iemand intypt en die niet in de naam staan. */
  zoek?: string[];
  /** Alleen bij een product: de prijs in hele euro's, exclusief btw. */
  prijs?: number;
  /** Eén regel die zegt waaróm je hier terechtkomt. Verschijnt op de bestemming. */
  waarom?: string;
};

export const REGELS: Regel[] = [
  /* ── producten ─────────────────────────────────────────────
     De enige twee cases die als vast product bestaan (L1): vaste maten,
     alleen kleur en logo. Alles daarboven loopt via de configurator of
     de aanvraag. Niet uitbreiden zonder dat er een echte pagina onder
     hangt: een product zonder pagina is erger dan geen product. */
  {
    soort: "product",
    naam: "Gibson Les Paul Standard",
    groep: "Backline",
    pad: "/product",
    prijs: 214.8,
    zoek: ["les paul", "lespaul", "gibson", "gibson les paul"],
  },
  {
    soort: "product",
    naam: "Fender Stratocaster",
    groep: "Backline",
    pad: "/product",
    prijs: 199,
    zoek: ["strat", "stratocaster", "fender", "telecaster"],
  },

  /* ── categorieën ───────────────────────────────────────────
     Overgenomen uit toepassingen.js. Ze wijzen allemaal naar hetzelfde
     sjabloon, net als daar: er is één uitgewerkte categoriepagina en de
     rest leent die tot ze eigen inhoud heeft. */
  {
    soort: "categorie",
    naam: "Moving heads",
    groep: "Licht",
    pad: "/categorie",
    zoek: ["movinghead", "spot", "beam", "wash"],
  },
  {
    soort: "categorie",
    naam: "Wash- en spotarmaturen",
    groep: "Licht",
    pad: "/categorie",
    zoek: ["armatuur", "par", "led par"],
  },
  {
    soort: "categorie",
    naam: "Dimmerpacks en racks",
    groep: "Licht",
    pad: "/categorie",
    zoek: ["dimmer", "rack", "19 inch"],
  },
  {
    soort: "categorie",
    naam: "Blinders en strobes",
    groep: "Licht",
    pad: "/categorie",
    zoek: ["blinder", "strobe"],
  },
  {
    soort: "categorie",
    naam: "Hazers en rookmachines",
    groep: "Licht",
    pad: "/categorie",
    zoek: ["hazer", "rookmachine", "fazer"],
  },
  {
    soort: "categorie",
    naam: "Truss-hardware",
    groep: "Licht",
    pad: "/categorie",
    zoek: ["truss", "klem", "coupler"],
  },
  {
    soort: "categorie",
    naam: "Line-array en speakers",
    groep: "Audio",
    pad: "/categorie",
    zoek: ["speaker", "luidspreker", "linearray", "top", "sub"],
  },
  {
    soort: "categorie",
    naam: "Mengtafels",
    groep: "Audio",
    pad: "/categorie",
    zoek: ["mengtafel", "mixer", "midas", "m32", "x32", "console", "foh"],
  },
  {
    soort: "categorie",
    naam: "Kabelhaspels en multicore",
    groep: "Audio",
    pad: "/categorie",
    zoek: ["kabel", "haspel", "multicore", "stagebox"],
  },
  {
    soort: "categorie",
    naam: "Elektrische gitaren",
    groep: "Backline",
    pad: "/categorie",
    zoek: ["gitaar", "guitar", "stratocaster", "telecaster"],
  },
  {
    soort: "categorie",
    naam: "Basgitaren",
    groep: "Backline",
    pad: "/categorie",
    zoek: ["bas", "basgitaar", "precision", "jazz bass"],
  },
  {
    soort: "categorie",
    naam: "Akoestische gitaren",
    groep: "Backline",
    pad: "/categorie",
    zoek: ["akoestisch", "western", "klassieke gitaar"],
  },
  {
    soort: "categorie",
    naam: "Versterkers en cabinets",
    groep: "Backline",
    pad: "/categorie",
    zoek: ["versterker", "amp", "cabinet", "combo", "head"],
  },
  {
    soort: "categorie",
    naam: "Pedalboards",
    groep: "Backline",
    pad: "/categorie",
    zoek: ["pedal", "pedalboard", "effecten"],
  },
  {
    soort: "categorie",
    naam: "Drumhardware",
    groep: "Backline",
    pad: "/categorie",
    zoek: ["drum", "snare", "bekken", "hardware"],
  },
  {
    soort: "categorie",
    naam: "Keyboards en synths",
    groep: "Backline",
    pad: "/categorie",
    zoek: ["keyboard", "synth", "piano", "nord"],
  },
  {
    soort: "categorie",
    naam: "Blaasinstrumenten",
    groep: "Backline",
    pad: "/categorie",
    zoek: ["trompet", "saxofoon", "trombone", "blaas"],
  },
  {
    soort: "categorie",
    naam: "DJ-apparatuur",
    groep: "Backline",
    pad: "/categorie",
    zoek: ["dj", "controller", "cdj", "djm", "draaitafel", "mengpaneel", "pioneer"],
  },
  {
    soort: "categorie",
    naam: "Camerabodies",
    groep: "Camera",
    pad: "/categorie",
    zoek: ["camera", "body", "red", "arri", "sony fx"],
  },
  {
    soort: "categorie",
    naam: "Optiek en lenzensets",
    groep: "Camera",
    pad: "/categorie",
    zoek: ["lens", "lenzen", "optiek", "objectief"],
  },
  {
    soort: "categorie",
    naam: "Statieven en heads",
    groep: "Camera",
    pad: "/categorie",
    zoek: ["statief", "tripod", "head"],
  },
  {
    soort: "categorie",
    naam: "Monitoren",
    groep: "Camera",
    pad: "/categorie",
    zoek: ["monitor", "scherm", "display"],
  },
  {
    soort: "categorie",
    naam: "Regie- en switchkoffers",
    groep: "Camera",
    pad: "/categorie",
    zoek: ["regie", "switcher", "atem"],
  },
  {
    soort: "categorie",
    naam: "Drone en gimbal",
    groep: "Camera",
    pad: "/categorie",
    zoek: ["drone", "gimbal", "ronin", "dji"],
  },
  {
    soort: "categorie",
    naam: "Meetapparatuur",
    groep: "Medisch",
    pad: "/categorie",
    zoek: ["meetapparaat", "meten", "instrument"],
  },
  {
    soort: "categorie",
    naam: "Demokoffers met inlay",
    groep: "Medisch",
    pad: "/categorie",
    zoek: ["demokoffer", "sample", "verkoopkoffer"],
  },
  {
    soort: "categorie",
    naam: "Endoscopie",
    groep: "Medisch",
    pad: "/categorie",
    zoek: ["endoscoop", "scoop"],
  },
  {
    soort: "categorie",
    naam: "Laboratoriuminstrumenten",
    groep: "Medisch",
    pad: "/categorie",
    zoek: ["lab", "laboratorium", "analyse"],
  },
  {
    soort: "categorie",
    naam: "Trolleycases",
    groep: "Medisch",
    pad: "/categorie",
    zoek: ["trolley", "wielen", "rolkoffer"],
  },
  {
    soort: "categorie",
    naam: "Servicekoffers",
    groep: "Industrie",
    pad: "/categorie",
    zoek: ["service", "monteur", "buitendienst"],
  },
  {
    soort: "categorie",
    naam: "Kalibratieapparatuur",
    groep: "Industrie",
    pad: "/categorie",
    zoek: ["kalibratie", "ijken"],
  },
  {
    soort: "categorie",
    naam: "Handgereedschap",
    groep: "Industrie",
    pad: "/categorie",
    zoek: ["gereedschap", "tool", "sleutel"],
  },
  {
    soort: "categorie",
    naam: "Sensoren en dataloggers",
    groep: "Industrie",
    pad: "/categorie",
    zoek: ["sensor", "datalogger", "meetkast"],
  },
  {
    soort: "categorie",
    naam: "Standmateriaal",
    groep: "Beurs",
    pad: "/categorie",
    zoek: ["stand", "beurs", "expo"],
  },
  {
    soort: "categorie",
    naam: "Banners en kokers",
    groep: "Beurs",
    pad: "/categorie",
    zoek: ["banner", "koker", "rollup"],
  },
  {
    soort: "categorie",
    naam: "Displays en schermen",
    groep: "Beurs",
    pad: "/categorie",
    zoek: ["display", "led scherm", "videowall"],
  },
  {
    soort: "categorie",
    naam: "Catering en bar",
    groep: "Beurs",
    pad: "/categorie",
    zoek: ["catering", "bar", "keuken"],
  },
  /* ── branches ──────────────────────────────────────────────
     Hier zit het werk. De zoekwoorden staan op apparaatniveau, niet op
     bedrijfstakniveau: niemand typt "ik zit in de defensiebranche", men
     typt wat er in de kist moet. Elke branche heeft daarom de woorden
     van zijn eigen vakgebied, inclusief merknamen en jargon.

     Branches staan onderaan omdat ze het minst specifiek zijn. Wie
     "camera" typt wil de cases voor camerabodies zien, niet eerst de
     hele broadcastbranche. Bij gelijke score wint wat hierboven staat. */
  {
    soort: "branche",
    naam: "Defensie",
    groep: "Branche",
    pad: "/branche/defensie",
    waarom:
      "valt onder defensie-eisen: norm, dossier en keuring liggen vóór de eerste zaagsnede vast",
    zoek: [
      "defensie",
      "leger",
      "militair",
      "krijgsmacht",
      "landmacht",
      "marine",
      "luchtmacht",
      "navo",
      "veiligheidsregio",
      "f16",
      "f35",
      "straaljager",
      "jachtvliegtuig",
      "vleugel",
      "romp",
      "munitie",
      "wapen",
      "geweer",
      "nachtkijker",
      "warmtebeeld",
      "thermisch",
      "radar",
      "antenne",
      "verbindingsset",
      "radioset",
      "manpack",
      "helm",
      "vest",
      "uitrusting",
      "veldkeuken",
      "genie",
      "explosieven",
      "eod",
      "drone militair",
      "uav",
      "sensorkop",
      "richtmiddel",
      "vizier",
      "optiek militair",
    ],
  },
  {
    soort: "branche",
    naam: "Broadcast en media",
    groep: "Branche",
    pad: "/branche/broadcast-en-media",
    waarom: "gaat mee als productiemiddel: snel in en uit, en elke dag opnieuw",
    zoek: [
      "broadcast",
      "tv",
      "televisie",
      "omroep",
      "media",
      "film",
      "productiehuis",
      "studio",
      "ob-wagen",
      "regiewagen",
      "zender",
      "satelliet",
      "uplink",
      "teleprompter",
      "autocue",
      "microfoonset",
      "intercom",
    ],
  },
  {
    soort: "branche",
    naam: "Audio-visueel",
    groep: "Branche",
    pad: "/branche/audio-visueel",
    waarom: "gaat de weg op: elke week op- en afbouwen, en dat een heel seizoen lang",
    zoek: [
      "av",
      "podium",
      "theater",
      "evenement",
      "concert",
      "tour",
      "verhuur",
      "rental",
      "licht en geluid",
      "festival",
      "backline",
      "crew",
      "truck",
      "stage",
      "band",
      "dj",
      "club",
      "zaal",
    ],
  },
  {
    soort: "branche",
    naam: "Industrie en machinebouw",
    groep: "Branche",
    pad: "/branche/industrie-en-machinebouw",
    waarom: "gaat naar de klant toe: een monteur die uitpakt, gebruikt en weer inpakt",
    zoek: [
      "industrie",
      "machinebouw",
      "fabriek",
      "productie",
      "oem",
      "technische dienst",
      "monteur",
      "buitendienst",
      "servicetechnicus",
      "onderhoud",
      "robot",
      "aandrijving",
      "pomp",
      "klep",
      "lager",
    ],
  },
  {
    soort: "branche",
    naam: "Meet- en testapparatuur",
    groep: "Branche",
    pad: "/branche/meet-en-testapparatuur",
    waarom: "draagt instrumenten die hun kalibratie moeten houden onderweg",
    zoek: [
      "meettechniek",
      "testen",
      "kalibratie",
      "meetlab",
      "inspectie",
      "oscilloscoop",
      "spectrumanalyzer",
      "multimeter",
      "datalogger",
      "sensor",
      "ijken",
      "meetbrug",
      "netwerkanalyzer",
      "thermokoppel",
    ],
  },
  {
    soort: "branche",
    naam: "Schaalmodellen",
    groep: "Branche",
    pad: "/branche/schaalmodellen",
    waarom: "vervoert iets dat onvervangbaar is: één exemplaar, met de hand gemaakt",
    zoek: [
      "schaalmodel",
      "maquette",
      "prototype",
      "modelbouw",
      "architect",
      "presentatiemodel",
      "mockup",
      "designmodel",
      "kunstwerk",
      "sculptuur",
      "vitrine",
    ],
  },
];

/**
 * De zes vakken waarin de categorieën op /case-voor staan.
 *
 * De lijst hierboven kent zeven groepen, het scherm toont er zes: licht
 * en audio staan samen onder "AV en licht", want wie een moving head
 * vervoert en wie een mengtafel vervoert komen uit dezelfde hoek en
 * herkennen zich in hetzelfde vak. Dat is de indeling die op /case-voor
 * al gebruikt wordt; hier staat alleen wélke groepen er in welk vak vallen.
 *
 * `toon` is het aantal dat we noemen. Een getal maakt van een kop een
 * belofte die je kunt natellen, en dat is precies waarom het er staat.
 */
export const VAKKEN: { naam: string; groepen: string[]; toon: number }[] = [
  { naam: "AV en licht", groepen: ["Licht", "Audio"], toon: 22 },
  { naam: "Backline en muziek", groepen: ["Backline"], toon: 118 },
  { naam: "Broadcast en camera", groepen: ["Camera"], toon: 9 },
  { naam: "Medisch en lab", groepen: ["Medisch"], toon: 14 },
  { naam: "Industrie en meettechniek", groepen: ["Industrie"], toon: 11 },
  { naam: "Evenement en beursbouw", groepen: ["Beurs"], toon: 7 },
];

/** De categorieën van één vak, in de volgorde waarin ze in de lijst staan. */
export function categorieenVan(vak: (typeof VAKKEN)[number]): Regel[] {
  return REGELS.filter((r) => r.soort === "categorie" && vak.groepen.includes(r.groep));
}
