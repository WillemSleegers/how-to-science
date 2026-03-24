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
  let inCodeBlock = false
  for (const line of markdown.split("\n")) {
    if (line.startsWith("```")) { inCodeBlock = !inCodeBlock; continue }
    if (inCodeBlock) continue
    const match = line.match(/^(#{2,3})\s+(.+)/)
    if (!match) continue
    const text = match[2].trim()
    headings.push({ id: slugify(text), text, level: match[1].length })
  }
  return headings
}
