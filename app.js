const grid = document.getElementById("libraryGrid");
const search = document.getElementById("search");
const resultCount = document.getElementById("resultCount");
const emptyState = document.getElementById("emptyState");

async function discoverPDFs() {
  const host = window.location.hostname;
  const parts = window.location.pathname.split("/").filter(Boolean);

  const owner = host.split(".")[0];
  const repo = parts[0];

  const apiUrl =
    `https://api.github.com/repos/${owner}/${repo}/git/trees/main?recursive=1`;

  const response = await fetch(apiUrl);

  if (!response.ok) {
    throw new Error("Could not access GitHub repository");
  }

  const data = await response.json();

  return data.tree
    .filter(file =>
      file.type === "blob" &&
      /^pdfs\/.+\.pdf$/i.test(file.path)
    )
    .map(file => {
      const relative = file.path.substring(5);
      const parts = relative.split("/");
      const filename = parts.pop();

      const subject = parts[0] || "General";

      return {
        subject: pretty(subject),
        title: pretty(filename.replace(/\.pdf$/i, "")),
        path: file.path
      };
    })
    .sort((a, b) =>
      a.subject.localeCompare(b.subject) ||
      a.title.localeCompare(b.title)
    );
}

function pretty(text) {
  return text
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, c => c.toUpperCase());
}

function pdfUrl(path) {
  const repo = window.location.pathname
    .split("/")
    .filter(Boolean)[0];

  return `${window.location.origin}/${repo}/${path
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;
}

function render(pdfs) {

  const query = search.value
    .trim()
    .toLowerCase();

  const filtered = pdfs.filter(pdf =>
    `${pdf.subject} ${pdf.title}`
      .toLowerCase()
      .includes(query)
  );

  resultCount.textContent =
    `${filtered.length} PDF${filtered.length === 1 ? "" : "s"}`;

  emptyState.hidden = filtered.length !== 0;

  const groups = {};

  filtered.forEach(pdf => {
    if (!groups[pdf.subject]) {
      groups[pdf.subject] = [];
    }

    groups[pdf.subject].push(pdf);
  });

  grid.innerHTML = Object.entries(groups)
    .map(([subject, pdfs]) => `

      <section class="subject">

        <div class="subject-title">

          <h3>${escapeHtml(subject)}</h3>

          <span>
            ${pdfs.length}
            PDF${pdfs.length === 1 ? "" : "s"}
          </span>

        </div>

        <div class="pdf-list">

          ${pdfs.map(pdf => `

            <a
              class="pdf-card"
              href="${pdfUrl(pdf.path)}"
              target="_blank"
              rel="noopener"
            >

              <div class="pdf-icon">
                PDF
              </div>

              <div class="pdf-info">

                <strong>
                  ${escapeHtml(pdf.title)}
                </strong>

                <small>
                  PDF document
                </small>

              </div>

              <span class="arrow">
                ↗
              </span>

            </a>

          `).join("")}

        </div>

      </section>

    `).join("");
}

function escapeHtml(value) {

  return String(value).replace(
    /[&<>"']/g,
    char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[char])
  );
}

let allPDFs = [];

search.addEventListener("input", () => {
  render(allPDFs);
});

document
  .getElementById("themeToggle")
  .addEventListener("click", () => {

    const dark =
      document.documentElement.dataset.theme === "dark";

    document.documentElement.dataset.theme =
      dark ? "" : "dark";

    localStorage.setItem(
      "theme",
      dark ? "light" : "dark"
    );
  });

if (localStorage.getItem("theme") === "dark") {
  document.documentElement.dataset.theme = "dark";
}

(async function () {

  try {

    allPDFs = await discoverPDFs();

    render(allPDFs);

  } catch (error) {

    console.error(error);

    grid.innerHTML = `
      <div class="empty">

        <h3>Could not load PDFs</h3>

        <p>
          Make sure your repository is public
          and PDFs are inside the
          <code>pdfs/</code> folder.
        </p>

      </div>
    `;
  }

})();