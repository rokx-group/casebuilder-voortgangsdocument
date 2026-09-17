/**
 * De aanvraag. Het einde van de route voor wie wij niet herkennen, en
 * dat is de meerderheid.
 *
 * Twee dingen maken het verschil tussen een formulier en een uitkomst.
 * Het veld staat al ingevuld met wat de bezoeker typte, zodat hij niet
 * hoeft over te typen wat hij net zei. En de toon erboven behandelt dit
 * niet als plan B: dit is hoe de meeste orders binnenkomen, en dat mag
 * je merken.
 */

import { type FormEvent, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Beslag } from "../onderdelen/Beslag";
import { Label } from "../onderdelen/Label";

export function OffertePagina() {
  const [zoekargumenten] = useSearchParams();
  const meegekomen = zoekargumenten.get("vervoeren")?.trim() ?? "";
  const [verstuurd, zetVerstuurd] = useState(false);

  function verstuur(e: FormEvent) {
    e.preventDefault();
    zetVerstuurd(true);
  }

  if (verstuurd) {
    return (
      <section className="mx-auto max-w-[1240px] px-6 py-24">
        <div className="max-w-[54ch] border-navy border-l-2 pl-8">
          <Label toon="navy">Aanvraag binnen</Label>
          <h1 className="mt-3">We gaan ermee aan de slag</h1>
          <p className="mt-5 text-lead text-gedempt">
            Je krijgt binnen twee werkdagen een prijs en een tekening. Is er iets onduidelijk aan je
            opgave, dan bellen we even.
          </p>
          <p className="caption mt-8">Dit is een werkversie, er is niets verstuurd.</p>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="ruitvlak border-lijn border-b bg-vlak">
        <div className="mx-auto grid max-w-[1240px] gap-10 px-6 py-16 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <Label>Case aanvragen</Label>
            <h1 className="mt-4 max-w-[16ch]">Stuur wat je hebt</h1>
            <p className="mt-5 max-w-[50ch] text-lead text-gedempt">
              Een datasheet is genoeg, een foto van een servet ook. Wij meten in, tekenen hem en
              sturen een prijs.
            </p>
          </div>
          <aside className="self-end border-navy border-l-2 pl-6 lg:pl-8">
            <Label toon="navy">Wat er daarna gebeurt</Label>
            <p className="mt-3 text-gedempt text-klein">
              Een casebouwer kijkt naar je opgave, niet een script. Binnen twee werkdagen heb je een
              tekening met maten en een prijs, en pas daarna beslis je iets.
            </p>
          </aside>
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-6 py-14">
        <form onSubmit={verstuur} className="max-w-[46rem]">
          <div className="relative border-2 border-navy bg-white p-7">
            <Beslag />
            <label htmlFor="vervoeren" className="label text-navy">
              Wat ga je vervoeren
            </label>
            <textarea
              id="vervoeren"
              defaultValue={meegekomen}
              rows={3}
              placeholder="Bijvoorbeeld: een vleugelsectie van 2,4 meter, of vier moving heads"
              className="mt-3 w-full resize-y border-lijn border-b-2 bg-transparent pb-2 text-body text-inkt outline-none placeholder:text-gedempt focus:border-navy"
            />
            {meegekomen ? (
              <p className="caption mt-2">Overgenomen uit je zoekopdracht, pas het gerust aan.</p>
            ) : null}

            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              <Veld id="aantal" label="Hoeveel" placeholder="1" />
              <Veld id="wanneer" label="Wanneer nodig" placeholder="Geen haast" />
              <Veld id="naam" label="Naam" placeholder="Voor- en achternaam" />
              <Veld id="mail" label="E-mail" placeholder="naam@bedrijf.nl" type="email" />
            </div>

            <button
              type="submit"
              className="mt-8 bg-navy px-8 py-4 font-display font-bold text-klein text-white uppercase tracking-[var(--tracking-display)] hover:bg-signaal-diep"
            >
              Aanvraag versturen
            </button>
          </div>
        </form>
      </section>
    </>
  );
}

function Veld({
  id,
  label,
  placeholder,
  type = "text",
}: {
  id: string;
  label: string;
  placeholder: string;
  type?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="label text-navy">
        {label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        className="mt-2 w-full border-lijn border-b-2 bg-transparent pb-2 text-body text-inkt outline-none placeholder:text-gedempt focus:border-navy"
      />
    </div>
  );
}
