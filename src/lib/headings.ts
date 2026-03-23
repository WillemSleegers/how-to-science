export interface Heading {
  id: string
  text: string
  level: number
}

// Quarto outputs a TOC list at the top of the markdown when toc: true.
// We strip it since we render our own right-side TOC.
export function stripQuartoToc(markdown: string): string {
  return markdown.replace(/^(\s*- \[.*?\]\(#.*?\)\n)+\n?/, "")
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

export function extractHeadings(markdown: string): Heading[] {
  const headings: Heading[] = []
  const lines = markdown.split("\n")
  for (const line of lines) {
    const match = line.match(/^(#{2,3})\s+(.+)/)
    if (!match) continue
    const level = match[1].length
    const text = match[2].trim()
    headings.push({ id: slugify(text), text, level })
  }
  return headings
}
