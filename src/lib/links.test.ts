import { describe, it, expect } from "vitest"
import { resolveInternalHref, resolveAssetSrc } from "./links.js"

const BASE = "/how-to-science"

describe("resolveInternalHref", () => {
  it("prepends the base to a root-relative internal link", () => {
    expect(resolveInternalHref("/about/features", BASE)).toBe("/how-to-science/about/features")
  })

  it("leaves external URLs untouched", () => {
    expect(resolveInternalHref("https://example.com", BASE)).toBe("https://example.com")
    expect(resolveInternalHref("http://example.com/x", BASE)).toBe("http://example.com/x")
  })

  it("leaves in-page anchors untouched", () => {
    expect(resolveInternalHref("#section", BASE)).toBe("#section")
  })

  it("leaves protocol-relative URLs untouched", () => {
    expect(resolveInternalHref("//cdn.example.com/x", BASE)).toBe("//cdn.example.com/x")
  })

  it("does not double-prepend a link that already carries the base", () => {
    expect(resolveInternalHref("/how-to-science/about", BASE)).toBe("/how-to-science/about")
  })

  it("leaves relative links (no leading slash) untouched", () => {
    expect(resolveInternalHref("features", BASE)).toBe("features")
    expect(resolveInternalHref("mailto:a@b.com", BASE)).toBe("mailto:a@b.com")
  })

  it("passes through undefined", () => {
    expect(resolveInternalHref(undefined, BASE)).toBeUndefined()
  })
})

describe("resolveAssetSrc", () => {
  const slug = "statistics/regression/collinearity"

  it("resolves a page-relative image under the slug", () => {
    expect(resolveAssetSrc("fig_files/plot.svg", BASE, slug)).toBe(
      "/how-to-science/statistics/regression/collinearity/fig_files/plot.svg"
    )
  })

  it("leaves absolute URLs untouched", () => {
    expect(resolveAssetSrc("https://example.com/a.png", BASE, slug)).toBe("https://example.com/a.png")
  })

  it("leaves root-relative srcs untouched", () => {
    expect(resolveAssetSrc("/favicon.svg", BASE, slug)).toBe("/favicon.svg")
  })

  it("passes through undefined", () => {
    expect(resolveAssetSrc(undefined, BASE, slug)).toBeUndefined()
  })
})
