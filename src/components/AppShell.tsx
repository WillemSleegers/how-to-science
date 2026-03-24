import React, { useState, useEffect } from "react"
import {
  SidebarProvider,
  SidebarRight,
  SidebarRightTrigger,
  Sidebar,
  SidebarContent,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar"
import type { NavSection } from "@/lib/nav"
import { MarkdownContent } from "@/components/MarkdownContent"
import type { Heading } from "@/lib/headings"

interface AppShellProps {
  content: string
  title: string
  slug: string
  headings: Heading[]
  section: NavSection | undefined
}

function PageSidebar({ currentSlug, section }: { currentSlug: string; section: NavSection | undefined }) {
  return (
    <Sidebar variant="inset">
      <SidebarContent className="px-4 py-6">
        <a href="/" className="mb-6 block text-sm font-semibold text-sidebar-foreground hover:text-sidebar-foreground">
          How to Science
        </a>
        {section && (
          <>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-sidebar-foreground/50 text-left">
              {section.title}
            </p>
            <ul className="space-y-1">
              {section.pages.map((page) => (
                <li key={page.slug}>
                  <a
                    href={`/${page.slug}`}
                    className={`block text-sm transition-colors ${
                      currentSlug === page.slug
                        ? "text-sidebar-foreground"
                        : "text-sidebar-foreground/50 hover:text-sidebar-foreground"
                    }`}
                  >
                    {page.title}
                  </a>
                </li>
              ))}
            </ul>
          </>
        )}
      </SidebarContent>
    </Sidebar>
  )
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
    <SidebarProvider>
      <PageSidebar currentSlug={slug} section={section} />
      <SidebarInset className="m-2 ml-0 rounded-xl shadow-sm overflow-hidden">
        <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 bg-background px-4">
          <SidebarTrigger />
          <div className="flex-1" />
          {tocHeadings.length > 0 && <SidebarRightTrigger />}
        </header>

        <div className="flex flex-1">
          <div className="flex-1 px-8 py-8 pb-[50vh]">
            <div className="prose prose-neutral max-w-3xl mx-auto dark:prose-invert">
              <h1>{title}</h1>
              <MarkdownContent content={content} />
            </div>
          </div>
          {tocHeadings.length > 0 && <TocSidebar headings={tocHeadings} />}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
