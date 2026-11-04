(() => {
  "use strict";
  const list = document.getElementById("prophetList");
  if (!list || !Array.isArray(window.BIBLE_PROPHETS)) return;
  const search = document.getElementById("prophetSearch");
  const filter = document.getElementById("prophetFilter");
  const count = document.getElementById("prophetCount");
  const detail = document.getElementById("prophetDetail");
  const escapeText = value => String(value ?? "");
  function matchesFilter(p, value) {
    if (value === "all") return true;
    if (value === "Old Testament" || value === "New Testament") return p.testament === value;
    return p.group === value;
  }
  function render() {
    const q = search.value.trim().toLowerCase();
    const rows = window.BIBLE_PROPHETS.filter(p => matchesFilter(p, filter.value) && [p.name,p.testament,p.group,p.period,p.role,p.summary,...p.refs.map(([b,c])=>`${b} ${c}`)].join(" ").toLowerCase().includes(q));
    count.textContent = `${rows.length} of ${window.BIBLE_PROPHETS.length} entries`;
    list.replaceChildren();
    rows.forEach(p => {
      const card = document.createElement("button"); card.type = "button"; card.className = "prophet-card";
      const name = document.createElement("strong"); name.textContent = p.name;
      const tag = document.createElement("span"); tag.className = "prophet-tag"; tag.textContent = p.group;
      const period = document.createElement("span"); period.className = "prophet-period"; period.textContent = `${p.testament} · ${p.period}`;
      const role = document.createElement("span"); role.className = "prophet-role"; role.textContent = p.role;
      const refs = document.createElement("span"); refs.className = "prophet-refs"; refs.textContent = p.refs.map(([b,c])=>`${b} ${c}`).join(" · ");
      card.append(name,tag,period,role,refs); card.addEventListener("click",()=>showDetail(p)); list.appendChild(card);
    });
    if (!rows.length) { const empty=document.createElement("p"); empty.className="empty-state"; empty.textContent="No entries match your search. Try another name, period or category."; list.appendChild(empty); }
  }
  function showDetail(p) {
    detail.hidden=false; detail.replaceChildren();
    const close=document.createElement("button"); close.type="button"; close.className="detail-close"; close.textContent="Close"; close.addEventListener("click",()=>detail.hidden=true);
    const h=document.createElement("h2"); h.textContent=p.name;
    const meta=document.createElement("p"); meta.className="prophet-tag"; meta.textContent=`${p.testament} · ${p.group} · ${p.period}`;
    const role=document.createElement("p"); role.textContent=p.role;
    const summaryHead=document.createElement("h3"); summaryHead.textContent="Overview";
    const summary=document.createElement("p"); summary.textContent=p.summary;
    const refsHead=document.createElement("h3"); refsHead.textContent="Scripture references";
    const refs=document.createElement("div"); refs.className="prophet-ref-list";
    p.refs.forEach(([book,chapter])=>{
      const row=document.createElement("div"); row.className="prophet-ref-row";
      const label=document.createElement("span"); label.textContent=`${book} ${chapter}`;
      const open=document.createElement("button"); open.type="button"; open.className="small-action"; open.textContent="Open in Bible Reader";
      open.addEventListener("click",()=>{
        if (typeof window.showBibleView === "function") window.showBibleView("reader");
        if (window.BibleReader?.openPassage) window.BibleReader.openPassage(book,chapter);
      });
      row.append(label,open); refs.appendChild(row);
    });
    detail.append(close,h,meta,role,summaryHead,summary,refsHead,refs);
    detail.scrollIntoView({behavior:"smooth",block:"start"});
  }
  search.addEventListener("input",render); filter.addEventListener("change",render); render();
})();
