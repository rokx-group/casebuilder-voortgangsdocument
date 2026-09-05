/* ══════════════════════════════════════════════════════════════
   Draaiende kist — 360° en op maat

   Waarom geen fotospin. De configurator rendert per configuratie acht
   views (images.casebuilder.com/{uuid}/{view}), maar daarvan liggen er
   maar vier op dezelfde horizontale ring: links, voor, rechts, achter.
   Dat is 90° per stap — dat springt, dat draait niet. Voor vloeiend
   draaien heb je 24 à 36 frames nodig en die bestaan nog niet.

   Een flightcase is een balk. Een balk in CSS-3D is dus geen namaak van
   het product maar het product zelf, en hij heeft twee dingen die een
   fotospin niet heeft: hij draait op élke hoek, en zijn afmetingen zijn
   getallen. Daarmee is de maatwissel echt — de kist wordt breder omdat
   de breedte verandert, niet omdat er een andere foto wordt geladen.

   Zodra de renderservice meer hoeken kan leveren, kan dit één op één
   worden vervangen: dezelfde maatvoering, dezelfde draaihoek.

   De maten hieronder zijn echte casematen uit de mockups. Ze staan op
   één plek, zodat het label en de kist niet uit elkaar kunnen lopen.
   ══════════════════════════════════════════════════════════════ */
(function () {
  var kist = document.querySelector('[data-draaikist]');
  if (!kist) return;

  var vlak = kist.querySelector('.kubus');
  var label = kist.querySelector('.kmaat');
  if (!vlak) return;

  /* breedte × hoogte × diepte in mm, met de naam die erbij hoort */
  var MATEN = [
    { naam: 'Trunccase',      b: 800,  h: 600, d: 600 },
    { naam: 'Rackcase 6 HE',  b: 600,  h: 400, d: 500 },
    { naam: 'Hoedcase',       b: 1060, h: 150, d: 410 },
    { naam: 'Koffer',         b: 700,  h: 250, d: 450 }
  ];
  var SCHAAL = 0.3;          /* mm → px, zodat de grootste kist past */
  var WISSEL = 4200;         /* hoe lang een maat blijft staan */

  var knoppen = [];

  function toon(m, n) {
    knoppen.forEach(function (k, j) { k.classList.toggle('aan', j === n); });
    vlak.style.setProperty('--b', (m.b * SCHAAL).toFixed(1) + 'px');
    vlak.style.setProperty('--h', (m.h * SCHAAL).toFixed(1) + 'px');
    vlak.style.setProperty('--d', (m.d * SCHAAL).toFixed(1) + 'px');
    if (label) {
      label.textContent = m.naam + ' · ' + m.b.toLocaleString('nl-NL') + ' × ' +
        m.h.toLocaleString('nl-NL') + ' × ' + m.d.toLocaleString('nl-NL') + ' mm';
    }
  }

  var i = 0;
  knoppen = Array.prototype.slice.call(kist.parentNode.querySelectorAll('[data-maat]'));
  toon(MATEN[0], 0);

  var stil = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var wisselaar = null;
  function startWisselen() {
    if (stil || wisselaar) return;
    wisselaar = setInterval(function () { i = (i + 1) % MATEN.length; toon(MATEN[i], i); }, WISSEL);
  }
  function stopWisselen() { clearInterval(wisselaar); wisselaar = null; }
  startWisselen();

  /* ── draaien ───────────────────────────────────────────────
     Vanzelf, tot de bezoeker hem vastpakt. Dan neemt hij het over en
     blijft de kist staan waar hij hem laat — een object dat terugspringt
     zodra je loslaat, voelt alsof je er niet echt aan mag zitten. */
  var hoek = -28, kanteling = -14, sleept = false, vorigeX = 0, vorigeY = 0, laatste = 0;

  function zet() { vlak.style.transform = 'rotateX(' + kanteling + 'deg) rotateY(' + hoek + 'deg)'; }
  zet();

  function tik(nu) {
    if (!sleept && !stil) {
      if (laatste) hoek += (nu - laatste) * 0.012;   /* ±26 seconden per omwenteling */
      zet();
    }
    laatste = nu;
    requestAnimationFrame(tik);
  }
  requestAnimationFrame(tik);

  kist.addEventListener('pointerdown', function (e) {
    sleept = true; vorigeX = e.clientX; vorigeY = e.clientY;
    kist.setPointerCapture(e.pointerId);
    kist.classList.add('pakt');
    stopWisselen();
  });
  kist.addEventListener('pointermove', function (e) {
    if (!sleept) return;
    hoek += (e.clientX - vorigeX) * 0.5;
    kanteling = Math.max(-62, Math.min(62, kanteling - (e.clientY - vorigeY) * 0.35));
    vorigeX = e.clientX; vorigeY = e.clientY;
    zet();
  });
  ['pointerup', 'pointercancel'].forEach(function (naam) {
    kist.addEventListener(naam, function () { sleept = false; kist.classList.remove('pakt'); });
  });

  /* Klikken op de maatknoppen zet hem op die maat en stopt het wisselen:
     wie zelf kiest, wil niet dat het ding weer verspringt. */
  knoppen.forEach(function (knop, n) {
    knop.addEventListener('click', function () {
      stopWisselen();
      i = n; toon(MATEN[n], n);
    });
  });
})();
