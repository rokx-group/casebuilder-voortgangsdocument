/**
 * De categoriepagina: het niveau tussen "wat ga je vervoeren" en één
 * bepaald apparaat.
 *
 * Wat hier staat is de vraag die de bezoeker nog moet beantwoorden:
 * welk model precies. Staat zijn model er niet bij, dan is dat geen
 * doodlopende weg maar de aanvraag, en die staat er onderaan als
 * gelijkwaardige uitgang.
 */

import { Link, useSearchParams } from "react-router-dom";
import { Label } from "../onderdelen/Label";

const APPARATEN = [
  {
    naam: "Gibson Les Paul",
    regel: "vaste case, uit voorraad",
    pad: "/product",
    prijs: "€ 214,80",
  },
  {
    naam: "Fender Stratocaster",
    regel: "vaste case, uit voorraad",
    pad: "/product",
    prijs: "€ 199,00",
  },
  { naam: "Akoestische gitaar", regel: "op maat, dreadnought of parlour", pad: null, prijs: null },
  { naam: "Basgitaar", regel: "op maat, langere hals", pad: null, prijs: null },
];

export function CategoriePagina() {
  const [zoekargumenten] = useSearchParams();
  const vraag = zoekargumenten.get("vervoeren")?.trim() ?? "";
  const naam = zoekargumenten.get("naam")?.trim() || "Elektrische gitaren";

  return (
    <>
      <nav className="border-lijn border-b bg-white">
        <div className="mx-auto max-w-[1240px] px-6 py-3">
          <p className="caption">
            <Link to="/case-voor" className="hover:text-navy">
              Wat ga je vervoeren
            </Link>
            {" / "}
            <span className="text-navy">{naam}</span>
          </p>
        </div>
      </nav>

      <section className="ruitvlak border-lijn border-b bg-vlak">
        <div className="mx-auto max-w-[1240px] px-6 py-16">
          {vraag ? <p className="caption mb-4">Je zocht op “{vraag}”</p> : null}
          <Label>Categorie</Label>
          <h1 className="mt-3 max-w-[16ch]">Cases voor {naam.toLowerCase()}</h1>
          <p className="mt-5 max-w-[54ch] text-lead text-gedempt">
            De maat van het instrument bepaalt de kist, niet andersom. Voor de modellen die we vaker
            bouwen ligt de maatvoering vast, de rest meten we in.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-6 py-16">
        <h2>Welk model vervoer je</h2>
        <ul className="mt-8 border-lijn border-t">
          {APPARATEN.map((a) => (
            <li key={a.naam} className="border-lijn border-b">
              {a.pad ? (
                <Link
                  to={`${a.pad}?vervoeren=${encodeURIComponent(vraag || a.naam)}`}
                  className="group flex flex-wrap items-baseline gap-x-6 gap-y-1 py-5"
                >
                  <span className="font-display font-bold text-lead text-navy uppercase tracking-[var(--tracking-display)] group-hover:text-signaal-diep">
                    {a.naam}
                  </span>
                  <span className="caption">{a.regel}</span>
                  <span className="ml-auto font-display font-bold text-navy">{a.prijs}</span>
                </Link>
              ) : (
                <Link
                  to={`/offerte?vervoeren=${encodeURIComponent(a.naam)}`}
                  className="group flex flex-wrap items-baseline gap-x-6 gap-y-1 py-5"
                >
                  <span className="font-display font-bold text-lead text-navy uppercase tracking-[var(--tracking-display)] group-hover:text-signaal-diep">
                    {a.naam}
                  </span>
                  <span className="caption">{a.regel}</span>
                  <span className="caption ml-auto text-navy">Prijs op aanvraag</span>
                </Link>
              )}
            </li>
          ))}
        </ul>

        <p className="mt-10 text-gedempt text-klein">
          Staat je model er niet bij?{" "}
          <Link
            to={`/offerte?vervoeren=${encodeURIComponent(vraag)}`}
            className="text-navy underline underline-offset-2 hover:text-signaal-diep"
          >
            Stuur je maten op, dan tekenen wij hem
          </Link>
        </p>
      </section>
    </>
  );
}
