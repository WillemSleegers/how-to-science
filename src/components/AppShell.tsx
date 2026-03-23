import React, { useState, useEffect } from "react"
import {
  SidebarProvider,
  SidebarRight,
  SidebarRightTrigger,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar"
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
  if (!section) return null
  return (
    <Sidebar>
      <SidebarHeader className="px-4 py-3">
        <span className="font-semibold text-sm">{section.title}</span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {section.pages.map((page) => (
              <SidebarMenuItem key={page.slug}>
                <SidebarMenuButton asChild isActive={currentSlug === page.slug}>
                  <a href={`/${page.slug}`}>{page.title}</a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
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
                    className={`block text-sm transition-colors ${
                      activeId === h.id
                        ? "font-medium text-foreground"
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
    <SidebarProvider className="flex-col">
      <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 bg-background px-4">
        <SidebarTrigger />
        <a href="/" className="flex-1 text-sm font-semibold">
          How to Science
        </a>
        {hasToc && <SidebarRightTrigger />}
      </header>

      <div className="flex flex-1">
        <PageSidebar currentSlug={slug} section={section} />
        <SidebarInset>
          <div className="px-8 py-8 max-w-prose mx-auto">
            <div className="prose prose-neutral">
              <h1>{title}</h1>
              <QmdPage content={content} />
            </div>
          </div>
        </SidebarInset>
        <TocSidebar headings={headings} />
      </div>
    </SidebarProvider>
  )
}
