"""De clusters: groepen zoekwoorden waar één pagina van te maken is.

Elk zoekwoord komt in het eerste cluster waarvan 'match' een treffer geeft, op
de woorden van het zoekwoord zelf. Past er niets, dan telt het categoriepad bij
de concurrent mee (zodat 'hoeken' onder 'flightcase onderdelen' toch bij
onderdelen komt). Zo zit elk zoekwoord in precies één cluster.

Volgorde is dus de belangrijkste knop. Drie regels:
  1. Wat erin gaat vóór waar het van gemaakt is: 'allen heath sq6 foam' is een
     mixercase, geen schuiminterieur.
  2. Specifiek vóór algemeen: 'zwenkwiel' is een onderdeel, 'flightcase op
     wielen' een casetype.
  3. Merknamen doen het werk. Ze staan in de regex van het cluster waar ze
     thuishoren; zo landt 'flightcase eurolite nsf 250' bij licht.

Let op bij het uitbreiden: deze regexes matchen midden in een woord. Daar is al
een aantal keer iets misgegaan — 'fender' zat in 'defender', 'harp' in
'sharpy', 'bar' in 'led bar', 'light' in 'flightcase'. Zet er \\b omheen tenzij
je de deelwoord-treffer echt wilt.

'zaad' zijn de koptermen voor de pagina: waarmee je in de zoekwoordtool begint.
Die zijn door ons bedacht, niet door een concurrent — in de Sheet staan ze
daarom met bron "zaadterm".

Wat in geen cluster past, komt in het tabblad "zonder cluster": nakijken, en
waar nodig hier een regel bijzetten.

De naam wordt ook de tabnaam in de Sheet ("cluster <naam>"); Google Sheets en
Excel staan daar hooguit 31 tekens toe, dus namen blijven kort.
"""

CLUSTERS = [
    ('onderdelen', 'flightcase onderdelen',
     r'onderdel|\bhoek(en)?\b|kogelhoek|overzethoek|bolhoek|hoeklijn|sluiting|scharnier|handgre|hengsel|schotel|'
     r'\bvoetje|\bvoetplaat|popnagel|blindklinknagel|\bnagel|\bslot\b|vlinderslot|spuitlijm|\bgereedschap\b|'
     r'bevestiging|bouwpakket|carrosserie|insteek|zwenkwiel|bokwiel|opbouwwiel|steekwiel|inbouwwiel|\bwiel\b|'
     r'rackstrip|rack ?rail|rackschienen|rackprofiel|hoekprofiel|plaatmateriaal|kitplaat|beslag|\bklink|\bveer\b|'
     r'gasveer|kraagbout|\bbout\b|glijlat|klepschaar|afdekplaat|frontplaat|blindplaat|contactdoos|\bschroef|'
     r'\bmoer\b|kooimoer|inslagmoer|onderlegring|accessoires|\bgaffertape|\btape\b|\bboor\b|spiraalboor|rubberdop|'
     r'rubber voet|\bvoet\b|glijvoet|stapelvoet|stapelplaat|stapelsysteem|dekselstop|haakplaat|wielplaat|beugel|'
     r'schouderband|straphandle|sluitprofiel|\b[fhu] profiel|ventilatie|tussenschot|\bverf\b|structuurlak|lakspray|'
     # Plaatmateriaal alleen vooraan: 'kabelkoffer zwart multiplex' is een kabelkist.
     r'^multiplex|betonplex|klittenband|velcro',
     ['flightcase onderdelen', 'flightcase hoeken', 'flightcase sluitingen', 'flightcase handgrepen', 'flightcase wielen']),
    ('industrie', 'industriële verpakking',
     r'cleanroom|cleamroom|karton|houten kist|pallet|verpakking|\besd\b|stofarm|returnable|herbruikbare',
     ['industriële verpakking', 'transportverpakking op maat', 'cleanroom verpakking', 'houten transportkist']),
    ('mixercases', 'mixercases',
     r'mixer|mengpaneel|mengtafel|\btilt|mischpult|\bregie\b|regiecase|midas|allen ?heath|allenheat|\bah\b|soundcraft|'
     r'digico|avid|behringer|mackie|studiomaster|tascam|\bvenue\b|waves (emotion ?)?lv1|touchmix|road hog|avolites|obsidian|zero 88|'
     r'grand ?ma|\bxone\b|yamaha (dm|cl|ql|tf|ls|pm|m7cl|01v|mg|rivage)|\bx32\b|\bm32\b|\bsq ?\d|dlive|ma lighting|'
     r'chamsys|lichtmischpult|lichttafel',
     ['mixercase', 'flightcase mengpaneel', 'tiltcase', 'mixer flightcase']),
    ('dj', 'dj cases',
     r'\bdj\b|\bcdj|\bdjm|\bxdj|\bddj|turntable|technics|pioneer|alphatheta|draaitafel|denon|\brane\b|dj ?controller|'
     r'traktor|reloop|numark',
     ['dj flightcase', 'dj case', 'cdj case', 'flightcase dj controller']),
    ('instrumenten', 'instrumentcases',
     r'keyboard|toetsenbord|piano|synth|gitaar|gitarre|guitar|\bbas(s|gitaar)?\b|drum|cymbal|paiste|backline|'
     r'instrument|\bharp\b|harfe|cello|contrabas|pedal|\beffect|kemper|fractal|helix|line ?6|neural|quad cortex|'
     r'\bfender\b|marshall(?! electronics)|ampeg|orange|blackstar|peavey|markbass|hartke|\bengl\b|\bboss\b|\bmoog\b|'
     r'sequential|prophet|arturia|novation|kawai|ketron|viscount|leslie|gretsch|\bnord\b|korg|roland(?! (v-?\d|\d+hd))|'
     r'steinway|boesendorfer|gibson|takamine|musikinstrument|\bamp(lifier)?\b|versterker|genz benz|clavia|'
     # Yamaha maakt ook mengtafels; die staan al bij mixercases.
     r'yamaha (genos|modx|mox|yc|cp|psr|motif|montage|reface)',
     ['keyboard flightcase', 'keyboard case', 'gitaar flightcase', 'instrumentcase', 'piano flightcase']),
    ('licht', 'lichtcases',
     r'\blicht(?!gewicht)|lichtcase|\blights?\b|lighting|moving|\bspot\b|spotlight|\bbeam\b|\bwash\b|\bpar\b|led ?bar|'
     r'\blasers?\b|rookmachine|hazer|\bfog|followspot|scheinwerfer|dimmer|\blamp|strobe|fresnel|flood|bodeneffekt|'
     r'\brobe\b|clay paky|martin(?! audio)|chauvet|cameo|showtec|\bglp\b|elation|prolights|ayrton|\barri|astera|'
     r'varytec|eurolite|stairville|\badj\b|ignition|briteq|vari ?lite|\bsgm\b|selecon|futurelight|litecraft|antari|'
     r'studio due|\betc\b|\bdts\b|expolite|portman|\bclf\b|ldde|spiegelbol',
     ['lichtcase', 'moving head flightcase', 'flightcase moving heads', 'led par flightcase']),
    ('audio', 'speaker- en audiocases',
     r'speaker|luidspreker|lautsprecher|subwoofer|\bsub\b|line ?array|endstufe|microfoon|mikrofon|statief|stativ|'
     r'\bin ?ear|draadloos|funk|audio|\bton\b|monitoren|podiummonitor|l ?acoustics|d ?& ?b|\bdb\b|db technologies|'
     r'\brcf\b|\bjbl\b|nexo|meyer|shure|sennheiser|\beaw\b|fohhn|kling|turbosound|alcons|\bfbt\b|tw audio|ld systems|'
     r'\bbose\b|martin audio|motorola|walkie|\bqsc\b|the box|adamson|seeburg|infinity|dynacord|electro ?voice',
     ['speaker flightcase', 'luidspreker flightcase', 'microfoon flightcase', 'audio flightcase']),
    ('camera', 'camera- en videocases',
     r'camera|kamera|\bvideo|broadcast|regie und produktion|produktion|\bstudio\b|(?<!projector )\blens\b|objectief|drone|gimbal|'
     r'blackmagic|\batem\b|tricaster|teleprompter|autocue|manfrotto|cartoni|marshall electronics|roland (v-?\d|\d+hd)|sony pxw',
     ['camera flightcase', 'camerakoffer', 'broadcast flightcase', 'drone koffer']),
    ('motoren', 'motorcases',
     r'\bmotor|takel|chainmaster|kettingtakel|liftket|lodestar|movecat|\basm\b|\bgis\b|columbus|kinetic|next stage lift',
     ['kettingtakel flightcase', 'motorcase', 'takel flightcase']),
    ('schermkisten', 'schermkisten',
     r'\bscherm(?!kap)|beeldscherm|display|\bmonitor\b|\btv\b|televisie|beamer|projector|led ?wall|videowall|'
     r'touchscreen|bildschirm|\blcd\b|plasma|samsung|\blg\b|\bnec\b|philips|sony bravia|epson|optoma|barco|'
     r'vivitek|panasonic pt|iiyama|\baoc\b|dell (u\d|ultrasharp)',
     ['schermkist', 'tv flightcase', 'flightcase televisie', 'monitor flightcase', 'beamer flightcase']),
    # Een rack telt in HE of U, en die lopen van 1 tot ongeveer 48. Zonder die
    # grens matcht '\d+u' ook 'epson eb l1495u'.
    ('racks', '19 inch racks',
     r'\b19\b|19 ?inch|\brack|\b([1-9]|[1-4]\d) ?(u|he)\b|server|shock ?rack|binnenrack|rackcase|rackschublade|rackla',
     ['19 inch rack', '19 inch flightcase', 'rackcase', 'flightcase rack', 'shockmount rack']),
    ('kabelkisten', 'kabelkisten',
     r'kabel|cable',
     ['kabelkist', 'kabelkist op wielen', 'cable trunk', 'kabelkoffer']),
    ('toolcases', 'toolcases en ladecases',
     r'\btool|gereedschapskist|gereedschapskoffer|\blade|drawer|schublade|werkplaats|werkbank|werkstation',
     ['toolcase', 'flightcase met lades', 'ladecase', 'gereedschapskist flightcase']),
    ('schuim', 'schuiminterieur',
     r'schuim|foam|inlay|inlage|\binterieur|vakverdeling|vacuumvorm|polybloc|padded dividers|binnenwerk|inzetbak',
     ['schuiminterieur op maat', 'plukschuim', 'koffer met schuim', 'foam inlay']),
    ('meubels', 'flightcase meubels',
     r'dressoir|meubel|möbel|moebel|sideboard|\bbar\b|salontafel|bureau|\bkast\b|tafel|\bbank\b|nachtkast|'
     r'wardrobe|garderobe',
     ['flightcase meubels', 'flightcase dressoir', 'flightcase bar', 'industriële meubels']),
    ('presentatie', 'presentatie en beurs',
     r'presentatie|beurs|balie|\bdemo\b|showcase|\bmesse\b|beursstand|standbouw|promotie',
     ['presentatiekoffer', 'beurscase', 'beursbalie flightcase', 'demokoffer']),
    ('aluminium', 'aluminium koffers',
     r'aluminium|\balu\b|alukoffer|alukist|profielkoffer|zarges|\bviking\b|\bmio\b',
     ['aluminium koffer', 'aluminium kist', 'aluminium transportkist', 'aluminium koffer met schuim']),
    ('kunststof', 'kunststof koffers',
     r'kunststof|plastic|waterdicht|\bpeli|nanuk|\bskb|explorer|\bmax ?\d|hprc|protective|beschermkoffer|rugged|'
     r'stofdicht|hardcase|lichtgewicht|\bhusk\b|maxado',
     ['kunststof koffer', 'waterdichte koffer', 'peli case', 'beschermkoffer']),
    ('transportkisten', 'transportkisten',
     r'\bkist|trunk|truhe|transport|standaardkist|universeel|universal|stolpcase|productkist|opbergkist|container',
     ['transportkist', 'flightcase trunk', 'opbergkist', 'stolpcase']),
    ('wielen', 'flightcase op wielen',
     r'wielen|wheel|trolley|trolly|rollen|\brol\b|castor|rolkoffer',
     ['flightcase op wielen', 'trolley case', 'kist op wielen']),
    ('opmaat', 'flightcase op maat',
     r'maatwerk|op maat|custom|configurator|konfigur|\bspecial|ontwerp|\bzelf',
     ['flightcase op maat', 'flightcase laten maken', 'flightcase configurator', 'maatwerk flightcase']),
    # Een case voor één bepaald apparaat: 'flightcase eurolite nsf 250'. Geen
    # casetype, wel een modelnummer (een woord met een cijfer erin). Dit is het
    # paginatype /case-voor/{apparaat}; staat daarom vlak vóór 'algemeen'.
    ('apparaat', 'case voor apparaat',
     r'\b(?=[a-z]*\d)[a-z0-9]{2,}\b',
     ['flightcase voor apparaat', 'case op maat voor apparaat']),
    ('algemeen', 'flightcases algemeen',
     r'flight ?case|\bcase|koffer|suitcase',
     ['flightcase', 'flightcase kopen', 'flightcase koffer', 'flightcases']),
]

# Clusters die buiten het aanbod van CaseBuilder vallen. Ze blijven zichtbaar,
# maar tellen niet mee in de top 100 en de aanbeveling. Per cluster de reden.
# Besloten 25-09-2026: onderdelen hoort wél bij het aanbod (CaseBuilder verkoopt
# losse onderdelen), kunststof koffers niet.
BUITEN_AANBOD = {
    'kunststof': 'CaseBuilder verkoopt geen koffers van andere merken (25-09-2026).',
}

# Van cluster naar site: wordt het een shopcategorie (onder welke toepassing),
# of een filter, optie of route? Overgenomen uit "Clusters naar toepassingen en
# branches" (25-09-2026), zie INDELING_BRON. Pas hier aan, niet op twee plekken.
#   rol     categorie = shopcategorie · casetype/filter/optie = geen categorie ·
#           onderdelen = eigen shopafdeling · route = maatwerk · product =
#           productpagina's onder de categorie · shopstart = startpagina shop
#   seo     de SEO-pagina voor dit cluster (voorstel, volgt de sitemap)
INDELING_BRON = ('Clusters naar toepassingen en branches',
                 'https://docs.google.com/spreadsheets/d/19M6PPP7xpI58xcG883EaYcJxCGHMfes8/edit')
INDELING = {
    'licht': dict(rol='categorie', toepassing='AV & licht', seo='/case-voor/licht',
                  demo='Moving heads · Wash- en spotarmaturen · Blinders en strobes',
                  branches='Audio-visueel en podium, Standbouw en events'),
    'audio': dict(rol='categorie', toepassing='AV & licht', seo='/case-voor/speakers',
                  demo='Line-array en speakers', branches='Audio-visueel en podium, Broadcast en media, Standbouw en events'),
    'mixercases': dict(rol='categorie', toepassing='AV & licht', seo='/case-voor/mengtafel',
                       demo='Mengtafels', branches='Audio-visueel en podium, Broadcast en media'),
    'kabelkisten': dict(rol='categorie', toepassing='AV & licht', seo='/case-voor/kabels',
                        demo='Kabelhaspels en multicore',
                        branches='Audio-visueel en podium, Broadcast en media, Standbouw en events, Industrie en machinebouw, Motorsport'),
    'motoren': dict(rol='categorie', toepassing='AV & licht', seo='/case-voor/kettingtakel',
                    demo='Truss-hardware', branches='Audio-visueel en podium, Standbouw en events'),
    'dj': dict(rol='categorie', toepassing='Backline & muziek', seo='/case-voor/dj',
               demo='DJ-apparatuur', branches='Audio-visueel en podium'),
    'instrumenten': dict(rol='categorie', toepassing='Backline & muziek', seo='/case-voor/instrumenten',
                         demo='Gitaren · Keyboards · Drums · … (9 soorten)', branches='Audio-visueel en podium'),
    'camera': dict(rol='categorie', toepassing='Broadcast & camera', seo='/case-voor/camera',
                   demo='Camerabodies · Optiek · Drone en gimbal',
                   branches='Broadcast en media, Defensie, Industrie en machinebouw, Motorsport'),
    'schermkisten': dict(rol='categorie', toepassing='Evenement & beursbouw', seo='/case-voor/scherm',
                         demo='Displays en schermen · Monitoren',
                         branches='Standbouw en events, Broadcast en media, Audio-visueel en podium'),
    'presentatie': dict(rol='categorie', toepassing='Evenement & beursbouw', seo='/case-voor/beurs-en-presentatie',
                        demo='Standmateriaal', branches='Standbouw en events, Meet- en testapparatuur, Industrie en machinebouw'),
    'meubels': dict(rol='categorie', toepassing='Evenement & beursbouw', seo='/case-voor/meubels',
                    demo='Catering en bar', branches='Standbouw en events, Audio-visueel en podium'),
    'toolcases': dict(rol='categorie', toepassing='Industrie & meettechniek', seo='/case-voor/gereedschap',
                      demo='Handgereedschap · Servicekoffers',
                      branches='Industrie en machinebouw, Motorsport, Defensie, Meet- en testapparatuur'),
    'industrie': dict(rol='categorie', toepassing='Industrie & meettechniek', seo='/case-voor/industriele-verpakking',
                      demo='Machineonderdelen', branches='Industrie en machinebouw, Meet- en testapparatuur, Defensie'),
    'racks': dict(rol='casetype', seo='/flightcases/rackcase-enkel', demo='filter Casetype: Rackcase'),
    'transportkisten': dict(rol='casetype', seo='/flightcases/trunccase', demo='filter Casetype: Trunccase'),
    'wielen': dict(rol='filter', seo='', demo='filter: wielen ja of nee'),
    'aluminium': dict(rol='filter', seo='', demo='materiaalfilter, of buiten scope als CaseBuilder ze niet maakt'),
    'kunststof': dict(rol='buiten', seo='', demo='buiten scope: geen koffers van andere merken'),
    'schuim': dict(rol='optie', seo='', demo='optie in de configurator, plus onderdelen'),
    'onderdelen': dict(rol='onderdelen', seo='/onderdelen', demo='eigen shopafdeling Onderdelen'),
    'opmaat': dict(rol='route', seo='/case-aanvragen', demo='route Maatwerk aanvragen'),
    'apparaat': dict(rol='product', seo='/case-voor/{merk-model}', demo='productpagina onder de categorie'),
    'algemeen': dict(rol='shopstart', seo='/shop', demo='startpagina van de shop'),
}

# Subcategorieën van de shopafdeling Onderdelen, afgeleid uit de zoekwoorden
# van het cluster onderdelen. Eerste treffer wint.
ONDERDEEL_SUB = [
    ('Hoeken', r'hoek(?!lijn)'),
    ('Sluitingen en sloten', r'sluiting|\bslot|vlinder'),
    ('Handgrepen', r'handgre|handvat|straphandle|hengsel'),
    ('Scharnieren en dekselstoppers', r'scharnier|dekselstop|gasveer|klepschaar'),
    ('Wielen', r'wiel|dolly'),
    ('Rackrails en frontplaten', r'rack ?rail|rackprofiel|rackstrip|rackschienen|frontplaat|blindplaat|contactdoos'),
    ('Profielen', r'profiel|hoeklijn|insteek|glijlat'),
    ('Schotels en inbouwdelen', r'schotel|inbouw|ventilatie'),
    ('Bevestiging', r'nagel|moer|bout|schroef|ring\b|bevestiging|klink|carrosserie'),
    ('Voeten en stapelen', r'voet|stapel|rubber'),
    ('Plaat en afwerking', r'multiplex|plex|plaat|verf|lak|lijm|tape'),
    ('Gereedschap', r'gereedschap|tang|boor'),
]
