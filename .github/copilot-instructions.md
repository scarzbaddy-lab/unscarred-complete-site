# Copilot instructions for this repo

Summary
- Small, static content site: mostly self-contained HTML files under root and folders like `blog/`, `learn/`, `quiz/`, `quizzes/`, and `war/`.
- No build system or package manifest detected; pages are edited directly and served as static files.

Key patterns and architecture
- Pages are standalone HTML + embedded CSS (see global tokens in `:root` at [index.html](index.html#L13-L26)).
- Common UI (header/nav) is duplicated across pages; update this block in all pages (example header in [index.html](index.html#L498-L506)).
- Some sections (notably `war/` pages) load Tailwind via CDN (`<script src="https://cdn.tailwindcss.com"></script>`), so styling approaches vary by directory (refer to [war/relationalneeds.html](war/relationalneeds.html#L9)).
- Static assets and generated folders live alongside pages (e.g., `*_files/` directories inside `blog/` pages). Treat those as generated/linked assets—preserve relative paths when renaming files.
- There is a `_redirects` file at repo root—repo is intended for static hosting (Netlify-like) but no deploy automation found.

Developer workflow notes
- Preview locally by serving the repo root as a static site (simple example):

  python -m http.server 8000

  then open http://localhost:8000 in your browser.
- Edits are applied directly to HTML files. There are no automated build or test steps; please manually verify pages and navigation after edits.

Conventions and gotchas (project-specific)
- CSS is often inline at the top of each HTML page; global variables live in `:root`. Prefer small, local edits unless intentionally changing site-wide tokens.
- Header/footer are not shared templates — update all pages when changing navigation, CTA text, or logos.
- Files ending in `_files/` are usually editor exports—avoid moving those directories without fixing references in their HTML pages.
- Minimal JS usage; avoid adding heavy JS without a plan (this is a primarily static site).

Examples to reference while working
- Update navigation: search and edit the header block in [index.html](index.html#L498-L506) and mirror changes across pages.
- Change a theme variable: edit `--primary` or other tokens in any page with a `:root` block (example in [index.html](index.html#L13-L26)).
- Tailwind pages: if editing `war/` pages, note Tailwind CSS is applied via CDN (see [war/relationalneeds.html](war/relationalneeds.html#L9)).

If you add automation
- If you introduce a templating/build tool (e.g., Gulp, Eleventy), add a brief `README.md` at repo root explaining how to build, preview, and where generated files go.

Questions for the maintainer
- Do you have a preferred deploy target (Netlify, Vercel, other) or CI already? If so, add deploy details to the README so agents can reference it.
- Are there any canonical source files or a CMS that generate these pages? If yes, note which pages are auto-generated so agents avoid editing generated files.

If anything above is inaccurate or you'd like a different tone/level of detail, tell me what to change and I will update this file.
