/**
 * "Wat ga je vervoeren?" als invoerveld in plaats van als link.
 *
 * Twee kanten van dezelfde beweging, daarom in één bestand:
 *
 *   1. In de hero van homepage-v1, v2 en v3 klapt de knop naar rechts open tot een
 *      veld. Je typt wat erin moet, en dan gebeurt er één van twee dingen:
 *      we kennen het → de categoriepagina; we kennen het niet → de
 *      aanvraagpagina met jouw tekst er al in.
 *
 *   2. Op case-aanvragen-v1.html vult hij dat veld daadwerkelijk in, uit
 *      ?vervoeren= in de URL. Zonder dat tweede stuk is de eerste helft
 *      een doodlopende demo.
 *
 * De lijst waar tegenaan gematcht wordt staat in toepassingen.js, en moet
 * dus vóór dit bestand geladen zijn.
 *
 * Waarom het veld openklapt en niet gewoon altijd openstaat: de hero heeft
 * twee handelingen naast elkaar en die horen niet even zwaar te wegen.
 * Configureren is de hoofdroute; dit is de opvang voor wie niet weet hoe
 * zijn case heet. Een veld dat altijd openstaat trekt die keuze uit balans.
 */
(function () {
  'use strict';

  var AANVRAAG = 'case-aanvragen-v1.html';
  /* Waar "alle categorieën" heen gaat. Als constante en niet in de markup:
     hij hoort bij het gedrag van de balk, en die staat inmiddels op drie
     pagina's. Eén regel om te wijzigen als /case-voor een ander sjabloon
     krijgt. */
  var ALLE = 'case-voor-v3.html#alle-categorieen';
  /* Vier suggesties, en dan de uitweg. Meer dan vier leest niet meer als
     "dit bedoel je waarschijnlijk" maar als een lijst die je moet
     doornemen — en dan is doorklikken naar het overzicht sneller. */
  var MAX = 4;

  /* ── 1 · de balk in de hero ─────────────────────────────────── */

  function bouwBalk(root) {
    var knop  = root.querySelector('.vervoer-knop');
    var veld  = root.querySelector('.vervoer-veld');
    var input = root.querySelector('input');
    var lijst = root.querySelector('.vervoer-lijst');
    if (!knop || !veld || !input || !lijst) return;

    var open = false;
    var actief = -1;      // welke suggestie met de pijltjes is aangewezen
    var treffers = [];

    function zetOpen(nieuw) {
      if (open === nieuw) return;
      open = nieuw;
      root.classList.toggle('is-open', open);
      knop.setAttribute('aria-expanded', String(open));
      if (!open) sluitLijst();
    }

    /* Dichtklappen mag alleen als er niets staat en de cursor er niet in
       staat. Anders verdwijnt het veld onder je handen zodra je even met
       de muis wegschiet, en ben je je tekst kwijt. */
    function magDicht() {
      return !input.value.trim() && document.activeElement !== input;
    }

    function sluitLijst() {
      lijst.hidden = true;
      lijst.innerHTML = '';
      input.setAttribute('aria-expanded', 'false');
      actief = -1;
      treffers = [];
    }

    function toonLijst() {
      var gevonden = window.TOEPASSINGEN_ZOEK(input.value, MAX);
      actief = -1;

      if (!gevonden.length) {
        sluitLijst();
        return;
      }

      /* De uitweg hangt onderaan als gewone optie in dezelfde reeks. Zo
         loopt de pijltjesnavigatie er vanzelf overheen en werkt Enter erop
         zonder aparte afhandeling — verstuur() kijkt alleen naar .pagina. */
      treffers = gevonden.concat([{ naam: 'Alle categorieën bekijken',
                                    groep: '38 categorieën',
                                    pagina: ALLE, alles: true }]);

      lijst.innerHTML = '';
      treffers.forEach(function (t, i) {
        var li = document.createElement('li');
        li.setAttribute('role', 'option');
        li.setAttribute('aria-selected', 'false');
        li.id = 'vervoer-optie-' + i;
        if (t.alles) li.className = 'alles';
        li.innerHTML = '<span class="nm"></span><span class="gr"></span>';
        li.querySelector('.nm').textContent = t.naam;
        li.querySelector('.gr').textContent = t.groep;
        li.addEventListener('mousedown', function (e) {
          e.preventDefault();          // blur vóór de klik zou de lijst sluiten
          ga(t.pagina);
        });
        lijst.appendChild(li);
      });

      lijst.hidden = false;
      input.setAttribute('aria-expanded', 'true');
    }

    function markeer() {
      Array.prototype.forEach.call(lijst.children, function (li, i) {
        var aan = i === actief;
        li.classList.toggle('aan', aan);
        li.setAttribute('aria-selected', String(aan));
      });
      input.setAttribute('aria-activedescendant', actief > -1 ? 'vervoer-optie-' + actief : '');
    }

    function ga(url) {
      window.location.href = url;
    }

    /* De hele afspraak in vier regels: aangewezen suggestie wint, anders de
       beste treffer, anders de aanvraag met de tekst mee. Leeg veld doet
       niets — dan is er niets om op te zoeken. */
    function verstuur() {
      var tekst = input.value.trim();
      if (!tekst) { input.focus(); return; }

      if (actief > -1 && treffers[actief]) return ga(treffers[actief].pagina);
      // Zonder aanwijzing telt de uitweg niet mee: Enter hoort de beste
      // treffer te openen, niet het overzicht.

      var beste = window.TOEPASSINGEN_ZOEK(tekst, 1)[0];
      if (beste) return ga(beste.pagina);

      ga(AANVRAAG + '?vervoeren=' + encodeURIComponent(tekst));
    }

    knop.addEventListener('click', function () {
      zetOpen(true);
      input.focus();
    });

    root.addEventListener('mouseenter', function () { zetOpen(true); });
    root.addEventListener('mouseleave', function () { if (magDicht()) zetOpen(false); });

    input.addEventListener('focus', function () { zetOpen(true); });
    input.addEventListener('blur', function () {
      // buiten de volgorde van de klik om, anders sluit hij vóór de keuze
      setTimeout(function () {
        sluitLijst();
        if (magDicht() && !root.matches(':hover')) zetOpen(false);
      }, 120);
    });

    input.addEventListener('input', toonLijst);

    input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        if (lijst.hidden) { toonLijst(); return; }
        e.preventDefault();
        /* -1 is "niets aangewezen" en hoort in de ronde mee: zo kun je met
           de pijltjes weer terug naar je eigen tekst. */
        var n = treffers.length;
        if (e.key === 'ArrowDown') actief = actief + 1 >= n ? -1 : actief + 1;
        else actief = actief - 1 < -1 ? n - 1 : actief - 1;
        markeer();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        verstuur();
      } else if (e.key === 'Escape') {
        if (!lijst.hidden) { sluitLijst(); return; }
        input.value = '';
        input.blur();
        zetOpen(false);
      }
    });

    root.querySelector('.vervoer-ga').addEventListener('click', verstuur);
  }

  /* ── 2 · de prefill op de aanvraagpagina ────────────────────── */

  function vulAanvraagIn() {
    var doel = document.querySelector('[data-vervoeren]');
    if (!doel) return;

    var tekst = new URLSearchParams(window.location.search).get('vervoeren');
    if (!tekst) return;

    doel.value = tekst;

    /* Het veld eronder krijgt de cursor, niet dit veld: wat hier staat heb
       je net zelf getypt, dus daar hoef je niet meer naartoe. */
    var velden = Array.prototype.slice.call(
      doel.form ? doel.form.querySelectorAll('input, textarea') : document.querySelectorAll('input, textarea')
    );
    var volgende = velden[velden.indexOf(doel) + 1];
    if (volgende) volgende.focus({ preventScroll: true });

    doel.classList.add('is-meegekomen');
  }

  document.querySelectorAll('[data-vervoer]').forEach(bouwBalk);
  vulAanvraagIn();
})();
