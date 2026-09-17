/**
 * "Wat ga je vervoeren?" als invoerveld in plaats van als link.
 *
 * Twee kanten van dezelfde beweging, daarom in één bestand:
 *
 *   1. In de hero van homepage-v1 en v2 klapt de knop naar rechts open tot
 *      een veld; op /case-voor staat het veld altijd open. Je typt wat erin
 *      moet en krijgt een lijst suggesties.
 *
 *   2. Op case-aanvragen-v1.html vult hij dat veld daadwerkelijk in, uit
 *      ?vervoeren= in de URL. Zonder dat tweede stuk is de eerste helft
 *      een doodlopende demo.
 *
 * De lijst (besloten op 11 september):
 *
 *   - Per soort gegroepeerd: producten, categorieën, branches.
 *   - Het label rechts is zelf een link. Staat er bij een Gibson "Backline",
 *     dan brengt een klik op dat woord je naar alles in backline; een klik
 *     op de rest van de regel naar de Gibson zelf.
 *   - Daaronder de uitweg: "alle gitaarcases" als het apparaat onder een
 *     categorie hangt, anders alle categorieën.
 *   - En onderaan altijd drie deuren, ook als er niets gevonden is: we
 *     hebben het (de shop), jij maakt het (de configurator), wij maken het
 *     (de aanvraag, met je tekst erin). Het motto: het is altijd mogelijk.
 *     Een zoekopdracht mag nooit doodlopen.
 *
 * De lijst waar tegenaan gematcht wordt staat in toepassingen.js, en moet
 * dus vóór dit bestand geladen zijn. De opmaak staat in vervoeren.css.
 *
 * Waarom het veld in de hero openklapt en niet gewoon altijd openstaat: de
 * hero heeft twee handelingen naast elkaar en die horen niet even zwaar te
 * wegen. Een veld dat altijd openstaat trekt die keuze uit balans.
 *
 * Alles wat de bezoeker typt komt via textContent in de lijst, nooit als
 * opmaak.
 */
(function () {
  'use strict';

  var AANVRAAG = 'case-aanvragen-v1.html';
  var WINKEL = 'shop-v1.html';
  var CONFIGURATOR = 'configurator-v1.html?start=1';
  /* Waar "alle categorieën" heen gaat. Als constante en niet in de markup:
     hij hoort bij het gedrag van de balk, en die staat op meerdere
     pagina's. */
  var ALLE = 'case-voor-v3.html#alle-categorieen';
  /* Vier suggesties, en dan de uitwegen. Meer dan vier leest niet meer als
     "dit bedoel je waarschijnlijk" maar als een lijst die je moet
     doornemen. */
  var MAX = 4;

  /* Waar het label rechts naartoe gaat: de toepassing waar de regel onder
     valt, in de indeling van /case-voor en de shop. Backline heeft een
     eigen pagina; de rest wijst het vak in de index aan. */
  var GROEP_PAGINA = {
    Licht: 'case-voor-v3.html#av-licht',
    Audio: 'case-voor-v3.html#av-licht',
    Backline: 'case-voor-backline-v1.html',
    Camera: 'case-voor-v3.html#broadcast',
    Medisch: 'case-voor-v3.html#medisch',
    Industrie: 'case-voor-v3.html#industrie',
    Beurs: 'case-voor-v3.html#evenement',
    Branche: 'branches.html'
  };
  var SOORTEN = ['Producten', 'Categorieën', 'Branches'];
  function soortVan(t) { return t.soort === 'branche' ? 'Branches' : t.ouder ? 'Producten' : 'Categorieën'; }

  /* ── 1 · de balk ────────────────────────────────────────────── */

  function bouwBalk(root) {
    var knop  = root.querySelector('.vervoer-knop');
    var input = root.querySelector('input');
    var lijst = root.querySelector('.vervoer-lijst');
    if (!input || !lijst) return;
    /* Zonder knop staat het veld altijd open — zo zit hij op /case-voor,
       waar zoeken de hoofdzaak is en niet de tweede knop. Dan gaat alleen
       de lijst open en dicht, niet het veld zelf. */
    var vast = !knop;

    var open = false;
    var actief = -1;      // welke suggestie met de pijltjes is aangewezen
    var treffers = [];    // alleen de regels die je kunt kiezen, in volgorde

    function zetOpen(nieuw) {
      if (vast) { if (!nieuw) sluitLijst(); return; }
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
      lijst.textContent = '';
      input.setAttribute('aria-expanded', 'false');
      actief = -1;
      treffers = [];
    }

    /* De uitweg. Hangt het beste antwoord onder een categorie — een
       Gibson Les Paul valt onder gitaren — dan is dat "alle gitaarcases":
       je blijft in de buurt van wat je zocht. Anders alle categorieën.
       Wat erboven hangt staat in toepassingen.js (veld ouder). */
    function uitweg(beste) {
      if (beste && beste.ouder) {
        return { naam: beste.ouder.naam, groep: beste.groep, pagina: beste.ouder.pagina, alles: true };
      }
      return { naam: 'Alle categorieën bekijken', groep: '39 categorieën', pagina: ALLE, alles: true };
    }

    /* De drie deuren die er altijd staan. */
    function altijd(tekst) {
      return [
        { naam: 'We hebben het', groep: 'zoek in de shop', pagina: WINKEL + '?zoek=' + encodeURIComponent(tekst), altijd: true },
        { naam: 'Jij maakt het', groep: 'in de configurator', pagina: CONFIGURATOR, altijd: true },
        { naam: 'Wij maken het', groep: 'case aanvragen', pagina: AANVRAAG + '?vervoeren=' + encodeURIComponent(tekst), altijd: true }
      ];
    }

    function kop(tekst, extra) {
      var li = document.createElement('li');
      li.className = 'kop' + (extra ? ' ' + extra : '');
      li.setAttribute('role', 'presentation');
      li.textContent = tekst;
      lijst.appendChild(li);
    }

    function regel(t) {
      var i = treffers.length;
      treffers.push(t);
      var li = document.createElement('li');
      li.setAttribute('role', 'option');
      li.setAttribute('aria-selected', 'false');
      li.id = 'vervoer-optie-' + i;
      if (t.alles) li.className = 'alles';
      if (t.altijd) li.className = 'altijd';

      var nm = document.createElement('span');
      nm.className = 'nm';
      nm.textContent = t.naam;
      li.appendChild(nm);

      var doel = !t.alles && !t.altijd && GROEP_PAGINA[t.groep];
      var gr = document.createElement(doel ? 'a' : 'span');
      gr.className = 'gr';
      gr.textContent = t.groep;
      if (doel) { gr.href = doel; gr.title = 'Alles in ' + t.groep.toLowerCase(); }
      li.appendChild(gr);

      li.addEventListener('mousedown', function (e) {
        e.preventDefault();          // blur vóór de klik zou de lijst sluiten
        var label = e.target.closest('a.gr');
        ga(label ? label.getAttribute('href') : t.pagina);
      });
      lijst.appendChild(li);
    }

    function toonLijst() {
      var tekst = input.value.trim();
      if (window.TOEPASSINGEN_NORM(tekst).length < 2) { sluitLijst(); return; }

      var gevonden = window.TOEPASSINGEN_ZOEK(tekst, MAX);
      actief = -1;
      treffers = [];
      lijst.textContent = '';

      if (gevonden.length) {
        SOORTEN.forEach(function (soort) {
          var deze = gevonden.filter(function (t) { return soortVan(t) === soort; });
          if (!deze.length) return;
          kop(soort);
          deze.forEach(regel);
        });
        regel(uitweg(gevonden[0]));
      } else {
        var leeg = document.createElement('li');
        leeg.className = 'leeg';
        leeg.setAttribute('role', 'presentation');
        leeg.textContent = 'Geen categorie gevonden voor “' + tekst + '”.';
        lijst.appendChild(leeg);
      }

      kop('Het is altijd mogelijk', 'altijdkop');
      altijd(tekst).forEach(regel);

      lijst.hidden = false;
      input.setAttribute('aria-expanded', 'true');
    }

    function markeer() {
      Array.prototype.forEach.call(lijst.querySelectorAll('[role="option"]'), function (li, i) {
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
      // Zonder aanwijzing tellen de uitwegen niet mee: Enter hoort de beste
      // treffer te openen, niet het overzicht.

      var beste = window.TOEPASSINGEN_ZOEK(tekst, 1)[0];
      if (beste) return ga(beste.pagina);

      ga(AANVRAAG + '?vervoeren=' + encodeURIComponent(tekst));
    }

    if (!vast) {
      knop.addEventListener('click', function () {
        zetOpen(true);
        input.focus();
      });
      root.addEventListener('mouseenter', function () { zetOpen(true); });
      root.addEventListener('mouseleave', function () { if (magDicht()) zetOpen(false); });
    }

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

    var gaKnop = root.querySelector('.vervoer-ga');
    if (gaKnop) gaKnop.addEventListener('click', verstuur);
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
