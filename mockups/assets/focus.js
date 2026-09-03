/* ══════════════════════════════════════════════════════════════
   Focusmodus voor de variantenpagina's

   Klik een variant om de rest te dimmen; klik ernaast of druk Esc om
   terug te gaan. Bewust géén standaardgedrag: deze pagina's bestaan om
   te vergelijken, en dimmen haalt weg waartegen je vergelijkt. Het is
   een modus die je aanzet als je één variant echt wilt beoordelen.

   Klikken op een link binnen een demo doet niets — daar zitten de
   hover-paden op, en die moeten bereikbaar blijven.
   ══════════════════════════════════════════════════════════════ */
(function () {
  var demos = Array.prototype.slice.call(document.querySelectorAll('.demo'));
  if (!demos.length) return;

  var dim = document.createElement('div');
  dim.className = 'dim';
  dim.setAttribute('aria-hidden', 'true');
  document.body.appendChild(dim);

  function uit() {
    document.body.classList.remove('focusmodus');
    demos.forEach(function (d) { d.classList.remove('aan'); });
  }

  function aan(demo) {
    uit();
    document.body.classList.add('focusmodus');
    demo.classList.add('aan');
  }

  demos.forEach(function (demo) {
    demo.addEventListener('click', function (e) {
      if (e.target.closest('a, button, summary, input')) return;
      demo.classList.contains('aan') ? uit() : aan(demo);
    });
  });

  dim.addEventListener('click', uit);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') uit();
  });
})();
