(() => {
  "use strict";
  const labels = {dashboard:"Dashboard",reader:"Bible Reader",explorer:"Bible Explorer",parables:"Parables",prophets:"Prophets",apostles:"Apostles",characters:"People & Characters",angels:"Angels",miracles:"Miracles",events:"Events",places:"Places",teachings:"Teachings",genealogy:"Genealogy",chronology:"Chronology",search:"Bible Search",comparison:"Compare Versions"};
  const navButtons=[...document.querySelectorAll("[data-view]")], goButtons=[...document.querySelectorAll("[data-go]")], views=[...document.querySelectorAll(".view")];
  const pageLabel=document.getElementById("currentPageLabel"), title=document.getElementById("placeholderTitle"), copy=document.getElementById("placeholderText"), submenu=document.getElementById("explorerSubmenu"), sidebar=document.getElementById("sidebar");
  function showView(name){if(!labels[name])return;views.forEach(v=>v.classList.remove("active-view"));const target=document.getElementById(`view-${name}`);if(target)target.classList.add("active-view");else{document.getElementById("view-placeholder").classList.add("active-view");title.textContent=labels[name];copy.textContent=`${labels[name]} is part of the planned Bible Information Centre. Its structured local catalogue and interactive features will be added in a later development phase. Scripture references in this section will connect to the currently selected Bible translation.`;}
    const explorerItems=["explorer","parables","prophets","apostles","characters","angels","miracles","events","places","teachings"];
    navButtons.forEach(b=>b.classList.toggle("active",b.dataset.view===name||(explorerItems.includes(name)&&b.dataset.view==="explorer")));
    if(explorerItems.includes(name))submenu.classList.add("open");pageLabel.textContent=labels[name];sidebar.classList.remove("sidebar-open");window.scrollTo({top:0,behavior:"smooth"});}
  window.showBibleView=showView;
  navButtons.forEach(b=>b.addEventListener("click",()=>showView(b.dataset.view)));goButtons.forEach(b=>b.addEventListener("click",()=>showView(b.dataset.go)));
  const shell=document.querySelector(".app-shell");
  const menuToggle=document.getElementById("menuToggle");
  let panelCollapsed=false;
  try { panelCollapsed=localStorage.getItem("bibleSidebarCollapsed")==="true"; } catch(error) {}
  function setPanelState(collapsed){
    panelCollapsed=collapsed;
    shell.classList.toggle("sidebar-collapsed",collapsed);
    menuToggle.setAttribute("aria-expanded",String(!collapsed));
    menuToggle.setAttribute("aria-label",collapsed?"Maximise navigation panel":"Minimise navigation panel");
    menuToggle.title=collapsed?"Maximise navigation panel":"Minimise navigation panel";
    menuToggle.textContent=collapsed?"☰":"☰";
    try { localStorage.setItem("bibleSidebarCollapsed",String(collapsed)); } catch(error) {}
  }
  setPanelState(panelCollapsed);
  menuToggle.addEventListener("click",()=>{
    if(window.matchMedia("(max-width: 760px)").matches){sidebar.classList.toggle("sidebar-open");menuToggle.setAttribute("aria-expanded",String(sidebar.classList.contains("sidebar-open")));}
    else setPanelState(!panelCollapsed);
  });
  document.addEventListener("keydown",e=>{if(e.key==="Escape")sidebar.classList.remove("sidebar-open");});
  showView("dashboard");

  // Site-wide Day/Night mode and reading-size controls (persist locally when available).
  const themeButton=document.getElementById("globalThemeToggle");
  const sizeDown=document.getElementById("globalFontDecrease");
  const sizeReset=document.getElementById("globalFontReset");
  const sizeUp=document.getElementById("globalFontIncrease");
  const SIZE_DEFAULT=1, SIZE_MIN=.85, SIZE_MAX=1.5, SIZE_STEP=.1;
  let readingScale=SIZE_DEFAULT;
  let theme="day";
  try { theme=localStorage.getItem("bibleAppTheme")||"day"; const stored=Number(localStorage.getItem("bibleAppReadingScale")); if(Number.isFinite(stored)&&stored>=SIZE_MIN&&stored<=SIZE_MAX)readingScale=stored; } catch(error) {}
  function applyTheme(value){theme=value==="night"?"night":"day";document.body.classList.toggle("night-mode",theme==="night");themeButton.textContent=theme==="night"?"☀ Day":"☾ Night";themeButton.setAttribute("aria-pressed",String(theme==="night"));try{localStorage.setItem("bibleAppTheme",theme)}catch(error){}}
  function applyScale(value){readingScale=Math.max(SIZE_MIN,Math.min(SIZE_MAX,Math.round(value*100)/100));document.documentElement.style.setProperty("--app-reading-scale",String(readingScale));sizeDown.disabled=readingScale<=SIZE_MIN;sizeUp.disabled=readingScale>=SIZE_MAX;try{localStorage.setItem("bibleAppReadingScale",String(readingScale))}catch(error){}}
  themeButton.addEventListener("click",()=>applyTheme(theme==="night"?"day":"night"));
  sizeDown.addEventListener("click",()=>applyScale(readingScale-SIZE_STEP));
  sizeReset.addEventListener("click",()=>applyScale(SIZE_DEFAULT));
  sizeUp.addEventListener("click",()=>applyScale(readingScale+SIZE_STEP));
  applyTheme(theme);applyScale(readingScale);

})();
