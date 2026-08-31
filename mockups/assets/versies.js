/**
 * Versietabs op de mockups. Hoort bij de mockup, niet bij het merk — de
 * generator van de ingesloten ontwerpweergave haalt scripts eruit, dus deze
 * balk verschijnt alleen op de losse pagina.
 *
 * Nieuwe variant toevoegen: bestand `naam-v2.html` maken en hieronder in de
 * lijst zetten. Eén plek, zodat de balk op elke versie hetzelfde toont.
 */
(function () {
  var REEKSEN = {
    'homepage': [
      { id: 'v1', bestand: 'homepage.html', label: 'v1 · wireframe' },
      { id: 'v2', bestand: 'homepage-v2.html', label: 'v2 · blueprint' },
      { id: 'v3', bestand: 'homepage-v3.html', label: 'v3 · video' }
    ],
    'categorie': [
      { id: 'v1', bestand: 'categorie.html', label: 'v1 · wireframe' },
      { id: 'v2', bestand: 'categorie-v2.html', label: 'v2 · ontwerp' }
    ],
    'onderdeel': [
      { id: 'v1', bestand: 'onderdeel.html', label: 'v1 · wireframe' },
      { id: 'v2', bestand: 'onderdeel-v2.html', label: 'v2 · ontwerp' }
    ],
    'casetype': [
      { id: 'v1', bestand: 'casetype.html', label: 'v1 · wireframe' },
      { id: 'v2', bestand: 'casetype-v2.html', label: 'v2 · ontwerp' }
    ],
    'flightcases': [
      { id: 'v1', bestand: 'flightcases.html', label: 'v1 · wireframe' },
      { id: 'v2', bestand: 'flightcases-v2.html', label: 'v2 · ontwerp' }
    ],
    'case-voor-gitaar': [
      { id: 'v1', bestand: 'case-voor-gitaar.html', label: 'v1 · wireframe' },
      { id: 'v2', bestand: 'case-voor-gitaar-v2.html', label: 'v2 · ontwerp' }
    ],
    'case-voor-gibson-les-paul': [
      { id: 'v1', bestand: 'case-voor-gibson-les-paul.html', label: 'v1 · wireframe' },
      { id: 'v2', bestand: 'case-voor-gibson-les-paul-v2.html', label: 'v2 · ontwerp' }
    ],
    'service': [
      { id: 'v1', bestand: 'service.html', label: 'v1 · wireframe' },
      { id: 'v2', bestand: 'service-v2.html', label: 'v2 · ontwerp' }
    ],
    'service-levertijden': [
      { id: 'v1', bestand: 'service-levertijden.html', label: 'v1 · wireframe' },
      { id: 'v2', bestand: 'service-levertijden-v2.html', label: 'v2 · ontwerp' }
    ],
    'zoeken': [
      { id: 'v1', bestand: 'zoeken.html', label: 'v1 · wireframe' },
      { id: 'v2', bestand: 'zoeken-v2.html', label: 'v2 · ontwerp' }
    ],
    'laten-controleren': [
      { id: 'v1', bestand: 'laten-controleren.html', label: 'v1 · wireframe' }
    ],
    'bedankt': [
      { id: 'v1', bestand: 'bedankt.html', label: 'v1 · wireframe' }
    ],
    'account': [
      { id: 'v1', bestand: 'account.html', label: 'v1 · wireframe' }
    ],
    'checkout': [
      { id: 'v1', bestand: 'checkout.html', label: 'v1 · wireframe' }
    ],
    'configurator': [
      { id: 'v1', bestand: 'configurator.html', label: 'v1 · wireframe' }
    ]
  };


  var hier = location.pathname.split('/').pop() || 'homepage.html';
  var reeks = null;
  for (var sleutel in REEKSEN) {
    if (REEKSEN[sleutel].some(function (v) { return v.bestand === hier; })) reeks = REEKSEN[sleutel];
  }
  if (!reeks) return;

  var stijl = document.createElement('style');
  stijl.textContent = [
    '.versiebalk{position:fixed;right:16px;bottom:16px;z-index:9990;display:flex;align-items:center;',
    '  gap:0;background:#06121C;box-shadow:0 6px 24px rgba(0,0,0,.28)}',
    '.versiebalk .lab{font:500 9.5px/1 ui-monospace,monospace;letter-spacing:.16em;text-transform:uppercase;',
    '  color:rgba(255,255,255,.45);padding:0 12px 0 14px}',
    '.versiebalk a{font:600 11px/1 ui-monospace,monospace;letter-spacing:.06em;color:rgba(255,255,255,.7);',
    '  text-decoration:none;padding:11px 14px;border-left:1px solid rgba(255,255,255,.14)}',
    '.versiebalk a:hover{color:#66C4E8}',
    '.versiebalk a.on{background:#66C4E8;color:#06121C}',
    '.versiebalk a.vol{color:#66C4E8}',
    '.versiebalk a.vol:hover{background:rgba(102,196,232,.16)}',
    '@media(max-width:760px){.versiebalk{right:10px;bottom:10px}.versiebalk .lab{display:none}}'
  ].join('');
  document.head.appendChild(stijl);

  var balk = document.createElement('div');
  balk.className = 'versiebalk';
  balk.innerHTML = '<span class="lab">Versie</span>' + reeks.map(function (v) {
    return '<a href="' + v.bestand + '"' + (v.bestand === hier ? ' class="on"' : '') + '>' + v.label + '</a>';
  }).join('') + '<a class="vol" href="' + hier + '" target="_blank" rel="noopener" ' +
    'title="Open in een nieuw tabblad">volledig scherm \u2197</a>';
  addEventListener('DOMContentLoaded', function () { document.body.appendChild(balk); });
})();
