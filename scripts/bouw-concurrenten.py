"""Zet de opgehaalde sitemaps om in lijsten: de Excel en de data voor de tab.

Stap 2 van twee. Leest alleen concurrenten/bronnen/ (gevuld door
haal-concurrenten.py) en praat niet met internet. Draai opnieuw na elke
wijziging in concurrenten_lijst.py.

    pip install openpyxl
    python3 scripts/bouw-concurrenten.py

Schrijft:
    concurrenten/concurrenten.xlsx   de werklijst, ook te openen in Google Sheets
    concurrenten/data.js             wat de tab "Productlijst" in index.html toont

data.js is een script en geen .json, zodat de pagina ook werkt als je hem
lokaal opent (file:// mag geen fetch doen).
"""
import csv, io, json, re, sys
from collections import Counter, defaultdict
from pathlib import Path
from urllib.parse import unquote, urlparse

sys.path.insert(0, str(Path(__file__).resolve().parent))
from concurrenten_lijst import CONCURRENTEN, PADEN, OVERSLAAN_URL  # noqa: E402
from clusters import CLUSTERS, BUITEN_AANBOD, INDELING, INDELING_BRON, ONDERDEEL_SUB  # noqa: E402

assert set(INDELING) == {s for s, _, _, _ in CLUSTERS}, 'elk cluster hoort in INDELING (clusters.py)'

ROOT = Path(__file__).resolve().parent.parent
MAP = ROOT / 'concurrenten'
BRONNEN = MAP / 'bronnen'
# Export uit Keyword Planner ("Historische statistieken van plan"), ongewijzigd
# neergezet. Ontbreekt hij, dan blijven de volumekolommen leeg.
VOLUMES = MAP / 'volumes' / 'keyword-planner-historisch.csv'

# Stap 1-5 zoals afgesproken (22-09-2026). Staat hier én in de tab, zodat de
# Excel op zichzelf te lezen is als hij los rondgaat.
STAPPEN = [
    ('1', 'Productcategorieën', 'Per concurrent de categorie-indeling uit de sitemap.', 'klaar'),
    ('2', 'Producten', 'Per concurrent elke productpagina uit de sitemap.', 'klaar'),
    ('3', 'Sleutelzin per pagina', 'Eerste versie, afgeleid uit de URL: het slot van het adres is meestal het zoekwoord. Nog met de hand te controleren.', 'eerste versie'),
    ('3b', 'Alternatieve zoekwoorden', 'Varianten en synoniemen per sleutelzin. Komt uit de zoekwoordtool van stap 4.', 'open'),
    ('4', 'Zoekvolume uit Keyword Planner', 'De CSV als plan geüpload, "Historische statistieken van plan" teruggezet in de clustertabs. Alleen bereiken (10–100, 100–1K, …): exacte getallen geeft Google alleen als er advertenties lopen.', 'klaar (bereiken)'),
    ('5', 'Top 100 zoekwoorden en apparaten', 'Zoekwoorden die over een case gaan, op volume. Apart: de apparaten waarvoor concurrenten cases maken.', 'eerste versie'),
    ('6', 'Indeling shop en SEO-pagina’s', 'Elk cluster wordt een shopcategorie, filter, optie of route (clusters.py, INDELING).', 'eerste versie'),
    ('7', 'Voorbeeld SEO-pagina', 'Eén categorie uitgewerkt: zoekwoorden, tussenkoppen, subpagina’s.', 'eerste versie'),
]

# Waar de uitkomst te zien is, en wat we aan Clement vragen. Staan bovenaan
# de voorkant van de Sheet, zodat wie hem opent meteen weet waar hij is.
LINKS = [
    ('Productlijst (live)', 'https://casebuilder-voortgangsdocument.netlify.app/#productlijst'),
    ('Productlijst (concept)', 'https://concept--casebuilder-voortgangsdocument.netlify.app/#productlijst'),
]
VRAAG_CLEMENT = ('Klopt deze logica: van de sitemaps van de concurrenten naar categorieën en producten, '
                 'naar zoekwoorden, naar clusters, naar zoekvolume, naar een top 100? En kun je hiermee de '
                 'productcategorieën en subcategorieën voor de nieuwe CaseBuilder-webshop vastleggen?')

SOORTEN = ['categorie', 'product', 'landingspagina', 'branche', 'dienst', 'merk', 'attribuut',
           'tag', 'project', 'blog', 'vacature', 'pagina', 'overig']


def soort_uit_sitemap(bestand):
    """Wat de sitemap zelf over zijn inhoud zegt. WordPress (Yoast, AIOSEO, de
    ingebouwde wp-sitemap) zet het type in de bestandsnaam."""
    b = bestand.lower()
    regels = [('product_cat', 'categorie'), ('product-categor', 'categorie'), ('product_tag', 'tag'),
              ('/pa_', 'attribuut'), ('shipping_class', 'overig'),
              ('product-sitemap', 'product'), ('posts-product', 'product'),
              ('project', 'project'), ('portfolio', 'project'), ('casestudy', 'project'),
              ('vacan', 'vacature'), ('vacature', 'vacature'),
              ('post-sitemap', 'blog'), ('posts-post', 'blog'), ('post_tag', 'blog'),
              ('category', 'blog'), ('page', 'pagina')]
    for sleutel, soort in regels:
        if sleutel in '/' + b:
            return soort
    return 'pagina'


def naam_uit_url(url):
    delen = [d for d in urlparse(url).path.split('/') if d]
    # Sommige shops zetten het product-id achteraan (.../mixer-koffer-x32/6/);
    # dan zegt het stuk ervoor wat het is.
    while len(delen) > 1 and delen[-1].isdigit():
        delen.pop()
    pad = '/'.join(delen)
    laatste = unquote(delen[-1]) if delen else ''
    if not laatste or laatste == 'nl':
        return '(home)'
    return re.sub(r'[-_]+', ' ', laatste).strip()


# Woorden die niets zeggen over wat er gezocht wordt.
STOP = set('voor de het een en met op van in te aan bij of the for with and to nl en de fr '
           'aanbod alle overige overig b x d h bxdxh mm cm '
           # Te algemeen om als zoekterm te tellen, al staan ze overal.
           'set pro model mini series serie compact flex dubbel standaard live full design color kit box '
           'stuks groot klein zwart wit blauw rood black white schwarz '
           'für fuer mit und der die das'.split())
MERK_RUIS = {'dfb', 'aw', 'kiro', 'megacase', 'amptown', 'faes', 'denting', 'reco', 'slf', 'jdb', 'rhino'}


def sleutelzin(naam, slug):
    """Stap 3, eerste versie: het zoekwoord dat in de URL zit.

    Maten eraf (1100 x 480 x 760 mm is geen zoekterm), eigen merknaam eraf
    (een klant zoekt geen 'dfb flightcase trolley'). Modelnummers blijven
    staan: 'djm 900' is juist waar op gezocht wordt."""
    z = naam.lower()
    z = re.sub(r'\b\d+(?:[.,]\d+)?\s*x\s*\d+.*$', '', z)       # maten en alles erna
    z = re.sub(r'\b(b|d|h)\s*x\s*(b|d|h).*$', '', z)
    woorden = [w for w in re.split(r'\s+', z) if w and w not in MERK_RUIS and w != slug]
    while woorden and woorden[-1] in STOP:
        woorden.pop()
    return ' '.join(woorden).strip()


def enkelvoud(w):
    for eind, vervang in (('kisten', 'kist'), ('koffers', 'koffer'), ('cases', 'case'), ('racks', 'rack'),
                          ('lades', 'lade'), ('trolleys', 'trolley'), ('bakken', 'bak')):
        if w.endswith(eind):
            return w[: -len(eind)] + vervang
    return w


def termen(zin):
    """Losse woorden en woordparen uit een sleutelzin, genormaliseerd, voor de
    telling 'hoeveel concurrenten voeren dit'. Getallen alleen tellen niet."""
    ws = [enkelvoud(w) for w in re.findall(r'[a-zà-ÿ0-9]+', zin.lower()) if w not in STOP]
    ws = [('19 inch' if w == '19' else w) for w in ws if w != 'inch']
    ws = [w for w in ws if not re.fullmatch(r'\d+(mm|cm|kg)', w)]   # 100mm is een maat, geen zoekterm
    uit = {w for w in ws if not w.isdigit() and len(w) > 2}
    uit |= {f'{a} {b}' for a, b in zip(ws, ws[1:]) if not (a.isdigit() and b.isdigit())}
    return uit


def urls_uit_xml(tekst):
    for blok in re.findall(r'<url>(.*?)</url>', tekst, re.S):
        loc = re.search(r'<loc>\s*(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?\s*</loc>', blok, re.S)
        mod = re.search(r'<lastmod>\s*(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?\s*</lastmod>', blok, re.S)
        if loc:
            yield loc.group(1).strip(), (mod.group(1).strip()[:10] if mod else '')


def urls_uit_homepage(tekst, site):
    """Alleen links naar de eigen site, met tekst. Wat geen pagina is (feeds,
    afbeeldingen, api) valt af."""
    host = urlparse(site).netloc.replace('www.', '')
    for href, inhoud in re.findall(r'<a\b[^>]*href="([^"#]+)"[^>]*>(.*?)</a>', tekst, re.S):
        tekstje = re.sub(r'<[^>]+>|\s+', ' ', inhoud).strip()
        if href.startswith('/'):
            href = site.rstrip('/') + href
        if host not in href or not tekstje:
            continue
        if re.search(r'wp-content|wp-json|rest_route|feed|xmlrpc|/cart|/my-account|tel:|mailto:', href):
            continue
        yield href, tekstje


def categorie_van_product(url):
    """Waar de URL het verraadt: /producten/19-racks/x/ → 19 racks."""
    delen = [d for d in urlparse(url).path.split('/') if d]
    if len(delen) >= 3 and delen[-2] not in ('product', 'nl'):
        return re.sub(r'[-_]+', ' ', unquote(delen[-2]))
    return ''


def categorie_pad(url):
    delen = [d for d in urlparse(url).path.split('/') if d]
    for i, d in enumerate(delen):
        if d.startswith(('product-categor', 'product-category', 'producten', 'standaard-koffers',
                         'maatwerk-', 'cleanroom-', 'toepassingen', 'merken', 'interieur', 'materiaal',
                         'eigenschappen')):
            rest = delen[i + 1:] if d.startswith(('product-categor', 'product-category')) else delen[i:]
            return ' › '.join(re.sub(r'[-_]+', ' ', unquote(r)) for r in rest)
    return ''


# De kolommen van een export uit Google Ads Keyword Planner, in dezelfde
# volgorde, zodat je in stap 4 de export er zo overheen plakt. De koppen zijn
# vertaald: de Sheet gaat naar de klant. De export zelf heeft Engelse koppen
# ('Avg. monthly searches'); lees_volumes() leest die.
PLANNER = ['Zoekwoord', 'Gem. zoekopdrachten per maand', 'Bod bovenaan pagina (laag)', 'Bod bovenaan pagina (hoog)',
           'Concurrentie', 'Wijziging 3 maanden', 'Wijziging jaar', 'Concurrentie (index)']
ZOEKBAAR = ('categorie', 'landingspagina', 'product')
BRONVOLGORDE = {'zaadterm': 0, 'categorie': 1, 'landingspagina': 2, 'product': 3}


# Wat een zoekwoord over een case laat gaan. Staat een van deze woorden erin —
# ook middenin, zoals in 'kabelkist' of 'mixercase' — dan zoekt iemand een
# case. 'bak', 'box' en 'container' stonden hier ook, maar die haalden het
# volume op van opbergbakken en verhuisdozen.
CASEWOORD = re.compile(r'case|koffer|kist|rack|trunk|trolley|verpakking|behuizing|hoes')
ONZIN = re.compile(r'kopie|testbericht|\btest\b|geen categorie|uncategorized|^adding$|3d product|^overig|'
                   r'^aanbod$|^branches|product category|'
                   # Menukoppen van Koffers en Kisten, geen categorie.
                   r'^(eigenschappen|materiaal|merken|toepassingen)$')
# Tikfouten van de concurrenten; anders wordt elke verschrijving een eigen
# zoekwoord.
TIKFOUT = {'flichtcase': 'flightcase', 'fightcase': 'flightcase', 'flighcase': 'flightcase',
           'filghtcase': 'flightcase', 'trolly': 'trolley', 'stduio': 'studio', 'kunstof': 'kunststof',
           'allenheat': 'allen heath', 'sindle': 'single', 'profilier': 'profiler',
           'tecnologies': 'technologies'}
# Codes uit de productnamen van Amptown en Megacase: uitvoeringsletters en
# aantallen. Een klant zoekt niet op 'case 4x cameo matrix panel 3 ww wheel'.
CODE = re.compile(r'^(rg|kk|pb|fa|eer|eeb|bk|rsh|col|\d+in1|\d+tlg|\d+x)$')
MAAT = re.compile(r'^\d+(mm|cm|kg|kw|w|l)$')
DUITSE_MAAT = {'breite', 'hoehe', 'höhe', 'tiefe', 'innenmassen'}


def schoon(zin):
    """Van sleutelzin naar kale woorden: tikfouten hersteld, maten en
    uitvoeringscodes eruit."""
    z = re.sub(r"[^a-z0-9àáäâèéëêïíîöóôüúûç&+ -]", ' ', zin.lower())
    z = re.sub(r'\b\d+(?:[.,]\d+)?\s*x\s*\d+.*$', '', z)        # 1100 x 480 x 760 en alles erna
    z = re.sub(r'\b(b|d|h|t)\s*x\s*(b|d|h|t).*$', '', z)
    woorden = []
    for w in re.split(r'\s+', z):
        w = TIKFOUT.get(w, w)
        if not w or CODE.match(w) or MAAT.match(w) or w in DUITSE_MAAT:
            continue
        woorden.extend(w.split())
    return re.sub(r'\s+', ' ', ' '.join(woorden)).strip(' -')


def zoekwoord(zin, taal, merken, soort='product'):
    """Van sleutelzin naar een zoekwoord dat Keyword Planner accepteert en dat
    over een case gaat. None = hoort niet in de lijst, met de reden erbij.

    Twee regels die eerder misgingen:
    - Een Duitstalige bron levert geen Nederlands zoekwoord. Megacase en
      Amptown zijn samen meer dan de helft van alle rijen; daar houden we
      alleen het apparaat uit over (merk + model), niet de zin.
    - 'flightcase' ervoor plakken mag alleen als er een apparaat genoemd wordt.
      Anders krijg je onzin als 'flightcase gasveer 50n'.
    """
    z = schoon(zin)
    if len(z) < 3 or z.replace(' ', '').isdigit() or ONZIN.search(z):
        return None, 'onbruikbaar'
    # Behalve als Keyword Planner er zelf volume voor meet ('skb roto rack'):
    # gemeten vraag wint van de regel.
    if is_casemerk_artikel(z, soort) and planner_sleutel(z) not in VOL:
        return None, 'casemerk-artikel'
    app, _, _ = apparaat_uit(z, merken)
    if taal != 'nl':
        if not app:
            return None, 'duitse bron'
        z = app                      # 'truhencase fuer medion p18077' → 'medion p18077'
    if not CASEWOORD.search(z) and app:
        # Een apparaat zonder casewoord: 'genz benz 410t' wordt 'flightcase
        # genz benz 410t', anders meet je het volume van de speaker. Zonder
        # apparaat blijft de zin staan zoals hij is ('popnagel' is een echt
        # zoekwoord); zoekintentie() markeert hem dan als algemeen.
        z = 'flightcase ' + z
    if len(z) > 80 or len(z.split()) > 10:   # grenzen van Google Ads
        return None, 'te lang'
    return z, None


# Keyword Planner zonder lopende advertenties geeft een bereik, en schrijft in
# de export het midden daarvan. Dat midden is geen meting; toon het bereik.
BEREIK = {0: '0', 50: '10–100', 500: '100–1K', 5000: '1K–10K', 50000: '10K–100K', 500000: '100K–1M'}


def lees_verzonden():
    """Welke zoekwoorden al naar Keyword Planner zijn gegaan. Staat er een
    zoekwoord wel in maar ontbreekt het in de export, dan heeft Google het
    samengevoegd met een andere schrijfwijze; staat het er niet in, dan is het
    later toegevoegd en moet het mee in de volgende ronde."""
    uit = set()
    for f in sorted((MAP / 'volumes').glob('verzonden-*.csv')):
        for regel in f.read_text(encoding='utf-8').splitlines()[1:]:
            deel = regel.split(',')
            if len(deel) > 2:
                uit.add(planner_sleutel(deel[2]))
    return uit


def lees_volumes():
    """De Planner-export: UTF-16, tabs, twee regels uitleg boven de kop, en
    een paar totaalregels zonder zoekwoord."""
    if not VOLUMES.exists():
        return {}
    tekst = VOLUMES.read_bytes().decode('utf-16')
    regels = tekst.splitlines()
    start = next(i for i, r in enumerate(regels) if r.startswith('Keyword\t'))
    uit = {}
    for r in csv.DictReader(io.StringIO('\n'.join(regels[start:])), delimiter='\t'):
        if r['Keyword']:
            uit[planner_sleutel(r['Keyword'])] = r
    return uit


def planner_sleutel(kw):
    """Zoals Keyword Planner een zoekwoord terugschrijft: kleine letters, en
    losse letters aan elkaar ('19 inch rack 1 t m 7 he' → '... 1 tm 7 he')."""
    kw = kw.strip().lower()
    vorige = None
    while vorige != kw:
        vorige, kw = kw, re.sub(r'(?<![a-z0-9])([a-z]) ([a-z])(?![a-z0-9])', r'\1\2', kw)
    return kw


def getal(x):
    try:
        return float(x.replace('.', '').replace(',', '.')) if isinstance(x, str) and ',' in x else float(x)
    except (TypeError, ValueError):
        return None


def lees_relevantie():
    """concurrenten/relevantie.csv: met de hand nagelopen zoekwoorden. Een
    regel is 'zoekwoord,j/n,notitie'. Een regel kan niet zien dat 'server rack'
    over serverkasten gaat en 'aluminium koffer' vaak over reiskoffers; een
    mens wel. Wat hierin staat wint van de regel hieronder."""
    f = MAP / 'relevantie.csv'
    uit = {}
    if not f.exists():
        return uit
    for regel in csv.reader(io.StringIO(f.read_text(encoding='utf-8'))):
        # Alleen ingevulde regels tellen: leeg = nog niet nagekeken, dan
        # beslist de regel hieronder.
        if len(regel) >= 2 and regel[0] and regel[0] != 'zoekwoord' and regel[1].strip():
            uit[regel[0].strip().lower()] = regel[1].strip().lower().startswith('j')
    return uit


def zoekintentie(kw):
    """'algemeen' = zegt niets over een case, en haalt dus volume op van mensen
    die iets anders zoeken ('interieur', 'gereedschap', 'pallets'). Gekeken
    wordt of er een casewoord in een van de woorden zit: 'kabelkist' en
    'mixercase' tellen dus wel mee, 'plastic bakken' niet."""
    if kw in RELEVANTIE:
        return 'case-specifiek' if RELEVANTIE[kw] else 'algemeen'
    return 'case-specifiek' if CASEWOORD.search(kw) else 'algemeen'


def cluster_lijsten(rijen, merken):
    """Per cluster de sleutelzinnen, elk één keer: zaadtermen, dan wat de
    concurrenten als categorie of trefwoordpagina hebben, dan producten. Binnen
    die groepen: bij meer concurrenten eerst. Nederlands vóór Duits."""
    # Eerst alle zoekwoorden, elk één keer, in de spelling waarin ze naar
    # Keyword Planner gaan.
    alle, weg = {}, Counter()
    for slug, naam, _, zaad in CLUSTERS:
        for z in zaad:
            alle[z] = {'kw': z, 'zinnen': set(), 'bron': 'zaadterm', 'wie': set(), 'url': '', 'paden': set(), 'cl': slug}
    for r in rijen:
        if r['soort'] not in ZOEKBAAR or not r['zin']:
            continue
        kw, reden = zoekwoord(r['zin'], r['taal'], merken, r['soort'])
        if not kw:
            weg[reden] += 1
            continue
        e = alle.setdefault(kw, {'kw': kw, 'zinnen': set(), 'bron': r['soort'], 'wie': set(), 'url': r['url'], 'paden': set()})
        e['wie'].add(r['c'])
        e['zinnen'].add(r['zin'])
        if r['pad']:
            e['paden'].add(r['pad'].lower())
        if e['bron'] != 'zaadterm' and BRONVOLGORDE[r['soort']] < BRONVOLGORDE[e['bron']]:
            e['bron'], e['url'] = r['soort'], r['url']

    # Dan per zoekwoord één cluster: op de eigen woorden, anders op het pad bij
    # de concurrent, anders 'algemeen' of 'zonder'.
    regels = [(slug, re.compile(rx)) for slug, _, rx, _ in CLUSTERS]
    specifiek = [x for x in regels if x[0] != 'algemeen']
    algemeen = dict(regels)['algemeen']
    def kies(e):
        # Eerst de woorden van het zoekwoord zelf, dan pas het categoriepad bij
        # de concurrent. Andersom belandde 'koffer' in 'flightcase op maat',
        # omdat het bij een concurrent onder 'maatwerk verpakkingen' hing.
        if 'cl' in e:
            return e['cl']
        for slug, rx in specifiek:
            if rx.search(e['kw']):
                return slug
        if algemeen.search(e['kw']):
            return 'algemeen'
        for slug, rx in specifiek:
            if any(rx.search(p) for p in e['paden']):
                return slug
        return 'zonder'

    for kw in [k for k in alle if re.search(r' \d$', k)]:
        basis = kw.rsplit(' ', 1)[0]
        if basis in alle:
            alle[basis]['wie'] |= alle[kw]['wie']
            alle[basis]['zinnen'] |= alle[kw]['zinnen']
            del alle[kw]

    uit = {slug: [] for slug, _, _, _ in CLUSTERS}
    uit['zonder'] = []
    for e in alle.values():
        e['vol'] = VOL.get(planner_sleutel(e['kw']))
        e['n'] = getal(e['vol']['Avg. monthly searches']) if e['vol'] else None
        e['intentie'] = zoekintentie(e['kw'])
        e['cl'] = kies(e)
        uit[e['cl']].append(e)
    for slug in uit:
        # Met volume eerst, hoogste bovenaan; daarbinnen zaadtermen en categorieën vóór producten.
        uit[slug].sort(key=lambda e: (-(e['n'] or -1), BRONVOLGORDE[e['bron']], -len(e['wie']), e['kw']))
    return uit, weg


def merken_uit_data(rijen):
    """De merknamen die de concurrenten zelf als categorie voeren: Amptown
    deelt in op merk (ton › lautsprecher › l acoustics), Koffers en Kisten en
    DFB hebben een tak 'merken'. Die lijst gebruiken we om te zien of een
    zoekwoord over een apparaat gaat."""
    uit = set()
    for r in rijen:
        if r['soort'] != 'categorie':
            continue
        pad = r['pad'].lower()
        # Alleen echte merktakken: /merken/... en het derde niveau bij Amptown
        # (ton › lautsprecher › l acoustics). Niet elke diepe categorie: bij
        # Koffers en Kisten is 'toepassingen › muziekkoffers › gitaarkoffers'
        # een soort, geen merk.
        merktak = pad.startswith('merken') or (r['c'] == 'amptown' and pad.count('›') >= 2)
        if not merktak:
            continue
        naam = pad.split('›')[-1].strip()
        if naam and not naam.isdigit() and len(naam) > 2:
            uit.add(naam)
    return uit | MERKEN_EXTRA


# Merken die geen van de concurrenten als categorie voert, maar die wel in
# productnamen staan. Zonder deze lijst missen de klassiekers: de X32, de
# CDJ-3000, de DJM-900.
MERKEN_EXTRA = set(
    'behringer mackie studiomaster tascam avolites obsidian xone midas digico avid soundcraft yamaha waves '
    'pioneer alphatheta denon rane traktor reloop numark eurolite stairville adj briteq ignition futurelight '
    'litecraft antari sgm selecon martin chauvet cameo showtec glp elation robe ayrton arri astera varytec '
    'ampeg orange blackstar peavey markbass hartke engl boss moog sequential prophet arturia novation kawai '
    'ketron viscount leslie gretsch paiste nord korg roland fender marshall gibson takamine steinway '
    'blackmagic atem tricaster manfrotto cartoni epson optoma sony samsung philips lg bose sennheiser shure '
    'rcf jbl nexo meyer eaw fohhn turbosound alcons fbt qsc lodestar chainmaster movecat liftket motorola '
    'medion apple ipad macbook dell hp lenovo'.split()
) | {'allen heath', 'l acoustics', 'db technologies', 'clay paky', 'vari lite', 'ld systems', 'the box',
     'marshall electronics'}
MODEL = re.compile(r'[a-z]*\d[a-z0-9-]*')
# Merken die zelf koffers en cases maken. Een 'skb 3i' is geen apparaat waar
# een case omheen moet, maar een case die een concurrent doorverkoopt.
CASEMERKEN = {'skb', 'defender', 'viking', 'peli', 'pelican', 'nanuk', 'explorer', 'hprc', 'max', 'rako',
              'husk', 'maxado', 'shell', 'shell case', 'mio', 'zarges', 'amptown', 'megacase', 'gator', 'thon'}
# Een artikel van zo'n merk: het merk vooraan en een typenummer erin ('skb
# iseries 3i 1309 6 vervangend plukschuim', 'hprc2500', 'shell case model 311
# leeg', 'skb gevormde tenor saxofoon koffer'). Dat is een koffer die een concurrent doorverkoopt, geen zoekwoord
# waarop CaseBuilder gevonden wil worden; alleen Koffers en Kisten levert er
# al honderden. Het merk zelf ('skb', 'peli case', 'nanuk kunststof koffers')
# staat als categorie bij de concurrent en blijft staan.
CASEMERK_VOORAAN = re.compile(r'^(?:flightcase |case |koffer )?(?:'
                              + '|'.join(sorted((re.escape(m) for m in CASEMERKEN), key=len, reverse=True))
                              + r')(?:\b|(?=\d))')


def is_casemerk_artikel(z, soort):
    """Een productpagina met het merk vooraan is altijd een artikel; een
    categorie alleen als er een typenummer in staat."""
    return bool(CASEMERK_VOORAAN.match(z)) and (soort == 'product' or any(c.isdigit() for c in z))


# Woorden die na het merk het model afsluiten: daarna volgt de uitvoering,
# niet het apparaat.
MODEL_STOP = re.compile(r'case|koffer|kist|rack|trunk|trolley|flight|wheel|wielen|met|voor|zwart|black|'
                        r'\d+in1|\d+x|\d+(kg|kw|w|mm|cm|l)$')


def apparaat_uit(zin, merken):
    """Welk apparaat noemt deze productnaam? Een merk uit de lijst, gevolgd
    door de modelaanduiding: de woorden erna tot aan een uitvoeringswoord, aan
    elkaar geschreven. 'allen heath qu 16' wordt 'allen heath qu16' en niet
    'allen heath 16'; 'taperack yamaha dm7 compact doghouse' wordt
    'yamaha dm7'. Zo tellen dezelfde apparaten ook echt samen."""
    w = zin.lower().split()
    for i, woord in enumerate(w):
        for merk in (' '.join(w[i:i + 2]), woord):
            if merk not in merken:
                continue
            rest = w[i + (2 if ' ' in merk else 1):]
            # Hooguit twee woorden: het model zelf ('dm7'), of een letterdeel
            # met het nummer erachter ('qu 16', 'quantum 112'). Stopt bij het
            # eerste woord mét cijfer, anders plakt de uitvoering eraan vast
            # ('dm7 compact' werd 'dm7compact').
            model = []
            for t in rest[:2]:
                if MODEL_STOP.search(t) or not re.fullmatch(r'[a-z0-9-]+', t):
                    break
                model.append(t)
                if any(c.isdigit() for c in t):
                    break
            if model and not any(c.isdigit() for c in model[-1]):
                model = []
            code = ''.join(model).strip('-')
            if code and any(c.isdigit() for c in code) and len(code) > 1:
                return merk + ' ' + code, merk, code
    return None, None, None


def is_apparaat(kw, merken):
    """Gaat dit zoekwoord over één apparaat? Dan staat er een modelnummer in
    (x32, 12u, 900) of een merknaam. 'trolley' en 'accessory case' zijn
    casetypen en horen in de clusterlijst, niet in de productenlijst."""
    woorden = kw.split()
    if any(re.fullmatch(r'(?=.*\d)[a-z0-9-]{2,}', w) for w in woorden):
        return True
    return any(m in kw for m in merken)


def top100_producten(rijen, merken):
    """De apparaten waar de concurrenten cases voor maken, niet hun
    productnamen: die schrijft iedereen anders op. Gesorteerd op hoeveel
    bedrijven er een case voor voeren — dat is het bewijs van vraag zolang de
    zoekvolumes op apparaatniveau ontbreken. Faes en zijn webshop tellen als
    één bedrijf."""
    groep = {c['slug']: c.get('groep', c['slug']) for c in CONCURRENTEN}
    per = {}
    for r in rijen:
        if r['soort'] != 'product' or not r['zin']:
            continue
        app, merk, model = apparaat_uit(r['zin'], merken)
        if not app:
            continue
        e = per.setdefault(app, {'app': app, 'merk': merk, 'model': model, 'wie': set(), 'bedrijven': set(),
                                 'paginas': 0, 'url': r['url'], 'voorbeeld': r['naam']})
        e['wie'].add(r['c'])
        e['bedrijven'].add(groep[r['c']])
        e['paginas'] += 1
    # Onder welke categorie hoort het apparaat? Dezelfde regels als de
    # clusters, op merk en model: 'midas m32' valt onder mixercases.
    regels = [(slug, re.compile(rx)) for slug, _, rx, _ in CLUSTERS if INDELING[slug]['rol'] == 'categorie']
    for e in per.values():
        e['cl'] = next((slug for slug, rx in regels if rx.search(e['app'])), '')
        e['soort'] = 'casemodel' if e['merk'].split()[0] in CASEMERKEN else 'apparaat'
        e['zoekwoord'] = ('koffer ' if e['soort'] == 'casemodel' else 'flightcase ') + e['app']
        e['vol'] = VOL.get(planner_sleutel(e['zoekwoord'])) or VOL.get(planner_sleutel(e['app']))
        e['n'] = getal(e['vol']['Avg. monthly searches']) if e['vol'] else None
    return sorted(per.values(), key=lambda e: (e['soort'] != 'apparaat', -len(e['bedrijven']), -(e['n'] or 0),
                                               -e['paginas'], e['app']))[:100]


def laag(e):
    """De lijst is geen rangorde van 1 tot 100: 74 zoekwoorden delen hetzelfde
    bereik. Een laag zegt wat er wel te zeggen valt."""
    bereik = BEREIK.get(int(e['n']), str(int(e['n'])))
    if e['n'] and e['n'] <= 50 and len(e['wie']) >= 2:
        return bereik + ' · bij 2+ concurrenten'
    return bereik


def onderdeel_sub(lijst):
    """De zoekwoorden van het cluster onderdelen, verdeeld over de
    subcategorieën van de shopafdeling (ONDERDEEL_SUB in clusters.py). Per
    subcategorie: naam, aantal zoekwoorden, en de sterkste vijf."""
    regels = [(naam, re.compile(rx)) for naam, rx in ONDERDEEL_SUB]
    per = defaultdict(list)
    for e in lijst:
        naam = next((n for n, rx in regels if rx.search(e['kw'])), 'Overig')
        per[naam].append(e)
    uit = []
    for naam, _ in ONDERDEEL_SUB + [('Overig', '')]:
        l = sorted(per.get(naam, []), key=lambda e: (-(e['n'] or 0), -len(e['wie']), e['kw']))
        if l:
            uit.append([naam, len(l), [[e['kw'], e['n']] for e in l[:5]]])
    return uit


def top100(clusters):
    """Stap 5: case-specifiek, met volume. Bij gelijk bereik: meer
    concurrenten eerst (bewezen aanbod), dan het hoogste bod (commerciële
    waarde)."""
    naam = {s: n for s, n, _, _ in CLUSTERS}
    naam['zonder'] = 'zonder cluster'
    kand = [(e, slug) for slug, l in clusters.items() for e in l
            if e['n'] and e['intentie'] == 'case-specifiek' and slug not in BUITEN_AANBOD]
    kand.sort(key=lambda x: (-x[0]['n'], -len(x[0]['wie']), -(getal(x[0]['vol']['Top of page bid (high range)']) or 0), x[0]['kw']))
    return [(e, naam[slug]) for e, slug in kand[:100]]


def naam_van_c(slug):
    return next(c['naam'] for c in CONCURRENTEN if c['slug'] == slug)


def main():
    logboek = json.loads((BRONNEN / 'logboek.json').read_text())
    rijen, tellingen = [], {}
    for c in CONCURRENTEN:
        slug = c['slug']
        regels = [(re.compile(p), s) for p, s in PADEN.get(slug, [])]
        weg = re.compile(OVERSLAAN_URL[slug]) if slug in OVERSLAAN_URL else None
        gezien = set()
        for log in logboek['concurrenten'].get(slug, []):
            if not log.get('bestand') or log.get('soort') == 'index':
                continue
            tekst = (BRONNEN / log['bestand']).read_text('utf-8', 'replace')
            bron = log['url']
            if log['soort'] == 'homepage':
                paren = [(u, '', t) for u, t in urls_uit_homepage(tekst, c['site'])]
            else:
                paren = [(u, m, None) for u, m in urls_uit_xml(tekst)]
            for url, mod, linktekst in paren:
                if url in gezien or (weg and weg.search(url)):
                    continue
                soort = None
                for rx, s in regels:
                    if rx.search(url):
                        soort = s
                        break
                if soort is None:
                    if log['soort'] == 'homepage':
                        soort = 'categorie' if re.search(r'product-categor', url) else 'pagina'
                        if slug != 'rhinocase' and soort == 'pagina':
                            continue  # alleen de categorieën uit het menu, de rest staat al in de sitemap
                    else:
                        soort = soort_uit_sitemap(log['bestand'])
                gezien.add(url)
                naam = linktekst or naam_uit_url(url)
                rijen.append({
                    'c': slug, 'soort': soort, 'naam': naam, 'taal': c.get('taal', 'nl'),
                    'pad': categorie_pad(url) if soort == 'categorie' else categorie_van_product(url) if soort == 'product' else '',
                    'zin': sleutelzin(naam, slug) if soort in ('categorie', 'product', 'landingspagina') else '',
                    'url': url, 'mod': mod, 'bron': bron,
                })
        tellingen[slug] = Counter(r['soort'] for r in rijen if r['c'] == slug)

    # Stap 5, voorloper: welke termen komen bij de meeste concurrenten terug.
    wie = defaultdict(set)
    hoeveel = Counter()
    for r in rijen:
        if r['soort'] in ('categorie', 'product', 'landingspagina'):
            for t in termen(r['zin']):
                wie[t].add(r['c'])
                hoeveel[t] += 1
    naam_van = {c['slug']: c['naam'] for c in CONCURRENTEN}
    # Een los woord dat alleen voorkomt als deel van een paar ('heavy' in
    # 'heavy duty') is dubbel geteld; het paar is de zoekterm.
    for t in [t for t in wie if ' ' not in t]:
        if any(t in p.split() and wie[p] == wie[t] for p in wie if ' ' in p):
            del wie[t]
    overlap = sorted(((t, len(s), hoeveel[t], sorted(naam_van[x] for x in s)) for t, s in wie.items() if len(s) >= 2),
                     key=lambda x: (-x[1], -x[2], x[0]))[:300]

    global VOL, VERZONDEN, RELEVANTIE
    VOL = lees_volumes()
    VERZONDEN = lees_verzonden()
    RELEVANTIE = lees_relevantie()
    # De merkenlijst eerst: zoekwoord() heeft hem nodig om te zien of een
    # Duitstalige of casewoordloze zin toch een apparaat noemt.
    merken = merken_uit_data(rijen)
    clusters, weg = cluster_lijsten(rijen, merken)
    # Terug naar de rijen: het cluster van hun zoekwoord, of waarom ze er niet
    # in zitten. Eén bron van waarheid voor de lijst, de Sheet en de clustertabs.
    per_kw = {e['kw']: e for l in clusters.values() for e in l}
    for r in rijen:
        r['cluster'], r['vol'], r['nwie'], r['intentie'] = '', None, 0, ''
        if r['soort'] in ZOEKBAAR and r['zin']:
            kw, reden = zoekwoord(r['zin'], r['taal'], merken, r['soort'])
            e = per_kw.get(kw) if kw else None
            r['cluster'] = e['cl'] if e else ('weg:' + reden if reden else '')
            if e:
                r['vol'], r['nwie'], r['intentie'] = e['n'], len(e['wie']), e['intentie']
    # De lijsten op zoekvolume van hun zoekwoord, dan hoeveel concurrenten het
    # voeren, dan op naam. Zo staat bovenaan wat ertoe doet, in tab en Sheet.
    rijen.sort(key=lambda r: (-(r['vol'] or -1), -r['nwie'], naam_van_c(r['c']), r['naam']))
    top = top100(clusters)
    top_prod = top100_producten(rijen, merken)
    gevonden = sum(1 for l in clusters.values() for e in l if e['vol'])
    print(f'volumes: {len(VOL)} in export, {gevonden} gekoppeld, {sum(1 for l in clusters.values() for e in l if e["n"])} met volume, top100: {len(top)}')
    n_csv = schrijf_csv(clusters)
    schrijf_csv_apparaten(top_prod)
    schrijf_data(rijen, tellingen, overlap, logboek, n_csv, clusters, top, top_prod)
    schrijf_excel(rijen, tellingen, overlap, logboek, clusters, top, top_prod)
    for slug, naam, _, _ in CLUSTERS:
        wie = set().union(*(e['wie'] for e in clusters[slug]))
        print(f'  cluster {naam:<22} {len(clusters[slug]):>5} zinnen · {len(wie):>2} concurrenten')
    print('  zonder cluster:', len(clusters['zonder']), 'zoekwoorden ·', 'weggelaten:', dict(weg))
    tot = Counter(r['soort'] for r in rijen)
    print('categorieën', tot['categorie'], '· producten', tot['product'], '· landingspagina', tot['landingspagina'],
          '· termen bij 2+ concurrenten', len(overlap))


def schrijf_csv(clusters):
    """De lijst voor Keyword Planner, als plan-upload ("Een bestand uploaden"):
    die eist een kopregel met de kolommen van Googles zoekwoordtemplate. Het
    cluster wordt de advertentiegroep, zodat de resultaten in het plan al per
    cluster staan. Elk zoekwoord één keer, zelfde spelling als kolom Keyword
    in de clustertabs, zodat de volumes er één op één op terug te zetten zijn."""
    naam = {s: n for s, n, _, _ in CLUSTERS}
    naam['zonder'] = 'zonder cluster'
    gezien, regels = set(), ['Campaign,Ad group,Keyword,Criterion Type']
    for slug, lijst in clusters.items():
        for e in lijst:
            if e['kw'] not in gezien:
                gezien.add(e['kw'])
                regels.append(f'CaseBuilder SEO-onderzoek,cluster {naam[slug]},{e["kw"]},Exact')
    assert all(',' not in k for k in gezien), 'komma in zoekwoord breekt de CSV'
    assert len(gezien) <= 10000, 'Keyword Planner neemt hooguit 10.000 zoekwoorden per keer'
    (MAP / 'keywords-keyword-planner.csv').write_text('\n'.join(regels) + '\n', encoding='utf-8')
    print('csv:', len(gezien), 'zoekwoorden')
    return len(gezien)


def schrijf_csv_apparaten(top_prod):
    """Aparte lijst voor de volgende ronde in Keyword Planner: één zoekwoord
    per apparaat ('flightcase yamaha dm7'). Die stonden niet in de eerste
    ronde, want de concurrenten schrijven hun producten anders op."""
    regels = ['Campaign,Ad group,Keyword,Criterion Type']
    for e in top_prod:
        regels.append(f'CaseBuilder SEO-onderzoek,apparaten,{e["zoekwoord"]},Exact')
    (MAP / 'keywords-apparaten.csv').write_text('\n'.join(regels) + '\n', encoding='utf-8')
    print('csv apparaten:', len(top_prod))


def schrijf_data(rijen, tellingen, overlap, logboek, n_csv, clusters, top, top_prod):
    concurrenten = []
    for c in CONCURRENTEN:
        concurrenten.append({
            'slug': c['slug'], 'naam': c['naam'], 'site': c['site'], 'rol': c.get('rol', ''), 'taal': c.get('taal', 'nl'),
            'vondst': c.get('vondst', ''), 'genoemd': [{'titel': t, 'url': u} for t, u in c['genoemd']],
            'tel': dict(tellingen[c['slug']]),
            'bronnen': [{'url': l['url'], 'status': l['status'], 'urls': l.get('urls', 0), 'soort': l.get('soort', ''),
                         'bestand': l.get('bestand')} for l in logboek['concurrenten'].get(c['slug'], [])],
        })
    # Compacte rijen: kolomnamen één keer, dan arrays. Scheelt de helft.
    kol = ['c', 'soort', 'naam', 'pad', 'zin', 'url', 'mod', 'cluster', 'vol', 'intentie']
    data = {
        'opgehaald': logboek['opgehaald'], 'stappen': STAPPEN, 'concurrenten': concurrenten,
        'clusters': [{'slug': s, 'naam': n, 'zaad': z, 'buiten': BUITEN_AANBOD.get(s, '')}
                     for s, n, _, z in CLUSTERS], 'csv': n_csv,
        # Dezelfde opgeschoonde zoekwoorden als in de CSV en de clustertabs,
        # zodat de tab dezelfde aantallen toont als de Sheet.
        # Per zoekwoord: [zoekwoord, volume (midden bereik), concurrentie, bod laag,
        # bod hoog, zoekintentie, aantal concurrenten]. Al gesorteerd op volume.
        'clusterlijst': {k: [[e['kw'], e['n'], e['vol']['Competition'] if e['vol'] else '',
                              getal(e['vol']['Top of page bid (low range)']) if e['vol'] else None,
                              getal(e['vol']['Top of page bid (high range)']) if e['vol'] else None,
                              e['intentie'], len(e['wie'])] for e in l] for k, l in clusters.items()},
        'topprod': [[e['app'], e['n'], len(e['bedrijven']), sorted(e['wie']), e['paginas'], e['zoekwoord'], e['url'],
                     e['soort'], e['merk'], e['cl']]
                    for e in top_prod],
        'indeling': INDELING, 'indelingbron': {'titel': INDELING_BRON[0], 'url': INDELING_BRON[1]},
        'onderdeelsub': onderdeel_sub(clusters['onderdelen']),
        'top': [[e['kw'], e['n'], cl, e['vol']['Competition'], getal(e['vol']['Top of page bid (low range)']),
                 getal(e['vol']['Top of page bid (high range)']), len(e['wie']),
                 e['vol']['Three month change'], e['vol']['YoY change']] for e, cl in top],
        'clusterwie': {k: sorted(set().union(*(e['wie'] for e in l))) for k, l in clusters.items()},
        'kolommen': kol, 'rijen': [[r[k] for k in kol] for r in rijen],
        'overlap': overlap,
    }
    js = ('// Gegenereerd door scripts/bouw-concurrenten.py — niet met de hand bewerken.\n'
          'window.CONCURRENTEN = ' + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ';\n')
    (MAP / 'data.js').write_text(js)


def schrijf_excel(rijen, tellingen, overlap, logboek, clusters, top, top_prod):
    from openpyxl import Workbook
    from openpyxl.styles import Font, PatternFill, Alignment
    from openpyxl.utils import get_column_letter

    naam_van = {c['slug']: c['naam'] for c in CONCURRENTEN}
    wb = Workbook()
    kop = Font(bold=True, color='FFFFFF')
    kopvlak = PatternFill('solid', fgColor='0B2A45')

    def blad(titel, koppen, data, breedtes, eerste=False):
        ws = wb.active if eerste else wb.create_sheet()
        ws.title = titel
        ws.append(koppen)
        for cel in ws[1]:
            cel.font, cel.fill = kop, kopvlak
        for rij in data:
            ws.append(rij)
        for i, b in enumerate(breedtes, 1):
            ws.column_dimensions[get_column_letter(i)].width = b
        ws.freeze_panes = 'A2'
        if data:
            ws.auto_filter.ref = ws.dimensions
        # Geen hyperlink-opmaak: Google Sheets maakt van een URL zelf een link,
        # en de opmaak verdubbelt het bestand bij 3000 rijen.
        return ws

    # 1 · De voorkant: stappenplan en per concurrent de tellingen.
    ws = blad('claude pre-onderzoek', ['Stap', 'Wat', 'Toelichting', 'Stand'],
              [list(s) for s in STAPPEN], [6, 32, 90, 16], eerste=True)
    for rij in ws.iter_rows(min_row=2):
        rij[2].alignment = Alignment(wrap_text=True, vertical='top')
    # Bovenaan: waar het staat en de open vraag. Ingevoegd boven de stappen.
    boven = [['SEO-onderzoek productenlijst · claude pre-onderzoek']] + [[naam, url] for naam, url in LINKS] + \
            [[], ['Vraag aan Clement', VRAAG_CLEMENT], []]
    ws.insert_rows(1, len(boven))
    for i, rij in enumerate(boven, 1):
        for j, waarde in enumerate(rij, 1):
            ws.cell(i, j, waarde)
    ws.cell(1, 1).font = Font(bold=True, size=14)
    rij_vraag = 1 + len(LINKS) + 2
    ws.cell(rij_vraag, 1).font = Font(bold=True)
    ws.merge_cells(start_row=rij_vraag, start_column=2, end_row=rij_vraag, end_column=4)
    ws.cell(rij_vraag, 2).alignment = Alignment(wrap_text=True, vertical='top')
    ws.row_dimensions[rij_vraag].height = 48
    kop_stappen = len(boven) + 1
    for cel in ws[kop_stappen]:
        cel.font, cel.fill = kop, kopvlak
    ws.freeze_panes = None
    ws.auto_filter.ref = None
    ws.append([])
    ws.append(['', 'Concurrent', 'Site', 'Categorieën', 'Producten', 'Landingspagina’s', 'Genoemd in', 'Opmerking', 'Taal'])
    for cel in ws[ws.max_row][1:]:
        cel.font, cel.fill = kop, kopvlak
    for c in CONCURRENTEN:
        t = tellingen[c['slug']]
        ws.append(['', c['naam'], c['site'], t['categorie'], t['product'], t['landingspagina'],
                   ' · '.join(x for x, _ in c['genoemd']), c.get('vondst') or c.get('rol', ''), c.get('taal', 'nl')])
    ws.append([])
    ws.append(['', 'Cluster', 'Tabblad', 'Zoekwoorden', 'Met volume', 'Volume case-specifiek (indicatief, per maand)',
               'Sterkste case-zoekwoord', 'Concurrenten', 'Welke', 'Zaadtermen (door ons)'])
    for cel in ws[ws.max_row][1:]:
        cel.font, cel.fill = kop, kopvlak
    for slug, naam, _, zaad in CLUSTERS + [('zonder', 'zonder cluster', '', [])]:
        l = clusters[slug]
        wie = set().union(*(e['wie'] for e in l))
        spec = [e for e in l if e['n'] and e['intentie'] == 'case-specifiek']
        beste = max(spec, key=lambda e: e['n'], default=None)
        ws.append(['', naam, f'cluster {naam}' if slug != 'zonder' else 'zonder cluster', len(l),
                   sum(1 for e in l if e['n']), int(sum(e['n'] for e in spec)) if spec else 0,
                   f"{beste['kw']} ({BEREIK.get(int(beste['n']), int(beste['n']))})" if beste else '',
                   len(wie), ', '.join(sorted(naam_van[x] for x in wie)), ', '.join(zaad)])
    ws.append(['', 'Volume case-specifiek = som van de middens van de bereiken. Alleen om clusters onderling te vergelijken, niet als verwacht verkeer.'])
    ws.append([])
    ws.append(['', f'Opgehaald {logboek["opgehaald"]} uit de openbare sitemaps. Elke rij in de andere tabbladen '
                   'noemt de sitemap waar hij uit komt; tabblad Bronnen heeft ze allemaal.'])
    for k, b in zip('EFGH', (12, 16, 48, 60)):
        ws.column_dimensions[k].width = b

    # Per rij alleen de bestandsnaam van de sitemap; de volledige adressen staan
    # één keer in tabblad Bronnen.
    kort = lambda u: urlparse(u).path.strip('/').split('/')[-1] or urlparse(u).netloc
    clusternaam = {s: n for s, n, _, _ in CLUSTERS}
    clusternaam['zonder'] = 'zonder cluster'
    kol = lambda r: [naam_van[r['c']], r['naam'], r['pad'], r['zin'], clusternaam.get(r['cluster'], r['cluster'].replace('weg:', 'weggelaten: ')), '',
                     BEREIK.get(int(r['vol']), '') if r['vol'] is not None else '',
                     r['url'], r['mod'], kort(r['bron'])]
    koppen = ['Concurrent', 'Naam', 'Categorie', 'Sleutelzin (stap 3)', 'Cluster', 'Alternatieven (3b)',
              'Zoekvolume (bereik)', 'URL', 'Laatst gewijzigd', 'Uit sitemap']
    breed = [22, 44, 30, 40, 22, 30, 14, 60, 14, 28]
    blad('Categorieën', koppen, [kol(r) for r in rijen if r['soort'] == 'categorie'], breed)

    blad('top 100 zoekwoorden', ['Laag', 'Zoekwoord', 'Cluster', 'Aantal concurrenten', 'Welke', 'Concurrentie',
                     'Bod bovenaan pagina (laag)', 'Bod bovenaan pagina (hoog)', 'Wijziging 3 maanden', 'Wijziging jaar',
                     'Voorbeeld bij concurrent'],
         [[laag(e), e['kw'], cl, len(e['wie']) or '',
           ', '.join(sorted(naam_van[x] for x in e['wie'])), e['vol']['Competition'],
           getal(e['vol']['Top of page bid (low range)']), getal(e['vol']['Top of page bid (high range)']),
           e['vol']['Three month change'], e['vol']['YoY change'], e['url']]
          for e, cl in top],
         [26, 40, 24, 12, 50, 12, 12, 12, 12, 12, 60])
    blad('top 100 apparaten', ['Laag', 'Apparaat', 'Merk', 'Model', 'Soort', 'Aantal bedrijven', 'Welke', 'Productpagina’s',
                               'Zoekwoord voor de volgende ronde', 'Zoekvolume (bereik)', 'Voorbeeld bij concurrent',
                               'Zoals de concurrent het noemt'],
         [['bij 2+ bedrijven' if len(e['bedrijven']) > 1 else 'bij 1 bedrijf',
           e['app'], e['merk'], e['model'], e['soort'], len(e['bedrijven']),
           ', '.join(sorted(naam_van[x] for x in e['wie'])), e['paginas'], e['zoekwoord'],
           BEREIK.get(int(e['n']), int(e['n'])) if e['n'] else '(nog niet gemeten)', e['url'], e['voorbeeld']]
          for e in top_prod],
         [5, 26, 18, 12, 14, 14, 40, 14, 34, 20, 56, 44])
    wb.move_sheet('top 100 apparaten', offset=-(len(wb.sheetnames) - 3))
    wb.move_sheet('top 100 zoekwoorden', offset=-(len(wb.sheetnames) - 2))

    # Eén tabblad per cluster, direct na Categorieën: één sleutelzin per rij,
    # met vooraan de kolommen van Keyword Planner (nog leeg, stap 4).
    for slug, naam, _, _ in CLUSTERS + [('zonder', 'zonder cluster', '', [])]:
        titel = f'cluster {naam}' if slug != 'zonder' else 'zonder cluster'
        assert len(titel) <= 31, f'tabnaam te lang voor Sheets: {titel}'
        def planner(e):
            if not e['vol']:
                gevraagd = planner_sleutel(e['kw']) in VERZONDEN
                return [('(samengevoegd door Google)' if gevraagd else '(nog niet opgevraagd)')] + [''] * 6
            g = e['vol']
            return [e['n'] if e['n'] is not None else '', getal(g['Top of page bid (low range)']),
                    getal(g['Top of page bid (high range)']), g['Competition'], g['Three month change'],
                    g['YoY change'], getal(g['Competition (indexed value)'])]
        blad(titel, PLANNER + ['Bereik', 'Zoekintentie', 'Bron', 'Aantal concurrenten', 'Welke',
                               'Zoals bij de concurrent', 'Voorbeeld bij concurrent'],
             [[e['kw']] + planner(e) + [BEREIK.get(int(e['n']), '') if e['n'] is not None else '', e['intentie'],
                                        e['bron'], len(e['wie']) or '', ', '.join(sorted(naam_van[x] for x in e['wie'])),
                                        ' · '.join(sorted(e['zinnen'])[:3]), e['url']] for e in clusters[slug]],
             [44, 14, 12, 12, 11, 11, 10, 12, 12, 15, 14, 12, 40, 40, 60])
    blad('Producten', koppen, [kol(r) for r in rijen if r['soort'] == 'product'], breed)
    blad('Landingspagina’s', koppen, [kol(r) for r in rijen if r['soort'] == 'landingspagina'], breed)
    blad('Overlap (stap 5)', ['Term', 'Aantal concurrenten', 'Aantal pagina’s', 'Welke', 'Zoekvolume (4)'],
         [[t, n, p, ', '.join(w), ''] for t, n, p, w in overlap], [30, 20, 16, 90, 14])
    blad('Overige pagina’s', ['Concurrent', 'Soort', 'Naam', 'URL', 'Laatst gewijzigd', 'Uit sitemap'],
         [[naam_van[r['c']], r['soort'], r['naam'], r['url'], r['mod'], kort(r['bron'])]
          for r in rijen if r['soort'] not in ('categorie', 'product', 'landingspagina')],
         [22, 14, 44, 60, 14, 50])
    bron_rijen = []
    for c in CONCURRENTEN:
        for t, u in c['genoemd']:
            bron_rijen.append([c['naam'], 'genoemd in', t, u or '', '', ''])
        for l in logboek['concurrenten'].get(c['slug'], []):
            bron_rijen.append([c['naam'], l.get('soort', ''), l['url'], l['url'], l['status'], l.get('urls', 0)])
    blad('Bronnen', ['Concurrent', 'Soort', 'Wat', 'URL', 'HTTP-status', 'URL’s erin'], bron_rijen,
         [22, 12, 50, 70, 12, 12])
    wb.save(MAP / 'concurrenten.xlsx')


VOL, VERZONDEN, RELEVANTIE = {}, set(), {}

if __name__ == '__main__':
    main()
