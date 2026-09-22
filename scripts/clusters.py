"""De clusters: groepen zoekwoorden waar één pagina van te maken is.

Elke sleutelzin (uit categorieën, trefwoordpagina's en producten van de
concurrenten) komt in het eerste cluster waarvan 'match' een treffer geeft.
Volgorde doet er dus toe: specifiek vóór algemeen. 'zwenkwiel' is een
onderdeel, 'flightcase op wielen' een casetype; daarom staat onderdelen
bovenaan en 'op wielen' onderaan.

Het cluster wordt bepaald per zoekwoord, op de woorden van dat zoekwoord zelf.
Alleen als die nergens op passen, telt het categoriepad bij de concurrent mee
(zodat 'hoeken' onder 'flightcase onderdelen' toch bij onderdelen komt). Zo
zit elk zoekwoord in precies één cluster. 'match' bevat ook Duitse woorden.

'zaad' zijn de koptermen voor de pagina: waarmee je in de zoekwoordtool
(stap 4) begint. Die zijn door ons bedacht, niet door een concurrent — in de
Sheet staan ze daarom met bron "zaadterm".

Wat in geen cluster past, komt in het tabblad "zonder cluster": nakijken, en
waar nodig hier een regel bijzetten.

De naam wordt ook de tabnaam in de Sheet ("cluster <naam>"); Google Sheets en
Excel staan daar hooguit 31 tekens toe, dus namen blijven kort.
"""

CLUSTERS = [
    ('onderdelen', 'flightcase onderdelen',
     r'onderdel|\bhoek(en)?\b|kogelhoek|overzethoek|sluiting|scharnier|handgre|hengsel|schotel|voetje|profiel|'
     r'popnagel|nagel|\bslot|lijm|verf|gereedschap\b|bevestiging|bouwpakket|carrosserie|insteek|zwenkwiel|bokwiel|'
     r'\bwiel\b|rackstrip|rackrail|rackschienen|rackprofiel|multiplex|plaatmateriaal|kitplaat|beslag|klink|\bveer\b|'
     r'afdekplaat|frontplaat|blindplaat|contactdoos|schroef|moer|ring\b|accessoires|\bvoet|bolhoek|hoeklijn|inbouw|'
     r'stopper|straphandle|tape|boor|spray|\blak|\bkap\b|rubber|spiraal|klittenband|velcro|slot\b|\bvlinder',
     ['flightcase onderdelen', 'flightcase hoeken', 'flightcase sluitingen', 'flightcase handgrepen', 'flightcase wielen']),
    ('schuim', 'schuiminterieur',
     r'schuim|foam|inlay|interieur|vakverdeling|vacuum|plukschuim|schaum|inlage',
     ['schuiminterieur op maat', 'plukschuim', 'koffer met schuim', 'foam inlay']),
    ('industrie', 'industriële verpakking',
     r'cleanroom|cleamroom|karton|houten kist|pallet|verpakking|\besd\b|stofarm|returnable|herbruikbare',
     ['industriële verpakking', 'transportverpakking op maat', 'cleanroom verpakking', 'houten transportkist']),
    ('schermkisten', 'schermkisten',
     r'scherm|display|monitor|\btv\b|televisie|beamer|projector|led ?wall|videowall|touchscreen|bildschirm|'
     r'samsung|\blg\b|\bnec\b|philips|sony bravia',
     ['schermkist', 'tv flightcase', 'flightcase televisie', 'monitor flightcase', 'beamer flightcase']),
    ('mixercases', 'mixercases',
     r'mixer|mengpaneel|mengtafel|tilt|mischpult|\bregie\b|regiecase|midas|allen heath|soundcraft|digico|avid|'
     r'behringer|yamaha (dm|cl|ql|tf)|\bx32\b|\bm32\b|\bsq ?\d|dlive|ma lighting|grandma|chamsys|lichtmischpult|lichttafel',
     ['mixercase', 'flightcase mengpaneel', 'tiltcase', 'mixer flightcase']),
    ('dj', 'dj cases',
     r'\bdj\b|\bcdj|\bdjm|\bxdj|turntable|technics|pioneer|draaitafel|denon|\brane\b|dj ?controller|\bddj',
     ['dj flightcase', 'dj case', 'cdj case', 'flightcase dj controller']),
    ('instrumenten', 'instrumentcases',
     r'keyboard|piano|synth|gitaar|guitar|\bbas(s|gitaar)?\b|drum|backline|instrument|harfe|harp|cello|contrabas|'
     r'pedal|effect|kemper|fractal|helix|line ?6|neural|quad cortex|fender|marshall|'
     r'\bnord\b|korg|roland|steinway|boesendorfer|gibson|takamine|musikinstrument|\bamp(lifier)?\b|versterker|gitaarversterker',
     ['keyboard flightcase', 'keyboard case', 'gitaar flightcase', 'instrumentcase', 'piano flightcase']),
    ('licht', 'lichtcases',
     r'\blicht(?!gewicht)|lichtcase|\blights?\b|lighting|moving|\bspot|\bbeam|wash|\bpar\b|led ?bar|laser|rookmachine|hazer|\bfog|followspot|scheinwerfer|'
     r'dimmer|lamp|\brobe\b|clay paky|martin|chauvet|cameo|showtec|glp|elation|prolights|ayrton|arri|astera|varytec|etc\b',
     ['lichtcase', 'moving head flightcase', 'flightcase moving heads', 'led par flightcase']),
    ('audio', 'speaker- en audiocases',
     r'speaker|luidspreker|lautsprecher|subwoofer|\bsub\b|line ?array|endstufe|microfoon|mikrofon|statief|stativ|'
     r'\bin ?ear|draadloos|funk|audio|\bton\b|l acoustics|d ?& ?b|\bdb\b|db technologies|rcf|jbl|nexo|meyer|shure|'
     r'sennheiser|eaw|fohhn|kling|turbosound|alcons|fbt|tw audio|ld systems|motorola|walkie',
     ['speaker flightcase', 'luidspreker flightcase', 'microfoon flightcase', 'audio flightcase']),
    ('racks', '19 inch racks',
     r'\b19\b|19 ?inch|\brack|\d+ ?he\b|\bhe\b|\d+u\b|server|shock ?rack|binnenrack|rackcase|rackschublade|rackla',
     ['19 inch rack', '19 inch flightcase', 'rackcase', 'flightcase rack', 'shockmount rack']),
    ('kabelkisten', 'kabelkisten',
     r'kabel|cable',
     ['kabelkist', 'kabelkist op wielen', 'cable trunk', 'kabelkoffer']),
    ('toolcases', 'toolcases en ladecases',
     r'\btool|gereedschapskist|gereedschapskoffer|\blade|drawer|schublade|werkplaats|werkbank|werkstation',
     ['toolcase', 'flightcase met lades', 'ladecase', 'gereedschapskist flightcase']),
    ('camera', 'camera- en videocases',
     r'camera|kamera|video|broadcast|regie und produktion|produktion|\bstudio\b|\blens|objectief|drone|gimbal',
     ['camera flightcase', 'camerakoffer', 'broadcast flightcase', 'drone koffer']),
    ('motoren', 'motorcases',
     r'motor|takel|chainmaster|kettingtakel|liftket|movecat|\basm\b|\bgis\b|columbus|kinetic',
     ['kettingtakel flightcase', 'motorcase', 'takel flightcase']),
    ('meubels', 'flightcase meubels',
     r'dressoir|meubel|möbel|moebel|sideboard|\bbar\b|salontafel|bureau|\bkast\b|tafel|\bbank\b|nachtkast',
     ['flightcase meubels', 'flightcase dressoir', 'flightcase bar', 'industriële meubels']),
    ('presentatie', 'presentatie en beurs',
     r'presentatie|beurs|balie|\bdemo|showcase|messe|stand\b|promotie',
     ['presentatiekoffer', 'beurscase', 'beursbalie flightcase', 'demokoffer']),
    ('aluminium', 'aluminium koffers',
     r'aluminium|\balu\b|alukoffer|alukist|profielkoffer|zarges',
     ['aluminium koffer', 'aluminium kist', 'aluminium transportkist', 'aluminium koffer met schuim']),
    ('kunststof', 'kunststof koffers',
     r'kunststof|plastic|waterdicht|\bpeli|nanuk|\bskb|explorer|\bmax ?\d|hprc|protective|beschermkoffer|rugged|'
     r'stofdicht|\bip ?6|hardcase|\bbak(ken)?\b|lichtgewicht',
     ['kunststof koffer', 'waterdichte koffer', 'peli case', 'beschermkoffer']),
    ('transportkisten', 'transportkisten',
     r'\bkist|trunk|truhe|transport|standaardkist|universeel|universal|universal|stolpcase|productkist|opbergkist|'
     r'\bbox\b|container',
     ['transportkist', 'flightcase trunk', 'opbergkist', 'stolpcase']),
    ('wielen', 'flightcase op wielen',
     r'wielen|wheel|trolley|rollen|\brol\b|castor|rolkoffer',
     ['flightcase op wielen', 'trolley case', 'kist op wielen']),
    ('opmaat', 'flightcase op maat',
     r'maatwerk|op maat|custom|configurator|konfigur|special|ontwerp|\bzelf',
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
