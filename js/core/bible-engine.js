/* Bible Information Centre — book-at-a-time offline Bible engine. */
(() => {
  'use strict';
  const CATALOG = window.BIBLE_CATALOG || {};
  const cache = Object.create(null);
  const pending = Object.create(null);
  const indexCache = Object.create(null);
  const indexPending = Object.create(null);
  let activeVersion = 'kjv';

  function config(version) {
    const id = String(version || activeVersion).toLowerCase();
    if (!CATALOG[id]) throw new Error('Unsupported Bible version: ' + version);
    return CATALOG[id];
  }
  function key(version, book) { return String(version).toLowerCase() + '|' + book; }
  function loadVersion(version) {
    const id = String(version || 'kjv').toLowerCase();
    config(id); activeVersion = id;
    return Promise.resolve({ ...CATALOG[id], id });
  }
  function getBooks(version = activeVersion) { return config(version).books.map(b => b.name); }
  function getChapters(book, version = activeVersion) {
    const record = config(version).books.find(b => b.name === book);
    return record ? record.chapters.slice() : [];
  }
  function loadBook(book, version = activeVersion) {
    const id = String(version).toLowerCase();
    const k = key(id, book);
    if (cache[k]) return Promise.resolve(cache[k]);
    if (pending[k]) return pending[k];
    const record = config(id).books.find(b => b.name === book);
    if (!record) return Promise.reject(new Error('Book not found: ' + book));
    pending[k] = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = record.file;
      script.async = true;
      script.onload = () => {
        const data = window.BIBLE_BOOK_DATA && window.BIBLE_BOOK_DATA[k];
        if (!data || data.book !== book || data.version !== id) {
          reject(new Error('The book data file did not load correctly: ' + book));
        } else {
          cache[k] = data;
          resolve(data);
        }
        script.remove(); delete pending[k];
      };
      script.onerror = () => {
        script.remove(); delete pending[k];
        reject(new Error('Unable to load ' + book + '. Check that its local data file is present.'));
      };
      document.head.appendChild(script);
    });
    return pending[k];
  }
  function getBook(book, version = activeVersion) { return cache[key(version, book)] || null; }
  function getChapter(book, chapter, version = activeVersion) {
    const data = getBook(book, version);
    return data && data.chapters[String(chapter)] ? data.chapters[String(chapter)] : null;
  }
  function getVerse(book, chapter, verse, version = activeVersion) {
    const verses = getChapter(book, chapter, version);
    return verses && Object.prototype.hasOwnProperty.call(verses, String(verse)) ? verses[String(verse)] : null;
  }
  function getVerseEntries(book, chapter, version = activeVersion) {
    const verses = getChapter(book, chapter, version);
    return verses ? Object.entries(verses).sort((a,b) => Number(a[0])-Number(b[0])) : [];
  }
  function getVersionInfo(version = activeVersion) {
    const c = config(version);
    return { id: String(version).toLowerCase(), name: c.name, abbreviation: c.abbreviation,
      expectedBooks: c.books.length, books: c.books.map(b => b.name) };
  }
  function loadSearchIndex(version = activeVersion) {
    const id = String(version).toLowerCase();
    if (indexCache[id]) return Promise.resolve(indexCache[id]);
    if (indexPending[id]) return indexPending[id];
    indexPending[id] = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'data/search-index/' + id + '-index.js';
      script.async = true;
      script.onload = () => {
        const idx = window.BIBLE_SEARCH_INDEX && window.BIBLE_SEARCH_INDEX[id];
        if (!idx) reject(new Error('Search index missing for ' + id));
        else { indexCache[id] = idx; resolve(idx); }
        script.remove(); delete indexPending[id];
      };
      script.onerror = () => { script.remove(); delete indexPending[id]; reject(new Error('Could not load search index for ' + id)); };
      document.head.appendChild(script);
    });
    return indexPending[id];
  }
  async function search(query, version = activeVersion, limit = 100) {
    const words = String(query || '').toLowerCase().match(/[a-z0-9]+(?:['’][a-z0-9]+)?/g) || [];
    if (!words.length) return [];
    const index = await loadSearchIndex(version);
    const lists = words.map(w => index[w] || []);
    if (lists.some(a => !a.length)) return [];
    const smallest = lists.slice().sort((a,b) => a.length-b.length)[0];
    const sets = lists.map(a => new Set(a));
    const candidates = smallest.filter(ref => sets.every(s => s.has(ref)));
    const catalog = config(version).books;
    const results = [];
    const phrase = String(query).trim().toLowerCase();
    for (const ref of candidates) {
      if (results.length >= limit) break;
      const [bookNo, chapter] = ref.split(':');
      const book = catalog[Number(bookNo)] && catalog[Number(bookNo)].name;
      if (!book) continue;
      const data = await loadBook(book, version);
      const verses = data.chapters[chapter] || {};
      for (const [verse, text] of Object.entries(verses)) {
        const normalized = String(text).toLowerCase();
        if (words.every(w => normalized.includes(w)) && (words.length === 1 || phrase.split(/\s+/).every(w => normalized.includes(w)))) {
          results.push({ version, book, chapter, verse, text });
          if (results.length >= limit) break;
        }
      }
    }
    return results;
  }
  window.BibleEngine = Object.freeze({
    versions: Object.freeze({
      kjv: { id:'kjv', name:'King James Version', abbreviation:'KJV', expectedBooks:66, oldTestamentBooks:39, newTestamentBooks:27 },
      web: { id:'web', name:'World English Bible', abbreviation:'WEB', expectedBooks:66, oldTestamentBooks:39, newTestamentBooks:27 },
      webc: { id:'webc', name:'World English Bible Catholic Edition', abbreviation:'WEB-C', expectedBooks:73, oldTestamentBooks:46, newTestamentBooks:27 }
    }),
    loadVersion, getBooks, getChapters, loadBook, getBook, getChapter, getVerse,
    getVerseEntries, getVersionInfo, loadSearchIndex, search,
    get activeVersion() { return activeVersion; },
    get loadedBooks() { return Object.keys(cache); },
    clearCache() { Object.keys(cache).forEach(k => delete cache[k]); }
  });
})();
