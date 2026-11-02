# Bible Presenter v1.0

## Files
- `index.html` — application structure
- `styles.css` — responsive reading interface
- `app.js` — book/chapter navigation and verse-panel rendering
- `data/bible-content.js` — complete Bible text and hierarchy

## Run
Extract the ZIP while preserving the folder structure, then open `index.html` in a browser.

The content file is loaded locally as a classic JavaScript script, so the app does not require `fetch()` or a web server.

## Content
- 66 books in canonical order
- Old and New Testament groupings
- 1,189 chapters
- 31,102 verse entries
- Verse text copied from the supplied `full.txt`

## Current scope
Responsive reading view, testament/book/chapter selectors, previous/next chapter navigation (including book boundaries), individual verse panels, and a light/dark theme toggle.
