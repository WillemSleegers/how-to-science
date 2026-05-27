-- cite-quote.lua
-- Shortcode {{< cite key "quote" ["quote2" ...] [page] >}}
-- Shortcode {{< cites key1 "quote1" key2 key3 "quote3" >}}
--   Groups multiple citations into a single formatted span; per-key quotes
--   are stored in data-cite-quotes and applied when JS splits the group.
--   Keys are detected by pattern (letters then 4 digits); anything else is
--   treated as a quote for the preceding key.
--
-- Also wraps plain @citations in a cite-ref span so they open the dialog.

local function json_escape(s)
  s = s:gsub('\\', '\\\\')
  s = s:gsub('"', '\\"')
  s = s:gsub('\n', '\\n')
  s = s:gsub('\r', '\\r')
  s = s:gsub('\t', '\\t')
  return '"' .. s .. '"'
end

local function is_key(s)
  return s:match("^%a%w*%d%d%d%d%a?$") ~= nil
end

local function json_object(t)
  local parts = {}
  for k, v in pairs(t) do
    parts[#parts + 1] = json_escape(k) .. ':' .. json_escape(v)
  end
  return '{' .. table.concat(parts, ',') .. '}'
end

local function json_array(t)
  local parts = {}
  for _, v in ipairs(t) do
    parts[#parts + 1] = json_escape(v)
  end
  return '[' .. table.concat(parts, ',') .. ']'
end

return {
  -- Shortcode handler
  ["cite"] = function(args)
    local key  = pandoc.utils.stringify(args[1])
    local page = ""
    local rest = {}

    for i = 2, #args do
      rest[#rest + 1] = pandoc.utils.stringify(args[i])
    end

    -- If the last arg is a bare integer, treat it as a page number
    if #rest > 0 and rest[#rest]:match("^%d+$") then
      page = rest[#rest]
      table.remove(rest)
    end

    local quotes_json = json_array(rest)
    -- HTML-encode for the attribute value; browser decodes back to valid JSON
    local safe_quotes = quotes_json:gsub('"', "&quot;")

    local citation  = pandoc.Citation(key, pandoc.NormalCitation)
    local cite_node = pandoc.Cite(pandoc.Inlines { pandoc.Str("!cite-shortcode!") }, { citation })

    local open = pandoc.RawInline("html",
      '<span data-cite-id="' .. key .. '"'
      .. ' data-cite-quote="' .. safe_quotes .. '"'
      .. ' data-cite-page="' .. page .. '"'
      .. ' class="cite-ref">'
    )
    local close = pandoc.RawInline("html", "</span>")

    return pandoc.Inlines { open, cite_node, close }
  end,

  -- Shortcode for grouped citations with optional per-key quotes
  ["cites"] = function(args)
    local citations = {}
    local quote_map = {}
    local i = 1
    while i <= #args do
      local key = pandoc.utils.stringify(args[i])
      local quote = ""
      if i + 1 <= #args then
        local next_arg = pandoc.utils.stringify(args[i + 1])
        if not is_key(next_arg) then
          quote = next_arg
          i = i + 1
        end
      end
      citations[#citations + 1] = pandoc.Citation(key, pandoc.NormalCitation)
      if quote ~= "" then
        quote_map[key] = quote
      end
      i = i + 1
    end

    if #citations == 0 then return pandoc.Inlines {} end

    local primary_key = citations[1].id
    local key_parts = {}
    for _, cit in ipairs(citations) do
      key_parts[#key_parts + 1] = '"' .. cit.id .. '"'
    end
    local safe_keys = ('[' .. table.concat(key_parts, ',') .. ']'):gsub('"', "&quot;")
    local safe_quotes = json_object(quote_map):gsub('"', "&quot;")

    local cite_node = pandoc.Cite(
      pandoc.Inlines { pandoc.Str("!cite-shortcode!") },
      citations
    )
    local open = pandoc.RawInline("html",
      '<span class="cite-ref" data-cite-id="' .. primary_key .. '"'
      .. ' data-cite-ids="' .. safe_keys .. '"'
      .. ' data-cite-quotes="' .. safe_quotes .. '"'
      .. ' data-cite-quote="[]" data-cite-page="">'
    )
    local close = pandoc.RawInline("html", "</span>")

    return pandoc.Inlines { open, cite_node, close }
  end,

  -- AST filter: wrap plain @citations in a cite-ref span
  Cite = function(el)
    local content = el.content
    if #content == 1 and content[1].t == "Str" and content[1].text == "!cite-shortcode!" then
      return el
    end

    local primary_key = el.citations[1] and el.citations[1].id or ""
    if primary_key == "" then return el end

    -- Collect all keys for multi-citation spans, e.g. [@a; @b; @c]
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
}
