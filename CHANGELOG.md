# Changelog

## Development Build 1.3.1 — Central Bible Engine foundation
- Added `js/core/bible-engine.js` as a central local Bible data access layer.
- Added on-demand loading and in-memory caching for KJV, WEB and WEB-C.
- Added validation for the expected 66 / 66 / 73 book counts.
- Added shared retrieval methods for books, chapters, chapter verses, individual verses and sorted verse entries.
- Updated the reader to retrieve Bible data through the central engine.
- Removed Webster from the active reader and development build; the original Version 1.3 ZIP remains the untouched backup.
- Retained classic local JavaScript loading for compatibility with direct `file://` use.

## Foundation 1.3
- Added a searchable and filterable catalogue of 41 biblical prophets and prophetesses.
- Added detail panels and Scripture chapter links for catalogue entries.
- Added a collapsible desktop navigation pane and slide-in mobile/tablet navigation.
- Added reading font-size decrease, increase and reset controls with local preference storage.
- Added Day/Night reading controls and retained local preference storage.
- Changed chapter read-aloud to speak only verse text, without spoken verse labels/numbers.
- Added WEB-C Daniel (Greek) reference mapping for catalogue navigation.

## Foundation 1.2
- Added curated Parables of Jesus catalogue.
- Added World English Bible Catholic Edition (WEB-C) as a separate translation.

## Build 1.3.2 — individual book data and search indexes
- Split KJV, WEB and WEB-C into 205 individual local JavaScript book files.
- Added a shared Bible catalogue with canonical book order and chapter metadata.
- Updated Bible Engine to load books on demand and cache loaded books.
- Added one compact chapter-level inverted search index per edition and a search API.
- Updated the reader to load a book before rendering chapters, preserving local-file compatibility.
- Removed the three monolithic translation data files from this build.

## Development Build 1.3.3 — Testament filters and application-wide reading controls
- Added the All Books / Old Testament / New Testament filter to the Bible Reader.
- Book lists now follow each edition's canon: KJV 39 + 27, WEB 39 + 27, WEB-C 46 + 27.
- Preserved the selected Testament and Book when switching editions where that book is available.
- Added site-wide Day/Night mode with locally stored preference.
- Added global A− / A / A+ reading-size controls for reading and catalogue information areas.
- Extended Bible Reader reference navigation to highlight one verse, a range, or multiple comma-separated verse ranges.
- Updated Parables catalogue links to pass verse ranges into the Reader.
- Kept classic local script loading and removed dependence on network resources.

## Development Build 1.3.4 — Bible Search and Compare Versions
- Replaced the Bible Search placeholder with an offline search interface connected to the chapter-level indexes.
- Added all-words and exact-phrase search modes, Testament filtering and an optional Book filter.
- Updated search matching to normalise punctuation and case, and to support all-word queries in any order.
- Added direct navigation from a search result to its exact verse in the Bible Reader, including switching the active edition.
- Replaced the Compare Versions placeholder with a local three-edition passage comparison tool.
- Added reference parsing for whole chapters, individual verses, verse ranges and comma-separated verse ranges.
- Added parallel and stacked comparison layouts, clear unavailable-edition notices for books outside an edition's canon, and direct Reader links.
- Added compatibility for Psalm/Psalms, Esther/Esther (Greek) and Daniel/Daniel (Greek) book-name differences.
- Styled both tools for responsive tablet/mobile layouts, site-wide Day/Night mode and global reading-size controls.
- Preserved the plain HTML/CSS/JavaScript and local classic-script loading architecture.
