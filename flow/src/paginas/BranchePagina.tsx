/**
 * De bestemming voor wie wij niet op zijn apparaat kennen, maar wel op
 * zijn wereld.
 *
 * Het stuk bovenaan is het hele punt van deze route. Wie "F16 vleugel"
 * typt heeft net iets ingetikt waarvan hij niet weet of wij er iets mee
 * kunnen. Als de pagina dan begint met een algemeen verhaal, voelt het
 * als doorgestuurd worden. Begint hij met wat je typte en waaróm je hier
 * bent, dan voelt het als opgevangen worden. Dat verschil is de reden dat
 * de zoekterm in de URL meereist.
 */

import { Link, useParams, useSearchParams } from "react-router-dom";
import { BRANCHES } from "../data/branches";
import { REGELS } from "../data/zoeklijst";
import { Beslag } from "../onderdelen/Beslag";
import { Bijschrift, Label } from "../onderdelen/Label";

export function BranchePagina() {
  const { naam } = useParams();
  const [zoekargumenten] = useSearchParams();
  const vraag = zoekargumenten.get("vervoeren")?.trim() ?? "";

  const branche = naam ? BRANCHES[naam] : undefined;
  if (!branche) {
    return (
      <section className="mx-auto max-w-[1240px] px-6 py-24">
        <h1>Deze branche bestaat nog niet</h1>
        <Link to="/case-voor" className="label mt-6 inline-block text-navy underline">
          Terug naar het begin
        </Link>
      </section>
    );
  }

  const waarom = REGELS.find((r) => r.soort === "branche" && r.pad.endsWith(branche.pad))?.waarom;

  return (
    <>
      {/* ── de ontvangst ───────────────────────────────────────
          Alleen als er een zoekterm meekwam. Wie hier via een link
          binnenkomt heeft niets getypt, en dan is een terugkoppeling
          op zijn tekst onzin. */}
      {vraag ? (
        <section className="border-navy border-b-2 bg-navy text-white">
          <div className="mx-auto max-w-[1240px] px-6 py-8">
            <Label toon="helder">Je zocht op</Label>
            <p className="mt-3 font-display font-bold text-sectie uppercase leading-none tracking-[var(--tracking-display)]">
              {vraag}
            </p>
            <p className="mt-4 max-w-[64ch] text-klein text-white/75">
              Daar hebben we geen standaardcase voor
              {waarom ? `, want dat ${waarom}` : ""}. Dit is wat we voor{" "}
              {branche.naam.toLowerCase()} doen.
            </p>
          </div>
        </section>
      ) : null}

      {/* ── de belofte ─────────────────────────────────────────
          Asymmetrisch: de kop links, de vier kentallen rechts als een
          smalle kolom. Geen rij van vier gelijke vlakken onder een
          gecentreerde titel. */}
      <section className="ruitvlak border-lijn border-b bg-vlak">
        <div className="mx-auto grid max-w-[1240px] gap-10 px-6 py-16 lg:grid-cols-[1.5fr_1fr] lg:py-20">
          <div>
            <Label>{branche.naam}</Label>
            <h1 className="mt-4 max-w-[18ch]">{branche.kop}</h1>
            <p className="mt-5 max-w-[52ch] text-lead text-gedempt">{branche.lead}</p>
            <Link
              to={`/offerte?vervoeren=${encodeURIComponent(vraag)}`}
              className="mt-8 inline-block bg-navy px-7 py-4 font-display font-bold text-klein text-white uppercase tracking-[var(--tracking-display)] hover:bg-signaal-diep"
            >
              Stuur je specificatie
            </Link>
          </div>
          <dl className="self-end border-navy border-l-2 pl-6 lg:pl-8">
            {[
              ["Eigen productie", "Doesburg, 20+ jaar"],
              ["Offerte", "binnen 48 uur, ook op specificatie"],
              ["Serie of stuk", "zelfde tolerantie"],
            ].map(([kop, uitleg]) => (
              <div key={kop} className="border-lijn border-b py-3 last:border-0">
                <dt className="label text-navy">{kop}</dt>
                <dd className="mt-1 text-gedempt text-klein">{uitleg}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── de eisen ───────────────────────────────────────────── */}
      <section className="mx-auto max-w-[1240px] px-6 py-16">
        <Label>Waar het hier om draait</Label>
        <h2 className="mt-3">{branche.eisenKop}</h2>
        <p className="mt-4 max-w-[62ch] text-gedempt text-klein">{branche.eisenLead}</p>
        <div className="mt-10 grid gap-x-10 gap-y-8 md:grid-cols-2 lg:grid-cols-3">
          {branche.eisen.map((eis) => (
            <div key={eis.nr} className="border-navy border-t-2 pt-4">
              <Bijschrift toon="navy">{eis.nr}</Bijschrift>
              <h3 className="mt-2">{eis.kop}</h3>
              <p className="mt-2 text-gedempt text-klein">{eis.tekst}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── het bewijs ─────────────────────────────────────────
          Alleen waar het er is. Een leeg blok "klantverhalen volgen" is
          erger dan geen blok. */}
      {branche.bewijs ? (
        <section className="border-lijn border-y bg-lichtblauw">
          <div className="mx-auto max-w-[1240px] px-6 py-16">
            <Label>In plaats van klantverhalen</Label>
            <h2 className="mt-3">{branche.bewijsKop}</h2>
            <p className="mt-4 max-w-[62ch] text-gedempt text-klein">{branche.bewijsLead}</p>
            <div className="mt-10 grid gap-8 md:grid-cols-3">
              {branche.bewijs.map((b) => (
                <div key={b.nr} className="relative bg-white p-6">
                  <Beslag kleur="text-signaal" />
                  <Bijschrift toon="navy">{b.nr}</Bijschrift>
                  <h3 className="mt-2">{b.kop}</h3>
                  <p className="mt-2 text-gedempt text-klein">{b.tekst}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-[1240px] px-6 py-16">
        <div className="max-w-[54ch] border-navy border-l-2 pl-8">
          <Label toon="navy">Verder</Label>
          <h2 className="mt-3">Stuur wat je hebt</h2>
          <p className="mt-4 text-gedempt text-klein">
            Een datasheet is genoeg, een foto van een servet ook. Je krijgt binnen twee werkdagen
            een prijs en een tekening.
          </p>
          <Link
            to={`/offerte?vervoeren=${encodeURIComponent(vraag)}`}
            className="mt-6 inline-block bg-navy px-7 py-4 font-display font-bold text-klein text-white uppercase tracking-[var(--tracking-display)] hover:bg-signaal-diep"
          >
            Case aanvragen
          </Link>
        </div>
      </section>
    </>
  );
}
