"""Haalt de sitemaps van de concurrenten op en bewaart ze ongewijzigd.

Stap 1 van twee. Dit script praat met internet; bouw-concurrenten.py leest
alleen wat hier is neergezet. Zo is elke telling in de tab terug te voeren op
een bestand in concurrenten/bronnen/, en kun je de verwerking opnieuw draaien
zonder de sites opnieuw te belasten.

    python3 scripts/haal-concurrenten.py

Alleen standaardbibliotheek. Leest alleen openbare sitemaps (wat robots.txt
zelf aanwijst) en, waar geen sitemap is, de homepage.
"""
import gzip, json, re, time, urllib.request, urllib.error
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent.parent
BRONNEN = ROOT / 'concurrenten' / 'bronnen'
UA = ('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 '
      '(KHTML, like Gecko) Chrome/126 Safari/537.36')

# Wie een concurrent is, komt uit onze eigen documenten — niet uit dit script.
# 'genoemd' zegt waar; dat staat straks bij elke rij in de tab.
from concurrenten_lijst import CONCURRENTEN  # noqa: E402

# Sitemaps die niets over het aanbod zeggen. Wel meegeteld in het logboek,
# niet opgehaald: afbeeldingen en auteurs zijn duizenden regels ruis.
OVERSLAAN = re.compile(r'(attachment|author|users|elementskit_template|job-listing)', re.I)


def haal(url):
    req = urllib.request.Request(url, headers={'User-Agent': UA, 'Accept-Encoding': 'gzip'})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            data = r.read()
            if r.headers.get('Content-Encoding') == 'gzip' or url.endswith('.gz'):
                data = gzip.decompress(data)
            return r.status, r.geturl(), data
    except urllib.error.HTTPError as e:
        return e.code, url, b''
    except Exception as e:  # time-out, DNS: vastleggen, niet stoppen
        return 0, url, str(e).encode()


def locs(xml):
    return [re.sub(r'^<!\[CDATA\[|\]\]>$', '', m.strip())
            for m in re.findall(r'<loc>\s*(.*?)\s*</loc>', xml, re.S)]


def bestandsnaam(url):
    p = urlparse(url)
    naam = (p.path.strip('/') or 'index').replace('/', '__')
    return naam if naam.endswith(('.xml', '.html', '.rss')) else naam + '.xml'


def verwerk(c):
    map_ = BRONNEN / c['slug']
    map_.mkdir(parents=True, exist_ok=True)
    log = []
    wachtrij, gezien = list(c['sitemaps']), set()
    while wachtrij:
        url = wachtrij.pop(0)
        if url in gezien:
            continue
        gezien.add(url)
        if OVERSLAAN.search(url):
            log.append({'url': url, 'status': 'overgeslagen', 'bestand': None, 'urls': 0})
            continue
        status, eind, data = haal(url)
        tekst = data.decode('utf-8', 'replace')
        naam = bestandsnaam(url)
        if status == 200 and data:
            (map_ / naam).write_bytes(data)
        gevonden = locs(tekst) if status == 200 else []
        is_index = '<sitemapindex' in tekst
        if is_index:
            wachtrij.extend(gevonden)
        log.append({'url': url, 'eind': eind, 'status': status, 'bestand': f'{c["slug"]}/{naam}' if status == 200 else None,
                    'soort': 'index' if is_index else 'urlset', 'urls': 0 if is_index else len(gevonden)})
        time.sleep(0.6)  # rustig aan: het zijn andermans servers
    for url in c.get('homepage', []):
        status, eind, data = haal(url)
        naam = bestandsnaam(url).replace('.xml', '') + '.homepage.html'
        if status == 200:
            (map_ / naam).write_bytes(data)
        log.append({'url': url, 'eind': eind, 'status': status, 'bestand': f'{c["slug"]}/{naam}' if status == 200 else None,
                    'soort': 'homepage', 'urls': 0})
    return log


def main():
    stamp = datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%MZ')
    logboek = {'opgehaald': stamp, 'concurrenten': {}}
    for c in CONCURRENTEN:
        print('>', c['naam'])
        logboek['concurrenten'][c['slug']] = verwerk(c)
    (BRONNEN / 'logboek.json').write_text(json.dumps(logboek, indent=1, ensure_ascii=False))
    print('klaar:', stamp)


if __name__ == '__main__':
    main()
