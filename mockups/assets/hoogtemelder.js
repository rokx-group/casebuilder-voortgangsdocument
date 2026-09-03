/* ══════════════════════════════════════════════════════════════
   Hoogtemelder — hoort bij de mockup, niet bij het merk

   Staat deze pagina in een iframe op een beoordeelpagina, dan meldt hij
   zijn eigen hoogte aan het kader eromheen. Dat moet van binnenuit:
   een browser die file:// als aparte oorsprong ziet laat het kader niet
   in de pagina kijken, maar postMessage mag altijd.

   Zonder dit staat er een vaste hoogte in de CSS, en die is per
   definitie fout — te kort knipt de voettekst af, te lang geeft een
   scherm wit onder de footer.
   ══════════════════════════════════════════════════════════════ */
(function () {
  if (window.parent === window) return;   /* niet ingesloten */

  function meld() {
    // Niet scrollHeight: die is nooit kleiner dan het iframe zelf, dus een
    // kader van 4400 px meldde altijd 4400 px terug — en daar kwam het
    // scherm wit onder de footer vandaan. We meten de onderkant van het
    // laagste element in de stroom; vaste elementen (versiebalk, filmbalk)
    // hangen aan het kader en tellen niet mee.
    var onder = 0;
    var kinderen = document.body ? document.body.children : [];
    for (var i = 0; i < kinderen.length; i++) {
      var el = kinderen[i];
      if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE') continue;
      if (getComputedStyle(el).position === 'fixed') continue;
      var r = el.getBoundingClientRect();
      if (r.height) onder = Math.max(onder, r.bottom + window.scrollY);
    }
    var h = Math.ceil(onder);
    if (h < 400) return;
    window.parent.postMessage({ soort: 'cb-hoogte', hoogte: h }, '*');
  }

  window.addEventListener('load', meld);
  if (document.readyState === 'complete') meld();
  /* Beeld dat later binnenkomt maakt de pagina hoger. */
  window.addEventListener('resize', meld);
  if (window.ResizeObserver) new ResizeObserver(meld).observe(document.documentElement);
})();
