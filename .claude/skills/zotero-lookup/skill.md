---
name: zotero-lookup
description: Find a paper in Zotero by citekey or tag via its local API, and get its PDF attachment path. Use whenever asked to find, locate, look up, or open a paper in Zotero — even without writing up notes.
---

Papers are managed in Zotero and accessible via its local API at `http://localhost:23119/api/`.

### Find a paper by citekey

To look up a single paper directly by its citation key (e.g. `behr2023a`), use the `items` endpoint with a full-text quicksearch (Better BibTeX stores the citekey in the item's Extra field, which `qmode=everything` searches):

```bash
curl -s "http://localhost:23119/api/users/0/items?format=keys&limit=50&q=<citekey>&qmode=everything"
```

This returns the parent item key plus its attachment key(s).

### Find papers by tag

**Important:** Run one `curl` call per item in parallel — do NOT batch into shell loops or pipelines, to avoid prompting the user for permission per call.

```bash
curl -s "http://localhost:23119/api/users/0/items?format=keys&limit=50&tag=<tag>"
```

(tag must be the last query parameter; URL-encode spaces as `%20`, e.g. `tag=response%20order`)

### Get parent item JSON

For each item key found above — run all calls in parallel. Extract `links.attachment.href` (attachment key) and `data.citationKey`:

```bash
curl -s http://localhost:23119/api/users/0/items/<item-key>
```

### Get attachment file path

For each attachment key — run all calls in parallel. Extract `data.path`:

```bash
curl -s http://localhost:23119/api/users/0/items/<attachment-key>
```

### Read the PDF

Use the Read tool on `data.path`.

This is as far as a plain lookup goes. For writing a reading-notes summary file from the paper, use the `zotero-paper-notes` skill instead.
