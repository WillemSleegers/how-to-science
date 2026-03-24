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
import { Library } from "lucide-react"
import { nav, type NavSection } from "@/lib/nav"
import { QmdPage } from "@/components/QmdPage"

interface Heading {
  id: string
  text: string
  level: number
}

interface AppShellProps {
  content: string
  title: string
  slug: string
  headings: Heading[]
}

function PageSidebar({ currentSlug, section }: { currentSlug: string; section: NavSection | undefined }) {
  return (
    <Sidebar variant="inset">
      <SidebarContent className="px-4 py-6">
        <a href="/" className="mb-6 flex flex-col items-center gap-1 text-sm font-semibold text-sidebar-foreground hover:text-sidebar-foreground">
          <Library size={28} />
          <span className="text-center">How to Science</span>
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
  const filtered = headings.filter((h) => h.level === 2)
  const [activeId, setActiveId] = useState("")

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id)
        }
      },
      { rootMargin: "-14px 0% -80% 0%", threshold: 0 }
    )
    for (const h of filtered) {
      const el = document.getElementById(h.id)
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [headings])

  return (
    <SidebarRight style={{ "--sidebar-width": "14rem" } as React.CSSProperties}>
      <SidebarContent className="px-4 py-6">
        {filtered.length > 0 && (
          <>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              On this page
            </p>
            <ul className="space-y-1">
              {filtered.map((h) => (
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
          </>
        )}
      </SidebarContent>
    </SidebarRight>
  )
}

export function AppShell({ content, title, slug, headings }: AppShellProps) {
  const section = nav
    .flatMap((g) => g.sections)
    .find((s) => s.pages.some((p) => p.slug === slug))

  const hasToc = headings.some((h) => h.level === 2)

  return (
    <SidebarProvider>
      <PageSidebar currentSlug={slug} section={section} />
      <SidebarInset className="m-2 ml-0 rounded-xl shadow-sm overflow-hidden">
        <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 bg-background px-4">
          <SidebarTrigger />
          <div className="flex-1" />
          {hasToc && <SidebarRightTrigger />}
        </header>

        <div className="flex flex-1">
          <div className="flex-1 px-8 py-8">
            <div className="prose prose-neutral max-w-prose mx-auto">
              <h1>{title}</h1>
              <QmdPage content={content} />
            </div>
          </div>
          {hasToc && <TocSidebar headings={headings} />}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
