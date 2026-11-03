# Bible Information Centre — Foundation 1.1

A self-contained Bible reading and information-centre foundation built with plain HTML, CSS and JavaScript. It runs locally without a server, database, framework, external library or internet connection.

## Run
Open `index.html` in a modern browser. All Bible text, styles and scripts are stored in this folder.

## Included Bible translations
- King James Version (KJV) — 66 books
- World English Bible (WEB) — 66 books
- Webster’s Bible (WEBSTER) — 66 books
- World English Bible Catholic Edition (WEB-C) — 73 books

WEB and WEB-C are separate editions with separate data files. The WEB-C book list includes the Catholic book order and the source’s Greek-labelled forms of Esther and Daniel.

## Reader features
- Select a translation, book and chapter
- Navigate between chapters
- Display individual verses
- Read a verse or chapter using browser speech synthesis (offline voice availability depends on the device)
- Day and night appearance for the Scripture reading panel
- Local translation data loaded from JavaScript files

## Structure
- `index.html` — application shell
- `css/styles.css` — application styling and reading modes
- `js/app.js` — navigation and view management
- `js/reader.js` — Bible reader, translation loading and speech controls
- `data/` — four independent Bible translation data files
- `sources/WEB-C-Source-Notes.txt` — WEB-C source and conversion notes

## Offline notes
No external fonts, images, stylesheets, libraries, APIs or network requests are used. Translation files are loaded locally as classic JavaScript files, avoiding `fetch()` restrictions that can affect pages opened directly from local storage. The day/night reading preference is saved locally when browser storage is available; the toggle still works for the current session if storage is blocked.

## Future development
The existing navigation includes planned areas for parables, prophets, apostles, people, angels, miracles, events, places, teachings, genealogy, chronology, search and translation comparison. These can be developed in stages without merging the translation datasets.
