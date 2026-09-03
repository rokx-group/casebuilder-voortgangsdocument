/* ══════════════════════════════════════════════════════════════
   Mix en match — losse onderdelen uit de homepageversies

   De acht versies zijn complete pagina's, maar de keuze valt zelden op
   één versie in zijn geheel: de hero van de een met het blok onder de
   hero van de ander. Deze balken halen dat uit elkaar — één keuze per
   rij, dezelfde markering als een gekozen variant.

   De selectie blijft in localStorage staan, zodat je hem na een
   herlaadbeurt terugvindt en er in een bespreking op kunt terugkomen.
   ══════════════════════════════════════════════════════════════ */
(function () {
  var SLEUTEL = 'cb-mixmatch';
  var rijen = document.querySelectorAll('[data-rij]');
  if (!rijen.length) return;

  var keuze = {};
  try { keuze = JSON.parse(localStorage.getItem(SLEUTEL) || '{}'); } catch (e) { keuze = {}; }

  var samen = document.getElementById('samenvatting');

  function bewaar() {
    try { localStorage.setItem(SLEUTEL, JSON.stringify(keuze)); } catch (e) { /* privémodus */ }
  }

  function toonSamenvatting() {
    if (!samen) return;
    var delen = [];
    rijen.forEach(function (rij) {
      var id = rij.dataset.rij;
      var gekozen = rij.querySelector('.optie.gekozen');
      if (gekozen) delen.push('<span><i>' + rij.dataset.naam + '</i>' + gekozen.dataset.kort + '</span>');
    });
    samen.innerHTML = delen.length
      ? delen.join('')
      : '<span class="leeg">Nog niets gekozen &mdash; klik een optie in een rij hieronder.</span>';
  }

  rijen.forEach(function (rij) {
    var id = rij.dataset.rij;
    rij.querySelectorAll('.optie').forEach(function (optie) {
      if (keuze[id] === optie.dataset.id) optie.classList.add('gekozen');
      optie.addEventListener('click', function () {
        var alGekozen = optie.classList.contains('gekozen');
        rij.querySelectorAll('.optie').forEach(function (o) { o.classList.remove('gekozen'); });
        if (alGekozen) { delete keuze[id]; }      /* nogmaals klikken = ontkiezen */
        else { optie.classList.add('gekozen'); keuze[id] = optie.dataset.id; }
        bewaar(); toonSamenvatting();
      });
    });
  });

  var wis = document.getElementById('wis-keuze');
  if (wis) wis.addEventListener('click', function () {
    keuze = {}; bewaar();
    document.querySelectorAll('.optie.gekozen').forEach(function (o) { o.classList.remove('gekozen'); });
    toonSamenvatting();
  });

  toonSamenvatting();
})();
