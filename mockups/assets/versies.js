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
      { id: 'wireframe', bestand: 'homepage.html', label: 'wireframe' },
      { id: 'v1-video', bestand: 'homepage-v1-video.html', label: 'v1 · video' },
      { id: 'v1', bestand: 'homepage-v1.html', label: 'v1 · beeld' }
    ],
    'categorie': [
      { id: 'wireframe', bestand: 'categorie.html', label: 'wireframe' },
      { id: 'v1', bestand: 'categorie-v1.html', label: 'v1 · beeld' }
    ],
    'onderdeel': [
      { id: 'wireframe', bestand: 'onderdeel.html', label: 'wireframe' },
      { id: 'v1', bestand: 'onderdeel-v1.html', label: 'v1 · beeld' }
    ],
    'casetype': [
      { id: 'wireframe', bestand: 'casetype.html', label: 'wireframe' },
      { id: 'v1', bestand: 'casetype-v1.html', label: 'v1 · beeld' }
    ],
    'flightcases': [
      { id: 'wireframe', bestand: 'flightcases.html', label: 'wireframe' },
      { id: 'v1', bestand: 'flightcases-v1.html', label: 'v1 · beeld' }
    ],
    'case-voor-gitaar': [
      { id: 'wireframe', bestand: 'case-voor-gitaar.html', label: 'wireframe' },
      { id: 'v1', bestand: 'case-voor-gitaar-v1.html', label: 'v1 · beeld' }
    ],
    'case-voor-gibson-les-paul': [
      { id: 'wireframe', bestand: 'case-voor-gibson-les-paul.html', label: 'wireframe' },
      { id: 'v1', bestand: 'case-voor-gibson-les-paul-v1.html', label: 'v1 · beeld' }
    ],
    'service': [
      { id: 'wireframe', bestand: 'service.html', label: 'wireframe' },
      { id: 'levertijden-v1', bestand: 'service-levertijden-v1.html', label: 'levertijden-v1' },
      { id: 'levertijden', bestand: 'service-levertijden.html', label: 'levertijden' },
      { id: 'v1', bestand: 'service-v1.html', label: 'v1 · beeld' }
    ],
    'service-levertijden': [
      { id: 'wireframe', bestand: 'service-levertijden.html', label: 'wireframe' },
      { id: 'v1', bestand: 'service-levertijden-v1.html', label: 'v1 · beeld' }
    ],
    'zoeken': [
      { id: 'wireframe', bestand: 'zoeken.html', label: 'wireframe' },
      { id: 'v1', bestand: 'zoeken-v1.html', label: 'v1 · beeld' }
    ],
    'laten-controleren': [
      { id: 'wireframe', bestand: 'laten-controleren.html', label: 'wireframe' }
    ],
    'bedankt': [
      { id: 'wireframe', bestand: 'bedankt.html', label: 'wireframe' }
    ],
    'account': [
      { id: 'wireframe', bestand: 'account.html', label: 'wireframe' }
    ],
    'checkout': [
      { id: 'wireframe', bestand: 'checkout.html', label: 'wireframe' }
    ],
    'configurator': [
      { id: 'wireframe', bestand: 'configurator.html', label: 'wireframe' }
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
    '@media(max-width:760px){.versiebalk{right:10px;bottom:10px}.versiebalk .lab{display:none}}'
  ].join('');
  document.head.appendChild(stijl);

  var balk = document.createElement('div');
  balk.className = 'versiebalk';
  balk.innerHTML = '<span class="lab">Versie</span>' + reeks.map(function (v) {
    return '<a href="' + v.bestand + '"' + (v.bestand === hier ? ' class="on"' : '') + '>' + v.label + '</a>';
  }).join('');
  addEventListener('DOMContentLoaded', function () { document.body.appendChild(balk); });
})();
