# Claude Instructions for how-to-science

## General

Work within the permissions already granted in `.claude/settings.json`. If a command doesn't match an allowed pattern, first try to restructure the approach to fit — e.g. make individual parallel tool calls instead of shell loops. Only ask for additional permissions if the task genuinely cannot be accomplished within existing ones.

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

4. **Convert PDF to text** using `pdftotext`, save to `assets/papers/fulltext/<citationkey>.txt`

5. **Write summary file** — Create `assets/papers/<citationkey>.md` with frontmatter, a summary, and key claims/quotes pulled from the fulltext

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

Every **Quote** field must be a verbatim excerpt from the fulltext file. Never paraphrase or reconstruct from memory.

Before including a quote, verify it exists in the fulltext using the Grep tool. Because pdftotext sometimes inserts line breaks mid-sentence, search for a distinctive substring of ~5–8 words rather than the full sentence:

- Search for a short, distinctive phrase from the intended quote
- If found, read the surrounding lines to get the exact verbatim text including any line breaks, then reconstruct the full continuous quote
- If not found after trying alternative substrings, **omit the quote entirely** — do not include a Quote field for that claim

### Notes

- Citation keys are used as filenames throughout (both `.txt` and `.md`)
- Fulltext files go in `assets/papers/fulltext/`, summary files in `assets/papers/`
