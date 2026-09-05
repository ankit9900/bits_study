let allPDFs=[];

const grid=document.getElementById("libraryGrid");
const search=document.getElementById("search");
const resultCount=document.getElementById("resultCount");
const emptyState=document.getElementById("emptyState");

async function loadPDFs(){
  const response=await fetch("content.json?"+Date.now());
  if(!response.ok) throw new Error("content.json could not be loaded");
  return await response.json();
}

function render(){
  const q=search.value.trim().toLowerCase();
  const filtered=allPDFs.filter(p =>
    `${p.subject} ${p.title} ${p.filename}`.toLowerCase().includes(q)
  );

  resultCount.textContent=`${filtered.length} PDF${filtered.length===1?"":"s"}`;
  emptyState.hidden=filtered.length!==0;

  const groups={};
  filtered.forEach(p=>{
    if(!groups[p.subject]) groups[p.subject]=[];
    groups[p.subject].push(p);
  });

  grid.innerHTML=Object.entries(groups).map(([subject,pdfs])=>`
    <section class="subject">
      <div class="subject-title">
        <h3>${escapeHtml(subject)}</h3>
        <span>${pdfs.length} PDF${pdfs.length===1?"":"s"}</span>
      </div>
      <div class="pdf-list">
        ${pdfs.map(p=>`
          <a class="pdf-card" href="${encodeURI(p.path)}" target="_blank" rel="noopener">
            <div class="pdf-icon">PDF</div>
            <div class="pdf-info">
              <strong>${escapeHtml(p.title)}</strong>
              <small>${escapeHtml(p.filename)}</small>
            </div>
            <span class="arrow">↗</span>
          </a>
        `).join("")}
      </div>
    </section>
  `).join("");
}

function escapeHtml(v){
  return String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
}

search.addEventListener("input",render);

document.getElementById("themeToggle").addEventListener("click",()=>{
  const dark=document.documentElement.dataset.theme==="dark";
  document.documentElement.dataset.theme=dark?"":"dark";
  localStorage.setItem("theme",dark?"light":"dark");
});

if(localStorage.getItem("theme")==="dark") document.documentElement.dataset.theme="dark";

(async()=>{
  try{
    allPDFs=await loadPDFs();
    render();
  }catch(error){
    console.error(error);
    grid.innerHTML=`<div class="empty"><h3>PDF list is not available yet</h3><p>Commit your files and wait for the GitHub Action to finish.</p></div>`;
  }
})();
