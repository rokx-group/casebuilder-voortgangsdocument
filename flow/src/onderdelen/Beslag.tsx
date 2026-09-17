/**
 * Hoekbeslag.
 *
 * Het merkdetail dat nergens anders vandaan komt: een flightcase heeft
 * op elke hoek een beslagstuk, en dat is hier een vorm met betekenis in
 * plaats van een randje. Het staat om het zoekveld omdat dát het
 * instrument van deze pagina is. Zet het niet overal neer, dan is het
 * versiering en verliest het zijn werk.
 *
 * Maten komen uit de merktokens (--beslag-arm, --beslag-dikte,
 * --beslag-inset), dus ze blijven gelijk aan de echte site.
 */
export function Beslag({ kleur = "text-navy" }: { kleur?: string }) {
  const hoeken = [
    "top-0 left-0 border-t-2 border-l-2",
    "top-0 right-0 border-t-2 border-r-2",
    "bottom-0 left-0 border-b-2 border-l-2",
    "bottom-0 right-0 border-b-2 border-r-2",
  ];
  return (
    <>
      {hoeken.map((plek) => (
        <span
          key={plek}
          aria-hidden="true"
          className={`pointer-events-none absolute h-[var(--beslag-arm)] w-[var(--beslag-arm)] ${plek} ${kleur}`}
          style={{ borderColor: "currentColor" }}
        />
      ))}
    </>
  );
}
