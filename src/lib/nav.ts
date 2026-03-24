import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { load } from "js-yaml"

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

export function loadNav(): NavGroup[] {
  const file = readFileSync(resolve(process.cwd(), "content/nav.yaml"), "utf-8")
  return load(file) as NavGroup[]
}
