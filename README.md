# My Study Library

A simple static website for publishing and organizing PDF study material.

## Add a PDF

1. Put the PDF in an appropriate folder under `pdfs/`.
2. Open `content.json`.
3. Add an object under the relevant subject's `"pdfs"` array.
4. Commit and push to GitHub.

Example:

```json
{
  "title": "Unit 2 Notes",
  "description": "Processes and threads",
  "filename": "unit-2.pdf",
  "path": "pdfs/operating-systems/unit-2.pdf",
  "tags": ["os", "processes", "threads"]
}
```

## Publish with GitHub Pages

1. Create a GitHub repository and upload all files in this folder.
2. In the repository, open **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select your main branch and `/ (root)`.
5. Save.
6. GitHub will provide your site URL.

## Important

Do not publish PDFs you do not have permission to distribute. Also avoid putting private or confidential documents in a public repository.

## Local preview

Because the site loads `content.json`, opening `index.html` directly may be blocked by your browser's local-file security. Use a simple local server, for example:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.
