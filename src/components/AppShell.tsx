"use client"

import React, { useState, useEffect, Suspense } from "react"
import { ChevronDownIcon, ListIcon, MenuIcon } from "lucide-react"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible"
import type { NavSection, NavNode } from "@/lib/nav"
import { MarkdownContent } from "@/components/MarkdownContent"
import type { Heading } from "@/lib/headings"

const base = import.meta.env.BASE_URL.replace(/\/$/, "")

// ── Navigation dropdown content ───────────────────────────────────────────────

function DescriptionCard({
  href,
  title,
  description,
  active,
}: {
  href: string
  title: string
  description?: string
  active?: boolean
}) {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          href={href}
          data-active={active ? true : undefined}
          className="flex flex-col items-start select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-active:bg-accent/50"
        >
          <div className="text-sm leading-none">{title}</div>
          {description && (
            <p className="mt-1 text-sm leading-snug text-muted-foreground line-clamp-2">
              {description}
            </p>
          )}
        </a>
      </NavigationMenuLink>
    </li>
  )
}


function GroupedContent({ nodes, currentSlug }: { nodes: NavNode[]; currentSlug: string }) {
  return (
    <div className="w-[600px] p-4 space-y-4">
      {nodes.map((node) => {
        const pages = node.slug ? [node] : node.children.filter((c) => c.slug)
        if (pages.length === 0) return null
        return (
          <div key={node.title}>
            <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {node.title}
            </p>
            <ul className="grid grid-cols-2 gap-1">
              {pages.map((page) =>
                page.slug ? (
                  <DescriptionCard
                    key={page.slug}
                    href={`${base}/${page.slug}`}
                    title={page.title}
                    description={page.description}
                    active={page.slug === currentSlug}
                  />
                ) : null
              )}
            </ul>
          </div>
        )
      })}
    </div>
  )
}

// ── Mobile nav ────────────────────────────────────────────────────────────────

function MobileNav({ nav, currentSlug }: { nav: NavSection[]; currentSlug: string }) {
  return (
    <Sheet>
      <SheetTrigger className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors">
        <MenuIcon className="h-5 w-5" />
        <span className="sr-only">Open menu</span>
      </SheetTrigger>
      <SheetContent side="left" className="w-full overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            <a href={base || "/"} className="font-semibold text-sm">How to Science</a>
          </SheetTitle>
        </SheetHeader>
        <nav className="mt-4 space-y-1">
          {nav.map((section) => (
            <Collapsible key={section.title} defaultOpen>
              <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors [&[data-state=open]>svg]:rotate-180">
                {section.title}
                <ChevronDownIcon className="h-3 w-3 transition-transform duration-200" />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <ul className="mt-1 mb-2 space-y-3">
                  {section.nodes.map((node) => {
                    if (node.slug) {
                      return (
                        <li key={node.slug}>
                          <a
                            href={`${base}/${node.slug}`}
                            data-active={node.slug === currentSlug ? true : undefined}
                            className="block rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground data-active:bg-accent/50"
                          >
                            {node.title}
                          </a>
                        </li>
                      )
                    }
                    const children = node.children.filter((c) => c.slug)
                    if (children.length === 0) return null
                    return (
                      <li key={node.title}>
                        <p className="px-2 py-1 text-xs font-medium text-muted-foreground">{node.title}</p>
                        <ul>
                          {children.map((child) => (
                            <li key={child.slug}>
                              <a
                                href={`${base}/${child.slug}`}
                                data-active={child.slug === currentSlug ? true : undefined}
                                className="block rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground data-active:bg-accent/50"
                              >
                                {child.title}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </li>
                    )
                  })}
                </ul>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  )
}

// ── Shell (header + page wrapper) ─────────────────────────────────────────────

export function Shell({
  nav,
  currentSlug,
  children,
  showTocToggle,
  tocOpen,
  onTocToggle,
}: {
  nav: NavSection[]
  currentSlug: string
  children: React.ReactNode
  showTocToggle?: boolean
  tocOpen?: boolean
  onTocToggle?: () => void
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center px-6 gap-4">
          <MobileNav nav={nav} currentSlug={currentSlug} />
          <a href={base || "/"} className="font-semibold text-sm">
            How to Science
          </a>
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              {nav.map((section) => (
                <NavigationMenuItem key={section.title}>
                  <NavigationMenuTrigger>{section.title}</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <GroupedContent nodes={section.nodes} currentSlug={currentSlug} />
                  </NavigationMenuContent>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
          {showTocToggle && (
            <button
              onClick={onTocToggle}
              className="ml-auto hidden lg:block text-muted-foreground hover:text-foreground transition-colors"
              title={tocOpen ? "Hide table of contents" : "Show table of contents"}
            >
              <ListIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  )
}

// ── TOC ───────────────────────────────────────────────────────────────────────

function TocLinks({ headings, activeId }: { headings: Heading[]; activeId: string }) {
  return (
    <ul className="space-y-1">
      {headings.map((h) => (
        <li key={h.id} style={{ paddingLeft: `${(h.level - 2) * 12}px` }}>
          <a
            href={`#${h.id}`}
            onClick={(e) => {
              e.preventDefault()
              document.getElementById(h.id)?.scrollIntoView({ behavior: "smooth" })
            }}
            className={`block transition-colors ${
              h.level === 2 ? "text-sm" : "text-xs"
            } ${
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
  )
}

function TocPanel({ headings, open }: { headings: Heading[]; open: boolean }) {
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
    <div className={`hidden lg:block sticky top-14 self-start shrink-0 overflow-hidden transition-[width] duration-300 ease-in-out max-h-[calc(100vh-3.5rem)] ${open ? "w-56" : "w-0"}`}>
      <div className="w-56 py-8 pr-6 overflow-y-auto max-h-[calc(100vh-3.5rem)]">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          On this page
        </p>
        <TocLinks headings={headings} activeId={activeId} />
      </div>
    </div>
  )
}

function InlineToc({ headings }: { headings: Heading[] }) {
  return (
    <nav className="lg:hidden mb-8 rounded-lg border p-4">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        On this page
      </p>
      <TocLinks headings={headings} activeId="" />
    </nav>
  )
}

// ── AppShell ──────────────────────────────────────────────────────────────────

interface AppShellProps {
  content: string
  title: string
  slug: string
  headings: Heading[]
  tocDepth: number
  nav: NavSection[]
}

export function AppShell({ content, title, slug, headings, tocDepth, nav }: AppShellProps) {
  const tocHeadings = headings.filter((h) => h.level <= tocDepth)
  const [tocOpen, setTocOpen] = useState(true)

  return (
    <Shell
      nav={nav}
      currentSlug={slug}
      showTocToggle={tocHeadings.length > 0}
      tocOpen={tocOpen}
      onTocToggle={() => setTocOpen(!tocOpen)}
    >
      <div className="flex flex-1">
        <div className="flex-1 min-w-0 px-4 md:px-8 py-8 pb-[50vh]">
          <div className="prose prose-neutral w-full max-w-none lg:max-w-3xl mx-auto dark:prose-invert">
            <h1>{title}</h1>
            {tocHeadings.length > 0 && <InlineToc headings={tocHeadings} />}
            <Suspense>
              <MarkdownContent content={content} slug={slug} />
            </Suspense>
          </div>
        </div>
        {tocHeadings.length > 0 && <TocPanel headings={tocHeadings} open={tocOpen} />}
      </div>
    </Shell>
  )
}
