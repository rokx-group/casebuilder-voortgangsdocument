import { Link } from "react-router-dom";

/**
 * De bovenbalk, teruggebracht tot wat deze doorloop nodig heeft.
 *
 * Op de echte site staan hier twee balken met een megamenu. Dat hoort
 * bij een site, niet bij een demo van één route: alles wat hier staat en
 * niet werkt, nodigt uit om erop te klikken en loopt dood. De telefoon
 * blijft wel staan, want die is in dit segment een echte uitgang.
 */
export function Balk() {
  return (
    <header className="border-lijn border-b bg-white">
      <div className="mx-auto flex max-w-[1240px] items-center gap-8 px-6 py-4">
        <Link to="/case-voor" aria-label="Casebuilder.com, naar het begin">
          <img src="/woordmerk.svg" alt="Casebuilder.com" className="h-6 w-auto" />
        </Link>
        <nav className="hidden gap-7 md:flex">
          <Link to="/case-voor" className="label hover:text-navy">
            Wat ga je vervoeren
          </Link>
          <Link to="/offerte" className="label hover:text-navy">
            Case aanvragen
          </Link>
        </nav>
        <p className="caption ml-auto">
          Direct advies <span className="text-navy">+31 (0)575 575734</span>
        </p>
      </div>
    </header>
  );
}
