/**
 * De zoeklijst: waar een bezoeker op kan zoeken en waar hij dan uitkomt.
 *
 * Er staan twee soorten dingen in. Toepassingen zijn wát je vervoert
 * ("moving heads", "les paul"); branches zijn wíé je bent ("defensie",
 * "broadcast"). Allebei zijn geldige antwoorden op "wat ga je vervoeren?",
 * want de een weet zijn apparaat en de ander zijn vak. Wie "defensie" typt
 * en alleen categorieën terugkrijgt, denkt dat we hem niet bedienen.
 *
 * Eén lijst, want hij wordt op drie plekken gebruikt — de balk in de hero
 * van v1, v2 en v3, het zoekpaneel op case-voor-v3 en de prefill op de aanvraag-
 * pagina — en drie kopieën lopen gegarandeerd uit elkaar.
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
 * `ouder` zet een apparaat onder zijn categorie: wie "gibson" typt krijgt
 * het apparaat zelf, en onderaan de lijst "alle gitaarcases" in plaats van
 * het algemene overzicht. Alleen voor apparaten met een eigen pagina.
 *
 * `zoek` zijn de woorden die iemand intypt en die niet in de naam staan.
 * Merknamen horen daar thuis: wie "les paul" typt zoekt geen categorie maar
 * zijn eigen gitaar, en moet toch ergens landen.
 */
(function () {
  /* Het gedeelde sjabloon was case-voor-gitaar-v1: één uitgewerkte
     categoriepagina die de andere zevenendertig leenden. Dat werkt zolang
     je erop bladert, maar niet in de zoekflow: wie "moving head" intikt
     kwam uit op een pagina met de kop "Flightcases voor gitaren" en een
     alinea over halzen en kopplaten. Dat is erger dan geen pagina, want
     het zegt dat we niet luisteren.

     Een categorie zonder eigen pagina gaat daarom naar de branche waar
     hij onder valt. Dat is altijd waar: een moving head hoort in de
     audio-visuele hoek, en die pagina gaat over wat daar telt. Zodra een
     categorie echte inhoud krijgt, verandert hier één regel.

     Gitaar en Gibson Les Paul houden hun eigen pagina; die bestaan. */
  var BRANCHEPAGINA = {
    Licht:     'branche-audio-visueel-v2.html',
    Audio:     'branche-audio-visueel-v2.html',
    Backline:  'branche-audio-visueel-v2.html',
    Beurs:     'branche-audio-visueel-v2.html',
    Camera:    'branche-broadcast-en-media-v1.html',
    Medisch:   'branche-meet-en-testapparatuur-v1.html',
    Industrie: 'branche-industrie-en-machinebouw-v1.html'
  };
  var SJABLOON = 'case-voor-gitaar-v1.html';

  window.TOEPASSINGEN = [
    /* licht en podium */
    { naam: 'Moving heads',              groep: 'Licht',      pagina: BRANCHEPAGINA['Licht'], zoek: ['movinghead', 'spot', 'beam', 'wash'] },
    { naam: 'Wash- en spotarmaturen',    groep: 'Licht',      pagina: BRANCHEPAGINA['Licht'], zoek: ['armatuur', 'par', 'led par'] },
    { naam: 'Dimmerpacks en racks',      groep: 'Licht',      pagina: BRANCHEPAGINA['Licht'], zoek: ['dimmer', 'rack', '19 inch'] },
    { naam: 'Blinders en strobes',       groep: 'Licht',      pagina: BRANCHEPAGINA['Licht'], zoek: ['blinder', 'strobe'] },
    { naam: 'Hazers en rookmachines',    groep: 'Licht',      pagina: BRANCHEPAGINA['Licht'], zoek: ['hazer', 'rookmachine', 'fazer'] },
    { naam: 'Truss-hardware',            groep: 'Licht',      pagina: BRANCHEPAGINA['Licht'], zoek: ['truss', 'klem', 'coupler'] },

    /* audio en backline */
    { naam: 'Line-array en speakers',    groep: 'Audio',      pagina: BRANCHEPAGINA['Audio'], zoek: ['speaker', 'luidspreker', 'linearray', 'top', 'sub'] },
    { naam: 'Mengtafels',                groep: 'Audio',      pagina: BRANCHEPAGINA['Audio'], zoek: ['mengtafel', 'mixer', 'midas', 'm32', 'x32', 'console', 'foh'] },
    { naam: 'Kabelhaspels en multicore', groep: 'Audio',      pagina: BRANCHEPAGINA['Audio'], zoek: ['kabel', 'haspel', 'multicore', 'stagebox'] },
    { naam: 'Elektrische gitaren',       groep: 'Backline',   pagina: 'case-voor-gitaar-v1.html', zoek: ['gitaar', 'guitar', 'stratocaster', 'telecaster'] },
    { naam: 'Gibson Les Paul',           groep: 'Backline',   pagina: 'case-voor-gibson-les-paul-v2.html', zoek: ['les paul', 'lespaul', 'gibson'],
      ouder: { naam: 'Alle gitaarcases bekijken', pagina: 'case-voor-gitaar-v2.html' } },
    { naam: 'Basgitaren',                groep: 'Backline',   pagina: BRANCHEPAGINA['Backline'], zoek: ['bas', 'basgitaar', 'precision', 'jazz bass'] },
    { naam: 'Akoestische gitaren',       groep: 'Backline',   pagina: BRANCHEPAGINA['Backline'], zoek: ['akoestisch', 'western', 'klassieke gitaar'] },
    { naam: 'Versterkers en cabinets',   groep: 'Backline',   pagina: BRANCHEPAGINA['Backline'], zoek: ['versterker', 'amp', 'cabinet', 'combo', 'head'] },
    { naam: 'Pedalboards',               groep: 'Backline',   pagina: BRANCHEPAGINA['Backline'], zoek: ['pedal', 'pedalboard', 'effecten'] },
    { naam: 'Drumhardware',              groep: 'Backline',   pagina: BRANCHEPAGINA['Backline'], zoek: ['drum', 'snare', 'bekken', 'hardware'] },
    { naam: 'Keyboards en synths',       groep: 'Backline',   pagina: BRANCHEPAGINA['Backline'], zoek: ['keyboard', 'synth', 'piano', 'nord'] },
    { naam: 'Blaasinstrumenten',         groep: 'Backline',   pagina: BRANCHEPAGINA['Backline'], zoek: ['trompet', 'saxofoon', 'trombone', 'blaas'] },
    { naam: 'DJ-apparatuur',            groep: 'Backline',   pagina: BRANCHEPAGINA['Backline'], zoek: ['dj', 'controller', 'cdj', 'djm', 'draaitafel', 'mengpaneel', 'pioneer'] },

    /* camera en broadcast */
    { naam: 'Camerabodies',              groep: 'Camera',     pagina: BRANCHEPAGINA['Camera'], zoek: ['camera', 'body', 'red', 'arri', 'sony fx'] },
    { naam: 'Optiek en lenzensets',      groep: 'Camera',     pagina: BRANCHEPAGINA['Camera'], zoek: ['lens', 'lenzen', 'optiek', 'objectief'] },
    { naam: 'Statieven en heads',        groep: 'Camera',     pagina: BRANCHEPAGINA['Camera'], zoek: ['statief', 'tripod', 'head'] },
    { naam: 'Monitoren',                 groep: 'Camera',     pagina: BRANCHEPAGINA['Camera'], zoek: ['monitor', 'scherm', 'display'] },
    { naam: 'Regie- en switchkoffers',   groep: 'Camera',     pagina: BRANCHEPAGINA['Camera'], zoek: ['regie', 'switcher', 'atem'] },
    { naam: 'Drone en gimbal',           groep: 'Camera',     pagina: BRANCHEPAGINA['Camera'], zoek: ['drone', 'gimbal', 'ronin', 'dji'] },

    /* medisch en labo */
    { naam: 'Meetapparatuur',            groep: 'Medisch',    pagina: BRANCHEPAGINA['Medisch'], zoek: ['meetapparaat', 'meten', 'instrument'] },
    { naam: 'Demokoffers met inlay',     groep: 'Medisch',    pagina: BRANCHEPAGINA['Medisch'], zoek: ['demokoffer', 'sample', 'verkoopkoffer'] },
    { naam: 'Endoscopie',                groep: 'Medisch',    pagina: BRANCHEPAGINA['Medisch'], zoek: ['endoscoop', 'scoop'] },
    { naam: 'Laboratoriuminstrumenten',  groep: 'Medisch',    pagina: BRANCHEPAGINA['Medisch'], zoek: ['lab', 'laboratorium', 'analyse'] },
    { naam: 'Trolleycases',              groep: 'Medisch',    pagina: BRANCHEPAGINA['Medisch'], zoek: ['trolley', 'wielen', 'rolkoffer'] },

    /* industrie en service */
    { naam: 'Servicekoffers',            groep: 'Industrie',  pagina: BRANCHEPAGINA['Industrie'], zoek: ['service', 'monteur', 'buitendienst'] },
    { naam: 'Kalibratieapparatuur',      groep: 'Industrie',  pagina: BRANCHEPAGINA['Industrie'], zoek: ['kalibratie', 'ijken'] },
    { naam: 'Handgereedschap',           groep: 'Industrie',  pagina: BRANCHEPAGINA['Industrie'], zoek: ['gereedschap', 'tool', 'sleutel'] },
    { naam: 'Sensoren en dataloggers',   groep: 'Industrie',  pagina: BRANCHEPAGINA['Industrie'], zoek: ['sensor', 'datalogger', 'meetkast'] },

    /* beurs en presentatie */
    { naam: 'Standmateriaal',            groep: 'Beurs',      pagina: BRANCHEPAGINA['Beurs'], zoek: ['stand', 'beurs', 'expo'] },
    { naam: 'Banners en kokers',         groep: 'Beurs',      pagina: BRANCHEPAGINA['Beurs'], zoek: ['banner', 'koker', 'rollup'] },
    { naam: 'Displays en schermen',      groep: 'Beurs',      pagina: BRANCHEPAGINA['Beurs'], zoek: ['display', 'led scherm', 'videowall'] },
    { naam: 'Catering en bar',           groep: 'Beurs',      pagina: BRANCHEPAGINA['Beurs'], zoek: ['catering', 'bar', 'keuken'] },

    /* Branches. Ze staan bewust ná de toepassingen: typt iemand "camera",
       dan wil hij de cases voor camerabodies zien en niet eerst de hele
       broadcastbranche. Bij gelijke score wint de bovenste. */
    { naam: 'Audio-visueel',             groep: 'Branche', soort: 'branche', pagina: 'branche-audio-visueel-v2.html',
      zoek: ['av', 'podium', 'theater', 'evenement', 'concert', 'tour', 'verhuur', 'rental', 'licht en geluid', 'festival', 'crew', 'truck', 'stage', 'band', 'club', 'zaal', 'line array', 'monitorwedge'] },
    { naam: 'Broadcast en media',        groep: 'Branche', soort: 'branche', pagina: 'branche-broadcast-en-media-v1.html',
      zoek: ['broadcast', 'tv', 'televisie', 'omroep', 'media', 'film', 'productiehuis', 'studio', 'ob-wagen', 'regiewagen', 'zender', 'satelliet', 'uplink', 'teleprompter', 'autocue', 'microfoonset', 'intercom'] },
    { naam: 'Industrie en machinebouw',  groep: 'Branche', soort: 'branche', pagina: 'branche-industrie-en-machinebouw-v1.html',
      zoek: ['industrie', 'machinebouw', 'fabriek', 'productie', 'oem', 'technische dienst', 'monteur', 'buitendienst', 'servicetechnicus', 'onderhoud', 'robot', 'aandrijving', 'pomp', 'klep', 'lager', 'gereedschapskoffer'] },
    { naam: 'Meet- en testapparatuur',   groep: 'Branche', soort: 'branche', pagina: 'branche-meet-en-testapparatuur-v1.html',
      zoek: ['meettechniek', 'testen', 'kalibratie', 'meetlab', 'inspectie', 'oscilloscoop', 'spectrumanalyzer', 'multimeter', 'meetbrug', 'netwerkanalyzer', 'thermokoppel', 'testset'] },
    { naam: 'Defensie',                  groep: 'Branche', soort: 'branche', pagina: 'branche-defensie-v3.html',
      zoek: ['defensie', 'leger', 'militair', 'krijgsmacht', 'landmacht', 'marine', 'luchtmacht', 'navo', 'veiligheidsregio', 'f16', 'f35', 'straaljager', 'jachtvliegtuig', 'vleugel', 'romp', 'munitie', 'wapen', 'geweer', 'nachtkijker', 'warmtebeeld', 'thermisch', 'radar', 'antenne', 'verbindingsset', 'radioset', 'manpack', 'helm', 'vest', 'uitrusting', 'veldkeuken', 'genie', 'explosieven', 'eod', 'uav', 'sensorkop', 'richtmiddel', 'vizier'] },
    { naam: 'Schaalmodellen',            groep: 'Branche', soort: 'branche', pagina: 'branche-schaalmodellen-v1.html',
      zoek: ['schaalmodel', 'maquette', 'prototype', 'modelbouw', 'architect', 'presentatiemodel', 'designmodel', 'kunstwerk', 'sculptuur', 'vitrine', 'miniatuur'] }
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

  /* Woorden die niets zeggen over wát je vervoert. Wie "av kabel case
     groot" typt, zoekt op av en kabel; "case" en "groot" zou elke regel
     wel of geen enkele raken. */
  var VULWOORDEN = ['case', 'cases', 'flightcase', 'flightcases', 'kist', 'voor', 'een', 'de', 'het', 'en', 'met',
                    'mijn', 'groot', 'grote', 'klein', 'kleine', 'nieuw', 'nieuwe'];

  /* Score per regel: precies goed, dan wat ermee begint, dan wat het
     bevat — anders staat "Basgitaren" boven "Gitaar" als je "gitaar"
     typt, en dat leest als een fout. Bij losse woorden telt een kort
     woord (av, tv) alleen als het precies klopt of vooraan staat: "av"
     zit ook midden in woorden die er niets mee te maken hebben. */
  /* Meervoud terug naar de stam. Nederlands laat bij het meervoud een
     dubbele klinker vallen: gitaar wordt gitaren, haak wordt haken. Wie
     "gitaren" typt zou "Elektrische gitaar" anders niet vinden, en dan
     lijkt de zoekfunctie stuk terwijl de categorie er gewoon staat. */
  function stam(w) {
    var uit = '';
    for (var i = 0; i < w.length; i++) {
      if (i > 0 && w[i] === w[i - 1] && 'aeou'.indexOf(w[i]) >= 0) continue;
      uit += w[i];
    }
    return uit.replace(/(en|s)$/, '');
  }

  function rangschik(woorden, perWoord) {
    var treffers = [];
    window.TOEPASSINGEN.forEach(function (t, plek) {
      var termen = [t.naam].concat(t.zoek || []).map(window.TOEPASSINGEN_NORM);
      var beste = 0;
      woorden.forEach(function (w) {
        var ws = stam(w);
        termen.forEach(function (n) {
          var ns = stam(n);
          /* Vier treden. De derde is er later bij gekomen en is de
             belangrijkste: hij kijkt ook of het ingetypte wóórd de term
             bevat, niet alleen of de term het woord bevat. Zonder die
             kant vindt "gitaarcase" de categorie "gitaar" niet, terwijl
             dat precies is wat iemand intikt. */
          var score = 0;
          if (n === w || ns === ws) score = 3;
          else if (n.indexOf(w) === 0 || ns.indexOf(ws) === 0) score = 2;
          else if (ns.length >= 3 && ws.indexOf(ns) === 0) score = 2;
          else if (n.indexOf(w) > -1) score = 1;
          else if (ns.length >= 4 && ws.indexOf(ns) > -1) score = 1;
          if (perWoord && w.length < 4 && score < 2) score = 0;
          if (score > beste) beste = score;
        });
      });
      if (beste) treffers.push({ toepassing: t, score: beste, plek: plek });
    });

    /* Bij gelijke score telt de volgorde in de lijst, niet het alfabet:
       toepassingen staan boven branches omdat iemand die een apparaat
       noemt de cases ervoor zoekt, niet zijn eigen bedrijfstak. */
    treffers.sort(function (a, b) {
      if (b.score !== a.score) return b.score - a.score;
      return a.plek - b.plek;
    });
    return treffers;
  }

  /**
   * Zoekt in de lijst. Eerst op de hele zin; levert dat niets op en zijn
   * het meer woorden, dan per woord, zonder de vulwoorden. Zo landt
   * "av kabel case groot" bij kabelhaspels en de AV-branche in plaats van
   * nergens.
   */
  window.TOEPASSINGEN_ZOEK = function (vraag, max) {
    var q = window.TOEPASSINGEN_NORM(vraag);
    if (q.length < 2) return [];

    var treffers = rangschik([q], false);
    if (!treffers.length && q.indexOf(' ') > -1) {
      var woorden = q.split(' ').filter(function (w) { return w.length >= 2 && VULWOORDEN.indexOf(w) < 0; });
      if (woorden.length) treffers = rangschik(woorden, true);
    }

    return treffers.slice(0, max || 6).map(function (r) { return r.toepassing; });
  };
})();
