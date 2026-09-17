/* ══════════════════════════════════════════════════════════════
   Verder waar je was — personalisatie met één simpele regel

   Besloten op 11 september (punt 06): nu al, maar met een regel en
   zonder personalisatiesysteem. Wie een product of categorie bekeek,
   ziet op de homepage "verder waar je was" met een link terug, en de
   categorie erboven.

   Twee kanten:
     - Een pagina die onthouden mag worden zet op <body>:
         data-onthoud='{"naam":"…","pagina":"…html","categorie":"…",
                        "categoriepagina":"…html"}'
       of roept window.cbOnthoud({…}) aan (de productpagina, die per
       product wisselt).
     - De homepage heeft een strook [data-verder] die dit script invult en
       toont. Na dertig dagen of na "vergeet dit" is hij weg.

   Op de echte site alleen met cookietoestemming. Alles blijft in de
   browser (localStorage); er gaat niets naar een server. Links uit de
   opslag worden alleen gebruikt als het een gewone paginanaam is, zodat
   er nooit een javascript:-link in kan komen. Namen via textContent.
   ══════════════════════════════════════════════════════════════ */
(function () {
  var SLEUTEL = 'cb-laatst';
  var BEWAARTERMIJN = 30 * 24 * 60 * 60 * 1000;
  var PAGINA = /^[a-z0-9-]+\.html(#[a-z0-9-]*)?$/i;

  function lees() { try { return JSON.parse(localStorage.getItem(SLEUTEL)); } catch (e) { return null; } }
  function bewaar(v) { try { localStorage.setItem(SLEUTEL, JSON.stringify(v)); } catch (e) {} }

  window.cbOnthoud = function (item) {
    if (!item || !item.naam || !PAGINA.test(item.pagina || '')) return;
    bewaar({ naam: String(item.naam), pagina: item.pagina,
             categorie: item.categorie ? String(item.categorie) : '',
             categoriepagina: PAGINA.test(item.categoriepagina || '') ? item.categoriepagina : '',
             wanneer: Date.now() });
  };

  var eigen = document.body.getAttribute('data-onthoud');
  if (eigen) { try { window.cbOnthoud(JSON.parse(eigen)); } catch (e) {} }

  var strook = document.querySelector('[data-verder]');
  if (!strook) return;
  var l = lees();
  if (!l || !PAGINA.test(l.pagina || '') || Date.now() - (l.wanneer || 0) > BEWAARTERMIJN) return;

  var product = strook.querySelector('[data-verder-product]');
  product.textContent = l.naam;
  product.setAttribute('href', l.pagina);
  var cat = strook.querySelector('[data-verder-cat]');
  if (l.categorie && l.categoriepagina) { cat.textContent = l.categorie; cat.setAttribute('href', l.categoriepagina); }
  else cat.hidden = true;
  strook.querySelector('[data-verder-weg]').addEventListener('click', function () {
    try { localStorage.removeItem(SLEUTEL); } catch (e) {}
    strook.hidden = true;
  });
  strook.hidden = false;
})();
