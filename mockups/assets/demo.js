/* ══════════════════════════════════════════════════════════════
   Demopagina's voor de animaties

   Elke demopagina heeft dezelfde inhoud. Het attribuut data-animatie op
   de body kiest welke animatie zich aan die inhoud hangt. Alles wat de
   animatie nodig heeft, wordt hier in de pagina gezet, zodat het
   sjabloon schone inhoud blijft.
   ══════════════════════════════════════════════════════════════ */

// De lijst met demo's komt uit assets/demos.js, gebouwd door het bouwscript.
const DEMOS = window.DEMOS ?? [];

const rustig = matchMedia('(prefers-reduced-motion: reduce)').matches;
const animatie = document.body.dataset.animatie;
const NS = 'http://www.w3.org/2000/svg';
const PX_NAAR_MM = 25.4 / 96;
const zacht = t => (t < .5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
const mm = (waarde, decimalen = 1) =>
  waarde.toLocaleString('nl-NL', { minimumFractionDigits: decimalen, maximumFractionDigits: decimalen });

/* ── de ruit, in elk vlak met data-ruit ─────────────────────── */
document.querySelectorAll('[data-ruit]').forEach(vlak => {
  const laag = document.createElement('div');
  laag.className = `laag laag-${vlak.dataset.ruit}`;
  laag.setAttribute('aria-hidden', 'true');
  vlak.prepend(laag);
});

/* ── silhouetten voor de objecten ───────────────────────────
   Contouren in eigen eenheden, met per vorm de schaal naar
   millimeters, zodat de uitlezing bij het frezen realistisch is. */
const VORMEN = {
  lespaul: {
    vb: '0 0 200 480', schaal: 2.2, naam: 'Gibson Les Paul',
    d: 'M100 470 C45 470 8 430 10 380 C12 340 35 320 32 295 C29 270 12 255 18 225 C24 195 55 182 88 180 L88 62 L80 56 L78 12 L122 12 L120 56 L112 62 L112 182 C124 184 128 196 136 206 C142 214 150 206 160 204 C176 202 186 214 184 236 C182 262 168 276 168 298 C168 322 190 342 190 380 C192 430 155 470 100 470 Z',
  },
  viool: {
    vb: '0 0 200 480', schaal: 1.4, naam: 'Viool',
    d: 'M100 470 C60 470 40 445 42 410 C44 385 60 375 58 355 C56 338 44 330 46 305 C48 275 70 262 94 262 L94 90 L88 60 L100 40 L112 60 L106 90 L106 262 C130 262 152 275 154 305 C156 330 144 338 142 355 C140 375 156 385 158 410 C160 445 140 470 100 470 Z',
  },
  dj: {
    vb: '0 0 320 200', schaal: 1.9, naam: 'DJ-controller',
    d: 'M14 20 H306 V180 H14 Z',
  },
  drone: {
    vb: '0 0 240 240', schaal: 1.5, naam: 'Draagbare drone',
    d: 'M95 70 H145 L200 25 L215 40 L165 95 V145 L215 200 L200 215 L145 170 H95 L40 215 L25 200 L75 145 V95 L25 40 L40 25 Z',
  },
};

function maakSvg(svg, vorm) {
  svg.setAttribute('viewBox', vorm.vb);
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  svg.innerHTML = `<path class="uitsparing" d="${vorm.d}"/><path class="omtrek" d="${vorm.d}"/>`;
}
document.querySelectorAll('svg.silhouet').forEach(svg => maakSvg(svg, VORMEN[svg.dataset.vorm]));

/* ── demobalk ───────────────────────────────────────────────── */
const acties = { opnieuw: () => {} };
function demobalk() {
  const balk = document.createElement('aside');
  balk.className = 'demobalk';
  balk.setAttribute('aria-label', 'Demo-bediening');
  const plek = DEMOS.findIndex(d => d.slug === animatie);
  const naam = DEMOS[plek]?.titel ?? animatie;
  const vorige = DEMOS[(plek - 1 + DEMOS.length) % DEMOS.length], volgende = DEMOS[(plek + 1) % DEMOS.length];
  balk.innerHTML = `
    <a class="pijl" href="${vorige.bestand}" title="Vorige: ${vorige.titel}" aria-label="Vorige demo: ${vorige.titel}">‹</a>
    <span><a href="demo-overzicht.html">${String(plek + 1).padStart(2, '0')}/${DEMOS.length}</a> <b>${naam}</b></span>
    <a class="pijl" href="${volgende.bestand}" title="Volgende: ${volgende.titel}" aria-label="Volgende demo: ${volgende.titel}">›</a>
    <button type="button" data-actie="opnieuw">Opnieuw afspelen</button>
    <button type="button" data-actie="dekking">Ruit versterkt</button>
    <label class="wissel"><span class="sr">Andere demo</span><select>
      ${DEMOS.map(d => `<option value="${d.bestand}"${d.slug === animatie ? ' selected' : ''}>${d.titel}</option>`).join('')}
    </select></label>`;
  if (animatie === 'homepage') {
    const keuze = document.createElement('label');
    keuze.innerHTML = `Liniaal <select>${LINIALEN.map(([v, t]) =>
      `<option value="${v}"${v === liniaalKeuze() ? ' selected' : ''}>${t}</option>`).join('')}</select>`;
    keuze.querySelector('select').addEventListener('change', e => {
      const url = new URL(location.href);
      url.searchParams.set('liniaal', e.target.value);
      location.href = url;
    });
    balk.querySelector('[data-actie="dekking"]').after(keuze);
  }
  document.body.append(balk);
  balk.querySelector('[data-actie="opnieuw"]').addEventListener('click', () => acties.opnieuw());
  const dekking = balk.querySelector('[data-actie="dekking"]');
  dekking.addEventListener('click', () => {
    const echt = document.body.classList.toggle('echt');
    dekking.textContent = echt ? 'Ruit echte dekking' : 'Ruit versterkt';
  });
  balk.querySelector('.wissel select').addEventListener('change', e => { location.href = e.target.value; });
  balk.querySelector('.sr').style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)';
}

/* Eén keer iets doen zodra een element in beeld komt. */
function bijInBeeld(elementen, doe, drempel = .3) {
  const kijker = new IntersectionObserver(items => {
    for (const item of items) if (item.isIntersecting) { doe(item.target); kijker.unobserve(item.target); }
  }, { threshold: drempel });
  elementen.forEach(el => kijker.observe(el));
}

/* De pagina zelf rustig laten scrollen, voor de demo. Stopt zodra de
   bezoeker zelf scrolt of klikt. */
function rondleiding(van, naar, duur) {
  const html = document.documentElement;
  html.style.scrollBehavior = 'auto';
  let gestopt = false;
  const stop = () => { gestopt = true; };
  addEventListener('wheel', stop, { once: true, passive: true });
  addEventListener('touchstart', stop, { once: true, passive: true });
  addEventListener('keydown', stop, { once: true });
  scrollTo(0, van);
  const t0 = performance.now();
  (function frame(t) {
    if (gestopt) { html.style.scrollBehavior = ''; return; }
    const p = Math.min(1, (t - t0) / duur);
    scrollTo(0, van + (naar - van) * zacht(p));
    if (p < 1) requestAnimationFrame(frame); else html.style.scrollBehavior = '';
  })(t0);
}
const paginaHoogte = () => document.documentElement.scrollHeight - innerHeight;

/* ══════════════════════════════════════════════════════════════
   01 · Ruit tekenen
   Elk raster tekent zich op zodra het vlak in beeld komt, lijn voor
   lijn, zoals een plotter een vel opzet. Het masker van de vorm blijft,
   dus een veld tekent alleen in het midden, hoeken alleen in de hoeken.
   ══════════════════════════════════════════════════════════════ */
function ruitTekenen() {
  const lagen = [...document.querySelectorAll('.laag')].map(oud => {
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', oud.className);
    svg.setAttribute('aria-hidden', 'true');
    oud.replaceWith(svg);
    return svg;
  });
  const bouw = svg => {
    const w = svg.parentElement.clientWidth, h = svg.parentElement.clientHeight, cel = 28;
    const stap = Math.max(8, Math.min(18, 1100 / (w / cel + h / cel)));
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    let lijnen = '';
    for (let i = 0, x = .5; x <= w; i++, x += cel)
      lijnen += `<line x1="${x}" y1="0" x2="${x}" y2="${h}" pathLength="1" style="--d:${Math.round(i * stap)}ms"/>`;
    for (let i = 0, y = .5; y <= h; i++, y += cel)
      lijnen += `<line x1="0" y1="${y}" x2="${w}" y2="${y}" pathLength="1" style="--d:${Math.round(i * stap)}ms"/>`;
    svg.innerHTML = lijnen;
  };
  lagen.forEach(bouw);
  let maat;
  addEventListener('resize', () => { clearTimeout(maat); maat = setTimeout(() => lagen.forEach(bouw), 200); });
  bijInBeeld(lagen.map(l => l.parentElement), vlak => vlak.querySelector('svg.laag').classList.add('speel'), .2);

  acties.opnieuw = () => {
    lagen.forEach(l => l.classList.remove('speel'));
    void document.body.offsetWidth;
    lagen.forEach(l => {
      const r = l.parentElement.getBoundingClientRect();
      if (r.bottom > 0 && r.top < innerHeight) l.classList.add('speel');
    });
    bijInBeeld(lagen.filter(l => !l.classList.contains('speel')).map(l => l.parentElement),
      vlak => vlak.querySelector('svg.laag').classList.add('speel'), .2);
  };
}

/* ══════════════════════════════════════════════════════════════
   04 · Ruit meelezen
   Op de donkere vlakken volgt het veld de cursor, traag en met
   naloop, als een loep over de tekening. Zonder muis ligt het veld in
   het midden, en daar is het gewoon het veld uit het boek.
   ══════════════════════════════════════════════════════════════ */
function ruitMeelezen() {
  const volgers = [...document.querySelectorAll('.donker > .laag')].map(laag => {
    laag.className = 'laag laag-volg';
    const vlak = laag.parentElement;
    const staat = { laag, vlak, nu: null, doel: null, loopt: false };
    const midden = () => ({ x: vlak.clientWidth / 2, y: vlak.clientHeight / 2 });
    const stap = () => {
      staat.nu.x += (staat.doel.x - staat.nu.x) * .075;
      staat.nu.y += (staat.doel.y - staat.nu.y) * .075;
      laag.style.setProperty('--x', `${staat.nu.x}px`);
      laag.style.setProperty('--y', `${staat.nu.y}px`);
      if (Math.abs(staat.doel.x - staat.nu.x) + Math.abs(staat.doel.y - staat.nu.y) > .4) requestAnimationFrame(stap);
      else staat.loopt = false;
    };
    staat.naar = punt => {
      staat.doel = punt;
      staat.nu ??= midden();
      if (rustig) { staat.nu = { ...punt }; }
      if (!staat.loopt) { staat.loopt = true; requestAnimationFrame(stap); }
    };
    staat.midden = midden;
    vlak.addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse') return;
      const r = vlak.getBoundingClientRect();
      staat.naar({ x: e.clientX - r.left, y: e.clientY - r.top });
    });
    vlak.addEventListener('pointerleave', () => staat.nu && staat.naar(midden()));
    return staat;
  });

  // Opnieuw afspelen: in de hero beschrijft het veld een lus en komt tot rust.
  acties.opnieuw = () => {
    const hero = volgers[0];
    scrollTo({ top: 0, behavior: 'smooth' });
    const w = hero.vlak.clientWidth, h = hero.vlak.clientHeight, duur = 4600;
    const t0 = performance.now() + 400;
    (function frame(t) {
      const p = Math.max(0, Math.min(1, (t - t0) / duur)), hoek = zacht(p) * Math.PI * 2;
      hero.naar({ x: w / 2 + Math.sin(hoek) * w * .38, y: h / 2 - Math.sin(hoek * 2) * h * .3 });
      if (p < 1) requestAnimationFrame(frame);
    })(performance.now());
  };
}

/* ══════════════════════════════════════════════════════════════
   06 · Ruit onderlaag
   Het raster schuift een derde trager dan de inhoud. Je ziet dat de
   inhoud op de tekening ligt en niet in het vlak gedrukt staat.
   ══════════════════════════════════════════════════════════════ */
function ruitOnderlaag() {
  const lagen = [...document.querySelectorAll('.laag')];
  const schuif = () => {
    for (const laag of lagen) {
      const r = laag.parentElement.getBoundingClientRect();
      if (r.bottom < -200 || r.top > innerHeight + 200) continue;
      laag.style.setProperty('--schuif', (-r.top * .33).toFixed(1));
    }
  };
  if (!rustig) {
    addEventListener('scroll', () => requestAnimationFrame(schuif), { passive: true });
    schuif();
  }
  acties.opnieuw = () => rondleiding(0, paginaHoogte(), 22000);
}

/* ══════════════════════════════════════════════════════════════
   Freesbaan
   De CNC freest het silhouet uit het schuim: eerst de contour, dan
   baan voor baan de uitsparing, heen en weer, met de freeskop als
   kruisje en de positie in millimeters. Waar de kop over een gat moet,
   gaat hij omhoog en begint een nieuwe baan, zoals een echte frees.
   ══════════════════════════════════════════════════════════════ */
function bouwFrees(svg, vorm) {
  svg.setAttribute('viewBox', vorm.vb);
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  svg.classList.add('frees');
  svg.innerHTML = `<path class="spook" d="${vorm.d}"/><path class="gat" d="${vorm.d}"/>
    <g class="banen"></g><path class="baan kont" d="${vorm.d}"/>
    <g class="kop-frees"><circle r="5"/><line x1="-9" x2="9"/><line y1="-9" y2="9"/></g>`;

  // De uitsparing, baan voor baan binnen de contour, met 3 eenheden marge.
  const vormPad = svg.querySelector('.gat');
  const [, , bw, bh] = vorm.vb.split(' ').map(Number);
  const binnen = (x, y) => {
    const p = svg.createSVGPoint();
    const test = (dx, dy) => { p.x = x + dx; p.y = y + dy; return vormPad.isPointInFill(p); };
    return test(0, 0) && test(-3, 0) && test(3, 0) && test(0, -3) && test(0, 3);
  };
  const banen = [];
  let rij = 0, huidig = null, vorige = null;
  const vrij = (a, b) => {
    for (let i = 1; i < 8; i++) if (!binnen(a.x + (b.x - a.x) * i / 8, a.y + (b.y - a.y) * i / 8)) return false;
    return true;
  };
  for (let y = 4; y < bh - 2; y += 6, rij++) {
    const spans = [];
    let start = null;
    for (let x = 0; x <= bw; x += 1) {
      const in_ = binnen(x, y);
      if (in_ && start === null) start = x;
      if (!in_ && start !== null) { spans.push([start, x - 1]); start = null; }
    }
    if (start !== null) spans.push([start, bw]);
    const volgorde = rij % 2 ? spans.slice().reverse() : spans;
    for (const [a, b] of volgorde) {
      if (b - a < 2) continue;
      const van = { x: rij % 2 ? b : a, y }, naar = { x: rij % 2 ? a : b, y };
      if (huidig && vorige && vrij(vorige, van)) huidig.push(van, naar);
      else { huidig = [van, naar]; banen.push(huidig); }
      vorige = naar;
    }
  }
  const groep = svg.querySelector('.banen');
  const delen = banen.map(punten => {
    const pad = document.createElementNS(NS, 'path');
    pad.setAttribute('class', 'baan');
    pad.setAttribute('d', 'M' + punten.map(p => `${p.x} ${p.y}`).join(' L'));
    groep.append(pad);
    return pad;
  });
  const contour = svg.querySelector('.kont');
  const alles = [contour, ...delen].map(el => ({ el, lengte: el.getTotalLength() }));
  const totaal = alles.reduce((s, d) => s + d.lengte, 0);
  const kop = svg.querySelector('.kop-frees');

  const zet = (p, uitlezing) => {
    let over = p * totaal, punt = null;
    for (const d of alles) {
      const deel = Math.max(0, Math.min(d.lengte, over));
      d.el.style.strokeDasharray = `${d.lengte} ${d.lengte}`;
      d.el.style.strokeDashoffset = `${d.lengte - deel}`;
      if (over > 0 && over <= d.lengte) punt = d.el.getPointAtLength(deel);
      over -= d.lengte;
    }
    if (p >= 1) punt = null;
    kop.style.display = punt ? '' : 'none';
    if (punt) {
      kop.setAttribute('transform', `translate(${punt.x} ${punt.y})`);
      uitlezing?.(punt.x * vorm.schaal, punt.y * vorm.schaal);
    }
    svg.classList.toggle('klaar', p >= 1);
  };
  zet(0);

  let loopt = 0;
  return {
    speel(duur = 6000, uitlezing, klaar) {
      const id = ++loopt;
      if (rustig) { zet(1); klaar?.(); return; }
      const t0 = performance.now();
      (function frame(t) {
        if (id !== loopt) return;
        const p = Math.min(1, (t - t0) / duur);
        zet(p, uitlezing);
        if (p < 1) requestAnimationFrame(frame); else klaar?.();
      })(t0);
    },
    leeg: () => { loopt++; zet(0); },
  };
}

function freesbaan({ hero = true } = {}) {
  const heroDeel = hero ? freesHero() : null;
  freesObjecten(heroDeel);
}

// De hero krijgt een schuimplaat in plaats van de foto.
function freesHero() {
  const plek = document.querySelector('[data-plek="hero"]');
  const vak = document.createElement('div');
  vak.className = 'freesvak';
  vak.innerHTML = `
    <header><span>// Schuiminlay · Gibson Les Paul</span><span>CB-2026-0412</span></header>
    <div class="plaat"><svg aria-hidden="true"></svg></div>
    <footer><span>X <b data-as="x">0,0</b></span><span>Y <b data-as="y">0,0</b></span><span>F <b>6.000</b></span><span data-status>Gereed</span></footer>`;
  plek.replaceWith(vak);
  const heroFrees = bouwFrees(vak.querySelector('svg'), VORMEN.lespaul);
  const x = vak.querySelector('[data-as="x"]'), y = vak.querySelector('[data-as="y"]'), status = vak.querySelector('[data-status]');
  const speelHero = () => {
    status.textContent = 'Frezen';
    heroFrees.speel(8000, (mx, my) => { x.textContent = mm(mx); y.textContent = mm(my); },
      () => { status.textContent = 'Maat in. Case uit.'; });
  };
  setTimeout(speelHero, 500);
  return { opnieuw: () => { heroFrees.leeg(); speelHero(); } };
}

// De objecten frezen gespreid zodra ze in beeld komen, en opnieuw bij hover.
function freesObjecten(heroDeel) {
  const objecten = [...document.querySelectorAll('.object')].map(obj => {
    const svg = obj.querySelector('svg.silhouet');
    const vorm = VORMEN[svg.dataset.vorm];
    const aflees = document.createElement('span');
    aflees.className = 'aflees';
    obj.querySelector('.vak').append(aflees);
    const frees = bouwFrees(svg, vorm);
    const speel = () => {
      obj.classList.add('bezig');
      frees.speel(3600, (mx, my) => { aflees.textContent = `X ${mm(mx)}  Y ${mm(my)} mm`; },
        () => obj.classList.remove('bezig'));
    };
    obj.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') speel(); });
    return { obj, speel, frees };
  });
  const wachtOpBeeld = () => bijInBeeld([document.querySelector('.objecten')], () =>
    objecten.forEach((o, i) => setTimeout(o.speel, i * 450)), .35);
  wachtOpBeeld();

  acties.opnieuw = () => {
    heroDeel?.opnieuw();
    objecten.forEach(o => o.frees.leeg());
    // Zonder hero valt er bovenin niets te zien, dus dan wachten de
    // objecten weer tot ze in beeld komen.
    if (heroDeel) objecten.forEach((o, i) => setTimeout(o.speel, 600 + i * 450));
    else wachtOpBeeld();
  };
}

/* ══════════════════════════════════════════════════════════════
   Coördinaten
   De pagina als technische tekening met een nulpunt. Links een
   liniaal in millimeters die meeloopt, in de hero een kruisdraad met
   de positie van de cursor, en bij elke sectie staat op welke hoogte
   van het vel hij ligt.
   ══════════════════════════════════════════════════════════════ */
function coordinaten({ kruisdraad = true, hoogtes = true, liniaal = 'huidig' } = {}) {
  ({
    huidig: liniaalVast,
    rustig: () => liniaalStrook({ stil: true }),
    fijn: () => liniaalStrook({ stil: false }),
    scrollbalk: liniaalScrollbalk,
  }[liniaal] ?? liniaalVast)();

  // Hoogte per sectie, achter het label
  const labels = hoogtes ? [...document.querySelectorAll('section .wrap .label:first-child')]
    .filter(label => !label.closest('.bon, .sleep, .specs')) : [];
  const posities = labels.map(label => {
    const s = document.createElement('span');
    s.className = 'positie';
    label.append(s);
    return s;
  });
  const zetPosities = () => labels.forEach((label, i) => {
    const y = (label.closest('section').getBoundingClientRect().top + scrollY) * PX_NAAR_MM;
    posities[i].textContent = ` · Y ${mm(y, 0)} mm`;
  });
  zetPosities();
  addEventListener('resize', zetPosities);
  addEventListener('load', zetPosities);

  if (!kruisdraad) {
    acties.opnieuw = () => rondleiding(0, paginaHoogte(), 20000);
    return;
  }

  // Kruisdraad in de hero
  const hero = document.querySelector('.hero');
  const kruis = document.createElement('div');
  kruis.className = 'kruis';
  kruis.setAttribute('aria-hidden', 'true');
  kruis.innerHTML = '<span class="h"></span><span class="v"></span><span class="tag"></span>';
  hero.append(kruis);
  const dro = document.createElement('div');
  dro.className = 'dro';
  dro.setAttribute('aria-hidden', 'true');
  dro.innerHTML = '<span>X</span><b data-as="x">0,0</b><span>Y</span><b data-as="y">0,0</b><span>Z</span><b>0,0</b>';
  hero.append(dro);
  const [h, v, tag] = kruis.children;
  const dx = dro.querySelector('[data-as="x"]'), dy = dro.querySelector('[data-as="y"]');
  const zetKruis = (x, y) => {
    h.style.transform = `translateY(${y}px)`;
    v.style.transform = `translateX(${x}px)`;
    tag.style.transform = `translate(${x + 12}px, ${y + 12}px)`;
    const tx = mm(x * PX_NAAR_MM), ty = mm(y * PX_NAAR_MM);
    tag.textContent = `X ${tx}  Y ${ty} mm`;
    dx.textContent = tx; dy.textContent = ty;
  };
  hero.addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse') return;
    const r = hero.getBoundingClientRect();
    kruis.classList.add('aan');
    zetKruis(e.clientX - r.left, e.clientY - r.top);
  });
  hero.addEventListener('pointerleave', () => kruis.classList.remove('aan'));

  // Opnieuw afspelen: de kruisdraad meet de kop op, dan loopt de pagina door.
  acties.opnieuw = () => {
    scrollTo({ top: 0, behavior: 'auto' });
    const kop = hero.querySelector('h1').getBoundingClientRect(), r = hero.getBoundingClientRect();
    const punten = [
      [kop.left - r.left, kop.top - r.top],
      [kop.right - r.left, kop.top - r.top],
      [kop.right - r.left, kop.bottom - r.top],
      [kop.left - r.left, kop.bottom - r.top],
    ];
    kruis.classList.add('aan');
    const t0 = performance.now(), per = 900;
    (function frame(t) {
      const verstreken = t - t0, i = Math.floor(verstreken / per);
      if (i >= punten.length) {
        kruis.classList.remove('aan');
        rondleiding(0, paginaHoogte(), 20000);
        return;
      }
      const [ax, ay] = punten[i], [bx, by] = punten[(i + 1) % punten.length];
      const p = zacht(Math.min(1, (verstreken % per) / (per * .7)));
      zetKruis(ax + (bx - ax) * p, ay + (by - ay) * p);
      requestAnimationFrame(frame);
    })(t0);
  };
}

/* ══════════════════════════════════════════════════════════════
   Tekeningvel
   Het hoekbeslag klikt dicht zodra een paginavlak in beeld komt, zoals
   de hoeken van een case. Rechtsonder staat een titelblok zoals op elke
   technische tekening, met het blad waarop je nu bent.
   ══════════════════════════════════════════════════════════════ */
function tekeningvel({ beslag = true, titelblok = true } = {}) {
  // Hoekbeslag, alleen op de paginavlakken, zoals de regel zegt
  const beslagen = (beslag ? [...document.querySelectorAll('[data-beslag]')] : []).map(vlak => {
    const b = document.createElement('div');
    b.className = 'beslag';
    b.setAttribute('aria-hidden', 'true');
    b.innerHTML = '<i class="lb"></i><i class="rb"></i><i class="ro"></i><i class="lo"></i>';
    vlak.append(b);
    return b;
  });
  const sluit = b => {
    b.classList.add('dicht');
    setTimeout(() => { b.classList.add('klik'); setTimeout(() => b.classList.remove('klik'), 160); }, 620);
  };
  bijInBeeld(beslagen.map(b => b.parentElement), vlak => sluit(vlak.querySelector('.beslag')), .45);
  const herhaalBeslag = () => {
    beslagen.forEach(b => b.classList.remove('dicht', 'klik'));
    scrollTo({ top: 0, behavior: 'auto' });
    setTimeout(() => {
      beslagen.forEach(b => {
        const r = b.parentElement.getBoundingClientRect();
        if (r.top < innerHeight && r.bottom > 0) sluit(b);
      });
      bijInBeeld(beslagen.filter(b => !b.classList.contains('dicht')).map(b => b.parentElement),
        vlak => sluit(vlak.querySelector('.beslag')), .45);
    }, 450);
  };
  if (!titelblok) { acties.opnieuw = herhaalBeslag; return; }

  // Titelblok
  const bladen = [...document.querySelectorAll('[data-blad]')];
  const blok = document.createElement('aside');
  blok.className = 'titelblok';
  blok.setAttribute('aria-hidden', 'true');
  const datum = new Date().toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit', year: 'numeric' });
  blok.innerHTML = `
    <div class="merkcel"><small>Project</small><img src="assets/woordmerk.svg" alt=""></div>
    <div class="naam"><small>Onderdeel</small><span></span></div>
    <div><small>Blad</small><b data-blad-nr>01</b> / ${String(bladen.length).padStart(2, '0')}</div>
    <div><small>Tekening</small>CB-2026-0412</div>
    <div><small>Schaal</small>1:1</div>
    <div><small>Datum</small>${datum}</div>`;
  document.body.append(blok);
  const naam = blok.querySelector('.naam span'), nr = blok.querySelector('[data-blad-nr]');
  setTimeout(() => blok.classList.add('in'), 700);

  let huidig = -1, typen = 0;
  const typ = tekst => {
    const id = ++typen;
    blok.classList.add('typt');
    if (rustig) { naam.textContent = tekst; blok.classList.remove('typt'); return; }
    let i = 0;
    naam.textContent = '';
    (function volgende() {
      if (id !== typen) return;
      naam.textContent = tekst.slice(0, ++i);
      if (i < tekst.length) setTimeout(volgende, 38); else setTimeout(() => blok.classList.remove('typt'), 500);
    })();
  };
  const bepaal = () => {
    const lijn = innerHeight * .4;
    let i = bladen.findIndex(b => { const r = b.getBoundingClientRect(); return r.top <= lijn && r.bottom > lijn; });
    if (i < 0) i = 0;
    if (i !== huidig) {
      huidig = i;
      nr.textContent = String(i + 1).padStart(2, '0');
      typ(bladen[i].dataset.blad);
    }
  };
  addEventListener('scroll', () => requestAnimationFrame(bepaal), { passive: true });
  setTimeout(bepaal, 900);

  acties.opnieuw = () => {
    blok.classList.remove('in');
    huidig = -1;
    herhaalBeslag();
    setTimeout(() => { blok.classList.add('in'); bepaal(); }, 450);
  };
}

/* ── liniaal, vier varianten ────────────────────────────────── */

// Terwijl de bezoeker scrolt staat .meet op de body, een tel daarna niet meer.
let meetTimer;
addEventListener('scroll', () => {
  document.body.classList.add('meet');
  clearTimeout(meetTimer);
  meetTimer = setTimeout(() => document.body.classList.remove('meet'), 900);
}, { passive: true });

// Huidig: een vaste witte liniaal links, met cijfers per 100 mm.
function liniaalVast() {
  document.body.classList.add('met-liniaal');
  const liniaal = document.createElement('div');
  liniaal.className = 'liniaal';
  liniaal.setAttribute('aria-hidden', 'true');
  liniaal.innerHTML = '<div class="schaal"></div><span class="nu">Y 0,0 mm</span>';
  document.body.append(liniaal);
  const schaal = liniaal.querySelector('.schaal'), nu = liniaal.querySelector('.nu');
  const tienCm = 100 / PX_NAAR_MM;
  const bouw = () => {
    const h = document.documentElement.scrollHeight;
    schaal.style.height = `${h}px`;
    schaal.innerHTML = '';
    for (let i = 1; i * tienCm < h; i++) {
      const g = document.createElement('span');
      g.className = 'getal';
      g.style.top = `${i * tienCm + 4}px`;
      g.textContent = i * 100;
      schaal.append(g);
    }
  };
  const volg = () => {
    schaal.style.transform = `translateY(${-scrollY}px)`;
    nu.textContent = `Y ${mm((scrollY + innerHeight / 2) * PX_NAAR_MM)} mm`;
  };
  bouw(); volg();
  addEventListener('scroll', () => requestAnimationFrame(volg), { passive: true });
  addEventListener('resize', () => { bouw(); volg(); });
  addEventListener('load', bouw);
}

// Rustig en fijn: geen strook over de pagina, maar de streepjes in elk
// vlak zelf, in de kleur van dat vlak. Rustig toont ze alleen tijdens het
// scrollen; fijn toont alleen centimeters en cijfers, maar altijd.
function liniaalStrook({ stil }) {
  document.body.classList.add(stil ? 'liniaal-rustig' : 'liniaal-fijn');
  const cm = 10 / PX_NAAR_MM, tienCm = 100 / PX_NAAR_MM;
  const stroken = [...document.querySelectorAll('body > header, body > section, body > footer')].map(blok => {
    blok.classList.add('met-strook');
    const strook = document.createElement('div');
    strook.className = 'strook';
    strook.setAttribute('aria-hidden', 'true');
    blok.append(strook);
    return strook;
  });
  const bouw = () => stroken.forEach(strook => {
    const blok = strook.parentElement, top = blok.getBoundingClientRect().top + scrollY;
    strook.style.setProperty('--start', `${-(top % cm)}px`);
    strook.innerHTML = '';
    if (stil) return;
    for (let n = Math.max(1, Math.ceil(top / tienCm)); n * tienCm < top + blok.offsetHeight; n++) {
      const g = document.createElement('span');
      g.className = 'getal';
      g.style.top = `${n * tienCm - top + 4}px`;
      g.textContent = n * 100;
      strook.append(g);
    }
  });
  const wijzer = document.createElement('span');
  wijzer.className = 'wijzer';
  wijzer.setAttribute('aria-hidden', 'true');
  document.body.append(wijzer);
  const volg = () => { wijzer.textContent = `Y ${mm((scrollY + innerHeight / 2) * PX_NAAR_MM)} mm`; };
  bouw(); volg();
  addEventListener('scroll', () => requestAnimationFrame(volg), { passive: true });
  addEventListener('resize', bouw);
  addEventListener('load', bouw);
}

// Scrollbalk: de liniaal vervangt de scrollbalk. De hele pagina staat op
// schaal in de balk, de duim is wat je ziet, onderaan de totale lengte.
function liniaalScrollbalk() {
  document.body.classList.add('liniaal-scrollbalk');
  document.documentElement.classList.add('zonder-scrollbalk');
  const balk = document.createElement('div');
  balk.className = 'schuifmaat';
  balk.setAttribute('aria-hidden', 'true');
  balk.innerHTML = '<div class="baan"></div><div class="duim"><span class="waarde"></span></div><span class="totaal"></span>';
  document.body.append(balk);
  const baan = balk.querySelector('.baan'), duim = balk.querySelector('.duim');
  const waarde = balk.querySelector('.waarde'), totaal = balk.querySelector('.totaal');
  const lengte = () => document.documentElement.scrollHeight;
  const volg = () => {
    duim.style.transform = `translateY(${scrollY / lengte() * balk.clientHeight}px)`;
    waarde.textContent = `Y ${mm((scrollY + innerHeight / 2) * PX_NAAR_MM, 0)} mm`;
  };
  const maat = () => {
    const doc = lengte(), h = balk.clientHeight, stap = (100 / PX_NAAR_MM) / doc * h;
    baan.style.setProperty('--stap', `${stap}px`);
    // Een cijfer per 100 mm, of per 500 mm als de pagina zo lang is dat ze
    // anders op elkaar vallen.
    baan.innerHTML = '';
    const elke = stap < 26 ? 5 : 1;
    for (let n = elke; n * stap < h - 20; n += elke) {
      const g = document.createElement('span');
      g.className = 'getal';
      g.style.top = `${n * stap}px`;
      g.textContent = n * 100;
      baan.append(g);
    }
    duim.style.height = `${innerHeight / doc * h}px`;
    totaal.textContent = `${mm(doc * PX_NAAR_MM, 0)} mm`;
    volg();
  };
  let greep = null;
  duim.addEventListener('pointerdown', e => {
    greep = { y: e.clientY, van: scrollY };
    duim.setPointerCapture(e.pointerId);
    balk.classList.add('sleept');
    document.documentElement.style.scrollBehavior = 'auto';
    e.preventDefault();
  });
  duim.addEventListener('pointermove', e => {
    if (greep) scrollTo(0, greep.van + (e.clientY - greep.y) * lengte() / balk.clientHeight);
  });
  duim.addEventListener('pointerup', () => {
    greep = null;
    balk.classList.remove('sleept');
    document.documentElement.style.scrollBehavior = '';
  });
  baan.addEventListener('pointerdown', e => {
    const r = balk.getBoundingClientRect();
    scrollTo({ top: (e.clientY - r.top) / r.height * lengte() - innerHeight / 2, behavior: 'smooth' });
  });
  maat();
  addEventListener('scroll', () => requestAnimationFrame(volg), { passive: true });
  addEventListener('resize', maat);
  addEventListener('load', maat);
}

const LINIALEN = [['scrollbalk', 'Scrollbalk'], ['rustig', 'Rustig'], ['fijn', 'Fijn'], ['huidig', 'Huidig']];
const liniaalKeuze = () => {
  const gevraagd = new URLSearchParams(location.search).get('liniaal');
  return LINIALEN.some(([v]) => v === gevraagd) ? gevraagd : 'scrollbalk';
};

/* ══════════════════════════════════════════════════════════════
   Homepage v13
   De gekozen animaties samen, met de film in de hero. Elke ruit schuift
   als onderlaag, links loopt de liniaal, de objecten worden gefreesd en
   de pagina is een tekeningvel met beslag en titelblok.
   ══════════════════════════════════════════════════════════════ */
function homepage() {
  const film = document.querySelector('.hero-film video');
  if (film && rustig) { film.removeAttribute('autoplay'); film.pause(); }

  ruitOnderlaag();
  coordinaten({ kruisdraad: false, hoogtes: false, liniaal: liniaalKeuze() });
  freesbaan({ hero: false });
  const frees = acties.opnieuw;
  tekeningvel();
  const vel = acties.opnieuw;
  acties.opnieuw = () => { vel(); frees(); };
}

/* ══════════════════════════════════════════════════════════════
   De vaste basis: de ruit als onderlaag en de liniaal als scrollbalk.
   Alle nieuwe demo's staan daarop, zodat je ze ziet zoals ze worden.
   ══════════════════════════════════════════════════════════════ */
function standaard() {
  ruitOnderlaag();
  coordinaten({ kruisdraad: false, hoogtes: false, liniaal: 'scrollbalk' });
}

/* ══════════════════════════════════════════════════════════════
   Bemating
   Maatlijnen met pijlpunten en verlengstreepjes, zoals op een
   werktekening. Ze trekken zich vanuit het midden naar beide kanten en
   het getal telt op tot de maat. Op de productfoto's is het een
   voorbeeldmaat, bij de silhouetten volgt hij uit de vorm zelf.
   ══════════════════════════════════════════════════════════════ */
function maatlijnen(gastheer, doel, maten) {
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'maatlijnen');
  svg.setAttribute('aria-hidden', 'true');
  gastheer.append(svg);
  const pijl = (x, y, hoek) => `<path class="pijl" d="M0 0 L-7 -3 L-7 3 Z" transform="translate(${x} ${y}) rotate(${hoek})"/>`;
  const teken = () => {
    const g = gastheer.getBoundingClientRect(), d = doel.getBoundingClientRect();
    const l = d.left - g.left, r = d.right - g.left, t = d.top - g.top, o = d.bottom - g.top;
    const y = o + 18, x = r + 18, mx = (l + r) / 2, my = (t + o) / 2;
    svg.setAttribute('viewBox', `0 0 ${g.width} ${g.height}`);
    svg.innerHTML = `
      <path class="hulp" d="M${l} ${o + 4} V${y + 6} M${r} ${o + 4} V${y + 6} M${r + 4} ${t} H${x + 6} M${r + 4} ${o} H${x + 6}"/>
      <path class="lijn" pathLength="1" d="M${mx} ${y} H${l}"/><path class="lijn" pathLength="1" d="M${mx} ${y} H${r}"/>
      <path class="lijn" pathLength="1" d="M${x} ${my} V${t}"/><path class="lijn" pathLength="1" d="M${x} ${my} V${o}"/>
      <g class="pijlen">${pijl(l, y, 180)}${pijl(r, y, 0)}${pijl(x, t, -90)}${pijl(x, o, 90)}</g>
      <text class="maat" x="${mx}" y="${y + 4}" text-anchor="middle" data-maat="b">0</text>
      <text class="maat" x="${x}" y="${my}" text-anchor="middle" transform="rotate(-90 ${x} ${my})" dy="4" data-maat="h">0</text>
      ${maten.d ? `<text class="maat diep" x="${r}" y="${t - 10}" text-anchor="end" data-maat="d">D 0 mm</text>` : ''}`;
    svg.querySelectorAll('text.maat').forEach(tekst => {
      const box = tekst.getBBox(), achter = document.createElementNS(NS, 'rect');
      achter.setAttribute('class', 'achter');
      achter.setAttribute('x', box.x - 6); achter.setAttribute('y', box.y - 2);
      achter.setAttribute('width', box.width + 12); achter.setAttribute('height', box.height + 4);
      if (tekst.getAttribute('transform')) achter.setAttribute('transform', tekst.getAttribute('transform'));
      if (!tekst.classList.contains('diep')) tekst.before(achter);
    });
  };
  const tel = (p) => {
    for (const [as, waarde] of Object.entries(maten)) {
      const tekst = svg.querySelector(`[data-maat="${as}"]`);
      if (!tekst) continue;
      const nu = mm(Math.round(waarde * p), 0);
      tekst.textContent = as === 'd' ? `D ${nu} mm` : `${nu}`;
    }
  };
  teken();
  let klaar = false;
  addEventListener('resize', () => { teken(); if (klaar) { svg.classList.add('getekend'); tel(1); } });
  return {
    speel() {
      svg.classList.remove('getekend');
      void svg.getBoundingClientRect();
      svg.classList.add('getekend');
      if (rustig) { tel(1); klaar = true; return; }
      const t0 = performance.now() + 250;
      (function frame(t) {
        const p = Math.max(0, Math.min(1, (t - t0) / 1100));
        tel(1 - (1 - p) ** 3);
        if (p < 1) requestAnimationFrame(frame); else klaar = true;
      })(performance.now());
    },
    leeg() { svg.classList.remove('getekend'); tel(0); klaar = false; },
  };
}

function bemating() {
  standaard();
  const alle = [];
  document.querySelectorAll('.maatfoto').forEach(fig => {
    const [b, h, d] = fig.dataset.maat.split(',').map(Number);
    alle.push({ el: fig, lijn: maatlijnen(fig, fig.querySelector('.foto'), { b, h, d }) });
  });
  document.querySelectorAll('.object').forEach(obj => {
    const svg = obj.querySelector('svg.silhouet'), vorm = VORMEN[svg.dataset.vorm];
    const pad = svg.querySelector('.omtrek'), box = pad.getBBox();
    alle.push({ el: obj, lijn: maatlijnen(obj, pad, { b: box.width * vorm.schaal, h: box.height * vorm.schaal }) });
  });
  const wacht = () => {
    const groepen = [document.querySelector('.maatfotos'), document.querySelector('.objecten')];
    bijInBeeld(groepen, groep => alle.filter(a => groep.contains(a.el))
      .forEach((a, i) => setTimeout(() => a.lijn.speel(), i * 300)), .35);
  };
  wacht();
  acties.opnieuw = () => { alle.forEach(a => a.lijn.leeg()); wacht(); document.getElementById('modellen').scrollIntoView(); };
}

/* ══════════════════════════════════════════════════════════════
   Tien werkdagen
   Een meetlat van tien werkdagen. De band blijft staan terwijl je
   scrolt, en per stuk scroll schuift er een dag bij. Hij eindigt op
   de echte datum: vandaag plus tien werkdagen, weekenden overgeslagen.
   ══════════════════════════════════════════════════════════════ */
const FASEN = [
  ['Controle', 'Een casebouwer kijkt je configuratie na.'],
  ['Zagen', 'De panelen gaan op maat.'],
  ['Frezen', 'De CNC freest het schuim en de uitsparingen.'],
  ['Profiel', 'Het aluminium profiel gaat op lengte.'],
  ['Bouwen', 'Panelen en profiel worden één kist.'],
  ['Bouwen', 'Deksel, scharnieren en naden.'],
  ['Beslag', 'Hoeken, sloten en handgrepen.'],
  ['Afmonteren', 'Wielen, schuim en de laatste details.'],
  ['Eindcontrole', 'Maat, sluiting en afwerking nagelopen.'],
  ['Onderweg', 'Je case gaat de deur uit.'],
];
function werkdagen(vanaf, aantal) {
  const dagen = [], d = new Date(vanaf);
  while (dagen.length < aantal) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0 && d.getDay() !== 6) dagen.push(new Date(d));
  }
  return dagen;
}
function levertijd() {
  standaard();
  const band = document.getElementById('levertijd');
  const lat = band.querySelector('[data-meetlat]');
  const dagen = werkdagen(new Date(), 10);
  const kort = d => d.toLocaleDateString('nl-NL', { weekday: 'short', day: 'numeric', month: 'short' });
  lat.innerHTML = dagen.map((d, i) => `<li><span class="nr">${String(i + 1).padStart(2, '0')}</span>
    <span class="fase">${FASEN[i][0]}</span><span class="datum">${kort(d)}</span></li>`).join('')
    + '<span class="vulling" aria-hidden="true"></span>';
  const eind = dagen.at(-1).toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' });
  band.querySelector('[data-einddatum]').textContent = eind;
  const cellen = [...lat.children].filter(c => c.tagName === 'LI');
  const nr = band.querySelector('[data-dagnr]'), fase = band.querySelector('[data-fase]'), uitleg = band.querySelector('[data-uitleg]');
  let vorige = -1;
  const volg = () => {
    const r = band.getBoundingClientRect(), ruimte = band.offsetHeight - innerHeight;
    const p = Math.max(0, Math.min(1, (68 - r.top) / ruimte));
    lat.style.setProperty('--p', p);
    const dag = Math.min(10, Math.floor(p * 10.999));
    cellen.forEach((c, i) => { c.classList.toggle('vol', i < dag); c.classList.toggle('nu', i === dag - 1); });
    band.classList.toggle('klaar', dag === 10);
    if (dag !== vorige) {
      vorige = dag;
      nr.textContent = `Dag ${String(dag).padStart(2, '0')}`;
      fase.textContent = dag ? FASEN[dag - 1][0] : 'Bestel je vandaag';
      uitleg.textContent = dag ? `${FASEN[dag - 1][1]} ${kort(dagen[dag - 1])}.` : 'Je configuratie komt binnen bij een casebouwer.';
    }
  };
  addEventListener('scroll', () => requestAnimationFrame(volg), { passive: true });
  volg();
  acties.opnieuw = () => {
    const top = band.getBoundingClientRect().top + scrollY - 68;
    rondleiding(top - innerHeight * .3, top + band.offsetHeight - innerHeight + 40, 9000);
  };
}

/* ══════════════════════════════════════════════════════════════
   Vlinderslot
   Het cB-monogram komt van het vlinderslot. Op momenten van vast klikt
   het dicht: eerst grijpt de beugel over de nok, dan draait de vlinder
   plat, dan de klik. Alleen daar, nergens als versiering.
   ══════════════════════════════════════════════════════════════ */
const VLINDERSLOT = `<svg class="vs" viewBox="0 0 48 48" aria-hidden="true">
  <g class="vs-boven"><rect x="12" y="4" width="24" height="10"/><path class="vs-nok" d="M20 14 V10 H28 V14"/></g>
  <rect class="vs-onder" x="10" y="22" width="28" height="22"/>
  <path class="vs-beugel" d="M18 31 V12 H30 V31"/>
  <path class="vs-vlinder" d="M12 33 C12 28 19 27 24 33 C29 27 36 28 36 33 C36 38 29 39 24 33 C19 39 12 38 12 33 Z"/>
  <circle class="vs-as" cx="24" cy="33" r="1.8"/>
</svg>`;
function vlinderslot() {
  standaard();
  // Winkelwagen in de nav
  const wagen = document.createElement('a');
  wagen.className = 'wagen';
  wagen.href = '#enkel';
  wagen.innerHTML = 'Winkelwagen <b data-aantal>0</b>';
  document.querySelector('.nav .rechts').prepend(wagen);
  const aantal = wagen.querySelector('[data-aantal]');
  let inWagen = 0;

  // Knoppen op de objecten
  const knoppen = [...document.querySelectorAll('.object')].map(obj => {
    const knop = document.createElement('button');
    knop.type = 'button';
    knop.className = 'knop knop-slot';
    knop.innerHTML = `${VLINDERSLOT}<span>In winkelwagen</span>`;
    obj.append(knop);
    const tekst = knop.querySelector('span'), slot = knop.querySelector('.vs');
    knop.addEventListener('click', () => {
      if (slot.classList.contains('dicht')) return;
      slot.classList.add('dicht');
      knop.classList.add('vast');
      tekst.textContent = 'Klik. Klaar.';
      setTimeout(() => {
        aantal.textContent = ++inWagen;
        wagen.classList.remove('tik'); void wagen.offsetWidth; wagen.classList.add('tik');
      }, 720);
      setTimeout(() => { tekst.textContent = 'In je winkelwagen'; }, 2200);
    });
    return { knop, tekst, slot };
  });

  // De aanvraag versturen
  const sleep = document.querySelector('.sleep');
  const oud = sleep.innerHTML;
  const koppel = () => sleep.querySelector('.knop').addEventListener('click', e => { e.preventDefault(); verstuur(); });
  const verstuur = () => {
    sleep.classList.add('verstuurd');
    sleep.innerHTML = `<span class="label">// Aanvraag CB-A-2026-0187</span>
      <div class="bevestiging">
        <div class="groot-slot">${VLINDERSLOT}<img src="assets/beeldmerk.svg" alt="" class="monogram"></div>
        <h3>Klik. Klaar.</h3>
        <p>Joran heeft je bestand. Je krijgt vandaag nog een tekening met prijs terug.</p>
      </div>
      <button class="link" type="button" data-terug>Nog een bestand sturen</button>`;
    const groot = sleep.querySelector('.groot-slot');
    requestAnimationFrame(() => requestAnimationFrame(() => groot.querySelector('.vs').classList.add('dicht')));
    setTimeout(() => groot.classList.add('monogram-in'), 1500);
    sleep.querySelector('[data-terug]').addEventListener('click', herstel);
  };
  const herstel = () => { sleep.classList.remove('verstuurd'); sleep.innerHTML = oud; koppel(); };
  koppel();

  acties.opnieuw = () => {
    knoppen.forEach(k => { k.slot.classList.remove('dicht'); k.knop.classList.remove('vast'); k.tekst.textContent = 'In winkelwagen'; });
    inWagen = 0; aantal.textContent = 0;
    herstel();
    document.getElementById('enkel').scrollIntoView();
    setTimeout(() => knoppen[0].knop.click(), 900);
  };
}

/* ══════════════════════════════════════════════════════════════
   Serienummer
   Een mechanische teller: elk cijfer is een rol die doordraait. Hij
   telt op tot de laatste case die de deur uitging, en in de demo komt
   er af en toe een bij. De data is voorbeelddata tot de koppeling met
   de productie er is.
   ══════════════════════════════════════════════════════════════ */
const VOORBEELDEN = [
  ['Rackcase 24 HE', 'audio-visueel'], ['Trunccase', 'broadcast'], ['Schuiminlay meetkoffer', 'meet- en testapparatuur'],
  ['Koffer', 'industrie'], ['Rackcase 12 HE', 'defensie'], ['Hoedcase', 'audio-visueel'], ['Transportkist', 'schaalmodellen'],
];
function serienummer() {
  standaard();
  const band = document.getElementById('productie');
  const rollen = band.querySelector('[data-teller]');
  rollen.innerHTML = Array.from({ length: 4 }, () =>
    `<span class="rol"><span class="rolband">${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(n => `<span>${n}</span>`).join('')}</span></span>`).join('');
  const banden = [...rollen.querySelectorAll('.rolband')];
  const zetCijfers = (getal, zacht = true) => {
    String(getal).padStart(4, '0').split('').map(Number).forEach((c, i) => {
      const b = banden[i], was = Number(b.dataset.c ?? 0);
      if (zacht && was === 9 && c === 0) {
        // Van 9 naar 0 draait de rol door naar de tweede 0, en springt dan stil terug.
        b.style.transform = 'translateY(-10em)';
        b.addEventListener('transitionend', () => {
          b.style.transition = 'none'; b.style.transform = 'translateY(0)';
          void b.offsetWidth; b.style.transition = '';
        }, { once: true });
      } else {
        if (!zacht) b.style.transition = 'none';
        b.style.transform = `translateY(${-c}em)`;
        if (!zacht) { void b.offsetWidth; b.style.transition = ''; }
      }
      b.dataset.c = c;
    });
    document.querySelectorAll('[data-serie]').forEach(el => { el.textContent = `CB-2026-${String(getal).padStart(4, '0')}`; });
  };
  const lijst = band.querySelector('[data-vertrek]'), laatste = band.querySelector('[data-laatste]');
  const tijd = minutenTerug => {
    const d = new Date(Date.now() - minutenTerug * 60000);
    return d.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });
  };
  const rij = (nr, [type, branche], wanneer) =>
    `<li><span class="serie">CB-2026-${String(nr).padStart(4, '0')}</span><span>${type}</span><span>${branche}</span><span class="tijd">${wanneer}</span></li>`;
  let huidig = 412;
  const startLijst = () => {
    lijst.innerHTML = [1, 2, 3, 4, 5].map(i => rij(huidig - i, VOORBEELDEN[i % VOORBEELDEN.length], tijd(i * 47))).join('');
    laatste.textContent = `ging vandaag om ${tijd(8)} de deur uit. ${VOORBEELDEN[0][0]}, ${VOORBEELDEN[0][1]}.`;
  };
  startLijst();
  zetCijfers(huidig - 14, false);

  const telOp = (van, tot, klaar) => {
    let n = van;
    (function stap() {
      zetCijfers(++n);
      if (n < tot) setTimeout(stap, 110); else klaar?.();
    })();
  };
  let ticker;
  const nieuwe = () => {
    const voorbeeld = VOORBEELDEN[(huidig + 3) % VOORBEELDEN.length];
    const oudRij = rij(huidig, VOORBEELDEN[huidig % VOORBEELDEN.length], tijd(0));
    lijst.insertAdjacentHTML('afterbegin', oudRij);
    lijst.firstElementChild.classList.add('nieuw');
    if (lijst.children.length > 5) lijst.lastElementChild.remove();
    huidig++;
    zetCijfers(huidig);
    laatste.textContent = `ging zojuist om ${tijd(0)} de deur uit. ${voorbeeld[0]}, ${voorbeeld[1]}.`;
    band.classList.remove('tik'); void band.offsetWidth; band.classList.add('tik');
  };
  const start = () => {
    telOp(huidig - 14, huidig, () => { clearInterval(ticker); if (!rustig) ticker = setInterval(nieuwe, 12000); });
  };
  bijInBeeld([band], start, .4);
  acties.opnieuw = () => {
    clearInterval(ticker);
    huidig = 412;
    startLijst();
    zetCijfers(huidig - 14, false);
    band.scrollIntoView();
    setTimeout(start, 500);
  };
}

demobalk();

({
  homepage,
  titelblok: () => { standaard(); tekeningvel({ beslag: false }); },
  hoekbeslag: () => { standaard(); tekeningvel({ titelblok: false }); },
  bemating,
  levertijd,
  vlinderslot,
  serienummer,
  'ruit-tekenen': ruitTekenen,
  'ruit-meelezen': ruitMeelezen,
  'ruit-onderlaag': ruitOnderlaag,
  freesbaan,
  coordinaten,
  tekeningvel,
})[animatie]?.();
