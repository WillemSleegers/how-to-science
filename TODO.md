# TODO

## Quarto parity

- [ ] Math rendering (KaTeX or MathJax)
- [ ] Cross-references (`@fig-`, `@sec-`)

## High priority

- [ ] **Add `shiki` to package.json** — it's imported in `src/components/MarkdownContent.tsx` but only resolves as a transitive dep of Astro; an Astro bump could break the build.
- [ ] **Remove `highlight.js`** from dependencies — not used anywhere in `src/`.
- [ ] **Add `@astrojs/check` to devDependencies** — `npm run typecheck` currently drops into an interactive install prompt because the dep is missing.
- [ ] **Delete stale `dist/`** (364 dead files) — the configured `outDir` is `docs/`; `dist/` is the old default, last built 2026-03-30. Remove from git and add to `.gitignore`.
- [ ] **Stop committing build output `docs/`** — a fresh `astro build` produces a ~124-file diff vs. the committed version (committed copy is stale, even bundles Shiki langs the current config no longer emits). Add a GitHub Actions workflow to build + deploy to Pages (none exists today), then gitignore `docs/`.

## Medium priority

- [ ] **Fix lint errors** (`npm run lint`, 4 errors):
  - [ ] `src/components/CitationDialog.tsx:28,36` — `quotes`/`ids` initialized then immediately reassigned (`no-useless-assignment`).
  - [ ] `src/components/ui/navigation-menu.tsx:163` — non-component export (`react-refresh/only-export-components`).
  - [ ] `src/hooks/use-mobile.ts:10` — `setState` synchronously in effect (`react-hooks/set-state-in-effect`).
- [ ] **Remove dead code:**
  - [ ] `src/hooks/use-mobile.ts` — never imported.
  - [ ] Unused shadcn UI components: `avatar`, `breadcrumb`, `dialog`, `dropdown-menu`, `input`, `separator`, `skeleton`, `tooltip` (only `sheet`, `navigation-menu`, `collapsible`, and `button` are actually used).
- [ ] **Decide on 10 orphan content pages** — rendered `.md` exists but no `_nav.yml` entry, so they're unreachable. Either add to nav or remove:
  - [ ] `*/overview` pages: factor-analysis, regression, representativeness, scales, contingent-valuation, survey-design, scale-development, ai
  - [ ] entire `statistics/group-differences/` section (`pairwise-comparisons`, `sequential-analyses`) — not in nav at all

## Low priority / noted

- [ ] **Fragile citation-quote alignment** — `splitMultiCitations` in `src/components/MarkdownContent.tsx` re-aligns per-key quotes by sorting keys to mimic citeproc's alphabetical order (`a.replace(/\d+.*$/, '')`). Can silently mis-assign quotes when citation-key prefixes don't match author-name alpha order (e.g. key `smith2020` for a paper by "Aaronson").
- [ ] **`dangerouslySetInnerHTML`** used for reference HTML (`CitationDialog.tsx:87`) and highlighted code (`MarkdownContent.tsx:125`) — fine while all content is self-authored; main XSS surface if that changes.
- [ ] **TOC depth ceiling** — `extractHeadings` (`src/lib/headings.ts:27`) and the `id` assignment in `MarkdownContent.tsx:131-136` only handle `h2`/`h3`, so `toc-depth` above 3 has no effect and `h4+` get no anchor ids.
