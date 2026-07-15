import { defineCollection } from "astro:content"
import { glob } from "astro/loaders"
import { z } from "astro/zod"

const docs = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./content" }),
  schema: z.object({
    title: z.string().optional(),
    toc: z.boolean().optional(),
    "toc-depth": z.number().optional(),
    "code-fold": z.union([z.boolean(), z.string()]).optional(),
    "code-tools": z.boolean().optional(),
    order: z.number().optional(),
    description: z.string().optional(),
    draft: z.boolean().optional(),
  }),
})

export const collections = { docs }
