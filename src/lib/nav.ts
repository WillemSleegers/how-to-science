import { readFileSync, readdirSync, existsSync } from "node:fs"
import { join, resolve, relative } from "node:path"
import { load } from "js-yaml"

const CONTENT_DIR = resolve(process.cwd(), "content")

export interface NavPage {
  title: string
  slug: string
}

export interface NavSection {
  title: string
  indexSlug: string
  pages: NavPage[]
}

export interface NavGroup {
  label: string
  sections: NavSection[]
}

type Frontmatter = Record<string, unknown>

function readFrontmatter(filePath: string): Frontmatter {
  try {
    const content = readFileSync(filePath, "utf-8")
    const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/)
    if (!match) return {}
    return (load(match[1]) as Frontmatter) ?? {}
  } catch {
    return {}
  }
}

function fileToSlug(relPath: string): string {
  return relPath
    .replace(/\.md$/, "")
    .split("/")
    .map((s) => s.toLowerCase())
    .join("/")
    .replace(/\/index$/, "")
}

function toTitleCase(kebab: string): string {
  return kebab
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
}

function listMdFiles(dir: string): string[] {
  const results: string[] = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) results.push(...listMdFiles(full))
    else if (entry.name.endsWith(".md")) results.push(full)
  }
  return results
}

function getOrder(fm: Frontmatter): number {
  return typeof fm.order === "number" ? fm.order : 999
}

export function loadNav(): NavGroup[] {
  const groups: NavGroup[] = []

  const groupEntries = readdirSync(CONTENT_DIR, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .sort((a, b) => {
      const oa = getOrder(readFrontmatter(join(CONTENT_DIR, a.name, "index.md")))
      const ob = getOrder(readFrontmatter(join(CONTENT_DIR, b.name, "index.md")))
      return oa - ob || a.name.localeCompare(b.name)
    })

  for (const groupEntry of groupEntries) {
    const groupDir = join(CONTENT_DIR, groupEntry.name)
    const groupIndexPath = join(groupDir, "index.md")
    if (!existsSync(groupIndexPath)) continue

    const groupFm = readFrontmatter(groupIndexPath)
    const groupLabel = (groupFm.title as string) ?? toTitleCase(groupEntry.name)

    const sectionEntries = readdirSync(groupDir, { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .sort((a, b) => {
        const oa = getOrder(readFrontmatter(join(groupDir, a.name, "index.md")))
        const ob = getOrder(readFrontmatter(join(groupDir, b.name, "index.md")))
        return oa - ob || a.name.localeCompare(b.name)
      })

    const sections: NavSection[] = []

    for (const sectionEntry of sectionEntries) {
      const sectionDir = join(groupDir, sectionEntry.name)
      const sectionIndexPath = join(sectionDir, "index.md")
      if (!existsSync(sectionIndexPath)) continue

      const sectionFm = readFrontmatter(sectionIndexPath)
      const sectionTitle = (sectionFm.title as string) ?? toTitleCase(sectionEntry.name)
      const sectionSlug = fileToSlug(relative(CONTENT_DIR, sectionIndexPath))

      const pageFiles = listMdFiles(sectionDir)
        .filter((f) => f !== sectionIndexPath)
        .sort((a, b) => {
          const oa = getOrder(readFrontmatter(a))
          const ob = getOrder(readFrontmatter(b))
          const sa = fileToSlug(relative(CONTENT_DIR, a))
          const sb = fileToSlug(relative(CONTENT_DIR, b))
          return oa - ob || sa.localeCompare(sb)
        })

      const pages: NavPage[] = [
        { title: sectionTitle, slug: sectionSlug },
        ...pageFiles.map((f) => {
          const fm = readFrontmatter(f)
          const slug = fileToSlug(relative(CONTENT_DIR, f))
          const name = slug.split("/").pop() ?? ""
          return {
            title: (fm.title as string) ?? toTitleCase(name),
            slug,
          }
        }),
      ]

      sections.push({ title: sectionTitle, indexSlug: sectionSlug, pages })
    }

    groups.push({ label: groupLabel, sections })
  }

  return groups
}
