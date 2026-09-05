/* ══════════════════════════════════════════════════════════════
   Woordmerk krimpt tot beeldmerk bij het scrollen

   Het beeldmerk is het woordmerk in het klein: dezelfde c en B, alleen
   in elkaar geschoven. Dat maakt de overgang vanzelfsprekend — je ziet
   niet twee logo's wisselen maar één logo dat samentrekt. Precies wat
   het cB-monogram in de slotsectie ook doet.

   Waarom een klasse op de header en niet de animatie hier: de vorm
   hoort in de CSS van de pagina, zodat je hem daar kunt bijstellen
   zonder aan dit bestand te komen. Dit bestand beslist alleen wannéér.

   De drempel ligt bewust niet op nul. Krimpen bij de eerste pixel voelt
   nerveus; pas voorbij de hoogte van de balk zelf is er echt gescrold.
   De marge eromheen voorkomt dat hij staat te knipperen als je precies
   op de grens tot stilstand komt.

   Respecteert prefers-reduced-motion: dan springt hij zonder overgang,
   want de klasse blijft hetzelfde — alleen de CSS-transitie vervalt.
   ══════════════════════════════════════════════════════════════ */
(function () {
  var balk = document.querySelector('header.main');
  if (!balk) return;

  var AAN = 90;   // voorbij deze hoogte: beeldmerk
  var UIT = 60;   // pas onder deze weer terug — de marge tegen knipperen
  var gekrompen = false;
  var wachtend = false;

  function meet() {
    wachtend = false;
    var y = window.scrollY || document.documentElement.scrollTop || 0;
    if (!gekrompen && y > AAN) {
      gekrompen = true;
      balk.classList.add('gekrompen');
    } else if (gekrompen && y < UIT) {
      gekrompen = false;
      balk.classList.remove('gekrompen');
    }
  }

  addEventListener('scroll', function () {
    /* Eén meting per frame. Scroll vuurt vaker dan er beelden zijn, en
       classList in die stroom aanroepen laat de balk schokken. */
    if (wachtend) return;
    wachtend = true;
    requestAnimationFrame(meet);
  }, { passive: true });

  meet();  // wie halverwege de pagina binnenkomt (anker, herladen) klopt meteen
})();
