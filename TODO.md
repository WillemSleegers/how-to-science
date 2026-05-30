# TODO

## Known limitations (accepted)

- **Section cross-references (`@sec-`) don't navigate.** Figure/table/equation refs work (Quarto numbers them and the anchors survive gfm). Section refs render as links but their target id is stripped by gfm while `MarkdownContent` generates ids from heading text, so the anchor dangles. Supporting them needs heading-id preservation through gfm + honoring explicit ids in the React renderer — deferred as not worth the pipeline change for now.
- **`dangerouslySetInnerHTML`** is used for reference HTML (`CitationDialog.tsx`) and highlighted code (`MarkdownContent.tsx`). Safe while all content is self-authored; would be the main XSS surface if that ever changes.
- **Citation-quote alignment assumes `surnameYEAR` keys.** Grouped `{{< cites >}}` quotes are matched to citations by re-sorting keys to mimic citeproc's author-alpha order (documented in `splitMultiCitations`). Correct for the current key convention; a key whose prefix isn't the first author's surname could mis-attach a quote within a group.

## Done

- [x] CI deploy via GitHub Actions + stop tracking `dist/`/`docs/`
- [x] Add `shiki`, add `@astrojs/check`, remove unused `highlight.js`
- [x] Fix all 4 lint errors; delete dead `use-mobile.ts` hook
- [x] Fix `astro check` heap crash by excluding generated dirs (`_freeze`, `public`, `content`, …) from `tsconfig.json`
- [x] Remove 8 unused shadcn UI components (only `button`, `collapsible`, `navigation-menu`, `sheet` are used)
- [x] Remove obsolete `.nojekyll` (not needed with Actions-based Pages deploy)
- [x] Delete 8 stub "overview" landing pages (placeholder content, not in nav)
- [x] Link real content directly: move string-similarity to `/string-similarity`; add Group Differences nav group (pairwise-comparisons, sequential-analyses) with refreshed figures
- [x] Verify math rendering works (remark-math + rehype-katex; KaTeX HTML confirmed)
- [x] Cross-references (Part A): stop citation-wrapping `@fig-`/`@tbl-`/`@sec-` so figure/table xref links navigate correctly
- [x] TOC depth: extract and assign ids for `h2`–`h6` (was `h2`/`h3` only), so `toc-depth` works beyond 3 and deeper headings get anchors
