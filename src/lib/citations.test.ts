import { describe, it, expect } from "vitest"
import { alignSegmentsToKeys, splitMultiCitations } from "./citations.js"

describe("alignSegmentsToKeys", () => {
  it("maps segments to keys when source order already matches", () => {
    const segments = ["Adams, 2019", "Brown, 2020"]
    const ids = ["adams2019", "brown2020"]
    expect(alignSegmentsToKeys(segments, ids)).toEqual(["adams2019", "brown2020"])
  })

  it("realigns when citeproc reorders the group alphabetically", () => {
    // Source order is Young, Adams; citeproc renders Adams first.
    const segments = ["Adams, 2019", "Young, 2021"]
    const ids = ["young2021", "adams2019"]
    expect(alignSegmentsToKeys(segments, ids)).toEqual(["adams2019", "young2021"])
  })

  it("matches a key whose prefix does not sort like the surname", () => {
    // The old prefix-sort heuristic would order "smith" before "vandenbos",
    // but citeproc renders "van den Bos" before "Smith". Content matching wins.
    const segments = ["van den Bos, 2018", "Smith, 2020"]
    const ids = ["smith2020", "vandenbos2018"]
    expect(alignSegmentsToKeys(segments, ids)).toEqual(["vandenbos2018", "smith2020"])
  })

  it("disambiguates same-year keys by surname", () => {
    const segments = ["Brown, 2020", "Adams, 2020"]
    const ids = ["adams2020", "brown2020"]
    expect(alignSegmentsToKeys(segments, ids)).toEqual(["brown2020", "adams2020"])
  })

  it("prefers the longer surname when one is a prefix of another", () => {
    const segments = ["Smith, 2020", "Smith & Jones, 2020"]
    const ids = ["smithjones2020", "smith2020"]
    expect(alignSegmentsToKeys(segments, ids)).toEqual(["smith2020", "smithjones2020"])
  })

  it("handles accented surnames", () => {
    const segments = ["Muñoz, 2019", "Adams, 2020"]
    const ids = ["adams2020", "munoz2019"]
    expect(alignSegmentsToKeys(segments, ids)).toEqual(["munoz2019", "adams2020"])
  })

  it("falls back to source order for unmatchable segments", () => {
    // Segment text shares neither year nor surname with the keys; the fallback
    // assigns leftover keys in source order without reusing any.
    const segments = ["Anonymous", "Adams, 2020"]
    const ids = ["adams2020", "mystery1999"]
    const result = alignSegmentsToKeys(segments, ids)
    expect(result).toContain("adams2020")
    expect(result).toContain("mystery1999")
    expect(new Set(result).size).toBe(2)
    // "Adams, 2020" must match adams2020; the unmatched segment gets the rest.
    expect(result[1]).toBe("adams2020")
    expect(result[0]).toBe("mystery1999")
  })

  it("never assigns a key to more than one segment", () => {
    const segments = ["Adams, 2020", "Adams, 2020", "Brown, 2021"]
    const ids = ["adams2020", "adamsb2020", "brown2021"]
    const result = alignSegmentsToKeys(segments, ids)
    expect(new Set(result).size).toBe(3)
  })
})

describe("splitMultiCitations", () => {
  const wrap = (ids: string[], inner: string, quotes?: Record<string, string>) => {
    const idsAttr = JSON.stringify(ids).replace(/"/g, "&quot;")
    const quotesAttr = quotes
      ? ` data-cite-quotes="${JSON.stringify(quotes).replace(/"/g, "&quot;")}"`
      : ""
    return `<span class="cite-ref" data-cite-id="${ids[0]}" data-cite-ids="${idsAttr}"${quotesAttr} data-cite-quote="[]" data-cite-page="">(${inner})</span>`
  }

  it("leaves a single citation untouched", () => {
    const input = wrap(["smith2020"], "Smith, 2020")
    expect(splitMultiCitations(input)).toBe(input)
  })

  it("splits a group into one clickable span per author", () => {
    const input = wrap(["young2021", "adams2019"], "Adams, 2019; Young, 2021")
    const out = splitMultiCitations(input)
    expect(out).toContain('data-cite-id="adams2019"')
    expect(out).toContain('data-cite-id="young2021"')
    // Spans appear in rendered (segment) order: Adams before Young.
    expect(out.indexOf("adams2019")).toBeLessThan(out.indexOf("young2021"))
  })

  it("attaches each quote to the correct author after reordering", () => {
    const input = wrap(
      ["young2021", "adams2019"],
      "Adams, 2019; Young, 2021",
      { young2021: "Young's point.", adams2019: "Adams' point." }
    )
    const out = splitMultiCitations(input)
    // Each span runs from its data-cite-id up to the next "; " separator, so we
    // can check that the quote lands inside the matching author's span.
    const adamsStart = out.indexOf('data-cite-id="adams2019"')
    const youngStart = out.indexOf('data-cite-id="young2021"')
    expect(adamsStart).toBeLessThan(youngStart)
    expect(out.slice(adamsStart, youngStart)).toContain("Adams' point.")
    expect(out.slice(youngStart)).toContain("Young's point.")
  })

  it("escapes ampersands and quotes in quote text", () => {
    const input = wrap(
      ["adams2019", "brown2020"],
      "Adams, 2019; Brown, 2020",
      { adams2019: 'A & "B".' }
    )
    const out = splitMultiCitations(input)
    expect(out).toContain("A &amp; &quot;B&quot;.")
  })

  it("leaves a merged group untouched when it has no quotes", () => {
    // citeproc merged two same-author years into one segment; nothing to lift.
    const input = wrap(["smith2019", "smith2020"], "Smith, 2019, 2020")
    expect(splitMultiCitations(input)).toBe(input)
  })

  it("keeps a merged group as one clickable span but lifts its quotes", () => {
    const input = wrap(
      ["smith2019", "smith2020"],
      "Smith, 2019, 2020",
      { smith2019: "Earlier point.", smith2020: "Later point." }
    )
    const out = splitMultiCitations(input)
    // Still a single cite-ref span over the full rendered text.
    expect(out).toContain(">(Smith, 2019, 2020)</span>")
    expect((out.match(/class="cite-ref"/g) ?? []).length).toBe(1)
    // Both references stay reachable via the unchanged data-cite-ids.
    expect(out).toContain("data-cite-ids=\"[&quot;smith2019&quot;,&quot;smith2020&quot;]\"")
    // Both quotes are now on data-cite-quote so the dialog shows them.
    expect(out).toContain('data-cite-quote="[&quot;Earlier point.&quot;,&quot;Later point.&quot;]"')
  })

  it("ignores spans without the cite-ref class", () => {
    const input = '<span class="other" data-cite-ids="[&quot;a2020&quot;,&quot;b2020&quot;]">(A, 2020; B, 2020)</span>'
    expect(splitMultiCitations(input)).toBe(input)
  })
})
