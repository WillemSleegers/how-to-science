-- cite-quote.lua
-- Shortcode: {{< cite key "quote" page >}}
-- Renders a citation button with data attributes for the React dialog.
-- Example: {{< cite argyle2023 "We propose a general methodology..." 4 >}}

return {
  ["cite"] = function(args)
    local key   = pandoc.utils.stringify(args[1])
    local quote = pandoc.utils.stringify(args[2])
    local page  = args[3] and pandoc.utils.stringify(args[3]) or ""

    local citation  = pandoc.Citation(key, pandoc.NormalCitation)
    local cite_node = pandoc.Cite(pandoc.Inlines { pandoc.Str("?") }, { citation })

    -- Escape quote for use in HTML attribute
    local safe_quote = quote:gsub('"', "&quot;")

    local open = pandoc.RawInline("html",
      '<span data-cite-id="' .. key .. '"'
      .. ' data-cite-quote="' .. safe_quote .. '"'
      .. ' data-cite-page="' .. page .. '"'
      .. ' class="cite-ref">'
    )
    local close = pandoc.RawInline("html", "</span>")

    return pandoc.Inlines { open, cite_node, close }
  end
}
