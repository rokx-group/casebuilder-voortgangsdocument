import glob, re, os
# Eén plek waar de tabbalk vandaan komt. Voeg hier een pagina toe en hij staat
# meteen op alle vergelijkpagina's, in de juiste tak.
OUDERS = [
 ('header-varianten.html',        'Header',          None),
 ('hero-voorstellen.html',        'Hero',            None),
 ('homepage-varianten.html',      'Homepage',        None),
 ('case-aanvragen-varianten.html','Case aanvragen',  None),
 ('case-voor-varianten.html',     '/case-voor',      'case-voor'),
 ('flightcases-varianten.html',   '/flightcases',    'flightcases'),
 ('groot-zakelijk-varianten.html','/groot-zakelijk', None),
 ('branches-varianten.html',      'Kopkeuze',        None),
 ('service-varianten.html',       '/service',        'service'),
 ('zoeken-varianten.html',        '/zoeken',         None),
 ('faq-varianten.html',           'FAQ',             None),
 ('footer-varianten.html',        'Footer',          None),
]
KINDEREN = {
 'case-voor':   [('case-voor-categorie-varianten.html', 'Productcategorie'),
                 ('case-voor-detail-varianten.html',    'Productdetail')],
 'flightcases': [('configurator-varianten.html',        '/configurator')],
 'service':     [('zo-werkt-het-varianten.html',        'Zo werkt het')],
}
TAKNAAM = {t: l for _, l, t in OUDERS if t}
TAK_VAN = {b: tak for tak, kids in KINDEREN.items() for b, _ in kids}
for b, _, t in OUDERS:
    if t: TAK_VAN[b] = t

def balk_voor(bestand):
    tak = TAK_VAN.get(bestand)
    rij = []
    for b, label, eigen_tak in OUDERS:
        klasse = ' class="on"' if b == bestand else (' class="tak"' if eigen_tak and eigen_tak == tak else '')
        rij.append(f'    <a href="{b}"{klasse}>{label}</a>')
    uit = '<div class="tabs">\n' + '\n'.join(rij) + '\n  </div>'
    if tak:
        kinderen = ['    <a href="%s"%s>%s</a>' % (b, ' class="on"' if b == bestand else '', label)
                    for b, label in KINDEREN[tak]]
        uit += ('\n\n  <div class="subtabs"><span class="pad">&#8627; binnen ' + TAKNAAM[tak] + '</span>\n'
                + '\n'.join(kinderen) + '\n  </div>')
    return uit

STIJL = """
.tabs a.tak{color:var(--dark)}
.subtabs{display:flex;align-items:baseline;gap:0;margin:-20px 0 26px;flex-wrap:wrap}
.subtabs .pad{font-family:var(--mono);font-size:9.5px;letter-spacing:.14em;text-transform:uppercase;
  color:var(--mute);padding:9px 14px 9px 2px}
.subtabs a{font-family:var(--mono);font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;
  color:var(--mute);padding:9px 16px;border-bottom:2px solid transparent}
.subtabs a:hover{color:var(--dark)}
.subtabs a.on{color:var(--dark);border-bottom-color:var(--cyan);font-weight:600}
</style>"""

if __name__ == '__main__':
    n = 0
    for pad in glob.glob('mockups/*varianten*.html') + ['mockups/hero-voorstellen.html']:
        bestand = os.path.basename(pad)
        s = open(pad, encoding='utf-8').read()
        m = re.search(r'<div class="tabs">.*?</div>(\s*<div class="subtabs">.*?</div>)?', s, re.S)
        if not m: continue
        s = s[:m.start()] + balk_voor(bestand) + s[m.end():]
        if '.subtabs{' not in s:
            s = s.replace('</style>', STIJL, 1)
        open(pad, 'w', encoding='utf-8').write(s); n += 1
    print('tabbalk geschreven op', n, 'pagina\'s')
