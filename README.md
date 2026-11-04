# Bible Information Centre — Foundation 1.3

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
- Day and night appearance for the Scripture reading panel, with a remembered local preference
- Adjustable Scripture text size (A− / A / A+) with reset and remembered preference
- Chapter and individual-verse read-aloud speaks Scripture text only; verse labels and numbers are not spoken
- Local translation data loaded from JavaScript files

## Structure
- `index.html` — application shell
- `css/styles.css` — application styling and reading modes
- `js/app.js` — navigation and view management
- `js/reader.js` — Bible reader, translation loading and speech controls
- `data/` — four independent Bible translation data files, plus local topic catalogues
- `sources/WEB-C-Source-Notes.txt` — WEB-C source and conversion notes

## Offline notes
No external fonts, images, stylesheets, libraries, APIs or network requests are used. Translation files are loaded locally as classic JavaScript files, avoiding `fetch()` restrictions that can affect pages opened directly from local storage. The day/night reading preference is saved locally when browser storage is available; the toggle still works for the current session if storage is blocked.

## Future development
The existing navigation includes planned areas for parables, prophets, apostles, people, angels, miracles, events, places, teachings, genealogy, chronology, search and translation comparison. These can be developed in stages without merging the translation datasets.

## Parables catalogue — Foundation 1.2
- Includes a curated catalogue of 33 parables and parable-like illustrations of Jesus.
- Search by title, theme, description or Scripture reference; filter by theme.
- Open an entry to read a short summary, its main teaching and Gospel references.
- Each reference can open the corresponding book and chapter in the local Bible Reader.
- The catalogue is stored in `data/parables.js` and works without internet access.
- Counts and groupings of parables vary among Bible teachers; the catalogue is therefore described as curated rather than exhaustive or definitive.


## Foundation 1.3 additions

### Prophets catalogue
- Includes 41 curated entries covering named prophets and prophetesses from both Testaments.
- Search by name, period, role, summary or Scripture reference.
- Filter by Testament, prophetess, Major Prophets, Minor Prophets or other prophetic figures.
- Open an entry to see an overview and Scripture references; references open the corresponding chapter in the currently selected Bible version.
- The catalogue distinguishes traditional book groupings from other prophetic figures and notes where the biblical record is brief or dating is debated.
- WEB-C uses its source book label `Daniel (Greek)`; the reader maps the catalogue's canonical Daniel references to that book automatically.

### Navigation panel
- The left navigation panel can be collapsed and restored with the top-left menu button on desktop.
- On smaller screens, the same button opens and closes the slide-in navigation panel.
- The last desktop collapsed/expanded preference is stored locally where browser storage is available.

### Reading controls
- The reading toolbar contains Day/Night, A−, A and A+ controls.
- Font size ranges from 14px to 30px in 2px increments; A resets to 18px.
- Reading mode and font size are saved locally where browser storage is available; controls continue to work for the current session if storage is blocked.
- Verse numbers remain visible on screen but are excluded from all speech output. A line break separates verse text in chapter playback to encourage natural pauses.

## Testing notes
- JavaScript syntax checks pass for all application and data scripts.
- HTML checks found no duplicate IDs and all referenced local script files exist.
- All 41 catalogue entries' Scripture chapter references were checked against KJV, WEB, WEBSTER and WEB-C; WEB-C's Greek-labelled Daniel book is handled by an alias in the reader.
- Browser-based visual/audio testing on a physical Android tablet is still recommended. Speech voice availability and voice quality depend on the Android browser and installed offline voices.
