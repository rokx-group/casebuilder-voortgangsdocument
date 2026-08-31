/**
 * Tekent de vouw op de wireframe — waar het scherm ophoudt.
 *
 * Niet op een aangenomen 900 px: dat is een schermhoogte, geen vensterhoogte.
 * Van die 900 gaat op een MacBook de menubalk af plus de tab-, adres- en
 * bladwijzerbalk van de browser, en dan houd je rond de 760 over. Hoeveel
 * precies verschilt per mens, per browser en per scherm — dus meten we het
 * in het venster van degene die kijkt, en tekenen we het daar.
 *
 * De referentielijn op 900 blijft staan, zodat een gedeelde schermafbeelding
 * nog steeds te vergelijken is.
 */
(function () {
  var blad = document.querySelector('.wfpage');
  if (!blad) return;

  var stijl = document.createElement('style');
  stijl.textContent = [
    '.vouw-echt{position:absolute;left:0;right:0;z-index:5;border-top:2px dashed #E8663C;pointer-events:none}',
    '.vouw-echt > span{position:absolute;left:0;top:-12px;background:#E8663C;color:#fff;',
    '  font:600 10px/1 ui-monospace,monospace;letter-spacing:.1em;text-transform:uppercase;padding:6px 10px}',
    '.vouw-echt.later{border-top-color:rgba(232,102,60,.32)}',
    '.vouw-echt.later > span{background:rgba(232,102,60,.55);font-weight:500}',
    '.vouw-ref{position:absolute;left:0;right:0;z-index:4;border-top:1px dashed #8B9BA6;pointer-events:none}',
    '.vouw-ref > span{position:absolute;right:0;top:-10px;background:#E9EEF2;color:#5A6B77;',
    '  font:500 9.5px/1 ui-monospace,monospace;letter-spacing:.1em;text-transform:uppercase;padding:4px 8px;',
    '  border:1px solid #C8D4DC}'
  ].join('');
  document.head.appendChild(stijl);

  function teken() {
    Array.prototype.forEach.call(blad.querySelectorAll('.vouw-echt,.vouw-ref'), function (n) { n.remove(); });
    var h = window.innerHeight;
    var hoog = blad.offsetHeight;

    for (var y = h, n = 1; y < hoog; y += h, n++) {
      var l = document.createElement('div');
      l.className = 'vouw-echt' + (n > 1 ? ' later' : '');
      l.style.top = y + 'px';
      l.innerHTML = '<span>' + (n === 1
        ? 'de vouw &middot; jouw venster is ' + h + ' px hoog'
        : 'scherm ' + (n + 1) + ' begint hier') + '</span>';
      blad.appendChild(l);
    }

    // referentie, zodat schermafbeeldingen onderling vergelijkbaar blijven
    if (hoog > 900) {
      var r = document.createElement('div');
      r.className = 'vouw-ref';
      r.style.top = '900px';
      r.innerHTML = '<span>referentie 900 px</span>';
      blad.appendChild(r);
    }
  }

  addEventListener('DOMContentLoaded', teken);
  addEventListener('resize', teken);
})();
