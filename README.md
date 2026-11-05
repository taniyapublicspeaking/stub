# Bible Information Centre — Development Build 1.3.1

A self-contained Bible reading and information-centre foundation built with plain HTML, CSS and JavaScript. It is designed to run locally without a server, database, framework, external library or internet connection.

## Run
Open `index.html` in a modern browser. Keep the `css`, `data` and `js` folders alongside it. Bible editions are loaded as local classic JavaScript files; the application does not use `fetch()` or JavaScript modules for Bible data, avoiding common `file://` restrictions.

## Included Bible editions
- King James Version (KJV) — 66 books
- World English Bible (WEB) — 66 books
- World English Bible Catholic Edition (WEB-C) — 73 books

WEB and WEB-C are separate editions with separate data files. WEB-C retains its full 73-book canon, including the source's Greek-labelled forms of Esther and Daniel.

## Reader features
- Select a Bible edition, book and chapter
- Navigate between chapters
- Display individual verses
- Read a verse or chapter using browser speech synthesis (offline voice availability depends on the device)
- Day/Night appearance for the Scripture reading panel
- Adjustable Scripture text size (A− / A / A+) with reset
- Local edition data loaded on demand and retained in an in-memory cache after loading

## Central Bible Engine
`js/core/bible-engine.js` is the shared data access layer. It currently:
- Loads KJV, WEB and WEB-C from local JavaScript data files
- Validates the expected book count before accepting a translation
- Caches each loaded edition so switching back does not reload its data
- Provides common methods to retrieve book lists, chapter lists, chapter verses, individual verses and sorted verse entries
- Uses ordinary script elements and classic JavaScript, not `fetch()`, modules, a server or external dependencies

The reader now obtains its book, chapter and verse data through this engine. The underlying translation data is still in one file per edition at this stage; migration into individual book files and compact search indexes is a later development task.

## Project structure
- `index.html` — application shell
- `css/styles.css` — application styling and reading-panel modes
- `js/app.js` — navigation and view management
- `js/reader.js` — reader interface and speech controls; uses the central engine
- `js/core/bible-engine.js` — central translation loader, cache and Scripture retrieval API
- `data/` — KJV, WEB and WEB-C data files plus local topic catalogues
- `sources/WEB-C-Source-Notes.txt` — WEB-C source and conversion notes

## Offline notes
The app uses local stylesheets, scripts and Bible data. No external fonts, images, libraries, APIs or network requests are required. Dynamic Bible data loading uses local classic scripts because local-file `fetch()` can be restricted by browsers. Day/Night and font controls currently apply to the Scripture reading panel only; site-wide controls remain a planned integration task.

## Existing catalogues and planned areas
The current build includes the Parables and Prophets catalogues. Navigation also contains planned areas for apostles, people, angels, miracles, events, places, teachings, genealogy, chronology, search and translation comparison. These will be developed in stages and connected to the same Scripture engine.

## Parables catalogue
- Includes a curated catalogue of 33 parables and parable-like illustrations of Jesus.
- Search by title, theme, description or Scripture reference; filter by theme.
- Each reference can open the corresponding book and chapter in the local Bible Reader.
- Counts and groupings vary among Bible teachers; the catalogue is described as curated rather than definitive.

## Prophets catalogue
- Includes 41 curated entries covering named prophets and prophetesses from both Testaments.
- Search by name, period, role, summary or Scripture reference.
- Filter by Testament, prophetess, Major Prophets, Minor Prophets or other prophetic figures.
- WEB-C uses its source book label `Daniel (Greek)`; the reader maps canonical Daniel references to that book.

## Development and testing status
- The source archive is preserved separately as the Version 1.3 backup.
- JavaScript syntax checks pass for the new engine, reader and app scripts.
- A direct engine test loaded all three local edition files, checked their book counts and retrieved Genesis 1:1 and Genesis 1 verse entries successfully.
- Full interactive browser testing and physical Android tablet testing have not yet been completed.

## Bible data layout (Build 1.3.2)
The three supported editions are stored as individual classic JavaScript files under `data/bible/kjv/`, `data/bible/web/` and `data/bible/webc/` (205 books total). `data/bible-catalog.js` supplies book order and chapter lists. The compact inverted indexes are under `data/search-index/`. The Bible Engine loads one book at a time by adding a local script element; it does not use `fetch()`, ES modules, a server, or an external library. This loading method is intended for offline `file://` use.

The engine exposes `BibleEngine.loadBook(book, version)`, `getChapter`, `getVerse`, `getVerseEntries`, `loadSearchIndex` and `search(query, version, limit)`. Search indexes narrow candidates to chapters; actual verse text is checked after the relevant book is loaded.
