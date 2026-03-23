-- cite-quote.lua
-- Shortcode: {{< cite key "quote" page >}}
-- Renders a properly formatted APA citation (via citeproc) with a hover popup
-- showing the supporting quote and page number.
-- Example: {{< cite argyle2023 "We propose a general methodology..." 4 >}}

return {
  ["cite"] = function(args)
    local key   = pandoc.utils.stringify(args[1])
    local quote = pandoc.utils.stringify(args[2])
    local page  = args[3] and pandoc.utils.stringify(args[3]) or nil

    -- Build popup HTML
    local page_html = page
      and ('<span class="cite-quote-page">p.\u{00A0}' .. page .. '</span>')
      or  ""

    local popup_html = '<span class="cite-quote-popup">'
      .. '<span class="cite-quote-text">\u{201C}' .. quote .. '\u{201D}</span>'
      .. page_html
      .. '</span>'

    -- Create a pandoc Cite node so citeproc formats it and adds it to references
    local citation  = pandoc.Citation(key, pandoc.NormalCitation)
    local cite_node = pandoc.Cite(pandoc.Inlines { pandoc.Str("?") }, { citation })

    -- Wrap popup + citation in a span for CSS hover targeting
    local open  = pandoc.RawInline("html", '<span class="cite-quote-wrapper">' .. popup_html)
    local close = pandoc.RawInline("html", "</span>")

    return pandoc.Inlines { open, cite_node, close }
  end
}
