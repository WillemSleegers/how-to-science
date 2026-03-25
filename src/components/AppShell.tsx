import React, { useState, useEffect } from "react"
import {
  SidebarRight,
  SidebarRightTrigger,
  SidebarContent,
} from "@/components/ui/sidebar"
import type { NavSection } from "@/lib/nav"
import { MarkdownContent } from "@/components/MarkdownContent"
import { Shell } from "@/components/Shell"
import type { Heading } from "@/lib/headings"

interface AppShellProps {
  content: string
  title: string
  slug: string
  headings: Heading[]
  section: NavSection | undefined
}

function TocSidebar({ headings }: { headings: Heading[] }) {
  const [activeId, setActiveId] = useState("")

  useEffect(() => {
    const onScroll = () => {
      const atBottom = window.innerHeight + window.scrollY >= document.body.scrollHeight - 4
      if (atBottom) { setActiveId(headings[headings.length - 1]?.id ?? ""); return }
      const threshold = window.innerHeight * 0.5
      let active = headings[0]?.id ?? ""
      for (const h of headings) {
        const el = document.getElementById(h.id)
        if (el && el.getBoundingClientRect().top <= threshold) active = h.id
      }
      setActiveId(active)
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener("scroll", onScroll)
  }, [headings])

  return (
    <SidebarRight style={{ "--sidebar-width": "14rem" } as React.CSSProperties}>
      <SidebarContent className="px-4 py-6">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          On this page
        </p>
        <ul className="space-y-1">
          {headings.map((h) => (
            <li key={h.id}>
              <a
                href={`#${h.id}`}
                onClick={(e) => {
                  e.preventDefault()
                  document.getElementById(h.id)?.scrollIntoView({ behavior: "smooth" })
                }}
                className={`block text-sm transition-colors ${
                  activeId === h.id
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {h.text}
              </a>
            </li>
          ))}
        </ul>
      </SidebarContent>
    </SidebarRight>
  )
}

export function AppShell({ content, title, slug, headings, section }: AppShellProps) {
  const tocHeadings = headings.filter((h) => h.level === 2)

  return (
    <Shell
      section={section}
      currentSlug={slug}
      headerRight={tocHeadings.length > 0 ? <SidebarRightTrigger /> : undefined}
    >
      <div className="flex flex-1">
        <div className="flex-1 px-8 py-8 pb-[50vh]">
          <div className="prose prose-neutral max-w-3xl mx-auto dark:prose-invert">
            <h1>{title}</h1>
            <MarkdownContent content={content} />
          </div>
        </div>
        {tocHeadings.length > 0 && <TocSidebar headings={tocHeadings} />}
      </div>
    </Shell>
  )
}
