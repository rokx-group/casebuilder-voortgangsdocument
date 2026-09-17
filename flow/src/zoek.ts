/**
 * Zoeken in de lijst.
 *
 * De opdracht is niet "vind de juiste rij" maar "laat niemand vastlopen".
 * Daarom geeft dit bestand altijd een uitkomst: is er niets gevonden, dan
 * is de aanvraag het antwoord en niet een lege lijst. Zo'n leeg scherm is
 * precies waar een bezoeker afhaakt, en juist die bezoeker is de klant
 * waar het merendeel van de orders vandaan komt.
 *
 * Vier stappen, van streng naar soepel. Wie op stap één raak is, komt aan
 * de rest niet toe.
 */

import { REGELS, type Regel, type Soort } from "./data/zoeklijst";

/** Zonder accenten, in kleine letters, enkele spaties. */
function normaliseer(tekst: string): string {
  return tekst
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Nederlands laat bij het meervoud een dubbele klinker vallen: gitaar
 * wordt gitaren, haak wordt haken. Wie "gitaar" typt zou "Elektrische
 * gitaren" anders niet vinden, en dan lijkt de zoekfunctie stuk terwijl
 * de categorie er gewoon staat. Door aa/ee/oo/uu tot één letter terug te
 * brengen worden beide vormen hetzelfde woord.
 */
function stam(woord: string): string {
  let uit = "";
  for (let i = 0; i < woord.length; i++) {
    if (i > 0 && woord[i] === woord[i - 1] && "aeou".includes(woord[i])) continue;
    uit += woord[i];
  }
  return uit.replace(/(en|s)$/, "");
}

/**
 * Woorden die niets zeggen over wát je vervoert. Zonder deze lijst raakt
 * "case" elke regel en "voor" geen enkele, en in beide gevallen zegt de
 * uitslag niets. Overgenomen uit toepassingen.js en aangevuld met de
 * woorden waarmee mensen een hele zin typen in plaats van een term.
 */
const VULWOORDEN = new Set([
  "case",
  "cases",
  "flightcase",
  "flightcases",
  "kist",
  "koffer",
  "hoes",
  "tas",
  "voor",
  "een",
  "de",
  "het",
  "en",
  "met",
  "van",
  "op",
  "in",
  "die",
  "dat",
  "ik",
  "we",
  "wij",
  "zoek",
  "zoeken",
  "nodig",
  "heb",
  "hebben",
  "wil",
  "willen",
  "graag",
  "maken",
  "laten",
  "mijn",
  "ons",
  "onze",
  "is",
  "zijn",
  "moet",
  "moeten",
  "iets",
  "wat",
  "waar",
  "hoe",
  "goede",
  "goed",
  "nieuwe",
  "nieuw",
]);

/** De zin in bruikbare woorden, vulwoorden eruit. */
function woorden(vraag: string): string[] {
  const los = normaliseer(vraag).split(" ").filter(Boolean);
  const bruikbaar = los.filter((w) => !VULWOORDEN.has(w) && w.length > 1);
  // Staat er na het filteren niets meer, dan typte iemand alleen vulwoorden.
  // Dan is zijn eigen tekst nog altijd beter dan niets.
  return bruikbaar.length ? bruikbaar : los;
}

export type Gevonden = Regel & { score: number };

/**
 * Eén regel scoren tegen de ingetypte woorden.
 *
 * 4 de hele vraag is precies deze term
 * 3 een woord is precies deze term
 * 2 een woord begint met deze term, of de term begint met dit woord
 *   (zo vindt "gitaarcase" de term "gitaar", en "gitaar" de term "gitaarhoes")
 * 1 de term komt ergens in het woord voor
 *
 * Meerdere rake woorden tellen op, zodat "av kabel" hoger scoort op
 * Kabelhaspels dan op alles wat alleen "av" raakt.
 */
function scoor(regel: Regel, vraag: string, delen: string[]): number {
  const termen = [regel.naam, ...(regel.zoek ?? [])].map((t) => normaliseer(t));
  const heel = normaliseer(vraag);
  let totaal = 0;

  for (const term of termen) {
    const termStam = stam(term);
    if (term === heel) return 4;

    for (const woord of delen) {
      const woordStam = stam(woord);
      if (term === woord || termStam === woordStam) {
        totaal += 3;
      } else if (woordStam.startsWith(termStam) || termStam.startsWith(woordStam)) {
        // Alleen bij een stam van betekenis: "de" mag niet half Nederland raken.
        if (termStam.length >= 3 && woordStam.length >= 3) totaal += 2;
      } else if (termStam.length >= 4 && woordStam.includes(termStam)) {
        totaal += 1;
      }
    }
  }
  return totaal;
}

/** Alles wat raak is, hoogste score eerst, bij gelijke stand de lijstvolgorde. */
export function zoek(vraag: string): Gevonden[] {
  const delen = woorden(vraag);
  if (!normaliseer(vraag)) return [];

  return REGELS.map((regel, plek) => ({ regel, plek, score: scoor(regel, vraag, delen) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || a.plek - b.plek)
    .map((r) => ({ ...r.regel, score: r.score }));
}

export type Uitslag = {
  /** Wat de bezoeker typte, onbewerkt. Gaat mee naar de bestemming. */
  vraag: string;
  /** De bestemming waar enter je heen brengt. Nooit leeg. */
  beste: Gevonden | null;
  /** Per soort gegroepeerd, voor het suggestiepaneel. Besluit 10. */
  groepen: { soort: Soort; kop: string; treffers: Gevonden[] }[];
  /** Waar of niet: we konden er niets van maken en sturen naar de aanvraag. */
  naarAanvraag: boolean;
};

const KOPPEN: Record<Soort, string> = {
  product: "Producten",
  categorie: "Categorieën",
  branche: "Branches en gidsen",
};

/** Per soort hoeveel er hoogstens in het paneel passen voordat het een lijst wordt om door te nemen. */
const MAX_PER_SOORT: Record<Soort, number> = { product: 3, categorie: 4, branche: 2 };

export function beoordeel(vraag: string): Uitslag {
  const alles = zoek(vraag);

  const groepen = (["product", "categorie", "branche"] as Soort[])
    .map((soort) => ({
      soort,
      kop: KOPPEN[soort],
      treffers: alles.filter((t) => t.soort === soort).slice(0, MAX_PER_SOORT[soort]),
    }))
    .filter((g) => g.treffers.length > 0);

  return {
    vraag: vraag.trim(),
    beste: alles[0] ?? null,
    groepen,
    naarAanvraag: alles.length === 0,
  };
}

/**
 * Waar enter je heen brengt. Vonden we niets, dan de aanvraag met de
 * getypte tekst mee, zodat niemand hoeft over te typen wat hij net zei.
 */
export function bestemming(uitslag: Uitslag): string {
  if (!uitslag.beste) return `/offerte?vervoeren=${encodeURIComponent(uitslag.vraag)}`;
  return `${uitslag.beste.pad}?vervoeren=${encodeURIComponent(uitslag.vraag)}`;
}
