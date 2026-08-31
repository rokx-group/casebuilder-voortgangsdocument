# CaseBuilder — voortgangsdocument

Statische pagina met de stand van het CaseBuilder-project, verdeeld over vijf fases plus wireframes en de meetingagenda.

## Structuur

```
index.html          het document zelf — één bestand, geen build
mockups/            paginaontwerpen op het merksysteem
  assets/brand.css  CB-Brandrichtlijnen v1
  homepage.html
  categorie.html
netlify.toml        publish = root, geen buildstap
```

## Deployen

Netlify is aan deze repo gekoppeld: elke push naar `main` deployt automatisch, elke branch krijgt een deploy preview. Er is geen buildcommando en geen dependency.

## Werkwijze

`index.html` is de bron. De ontwerpweergave in het document wordt gegenereerd uit `mockups/assets/brand.css` en `mockups/categorie.html`, zodat merk en document niet uit elkaar lopen.

De pagina staat op `noindex` en is niet afgeschermd — hij is niet bedoeld om gevonden te worden, wel om gedeeld te worden.

## Werken en publiceren

`main` is de productie-branch: **elke push naar `main` publiceert de site.**
Daarom werken we op `werk` en mergen we pas als het live mag.

```bash
git checkout werk          # dagelijks werk, pusht zonder te publiceren
git add -A && git commit
git push                   # veilig, Netlify doet niets

# als het live mag:
git checkout main && git merge werk && git push
git checkout werk          # en weer verder
```

Netlify bouwt alleen de productie-branch, dus een push naar `werk` kost geen
deploy. Zet in het dashboard geen branch deploys aan, anders vervalt dat.

## Scripts

| | |
|---|---|
| `node scripts/bouw-ontwerpweergave.mjs` | bouwt de ingesloten ontwerpweergave in `index.html` uit `mockups/`. Draaien na elke mockupwijziging. |
| `node scripts/bouw-wireframes.mjs` | schrijft per sjabloon een losse wireframepagina op ware grootte, uit `index.html`. |
| `node scripts/meet-hoogtes.mjs [bestand]` | meet sectiehoogtes in Chrome op 1440 × 900. Niet schatten, meten. |

## Bestandsnamen in `mockups/`

| | |
|---|---|
| `X.html` | de wireframe |
| `X-v1.html` | het ontwerp |
| `X-v1-video.html` | een variant daarvan |
| `X-v2.html` | een volgende ontwerpronde |

Alles met een achtervoegsel `-v<cijfer>` wordt automatisch als versie opgepikt.
