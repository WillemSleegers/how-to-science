# CLAUDE.md

## Project Overview

How to Science is a Quarto website documenting best practices in methodology and statistics for researchers. Content should reflect current evidence, be concise, and be written for an academic research audience.

## Zotero

Papers are managed in Zotero, accessible via the local API at `http://localhost:23119/api/users/4153588/`. Use this to find papers and their PDF paths. For example:

- Search by title: `curl "http://localhost:23119/api/users/4153588/items?q=gilardi&qmode=titleCreatorYear"`
- The response includes a `path` field with the full local path to the PDF, which can then be read directly.

## Writing New Pages

### Step 1: Paper summaries

For each paper, create or update a summary file in `assets/papers/` named by citation key (e.g., `gilardi2023.md`). Each file records the claims used from that paper in the following format:

**Claim** — a specific finding or conclusion
**Quote** — the exact quote from the paper supporting the claim
**Page** — page number where the quote appears

This allows the user to spot-check claims by jumping to the relevant page in the PDF, without reading the whole paper.

These files are the single source of truth. When a claim appears on a page, it must be traceable to an entry in the corresponding paper file. If a paper's findings are updated or reinterpreted, update the paper file first, then update any pages that use it.

### Step 2: User review

The user reviews the paper summaries, flags anything that looks incorrect or needs clarification, and approves them before writing begins.

### Step 3: Write the page

Write the page based on the approved summaries, following the style conventions below.

## Style Conventions

- Use `@author` citation syntax (Quarto/Pandoc bibliography format)
- Structure pages around practical questions ("Does X work?", "When does it fail?"), not by paper or author
- End with a **Recommendations** section (bulleted, concrete) rather than a conclusion sentence
- Include a study overview table when multiple studies are reviewed
- Use `callout-warning` blocks for work-in-progress pages
- Lead with the claim, not the citation. Write "X is true [@author]" not "@author find that X is true"
- Keep prose concise and evidence-driven — avoid editorializing
