"""Bouwt producten-joran/index.html uit producten.json.

De gegevens komen uit een offerte die Joran op 11 september 2026 stuurde
(opgesteld 21 oktober 2024): zeven kant-en-klare flightcases met vaste maten,
prijzen en een volledige specificatie. De PDF zelf blijft buiten deze repo --
hij staat in Drive onder Opdracht 1602 -- de foto's komen er ongewijzigd uit.

    python3 producten-joran/bouw.py
"""
import html
import json
import pathlib

HIER = pathlib.Path(__file__).resolve().parent
PROD = json.loads((HIER / 'producten.json').read_text())
BEREIK = {50: '10–100', 500: '100–1K', 5000: '1K–10K', 50000: '10K–100K'}
# De volgorde waarin een casebouwer een specificatie leest: eerst wat het is,
# dan de maten, dan het beslag.
VELDEN = ['Model', 'Kwaliteitsklasse', 'Materiaal', 'Netto binnenmaat', 'Geschatte buitenmaat',
          'Dekseluitvoering', 'Sloten', 'Handgrepen', 'Hoeken', 'Wielen', 'Stapelbaar',
          'Afwerking Basis', 'Afwerking Deksel', 'Overige details']
e = html.escape


def kaart(p):
    rijen = ''.join(
        f'<tr><th>{e(v)}</th><td>{e(p["spec"][v])}</td></tr>'
        for v in VELDEN if p['spec'].get(v))
    zoek = ' · '.join(
        f'<b>{e(k)}</b> <span class="bereik">{BEREIK.get(int(n), int(n))}</span>'
        for k, n in p['zoekwoorden']) or '<span class="mute">nog geen gemeten zoekwoorden</span>'
    return f'''
    <article class="kaart" id="p{p['bid']}">
      <div class="beeld"><img src="{e(p['beeld'])}" alt="{e(p['naam'])}" loading="lazy"></div>
      <div class="tekst">
        <span class="bid">Builder-ID {e(p['bid'])}</span>
        <h2>{e(p['naam'])}</h2>
        <p class="prijs">&euro; {p['prijs']:.2f} <span class="mute">excl. btw, offerteprijs okt 2024</span></p>
        <p class="cluster">Cluster <b>{e(p['clusternaam'])}</b> <span class="rol">{e(p['rol'])}</span></p>
        <p class="zoek">{zoek}</p>
        <table class="spec">{rijen}</table>
      </div>
    </article>'''


def main():
    per_cluster = {}
    for p in PROD:
        per_cluster.setdefault(p['clusternaam'], []).append(p)
    overzicht = ''.join(
        f'<tr><td><b>{e(naam)}</b></td><td class="num">{len(l)}</td>'
        f'<td>{e(", ".join(x["naam"].replace("Trunccase ", "").replace("Rackcase ", "") for x in l))}</td>'
        f'<td class="num">&euro; {min(x["prijs"] for x in l):.0f} – {max(x["prijs"] for x in l):.0f}</td></tr>'
        for naam, l in per_cluster.items())
    kaarten = ''.join(kaart(p) for p in PROD)
    (HIER / 'index.html').write_text(f'''<!doctype html>
<html lang="nl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Producten van Joran</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;900&family=DM+Sans:wght@400;500;700&family=IBM+Plex+Mono:wght@400;500&display=swap">
<style>
  :root {{ --bg:#EFF3F6; --surface:#fff; --ink:#0B1E2B; --muted:#5A6B77; --faint:#8B9BA6;
    --line:#DCE4EA; --accent:#0277A8; --accent-bg:#E2F1F9; }}
  * {{ box-sizing:border-box; }}
  body {{ margin:0; background:var(--bg); color:var(--ink); font-family:"DM Sans",sans-serif; line-height:1.55; }}
  .wrap {{ max-width:1100px; margin:0 auto; padding:48px 24px 80px; }}
  h1 {{ font-family:"Barlow Condensed",sans-serif; font-size:44px; font-weight:900; text-transform:uppercase;
    letter-spacing:.02em; margin:0 0 8px; }}
  h2 {{ font-family:"Barlow Condensed",sans-serif; font-size:24px; font-weight:600; margin:2px 0 6px; }}
  .lede {{ color:var(--muted); max-width:70ch; font-size:17px; }}
  .eyebrow {{ font-family:"IBM Plex Mono",monospace; font-size:11px; letter-spacing:.18em; text-transform:uppercase;
    color:var(--accent); }}
  table {{ width:100%; border-collapse:collapse; background:var(--surface); border:1px solid var(--line);
    border-radius:3px; font-size:14px; margin:14px 0 34px; }}
  th, td {{ text-align:left; padding:9px 14px; border-bottom:1px solid var(--line); vertical-align:top; }}
  thead th {{ font-family:"IBM Plex Mono",monospace; font-size:10.5px; letter-spacing:.1em; text-transform:uppercase;
    color:var(--faint); font-weight:500; }}
  td.num {{ text-align:right; font-variant-numeric:tabular-nums; white-space:nowrap; }}
  .kaart {{ display:grid; grid-template-columns:300px 1fr; gap:26px; background:var(--surface);
    border:1px solid var(--line); border-radius:4px; padding:22px; margin-bottom:18px; }}
  .beeld {{ background:#F7FAFC; border:1px solid var(--line); border-radius:3px; display:flex;
    align-items:center; justify-content:center; padding:10px; }}
  .beeld img {{ max-width:100%; height:auto; mix-blend-mode:multiply; }}
  .bid {{ font-family:"IBM Plex Mono",monospace; font-size:10.5px; letter-spacing:.12em; color:var(--faint);
    text-transform:uppercase; }}
  .prijs {{ font-family:"Barlow Condensed",sans-serif; font-size:26px; font-weight:900; margin:4px 0 10px; }}
  .prijs .mute {{ font-family:"DM Sans",sans-serif; font-size:13px; font-weight:400; color:var(--faint); }}
  .cluster {{ margin:0 0 6px; font-size:14.5px; }}
  .cluster .rol {{ font-family:"IBM Plex Mono",monospace; font-size:10px; letter-spacing:.1em; text-transform:uppercase;
    background:var(--accent-bg); color:var(--accent); padding:3px 8px; border-radius:2px; margin-left:6px; }}
  .zoek {{ font-size:14px; color:var(--muted); margin:0 0 6px; }}
  .bereik {{ font-family:"IBM Plex Mono",monospace; font-size:11px; color:var(--faint); }}
  .mute {{ color:var(--faint); }}
  table.spec {{ margin:12px 0 0; font-size:13.5px; }}
  table.spec th {{ width:190px; font-weight:500; color:var(--muted); }}
  a {{ color:var(--accent); }}
  @media (max-width:760px) {{ .kaart {{ grid-template-columns:1fr; }} }}
</style>
</head>
<body>
<div class="wrap">
  <span class="eyebrow">Uit de mail van Joran &middot; 11 september 2026</span>
  <h1>Producten van Joran</h1>
  <p class="lede">Zeven kant-en-klare flightcases uit een offerte van CaseBuilder (21 oktober 2024): vaste maten,
  vaste prijzen en een volledige specificatie per case. Precies wat een webshopproduct nodig heeft &mdash; de klant
  kiest niets meer dan kleur en logo. Hieronder per product de specificatie zoals Joran hem opstuurde, en in welk
  cluster uit het SEO-onderzoek hij valt.</p>
  <p class="lede">Bron: de offerte-PDF die Joran mailde, met de foto&rsquo;s er ongewijzigd uit. De PDF zelf
  staat niet in deze repo maar in Drive, onder Opdracht 1602.</p>

  <span class="eyebrow">Verdeling</span>
  <h2>Welke clusters raken ze</h2>
  <table>
    <thead><tr><th>Cluster</th><th class="num">Producten</th><th>Maten</th><th class="num">Prijs</th></tr></thead>
    <tbody>{overzicht}</tbody>
  </table>

  <span class="eyebrow">Per product</span>
  <h2>De zeven cases</h2>
  {kaarten}
</div>
</body>
</html>''')
    print('geschreven:', HIER / 'index.html')


if __name__ == '__main__':
    main()
