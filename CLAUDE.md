# Claude Instructions for how-to-science

## General

**Debugging:** Ask targeted questions to narrow down the source of the problem before inspecting code. Don't treat all possible causes as equally likely — reason about what's most probable first.

Work within the permissions already granted in `.claude/settings.json`. If a command doesn't match an allowed pattern, first try to restructure the approach to fit — e.g. make individual parallel tool calls instead of shell loops. Only ask for additional permissions if the task genuinely cannot be accomplished within existing ones.

## Project Overview

This is a documentation/teaching site built on **Astro 6** with **Quarto** for code-heavy pages. The site is deployed to GitHub Pages.

**Key directories:**
- `content/` — all page content, organized by topic (e.g. `content/statistics/regression/`)
- `src/` — Astro app code (components, layouts, routing)
- `assets/` — bibliography, paper summary files
- `public/` — static files and Quarto-generated figures
- `scripts/render.mjs` — renders `.qmd` → `.md`

**The site has two content types:**
- `.md` files — plain markdown, what Astro actually reads and serves
- `.qmd` files — Quarto source with executable R/Python code; rendered to `.md` by `scripts/render.mjs`

**When to use `.qmd` vs `.md`:** If the page contains R code blocks that need to be executed (simulations, model output, plots), use `.qmd`. For prose-only pages, `.md` is fine.

## Adding a New Content Page

**Step 1: Create the content file**

Create `content/<section>/<topic>/index.qmd` (for pages with R code) or `index.md` (prose only).

Frontmatter fields:
```yaml
---
title: "Page Title"
toc: true          # optional; enables right-sidebar TOC
order: 1           # optional; controls ordering within a nav group
---
```

**Step 2: Register in `_nav.yml`**

Add the page under the appropriate group. The `path` must match the content file location relative to `content/`, without the `.md` extension or `/index.md` suffix:

```yaml
- group: Data Analysis
  items:
    - title: Regression
      items:
        - path: statistics/regression/overview
        - path: statistics/regression/my-new-page   # ← add here
```

Routes are driven entirely by `_nav.yml` — a file not listed there won't appear on the site.

**Step 3: For `.qmd` files — render to `.md`**

Run `npm run render` (or `npm run render -- content/path/to/file.qmd` for a single file) to execute R code and produce the `.md` that Astro reads. The user does this; Claude writes the `.qmd`.

## Content Format

### Prose-only pages (`.md`)

```markdown
---
title: "My Topic"
toc: true
---

Introductory paragraph.

## Section heading

Content with R code shown as fenced blocks (not executed):

``` r
model <- lm(y ~ x, data = data)
summary(model)
```

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

### Writing style

- Write claims directly; don't make authors or studies the grammatical subject. Say "X is true" not "Smith et al. found that X is true."
- Prefer concrete simulated examples to abstract description.
- Pages tend to be practical and code-forward; show working R code with explanations.
- Don't overuse em dashed.

## Zotero Workflow

Papers are managed in Zotero and accessible via its local API at `http://localhost:23119/api/`.

### Steps to process papers for a page

**Important:** Each step uses individual `curl` calls per item — do NOT batch into shell loops or pipelines. Run calls in parallel (multiple tool calls at once) instead.

1. **Find parent item keys by tag:**

```
curl -s "http://localhost:23119/api/users/0/items?format=keys&limit=50&tag=<tag>"
```

(tag must be the last query parameter; URL-encode spaces as `%20`, e.g. `tag=response%20order`)

2. **Get parent item JSON** for each key — run all calls in parallel. Extract `links.attachment.href` (attachment key) and `data.citationKey`:

   ```
   curl -s http://localhost:23119/api/users/0/items/<item-key>
   ```

3. **Get attachment file path** for each attachment key — run all calls in parallel. Extract `data.path`:

   ```
   curl -s http://localhost:23119/api/users/0/items/<attachment-key>
   ```

4. **Read the PDF** using the Read tool on `data.path`, then write the summary file

5. **Write summary file** — Create `assets/papers/<citationkey>.md` with frontmatter, a summary, and key claims/quotes pulled from the PDF

### Summary file format (`assets/papers/<citationkey>.md`)

```markdown
---
name: <citationkey>
description: <one-line description>
type: reference
---

<Prose summary of the paper>

**Claim** — <claim>
**Quote** — "<exact quote>"
**Page** — <page number>

... (repeat for each key claim)
```

### Quote verification (mandatory)

Every **Quote** field must be a verbatim excerpt from the PDF as read by the Read tool. Never paraphrase or reconstruct from memory.

Verify each quote against the PDF content read in step 4 before including it. If a quote cannot be confirmed as verbatim, **omit it entirely**.

### Notes

- Citation keys are used as filenames for summary files
- Summary files go in `assets/papers/`
