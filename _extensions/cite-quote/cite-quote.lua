-- cite-quote.lua
-- Shortcode: {{< cite key "quote" page >}}
-- Renders a citation button with data attributes for the React dialog.
-- Example: {{< cite argyle2023 "We propose a general methodology..." 4 >}}
--
-- Also wraps plain @citations in a cite-ref span so they open the dialog.

return {
  -- Shortcode handler
  ["cite"] = function(args)
    local key   = pandoc.utils.stringify(args[1])
    local quote = pandoc.utils.stringify(args[2])
    local page  = args[3] and pandoc.utils.stringify(args[3]) or ""

    local citation  = pandoc.Citation(key, pandoc.NormalCitation)
    -- Use "!cite-shortcode!" as placeholder so the Cite filter can skip it
    local cite_node = pandoc.Cite(pandoc.Inlines { pandoc.Str("!cite-shortcode!") }, { citation })

    local safe_quote = quote:gsub('"', "&quot;")

    local open = pandoc.RawInline("html",
      '<span data-cite-id="' .. key .. '"'
      .. ' data-cite-quote="' .. safe_quote .. '"'
      .. ' data-cite-page="' .. page .. '"'
      .. ' class="cite-ref">'
    )
    local close = pandoc.RawInline("html", "</span>")

    return pandoc.Inlines { open, cite_node, close }
  end,

  -- AST filter: wrap plain @citations in a cite-ref span
  Cite = function(el)
    -- Skip Cite nodes produced by the shortcode above
    local content = el.content
    if #content == 1 and content[1].t == "Str" and content[1].text == "!cite-shortcode!" then
      return el
    end

    local key = el.citations[1] and el.citations[1].id or ""
    if key == "" then return el end

    local open = pandoc.RawInline("html",
      '<span class="cite-ref" data-cite-id="' .. key .. '" data-cite-quote="" data-cite-page="">'
    )
    local close = pandoc.RawInline("html", "</span>")

    return pandoc.Inlines { open, el, close }
  end
}
