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
  function getTestament(book, version = activeVersion) {
    const books = config(version).books;
    const index = books.findIndex(b => b.name === book);
    if (index < 0) return null;
    const oldCount = version === 'webc' ? 46 : 39;
    return index < oldCount ? 'old' : 'new';
  }
  function getBooks(version = activeVersion, testament = 'all') {
    const books = config(version).books;
    if (testament === 'all') return books.map(b => b.name);
    const oldCount = String(version).toLowerCase() === 'webc' ? 46 : 39;
    return books.filter((b, index) => testament === 'old' ? index < oldCount : index >= oldCount).map(b => b.name);
  }
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
  function normalizeSearchText(value) {
    return String(value || '').toLowerCase()
      .replace(/[’‘]/g, "'")
      .replace(/[^a-z0-9]+/g, ' ')
      .trim().replace(/\s+/g, ' ');
  }

  async function search(query, version = activeVersion, limit = 50, options = {}) {
    const normalizedQuery = normalizeSearchText(query);
    const words = normalizedQuery.match(/[a-z0-9]+/g) || [];
    if (!words.length) return [];
    const id = String(version || activeVersion).toLowerCase();
    const index = await loadSearchIndex(id);
    const lists = words.map(w => index[w] || []);
    if (lists.some(a => !a.length)) return [];
    const sets = lists.map(a => new Set(a));
    const smallest = lists.slice().sort((a,b) => a.length-b.length)[0];
    const catalog = config(id).books;
    const oldCount = id === 'webc' ? 46 : 39;
    const testament = options.testament || 'all';
    const bookFilter = options.book || 'all';
    const mode = options.mode === 'phrase' ? 'phrase' : 'all';
    const maxResults = Math.max(1, Math.min(Number(limit) || 50, 500));
    const candidates = [...new Set(smallest.filter(ref => sets.every(set => set.has(ref))))]
      .map(ref => {
        const [bookNo, chapter] = ref.split(':');
        return { ref, bookNo: Number(bookNo), chapter: String(chapter) };
      })
      .filter(item => Number.isInteger(item.bookNo) && catalog[item.bookNo])
      .filter(item => testament === 'all' || (testament === 'old' ? item.bookNo < oldCount : item.bookNo >= oldCount))
      .filter(item => bookFilter === 'all' || catalog[item.bookNo].name === bookFilter)
      .sort((a,b) => a.bookNo-b.bookNo || Number(a.chapter)-Number(b.chapter));

    const results = [];
    let loadedBookNo = -1;
    let loadedData = null;
    for (const item of candidates) {
      if (results.length >= maxResults) break;
      if (item.bookNo !== loadedBookNo) {
        loadedData = await loadBook(catalog[item.bookNo].name, id);
        loadedBookNo = item.bookNo;
      }
      const verses = loadedData.chapters[item.chapter] || {};
      for (const [verse, text] of Object.entries(verses).sort((a,b) => Number(a[0])-Number(b[0]))) {
        const normalizedText = normalizeSearchText(text);
        const matches = mode === 'phrase'
          ? normalizedText.includes(normalizedQuery)
          : words.every(word => normalizedText.split(' ').includes(word));
        if (matches) {
          results.push({ version: id, book: catalog[item.bookNo].name, chapter: item.chapter, verse, text });
          if (results.length >= maxResults) break;
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
    loadVersion, getBooks, getTestament, getChapters, loadBook, getBook, getChapter, getVerse,
    getVerseEntries, getVersionInfo, loadSearchIndex, search,
    get activeVersion() { return activeVersion; },
    get loadedBooks() { return Object.keys(cache); },
    clearCache() { Object.keys(cache).forEach(k => delete cache[k]); }
  });
})();
