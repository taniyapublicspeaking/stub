# Bible Information Centre — Foundation 1.0

A self-contained, offline-first Bible application built with plain HTML, CSS and JavaScript.

## Run
Open `index.html` in a modern browser. No server, database, internet connection, framework or external library is required.

## Included
- Responsive application shell with navigation sidebar
- Dashboard and Bible Explorer category landing page
- Existing Bible Reader using three local translations
- Individual verse panels and browser speech synthesis
- Navigation placeholders for future catalogues, genealogy, chronology, search and comparison
- Bible text stored in local JavaScript files

## Structure
- `index.html` — application shell and local script loading
- `css/styles.css` — responsive visual design
- `js/app.js` — navigation and view management
- `js/reader.js` — Bible reader, translation loading and speech controls
- `data/` — Bible translation data

## Offline notes
No external fonts, images, stylesheets, libraries, APIs or network requests are used. Bible translations are loaded as local script files. Available speech voices depend on the device and browser; some devices may require an installed offline voice.

Keep the `data` folder beside `index.html`. Do not rename the Bible data files unless their paths in `js/reader.js` are updated.

## Next phases
1. Reusable Bible reference and data-loading engines
2. Side-by-side translation comparison
3. Local full-text and topic search
4. Structured topic catalogues and cross-references
5. Genealogy and chronology visualisations
