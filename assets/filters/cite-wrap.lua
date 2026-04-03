-- cite-wrap.lua
-- Wraps plain @citations in a cite-ref span so the React CitationDialog
-- can intercept clicks and show the full reference.
-- Skips Cite nodes produced by the {{< cite >}} shortcode (marked with
-- "!cite-shortcode!" placeholder content).

function Cite(el)
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
