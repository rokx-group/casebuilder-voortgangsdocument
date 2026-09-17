/**
 * /case-voor — waar iemand zegt wat hij bij zich heeft.
 *
 * De opzet volgt besluit 10: de suggesties staan per soort gegroepeerd,
 * eerst producten die je meteen kunt kopen, dan categorieën, dan branches
 * en gidsen. En er is altijd een uitweg, ook als we niets herkennen.
 *
 * Twee dingen zijn bewust anders dan een gewone zoekbalk. Er staat niet
 * "zoeken" maar een vraag, want de bezoeker zoekt geen artikel maar heeft
 * iets in zijn handen. En bij nul treffers verschijnt geen lege staat maar
 * de aanvraag: dat is hier geen mislukking maar de grootste route.
 */

import { type FormEvent, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { categorieenVan, VAKKEN } from "../data/zoeklijst";
import { Beslag } from "../onderdelen/Beslag";
import { Label } from "../onderdelen/Label";
import { beoordeel, bestemming } from "../zoek";

const VOORBEELDEN = ["Gibson Les Paul", "moving head", "F16 vleugel", "spectrumanalyzer"];

export function ZoekPagina() {
  const [vraag, zetVraag] = useState("");
  const naar = useNavigate();
  const uitslag = useMemo(() => beoordeel(vraag), [vraag]);
  const typt = vraag.trim().length > 1;

  function verstuur(e: FormEvent) {
    e.preventDefault();
    if (!vraag.trim()) return;
    naar(bestemming(uitslag));
  }

  return (
    <>
      {/* ── de vraag ───────────────────────────────────────────
          Links breed, rechts smal: de vraag weegt zwaarder dan de
          geruststelling ernaast, en dat hoor je aan de verdeling te zien.
          Geen gecentreerde kop met twee knoppen eronder. */}
      <section className="ruitvlak border-lijn border-b bg-vlak">
        <div className="mx-auto grid max-w-[1240px] gap-10 px-6 py-16 lg:grid-cols-[1.6fr_1fr] lg:py-24">
          <div>
            <Label>Wat gaat erin</Label>
            <h1 className="mt-4">
              Zeg wat je vervoert,
              <br />
              wij weten de rest
            </h1>
            <p className="mt-5 max-w-[46ch] text-lead text-gedempt">
              Je hoeft niet te weten hoe een flightcase heet. Noem het apparaat, het merk of waar je
              mee werkt.
            </p>

            <search>
              <form onSubmit={verstuur} className="relative mt-8 max-w-[34rem]">
                <div className="relative border-2 border-navy bg-white">
                  <Beslag />
                  <label htmlFor="vervoeren" className="sr-only">
                    Wat ga je vervoeren?
                  </label>
                  <input
                    id="vervoeren"
                    value={vraag}
                    onChange={(e) => zetVraag(e.target.value)}
                    autoComplete="off"
                    spellCheck={false}
                    placeholder="Bijvoorbeeld: Gibson Les Paul, 19 inch rack, moving head"
                    className="w-full bg-transparent px-7 py-5 text-body text-inkt outline-none placeholder:text-gedempt"
                  />
                </div>
                <button
                  type="submit"
                  className="mt-3 bg-navy px-7 py-4 font-display font-bold text-klein text-white uppercase tracking-[var(--tracking-display)] hover:bg-signaal-diep"
                >
                  Laat zien wat past
                </button>
              </form>
            </search>

            {!typt && (
              <p className="caption mt-5">
                Probeer{" "}
                {VOORBEELDEN.map((v, i) => (
                  <span key={v}>
                    {i > 0 && " · "}
                    <button
                      type="button"
                      onClick={() => zetVraag(v)}
                      className="text-navy underline underline-offset-2"
                    >
                      {v}
                    </button>
                  </span>
                ))}
              </p>
            )}
          </div>

          {/* De geruststelling voor wie zijn apparaat hier niet gaat vinden.
              Staat naast het veld en niet eronder, zodat hij gelezen wordt
              vóór het typen en niet pas na een mislukte poging. */}
          <aside className="self-end border-navy border-l-2 pl-6 lg:pl-8">
            <Label toon="navy">Staat het er niet bij</Label>
            <p className="mt-3 text-klein text-gedempt">
              Dan bouwen we hem op maat. Stuur wat je hebt, een datasheet is genoeg, een foto van
              een servet ook. Zo begint het merendeel van onze orders.
            </p>
          </aside>
        </div>
      </section>

      {/* ── de uitslag ─────────────────────────────────────────
          Verschijnt zodra er getypt wordt, in de plaats van de index.
          Twee antwoorden tegelijk op één vraag leest als ruis. */}
      {typt ? (
        <Uitslag vraag={vraag} />
      ) : (
        <section className="mx-auto max-w-[1240px] px-6 py-16">
          <div className="flex items-baseline gap-4">
            <h2>Of blader, per vak</h2>
            <p className="caption">37 categorieën in 6 vakken</p>
          </div>
          <div className="mt-10 grid gap-x-10 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
            {VAKKEN.map((vak) => (
              <div key={vak.naam} className="border-lijn border-t pt-5">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-navy">{vak.naam}</h3>
                  <span className="caption shrink-0">{vak.toon} cases</span>
                </div>
                <ul className="mt-4 space-y-1.5">
                  {categorieenVan(vak).map((c) => (
                    <li key={c.naam}>
                      <button
                        type="button"
                        onClick={() => zetVraag(c.naam)}
                        className="text-left text-klein text-inkt hover:text-signaal-diep hover:underline underline-offset-2"
                      >
                        {c.naam}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}

/** De treffers, per soort gegroepeerd. Besluit 10 van 11 september. */
function Uitslag({ vraag }: { vraag: string }) {
  const uitslag = beoordeel(vraag);
  const naar = useNavigate();

  if (uitslag.naarAanvraag) {
    return (
      <section className="mx-auto max-w-[1240px] px-6 py-16">
        <div className="max-w-[54ch] border-navy border-l-2 pl-8">
          <Label toon="navy">Dit kennen we niet</Label>
          <h2 className="mt-3">Dan meten we het in</h2>
          <p className="mt-4 text-lead text-gedempt">
            Geen enkele standaardcase past op “{uitslag.vraag}”. Dat is geen probleem, het is hoe de
            meeste van onze orders beginnen. Stuur een foto, een schets of een datasheet, dan
            tekenen wij hem.
          </p>
          <button
            type="button"
            onClick={() => naar(`/offerte?vervoeren=${encodeURIComponent(uitslag.vraag)}`)}
            className="mt-7 bg-navy px-7 py-4 font-display font-bold text-klein text-white uppercase tracking-[var(--tracking-display)] hover:bg-signaal-diep"
          >
            Case aanvragen
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-[1240px] px-6 py-14">
      <div className="grid gap-10 lg:grid-cols-3">
        {uitslag.groepen.map((groep) => (
          <div key={groep.soort} className="border-lijn border-t pt-5">
            <Label toon="navy">{groep.kop}</Label>
            <ul className="mt-5 space-y-3">
              {groep.treffers.map((t) => (
                <li key={`${t.soort}-${t.naam}`}>
                  <button
                    type="button"
                    onClick={() =>
                      naar(
                        `${t.pad}?vervoeren=${encodeURIComponent(uitslag.vraag)}&naam=${encodeURIComponent(t.naam)}`,
                      )
                    }
                    className="group block w-full border-lijn border-b pb-3 text-left hover:border-navy"
                  >
                    <span className="flex items-baseline justify-between gap-4">
                      <span className="font-display font-bold text-navy text-lead uppercase leading-tight tracking-[var(--tracking-display)] group-hover:text-signaal-diep">
                        {t.naam}
                      </span>
                      {t.prijs ? (
                        <span className="caption shrink-0 text-inkt">
                          € {t.prijs.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}
                        </span>
                      ) : null}
                    </span>
                    {t.waarom ? (
                      <span className="mt-1.5 block text-gedempt text-klein">{t.waarom}</span>
                    ) : (
                      <span className="caption mt-1.5 block">{t.groep}</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* De uitweg blijft staan, ook als er treffers zijn: misschien is
          geen van deze het, en dan moet dat niet doodlopen. */}
      <p className="mt-12 border-lijn border-t pt-6 text-gedempt text-klein">
        Zit het er niet bij?{" "}
        <button
          type="button"
          onClick={() => naar(`/offerte?vervoeren=${encodeURIComponent(uitslag.vraag)}`)}
          className="text-navy underline underline-offset-2 hover:text-signaal-diep"
        >
          Stuur het gewoon op, dan meten we het in
        </button>
      </p>
    </section>
  );
}
