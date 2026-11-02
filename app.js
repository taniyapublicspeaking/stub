(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const testamentSelect = $("testamentSelect");
  const bookSelect = $("bookSelect");
  const chapterSelect = $("chapterSelect");
  const versesEl = $("verses");
  let currentBook = "Genesis";
  let currentChapter = 1;

  const oldBooks = BibleContent.metadata.testaments.old.books;
  const newBooks = BibleContent.metadata.testaments.new.books;

  function activeBooks() {
    return testamentSelect.value === "old" ? oldBooks : newBooks;
  }

  function populateBooks(preferredBook) {
    const books = activeBooks();
    bookSelect.replaceChildren();
    books.forEach(book => {
      const option = document.createElement("option");
      option.value = book;
      option.textContent = book;
      bookSelect.append(option);
    });
    currentBook = books.includes(preferredBook) ? preferredBook : books[0];
    bookSelect.value = currentBook;
    populateChapters(1);
  }

  function populateChapters(preferredChapter) {
    const chapters = Object.keys(BibleContent.books[currentBook].chapters);
    chapterSelect.replaceChildren();
    chapters.forEach(chapter => {
      const option = document.createElement("option");
      option.value = chapter;
      option.textContent = `Chapter ${chapter}`;
      chapterSelect.append(option);
    });
    currentChapter = chapters.includes(String(preferredChapter)) ? Number(preferredChapter) : 1;
    chapterSelect.value = String(currentChapter);
    renderChapter();
  }

  function renderChapter() {
    const bookData = BibleContent.books[currentBook];
    const chapterVerses = bookData.chapters[String(currentChapter)];
    const testamentName = bookData.testament === "old" ? "OLD TESTAMENT" : "NEW TESTAMENT";
    $("testamentLabel").textContent = testamentName;
    $("chapterTitle").textContent = `${currentBook} ${currentChapter}`;
    $("chapterMeta").textContent = `${chapterVerses.length} verses`;
    $("footerReference").textContent = `${BibleContent.metadata.title} · ${BibleContent.metadata.edition}`;
    versesEl.replaceChildren();

    chapterVerses.forEach((text, index) => {
      const panel = document.createElement("article");
      panel.className = "verse-panel";
      panel.id = `verse-${index + 1}`;
      const number = document.createElement("span");
      number.className = "verse-number";
      number.textContent = index + 1;
      const verseText = document.createElement("p");
      verseText.className = "verse-text";
      verseText.textContent = text;
      panel.append(number, verseText);
      versesEl.append(panel);
    });

    const chapterNumbers = Object.keys(bookData.chapters).map(Number);
    const bookList = activeBooks();
    const bookIndex = bookList.indexOf(currentBook);
    $("prevChapter").disabled = bookIndex === 0 && currentChapter === chapterNumbers[0];
    $("nextChapter").disabled = bookIndex === bookList.length - 1 &&
      currentChapter === chapterNumbers[chapterNumbers.length - 1];
    window.scrollTo({top: 0, behavior: "smooth"});
  }

  function moveChapter(direction) {
    const chapters = Object.keys(BibleContent.books[currentBook].chapters).map(Number);
    const index = chapters.indexOf(currentChapter);
    const next = chapters[index + direction];
    if (next !== undefined) {
      currentChapter = next;
      chapterSelect.value = String(next);
      renderChapter();
      return;
    }
    const books = activeBooks();
    const nextBook = books[books.indexOf(currentBook) + direction];
    if (nextBook) {
      currentBook = nextBook;
      bookSelect.value = nextBook;
      const nextChapters = Object.keys(BibleContent.books[nextBook].chapters).map(Number);
      currentChapter = direction > 0 ? nextChapters[0] : nextChapters[nextChapters.length - 1];
      populateChapters(currentChapter);
    }
  }

  testamentSelect.addEventListener("change", () => populateBooks());
  bookSelect.addEventListener("change", () => {
    currentBook = bookSelect.value;
    populateChapters(1);
  });
  chapterSelect.addEventListener("change", () => {
    currentChapter = Number(chapterSelect.value);
    renderChapter();
  });
  $("prevChapter").addEventListener("click", () => moveChapter(-1));
  $("nextChapter").addEventListener("click", () => moveChapter(1));
  $("topButton").addEventListener("click", () => window.scrollTo({top: 0, behavior: "smooth"}));
  $("themeToggle").addEventListener("click", () => {
    document.body.classList.toggle("dark");
    const dark = document.body.classList.contains("dark");
    $("themeToggle").setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
    try { localStorage.setItem("bible-presenter-theme", dark ? "dark" : "light"); } catch (_) {}
  });

  try {
    if (localStorage.getItem("bible-presenter-theme") === "dark") document.body.classList.add("dark");
  } catch (_) {}

  populateBooks("Genesis");
})();
