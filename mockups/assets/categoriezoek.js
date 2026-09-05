/* ══════════════════════════════════════════════════════════════
   Zoeken in de categorie-index

   De index is achtendertig categorieën in zes vakken. Dat is te veel om
   te scannen en te weinig om een zoekpagina voor te bouwen: je weet wel
   wát je vervoert, je weet alleen niet onder welke kop het valt.

   Het antwoord staat in het paneel onder de balk: de treffers zelf, met
   per regel hoeveel cases erin zitten en onder welke toepassing hij valt.
   De index eronder blijft ongemoeid.

   Dat is een correctie op hoe het eerst werkte. Toen dempte de index alles
   wat niet paste en lichtte hij de treffer op. Met het paneel erbij is dat
   dubbelop: je leest de treffers bovenaan en kijkt tegelijk naar een half
   uitgeschakelde index die hetzelfde zegt. Twee antwoorden op één vraag
   leest als ruis, en de gedempte regels trekken de aandacht juist naar
   wat je níét zocht.

   Wil je van een treffer naar zijn plek in de index, dan is daar de knop
   rechts op de regel voor. Dat is een keuze van de bezoeker in plaats van
   een effect dat vanzelf optreedt.

   Eén taalregel zit erin. Nederlands laat bij het meervoud een dubbele
   klinker vallen: gitaar wordt gitaren, kabel blijft kabels maar haak
   wordt haken. Wie "gitaar" typt vindt daardoor "Elektrische gitaren"
   niet, en dan lijkt de zoekfunctie stuk terwijl de categorie er gewoon
   staat. Daarom vergelijken we op een vorm waarin aa/ee/oo/uu tot één
   letter is teruggebracht: "gitaar" en "gitaren" worden allebei "gitar".

   Dat is geen stemmer en hoeft het niet te zijn — het dekt het geval dat
   je bij achtendertig categorieën werkelijk tegenkomt.

   Per regel in het paneel: de naam, hoeveel cases erin zitten, en rechts
   de toepassing waar hij onder valt — die laatste is apart aanklikbaar en
   springt naar dat vak. Twee verschillende bestemmingen op één regel, dus
   twee losse knoppen en geen link in een link.

   De zoekwoorden worden verrijkt met window.TOEPASSINGEN (toepassingen.js,
   die vóór dit bestand geladen moet zijn). Daar staan de synoniemen en de
   merknamen in: "les paul", "m32", "strato". Zonder die lijst werkt alles
   nog steeds, alleen dan alleen op wat er letterlijk staat. Vijfendertig
   van de achtendertig categorieën komen erin voor; de rest doet het op
   zijn eigen naam.
   ══════════════════════════════════════════════════════════════ */
(function () {
  var veld = document.querySelector('[data-categoriezoek]');
  if (!veld) return;

  var index = document.querySelector('#alle-categorieen');
  if (!index) return;

  /* Teruggebracht naar de vergelijkvorm. De letterposities die hier eerder
     bij werden gehouden waren er alleen voor de markering in de index; nu
     die weg is, is een string genoeg. */
  function vergelijkvorm(t) {
    var laag = t.toLowerCase(), uit = '';
    for (var i = 0; i < laag.length; i++) {
      if (i > 0 && laag[i] === laag[i - 1] && 'aeou'.indexOf(laag[i]) >= 0) continue;
      uit += laag[i];
    }
    return uit;
  }

  var regels = Array.prototype.map.call(index.querySelectorAll('.vak li a'), function (a) {
    var naam = a.querySelector('.n');
    // De naam zonder het aantal erachter: dat getal is geen zoekterm.
    var tekst = '';
    Array.prototype.forEach.call(a.childNodes, function (k) {
      if (k !== naam && k.nodeType === 3) tekst += k.nodeValue;
    });
    var schoon = tekst.trim();
    return { a: a, vak: a.closest('.vak'), tekst: schoon, zoek: vergelijkvorm(schoon) };
  });
  /* Synoniemen erbij uit de gedeelde lijst. Namen die daar niet in staan
     houden gewoon hun eigen naam als enige zoekwoord. */
  (function () {
    var lijst = window.TOEPASSINGEN;
    if (!lijst) return;
    var opNaam = {};
    lijst.forEach(function (t) { opNaam[t.naam.toLowerCase()] = t; });
    regels.forEach(function (regel) {
      var t = opNaam[regel.tekst.toLowerCase()];
      if (!t || !t.zoek) return;
      regel.extra = t.zoek.map(vergelijkvorm);
    });
  })();

  /* Wat wél in de gedeelde lijst staat maar niet in deze index: "Gibson
     Les Paul" en "Mengtafels" hebben een eigen pagina, alleen geen regel
     hier. Wie "les paul" of "m32" typt hoort daar te komen, ook al staat
     het niet in het overzicht op deze pagina. Ze verschijnen daarom wel
     in het paneel en niet in de index — die blijft wat hij is.

     Zonder eigen vak is er ook geen vak om heen te springen, dus staat de
     toepassing er als label in plaats van als knop. Een knop die nergens
     heen gaat is erger dan geen knop. */
  var extraRegels = (function () {
    var lijst = window.TOEPASSINGEN;
    if (!lijst) return [];
    var bekend = {};
    regels.forEach(function (r) { bekend[r.tekst.toLowerCase()] = true; });
    return lijst.filter(function (t) { return !bekend[t.naam.toLowerCase()]; })
      .map(function (t) {
        return { tekst: t.naam, zoek: vergelijkvorm(t.naam), groep: t.groep, pagina: t.pagina,
                 extra: (t.zoek || []).map(vergelijkvorm), buiten: true };
      });
  })();

  var teller = document.querySelector('[data-zoekteller]');
  var wis    = document.querySelector('[data-zoekwis]');

  function filter() {
    var term = vergelijkvorm(veld.value.trim());
    var treffers = [];

    if (term) {
      regels.forEach(function (regel) {
        // In de naam, of anders in een synoniem: wie "m32" typt zoekt een
        // mengtafel, ook al staat dat woord nergens in de regel.
        var raakNaam = regel.zoek.indexOf(term) >= 0;
        var raakSynoniem = (regel.extra || []).some(function (w) { return w.indexOf(term) === 0; });
        if (raakNaam || raakSynoniem) treffers.push(regel);
      });
    }

    // Alleen wat een eigen plek in de index heeft telt mee in de teller;
    // de regels hieronder bestaan alleen in het paneel.
    var raak = treffers.length;

    if (term) {
      extraRegels.forEach(function (r) {
        if (r.zoek.indexOf(term) >= 0 || r.extra.some(function (w) { return w.indexOf(term) === 0; })) {
          treffers.push(r);
        }
      });
    }

    if (wis) wis.hidden = !term;
    vulPaneel(term, treffers);

    if (!teller) return;
    if (!term) teller.textContent = regels.length + ' categorieën in 6 toepassingen';
    else if (raak === 0) teller.textContent = 'niets gevonden — stuur het gewoon op, dan meten we het in';
    else teller.textContent = raak === 1 ? '1 categorie gevonden' : raak + ' categorieën gevonden';
  }

  /* ── het trefferpaneel ──────────────────────────────────────
     Onder de balk, over de index heen. Per regel twee bestemmingen: de
     naam gaat naar de categoriepagina, het label rechts springt naar het
     vak in de index. Daarom een <a> en een <button> naast elkaar en geen
     link in een link — dat laatste mag niet en werkt ook niet.

     Alles via textContent: wat je typt komt nooit als opmaak binnen. */
  var paneel = document.querySelector('[data-zoekpaneel]');
  var MAX = 8;

  function springNaar(vak) {
    vak.scrollIntoView({ behavior: 'smooth', block: 'center' });
    vak.classList.remove('aangewezen');
    // Opnieuw laten aanslaan als je twee keer hetzelfde vak kiest: zonder
    // deze onderbreking loopt de animatie niet nog een keer.
    void vak.offsetWidth;
    vak.classList.add('aangewezen');
    setTimeout(function () { vak.classList.remove('aangewezen'); }, 1400);
  }

  function vulPaneel(term, treffers) {
    if (!paneel) return;
    paneel.textContent = '';
    if (!term) { paneel.hidden = true; return; }
    paneel.hidden = false;

    if (!treffers.length) {
      var leeg = document.createElement('p');
      leeg.className = 'niets';
      leeg.textContent = 'Geen categorie met deze naam. Stuur een schets of een foto op — dan meten we het in.';
      var knop = document.createElement('a');
      knop.className = 'btn btn-dark btn-sm';
      knop.href = 'case-aanvragen-v1.html';
      knop.textContent = 'Case aanvragen →';
      paneel.appendChild(leeg);
      paneel.appendChild(knop);
      return;
    }

    var ul = document.createElement('ul');
    treffers.slice(0, MAX).forEach(function (regel) {
      var li = document.createElement('li');

      var naar = document.createElement('a');
      naar.className = 'naar';
      naar.href = regel.buiten ? regel.pagina : regel.a.getAttribute('href');
      var nm = document.createElement('span');
      nm.className = 'nm';
      nm.textContent = regel.tekst;
      var ct = document.createElement('span');
      ct.className = 'ct';
      var aantal = regel.buiten ? null : regel.a.querySelector('.n');
      ct.textContent = aantal ? aantal.textContent.trim() + ' cases' : 'eigen pagina';
      naar.appendChild(nm);
      naar.appendChild(ct);

      var cat;
      if (regel.buiten) {
        cat = document.createElement('span');
        cat.className = 'cat los';
        cat.textContent = regel.groep;
      } else {
        var kop = regel.vak.querySelector('.vkop h3');
        cat = document.createElement('button');
        cat.className = 'cat';
        cat.type = 'button';
        cat.textContent = (kop ? kop.textContent.trim() : 'toepassing') + ' →';
        cat.title = 'Naar deze toepassing in de index';
        cat.addEventListener('click', function () { springNaar(regel.vak); });
      }

      li.appendChild(naar);
      li.appendChild(cat);
      ul.appendChild(li);
    });
    paneel.appendChild(ul);

    if (treffers.length > MAX) {
      var meer = document.createElement('p');
      meer.className = 'meer';
      meer.textContent = 'nog ' + (treffers.length - MAX) + ' andere — typ iets specifieker om ze erbij te krijgen';
      paneel.appendChild(meer);
    }
  }

  /* Escape sluit het paneel zonder het veld leeg te maken: je wilt de
     index kunnen zien terwijl je zoekterm blijft staan. */
  veld.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && paneel && !paneel.hidden) { paneel.hidden = true; e.stopPropagation(); }
  });
  document.addEventListener('click', function (e) {
    if (!paneel || paneel.hidden) return;
    if (paneel.contains(e.target) || veld.contains(e.target) || e.target === veld) return;
    paneel.hidden = true;
  });
  veld.addEventListener('focus', function () { if (veld.value.trim()) filter(); });

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
