---
name: content-authoring
description: How to add a new content page to the site, format .md/.qmd files, and use the citation shortcodes. Use whenever creating a new page under content/, editing an existing page's structure, or inserting/editing citations.
---

## Adding a New Content Page

### Step 1: Create the content file

Create `content/<section>/<topic>/index.qmd` (for pages with R code) or `index.md` (prose only).

**Pages with figures must be `index.qmd` inside a subdirectory** (e.g. `content/statistics/topic/index.qmd`), never a flat file like `topic.qmd`. Astro serves pages at a URL ending in `/topic/`, so a flat file's figure paths resolve one level too deep and 404. The `index.qmd` pattern keeps the page URL and the figure paths in sync.

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

Use `{r}` chunk syntax. Quarto renders these to output and embeds results in the `.md`. Every `.qmd` page opens with a single `setup` chunk holding its libraries, the theme, and (on pages that plot) the palette:

````markdown
---
title: "My Topic"
toc: true
---

```{r}
#| label: setup
#| message: false
#| code-fold: true
library(tidyverse)
library(emmeans)

theme_set(theme_minimal())

color_primary <- "#2171b5"
color_secondary <- "#888888"
color_reference <- "gray50"

set.seed(42)
```

Prose explanation.

```{r}
#| label: simulate-data
# ... simulation code
```
````

Standard chunk options used in this project: `label`, `message: false`, `fig-cap`, `echo: false`.

### The setup chunk and plot palette

Each page's `setup` chunk is self-contained — there is no shared setup file. Load `library(tidyverse)` first, then any page-specific libraries, then `theme_set(theme_minimal())`, then page-specific seeds/parameters. Keep the block in this order so pages read consistently.

Pages that draw plots also define the standard palette in the setup chunk, right after `theme_set()`:

- `color_primary` (`#2171b5`) — main series
- `color_secondary` (`#888888`) — second series
- `color_reference` (`gray50`) — dashed reference lines, e.g. an α threshold

Reference these variables in plots rather than hardcoding the hex, so colors match across pages:

```r
ggplot(data, aes(m, fwer)) +
  geom_line(color = color_primary) +
  geom_hline(yintercept = alpha, linetype = "dashed", color = color_reference)
```

These three lines are copied verbatim into every plotting page — if the palette ever changes, update it across the pages together. A page that deliberately needs a different scale (e.g. viridis for many ordered series) can use one, and a prose page that never plots can omit the palette (and `theme_set()`) entirely.

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
