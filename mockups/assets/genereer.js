/* ══════════════════════════════════════════════════════════════
   Genereer één pagina uit de gekozen banden

   De samenstelpagina laat per band een uitsnede kiezen. Die keuze staat
   al in de tegel: het kader wijst naar homepage-vN.html?uitsnede=band.
   Deze knop volgt diezelfde verwijzing, haalt de band uit de versie en
   zet er één bestand van. Geen tweede lijst met koppelingen dus — die
   zou uit de pas lopen zodra er een uitsnede bijkomt.

   Eén ding maakt het meer dan knippen en plakken: elke versie heeft
   eigen CSS met dezelfde klassenamen. Zonder afscherming herschrijft de
   CSS van v4 ook de hero van v1. Elke bron krijgt daarom een eigen
   wortelklasse en zijn CSS wordt daarachter gezet — dezelfde ingreep
   als scripts/bouw-ontwerpweergave.mjs doet voor de ingesloten
   weergave.

   Header, nav en footer komen uit mockups/onderdelen/; die staan al in
   brand.css en hoeven niet afgeschermd te worden.

   Werkt alleen over http. Op file:// blokkeert Chrome het inlezen van
   de bronbestanden; dat wordt gemeld in plaats van stil te mislukken.
   ══════════════════════════════════════════════════════════════ */
(function () {
  var knop = document.getElementById('genereer');
  if (!knop) return;

  var naamveld = document.getElementById('gen-naam');
  var vak = document.getElementById('gen-uit');
  var kader = document.getElementById('gen-kader');
  var melding = document.getElementById('gen-melding');
  var download = document.getElementById('gen-download');
  var laatste = null;

  var VERVANG = { ':root': '', 'body': '', 'html': null };

  function voorvoeg(selectors, wortel) {
    return selectors.split(',').map(function (s) { return s.trim(); }).filter(Boolean)
      .map(function (s) {
        if (s in VERVANG) return VERVANG[s] === null ? null : wortel;
        return wortel + ' ' + s;
      }).filter(Boolean).join(',');
  }

  /* Minimale CSS-herschrijver: comments eruit, elke selector achter de wortel. */
  function schaalIn(css, wortel) {
    var rest = css.replace(/\/\*[\s\S]*?\*\//g, ''), uit = '';
    while (rest.length) {
      var haak = rest.indexOf('{');
      if (haak === -1) break;
      var kop = rest.slice(0, haak).trim(), diepte = 0, i = haak;
      for (; i < rest.length; i++) {
        if (rest[i] === '{') diepte++;
        else if (rest[i] === '}' && --diepte === 0) break;
      }
      var body = rest.slice(haak + 1, i);
      rest = rest.slice(i + 1);
      if (!kop) continue;
      if (kop.indexOf('@media') === 0 || kop.indexOf('@supports') === 0) {
        var binnen = schaalIn(body, wortel);
        if (binnen) uit += kop + '{' + binnen + '}';
      } else if (kop.charAt(0) === '@') {
        uit += kop + '{' + body + '}';           /* keyframes, font-face */
      } else {
        var sel = voorvoeg(kop, wortel);
        if (sel) uit += sel + '{' + body.trim() + '}';
      }
    }
    return uit;
  }

  /* Waar komt deze tegel vandaan? Het kader weet het al. */
  function bronVan(optie) {
    var frame = optie.querySelector('iframe');
    var src = frame && (frame.dataset.src || frame.getAttribute('src'));
    if (!src) return null;
    var m = src.match(/^(homepage-v(\d)\.html)\?uitsnede=([a-z0-9-]+)$/i);
    return m ? { bestand: m[1], versie: m[2], band: m[3] } : null;
  }

  var opgehaald = {};
  function haal(bestand) {
    if (!opgehaald[bestand]) {
      opgehaald[bestand] = fetch(bestand)
        .then(function (r) { if (!r.ok) throw new Error(bestand + ': ' + r.status); return r.text(); })
        .then(function (t) { return new DOMParser().parseFromString(t, 'text/html'); });
    }
    return opgehaald[bestand];
  }

  function bouw() {
    var wil = [], uitleg = [];
    document.querySelectorAll('.band').forEach(function (band) {
      band.querySelectorAll('.optie.gekozen').forEach(function (optie) {
        var b = bronVan(optie);
        if (b) { b.naam = band.dataset.naam; b.kort = optie.dataset.kort || ''; wil.push(b); }
        else if (optie.dataset.bron && optie.dataset.bron !== '—') {
          uitleg.push('Bij <b>' + band.dataset.naam + '</b> kon de bron van de gekozen tegel niet gelezen worden; die band is overgeslagen.');
        }
        /* een "geen ..."-tegel heeft geen kader en hoort niets toe te voegen */
      });
    });

    if (!wil.length) return Promise.resolve({ fout: 'Nog niets gekozen — klik hierboven per band een uitsnede aan.' });

    var bestanden = wil.map(function (b) { return b.bestand; })
      .filter(function (b, i, a) { return a.indexOf(b) === i; });

    return Promise.all(bestanden.map(haal)).then(function (docs) {
      var doc = {};
      bestanden.forEach(function (b, i) { doc[b] = docs[i]; });

      var stukken = [], gebruikt = {};
      wil.forEach(function (b) {
        var el = doc[b.bestand].querySelector('[data-band="' + b.band + '"]');
        if (!el) {
          uitleg.push('In v' + b.versie + ' bestaat geen band <code>' + b.band + '</code> (meer) — <b>' + b.naam + '</b> is overgeslagen.');
          return;
        }
        gebruikt[b.versie] = b.bestand;
        var kopie = el.cloneNode(true);
        /* Een band die met een negatieve marge aan zijn buur vastzit,
           hangt zonder die buur scheef. Zelfde correctie als uitsnede.js. */
        kopie.style.marginTop = '0';
        stukken.push('<div class="uit-v' + b.versie + '">' + kopie.outerHTML + '</div>');
      });

      if (!stukken.length) return { fout: 'Geen van de gekozen banden was te vinden.', uitleg: uitleg };

      var stijl = Object.keys(gebruikt).map(function (v) {
        var css = Array.prototype.map.call(doc[gebruikt[v]].querySelectorAll('style'),
          function (s) { return s.textContent; }).join('\n');
        return '/* uit homepage-v' + v + '.html */\n' + schaalIn(css, '.uit-v' + v);
      }).join('\n');

      return Promise.all(['header', 'nav', 'footer'].map(function (o) {
        return fetch('onderdelen/' + o + '.html').then(function (r) { return r.text(); });
      })).then(function (delen) {
        var lijst = wil.map(function (b) { return b.naam + ': v' + b.versie + ' · ' + b.kort; }).join('\n     ');
        var html = '<!doctype html><html lang="nl"><head><meta charset="utf-8">'
          + '<meta name="viewport" content="width=device-width, initial-scale=1">'
          + '<title>Casebuilder — samengestelde homepage (mockup)</title>'
          + '<link rel="preconnect" href="https://fonts.googleapis.com">'
          + '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
          + '<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700;900&family=DM+Sans:wght@400;500;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">'
          + '<link rel="stylesheet" href="assets/brand.css">\n'
          + '<!-- Samengesteld op ' + new Date().toISOString().slice(0, 10) + ' via homepage-samenstellen.html\n'
          + '     ' + lijst + '\n'
          + '     De CSS per bron staat achter .uit-vN, zodat de versies elkaar niet overschrijven. -->\n'
          + '<style>\n' + stijl + '\n</style></head><body>\n'
          + delen[0] + '\n' + delen[1] + '\n' + stukken.join('\n') + '\n' + delen[2]
          + '\n</body></html>';
        return { html: html, uitleg: uitleg, aantal: stukken.length };
      });
    });
  }

  knop.addEventListener('click', function () {
    vak.hidden = false;
    download.hidden = true;
    melding.textContent = 'Bezig…';
    bouw().then(function (r) {
      if (r.fout) { melding.textContent = r.fout; return; }
      laatste = r.html;
      kader.srcdoc = r.html;
      download.hidden = false;
      melding.innerHTML = (r.uitleg.length ? '<b>Let op:</b> ' + r.uitleg.join(' ') + ' ' : '')
        + r.aantal + ' banden samengevoegd. Bekijk hem hieronder; klopt het, dan download je hem.';
    }).catch(function (e) {
      melding.innerHTML = 'De bronpagina’s konden niet gelezen worden (' + e.message + '). '
        + 'Dat gebeurt als je deze pagina via <code>file://</code> opent — Chrome staat dat daar niet toe. '
        + 'Open hem via de Netlify-link, dan werkt de knop wel.';
    });
  });

  download.addEventListener('click', function () {
    if (!laatste) return;
    var naam = (naamveld.value || 'homepage-mix').trim()
      .replace(/\.html$/i, '').replace(/[^a-z0-9-]/gi, '-').replace(/-+/g, '-');
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([laatste], { type: 'text/html' }));
    a.download = (naam || 'homepage-mix') + '.html';
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  });
})();
