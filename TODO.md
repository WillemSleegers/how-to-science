# TODO

## Quarto parity

- [ ] Math rendering (KaTeX or MathJax)
- [ ] Cross-references (`@fig-`, `@sec-`)

## Low priority / noted

- [ ] **Fragile citation-quote alignment** — `splitMultiCitations` in `src/components/MarkdownContent.tsx` re-aligns per-key quotes by sorting keys to mimic citeproc's alphabetical order (`a.replace(/\d+.*$/, '')`). Can silently mis-assign quotes when citation-key prefixes don't match author-name alpha order (e.g. key `smith2020` for a paper by "Aaronson").
- [ ] **`dangerouslySetInnerHTML`** used for reference HTML (`CitationDialog.tsx:87`) and highlighted code (`MarkdownContent.tsx:125`) — fine while all content is self-authored; main XSS surface if that changes.
- [ ] **TOC depth ceiling** — `extractHeadings` (`src/lib/headings.ts:27`) and the `id` assignment in `MarkdownContent.tsx:131-136` only handle `h2`/`h3`, so `toc-depth` above 3 has no effect and `h4+` get no anchor ids.

## Done

- [x] CI deploy via GitHub Actions + stop tracking `dist/`/`docs/`
- [x] Add `shiki`, add `@astrojs/check`, remove unused `highlight.js`
- [x] Fix all 4 lint errors; delete dead `use-mobile.ts` hook
- [x] Fix `astro check` heap crash by excluding generated dirs (`_freeze`, `public`, `content`, …) from `tsconfig.json`
- [x] Remove 8 unused shadcn UI components (only `button`, `collapsible`, `navigation-menu`, `sheet` are used)
- [x] Remove obsolete `.nojekyll` (not needed with Actions-based Pages deploy)
- [x] Delete 8 stub "overview" landing pages (placeholder content, not in nav)
- [x] Link real content directly: move string-similarity to `/string-similarity`; add Group Differences nav group (pairwise-comparisons, sequential-analyses) with refreshed figures
