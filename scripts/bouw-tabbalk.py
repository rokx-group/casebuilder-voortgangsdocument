import glob, re, os
# Eén plek waar de tabbalk vandaan komt. Voeg hier een pagina toe en hij staat
# meteen op alle vergelijkpagina's, in de juiste tak.
OUDERS = [
 ('header-varianten.html',        'Header',          None),
 ('hero-voorstellen.html',        'Hero',            None),
 ('homepage-varianten.html',      'Homepage',        'homepage'),
 ('case-aanvragen-varianten.html','Case aanvragen',  None),
 ('case-voor-varianten.html',     '/case-voor',      'case-voor'),
 ('flightcases-varianten.html',   '/flightcases',    'flightcases'),
 ('editor-varianten.html',        'Editor',          None),
 ('groot-zakelijk-varianten.html','/groot-zakelijk', None),
 ('branches-varianten.html',      'Kopkeuze',        None),
 ('service-varianten.html',       '/service',        'service'),
 ('shop-varianten.html',          '/shop',           None),
 ('zoeken-varianten.html',        '/zoeken',         None),
 ('faq-varianten.html',           'FAQ',             None),
 ('footer-varianten.html',        'Footer',          None),
]
KINDEREN = {
 'homepage':    [('homepage-samenstellen.html',        'Samenstellen')],
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


# De balk past niet meer op één regel: veertien tabs zijn breder dan het
# scherm. Zonder afbreken schuiven de laatste buiten beeld — je ziet dan niet
# eens dát er meer is. Deze regel staat hier en niet in de pagina's zelf,
# zodat elke vergelijkpagina dezelfde balk heeft, ook een nieuwe.
WRAP = """
/* tabbalk: alle tabs staan op elke pagina, en ze breken af naar een tweede
   regel als ze niet op één passen. */
.tabs{flex-wrap:wrap}
</style>"""

PATROON = re.compile(r'<div class="tabs">.*?</div>(\s*<div class="subtabs">.*?</div>)?', re.S)

if __name__ == '__main__':
    n = 0
    overgeslagen = []
    for pad in (glob.glob('mockups/*varianten*.html')
                + ['mockups/hero-voorstellen.html', 'mockups/homepage-samenstellen.html']):
        bestand = os.path.basename(pad)
        s = open(pad, encoding='utf-8').read()
        # Alleen in de body zoeken. Stond de tekst <div class="tabs"> ergens in
        # een stijlblok of een commentaar, dan pakte het patroon dát voorkomen
        # en schreef het de balk in de CSS — de pagina was daarna stuk.
        romp = s.find('<body')
        m = PATROON.search(s, romp if romp != -1 else 0)
        # Een pagina zonder <div class="tabs"> kreeg de balk stilzwijgend niet.
        # Zo stond kop-varianten maanden zonder tabs; niemand zag het. Nu meldt
        # hij het, zodat je hem een balk geeft of hem bewust uit de reeks laat.
        if not m:
            overgeslagen.append(bestand); continue
        s = s[:m.start()] + balk_voor(bestand) + s[m.end():]
        if '.subtabs{' not in s:
            s = s.replace('</style>', STIJL, 1)
        if '/* tabbalk:' not in s:
            s = s.replace('</style>', WRAP, 1)
        open(pad, 'w', encoding='utf-8').write(s); n += 1
    print('tabbalk geschreven op', n, 'pagina\'s')
    if overgeslagen:
        print('  overgeslagen, geen <div class="tabs">:', ', '.join(overgeslagen))
