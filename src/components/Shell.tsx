import React from "react"
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar"
import type { NavGroup, NavSection } from "@/lib/nav"

function PageSidebar({
  nav,
  section,
  currentSlug,
}: {
  nav?: NavGroup[]
  section?: NavSection
  currentSlug?: string
}) {
  return (
    <Sidebar variant="inset">
      <SidebarContent className="px-4 py-6">
        <a href={import.meta.env.BASE_URL} className="mb-6 block text-sm font-semibold text-sidebar-foreground hover:text-sidebar-foreground">
          How to Science
        </a>

        {nav && nav.map((group) => (
          <div key={group.label} className="mb-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-sidebar-foreground/50">
              {group.label}
            </p>
            <ul className="space-y-1">
              {group.sections.map((s) => (
                <li key={s.indexSlug}>
                  <a
                    href={`${import.meta.env.BASE_URL}${s.indexSlug}`}
                    className="block text-sm transition-colors text-sidebar-foreground/50 hover:text-sidebar-foreground"
                  >
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {section && (
          <>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-sidebar-foreground/50">
              {section.title}
            </p>
            <ul className="space-y-1">
              {section.pages.map((page) => (
                <li key={page.slug}>
                  <a
                    href={`${import.meta.env.BASE_URL}${page.slug}`}
                    className={`block text-sm transition-colors ${
                      page.slug === currentSlug
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

interface ShellProps {
  nav?: NavGroup[]
  section?: NavSection
  currentSlug?: string
  headerRight?: React.ReactNode
  children: React.ReactNode
}

export function Shell({ nav, section, currentSlug, headerRight, children }: ShellProps) {
  return (
    <SidebarProvider>
      <PageSidebar nav={nav} section={section} currentSlug={currentSlug} />
      <SidebarInset className="m-2 ml-0 rounded-xl shadow-sm">
        <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 bg-background px-4 rounded-t-xl">
          <SidebarTrigger />
          {headerRight && <><div className="flex-1" />{headerRight}</>}
        </header>
        <div className="flex-1 overflow-hidden rounded-b-xl">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
