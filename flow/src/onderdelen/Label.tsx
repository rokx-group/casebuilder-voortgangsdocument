import type { ReactNode } from "react";

/**
 * Het mono-label met het //-voorvoegsel.
 *
 * Uit de brandrichtlijnen: mono is altijd hoofdletters met ruime
 * letterafstand, en het //-voorvoegsel hoort bij labels, maten, codes en
 * serienummers. Nooit boven een kop of in lopende tekst.
 *
 * Als component en niet als los tekstje, om twee redenen. De regel staat
 * dan op één plek in plaats van in elk bestand, en de dubbele schuine
 * streep komt uit een expressie: letterlijk in de opmaak leest elke
 * linter hem als een vergeten regelcommentaar.
 */
export function Label({
  children,
  toon = "gedempt",
  als = "p",
}: {
  children: ReactNode;
  /** Gedempt op licht, navy waar het label zelf de kop van een blok is. */
  toon?: "gedempt" | "navy" | "helder";
  als?: "p" | "span" | "dt" | "legend";
}) {
  const Element = als;
  const kleur =
    toon === "navy" ? "text-navy" : toon === "helder" ? "text-signaal-helder" : undefined;
  return (
    <Element className={kleur ? `label ${kleur}` : "label"}>
      {"// "}
      {children}
    </Element>
  );
}

/** Dezelfde regel, een maat kleiner. Voor nummers en bijschriften. */
export function Bijschrift({ children, toon }: { children: ReactNode; toon?: "navy" }) {
  return (
    <p className={toon === "navy" ? "caption text-navy" : "caption"}>
      {"// "}
      {children}
    </p>
  );
}
