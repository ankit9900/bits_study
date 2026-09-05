let materials = [];
const grid = document.getElementById("libraryGrid");
const search = document.getElementById("search");
const resultCount = document.getElementById("resultCount");
const emptyState = document.getElementById("emptyState");

async function loadMaterials() {
  try {
    const response = await fetch("content.json", { cache: "no-store" });
    materials = await response.json();
    render();
  } catch (error) {
    grid.innerHTML = `<p class="empty">Could not load content.json. If you opened this file directly, use a local server or publish it on GitHub Pages.</p>`;
  }
}

function render() {
  const query = search.value.trim().toLowerCase();
  let total = 0;

  const subjects = materials.map(subject => {
    const pdfs = subject.pdfs.filter(pdf => {
      const haystack = `${subject.name} ${subject.description || ""} ${pdf.title} ${pdf.filename} ${(pdf.tags || []).join(" ")}`.toLowerCase();
      return haystack.includes(query);
    });
    total += pdfs.length;
    return { ...subject, pdfs };
  }).filter(subject => subject.pdfs.length);

  resultCount.textContent = `${total} PDF${total === 1 ? "" : "s"}`;
  emptyState.hidden = total !== 0;

  grid.innerHTML = subjects.map(subject => `
    <section class="subject">
      <div class="subject-title">
        <h3>${escapeHtml(subject.name)}</h3>
        <span>${subject.pdfs.length} PDF${subject.pdfs.length === 1 ? "" : "s"}</span>
      </div>
      <div class="pdf-list">
        ${subject.pdfs.map(pdf => `
          <a class="pdf-card" href="${encodeURI(pdf.path)}" target="_blank" rel="noopener">
            <div class="pdf-icon">PDF</div>
            <div class="pdf-info">
              <strong>${escapeHtml(pdf.title)}</strong>
              <small>${escapeHtml(pdf.description || "Open PDF")}</small>
            </div>
            <span class="arrow">↗</span>
          </a>
        `).join("")}
      </div>
    </section>
  `).join("");
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;"
  }[char]));
}

search.addEventListener("input", render);

document.getElementById("themeToggle").addEventListener("click", () => {
  const dark = document.documentElement.dataset.theme === "dark";
  document.documentElement.dataset.theme = dark ? "" : "dark";
  localStorage.setItem("theme", dark ? "light" : "dark");
});

if (localStorage.getItem("theme") === "dark") {
  document.documentElement.dataset.theme = "dark";
}

loadMaterials();
