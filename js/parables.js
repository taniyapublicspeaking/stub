(() => {
  "use strict";
  const root = document.getElementById("parableCatalogue");
  if (!root || !Array.isArray(window.BIBLE_PARABLES)) return;
  const search = document.getElementById("parableSearch");
  const category = document.getElementById("parableCategory");
  const count = document.getElementById("parableCount");
  const detail = document.getElementById("parableDetail");
  const list = document.getElementById("parableList");
  const categories = [...new Set(window.BIBLE_PARABLES.map(p => p.category))].sort();
  categories.forEach(name => { const o = document.createElement("option"); o.value = name; o.textContent = name; category.appendChild(o); });

  function render() {
    const q = search.value.trim().toLowerCase();
    const cat = category.value;
    const rows = window.BIBLE_PARABLES.filter(p => (cat === "all" || p.category === cat) && (!q || [p.title,p.summary,p.lesson,p.category,...p.refs.flat()].join(" ").toLowerCase().includes(q)));
    count.textContent = `${rows.length} of ${window.BIBLE_PARABLES.length} parables`;
    list.replaceChildren();
    rows.forEach(p => {
      const button = document.createElement("button");
      button.type = "button"; button.className = "parable-card";
      const title = document.createElement("strong"); title.textContent = p.title;
      const tag = document.createElement("span"); tag.className = "parable-tag"; tag.textContent = p.category;
      const summary = document.createElement("span"); summary.className = "parable-summary"; summary.textContent = p.summary;
      const ref = document.createElement("span"); ref.className = "parable-reference"; ref.textContent = p.refs.map(([b,r]) => `${b} ${r}`).join(" · ");
      button.append(title,tag,summary,ref); button.addEventListener("click", () => showDetail(p)); list.appendChild(button);
    });
    if (!rows.length) { const p = document.createElement("p"); p.className = "empty-state"; p.textContent = "No parables match your search. Try another word or category."; list.appendChild(p); }
  }
  function showDetail(p) {
    detail.hidden = false; detail.replaceChildren();
    const close = document.createElement("button"); close.type = "button"; close.className = "detail-close"; close.textContent = "Close"; close.addEventListener("click", () => { detail.hidden = true; });
    const h = document.createElement("h2"); h.textContent = p.title;
    const tag = document.createElement("p"); tag.className = "parable-tag"; tag.textContent = p.category;
    const sHead = document.createElement("h3"); sHead.textContent = "The story";
    const s = document.createElement("p"); s.textContent = p.summary;
    const lHead = document.createElement("h3"); lHead.textContent = "Main teaching";
    const l = document.createElement("p"); l.textContent = p.lesson;
    const rHead = document.createElement("h3"); rHead.textContent = "Scripture references";
    const refs = document.createElement("div"); refs.className = "parable-ref-list";
    p.refs.forEach(([book,range]) => {
      const row = document.createElement("div"); row.className = "parable-ref-row";
      const label = document.createElement("span"); label.textContent = `${book} ${range}`;
      const open = document.createElement("button"); open.type = "button"; open.className = "small-action"; open.textContent = "Open in Bible Reader";
      open.addEventListener("click", () => {
        const chapter = range.split(":")[0];
        detail.hidden = true;
        if (typeof window.showBibleView === "function") window.showBibleView("reader");
        if (window.BibleReader?.openPassage) window.BibleReader.openPassage(book, chapter);
      });
      row.append(label,open); refs.appendChild(row);
    });
    detail.append(close,h,tag,sHead,s,lHead,l,rHead,refs);
    detail.scrollIntoView({behavior:"smooth",block:"start"});
  }
  search.addEventListener("input", render); category.addEventListener("change", render);
  render();
})();
