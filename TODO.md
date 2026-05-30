# TODO

## Known limitations

- **Section cross-references (`@sec-`) don't navigate.** Figure/table/equation refs work (Quarto numbers them and the anchors survive gfm). Section refs render as links but their target id is stripped by gfm while `MarkdownContent` generates ids from heading text, so the anchor dangles. Supporting them needs heading-id preservation through gfm + honoring explicit ids in the React renderer — deferred as not worth the pipeline change for now.
- **`dangerouslySetInnerHTML`** is used for reference HTML (`CitationDialog.tsx`) and highlighted code (`MarkdownContent.tsx`). Safe while all content is self-authored; would be the main XSS surface if that ever changes.
