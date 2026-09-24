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
     r'\bmoer\b|accessoires|\bgaffertape|\btape\b|\bboor\b|rubberdop|klittenband|velcro',
     ['flightcase onderdelen', 'flightcase hoeken', 'flightcase sluitingen', 'flightcase handgrepen', 'flightcase wielen']),
    ('industrie', 'industriële verpakking',
     r'cleanroom|cleamroom|karton|houten kist|pallet|verpakking|\besd\b|stofarm|returnable|herbruikbare',
     ['industriële verpakking', 'transportverpakking op maat', 'cleanroom verpakking', 'houten transportkist']),
    ('mixercases', 'mixercases',
     r'mixer|mengpaneel|mengtafel|\btilt|mischpult|\bregie\b|regiecase|midas|allen ?heath|allenheat|\bah\b|soundcraft|'
     r'digico|avid|behringer|mackie|studiomaster|tascam|\bvenue\b|waves lv1|road hog|avolites|obsidian|zero 88|'
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
     r'steinway|boesendorfer|gibson|takamine|musikinstrument|\bamp(lifier)?\b|versterker',
     ['keyboard flightcase', 'keyboard case', 'gitaar flightcase', 'instrumentcase', 'piano flightcase']),
    ('licht', 'lichtcases',
     r'\blicht(?!gewicht)|lichtcase|\blights?\b|lighting|moving|\bspot\b|spotlight|\bbeam\b|\bwash\b|\bpar\b|led ?bar|'
     r'\blaser|rookmachine|hazer|\bfog|followspot|scheinwerfer|dimmer|\blamp|strobe|fresnel|flood|bodeneffekt|'
     r'\brobe\b|clay paky|martin(?! audio)|chauvet|cameo|showtec|\bglp\b|elation|prolights|ayrton|\barri|astera|'
     r'varytec|eurolite|stairville|\badj\b|ignition|briteq|vari ?lite|\bsgm\b|selecon|futurelight|litecraft|antari|'
     r'studio due|\betc\b',
     ['lichtcase', 'moving head flightcase', 'flightcase moving heads', 'led par flightcase']),
    ('audio', 'speaker- en audiocases',
     r'speaker|luidspreker|lautsprecher|subwoofer|\bsub\b|line ?array|endstufe|microfoon|mikrofon|statief|stativ|'
     r'\bin ?ear|draadloos|funk|audio|\bton\b|monitoren|podiummonitor|l ?acoustics|d ?& ?b|\bdb\b|db technologies|'
     r'\brcf\b|\bjbl\b|nexo|meyer|shure|sennheiser|\beaw\b|fohhn|kling|turbosound|alcons|\bfbt\b|tw audio|ld systems|'
     r'\bbose\b|martin audio|motorola|walkie',
     ['speaker flightcase', 'luidspreker flightcase', 'microfoon flightcase', 'audio flightcase']),
    ('camera', 'camera- en videocases',
     r'camera|kamera|\bvideo|broadcast|regie und produktion|produktion|\bstudio\b|\blens\b|objectief|drone|gimbal|'
     r'blackmagic|\batem\b|tricaster|teleprompter|autocue|manfrotto|cartoni|marshall electronics|roland (v-?\d|\d+hd)',
     ['camera flightcase', 'camerakoffer', 'broadcast flightcase', 'drone koffer']),
    ('motoren', 'motorcases',
     r'\bmotor|takel|chainmaster|kettingtakel|liftket|lodestar|movecat|\basm\b|\bgis\b|columbus|kinetic|next stage lift',
     ['kettingtakel flightcase', 'motorcase', 'takel flightcase']),
    ('schermkisten', 'schermkisten',
     r'\bscherm(?!kap)|beeldscherm|display|\bmonitor\b|\btv\b|televisie|beamer|projector|led ?wall|videowall|'
     r'touchscreen|bildschirm|\blcd\b|plasma|samsung|\blg\b|\bnec\b|philips|sony bravia',
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
     r'schuim|foam|inlay|inlage|\binterieur|vakverdeling|vacuumvorm',
     ['schuiminterieur op maat', 'plukschuim', 'koffer met schuim', 'foam inlay']),
    ('meubels', 'flightcase meubels',
     r'dressoir|meubel|möbel|moebel|sideboard|\bbar\b|salontafel|bureau|\bkast\b|tafel|\bbank\b|nachtkast|'
     r'wardrobe|garderobe',
     ['flightcase meubels', 'flightcase dressoir', 'flightcase bar', 'industriële meubels']),
    ('presentatie', 'presentatie en beurs',
     r'presentatie|beurs|balie|\bdemo\b|showcase|\bmesse\b|beursstand|standbouw|promotie',
     ['presentatiekoffer', 'beurscase', 'beursbalie flightcase', 'demokoffer']),
    ('aluminium', 'aluminium koffers',
     r'aluminium|\balu\b|alukoffer|alukist|profielkoffer|zarges',
     ['aluminium koffer', 'aluminium kist', 'aluminium transportkist', 'aluminium koffer met schuim']),
    ('kunststof', 'kunststof koffers',
     r'kunststof|plastic|waterdicht|\bpeli|nanuk|\bskb|explorer|\bmax ?\d|hprc|protective|beschermkoffer|rugged|'
     r'stofdicht|hardcase|lichtgewicht',
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
