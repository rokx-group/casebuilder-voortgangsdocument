/* ══════════════════════════════════════════════════════════════
   De kaartenrij in een kop, met twee knoppen ernaast.

   Het schuiven zelf doet de browser: de rij is een overflow met
   scroll-snap, dus vegen, het wiel, de pijltjestoetsen en de tabtoets
   werken zonder dat hier iets voor nodig is. Dit bestand doet alleen
   wat de browser niet kan: de twee knoppen, en de teller die zegt waar
   je bent.

   Geen carrousel-bibliotheek, en ook geen eigen animatie. Een kaartenrij
   die stuk kan gaan is erger dan een kaartenrij die niet beweegt, en
   alles wat hier wegvalt laat een werkende rij achter.

   Eén rij per pagina is de aanname; meer zou betekenen dat de knoppen
   niet weten bij welke ze horen. Vandaar de zoektocht per blok.
   ══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  document.querySelectorAll('[data-spoor]').forEach(function (spoor) {
    var blok = spoor.closest('.kaarten') || spoor.parentNode;
    var terug = blok.querySelector('[data-spoor-terug]');
    var verder = blok.querySelector('[data-spoor-verder]');
    var teller = blok.querySelector('[data-spoor-tel]');
    var kaarten = spoor.querySelectorAll('.kaart');
    if (!kaarten.length) return;

    /* Eén kaart plus de tussenruimte. Uit de eerste twee kaarten gemeten
       en niet uit de CSS gelezen: de breedte is een clamp() die met het
       venster meebeweegt, dus een vast getal zou hier na één keer slepen
       al niet meer kloppen. */
    function stap() {
      if (kaarten.length < 2) return kaarten[0].offsetWidth;
      return kaarten[1].offsetLeft - kaarten[0].offsetLeft;
    }

    function schuif(richting) {
      spoor.scrollBy({ left: richting * stap(), behavior: 'smooth' });
    }

    if (terug) terug.addEventListener('click', function () { schuif(-1); });
    if (verder) verder.addEventListener('click', function () { schuif(1); });

    /* Welke kaart vooraan staat, afgerond op de dichtstbijzijnde. Bij de
       laatste kaart is er minder te schuiven dan een hele kaartbreedte,
       dus zonder die afronding blijft de teller op één na het eind staan. */
    function nu() {
      var s = stap();
      if (!s) return 1;
      return Math.min(kaarten.length, Math.round(spoor.scrollLeft / s) + 1);
    }

    function werkBij() {
      if (teller) teller.textContent = nu() + ' / ' + kaarten.length;
      /* Een knop die niets meer doet hoort dat te laten zien. Uitzetten
         en niet verbergen: een knop die verdwijnt laat de rij verspringen. */
      var eind = spoor.scrollWidth - spoor.clientWidth;
      if (terug) terug.disabled = spoor.scrollLeft < 4;
      if (verder) verder.disabled = spoor.scrollLeft >= eind - 4;
      [terug, verder].forEach(function (k) {
        if (k) k.style.opacity = k.disabled ? '.35' : '';
      });
    }

    spoor.addEventListener('scroll', werkBij, { passive: true });
    addEventListener('resize', werkBij);
    werkBij();
  });
})();
