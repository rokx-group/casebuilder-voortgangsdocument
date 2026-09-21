/* Design prototype. Only verified products link to the live shop.
   Unrecognised equipment keeps its query when entering the request form. */
(() => {
  'use strict';
  const input = document.querySelector('#zoekvraag');
  const form = document.querySelector('.finder-form');
  const panel = document.querySelector('#zoekresultaten');
  const list = panel.querySelector('.result-list');
  const status = panel.querySelector('.search-status');
  const heading = document.querySelector('#result-heading');
  const normalise = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const destinations = [
    { name: 'Rackcase dubbel', type: 'Webshop', description: '19-inch rackcase met voor- en achterdeksel.', url: 'https://www.casebuilder.com/nl-nl/flightcase-rackcase-dubbel-deksel.html', image: 'assets/flightcase-rackcase-dubbel-deksel.jpg', aliases: ['rackcase', 'rack', '19 inch', '19 inch rack', '19 inch apparatuur', 'rackcase dubbel', 'rackcase dubbel deksel'] },
    { name: 'Koffer', type: 'Webshop', description: 'Bekijk het koffermodel en kies je uitvoering.', url: 'https://www.casebuilder.com/nl-nl/flightcase-koffer.html', image: 'assets/flightcase-koffer.jpg', aliases: ['koffer', 'flightcase koffer', 'transportkoffer'] },
    { name: 'Hoedcase', type: 'Webshop', description: 'Een afneembare kap op een bodem.', url: 'https://www.casebuilder.com/nl-nl/flightcase-hoedcase.html', image: 'assets/flightcase-hoedcase.jpg', aliases: ['hoedcase', 'hoed', 'flightcase hoedcase'] },
    { name: 'Audio-visueel & live', type: 'Branche', description: 'Ontdek cases voor licht, geluid en de wereld achter de show.', url: 'branche-audio-visueel-v2.html', image: 'assets/av-tv-show.jpg', aliases: ['av', 'audio', 'audio visueel', 'licht', 'geluid', 'licht en geluid', 'moving head', 'moving heads', 'movinghead', 'mengtafel', 'gitaar', 'backline', 'podium', 'show', 'touring', 'verhuur', 'muziek', 'speaker', 'speakers', 'keyboard', 'pedalboard', 'evenement', 'theater'] },
    { name: 'Broadcast & media', type: 'Branche', description: 'Camera, optiek en regie. Bekijk de toepassingen.', url: 'branche-broadcast-en-media-v1.html', image: 'assets/av-studiocamera.jpg', aliases: ['camera', 'cameras', 'broadcast', 'media', 'film', 'tv', 'televisie', 'regie', 'lens', 'lenzen', 'optiek', 'statief', 'monitor', 'drone', 'drones', 'gimbal'] },
    { name: 'Defensie & veiligheid', type: 'Branche', description: 'De inzet en specificatie als vertrekpunt voor je case.', url: 'branche-defensie-v2.html', image: 'assets/defensie-oefening.jpg', aliases: ['defensie', 'leger', 'militair', 'veiligheid', 'veldapparatuur', 'verbindingsset', 'verbindingssets', 'landmacht', 'marine', 'luchtmacht'] },
    { name: 'Industrie & machinebouw', type: 'Branche', description: 'Technische apparatuur, service en werk op locatie.', url: 'branche-industrie-en-machinebouw-v1.html', image: 'assets/foto-industrie-en-machinebouw.jpg', aliases: ['industrie', 'techniek', 'machinebouw', 'gereedschap', 'service', 'servicekoffer', 'machine', 'machines', 'oem', 'sensor', 'datalogger'] },
    { name: 'Meet- & testapparatuur', type: 'Branche', description: 'Bekijk de mogelijkheden voor je meet- of testopstelling.', url: 'branche-meet-en-testapparatuur-v1.html', image: 'assets/foto-meet-en-testapparatuur.jpg', aliases: ['meetapparatuur', 'meetapparaat', 'meettechniek', 'testapparatuur', 'kalibratie', 'lab', 'laboratorium', 'medisch', 'inspectie'] },
    { name: 'Schaalmodellen', type: 'Branche', description: 'Transport voor modellen en presentaties.', url: 'branche-schaalmodellen-v1.html', image: 'assets/foto-schaalmodellen.jpg', aliases: ['schaalmodel', 'schaalmodellen', 'maquette', 'maquettes', 'modelbouw', 'architectuur'] }
  ];
  const request = query => ({ name: query ? `Een case voor “${query}”` : 'Een case op maat', type: 'Offerte', description: 'Leg je vraag voor. We nemen je omschrijving mee.', url: 'case-aanvragen-v1.html' + (query ? '?vervoeren=' + encodeURIComponent(query) : '') });
  function matches(query) {
    const q = normalise(query);
    if (!q) return [destinations[0], destinations[3]];
    return destinations.map(item => ({ item, score: Math.max(...item.aliases.map(alias => {
      const word = normalise(alias);
      if (word === q) return 100;
      if (q.length >= 2 && word.startsWith(q)) return 70;
      if (q.length >= 3 && (' ' + word + ' ').includes(' ' + q + ' ')) return 50;
      return 0;
    })) })).filter(row => row.score > 0).sort((a, b) => b.score - a.score).slice(0, 4).map(row => row.item);
  }
  function close() { panel.hidden = true; input.setAttribute('aria-expanded', 'false'); }
  function render() {
    const query = input.value.trim();
    const found = matches(query);
    const items = [...found, request(query)];
    heading.textContent = query ? (found.length ? 'Dit past bij je zoekvraag' : 'Ook hiervoor begint het bij jouw vraag') : 'Kies je volgende stap';
    list.replaceChildren();
    for (const item of items) {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = item.url;
      a.dataset.route = item.type;
      if (item.image) { const img = document.createElement('img'); img.className = 'result-image'; img.src = item.image; img.alt = ''; a.append(img); }
      else { const icon = document.createElement('span'); icon.className = 'result-icon'; icon.textContent = '+'; icon.setAttribute('aria-hidden', 'true'); a.append(icon); }
      const text = document.createElement('span'); text.className = 'result-text';
      const title = document.createElement('strong'); title.textContent = item.name;
      const description = document.createElement('small'); description.textContent = item.description;
      text.append(title, description);
      const type = document.createElement('span'); type.className = 'result-kind'; type.textContent = item.type;
      const arrow = document.createElement('span'); arrow.className = 'result-arrow'; arrow.textContent = '↗'; arrow.setAttribute('aria-hidden', 'true');
      a.append(text, type, arrow); li.append(a); list.append(li);
    }
    status.textContent = found.length ? `${found.length} ${found.length === 1 ? 'bestemming' : 'bestemmingen'} gevonden. Je kunt ook een case op maat aanvragen.` : 'Geen passende case gevonden in deze selectie. Je omschrijving gaat mee naar de aanvraag.';
    panel.hidden = false; input.setAttribute('aria-expanded', 'true');
  }
  input.addEventListener('input', render);
  input.addEventListener('focus', render);
  input.addEventListener('keydown', event => {
    if (event.key === 'Escape') { event.preventDefault(); close(); }
    if (event.key === 'ArrowDown') { event.preventDefault(); if (panel.hidden) render(); list.querySelector('a')?.focus(); }
  });
  list.addEventListener('keydown', event => {
    const links = [...list.querySelectorAll('a')];
    const index = links.indexOf(document.activeElement);
    if (event.key === 'ArrowDown') { event.preventDefault(); links[(index + 1) % links.length].focus(); }
    if (event.key === 'ArrowUp') { event.preventDefault(); index <= 0 ? input.focus() : links[index - 1].focus(); }
  });
  panel.addEventListener('keydown', event => { if (event.key === 'Escape') { event.preventDefault(); input.focus(); close(); } });
  form.addEventListener('submit', event => {
    event.preventDefault();
    const query = input.value.trim();
    if (!query) { input.value = ''; input.focus(); return; }
    const found = matches(query);
    if (found.length === 1 || found.length === 0) window.location.assign((found[0] || request(query)).url);
    else { render(); list.querySelector('a').focus(); }
  });
  document.querySelector('#close-results').addEventListener('click', () => { input.focus(); close(); });
  document.addEventListener('pointerdown', event => { if (!event.target.closest('.finder')) close(); });
  document.querySelector('.finder').addEventListener('focusout', event => { if (!event.currentTarget.contains(event.relatedTarget)) close(); });
  document.querySelectorAll('[data-query]').forEach(button => button.addEventListener('click', () => {
    input.value = button.dataset.query;
    input.focus({ preventScroll: true }); render();
    document.querySelector('#casezoeker').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
  }));
  document.querySelectorAll('[data-focus-search]').forEach(link => link.addEventListener('click', event => { event.preventDefault(); input.focus(); }));
  document.querySelectorAll('[data-show]').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('[data-show]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    document.querySelectorAll('[data-scene]').forEach(image => image.classList.toggle('is-current', image.dataset.scene === button.dataset.show));
  }));
  const initial = new URLSearchParams(location.search).get('q');
  if (initial) { input.value = initial.slice(0, 160); render(); }
})();
