"""De concurrenten, en waar ze genoemd worden.

'groep' hoort bij concurrenten van hetzelfde bedrijf (Faes en zijn webshop
Koffers en Kisten). Waar geteld wordt hoeveel concurrenten iets voeren,
tellen die samen als één.

Eén plek. Haal- en bouwscript lezen allebei deze lijst. Een concurrent
toevoegen = hier een regel erbij, daarna beide scripts draaien.

'genoemd' verwijst naar het document waarin de concurrent staat. Er staat
bewust niemand in die niet in een van onze eigen stukken voorkomt.
"""

BRANCHE = ('Branche selectie sep 2026',
           'https://docs.google.com/document/d/1gbJetGe2UNJ-pJAvvHWU7I6YYdyl8SXEMBtUHX7OMwE')
STRATEGIE = ('Casebuilder Marketingstrategie',
             'https://docs.google.com/document/d/1md4Rh843wOlmaJUxxDEKFiFMY7cxRakjEpIJcHQNDxY')
# Het concurrentenoverzicht in onze eigen tool (screenshot van 22-09-2026).
# Geen deelbare link; daarom zonder URL.
OVERZICHT = ('Concurrentenoverzicht Rokx-tool, 22-09-2026', None)

# Per site: welke paden wat zijn, voor zover de sitemap dat zelf niet zegt.
# WordPress-sitemaps verraden het al (product-sitemap, product_cat-sitemap);
# deze regels zijn voor sites die alles als "pagina" publiceren. Eerste
# treffer wint. 'overslaan' = andere talen: we vergelijken de Nederlandse site.
PADEN = {
    'vdwerf': [(r'/(transport-industrie|av-licht-en-geluid)/$', 'branche'),
               (r'/(koffers|overige-flightcases|specials|skb)/$', 'categorie'),
               (r'/(afwerking|frezen)/$', 'dienst'), (r'/testbericht', 'overig')],
    'faes': [(r'/producten/[^/]+/[^/]+/$', 'product'), (r'/producten/[^/]+/$', 'categorie'),
             (r'/sectoren/.+', 'branche'), (r'/activiteiten/.+', 'dienst')],
    'dfb': [(r'/nl/(standaard-koffers|maatwerk-verpakkingen|maatwerk-interieurs|cleanroom-verpakkingen)/[^/]+/[^/]+$', 'product'),
            (r'/nl/(standaard-koffers|maatwerk-verpakkingen|maatwerk-interieurs|cleanroom-verpakkingen)(/[^/]+)?$', 'categorie'),
            (r'/nl/sectoren/.+', 'branche'), (r'/nl/merken', 'merk'), (r'/nl/nieuws', 'blog'),
            (r'/nl/(contact|over-ons.*|privacy-policy|sectoren|case-checker)?$', 'pagina'),
            # Losse trefwoordpagina's op het hoogste niveau: /nl/aluminium-kisten,
            # /nl/kabelkist. Dit is precies de SEO-laag waar deze tab over gaat.
            (r'/nl/[^/]+$', 'landingspagina')],
    'megacase': [(r'/product-categorie/', 'categorie'), (r'/product/', 'product'),
                 (r'/flightcase-online-konfigurieren', 'dienst')],
    'reco': [(r'/(defensie|high-tech|audio-visueel)/$', 'branche'), (r'/(maatwerk|presentatie)/$', 'categorie')],
    'slf': [(r'/nl/flightcases$', 'categorie')],
    'jdb': [(r'/flightcase-maatwerk/$', 'categorie')],
    'awcases': [(r'/winkel/$', 'pagina')],
    # Eigen opzet: producten onder /nl_NL/p/, en vijf ingangen die samen de
    # categorie-indeling vormen (toepassing, merk, interieur, materiaal,
    # eigenschap).
    'koffersenkisten': [(r'/nl_NL/p/', 'product'),
                        (r'/nl_NL/(toepassingen|merken|interieur|materiaal|eigenschappen)(/|$)', 'categorie'),
                        (r'/nl_NL/blog', 'blog')],
}
OVERSLAAN_URL = {
    'faes': r'faes\.nl/en/',
    'dfb': r'dfb-cases\.nl/(en|de)(/|$)',
}

CONCURRENTEN = [
    {'slug': 'vdwerf', 'naam': 'Van der Werf Flightcases', 'site': 'https://www.vdwerf-flightcases.nl',
     'sitemaps': ['https://www.vdwerf-flightcases.nl/sitemap.xml'], 'genoemd': [BRANCHE, OVERZICHT],
     'rol': 'Directe concurrent; overlapt op Mediapark Hilversum en camperinrichting.'},
    {'slug': 'awcases', 'naam': 'AW Cases', 'site': 'https://www.awcases.nl',
     'sitemaps': ['https://www.awcases.nl/sitemap_index.xml'], 'genoemd': [BRANCHE, OVERZICHT],
     'rol': 'Evenknie in omvang; deelt in op producttype.'},
    {'slug': '123flightcase', 'naam': '123Flightcase', 'site': 'https://www.123flightcase.nl',
     'sitemaps': ['https://www.123flightcase.nl/sitemap_index.xml'], 'genoemd': [BRANCHE],
     'rol': 'Thuismarkt AV; concurreert op snelheid.'},
    {'slug': 'megacase', 'naam': 'Megacase', 'site': 'https://megacase.com',
     # robots.txt noemt geen sitemap; per taal staat er wel een. We nemen de
     # Nederlandse, net als bij de andere meertalige sites.
     # De sitemap heeft alleen producten; de categorieën staan in het menu.
     'sitemaps': ['https://megacase.com/nl/sitemap_index.xml'], 'homepage': ['https://megacase.com/nl/'],
     'genoemd': [BRANCHE, OVERZICHT], 'taal': 'de',
     'vondst': 'productadressen in het Duits, ook op /nl/. Sitemap niet in robots.txt; gevonden op /nl/sitemap_index.xml. Categorieën uit het menu op de homepage',
     'rol': 'Structurele tweeling: configurator, shop, aanvraag.'},
    # De webshop van Faes staat op een eigen domein; faes.nl zelf verkoopt niet
    # (productpagina's hebben geen prijs of winkelwagen, alleen een formulier).
    {'slug': 'koffersenkisten', 'naam': 'Koffers en Kisten (Faes)', 'site': 'https://www.koffersenkisten.nl',
     'sitemaps': ['https://www.koffersenkisten.nl/sitemap.xml'],
     'genoemd': [('Faes, pagina E-commerce', 'https://faes.nl/e-commerce/')],
     'vondst': 'gevonden via faes.nl/e-commerce: "Dé webshop voor koffers en kisten"',
     'groep': 'faes',
     'rol': 'De webshop van Faes: SKB, Defender, Viking. faes.nl zelf is een catalogus zonder prijzen.'},
    {'slug': 'faes', 'naam': 'Faes', 'site': 'https://faes.nl', 'groep': 'faes',
     'sitemaps': ['https://faes.nl/sitemap_index.xml'], 'genoemd': [BRANCHE, STRATEGIE, OVERZICHT],
     'rol': 'Deelt in op branche; beweegt vanuit high-tech richting AV. Geen webshop — verkoopt via koffersenkisten.nl.'},
    {'slug': 'amptown', 'naam': 'Amptown Cases', 'site': 'https://www.amptown-cases.de',
     'sitemaps': ['https://www.amptown-cases.de/wp-sitemap.xml'], 'genoemd': [STRATEGIE], 'taal': 'de',
     'rol': '"Wellicht de grootste concurrent in Europa" (Marketingstrategie).'},
    {'slug': 'denting', 'naam': 'Denting', 'site': 'https://www.denting.nl',
     'sitemaps': ['https://www.denting.nl/sitemap_index.xml'], 'genoemd': [STRATEGIE, OVERZICHT],
     'rol': 'Verkoopt vooral losse flightcase-onderdelen: sluitingen, hoeken, profielen.'},
    {'slug': 'dfb', 'naam': 'DFB Cases', 'site': 'https://dfb-cases.nl',
     'sitemaps': ['https://dfb-cases.nl/sitemap.xml'], 'genoemd': [STRATEGIE], 'rol': ''},
    {'slug': 'reco', 'naam': 'Reco Cases Holland', 'site': 'https://recocasesholland.nl',
     'sitemaps': ['https://recocasesholland.nl/sitemap_index.xml'], 'genoemd': [STRATEGIE], 'rol': ''},
    {'slug': 'slf', 'naam': 'SLF Group', 'site': 'https://www.slfgroup.pro',
     'sitemaps': ['https://www.slfgroup.pro/sitemap.xml'], 'genoemd': [STRATEGIE], 'rol': ''},
    {'slug': 'jdb', 'naam': 'JDB Licht en Geluid', 'site': 'https://www.jdblichtengeluid.nl',
     'sitemaps': ['https://www.jdblichtengeluid.nl/sitemap.xml'], 'genoemd': [STRATEGIE, OVERZICHT], 'rol': ''},
    {'slug': 'kiro', 'naam': 'KIRO Flightcases', 'site': 'https://www.kiroflightcases.nl',
     'sitemaps': ['https://www.kiroflightcases.nl/sitemap_index.xml'], 'genoemd': [OVERZICHT], 'rol': ''},
    # WordPress, maar zonder sitemap en zonder robots.txt. Dan blijft alleen
    # de homepage over: de links in het menu zijn hun categorie-indeling.
    {'slug': 'rhinocase', 'naam': 'Rhinocase', 'site': 'https://rhinocase.nl',
     'sitemaps': [], 'homepage': ['https://rhinocase.nl/'], 'genoemd': [OVERZICHT],
     'vondst': 'geen sitemap, geen robots.txt; alleen de links op de homepage', 'rol': ''},
]
