/**
 * Videokeuze op de videoheader-pagina.
 *
 * Waarom: de varianten verschillen alléén in de film, niet in het ontwerp.
 * Twee losse pagina's in de versiebalk suggereerden twee ontwerpen en dwongen
 * je heen en weer te klikken om beeld te vergelijken. Nu staat er één tab
 * "video", en wissel je de film ter plekke — dan zie je hetzelfde ontwerp met
 * ander beeld, wat de eigenlijke vraag is.
 *
 * Nieuwe film toevoegen: bestanden in assets/ zetten en hieronder een regel
 * bijschrijven. Verder is er niets aan te passen.
 */
(function () {
  var FILMS = [
    { id: 'drone',    label: 'drone',    naam: 'hero-v2' },
    { id: 'precisie', label: 'precisie', naam: 'hero-v3' }
  ];
  // De donkere eerste versie is eruit; deze twee blijven over.
  var STANDAARD = 'drone';
  var BEWAARD = 'casebuilder-heldenfilm';

  var video = document.querySelector('.hero .film video');
  if (!video) return;
  var stil = document.querySelector('.hero .film img');

  var stijl = document.createElement('style');
  stijl.textContent = [
    '.filmbalk{position:fixed;right:16px;bottom:60px;z-index:9990;display:flex;align-items:center;',
    '  background:#06121C;box-shadow:0 6px 24px rgba(0,0,0,.28)}',
    '.filmbalk .lab{font:500 9.5px/1 ui-monospace,monospace;letter-spacing:.16em;text-transform:uppercase;',
    '  color:rgba(255,255,255,.45);padding:0 12px 0 14px}',
    '.filmbalk button{font:600 11px/1 ui-monospace,monospace;letter-spacing:.06em;',
    '  color:rgba(255,255,255,.7);background:none;border:0;border-left:1px solid rgba(255,255,255,.14);',
    '  padding:11px 14px;cursor:pointer}',
    '.filmbalk button:hover{color:#66C4E8}',
    '.filmbalk button.aan{background:#66C4E8;color:#06121C}',
    '@media(max-width:760px){.filmbalk{right:10px;bottom:54px}.filmbalk .lab{display:none}}'
  ].join('');
  document.head.appendChild(stijl);

  function toon(film) {
    var bronnen = video.querySelectorAll('source');
    // Volgorde in de markup is webm, dan mp4 — die houden we aan.
    if (bronnen[0]) bronnen[0].src = 'assets/' + film.naam + '.webm';
    if (bronnen[1]) bronnen[1].src = 'assets/' + film.naam + '.mp4';
    video.poster = 'assets/' + film.naam + '-poster.jpg';
    if (stil) stil.src = 'assets/' + film.naam + '-poster.jpg';
    video.load();
    var spelen = video.play();
    // Autoplay kan geweigerd worden; de poster blijft dan staan, dat is prima.
    if (spelen && spelen.catch) spelen.catch(function () {});
    try { localStorage.setItem(BEWAARD, film.id); } catch (e) {}
    balk.querySelectorAll('button').forEach(function (b) {
      b.classList.toggle('aan', b.dataset.id === film.id);
    });
  }

  var balk = document.createElement('div');
  balk.className = 'filmbalk';
  balk.innerHTML = '<span class="lab">Beeld</span>' + FILMS.map(function (f) {
    return '<button type="button" data-id="' + f.id + '">' + f.label + '</button>';
  }).join('');
  balk.addEventListener('click', function (e) {
    var knop = e.target.closest('button');
    if (!knop) return;
    toon(FILMS.filter(function (f) { return f.id === knop.dataset.id; })[0]);
  });

  addEventListener('DOMContentLoaded', function () {
    document.body.appendChild(balk);
    // Een pagina mag zijn eigen film opgeven (v2 opent op drone, v3 op
    // precisie). Die keuze gaat vóór wat de bezoeker eerder koos, anders
    // tonen twee versies na één klik dezelfde film.
    var eigen = document.body.dataset.film, vorige;
    if (!eigen) { try { vorige = localStorage.getItem(BEWAARD); } catch (e) {} }
    var start = FILMS.filter(function (f) { return f.id === eigen; })[0]
             || FILMS.filter(function (f) { return f.id === vorige; })[0]
             || FILMS.filter(function (f) { return f.id === STANDAARD; })[0];
    toon(start || FILMS[0]);
  });
})();
