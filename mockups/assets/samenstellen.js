/* ══════════════════════════════════════════════════════════════
   Samenstellen — één homepage uit acht versies kiezen

   De acht versies zijn complete pagina's, maar de keuze valt zelden op
   één versie in zijn geheel: de belofte-band van de een onder de hero
   van de ander. Deze pagina haalt ze uit elkaar in banden, laat per
   band de echte uitsnede zien (assets/uitsnede.js) en zet de keuze
   onderaan in tekst die je kunt doorsturen.

   Drie dingen doet dit script:
   1. de kaders pas laden als ze in beeld komen — veertig iframes die
      allemaal een hele pagina laden maakt de pagina onbruikbaar;
   2. de hoogte van elk kader volgen, want een band is 240 of 900 px
      hoog en dat weet je pas als hij geladen is;
   3. de keuze bewaren en omzetten naar tekst.
   ══════════════════════════════════════════════════════════════ */
(function () {
  var SLEUTEL = 'cb-samenstellen';
  var rijen = document.querySelectorAll('.band');
  if (!rijen.length) return;

  /* ── 1. kaders pas laden als ze in beeld komen ──────────────
     Bewust zonder loading="lazy" op het iframe zelf: twee mechanismen
     die allebei uitstellen laten de onderste kaders leeg staan, want
     de browser wacht dan op zijn eigen drempel nadat wij de bron al
     hebben gezet. Eén waarnemer, met ruime marge. */
  var kaders = document.querySelectorAll('iframe[data-src]');
  function laad(frame) {
    if (frame.dataset.src) { frame.src = frame.dataset.src; delete frame.dataset.src; }
  }
  if (window.IntersectionObserver) {
    var kijker = new IntersectionObserver(function (items) {
      items.forEach(function (item) {
        if (item.isIntersecting) { laad(item.target); kijker.unobserve(item.target); }
      });
    }, { rootMargin: '600px 0px' });   /* ruim vooruit, zodat scrollen niet hapert */
    kaders.forEach(function (f) { kijker.observe(f); });
  } else {
    kaders.forEach(laad);
  }

  /* ── 2. hoogte per uitsnede ───────────────────────────────── */
  window.addEventListener('message', function (e) {
    if (!e.data || e.data.soort !== 'cb-uitsnede') return;
    document.querySelectorAll('.venster iframe').forEach(function (frame) {
      if (frame.contentWindow !== e.source) return;
      var venster = frame.closest('.venster');
      var schaal = parseFloat(venster.dataset.schaal) || 0.25;
      frame.style.height = e.data.hoogte + 'px';
      venster.style.height = Math.ceil(e.data.hoogte * schaal) + 'px';
      venster.classList.add('geladen');
    });
  });

  /* ── 3. de keuze ──────────────────────────────────────────── */
  var keuze = {};
  try { keuze = JSON.parse(localStorage.getItem(SLEUTEL) || '{}'); } catch (e) { keuze = {}; }

  function bewaar() {
    try { localStorage.setItem(SLEUTEL, JSON.stringify(keuze)); } catch (e) { /* privémodus */ }
  }

  function regels() {
    var uit = [];
    rijen.forEach(function (rij) {
      var gekozen = rij.querySelectorAll('.optie.gekozen');
      if (!gekozen.length) return;
      var namen = [];
      gekozen.forEach(function (o) { namen.push(o.dataset.bron + ' · ' + o.dataset.kort); });
      uit.push({ naam: rij.dataset.naam, waarden: namen });
    });
    return uit;
  }

  function alsTekst() {
    var r = regels();
    if (!r.length) return '';
    var breed = 0;
    r.forEach(function (x) { breed = Math.max(breed, x.naam.length); });
    var uit = ['// HOMEPAGE-SAMENSTELLING'];
    r.forEach(function (x) {
      uit.push(x.naam + ':' + new Array(breed - x.naam.length + 2).join(' ') + x.waarden.join(' + '));
    });
    return uit.join('\n');
  }

  var uitvoer = document.getElementById('uitvoer');
  var teller = document.getElementById('teller');
  var kopieer = document.getElementById('kopieer');

  function toon() {
    var tekst = alsTekst();
    uitvoer.value = tekst;
    uitvoer.placeholder = 'Nog niets gekozen — klik hierboven een uitsnede aan.';
    var n = regels().length;
    teller.textContent = n ? n + ' van ' + rijen.length + ' banden gekozen' : 'nog niets gekozen';
    kopieer.disabled = !tekst;
  }

  rijen.forEach(function (rij) {
    var id = rij.dataset.band;
    var meervoud = rij.hasAttribute('data-meervoud');
    var bewaard = keuze[id] || [];
    if (typeof bewaard === 'string') bewaard = [bewaard];   /* oude vorm */

    function markeer(optie) {
      optie.setAttribute('aria-pressed', optie.classList.contains('gekozen') ? 'true' : 'false');
    }

    function wissel(optie) {
      var alGekozen = optie.classList.contains('gekozen');
      if (!meervoud) {
        rij.querySelectorAll('.optie').forEach(function (o) { o.classList.remove('gekozen'); markeer(o); });
      }
      optie.classList.toggle('gekozen', !alGekozen);   /* nogmaals klikken = weg */
      markeer(optie);

      var nu = [];
      rij.querySelectorAll('.optie.gekozen').forEach(function (o) { nu.push(o.dataset.id); });
      if (nu.length) keuze[id] = nu; else delete keuze[id];
      bewaar(); toon();
    }

    rij.querySelectorAll('.optie').forEach(function (optie) {
      if (bewaard.indexOf(optie.dataset.id) !== -1) optie.classList.add('gekozen');
      markeer(optie);

      optie.addEventListener('click', function (e) {
        if (e.target.closest('a')) return;      /* de link naar de hele versie */
        wissel(optie);
      });
      /* Een tegel is een div, want een iframe mag niet in een button staan.
         Dan moet het toetsenbord er zelf in: spatie en enter, net als een knop. */
      optie.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        if (e.target.closest('a')) return;
        e.preventDefault();
        wissel(optie);
      });
    });
  });

  kopieer.addEventListener('click', function () {
    uitvoer.select();
    var gelukt = false;
    try { gelukt = document.execCommand('copy'); } catch (e) { /* oudere browser */ }
    if (navigator.clipboard && !gelukt) navigator.clipboard.writeText(uitvoer.value);
    kopieer.textContent = 'Gekopieerd';
    setTimeout(function () { kopieer.textContent = 'Kopieer de samenstelling'; }, 1600);
  });

  document.getElementById('wis-keuze').addEventListener('click', function () {
    keuze = {}; bewaar();
    document.querySelectorAll('.optie.gekozen').forEach(function (o) {
      o.classList.remove('gekozen'); o.setAttribute('aria-pressed', 'false');
    });
    toon();
  });

  toon();
})();
