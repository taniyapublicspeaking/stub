(() => {
  "use strict";

  const SUPPORTED_VERSIONS = ["kjv", "web", "webc"];

  const versionSelect = document.getElementById("versionSelect");
  const testamentSelect = document.getElementById("testamentSelect");
  const bookSelect = document.getElementById("bookSelect");
  const chapterSelect = document.getElementById("chapterSelect");
  const voiceSelect = document.getElementById("voiceSelect");
  const verseList = document.getElementById("verseList");
  const passageTitle = document.getElementById("passageTitle");
  const versionLabel = document.getElementById("versionLabel");
  const verseCount = document.getElementById("verseCount");
  const statusMessage = document.getElementById("statusMessage");
  const readButton = document.getElementById("readButton");
  const stopButton = document.getElementById("stopButton");
  const prevButton = document.getElementById("prevButton");
  const nextButton = document.getElementById("nextButton");


  let currentData = null;
  let currentVersion = "kjv";
  let currentUtterance = null;
  let activeVerse = null;
  let voices = [];

  function setStatus(message) { statusMessage.textContent = message; }

  function loadVersion(version, autoPopulate = true) {
    if (!SUPPORTED_VERSIONS.includes(version)) return Promise.resolve(false);
    stopReading();
    currentVersion = version;
    versionSelect.value = version;
    currentData = null;
    verseList.innerHTML = '<p class="status">Loading Bible catalogue…</p>';
    return window.BibleEngine.loadVersion(version).then(data => {
      if (currentVersion !== version) return false;
      currentData = data;
      if (autoPopulate) populateBooks(true);
      return data;
    }).catch(error => {
      verseList.innerHTML = '';
      setStatus(error.message || 'Could not load this Bible version.');
      return false;
    });
  }

  function populateBooks(preserveSelection = false, loadChapters = true) {
    const previousBook = bookSelect.value;
    const books = window.BibleEngine.getBooks(currentVersion, testamentSelect.value);
    bookSelect.innerHTML = '';
    books.forEach(book => {
      const option = document.createElement('option');
      option.value = book; option.textContent = book; bookSelect.appendChild(option);
    });
    bookSelect.value = preserveSelection && books.includes(previousBook)
      ? previousBook : (books.includes('Genesis') ? 'Genesis' : books[0]);
    if (loadChapters) populateChapters();
  }

  async function populateChapters() {
    const book = bookSelect.value;
    if (!book) return;
    stopReading();
    chapterSelect.innerHTML = '<option>Loading…</option>';
    verseList.innerHTML = '<p class="status">Loading ' + book + '…</p>';
    try {
      await window.BibleEngine.loadBook(book, currentVersion);
      if (book !== bookSelect.value) return;
      const chapters = window.BibleEngine.getChapters(book, currentVersion);
      chapterSelect.innerHTML = '';
      chapters.forEach(chapter => {
        const option = document.createElement('option');
        option.value = chapter; option.textContent = chapter; chapterSelect.appendChild(option);
      });
      chapterSelect.value = chapters[0] || '';
      await renderChapter();
    } catch (error) { setStatus(error.message); }
  }

  async function renderChapter() {
    if (!currentData) return;
    const book = bookSelect.value;
    const chapter = chapterSelect.value;
    if (!book || !chapter) return;
    stopReading();
    verseList.innerHTML = '<p class="status">Loading chapter…</p>';
    try {
      await window.BibleEngine.loadBook(book, currentVersion);
      if (book !== bookSelect.value || chapter !== chapterSelect.value) return;
      const entries = window.BibleEngine.getVerseEntries(book, chapter, currentVersion);
      passageTitle.textContent = `${book} ${chapter}`;
      versionLabel.textContent = currentData.abbreviation || currentData.name.toUpperCase();
      verseCount.textContent = `${entries.length} ${entries.length === 1 ? 'verse' : 'verses'}`;
      verseList.innerHTML = '';
      entries.forEach(([number, text]) => {
        const card = document.createElement('article');
        card.className = 'verse-card'; card.id = `verse-${number}`;
        const badge = document.createElement('span'); badge.className = 'verse-number'; badge.textContent = number;
        const content = document.createElement('div');
        const verseText = document.createElement('p'); verseText.className = 'verse-text'; verseText.textContent = text;
        const actions = document.createElement('div'); actions.className = 'verse-actions';
        const speak = document.createElement('button'); speak.className = 'verse-read'; speak.type = 'button';
        speak.textContent = '▶ Read this verse';
        speak.addEventListener('click', () => speakText(text, card, `${book} ${chapter}:${number}`));
        actions.appendChild(speak); content.append(verseText, actions); card.append(badge, content); verseList.appendChild(card);
      });
      prevButton.disabled = isFirstChapter(); nextButton.disabled = isLastChapter();
      setStatus('Ready to read. Choose “Read chapter” or read an individual verse.');
    } catch (error) { verseList.innerHTML = ''; setStatus(error.message); }
  }

  function getChapterPosition() {
    const books = window.BibleEngine.getBooks(currentVersion, testamentSelect.value);
    const bookIndex = books.indexOf(bookSelect.value);
    const chapters = window.BibleEngine.getChapters(bookSelect.value, currentVersion);
    const chapterIndex = chapters.indexOf(chapterSelect.value);
    return { books, bookIndex, chapters, chapterIndex };
  }

  function isFirstChapter() {
    const p = getChapterPosition();
    return p.bookIndex === 0 && p.chapterIndex === 0;
  }

  function isLastChapter() {
    const p = getChapterPosition();
    return p.bookIndex === p.books.length - 1 && p.chapterIndex === p.chapters.length - 1;
  }

  async function moveChapter(direction) {
    const p = getChapterPosition();
    let bookIndex = p.bookIndex;
    let chapterIndex = p.chapterIndex + direction;
    if (chapterIndex < 0) {
      bookIndex--;
      if (bookIndex < 0) return;
      chapterIndex = window.BibleEngine.getChapters(p.books[bookIndex], currentVersion).length - 1;
    } else if (chapterIndex >= p.chapters.length) {
      bookIndex++;
      if (bookIndex >= p.books.length) return;
      chapterIndex = 0;
    }
    const targetBook = p.books[bookIndex];
    bookSelect.value = targetBook;
    await window.BibleEngine.loadBook(targetBook, currentVersion);
    const targetChapters = window.BibleEngine.getChapters(targetBook, currentVersion);
    chapterSelect.innerHTML = "";
    targetChapters.forEach(ch => { const option = document.createElement("option"); option.value = ch; option.textContent = ch; chapterSelect.appendChild(option); });
    chapterSelect.value = targetChapters[chapterIndex];
    await renderChapter();
  }

  function populateVoices() {
    if (!("speechSynthesis" in window)) {
      voiceSelect.disabled = true;
      readButton.disabled = true;
      setStatus("Voice reading is not supported by this browser.");
      return;
    }
    voices = window.speechSynthesis.getVoices();
    const previous = voiceSelect.value;
    voiceSelect.innerHTML = '<option value="">Default voice</option>';
    voices.forEach((voice, index) => {
      const option = document.createElement("option");
      option.value = String(index);
      option.textContent = `${voice.name} (${voice.lang})`;
      voiceSelect.appendChild(option);
    });
    if (previous && voices[Number(previous)]) voiceSelect.value = previous;
  }

  function clearActiveVerse() {
    if (activeVerse) activeVerse.classList.remove("is-speaking");
    activeVerse = null;
  }

  function speakText(text, card, label) {
    if (!("speechSynthesis" in window)) {
      setStatus("Your browser does not support text-to-speech.");
      return;
    }
    stopReading();
    const utterance = new SpeechSynthesisUtterance(text);
    const selectedVoice = voiceSelect.value;
    if (selectedVoice !== "" && voices[Number(selectedVoice)]) {
      utterance.voice = voices[Number(selectedVoice)];
      utterance.lang = utterance.voice.lang;
    } else {
      utterance.lang = "en";
    }
    utterance.rate = 0.92;
    utterance.pitch = 1;
    utterance.onstart = () => {
      currentUtterance = utterance;
      activeVerse = card || null;
      if (activeVerse) activeVerse.classList.add("is-speaking");
      stopButton.disabled = false;
      readButton.disabled = true;
      setStatus(`Reading ${label || "verse"}…`);
    };
    utterance.onend = () => {
      clearActiveVerse();
      currentUtterance = null;
      stopButton.disabled = true;
      readButton.disabled = false;
      setStatus("Reading finished.");
    };
    utterance.onerror = () => {
      clearActiveVerse();
      currentUtterance = null;
      stopButton.disabled = true;
      readButton.disabled = false;
      setStatus("Voice reading stopped or could not be completed.");
    };
    window.speechSynthesis.speak(utterance);
  }

  async function readChapter() {
    const book = bookSelect.value;
    const chapter = chapterSelect.value;
    await window.BibleEngine.loadBook(book, currentVersion);
    const verses = window.BibleEngine.getChapter(book, chapter, currentVersion);
    // Keep verse numbers visible in the interface, but speak only Scripture text.
    const text = Object.entries(verses)
      .sort((a, b) => parseInt(a[0], 10) - parseInt(b[0], 10))
      .map(([, verse]) => String(verse).trim())
      .filter(Boolean)
      .join("\n");
    speakText(text, null, `${book} ${chapter}`);
  }

  function stopReading() {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    clearActiveVerse();
    currentUtterance = null;
    stopButton.disabled = true;
    readButton.disabled = false;
  }


  // Appearance controls are managed globally by app.js so every section shares them.

  versionSelect.addEventListener("change", event => loadVersion(event.target.value));
  testamentSelect.addEventListener("change", () => populateBooks(false));
  bookSelect.addEventListener("change", populateChapters);
  chapterSelect.addEventListener("change", renderChapter);
  prevButton.addEventListener("click", () => moveChapter(-1));
  nextButton.addEventListener("click", () => moveChapter(1));
  readButton.addEventListener("click", readChapter);
  stopButton.addEventListener("click", stopReading);

  // Public bridge used by catalogue entries to open a cited passage in the reader.
  window.BibleReader = {
    async openPassage(book, chapter, verseReference, requestedVersion) {
      if (requestedVersion && requestedVersion !== currentVersion) await loadVersion(requestedVersion, false);
      if (!currentData) return false;
      const books = window.BibleEngine.getBooks(currentVersion);
      const alias = books.includes(book) ? book : (book === 'Daniel' && books.includes('Daniel (Greek)') ? 'Daniel (Greek)' : (book === 'Esther' && books.includes('Esther (Greek)') ? 'Esther (Greek)' : book));
      if (!books.includes(alias)) return false;
      const targetTestament = window.BibleEngine.getTestament(alias, currentVersion);
      if (testamentSelect.value !== 'all' && testamentSelect.value !== targetTestament) testamentSelect.value = targetTestament;
      populateBooks(true, false);
      bookSelect.value = alias;
      await window.BibleEngine.loadBook(alias, currentVersion);
      const chapters = window.BibleEngine.getChapters(alias, currentVersion);
      const requested = String(chapter);
      if (!chapters.includes(requested)) return false;
      chapterSelect.innerHTML = "";
      chapters.forEach(ch => { const option = document.createElement("option"); option.value = ch; option.textContent = ch; chapterSelect.appendChild(option); });
      chapterSelect.value = requested;
      await renderChapter();
      highlightVerseReference(verseReference);
      return true;
    }
  };

  function highlightVerseReference(reference) {
    document.querySelectorAll('.verse-card.is-reference-highlight').forEach(el => el.classList.remove('is-reference-highlight'));
    if (reference === undefined || reference === null || String(reference).trim() === '') return;
    const wanted = new Set();
    String(reference).split(',').forEach(part => {
      const match = part.trim().match(/^(\d+)(?:\s*[-–]\s*(\d+))?$/);
      if (!match) return;
      const first = Number(match[1]), last = Number(match[2] || match[1]);
      for (let n = Math.min(first, last); n <= Math.max(first, last); n++) wanted.add(String(n));
    });
    wanted.forEach(number => {
      const card = document.getElementById('verse-' + number);
      if (card) card.classList.add('is-reference-highlight');
    });
    const firstCard = document.getElementById('verse-' + [...wanted][0]);
    if (firstCard) firstCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  if ("speechSynthesis" in window) {
    populateVoices();
    window.speechSynthesis.onvoiceschanged = populateVoices;
  }
  loadVersion("kjv");
})();
