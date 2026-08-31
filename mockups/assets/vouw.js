/**
 * Meetlint voor de mockups. Staat uit, tenzij je ?vouw aan de URL hangt.
 *
 * Waarom: de wireframes noemen per sectie een hoogte in echte pixels. De
 * vouw hoort te liggen waar hij bij de kijker ligt, en dat is de hoogte van
 * het browservenster — niet die van het scherm. Een scherm van 900 met een
 * adresbalk, tabbladen en een dock levert een venster van pakweg 700 op, en
 * dat verschil bepaalt of een sectie boven of onder de vouw valt.
 *
 * Gebruik:  homepage.html?vouw          → volgt je venster, ook bij resizen
 *           homepage.html?vouw=1080     → pint een hoogte vast, om een
 *                                         ander venster na te bootsen
 * De lijst met secties en hun hoogtes komt in de console én rechtsonder
 * in beeld, zodat je hem kunt overnemen in de wireframe.
 */
(function () {
  var q = new URLSearchParams(location.search);
  if (!q.has('vouw')) return;

  // Zonder waarde volgt de vouw het echte venster; een waarde pint hem vast.
  var vast = parseInt(q.get('vouw'), 10) || 0;
  function vouwhoogte() { return vast || window.innerHeight; }

  var stijl = document.createElement('style');
  stijl.textContent = [
    '.vouwlijn{position:absolute;left:0;right:0;border-top:2px dashed #E8663C;z-index:9998;pointer-events:none}',
    '.vouwlijn span{position:absolute;right:12px;top:-11px;background:#E8663C;color:#fff;',
    '  font:600 11px/1 ui-monospace,monospace;letter-spacing:.08em;padding:5px 8px}',
    '.vouwmeet{position:fixed;right:14px;bottom:14px;z-index:9999;max-height:46vh;overflow:auto;',
    '  background:#06121C;color:#C6D9E5;font:11px/1.6 ui-monospace,monospace;padding:12px 14px;',
    '  box-shadow:0 8px 30px rgba(0,0,0,.4);min-width:280px}',
    '.vouwmeet b{color:#66C4E8;font-weight:600}',
    '.vouwmeet i{color:#E8663C;font-style:normal}',
    '.vouwmeet h6{margin:0 0 8px;font:600 10px/1 ui-monospace,monospace;letter-spacing:.14em;',
    '  text-transform:uppercase;color:#8B9BA6}'
  ].join('');
  document.head.appendChild(stijl);

  // De secties zoals ze in de wireframe staan: alles wat direct onder
  // body hangt plus de secties daarbinnen.
  function secties() {
    var uit = [];
    document.querySelectorAll('body > *').forEach(function (el) {
      if (el.classList.contains('vouwmeet') || el.tagName === 'SCRIPT') return;
      var r = el.getBoundingClientRect();
      if (!r.height) return;
      uit.push({ naam: naamVan(el), top: Math.round(r.top + scrollY), h: Math.round(r.height) });
    });
    return uit;
  }

  function naamVan(el) {
    if (el.tagName === 'HEADER') return 'header';
    if (el.tagName === 'NAV') return 'nav';
    if (el.tagName === 'FOOTER') return 'footer';
    var k = (el.className || '').toString().split(' ').filter(function (c) {
      return c && !/^(ruit|ruit-dark|ruit-veld|ruit-aanzet|beslag|tight|wrap)$/.test(c);
    })[0];
    return k || el.tagName.toLowerCase();
  }

  function teken() {
    document.querySelectorAll('.vouwlijn,.vouwmeet').forEach(function (n) { n.remove(); });
    var hoogte = vouwhoogte();
    var totaal = document.documentElement.scrollHeight;
    for (var y = hoogte; y < totaal; y += hoogte) {
      var l = document.createElement('div');
      l.className = 'vouwlijn';
      l.style.top = y + 'px';
      l.innerHTML = '<span>' + y + ' px &middot; vouw ' + (y / hoogte) + '</span>';
      document.body.appendChild(l);
    }
    var m = document.createElement('div');
    m.className = 'vouwmeet';
    m.innerHTML = '<h6>Hoogtes &middot; vensterhoogte ' + hoogte +
      (vast ? ' (vast)' : ' (volgt venster)') + '</h6>' +
      secties().map(function (s) {
        var boven = s.top < hoogte && s.top + s.h > hoogte;
        return (boven ? '<i>' : '') + '--h:' + s.h + (boven ? '</i>' : '') +
               ' &nbsp; <b>' + s.naam + '</b> &nbsp; <span style="color:#5A6B77">op ' + s.top + '</span>';
      }).join('<br>');
    document.body.appendChild(m);
    console.table(secties());
  }

  document.body.style.position = 'relative';
  addEventListener('load', teken);

  // Resize vuurt tientallen keren per seconde en teken() bouwt de lijnen
  // opnieuw op; even wachten tot het slepen klaar is scheelt gehak.
  var wacht;
  addEventListener('resize', function () {
    clearTimeout(wacht);
    wacht = setTimeout(teken, 120);
  });
})();
