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
      { id: 'v1', bestand: 'homepage-v1.html', label: 'v1' },
      { id: 'v2', bestand: 'homepage-v2.html', label: 'v2 (video)' },
      { id: 'v3', bestand: 'homepage-v3.html', label: 'v3 (video)' },
      { id: 'v4', bestand: 'homepage-v4.html', label: 'v4' },
      { id: 'v5', bestand: 'homepage-v5.html', label: 'v5' },
      { id: 'v6', bestand: 'homepage-v6.html', label: 'v6' },
      { id: 'v7', bestand: 'homepage-v7.html', label: 'v7' },
      { id: 'v8', bestand: 'homepage-v8.html', label: 'v8' }
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
      { id: 'v1', bestand: 'case-voor-gitaar-v1.html', label: 'v1 · kiezen' },
      { id: 'v2', bestand: 'case-voor-gitaar-v2.html', label: 'v2 · productenlijst' }
    ],
    'case-voor-gibson-les-paul': [
      { id: 'wireframe', bestand: 'case-voor-gibson-les-paul.html', label: 'wireframe' },
      { id: 'v1', bestand: 'case-voor-gibson-les-paul-v1.html', label: 'v1 · advies' },
      { id: 'v2', bestand: 'case-voor-gibson-les-paul-v2.html', label: 'v2 · vaste case' }
    ],
    // De servicehub en levertijden stonden door elkaar in deze reeks: vier
    // knoppen voor twee verschillende pagina's, waarvan levertijden ook nog
    // eens zijn eigen reeks had. Een reeks is één pagina, in versies.
    'service': [
      { id: 'wireframe', bestand: 'service.html', label: 'wireframe' },
      { id: 'v1', bestand: 'service-v1.html', label: 'v1 · beeld' },
      { id: 'v2', bestand: 'service-hub-v1.html', label: 'v2 · servicehub' }
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
      { id: 'wireframe', bestand: 'laten-controleren.html', label: 'wireframe' },
      { id: 'v1', bestand: 'laten-controleren-v1.html', label: 'v1 · de controle' }
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
    'zo-werkt-het': [
      { id: 'v1', bestand: 'zo-werkt-het-v1.html', label: 'v1 · het proces' }
    ],
    // Groot zakelijk staat los van het branche-overzicht: branche is wíe je
    // bent, dit is hóe je koopt. Twee vragen, twee pagina's.
    'grote-spelers': [
      { id: 'v1', bestand: 'grote-spelers-v1.html', label: 'v1 · sectoren' },
      { id: 'v2', bestand: 'grote-spelers-v2.html', label: 'v2 · drie stappen' }
    ],
    'branche-audio-visueel': [
      { id: 'v1', bestand: 'branche-audio-visueel-v1.html', label: 'v1' }
    ],
    'branche-defensie': [
      { id: 'v1', bestand: 'branche-defensie-v1.html', label: 'v1' }
    ],
    'branche-industrie-en-machinebouw': [
      { id: 'v1', bestand: 'branche-industrie-en-machinebouw-v1.html', label: 'v1' }
    ],
    'casetype-hoedcase': [
      { id: 'v1', bestand: 'casetype-hoedcase-v1.html', label: 'v1' }
    ],
    'casetype-koffer': [
      { id: 'v1', bestand: 'casetype-koffer-v1.html', label: 'v1' }
    ],
    'casetype-rackcase-dubbel-deksel': [
      { id: 'v1', bestand: 'casetype-rackcase-dubbel-deksel-v1.html', label: 'v1' }
    ],
    'casetype-trunccase': [
      { id: 'v1', bestand: 'casetype-trunccase-v1.html', label: 'v1' }
    ],
    'speler-defensie-en-overheid': [
      { id: 'v1', bestand: 'speler-defensie-en-overheid-v1.html', label: 'v1' }
    ],
    'speler-netbeheer-en-energie': [
      { id: 'v1', bestand: 'speler-netbeheer-en-energie-v1.html', label: 'v1' }
    ],
    'speler-oem-en-series': [
      { id: 'v1', bestand: 'speler-oem-en-series-v1.html', label: 'v1' }
    ],
    'speler-omroep-en-studio': [
      { id: 'v1', bestand: 'speler-omroep-en-studio-v1.html', label: 'v1' }
    ],
    'speler-verhuur-en-touring': [
      { id: 'v1', bestand: 'speler-verhuur-en-touring-v1.html', label: 'v1' }
    ],
    'case-aanvragen': [
      { id: 'v1', bestand: 'case-aanvragen-v1.html', label: 'v1 · de aanvraag' }
    ],
    'contact': [
      { id: 'v1', bestand: 'contact-v1.html', label: 'v1' }
    ],
    'branches': [
      { id: 'v1', bestand: 'branches.html', label: 'v1 · donkere kop' },
      { id: 'v2', bestand: 'branches-v2.html', label: 'v2 · lichte kop' },
      { id: 'v3', bestand: 'branches-v3.html', label: 'v3 · kop + belofte één vlak' }
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
