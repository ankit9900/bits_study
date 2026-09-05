const grid=document.getElementById("libraryGrid"),search=document.getElementById("search"),resultCount=document.getElementById("resultCount"),emptyState=document.getElementById("emptyState");

async function discoverPDFs(){
  const host=location.hostname, parts=location.pathname.split("/").filter(Boolean);
  const owner=host.split(".")[0], repo=parts[0];
  if(!owner||!repo) throw new Error("GitHub Pages repository not detected");
  const r=await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/main?recursive=1`,{headers:{"Accept":"application/vnd.github+json"}});
  if(!r.ok) throw new Error(`GitHub API ${r.status}`);
  const data=await r.json();
  return data.tree.filter(x=>x.type==="blob"&&/^pdfs\\/.+\\.pdf$/i.test(x.path)).map(x=>{
    const rel=x.path.slice(5), s=rel.split("/"), file=s.pop(), folder=s[0]||"General";
    return {subject:pretty(folder),title:pretty(file.replace(/\\.pdf$/i,"")),description:s.slice(1).join(" / ")?pretty(s.slice(1).join(" / ")):"PDF document",path:x.path,tags:s};
  }).sort((a,b)=>a.subject.localeCompare(b.subject)||a.title.localeCompare(b.title));
}
function pretty(v){return v.replace(/[_-]+/g," ").replace(/\\s+/g," ").trim().replace(/\\b\\w/g,c=>c.toUpperCase());}
function pdfUrl(path){const repo=location.pathname.split("/").filter(Boolean)[0];return `${location.origin}/${repo}/${path.split("/").map(encodeURIComponent).join("/")}`;}
function render(all){
  const q=search.value.trim().toLowerCase(), filtered=all.filter(p=>`${p.subject} ${p.title} ${p.description} ${p.tags.join(" ")}`.toLowerCase().includes(q));
  resultCount.textContent=`${filtered.length} PDF${filtered.length===1?"":"s"}`; emptyState.hidden=filtered.length!==0;
  const groups={}; filtered.forEach(p=>(groups[p.subject]??=[]).push(p));
  grid.innerHTML=Object.entries(groups).map(([subject,pdfs])=>`<section class="subject"><div class="subject-title"><h3>${escapeHtml(subject)}</h3><span>${pdfs.length} PDF${pdfs.length===1?"":"s"}</span></div><div class="pdf-list">${pdfs.map(p=>`<a class="pdf-card" href="${pdfUrl(p.path)}" target="_blank" rel="noopener"><div class="pdf-icon">PDF</div><div class="pdf-info"><strong>${escapeHtml(p.title)}</strong><small>${escapeHtml(p.description)}</small></div><span class="arrow">↗</span></a>`).join("")}</div></section>`).join("");
}
function escapeHtml(v){return String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));}
let allPDFs=[];
search.addEventListener("input",()=>render(allPDFs));
document.getElementById("themeToggle").addEventListener("click",()=>{const d=document.documentElement.dataset.theme==="dark";document.documentElement.dataset.theme=d?"":"dark";localStorage.setItem("theme",d?"light":"dark");});
if(localStorage.getItem("theme")==="dark") document.documentElement.dataset.theme="dark";
(async()=>{try{allPDFs=await discoverPDFs();render(allPDFs);}catch(e){console.error(e);grid.innerHTML='<div class="empty"><h3>Could not load PDFs</h3><p>Make sure the repository is public and PDFs are inside <code>pdfs/</code>.</p></div>';}})();
