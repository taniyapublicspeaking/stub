/* Offline Bible Search interface. */
(() => {
  'use strict';
  const form = document.getElementById('bibleSearchForm');
  if (!form) return;
  const queryInput = document.getElementById('bibleSearchQuery');
  const versionSelect = document.getElementById('bibleSearchVersion');
  const testamentSelect = document.getElementById('bibleSearchTestament');
  const bookSelect = document.getElementById('bibleSearchBook');
  const modeSelect = document.getElementById('bibleSearchMode');
  const status = document.getElementById('bibleSearchStatus');
  const resultsBox = document.getElementById('bibleSearchResults');
  const submit = form.querySelector('button[type="submit"]');

  function populateSearchBooks(preserve = true) {
    const previous = bookSelect.value;
    const books = window.BibleEngine.getBooks(versionSelect.value, testamentSelect.value);
    bookSelect.replaceChildren();
    const all = document.createElement('option'); all.value = 'all'; all.textContent = 'All Books'; bookSelect.appendChild(all);
    books.forEach(book => { const option = document.createElement('option'); option.value = book; option.textContent = book; bookSelect.appendChild(option); });
    bookSelect.value = preserve && books.includes(previous) ? previous : 'all';
  }
  versionSelect.addEventListener('change', () => populateSearchBooks(false));
  testamentSelect.addEventListener('change', () => populateSearchBooks(false));
  populateSearchBooks(false);

  function makeResult(result) {
    const card = document.createElement('article');
    card.className = 'scripture-result';
    const heading = document.createElement('div');
    heading.className = 'scripture-result-heading';
    const reference = document.createElement('strong');
    reference.textContent = `${result.book} ${result.chapter}:${result.verse}`;
    const edition = document.createElement('span');
    edition.className = 'result-edition';
    edition.textContent = window.BibleEngine.versions[result.version].abbreviation;
    heading.append(reference, edition);
    const verse = document.createElement('p');
    verse.className = 'scripture-result-text';
    verse.textContent = result.text;
    const open = document.createElement('button');
    open.type = 'button';
    open.className = 'small-action';
    open.textContent = 'Open in Bible Reader →';
    open.addEventListener('click', async () => {
      if (window.showBibleView) window.showBibleView('reader');
      open.disabled = true;
      try {
        const opened = await window.BibleReader.openPassage(result.book, result.chapter, result.verse, result.version);
        if (!opened) status.textContent = 'This reference could not be opened in the selected edition.';
      } catch (error) { status.textContent = error.message || 'Could not open this passage.'; }
      finally { open.disabled = false; }
    });
    card.append(heading, verse, open);
    return card;
  }

  form.addEventListener('submit', async event => {
    event.preventDefault();
    const query = queryInput.value.trim();
    if (!query) { queryInput.focus(); return; }
    resultsBox.replaceChildren();
    status.textContent = 'Searching the local Bible index…';
    submit.disabled = true;
    try {
      const results = await window.BibleEngine.search(query, versionSelect.value, 50, {
        testament: testamentSelect.value,
        book: bookSelect.value,
        mode: modeSelect.value
      });
      if (!results.length) {
        status.textContent = 'No matching verses found. Try different words or another Bible edition.';
      } else {
        status.textContent = `${results.length} matching ${results.length === 1 ? 'verse' : 'verses'} found${results.length === 50 ? ' (showing the first 50)' : ''}.`;
        const fragment = document.createDocumentFragment();
        results.forEach(result => fragment.appendChild(makeResult(result)));
        resultsBox.appendChild(fragment);
      }
    } catch (error) {
      status.textContent = error.message || 'The Bible search could not be completed.';
    } finally { submit.disabled = false; }
  });
})();
