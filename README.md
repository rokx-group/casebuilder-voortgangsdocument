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
