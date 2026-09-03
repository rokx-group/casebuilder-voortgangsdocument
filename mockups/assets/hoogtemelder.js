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
    var d = document.documentElement, b = document.body;
    var h = Math.max(d.scrollHeight, b ? b.scrollHeight : 0, d.offsetHeight);
    window.parent.postMessage({ soort: 'cb-hoogte', hoogte: h }, '*');
  }

  window.addEventListener('load', meld);
  if (document.readyState === 'complete') meld();
  /* Beeld dat later binnenkomt maakt de pagina hoger. */
  window.addEventListener('resize', meld);
  if (window.ResizeObserver) new ResizeObserver(meld).observe(document.documentElement);
})();
