/* ══════════════════════════════════════════════════════════════
   Kaderhoogte voor de beoordeelpagina's

   Het kader voegt zich naar de pagina die erin staat. De hoogte komt
   van de pagina zelf (assets/hoogtemelder.js) via postMessage — van
   buitenaf meten lukt niet zodra de browser file:// als aparte
   oorsprong behandelt, en dat doet Chrome.

   Scrollen stopt daarmee precies waar de voettekst eindigt, in plaats
   van in een scherm wit eronder.
   ══════════════════════════════════════════════════════════════ */
(function () {
  function zet(frame, hoogte) {
    var venster = frame.closest('.venster');
    var houder = frame.parentElement;
    var schaal = parseFloat(venster && venster.dataset.schaal) || 0.95;
    /* Een kader met data-hoogte toont expres maar een stuk van de pagina —
       bij een kopkeuze is alles onder de vouw in alle varianten hetzelfde,
       en drie identieke pagina's onder elkaar leest als drie keer scrollen
       naar hetzelfde. Dan wint de gemelde hoogte niet van de uitsnede. */
    var uitsnede = parseInt(venster && venster.dataset.hoogte, 10);
    if (uitsnede) hoogte = uitsnede;
    if (!hoogte || hoogte < 400) return;
    frame.style.height = hoogte + 'px';
    houder.style.height = Math.ceil(hoogte * schaal) + 'px';
  }

  window.addEventListener('message', function (e) {
    if (!e.data || e.data.soort !== 'cb-hoogte') return;
    document.querySelectorAll('.venster iframe').forEach(function (frame) {
      if (frame.contentWindow === e.source) zet(frame, e.data.hoogte);
    });
  });

  /* Zelfde oorsprong (bijvoorbeeld op Netlify) — dan kan het ook direct. */
  document.querySelectorAll('.venster iframe').forEach(function (frame) {
    frame.addEventListener('load', function () {
      try {
        var d = frame.contentDocument;
        if (d) zet(frame, Math.max(d.documentElement.scrollHeight, d.body.scrollHeight));
      } catch (e) { /* andere oorsprong — de melder doet het */ }
    });
  });
})();
