# Claude Instructions for how-to-science

## General

**Debugging:** Ask targeted questions to narrow down the source of the problem before inspecting code. Don't treat all possible causes as equally likely — reason about what's most probable first.

Work within the permissions already granted in `.claude/settings.json`. If a command doesn't match an allowed pattern, first try to restructure the approach to fit — e.g. make individual parallel tool calls instead of shell loops. Only ask for additional permissions if the task genuinely cannot be accomplished within existing ones.

## Project Overview

This is a documentation/teaching site built on **Astro** with **Quarto** for code-heavy pages. The site is deployed to GitHub Pages.

**Key directories:**

- `content/` — all page content, organized by topic (e.g. `content/statistics/regression/`)
- `src/` — Astro app code (components, layouts, routing)
- `assets/` — bibliography
- `public/` — static files and Quarto-generated figures
- `scripts/render.mjs` — renders `.qmd` → `.md`

**The site has two content types:**

- `.md` files — plain markdown, what Astro actually reads and serves
- `.qmd` files — Quarto source with executable R/Python code; rendered to `.md` by `scripts/render.mjs`

**When to use `.qmd` vs `.md`:** If the page contains R code blocks that need to be executed (simulations, model output, plots), use `.qmd`. For prose-only pages, `.md` is fine.

**If a page has a `.qmd`, edit the `.qmd`, never its generated `.md`** — direct `.md` edits (frontmatter included) are overwritten on re-render.

**Pages with figures must be `index.qmd` inside a subdirectory** (e.g. `content/statistics/topic/index.qmd`), never a flat file like `topic.qmd`. Astro serves pages at a URL ending in `/topic/`, so a flat file's figure paths resolve one level too deep and 404. The `index.qmd` pattern keeps the page URL and the figure paths in sync.

## Adding a New Content Page

### Step 1: Create the content file

Create `content/<section>/<topic>/index.qmd` (for pages with R code) or `index.md` (prose only).

Frontmatter fields:

```yaml
---
title: "Page Title"
toc: true # optional; enables right-sidebar TOC
order: 1 # optional; controls ordering within a nav group
---
```

### Step 2: Register in `_nav.yml`

Add the page under the appropriate group. The `path` must match the content file location relative to `content/`, without the `.md` extension or `/index.md` suffix:

```yaml
- group: Data Analysis
  items:
    - title: Regression
      items:
        - path: statistics/regression/overview
        - path: statistics/regression/my-new-page # ← add here
```

Routes are driven entirely by `_nav.yml` — a file not listed there won't appear on the site.

### Step 3: For `.qmd` files — render to `.md`

Run `npm run render` (or `npm run render -- content/path/to/file.qmd` for a single file) to execute R code and produce the `.md` that Astro reads. The user does this; Claude writes the `.qmd`.

## Content Format

### Prose-only pages (`.md`)

````markdown
---
title: "My Topic"
toc: true
---

Introductory paragraph.

## Section heading

Content with R code shown as fenced blocks (not executed):

```r
model <- lm(y ~ x, data = data)
summary(model)
```
````

### Pages with executed R code (`.qmd`)

Use `{r}` chunk syntax. Quarto renders these to output and embeds results in the `.md`:

````markdown
---
title: "My Topic"
toc: true
---

```{r}
#| label: setup
#| message: false

library(tidyverse)
library(emmeans)

theme_set(theme_minimal())
```

Prose explanation.

```{r}
#| label: simulate-data
set.seed(42)
# ... simulation code
```
````

Standard chunk options used in this project: `label`, `message: false`, `fig-cap`, `echo: false`.

### Writing process

Before writing any prose for a page or section, outline the logical flow to the user first. Do not write until the outline is approved.

### Writing style

Prose style rules live in the `writing-style` skill ([.claude/skills/writing-style/skill.md](.claude/skills/writing-style/skill.md)). Follow them whenever writing or editing prose on the site. The skill is also invocable as `/writing-style` to review and fix an existing file.

## Citation Shortcodes

Inline citations are handled by two Quarto shortcodes defined in `_extensions/cite-quote/`. Both render as clickable spans that open a side panel showing the reference and any supporting quotes.

**Single citation with quotes:**

```markdown
{{< cite key "Quote text." >}}
{{< cite key "First quote." "Second quote." 42 >}}
```

The last argument is a page number if it is a bare integer. Multiple quote strings are shown as a list of blockquotes in the panel.

**Grouped citations with per-citation quotes:**

```markdown
{{< cites key1 "Quote for key1." key2 key3 "Quote for key3." >}}
```

Arguments after each key are treated as a quote for that key; omit the string for citations that need no quote. The group renders as `(Author A, Year; Author B, Year; Author C, Year)` with each name individually clickable. Use `{{< cites >}}` instead of `[@a; @b; @c]` whenever any citation in a group needs a quote.

Plain `@key` and `[@a; @b; @c]` citations are also wrapped automatically (no quote support for these).

## Zotero Workflow

Papers are managed in Zotero and accessible via its local API at `http://localhost:23119/api/`.

### Steps to process papers for a page

**Important:** Each step uses individual `curl` calls per item in order to not prompt the user for permissions — do NOT batch into shell loops or pipelines.

1. **Find parent item keys by tag:**

   ```bash
   curl -s "http://localhost:23119/api/users/0/items?format=keys&limit=50&tag=<tag>"
   ```

   (tag must be the last query parameter; URL-encode spaces as `%20`, e.g. `tag=response%20order`)

2. **Get parent item JSON** for each key — run all calls in parallel. Extract `links.attachment.href` (attachment key) and `data.citationKey`:

   ```bash
   curl -s http://localhost:23119/api/users/0/items/<item-key>
   ```

3. **Get attachment file path** for each attachment key — run all calls in parallel. Extract `data.path`:

   ```bash
   curl -s http://localhost:23119/api/users/0/items/<attachment-key>
   ```

4. **Read the PDF** using the Read tool on `data.path`, then write the summary file

5. **Write summary file** — Create `/Users/willem/Documents/Vault/60 - Reading/Papers/<citationkey>.md` with frontmatter, an abstract summary, key ideas, and quotes pulled from the PDF

### Summary file format

```markdown
---
citekey: <citationkey>
type: paper
title: "<full title>"
author: <Last name et al. or single author>
url: <url if available>
date: <YYYY-MM-DD>
modified: <today's date YYYY-MM-DD>
tags: [<relevant tags>]
---

## Abstract

<Prose summary of the paper's contribution and main findings>

## Key ideas

1. <key finding or idea>
2. <key finding or idea>
3. <key finding or idea>

## Quotes worth keeping

> <exact quote>
> <exact quote>

## My thoughts & reactions
```

Quotes appear consecutively (no blank lines between them) in the order they appear in the paper. No page numbers, no "claim" lines, no headings between quotes — just blockquotes.

### Which quotes to pull

The quotes are meant to be reusable in other writing, so they should make a clear point on their own. Let the content drive how many you include; there's no target count.

- **Highlights in the PDF** should always be considered, but don't include all of them blindly — apply the same filters below.
- **Include**: substantive claims tied to the paper's main research questions; findings the authors flag as surprising or important; results from the abstract and conclusions; striking quantitative claims.
- **Skip**: definitions, pure methodology description, generic background, anything that only makes sense with surrounding context.
- **Standalone test**: a reader should understand the quote without further context. Pronouns like "it" or "this method" are a red flag.
- **Deduplicate**: if two passages make the same point, keep only the stronger one.

### Light editing

Quotes may be lightly edited to stand alone, using only these two conventions (a verification script depends on them being the only allowed edits):

- `[…]` for omitted text
- `[bracketed word]` for inserted glosses (e.g. replacing a pronoun with its referent)

Anything else — paraphrasing, joining non-adjacent passages, rewording — is not allowed. If a quote needs more than light editing to stand alone, drop it.

### Quote verification (mandatory)

Every quote must be a verbatim excerpt from the PDF as read by the Read tool. Never paraphrase or reconstruct from memory.

Verify each quote against the PDF content read in step 4 before including it. The check is: strip `[…]` and `[bracketed glosses]`, normalise smart quotes / dashes / whitespace, then confirm the result appears in the extracted PDF text. If a quote cannot be confirmed, **omit it entirely**.

Footnotes and table captions are fair game to quote, though in practice this should be rare.

### Notes

- Citation keys are used as filenames for summary files
- Summary files go in `/Users/willem/Documents/Vault/60 - Reading/Papers/`
