// Helpers for resolving markdown link and asset URLs against the deploy base
// (e.g. "/how-to-science"), so content can reference site paths without
// hardcoding the base in every page.

/**
 * Resolve a markdown link href. Root-relative, site-internal paths (e.g.
 * `/about/features`) get the base prepended. External URLs, in-page anchors
 * (`#…`), protocol-relative URLs (`//…`), and hrefs that already carry the base
 * are returned unchanged.
 */
export function resolveInternalHref(href: string | undefined, base: string): string | undefined {
  if (!href) return href
  const internal =
    href.startsWith("/") && !href.startsWith("//") && !href.startsWith(`${base}/`)
  return internal ? `${base}${href}` : href
}

/**
 * Resolve an image src. A path relative to the page (no scheme, not
 * root-relative) is resolved under the page's slug so Quarto figure output
 * loads from the right place. Absolute and root-relative srcs pass through.
 */
export function resolveAssetSrc(
  src: string | undefined,
  base: string,
  slug: string
): string | undefined {
  if (src && !src.startsWith("http") && !src.startsWith("/")) {
    return `${base}/${slug}/${src}`
  }
  return src
}
