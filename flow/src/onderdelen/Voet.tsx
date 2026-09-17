/**
 * De voet is hier een afsluiting, geen sitemap. Een demo van vier
 * schermen heeft geen zeventig links nodig; wat er staat moet werken.
 */
export function Voet() {
  return (
    <footer className="mt-24 border-lijn border-t bg-vlak">
      <div className="mx-auto flex max-w-[1240px] flex-wrap items-baseline gap-x-10 gap-y-2 px-6 py-8">
        <p className="label text-navy">Proflite BV, Doesburg</p>
        <p className="caption">Eigen productie, 20+ jaar</p>
        <p className="caption ml-auto">Doorloop /case-voor, werkversie</p>
      </div>
    </footer>
  );
}
