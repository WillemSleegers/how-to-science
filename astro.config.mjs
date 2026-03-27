// @ts-check

import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "astro/config"
import react from "@astrojs/react"

// https://astro.build/config
export default defineConfig({
  site: "https://willemsleegers.github.io",
  base: "/how-to-science",
  outDir: "docs",
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [react()],
})
