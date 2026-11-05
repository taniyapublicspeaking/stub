/* Offline side-by-side Bible translation comparison. */
(() => {
  'use strict';
  const form = document.getElementById('compareForm');
  if (!form) return;
  const referenceInput = document.getElementById('compareReference');
  const layoutSelect = document.getElementById('compareLayout');
  const title = document.getElementById('compareTitle');
  const status = document.getElementById('compareStatus');
  const resultsBox = document.getElementById('compareResults');
  const submit = form.querySelector('button[type="submit"]');
  const editions = ['kjv', 'web', 'webc'];

  function parseReference(value) {
    const match = String(value || '').trim().match(/^(.+?)\s+(\d+)(?::\s*(.+))?$/);
    if (!match) throw new Error('Use a reference such as John 3:16-18 or Psalm 23.');
    const book = match[1].trim();
    const chapter = String(Number(match[2]));
    const verseText = (match[3] || '').trim();
    const ranges = [];
    if (verseText) {
      verseText.split(',').forEach(part => {
        const range = part.trim().match(/^(\d+)(?:\s*[-–]\s*(\d+))?$/);
        if (!range) throw new Error('The verse part must look like 16, 16-18 or 16-18,20.');
        const first = Number(range[1]);
        const last = Number(range[2] || range[1]);
        if (first < 1 || last < 1) throw new Error('Verse numbers must be greater than zero.');
        ranges.push([Math.min(first, last), Math.max(first, last)]);
      });
    }
    return { book, chapter, ranges, verseLabel: verseText || 'entire chapter' };
  }

  function bookAlias(book, version, books) {
    if (books.includes(book)) return book;
    if (version === 'webc' && book === 'Daniel' && books.includes('Daniel (Greek)')) return 'Daniel (Greek)';
    if (version === 'webc' && book === 'Esther' && books.includes('Esther (Greek)')) return 'Esther (Greek)';
    if (book === 'Psalm' && books.includes('Psalms')) return 'Psalms';
    if (book === 'Psalms' && books.includes('Psalm')) return 'Psalm';
    return null;
  }

  function isWanted(verse, ranges) {
    if (!ranges.length) return true;
    const n = Number(verse);
    return ranges.some(([first, last]) => n >= first && n <= last);
  }

  async function loadEdition(reference, version) {
    const books = window.BibleEngine.getBooks(version);
    const actualBook = bookAlias(reference.book, version, books);
    if (!actualBook) return { version, unavailable: true, verses: [] };
    await window.BibleEngine.loadBook(actualBook, version);
    const allVerses = window.BibleEngine.getVerseEntries(actualBook, reference.chapter, version);
    if (!allVerses.length) throw new Error(`${reference.book} ${reference.chapter} does not exist in ${window.BibleEngine.versions[version].abbreviation}.`);
    if (reference.ranges.length) {
      const highest = Math.max(...reference.ranges.map(range => range[1]));
      const lowest = Math.min(...reference.ranges.map(range => range[0]));
      const maxVerse = Math.max(...allVerses.map(([number]) => Number(number)));
      if (lowest > maxVerse || highest > maxVerse) throw new Error(`${reference.book} ${reference.chapter} has only ${maxVerse} verses in ${window.BibleEngine.versions[version].abbreviation}.`);
    }
    return { version, book: actualBook, verses: allVerses.filter(([number]) => isWanted(number, reference.ranges)) };
  }

  function makeEditionCard(data, reference) {
    const card = document.createElement('article');
    card.className = 'comparison-card';
    const heading = document.createElement('div');
    heading.className = 'comparison-card-heading';
    const name = document.createElement('h3');
    name.textContent = window.BibleEngine.versions[data.version].name;
    const badge = document.createElement('span');
    badge.className = 'result-edition';
    badge.textContent = window.BibleEngine.versions[data.version].abbreviation;
    heading.append(name, badge);
    card.appendChild(heading);
    if (data.unavailable) {
      const note = document.createElement('p');
      note.className = 'comparison-unavailable';
      note.textContent = `This book is not included in the ${window.BibleEngine.versions[data.version].abbreviation} canon.`;
      card.appendChild(note);
      return card;
    }
    data.verses.forEach(([number, text]) => {
      const row = document.createElement('p');
      row.className = 'comparison-verse';
      const verseNo = document.createElement('strong');
      verseNo.textContent = `${number}. `;
      row.append(verseNo, document.createTextNode(text));
      card.appendChild(row);
    });
    const open = document.createElement('button');
    open.type = 'button';
    open.className = 'small-action';
    open.textContent = 'Open in Reader →';
    const highlight = reference.ranges.map(([a,b]) => a === b ? String(a) : `${a}-${b}`).join(',');
    open.addEventListener('click', async () => {
      if (window.showBibleView) window.showBibleView('reader');
      open.disabled = true;
      try {
        const opened = await window.BibleReader.openPassage(data.book, reference.chapter, highlight, data.version);
        if (!opened) status.textContent = 'This passage could not be opened in the Reader.';
      } catch (error) { status.textContent = error.message || 'Could not open this passage.'; }
      finally { open.disabled = false; }
    });
    card.appendChild(open);
    return card;
  }

  form.addEventListener('submit', async event => {
    event.preventDefault();
    resultsBox.replaceChildren();
    let reference;
    try { reference = parseReference(referenceInput.value); }
    catch (error) { status.textContent = error.message; referenceInput.focus(); return; }
    title.textContent = `${reference.book} ${reference.chapter}${reference.ranges.length ? ':' + reference.verseLabel : ''}`;
    status.textContent = 'Loading the three local editions…';
    resultsBox.classList.toggle('stacked-comparison', layoutSelect.value === 'stacked');
    submit.disabled = true;
    try {
      const data = [];
      for (const version of editions) data.push(await loadEdition(reference, version));
      data.forEach(item => resultsBox.appendChild(makeEditionCard(item, reference)));
      const available = data.filter(item => !item.unavailable).length;
      status.textContent = `Comparison ready · ${available} of 3 editions contain this book.`;
    } catch (error) {
      resultsBox.replaceChildren();
      status.textContent = error.message || 'The passage could not be compared.';
    } finally { submit.disabled = false; }
  });
  layoutSelect.addEventListener('change', () => resultsBox.classList.toggle('stacked-comparison', layoutSelect.value === 'stacked'));
})();
