import { readFileSync, existsSync } from "node:fs"
import { join, resolve } from "node:path"
import { load } from "js-yaml"

const CONTENT_DIR = resolve(process.cwd(), "content")
const NAV_FILE = resolve(process.cwd(), "_nav.yml")
const BASE = (import.meta.env.BASE_URL ?? "/").replace(/\/$/, "")

// ── Public types (used by sidebar rendering) ─────────────────────────────────

export interface NavNode {
  title: string
  slug?: string // present → clickable page link
  description?: string
  children: NavNode[]
}

export interface NavSection {
  title: string
  kind: "group" | "section" // group = plain label, section = collapsible
  nodes: NavNode[]
}

// ── YAML config types ─────────────────────────────────────────────────────────

interface ConfigItem {
  path?: string
  title?: string
  text?: string
  items?: ConfigItem[]
}

interface ConfigSection {
  group?: string   // plain always-open label
  section?: string // collapsible group
  items?: ConfigItem[]
}

// ── Helpers ───────────────────────────────────────────────────────────────────

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

/** Resolve a nav path to its markdown file path. */
function resolveFile(navPath: string): string | null {
  const asFile = join(CONTENT_DIR, `${navPath}.md`)
  if (existsSync(asFile)) return asFile
  const asIndex = join(CONTENT_DIR, navPath, "index.md")
  if (existsSync(asIndex)) return asIndex
  return null
}

function titleFromPath(navPath: string): string {
  const file = resolveFile(navPath)
  if (file) {
    const fm = readFrontmatter(file)
    if (typeof fm.title === "string") return fm.title
  }
  // Fallback: last path segment, kebab-case → Title Case
  const segment = navPath.split("/").pop() ?? navPath
  return segment
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
}

// ── Config → NavNode ──────────────────────────────────────────────────────────

function buildNode(item: ConfigItem): NavNode | null {
  const children = (item.items ?? []).flatMap((child) => {
    const node = buildNode(child)
    return node ? [node] : []
  })

  if (item.path) {
    const slug = item.path.toLowerCase()
    const file = resolveFile(item.path)
    const fm = file ? readFrontmatter(file) : {}
    const title = item.text ?? item.title ?? (typeof fm.title === "string" ? fm.title : titleFromPath(item.path))
    const description = typeof fm.description === "string" ? fm.description : undefined
    return { title, slug, description, children }
  }

  if (item.title) {
    // Grouping label — no slug
    return { title: item.title, children }
  }

  return null
}

// ── Public API ────────────────────────────────────────────────────────────────

export function loadNav(): NavSection[] {
  const raw = readFileSync(NAV_FILE, "utf-8")
  const config = load(raw) as ConfigSection[]

  return config.flatMap((entry) => {
    const title = entry.group ?? entry.section
    if (!title) return []
    const kind: "group" | "section" = entry.group ? "group" : "section"
    const nodes = (entry.items ?? []).flatMap((item) => {
      const node = buildNode(item)
      return node ? [node] : []
    })
    return [{ title, kind, nodes }]
  })
}

/** Recursively collect all routable slugs from the nav tree. */
export function collectAllSlugs(sections: NavSection[]): string[] {
  function fromNodes(nodes: NavNode[]): string[] {
    return nodes.flatMap((n) => [
      ...(n.slug ? [n.slug] : []),
      ...fromNodes(n.children),
    ])
  }
  return sections.flatMap((s) => fromNodes(s.nodes))
}

/** Returns true if any node in the tree matches the given slug. */
export function treeContainsSlug(nodes: NavNode[], slug: string): boolean {
  return nodes.some(
    (n) => n.slug === slug || treeContainsSlug(n.children, slug)
  )
}

// ── Breadcrumbs ─────────────────────────────────────────────────────────────

export interface Crumb {
  title: string
  href?: string
}

export function slugify(title: string): string {
  return title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
}

/**
 * Build the breadcrumb trail for a page: Home → Section → [Group] → Page.
 * Section and group crumbs link to their anchor on the home page.
 */
export function findTrail(sections: NavSection[], slug: string): Crumb[] {
  const home: Crumb = { title: "How to Science", href: `${BASE}/` }
  for (const section of sections) {
    const sectionHref = `${BASE}/#${slugify(section.title)}`
    for (const node of section.nodes) {
      if (node.slug === slug) {
        return [home, { title: section.title, href: sectionHref }, { title: node.title }]
      }
      const child = node.children.find((c) => c.slug === slug)
      if (child) {
        return [
          home,
          { title: section.title, href: sectionHref },
          { title: node.title, href: `${BASE}/#${slugify(node.title)}` },
          { title: child.title },
        ]
      }
    }
  }
  return [home]
}
