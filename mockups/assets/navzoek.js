/* ══════════════════════════════════════════════════════════════
   Het zoekveld verhuist naar de navigatiebalk

   Sinds de navigatie vastplakt in plaats van de header, scrolt het grote
   zoekveld gewoon weg. Dat is meestal prima — je zoekt aan het begin —
   maar niet altijd: halverwege een categoriepagina bedenk je alsnog een
   artikelnummer, en dan is terugscrollen naar boven een omweg.

   Vandaar een klein veld in de balk. Ingeklapt is het een icoon, want de
   balk heeft geen ruimte voor meer; uitgeklapt schuift het over de
   telefoonregel heen in plaats van die opzij te duwen. Zo verspringt de
   balk niet op het moment dat je erop klikt.

   Het verschijnt pas voorbij de header. Zolang je die nog ziet staat het
   grote veld er, en dan zijn het er twee — waarvan je er één per ongeluk
   gebruikt en je zoekterm ziet verdwijnen als je verder scrolt.

   Het veld wordt hier gebouwd en niet in de vijftig pagina's gezet. Eén
   plek waar de vorm vandaan komt, en pagina's die alleen dit bestand
   hoeven te laden. De placeholder komt uit de header, zodat een pagina
   die daar iets eigens heeft staan dat hier terugziet.

   Uitzondering: pagina's met een eigen meelopende zoekbalk slaan we over.
   /case-voor heeft er zo een, en die doet precies dit werk al — twee
   zoekvelden onder elkaar is er één te veel.
   ══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var nav = document.querySelector('nav.primary');
  var kop = document.querySelector('header.main');
  if (!nav || !kop) return;

  // Heeft de pagina al iets dat meeloopt? Dan doen we niets.
  if (document.querySelector('[data-categoriezoek]')) return;

  var rechts = nav.querySelector('.rechts');
  if (!rechts) return;

  var bron = kop.querySelector('.search input');
  var hint = bron ? bron.getAttribute('placeholder') : 'Zoeken…';

  /* ── bouwen ─────────────────────────────────────────────── */

  function loep() {
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '14');
    svg.setAttribute('height', '14');
    svg.setAttribute('viewBox', '0 0 16 16');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '1.6');
    svg.setAttribute('aria-hidden', 'true');
    var c = document.createElementNS(svg.namespaceURI, 'circle');
    c.setAttribute('cx', '7'); c.setAttribute('cy', '7'); c.setAttribute('r', '5');
    var p = document.createElementNS(svg.namespaceURI, 'path');
    p.setAttribute('d', 'M11 11l4 4');
    svg.appendChild(c); svg.appendChild(p);
    return svg;
  }

  var doos = document.createElement('div');
  doos.className = 'navzoek';

  var knop = document.createElement('button');
  knop.type = 'button';
  knop.className = 'knop';
  knop.setAttribute('aria-label', 'Zoeken');
  knop.setAttribute('aria-expanded', 'false');
  knop.appendChild(loep());

  var veld = document.createElement('form');
  veld.className = 'veld';
  veld.setAttribute('role', 'search');
  veld.addEventListener('submit', function (e) { e.preventDefault(); });
  veld.appendChild(loep());

  var invoer = document.createElement('input');
  invoer.type = 'search';
  invoer.setAttribute('aria-label', 'Zoeken');
  invoer.placeholder = hint;
  veld.appendChild(invoer);

  doos.appendChild(knop);
  doos.appendChild(veld);
  rechts.insertBefore(doos, rechts.firstChild);

  /* ── open en dicht ──────────────────────────────────────── */

  function zet(open) {
    doos.classList.toggle('open', open);
    knop.setAttribute('aria-expanded', String(open));
    if (open) invoer.focus();
  }

  knop.addEventListener('click', function () { zet(true); });

  // Dicht als je hem leeg laat. Staat er tekst in, dan blijft hij staan:
  // je bent nog bezig, ook als je even ergens anders klikt.
  invoer.addEventListener('blur', function () {
    setTimeout(function () {
      if (!invoer.value.trim()) zet(false);
    }, 120);
  });

  invoer.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    invoer.value = '';
    invoer.blur();
    zet(false);
  });

  /* ── wanneer hij verschijnt ─────────────────────────────────
     Voorbij de header, met een marge eronder zodat hij niet knippert als
     je precies op de grens tot stilstand komt. Zelfde aanpak als
     merkkrimp.js, en om dezelfde reden. */

  var bij = false, wachtend = false;

  function meet() {
    wachtend = false;
    var grens = kop.offsetHeight || 74;
    var y = window.scrollY || document.documentElement.scrollTop || 0;

    if (!bij && y > grens + 20) {
      bij = true;
      nav.classList.add('zoekbij');
    } else if (bij && y < grens - 10) {
      bij = false;
      nav.classList.remove('zoekbij');
      // Verdwijnt hij, dan gaat hij ook dicht: anders staat er een
      // uitgeklapt veld te wachten dat je niet meer ziet.
      invoer.value = '';
      zet(false);
    }
  }

  addEventListener('scroll', function () {
    if (wachtend) return;
    wachtend = true;
    requestAnimationFrame(meet);
  }, { passive: true });

  meet();
})();
