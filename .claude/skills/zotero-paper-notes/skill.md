---
name: zotero-paper-notes
description: Write a reading-notes summary file for a paper, with quotes verified verbatim against the PDF. Use whenever asked to process, summarize, or write up papers from Zotero into reading notes.
---

First find the paper and its PDF using the `zotero-lookup` skill (by citekey or tag), then follow this process to write it up.

### Write summary file

Create `/Users/willem/Documents/Vault/60 - Reading/Papers/<citationkey>.md` with frontmatter, an abstract summary, key ideas, and quotes pulled from the PDF.

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

Verify each quote against the PDF content before including it. The check is: strip `[…]` and `[bracketed glosses]`, normalise smart quotes / dashes / whitespace, then confirm the result appears in the extracted PDF text. If a quote cannot be confirmed, **omit it entirely**.

Footnotes and table captions are fair game to quote, though in practice this should be rare.

### Notes

- Citation keys are used as filenames for summary files
- Summary files go in `/Users/willem/Documents/Vault/60 - Reading/Papers/`
