import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { load } from "js-yaml"

interface QuartoFormat {
  "toc-depth"?: number
  [key: string]: unknown
}

interface QuartoConfig {
  format?: {
    gfm?: QuartoFormat
    [key: string]: unknown
  }
  "toc-depth"?: number
  [key: string]: unknown
}

let cached: QuartoConfig | null = null

function loadQuartoConfig(): QuartoConfig {
  if (!cached) {
    const file = readFileSync(resolve(process.cwd(), "_quarto.yml"), "utf-8")
    cached = (load(file) as QuartoConfig) ?? {}
  }
  return cached
}

export function getGlobalTocDepth(): number {
  const config = loadQuartoConfig()
  return (
    config.format?.gfm?.["toc-depth"] ??
    config["toc-depth"] ??
    2
  )
}
