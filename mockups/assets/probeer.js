/* ══════════════════════════════════════════════════════════════
   Probeer het — de kist met drie schuiven en een prijs die meeloopt

   Besloten op 11 september (punten 04 en 05): op de homepage en op
   /flightcases een strook waarin je de maten zelf verschuift. Het laat
   zien dat de configurator echt rekent, en het is meteen de
   prijstransparantie waar in de meeting om gevraagd werd.

   Opbouw, per blok:

     <div data-probeer data-vanaf="149">
       <div class="kist3d" data-draaikist data-vrij="1200">…</div>
       <input type="range" data-schuif="b|d|h"> + <output data-uit="b|d|h">
       <span data-probeerprijs></span>
       <a data-probeerlink data-basis="configurator-v1.html?start=1">
     </div>

   De prijs is een voorbeeldregel — basis plus paneeloppervlak, dezelfde
   als op de productpagina — en nooit lager dan data-vanaf. De echte prijs
   komt uit de configurator. De link neemt de maten mee naar de
   configurator.

   Van buitenaf zetten (op /flightcases, als je een ander model kiest):
     blok.dispatchEvent(new CustomEvent('probeer:zet',
       { detail: { b, d, h, vanaf, naam, basis } }))
   ══════════════════════════════════════════════════════════════ */
(function () {
  function voorbeeldprijs(b, d, h) {
    var opp = 2 * (b * h + b * d + h * d) / 1e6;
    return 60 + opp * 60;
  }
  function euro(x) { return '€ ' + (Math.round(x * 20) / 20).toFixed(2).replace('.', ','); }

  function start(blok) {
    var kist = blok.querySelector('[data-draaikist]');
    var schuiven = Array.prototype.slice.call(blok.querySelectorAll('input[data-schuif]'));
    var prijs = blok.querySelector('[data-probeerprijs]');
    var link = blok.querySelector('[data-probeerlink]');
    if (!kist || !schuiven.length) return;

    function werkBij() {
      var m = {};
      schuiven.forEach(function (s) {
        m[s.dataset.schuif] = Number(s.value);
        var uit = blok.querySelector('[data-uit="' + s.dataset.schuif + '"]');
        if (uit) uit.textContent = Number(s.value).toLocaleString('nl-NL');
      });
      kist.dispatchEvent(new CustomEvent('kist:maat', { detail: { naam: blok.dataset.naam || '', b: m.b, h: m.h, d: m.d } }));
      var vanaf = Number(blok.dataset.vanaf) || 0;
      if (prijs) prijs.textContent = euro(Math.max(vanaf, voorbeeldprijs(m.b, m.d, m.h)));
      if (link) {
        var basis = link.dataset.basis || link.getAttribute('href');
        link.setAttribute('href', basis + (basis.indexOf('?') > -1 ? '&' : '?') + 'b=' + m.b + '&d=' + m.d + '&h=' + m.h);
      }
    }

    schuiven.forEach(function (s) { s.addEventListener('input', werkBij); });
    blok.addEventListener('probeer:zet', function (e) {
      var z = e.detail || {};
      schuiven.forEach(function (s) {
        var w = z[s.dataset.schuif];
        if (w == null) return;
        if (w > Number(s.max)) s.max = w;
        if (w < Number(s.min)) s.min = w;
        s.value = w;
      });
      if (z.vanaf != null) blok.dataset.vanaf = z.vanaf;
      if (z.naam != null) blok.dataset.naam = z.naam;
      if (z.basis && link) link.dataset.basis = z.basis;
      werkBij();
    });
    werkBij();
  }

  Array.prototype.forEach.call(document.querySelectorAll('[data-probeer]'), start);
})();
