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
})();
