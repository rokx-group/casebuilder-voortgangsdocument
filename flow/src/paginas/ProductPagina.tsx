/**
 * De vaste case voor één apparaat. In de ladder is dit L1.
 *
 * De harde regel op dit scherm: de maten liggen vast, alleen kleur, logo
 * en aantal zijn te kiezen, en er staat nergens "configureer met deze
 * maten". Wie hier is heeft een apparaat dat wij kennen; hem alsnog een
 * tekentafel voorschotelen maakt van een bestelling een klus. Wil hij
 * tóch andere maten, dan is dat een aparte uitgang onderaan.
 *
 * Alle maten, gewichten en de prijs komen uit
 * mockups/case-voor-gibson-les-paul-v2.html.
 */

import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Beslag } from "../onderdelen/Beslag";
import { Bijschrift, Label } from "../onderdelen/Label";

const KLEUREN = [
  { naam: "Zwart", hex: "#1a1a1a" },
  { naam: "Navy", hex: "#003352" },
  { naam: "Zilver", hex: "#c8ccd1" },
  { naam: "Rood", hex: "#8c1c1c" },
];

const SPECS = [
  {
    label: "Binnenmaat",
    waarde: "1.010 × 360 × 100",
    uitleg: "Instrument plus 5 mm speling, zodat het schuim het werk doet en niet de kast.",
  },
  {
    label: "Schuimdikte",
    waarde: "25 mm rondom",
    uitleg: "Genoeg voor busvervoer. Ga je vliegen, dan is 40 mm één klik verder.",
  },
  {
    label: "Gewicht",
    waarde: "circa 9 kg leeg",
    uitleg: "Met gitaar rond de 13 kg.",
  },
];

export function ProductPagina() {
  const [zoekargumenten] = useSearchParams();
  const vraag = zoekargumenten.get("vervoeren")?.trim() ?? "";
  const [kleur, zetKleur] = useState(KLEUREN[0].naam);
  const [aantal, zetAantal] = useState(1);

  return (
    <>
      <nav className="border-lijn border-b bg-white">
        <div className="mx-auto max-w-[1240px] px-6 py-3">
          <p className="caption">
            <Link to="/case-voor" className="hover:text-navy">
              Wat ga je vervoeren
            </Link>
            {" / "}
            <Link to="/categorie" className="hover:text-navy">
              Gitaar
            </Link>
            {" / "}
            <span className="text-navy">Gibson Les Paul</span>
          </p>
        </div>
      </nav>

      <section className="mx-auto grid max-w-[1240px] gap-12 px-6 py-14 lg:grid-cols-[1.1fr_1fr]">
        {/* Het beeldvlak. Ruitjespapier in plaats van een grijs vlak: dit
            is een technische tekening, geen ontbrekende foto. */}
        <div className="ruitvlak relative min-h-[22rem] border-2 border-navy bg-vlak">
          <Beslag />
          <p className="caption absolute bottom-5 left-6 text-navy">
            Hoedcase · 1.060 × 410 × 150 mm
          </p>
        </div>

        <div>
          {vraag ? <p className="caption mb-4">Je zocht op “{vraag}”</p> : null}
          <Label>Vaste case voor dit instrument</Label>
          <h1 className="mt-3">Flightcase voor een Gibson Les Paul</h1>
          <p className="mt-5 max-w-[50ch] text-gedempt text-klein">
            Een Les Paul is 1.000 mm lang, 350 breed en 90 dik, met een massieve mahonie body van
            ruim vier kilo. Het gewicht zit in de kast, de kwetsbaarheid in de hals. Het deksel gaat
            er helemaal af, dus je legt de gitaar erin in plaats van hem erin te wurmen. De
            uitsparing ondersteunt de hals onder de kopplaat, waar een Les Paul het snelst breekt.
          </p>

          <p className="mt-7 font-display font-black text-navy text-sectie leading-none tracking-[var(--tracking-display)]">
            € 214,80
          </p>
          <p className="caption mt-1">excl. btw · maten liggen vast</p>

          <fieldset className="mt-8">
            <legend className="label text-navy">Kleur</legend>
            <div className="mt-3 flex gap-2">
              {KLEUREN.map((k) => (
                <button
                  key={k.naam}
                  type="button"
                  onClick={() => zetKleur(k.naam)}
                  aria-pressed={kleur === k.naam}
                  className={`h-11 w-11 border-2 ${kleur === k.naam ? "border-navy" : "border-lijn"}`}
                  style={{ backgroundColor: k.hex }}
                >
                  <span className="sr-only">{k.naam}</span>
                </button>
              ))}
              <span className="caption self-center pl-2">{kleur}</span>
            </div>
          </fieldset>

          <div className="mt-7 flex flex-wrap items-end gap-4">
            <div>
              <label htmlFor="aantal" className="label text-navy">
                Aantal
              </label>
              <input
                id="aantal"
                type="number"
                min={1}
                value={aantal}
                onChange={(e) => zetAantal(Math.max(1, Number(e.target.value)))}
                className="mt-2 w-24 border-2 border-navy bg-white px-4 py-3 text-body outline-none"
              />
            </div>
            <button
              type="button"
              className="bg-navy px-8 py-4 font-display font-bold text-klein text-white uppercase tracking-[var(--tracking-display)] hover:bg-signaal-diep"
            >
              In winkelwagen
            </button>
          </div>

          <p className="mt-4 text-gedempt text-klein">
            Je eigen logo op het deksel kan, als PDF, SVG of PNG. Dat regelen we na de bestelling.
          </p>
        </div>
      </section>

      <section className="border-lijn border-y bg-vlak">
        <div className="mx-auto grid max-w-[1240px] gap-8 px-6 py-12 md:grid-cols-3">
          {SPECS.map((s) => (
            <div key={s.label} className="border-navy border-t-2 pt-4">
              <Bijschrift toon="navy">{s.label}</Bijschrift>
              <p className="mt-2 font-display font-bold text-lead text-navy uppercase tracking-[var(--tracking-display)]">
                {s.waarde}
              </p>
              <p className="mt-2 text-gedempt text-klein">{s.uitleg}</p>
            </div>
          ))}
        </div>
      </section>

      {/* De uitgang voor wie een andere maat nodig heeft. Dit is het enige
          punt waar de configurator genoemd wordt, en bewust pas ná de
          bestelknop: wie past, hoeft niet te tekenen. */}
      <section className="mx-auto max-w-[1240px] px-6 py-14">
        <div className="max-w-[56ch] border-navy border-l-2 pl-8">
          <Label toon="navy">Als dit niet is wat je zoekt</Label>
          <h2 className="mt-3">Andere maat nodig</h2>
          <p className="mt-4 text-gedempt text-klein">
            Je begint met de maten van deze kist en past ze aan: eigen afmetingen, ronde of
            vierkante hoeken, een keuze uit sloten. Wil je meer, dan ga je vandaaruit door naar de
            volledige editor.
          </p>
          <Link
            to={`/offerte?vervoeren=${encodeURIComponent(vraag || "Gibson Les Paul, andere maat")}`}
            className="mt-6 inline-block border-2 border-navy px-7 py-4 font-display font-bold text-klein text-navy uppercase tracking-[var(--tracking-display)] hover:bg-navy hover:text-white"
          >
            Op jouw maat
          </Link>
        </div>
      </section>
    </>
  );
}
