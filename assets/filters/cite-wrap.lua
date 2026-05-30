-- cite-wrap.lua
-- Wraps plain @citations in a cite-ref span so the React CitationDialog
-- can intercept clicks and show the full reference.
-- Skips Cite nodes produced by the {{< cite >}} shortcode (marked with
-- "!cite-shortcode!" placeholder content).
-- Stores all keys for multi-citation groups, e.g. [@a; @b; @c].

-- Quarto cross-reference prefixes (@fig-, @tbl-, @sec-, …). These parse as
-- Cite nodes but are resolved into xref links by Quarto, so they must not be
-- wrapped as citations (doing so hijacks their click navigation).
local XREF_PREFIXES = {
  fig = true, tbl = true, eq = true, sec = true, lst = true,
  thm = true, lem = true, cor = true, prp = true, def = true,
  exm = true, exr = true, sol = true, rem = true,
}
local function is_xref(id)
  local prefix = id:match("^(%a+)%-")
  return prefix ~= nil and XREF_PREFIXES[prefix] == true
end

function Cite(el)
  local content = el.content
  if #content == 1 and content[1].t == "Str" and content[1].text == "!cite-shortcode!" then
    return el
  end

  local primary_key = el.citations[1] and el.citations[1].id or ""
  if primary_key == "" then return el end
  if is_xref(primary_key) then return el end

  -- Collect all keys for multi-citation spans
  local key_parts = {}
  for _, citation in ipairs(el.citations) do
    if citation.id ~= "" then
      key_parts[#key_parts + 1] = '"' .. citation.id .. '"'
    end
  end
  local keys_json = '[' .. table.concat(key_parts, ',') .. ']'
  local safe_keys = keys_json:gsub('"', "&quot;")

  local open = pandoc.RawInline("html",
    '<span class="cite-ref" data-cite-id="' .. primary_key .. '" data-cite-ids="' .. safe_keys .. '" data-cite-quote="[]" data-cite-page="">'
  )
  local close = pandoc.RawInline("html", "</span>")

  return pandoc.Inlines { open, el, close }
end
