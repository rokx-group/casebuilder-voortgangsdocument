/* ══════════════════════════════════════════════════════════════
   Uitsnede — één band uit een mockup tonen

   Hoort bij de mockup, niet bij het merk. De samenstelpagina laat je
   per band kiezen uit de banden die in de acht homepageversies staan.
   Zo'n keuze is alleen te maken als je ziet wat je kiest, en een
   omschrijving in een knop is geen ontwerp.

   Losse fragmentbestanden zouden de band twee keer laten bestaan: de
   band in de versie en de band in het fragment, die uit elkaar lopen
   zodra iemand er één bijwerkt. Daarom haalt de samenstelpagina de
   band uit de versie zelf: homepage-v6.html?uitsnede=belofte toont
   alleen het element met data-band="belofte", met alle opmaak van die
   pagina eromheen. Eén bron, geen kopie.

   De hoogte gaat terug naar het kader via postMessage. Van buitenaf
   meten lukt niet zodra de browser file:// als aparte oorsprong ziet,
   en dat doet Chrome — dezelfde reden als bij assets/hoogtemelder.js.
   ══════════════════════════════════════════════════════════════ */
(function () {
  var band = new URLSearchParams(location.search).get('uitsnede');
  if (!band) return;

  var doel = document.querySelector('[data-band="' + band + '"]');
  if (!doel) return;

  /* Alles verbergen behalve deze band. Op body-niveau, want de banden
     zijn directe kinderen van body — en de versiebalk die versies.js
     aanhaakt is dat ook, dus die verdwijnt vanzelf mee. */
  var stijl = document.createElement('style');
  stijl.textContent =
    'html,body{overflow:hidden}' +
    'body > *{display:none !important}' +
    'body > [data-band="' + band + '"]{display:block !important}';
  document.head.appendChild(stijl);

  /* Een band die aan de vorige vastzit (ruit-aanzet, een negatieve
     marge) hangt zonder buur in de lucht. De marge eraf, anders staat
     de uitsnede scheef in het kader. */
  doel.style.marginTop = '0';

  function meld() {
    var h = Math.ceil(doel.getBoundingClientRect().height);
    if (!h) return;
    window.parent.postMessage({ soort: 'cb-uitsnede', band: band, hoogte: h }, '*');
  }

  if (window.parent === window) return;   /* los geopend: alleen tonen */
  window.addEventListener('load', meld);
  if (document.readyState === 'complete') meld();
  /* Beeld en webfonts komen later binnen en maken de band hoger. */
  if (window.ResizeObserver) new ResizeObserver(meld).observe(doel);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(meld);
})();
