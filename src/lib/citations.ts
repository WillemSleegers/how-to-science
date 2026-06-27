// Helpers for the client-side citation rendering. A grouped citation such as
// {{< cites key1 "quote1" key2 key3 "quote3" >}} is rendered by citeproc into a
// single span like `(Author A, 2019; Author B, 2020; Author C, 2021)`, with the
// source keys stored in `data-cite-ids` and per-key quotes in
// `data-cite-quotes`. citeproc sorts the visible segments alphabetically by
// author, but `data-cite-ids` stays in source order, so to attach each quote
// (and make each author individually clickable) we have to map each visible
// segment back to its key.

/** Lowercase, strip diacritics and any non-alphanumerics. Used so surname
 * comparisons survive accents, spaces, and punctuation. */
function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "")
}

/** The surname portion of a citekey (the letters before the year), normalized.
 * Assumes the `surnameYEAR` convention, e.g. `smith2020` → `smith`. */
function keySurname(id: string): string {
  return normalize(id.replace(/\d.*$/, ""))
}

/** The four-digit year inside a citekey, if any. */
function keyYear(id: string): string | undefined {
  return id.match(/\d{4}/)?.[0]
}

/**
 * Align citeproc's rendered citation segments to their source citekeys.
 *
 * `segments` are the visible pieces in citeproc's order (alphabetical by
 * author); `ids` are the citekeys in source order. Each segment is matched to a
 * key by its year, then by whether the key's surname appears in the segment
 * text. Longer surnames are tried first so that, e.g., `smithjones2020` wins
 * over `smith2020` for "Smith & Jones, 2020". Segments that cannot be matched
 * fall back to the remaining keys in source order, so the result is always a
 * full mapping with no key used twice.
 *
 * Returns an array of citekeys, one per segment, in segment order.
 */
export function alignSegmentsToKeys(segments: string[], ids: string[]): string[] {
  const remaining = new Set(ids)
  const result: (string | null)[] = segments.map(() => null)

  for (let i = 0; i < segments.length; i++) {
    const segNorm = normalize(segments[i])
    const segYear = segments[i].match(/\d{4}/)?.[0]
    const candidates = [...remaining]
      .filter((id) => keyYear(id) === segYear)
      .sort((a, b) => keySurname(b).length - keySurname(a).length)

    let match = candidates.find((id) => {
      const surname = keySurname(id)
      return surname.length > 0 && segNorm.includes(surname)
    })
    if (!match && candidates.length === 1) match = candidates[0]

    if (match) {
      result[i] = match
      remaining.delete(match)
    }
  }

  // Fill any still-unmatched segments with the leftover keys, preserving the
  // original source order of those keys.
  const leftover = ids.filter((id) => remaining.has(id))
  let li = 0
  return result.map((id, i) => id ?? leftover[li++] ?? ids[i] ?? "")
}

function escapeQuoteAttr(quote: string): string {
  return quote.replace(/&/g, "&amp;").replace(/"/g, "&quot;")
}

/**
 * For a citation group that citeproc merged into fewer visible segments than
 * keys, leave the rendered text as one clickable span but rewrite its
 * `data-cite-quote` to hold every per-key quote (in source order). The dialog
 * then shows all quotes plus all references on a single click. If there are no
 * quotes the original span is returned unchanged (it is already clickable and
 * shows the references on its own).
 */
function collapseGroupQuotes(
  original: string,
  attrs: string,
  innerText: string,
  ids: string[],
  quoteMap: Record<string, string>
): string {
  const quotes = ids.map((id) => quoteMap[id]).filter((q): q is string => Boolean(q))
  if (quotes.length === 0) return original

  const quoteAttr = `[${quotes.map((q) => `&quot;${escapeQuoteAttr(q)}&quot;`).join(",")}]`
  const newAttrs = attrs.replace(/data-cite-quote="[^"]*"/, `data-cite-quote="${quoteAttr}"`)
  return `<span${newAttrs}>(${innerText})</span>`
}

/**
 * Split a citeproc-rendered citation group into one clickable span per author,
 * attaching each citation's quote (from `data-cite-quotes`) to the right
 * author. Single citations and anything that doesn't parse cleanly are returned
 * unchanged.
 */
export function splitMultiCitations(content: string): string {
  return content.replace(
    /<span([^>]+)>\(([^<]*)\)<\/span>/g,
    (match, attrs: string, innerText: string) => {
      if (!attrs.includes('class="cite-ref"')) return match

      const idsMatch = attrs.match(/data-cite-ids="([^"]*)"/)
      if (!idsMatch) return match

      let ids: string[]
      try {
        ids = JSON.parse(idsMatch[1].replace(/&quot;/g, '"'))
      } catch {
        return match
      }

      if (ids.length <= 1) return match

      // Per-key quote map from {{< cites >}}, e.g. {"smith2020": "..."}.
      let quoteMap: Record<string, string> = {}
      const quotesMatch = attrs.match(/data-cite-quotes="([^"]*)"/)
      if (quotesMatch) {
        try {
          quoteMap = JSON.parse(quotesMatch[1].replace(/&quot;/g, '"'))
        } catch {
          /* ignore malformed quote map */
        }
      }

      const segments = innerText.split("; ")
      // citeproc can merge same-author citations (e.g. "Smith, 2019, 2020") into
      // fewer segments than keys, so we can't make each author individually
      // clickable. Keep the whole group as one clickable span, but lift every
      // per-key quote onto it so a click still shows the quotes and references.
      if (segments.length !== ids.length) {
        return collapseGroupQuotes(match, attrs, innerText, ids, quoteMap)
      }

      const alignedIds = alignSegmentsToKeys(segments, ids)

      const spans = segments.map((seg, i) => {
        const id = alignedIds[i]
        const quote = quoteMap[id] ?? ""
        const quoteAttr = quote ? `[&quot;${escapeQuoteAttr(quote)}&quot;]` : "[]"
        return `<span class="cite-ref" data-cite-id="${id}" data-cite-ids="[&quot;${id}&quot;]" data-cite-quote="${quoteAttr}" data-cite-page="">${seg}</span>`
      })

      return "(" + spans.join("; ") + ")"
    }
  )
}
