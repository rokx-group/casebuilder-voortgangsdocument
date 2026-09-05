/* ══════════════════════════════════════════════════════════════
   Het zoekveld verhuist naar de navigatiebalk

   Sinds de navigatie vastplakt in plaats van de header, scrolt het grote
   zoekveld gewoon weg. Dat is meestal prima — je zoekt aan het begin —
   maar niet altijd: halverwege een categoriepagina bedenk je alsnog een
   artikelnummer, en dan is terugscrollen naar boven een omweg.

   Vandaar een klein veld in de balk, ingeklapt tot een loep. Niet dezelfde
   tekening als die in de header: die staat op 1.6 met vierkante uiteinden
   en oogt op 14 px slap. Deze is iets zwaarder, heeft ronde uiteinden en
   een steel die de cirkel raakt in plaats van er los naast te liggen.

   Uitgeklapt schuift het veld over de telefoonregel heen in plaats van
   die opzij te duwen, zodat de balk niet verspringt op het moment dat je
   erop klikt. De toets / opent hem ook, voor wie zijn handen op het
   toetsenbord houdt.

   Links in dezelfde balk komt het cB-monogram op, op hetzelfde moment.
   Het krimpende woordmerk zat in de header en die scrolt sinds kort weg;
   hiermee is het merk weer in beeld, en staat het waar een logo hoort.

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

  /* De loep. Cirkel iets kleiner en hoger geplaatst dan die in de header,
     steel op 45 graden die de rand raakt, ronde uiteinden. Op 15 px is dat
     het verschil tussen een icoon en een vlekje. */
  function loep() {
    var NS = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('width', '15');
    svg.setAttribute('height', '15');
    svg.setAttribute('viewBox', '0 0 16 16');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '1.8');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('aria-hidden', 'true');
    var c = document.createElementNS(NS, 'circle');
    c.setAttribute('cx', '6.9'); c.setAttribute('cy', '6.9'); c.setAttribute('r', '4.6');
    var p = document.createElementNS(NS, 'path');
    p.setAttribute('d', 'M10.4 10.4 14 14');
    svg.appendChild(c); svg.appendChild(p);
    return svg;
  }

  var doos = document.createElement('div');
  doos.className = 'navzoek';

  var knop = document.createElement('button');
  knop.type = 'button';
  knop.className = 'knop';
  knop.setAttribute('aria-label', 'Zoeken');
  knop.title = 'Zoeken \u2014 toets /';
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

  /* Het monogram links in de balk. Een klik brengt je naar boven: een
     logo dat nergens heen gaat is een plaatje, en de homepage is vanuit
     een mockup geen vast bestand. */
  var merkje = document.createElement('a');
  merkje.className = 'merkje';
  merkje.href = '#';
  merkje.setAttribute('aria-label', 'Naar boven');
  var mimg = document.createElement('img');
  mimg.src = 'assets/beeldmerk.svg';
  mimg.alt = '';
  merkje.appendChild(mimg);
  merkje.addEventListener('click', function (e) {
    e.preventDefault();
    scrollTo({ top: 0, behavior: 'smooth' });
  });
  nav.querySelector('.wrap').insertBefore(merkje, nav.querySelector('.wrap').firstChild);

  /* "Direct advies" wijkt voor het monogram. In de pagina's staat dat als
     kale tekst vóór het nummer; hier krijgt het een haakje zodat de CSS
     het kan wegnemen zonder dat er vijftig bestanden aan te pas komen. */
  (function () {
    var regels = rechts.querySelectorAll('span');
    for (var i = 0; i < regels.length; i++) {
      var sp = regels[i];
      for (var j = 0; j < sp.childNodes.length; j++) {
        var k = sp.childNodes[j];
        if (k.nodeType !== 3 || k.nodeValue.indexOf('Direct advies') < 0) continue;
        var label = document.createElement('span');
        label.className = 'label';
        label.textContent = k.nodeValue;
        sp.replaceChild(label, k);
        return;
      }
    }
  })();

  /* ── open en dicht ──────────────────────────────────────── */

  function zet(open) {
    doos.classList.toggle('open', open);
    knop.setAttribute('aria-expanded', String(open));
    if (open) invoer.focus();
  }

  knop.addEventListener('click', function () { zet(true); });

  /* De toets waarmaken die op de knop staat. Alleen als je niet al ergens
     aan het typen bent — anders kun je in geen enkel veld meer een schuine
     streep zetten. */
  addEventListener('keydown', function (e) {
    if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
    var el = document.activeElement;
    if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) return;
    if (!nav.classList.contains('zoekbij')) return;
    e.preventDefault();
    zet(true);
  });

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
