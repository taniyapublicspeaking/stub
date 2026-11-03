(() => {
  "use strict";

  const DATA_FILES = {
    kjv: "data/kjv-content.js",
    web: "data/web-content.js",
    webster: "data/webster-content.js"
  };

  const versionSelect = document.getElementById("versionSelect");
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

  function loadVersion(version) {
    if (!DATA_FILES[version]) return;
    stopReading();
    currentVersion = version;
    currentData = null;
    verseList.innerHTML = '<p class="status">Loading selected Bible version…</p>';

    // Reuse the initially loaded KJV script; load the other data files on demand.
    if (version === "kjv" && window.BIBLE_DATA && window.BIBLE_DATA.version.startsWith("King James")) {
      currentData = window.BIBLE_DATA;
      populateBooks();
      return;
    }

    const script = document.createElement("script");
    script.src = DATA_FILES[version];
    script.onload = () => {
      currentData = window.BIBLE_DATA;
      populateBooks();
    };
    script.onerror = () => {
      verseList.innerHTML = "";
      setStatus("Could not load this Bible data file. Check that the data folder is alongside app.js.");
    };
    document.querySelectorAll("script[data-bible-version]").forEach(node => node.remove());
    script.dataset.bibleVersion = version;
    document.body.appendChild(script);
  }

  function populateBooks() {
    const books = Object.keys(currentData.books);
    bookSelect.innerHTML = "";
    books.forEach(book => {
      const option = document.createElement("option");
      option.value = book;
      option.textContent = book;
      bookSelect.appendChild(option);
    });
    // Begin at Genesis when present, otherwise use the first supplied book.
    bookSelect.value = books.includes("Genesis") ? "Genesis" : books[0];
    populateChapters();
  }

  function populateChapters() {
    const chapters = Object.keys(currentData.books[bookSelect.value] || {});
    chapterSelect.innerHTML = "";
    chapters.forEach(chapter => {
      const option = document.createElement("option");
      option.value = chapter;
      option.textContent = chapter;
      chapterSelect.appendChild(option);
    });
    chapterSelect.value = chapters[0] || "";
    renderChapter();
  }

  function renderChapter() {
    if (!currentData) return;
    stopReading();
    const book = bookSelect.value;
    const chapter = chapterSelect.value;
    const verses = currentData.books?.[book]?.[chapter] || {};
    const entries = Object.entries(verses).sort((a, b) => Number(a[0]) - Number(b[0]));

    passageTitle.textContent = `${book} ${chapter}`;
    versionLabel.textContent = currentData.version.toUpperCase();
    verseCount.textContent = `${entries.length} ${entries.length === 1 ? "verse" : "verses"}`;
    verseList.innerHTML = "";

    entries.forEach(([number, text]) => {
      const card = document.createElement("article");
      card.className = "verse-card";
      card.id = `verse-${number}`;

      const badge = document.createElement("span");
      badge.className = "verse-number";
      badge.textContent = number;

      const content = document.createElement("div");
      const verseText = document.createElement("p");
      verseText.className = "verse-text";
      verseText.textContent = text;

      const actions = document.createElement("div");
      actions.className = "verse-actions";
      const speak = document.createElement("button");
      speak.className = "verse-read";
      speak.type = "button";
      speak.textContent = "▶ Read this verse";
      speak.addEventListener("click", () => speakText(text, card, `${book} ${chapter}:${number}`));

      actions.appendChild(speak);
      content.append(verseText, actions);
      card.append(badge, content);
      verseList.appendChild(card);
    });

    prevButton.disabled = isFirstChapter();
    nextButton.disabled = isLastChapter();
    setStatus("Ready to read. Choose “Read chapter” or read an individual verse.");
  }

  function getChapterPosition() {
    const books = Object.keys(currentData.books);
    const bookIndex = books.indexOf(bookSelect.value);
    const chapters = Object.keys(currentData.books[bookSelect.value]);
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

  function moveChapter(direction) {
    const p = getChapterPosition();
    let bookIndex = p.bookIndex;
    let chapterIndex = p.chapterIndex + direction;
    if (chapterIndex < 0) {
      bookIndex--;
      if (bookIndex < 0) return;
      chapterIndex = Object.keys(currentData.books[p.books[bookIndex]]).length - 1;
    } else if (chapterIndex >= p.chapters.length) {
      bookIndex++;
      if (bookIndex >= p.books.length) return;
      chapterIndex = 0;
    }
    bookSelect.value = p.books[bookIndex];
    populateChapters();
    chapterSelect.value = Object.keys(currentData.books[bookSelect.value])[chapterIndex];
    renderChapter();
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

  function readChapter() {
    const book = bookSelect.value;
    const chapter = chapterSelect.value;
    const verses = currentData.books[book][chapter];
    const text = Object.entries(verses)
      .sort((a, b) => Number(a[0]) - Number(b[0]))
      .map(([number, verse]) => `Verse ${number}. ${verse}`)
      .join(" ");
    speakText(text, null, `${book} ${chapter}`);
  }

  function stopReading() {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    clearActiveVerse();
    currentUtterance = null;
    stopButton.disabled = true;
    readButton.disabled = false;
  }

  versionSelect.addEventListener("change", event => loadVersion(event.target.value));
  bookSelect.addEventListener("change", populateChapters);
  chapterSelect.addEventListener("change", renderChapter);
  prevButton.addEventListener("click", () => moveChapter(-1));
  nextButton.addEventListener("click", () => moveChapter(1));
  readButton.addEventListener("click", readChapter);
  stopButton.addEventListener("click", stopReading);

  if ("speechSynthesis" in window) {
    populateVoices();
    window.speechSynthesis.onvoiceschanged = populateVoices;
  }
  loadVersion("kjv");
})();
