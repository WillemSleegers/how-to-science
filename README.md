# how-to-science

A documentation and teaching site built with **Astro 6**, **React**, and **shadcn/ui**. Code-heavy pages are authored in **Quarto** (`.qmd`) and rendered to Markdown before Astro serves them.

## Stack

- **Astro 6** — static site generation and routing
- **React + TypeScript** — interactive components
- **shadcn/ui** — UI primitives
- **Quarto** — executes R/Python code blocks and renders `.qmd` → `.md`
- **Pandoc + Lua** — citation shortcode processing during Quarto render

## Project structure

```text
content/       # All page content (.md and .qmd), organized by topic
src/           # Astro app code (components, layouts, pages, styles)
assets/        # Bibliography (.bib) and paper notes
public/        # Static files and Quarto-generated figures
scripts/       # render.mjs — renders .qmd files to .md
_extensions/   # Quarto Lua extensions (cite-quote shortcode)
_nav.yml       # Site navigation — drives all routes
```

## Content types

### Prose pages (`.md`)

Plain Markdown; Astro reads and serves directly. Use for pages with no executed code.

### Code pages (`.qmd`)

Quarto source with executable R/Python chunks. Rendered to `.md` by `scripts/render.mjs` before Astro builds. The `.md` output is what Astro actually reads.

Run all stale files:

```bash
npm run render
```

Run a single file:

```bash
npm run render -- content/path/to/file.qmd
```

## Adding a page

1. Create `content/<section>/<topic>/index.md` (prose) or `index.qmd` (code).
2. Add the path to `_nav.yml` under the appropriate group — routes are driven entirely by this file.
3. For `.qmd` files, run `npm run render` to produce the `.md` Astro reads.

Frontmatter fields:

```yaml
---
title: "Page Title"
toc: true       # enables right-sidebar TOC
order: 1        # controls ordering within a nav group
---
```

## Navigation

`_nav.yml` defines the full site structure. A page not listed there will not appear on the site, even if the file exists.

```yaml
- group: Methodology
  items:
    - title: AI
      items:
        - path: methodology/ai/synthetic-respondents
```

The `path` is relative to `content/`, without the `.md` extension or `/index` suffix.

## Citation shortcode

The `{{< cite >}}` shortcode renders an inline citation that opens a side panel with supporting quotes when clicked.

### Basic usage

```markdown
{{< cite key "Quote text." >}}
{{< cite key "Quote text." 42 >}}
```

The last argument is treated as a page number if it is a bare integer.

### Multiple quotes

Pass additional quoted strings to show a list of blockquotes in the panel:

```markdown
{{< cite key "First quote." "Second quote." >}}
{{< cite key "First quote." "Second quote." 42 >}}
```

Plain `@key` citations are also wrapped automatically and open the same panel (without a quote).

### Grouped citations with per-citation quotes

Use `{{< cites >}}` to group multiple citations into a single formatted span where each citation is individually clickable and can carry its own quote:

```markdown
{{< cites key1 "Quote for key1." key2 key3 "Quote for key3." >}}
```

Keys are detected automatically (letters followed by a 4-digit year). Anything else is treated as a quote for the preceding key. Omit the quote string for citations that don't need one. The group renders as `(Author A, Year; Author B, Year; Author C, Year)` with each name a separate clickable link.

## Development

```bash
npm install
npm run dev      # start Astro dev server
npm run build    # production build
npm run render   # render all stale .qmd files
```
