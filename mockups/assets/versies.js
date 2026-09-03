/**
 * Versietabs op de mockups. Hoort bij de mockup, niet bij het merk — de
 * generator van de ingesloten ontwerpweergave haalt scripts eruit, dus deze
 * balk verschijnt alleen op de losse pagina.
 *
 * Nieuwe versie toevoegen: bestand `naam-v<n>.html` maken en hieronder in de
 * lijst zetten. Eén plek, zodat de balk op elke versie hetzelfde toont.
 *
 * In de balk staat de naam van het concept, niet het nummer. De nummers in
 * de bestandsnamen lopen door (v1 is de oudste) en blijven nodig: de
 * generator van de ontwerpweergave herkent alleen achtervoegsels die met
 * v+cijfer beginnen. Maar zodra je een selectie toont, geeft dat nummer
 * gaten in beeld — v1, v4, v6 — die niets betekenen voor wie kijkt.
 * Waar een versie over gáát, staat in concepten-2sept.html.
 */
(function () {
  var REEKSEN = {
    // Alle concepten staan hier, zodat er niets onbereikbaar is vanaf een
    // mockup. De afweging per concept staat in concepten-2sept.html.
    'homepage': [
      { id: 'wireframe', bestand: 'homepage.html', label: 'wireframe' },
      { id: 'v1a', bestand: 'homepage-v1a.html', label: 'v1a · twee knoppen' },
      { id: 'v1b', bestand: 'homepage-v1b.html', label: 'v1b · video' },
      { id: 'v2', bestand: 'homepage-v2.html', label: 'v2 · de werkvloer' },
      { id: 'v3', bestand: 'homepage-v3.html', label: 'v3 · de werkbank' },
      { id: 'v4a', bestand: 'homepage-v4a.html', label: 'v4a · de vloot, vakgebied' },
      { id: 'v4b', bestand: 'homepage-v4b.html', label: 'v4b · de vloot, branche' },
      { id: 'v5', bestand: 'homepage-v5.html', label: 'v5 · drie ingangen' },
      { id: 'v6', bestand: 'homepage-v6.html', label: 'v6 · de aanvraag' }
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
    'case-voor': [
      { id: 'v1', bestand: 'case-voor-v1.html', label: 'v1' }
    ],
    'case-voor-gitaar': [
      { id: 'wireframe', bestand: 'case-voor-gitaar.html', label: 'wireframe' },
      { id: 'v1', bestand: 'case-voor-gitaar-v1.html', label: 'v1 · beeld' }
    ],
    'case-voor-gibson-les-paul': [
      { id: 'wireframe', bestand: 'case-voor-gibson-les-paul.html', label: 'wireframe' },
      { id: 'v1', bestand: 'case-voor-gibson-les-paul-v1.html', label: 'v1 · beeld' }
    ],
    // De servicehub en levertijden stonden door elkaar in deze reeks: vier
    // knoppen voor twee verschillende pagina's, waarvan levertijden ook nog
    // eens zijn eigen reeks had. Een reeks is één pagina, in versies.
    'service': [
      { id: 'wireframe', bestand: 'service.html', label: 'wireframe' },
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
      { id: 'wireframe', bestand: 'configurator.html', label: 'wireframe' },
      { id: 'v1', bestand: 'configurator-v1.html', label: 'v1 · eigen pagina' }
    ],
    // Nieuw: het branche-overzicht heeft nog geen wireframe, alleen een
    // ontwerp. De reeks staat er vast in zodat de knop meegroeit.
    'branches': [
      { id: 'v1', bestand: 'branches.html', label: 'v1 · overzicht' }
    ]
  };



  // ?kaal onderdrukt de balk. De presentatiepagina sluit de mockups in een
  // venster in en heeft zijn eigen navigatie; twee balken over elkaar heen
  // is er één te veel.
  if (new URLSearchParams(location.search).has('kaal')) return;

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
