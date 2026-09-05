/**
 * De toepassingenlijst: waar een bezoeker op kan zoeken en waar hij dan
 * uitkomt. Eén lijst, want hij wordt op twee plekken gebruikt — de balk in
 * de hero van v12 en de prefill op de aanvraagpagina — en twee kopieën
 * lopen gegarandeerd uit elkaar.
 *
 * De categorieën komen uit case-voor-v1.html; dat is het overzicht dat er
 * al staat, dus de balk kan niet naar iets wijzen wat daar niet in zit.
 *
 * `pagina` is voorlopig bijna overal case-voor-gitaar-v1.html. Dat is geen
 * slordigheid maar dezelfde afspraak die in case-voor-v1.html staat: er is
 * één uitgewerkt sjabloon voor /case-voor/{categorie}, en de rest leent dat
 * tot ze eigen inhoud hebben. Zodra een categorie een eigen pagina krijgt,
 * verandert hier één regel.
 *
 * `zoek` zijn de woorden die iemand intypt en die niet in de naam staan.
 * Merknamen horen daar thuis: wie "les paul" typt zoekt geen categorie maar
 * zijn eigen gitaar, en moet toch ergens landen.
 */
(function () {
  var SJABLOON = 'case-voor-gitaar-v1.html';

  window.TOEPASSINGEN = [
    /* licht en podium */
    { naam: 'Moving heads',              groep: 'Licht',      pagina: SJABLOON, zoek: ['movinghead', 'spot', 'beam', 'wash'] },
    { naam: 'Wash- en spotarmaturen',    groep: 'Licht',      pagina: SJABLOON, zoek: ['armatuur', 'par', 'led par'] },
    { naam: 'Dimmerpacks en racks',      groep: 'Licht',      pagina: SJABLOON, zoek: ['dimmer', 'rack', '19 inch'] },
    { naam: 'Blinders en strobes',       groep: 'Licht',      pagina: SJABLOON, zoek: ['blinder', 'strobe'] },
    { naam: 'Hazers en rookmachines',    groep: 'Licht',      pagina: SJABLOON, zoek: ['hazer', 'rookmachine', 'fazer'] },
    { naam: 'Truss-hardware',            groep: 'Licht',      pagina: SJABLOON, zoek: ['truss', 'klem', 'coupler'] },

    /* audio en backline */
    { naam: 'Line-array en speakers',    groep: 'Audio',      pagina: SJABLOON, zoek: ['speaker', 'luidspreker', 'linearray', 'top', 'sub'] },
    { naam: 'Mengtafels',                groep: 'Audio',      pagina: SJABLOON, zoek: ['mengtafel', 'mixer', 'midas', 'm32', 'x32', 'console', 'foh'] },
    { naam: 'Kabelhaspels en multicore', groep: 'Audio',      pagina: SJABLOON, zoek: ['kabel', 'haspel', 'multicore', 'stagebox'] },
    { naam: 'Elektrische gitaren',       groep: 'Backline',   pagina: 'case-voor-gitaar-v1.html', zoek: ['gitaar', 'guitar', 'stratocaster', 'telecaster'] },
    { naam: 'Gibson Les Paul',           groep: 'Backline',   pagina: 'case-voor-gibson-les-paul-v1.html', zoek: ['les paul', 'lespaul', 'gibson'] },
    { naam: 'Basgitaren',                groep: 'Backline',   pagina: SJABLOON, zoek: ['bas', 'basgitaar', 'precision', 'jazz bass'] },
    { naam: 'Akoestische gitaren',       groep: 'Backline',   pagina: SJABLOON, zoek: ['akoestisch', 'western', 'klassieke gitaar'] },
    { naam: 'Versterkers en cabinets',   groep: 'Backline',   pagina: SJABLOON, zoek: ['versterker', 'amp', 'cabinet', 'combo', 'head'] },
    { naam: 'Pedalboards',               groep: 'Backline',   pagina: SJABLOON, zoek: ['pedal', 'pedalboard', 'effecten'] },
    { naam: 'Drumhardware',              groep: 'Backline',   pagina: SJABLOON, zoek: ['drum', 'snare', 'bekken', 'hardware'] },
    { naam: 'Keyboards en synths',       groep: 'Backline',   pagina: SJABLOON, zoek: ['keyboard', 'synth', 'piano', 'nord'] },
    { naam: 'Blaasinstrumenten',         groep: 'Backline',   pagina: SJABLOON, zoek: ['trompet', 'saxofoon', 'trombone', 'blaas'] },

    /* camera en broadcast */
    { naam: 'Camerabodies',              groep: 'Camera',     pagina: SJABLOON, zoek: ['camera', 'body', 'red', 'arri', 'sony fx'] },
    { naam: 'Optiek en lenzensets',      groep: 'Camera',     pagina: SJABLOON, zoek: ['lens', 'lenzen', 'optiek', 'objectief'] },
    { naam: 'Statieven en heads',        groep: 'Camera',     pagina: SJABLOON, zoek: ['statief', 'tripod', 'head'] },
    { naam: 'Monitoren',                 groep: 'Camera',     pagina: SJABLOON, zoek: ['monitor', 'scherm', 'display'] },
    { naam: 'Regie- en switchkoffers',   groep: 'Camera',     pagina: SJABLOON, zoek: ['regie', 'switcher', 'atem'] },
    { naam: 'Drone en gimbal',           groep: 'Camera',     pagina: SJABLOON, zoek: ['drone', 'gimbal', 'ronin', 'dji'] },

    /* medisch en labo */
    { naam: 'Meetapparatuur',            groep: 'Medisch',    pagina: SJABLOON, zoek: ['meetapparaat', 'meten', 'instrument'] },
    { naam: 'Demokoffers met inlay',     groep: 'Medisch',    pagina: SJABLOON, zoek: ['demokoffer', 'sample', 'verkoopkoffer'] },
    { naam: 'Endoscopie',                groep: 'Medisch',    pagina: SJABLOON, zoek: ['endoscoop', 'scoop'] },
    { naam: 'Laboratoriuminstrumenten',  groep: 'Medisch',    pagina: SJABLOON, zoek: ['lab', 'laboratorium', 'analyse'] },
    { naam: 'Trolleycases',              groep: 'Medisch',    pagina: SJABLOON, zoek: ['trolley', 'wielen', 'rolkoffer'] },

    /* industrie en service */
    { naam: 'Servicekoffers',            groep: 'Industrie',  pagina: SJABLOON, zoek: ['service', 'monteur', 'buitendienst'] },
    { naam: 'Kalibratieapparatuur',      groep: 'Industrie',  pagina: SJABLOON, zoek: ['kalibratie', 'ijken'] },
    { naam: 'Handgereedschap',           groep: 'Industrie',  pagina: SJABLOON, zoek: ['gereedschap', 'tool', 'sleutel'] },
    { naam: 'Sensoren en dataloggers',   groep: 'Industrie',  pagina: SJABLOON, zoek: ['sensor', 'datalogger', 'meetkast'] },

    /* beurs en presentatie */
    { naam: 'Standmateriaal',            groep: 'Beurs',      pagina: SJABLOON, zoek: ['stand', 'beurs', 'expo'] },
    { naam: 'Banners en kokers',         groep: 'Beurs',      pagina: SJABLOON, zoek: ['banner', 'koker', 'rollup'] },
    { naam: 'Displays en schermen',      groep: 'Beurs',      pagina: SJABLOON, zoek: ['display', 'led scherm', 'videowall'] },
    { naam: 'Catering en bar',           groep: 'Beurs',      pagina: SJABLOON, zoek: ['catering', 'bar', 'keuken'] }
  ];

  /* Zonder accenten en in kleine letters, zodat "réflex" en "Reflex"
     hetzelfde zoekwoord zijn. */
  window.TOEPASSINGEN_NORM = function (tekst) {
    return String(tekst || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  /**
   * Zoekt in de lijst. Volgorde is: precies goed, dan wat ermee begint,
   * dan wat het bevat — anders staat "Basgitaren" boven "Gitaar" als je
   * "gitaar" typt, en dat leest als een fout.
   */
  window.TOEPASSINGEN_ZOEK = function (vraag, max) {
    var q = window.TOEPASSINGEN_NORM(vraag);
    if (q.length < 2) return [];

    var treffers = [];
    window.TOEPASSINGEN.forEach(function (t) {
      var termen = [t.naam].concat(t.zoek || []);
      var beste = 0;
      termen.forEach(function (term) {
        var n = window.TOEPASSINGEN_NORM(term);
        var score = n === q ? 3 : n.indexOf(q) === 0 ? 2 : n.indexOf(q) > -1 ? 1 : 0;
        if (score > beste) beste = score;
      });
      if (beste) treffers.push({ toepassing: t, score: beste });
    });

    treffers.sort(function (a, b) {
      if (b.score !== a.score) return b.score - a.score;
      return a.toepassing.naam.localeCompare(b.toepassing.naam, 'nl');
    });

    return treffers.slice(0, max || 6).map(function (r) { return r.toepassing; });
  };
})();
