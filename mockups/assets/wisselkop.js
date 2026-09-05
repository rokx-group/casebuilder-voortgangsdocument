/* ══════════════════════════════════════════════════════════════
   Wisselende slotkop

   De afsluiting stelt vijf keer dezelfde vraag in andere woorden. Ze
   onder elkaar zetten leest als een opsomming; ze laten wisselen laat
   zien dat er meerdere deuren zijn zonder er vijf te tekenen.

   Twee dingen die het rustig houden:

   1. Hij begint pas als de sectie in beeld komt. Een kop die al drie
      keer gewisseld is voordat je hem ziet, wisselt voor niemand — en
      erger, je mist de eerste regel, die de belangrijkste is.
   2. Hij stopt zodra de sectie uit beeld is. Anders draait er iets te
      animeren in een tabblad waar niemand naar kijkt.

   De eerste regel blijft langer staan dan de rest: dat is de kop van
   deze pagina, de andere vier zijn de variaties erop.

   Zonder JavaScript, of met prefers-reduced-motion, blijft de eerste
   regel gewoon staan. Dat is een complete afsluiting — de wissel is
   een extraatje, geen drager.
   ══════════════════════════════════════════════════════════════ */
(function () {
  var kop = document.querySelector('[data-wisselkop]');
  if (!kop) return;

  var regels;
  try {
    regels = JSON.parse(kop.getAttribute('data-wisselkop'));
  } catch (e) {
    return;  // onleesbare lijst: laat staan wat er staat
  }
  if (!Array.isArray(regels) || regels.length < 2) return;

  var rustig = matchMedia('(prefers-reduced-motion: reduce)');
  if (rustig.matches) return;

  var EERSTE = 4200;   // de eigen kop krijgt langer
  var VOLGEND = 3000;
  var UIT = 420;       // moet overeenkomen met de CSS-transitie

  var i = 0;
  var klok = null;

  function toon(n) {
    kop.classList.add('weg');
    setTimeout(function () {
      kop.textContent = regels[n];
      kop.classList.remove('weg');
    }, UIT);
  }

  function volgende() {
    i = (i + 1) % regels.length;
    toon(i);
    klok = setTimeout(volgende, VOLGEND);
  }

  function start() {
    if (klok) return;
    klok = setTimeout(volgende, EERSTE);
  }

  function stop() {
    clearTimeout(klok);
    klok = null;
  }

  /* De sectie zelf is de aanleiding, niet de kop: de kop is één regel
     hoog en zou al "in beeld" heten terwijl de sectie nog half onder
     de vouw hangt. 45% zodat hij aanslaat als je er echt bent. */
  var sectie = kop.closest('section') || kop;
  if (!('IntersectionObserver' in window)) { start(); return; }

  new IntersectionObserver(function (rijen) {
    rijen.forEach(function (r) { r.isIntersecting ? start() : stop(); });
  }, { threshold: 0.45 }).observe(sectie);

  /* Tabblad naar de achtergrond: niets te animeren. */
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stop();
  });
})();
