/* ══════════════════════════════════════════════════════════════
   Zoeken in de categorie-index

   De index is achtendertig categorieën in zes vakken. Dat is te veel om
   te scannen en te weinig om een zoekpagina voor te bouwen: je weet wel
   wát je vervoert, je weet alleen niet onder welke kop het valt.

   Vandaar filteren in plaats van zoeken. Er komt geen resultatenlijst
   voor in de plaats — de index blijft staan en dooft af wat niet past.
   Zo zie je meteen in wélk vak je apparaat zit, en dat is de eigenlijke
   vraag. Een lijst met drie treffers had die context weggegooid.

   Wat niet past verdwijnt niet maar wordt gedempt. Een categorie die
   weggaat neemt de plek van de rest mee, en dan springt de pagina bij
   elke aanslag. Gedempt blijft alles staan waar het stond.

   De treffer wordt gemarkeerd met losse tekstknopen, niet met innerHTML.
   Wat je typt komt zo nooit als opmaak in de pagina terecht.
   ══════════════════════════════════════════════════════════════ */
(function () {
  var veld = document.querySelector('[data-categoriezoek]');
  if (!veld) return;

  var index = document.querySelector('#alle-categorieen');
  if (!index) return;

  var regels = Array.prototype.map.call(index.querySelectorAll('.vak li a'), function (a) {
    var naam = a.querySelector('.n');
    // De naam zonder het aantal erachter: dat getal is geen zoekterm.
    var tekst = '';
    Array.prototype.forEach.call(a.childNodes, function (k) {
      if (k !== naam && k.nodeType === 3) tekst += k.nodeValue;
    });
    return { a: a, li: a.closest('li'), vak: a.closest('.vak'), tekst: tekst.trim(), zoek: tekst.trim().toLowerCase() };
  });
  var vakken = Array.prototype.slice.call(index.querySelectorAll('.vak'));
  var teller = document.querySelector('[data-zoekteller]');
  var wis    = document.querySelector('[data-zoekwis]');

  /* Markeren met tekstknopen: de regel wordt opnieuw opgebouwd uit hoogstens
     drie stukken, waarvan er één in een <mark> zit. Nooit innerHTML — dan zou
     wat iemand typt als opmaak in de pagina belanden. */
  function markeer(regel, van, tot) {
    var a = regel.a, naam = a.querySelector('.n');
    while (a.firstChild && a.firstChild !== naam) a.removeChild(a.firstChild);
    var stukken = [];
    if (van > 0) stukken.push(document.createTextNode(regel.tekst.slice(0, van)));
    if (van >= 0) {
      var m = document.createElement('mark');
      m.textContent = regel.tekst.slice(van, tot);
      stukken.push(m);
    }
    stukken.push(document.createTextNode(regel.tekst.slice(tot < 0 ? 0 : tot)));
    stukken.reverse().forEach(function (k) { a.insertBefore(k, a.firstChild); });
  }

  function herstel(regel) {
    var a = regel.a, naam = a.querySelector('.n');
    while (a.firstChild && a.firstChild !== naam) a.removeChild(a.firstChild);
    a.insertBefore(document.createTextNode(regel.tekst), a.firstChild);
  }

  function filter() {
    var term = veld.value.trim().toLowerCase();
    var raak = 0;

    regels.forEach(function (regel) {
      if (!term) {
        herstel(regel);
        regel.li.classList.remove('raak', 'mis');
        return;
      }
      var i = regel.zoek.indexOf(term);
      if (i < 0) {
        herstel(regel);
        regel.li.classList.remove('raak');
        regel.li.classList.add('mis');
      } else {
        markeer(regel, i, i + term.length);
        regel.li.classList.remove('mis');
        regel.li.classList.add('raak');
        raak++;
      }
    });

    // Een vak zonder treffer dooft in zijn geheel: anders staat er een kop
    // boven acht gedempte regels en lijkt het alsof daar iets te halen valt.
    vakken.forEach(function (vak) {
      var heeft = !term || vak.querySelector('li.raak');
      vak.classList.toggle('leeg', !heeft);
    });

    index.classList.toggle('zoekt', !!term);
    if (wis) wis.hidden = !term;

    if (!teller) return;
    if (!term) teller.textContent = regels.length + ' categorieën in 6 toepassingen';
    else if (raak === 0) teller.textContent = 'niets gevonden — stuur het gewoon op, dan meten we het in';
    else teller.textContent = raak === 1 ? '1 categorie gevonden' : raak + ' categorieën gevonden';
  }

  veld.addEventListener('input', filter);
  veld.addEventListener('search', filter);

  if (wis) {
    wis.addEventListener('click', function () {
      veld.value = '';
      filter();
      veld.focus();
    });
  }

  /* Een chip vult het veld in plaats van ergens heen te linken: hij is een
     voorzet voor het filter, geen tweede navigatie. */
  Array.prototype.forEach.call(document.querySelectorAll('[data-zoekterm]'), function (chip) {
    chip.addEventListener('click', function (e) {
      e.preventDefault();
      veld.value = chip.getAttribute('data-zoekterm');
      filter();
      veld.focus();
    });
  });

  /* Vanuit de hero: naar de index én meteen in het veld. Zonder die focus
     moet je na het scrollen alsnog zelf klikken, en dan is de knop een
     ankerlink met een omweg. */
  Array.prototype.forEach.call(document.querySelectorAll('[data-naar-zoek]'), function (knop) {
    knop.addEventListener('click', function (e) {
      e.preventDefault();
      index.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Na het scrollen focussen: focus() tijdens een smooth scroll breekt
      // die af, want de browser springt dan naar het veld.
      var stil = null;
      function klaar() {
        clearTimeout(stil);
        stil = setTimeout(function () {
          removeEventListener('scroll', klaar);
          veld.focus({ preventScroll: true });
        }, 120);
      }
      addEventListener('scroll', klaar, { passive: true });
      klaar();
    });
  });

  filter();
})();
