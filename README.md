# Bible Presenter

## Files
- `index.html` — page structure and initial KJV data script.
- `styles.css` — responsive presentation and verse-panel styling.
- `app.js` — version switching, book/chapter navigation, and speech synthesis.
- `data/kjv-content.js` — King James Version text.
- `data/web-content.js` — World English Bible text.
- `data/webster-content.js` — Webster's Bible text.

## Data structure
Each version file assigns a structured object to `window.BIBLE_DATA`:
`{ version: "...", books: { "Genesis": { "1": { "1": "In the beginning..." }}}}`.
The hierarchy is book → chapter → verse, so the app can look up and render any passage directly.

## Run
For best compatibility, serve this folder through a local web server or upload it to a static host such as GitHub Pages. Open `index.html` to test; some browsers restrict local JavaScript file loading, so a local server is recommended.

## Voice reading
The app uses the browser's built-in Web Speech API (`speechSynthesis`). Voice availability depends on the browser, device, installed voices, and network settings. On Android, Chrome usually provides available system voices; the voice list may appear after the browser finishes loading them.
