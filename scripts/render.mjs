#!/usr/bin/env node
/**
 * Render .qmd files to .md using Quarto, then copy any figure output
 * to public/ so Astro can serve the images.
 *
 * Usage:
 *   node scripts/render.mjs                          # render all .qmd files
 *   node scripts/render.mjs src/content/foo.qmd      # render one file
 */

import { execSync } from "node:child_process"
import { existsSync, readdirSync, cpSync } from "node:fs"
import { join, resolve, relative, dirname, basename } from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = resolve(fileURLToPath(import.meta.url), "../..")
const CONTENT_DIR = join(ROOT, "src", "content")
const PUBLIC_DIR = join(ROOT, "public")

function copyFigures(qmdPath) {
  const stem = basename(qmdPath, ".qmd")
  const dir = dirname(qmdPath)
  const figDir = join(dir, `${stem}_files`)
  if (!existsSync(figDir)) return

  const relDir = relative(CONTENT_DIR, dir)
  const destDir = join(PUBLIC_DIR, relDir, `${stem}_files`)
  cpSync(figDir, destDir, { recursive: true })
  console.log(`  → copied figures to public/${relDir}/${stem}_files/`)
}

function renderFile(qmdPath) {
  const abs = resolve(qmdPath)
  console.log(`\nRendering ${relative(ROOT, abs)}`)
  execSync(`quarto render "${abs}"`, { cwd: ROOT, stdio: "inherit" })
  copyFigures(abs)
}

function walk(dir) {
  const entries = readdirSync(dir, { withFileTypes: true })
  const files = []
  for (const e of entries) {
    const full = join(dir, e.name)
    if (e.isDirectory()) files.push(...walk(full))
    else if (e.name.endsWith(".qmd")) files.push(full)
  }
  return files
}

const arg = process.argv[2]
if (arg) {
  renderFile(arg)
} else {
  const files = walk(CONTENT_DIR)
  console.log(`Found ${files.length} .qmd files`)
  for (const f of files) renderFile(f)
}

console.log("\nDone.")
