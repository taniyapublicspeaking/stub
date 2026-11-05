# Bible Information Centre — Development Build 1.3.4

A self-contained Bible reading and information centre built with plain HTML, CSS and JavaScript. It is designed for offline use, including opening `index.html` directly from local storage on an Android tablet. It requires no server, database, framework, external library, CDN or Internet connection.

## Run the application

1. Extract the complete `Bible-Presenter` folder.
2. Keep `index.html`, `css`, `js` and `data` together in that folder.
3. Open `index.html` in a modern browser.

Bible data and search indexes are loaded through local classic JavaScript files. The app does not use `fetch()` or ES modules for Bible data, avoiding common local `file://` restrictions.

## Included Bible editions

- King James Version (KJV) — 66 books (39 Old Testament + 27 New Testament)
- World English Bible (WEB) — 66 books (39 Old Testament + 27 New Testament)
- World English Bible Catholic Edition (WEB-C) — 73 books (46 Old Testament + 27 New Testament)

WEB and WEB-C are separate editions with separate data files. WEB-C includes the complete 73-book canon, including Tobit, Judith, Esther (Greek), Wisdom, Sirach, Baruch, 1 Maccabees, 2 Maccabees and Daniel (Greek).

## Bible Reader

- Select Bible version, Testament, Book and Chapter.
- Testament choices: All Books, Old Testament and New Testament.
- Book lists follow each edition's canon and preserve a selected book when switching editions where possible.
- Navigate between chapters and read individual verses or a chapter using device speech synthesis.
- Open Scripture references from catalogues, search results and comparison results.
- Highlight an exact verse, a verse range or multiple comma-separated ranges temporarily in the Reader.

## Bible Search

- Search locally in KJV, WEB or WEB-C.
- Search all words (in any order) or an exact phrase.
- Narrow the search by Testament and optionally by a specific book.
- Search results show the verse text and provide an Open in Bible Reader action.
- The search index is loaded locally on first use and cached in memory. The interface displays up to the first 50 matches for a query; use the Testament or Book filters, or refine the words, to narrow a large result set.

## Compare Versions

- Compare the same reference in KJV, WEB and WEB-C.
- Enter a chapter, a single verse, a verse range or comma-separated verse ranges. Examples: `John 3:16-18`, `Romans 8:1-4`, `Psalm 23`, `John 3:16,18-20`.
- Choose parallel or stacked display.
- If a requested book is not part of an edition's canon, that edition is clearly marked as unavailable rather than substituting another text.
- WEB-C book-name differences such as Psalm/Psalms, Esther/Esther (Greek) and Daniel/Daniel (Greek) are handled when comparing common references.
- Each available edition has an Open in Reader action.

## Application appearance

- Site-wide Day/Night mode.
- Site-wide A− / A / A+ reading-text controls.
- Preferences are stored locally when browser storage is available. Controls remain usable for the current session if storage is unavailable.
- Search and comparison text follows the global reading-size setting and both sections support Night mode.

## Existing catalogues

- Curated Parables of Jesus catalogue with search, theme filtering and Scripture links.
- Curated Prophets and Prophetesses catalogue with search, Testament/category filtering and Scripture links.
- Other navigation areas (Apostles, People & Characters, Angels, Miracles, Events, Places, Teachings, Genealogy and Chronology) remain planned sections for later development.

## Project structure

- `index.html` — application shell and views
- `css/styles.css` — application layout, themes and responsive styling
- `js/app.js` — navigation and global appearance preferences
- `js/reader.js` — Bible Reader and passage navigation
- `js/search.js` — offline Bible Search interface
- `js/comparison.js` — translation comparison interface
- `js/core/bible-engine.js` — local book loader, cache, search and Scripture retrieval API
- `data/bible-catalog.js` — shared book and chapter catalogue
- `data/bible/kjv/` — 66 KJV book files
- `data/bible/web/` — 66 WEB book files
- `data/bible/webc/` — 73 WEB-C book files
- `data/search-index/` — one local search index per edition
- `data/parables.js`, `data/prophets.js` — local catalogue data

## Offline and device notes

The app uses only local HTML, CSS and JavaScript. Browser speech voices depend on the voices installed on the device and may not be available offline on every Android installation. Keep the entire extracted folder together; moving `index.html` away from its `css`, `js` or `data` folders will break local file references.
