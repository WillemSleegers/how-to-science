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

// Shared link + group-label styling, used by both the desktop dropdown and the
// mobile sheet so the two stay visually consistent.
const navLinkClass =
  "block rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground data-active:bg-accent/50"
const groupLabelClass =
  "px-2 pt-2 pb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground"

function NavAnchor({
  slug,
  title,
  currentSlug,
  menuLink,
}: {
  slug: string
  title: string
  currentSlug: string
  menuLink?: boolean
}) {
  const anchor = (
    <a
      href={`${base}/${slug}`}
      data-active={slug === currentSlug ? true : undefined}
      className={navLinkClass}
    >
      {title}
    </a>
  )
  // Desktop links live inside a radix NavigationMenu and must be wrapped so the
  // menu manages focus/close; mobile links are plain anchors inside the Sheet.
  return menuLink ? <NavigationMenuLink asChild>{anchor}</NavigationMenuLink> : anchor
}

// Renders a section's nodes as a grouped list of links. Shared by both screen
// sizes; `menuLink` toggles the desktop NavigationMenuLink wrapper.
function NavNodeList({
  nodes,
  currentSlug,
  menuLink,
}: {
  nodes: NavNode[]
  currentSlug: string
  menuLink?: boolean
}) {
  return (
    <>
      {nodes.map((node) => {
        // Direct page link (no children) — render as a single item.
        if (node.slug) {
          return (
            <li key={node.slug}>
              <NavAnchor slug={node.slug} title={node.title} currentSlug={currentSlug} menuLink={menuLink} />
            </li>
          )
        }
        // Group label with its pages listed beneath.
        const pages = node.children.filter((c) => c.slug)
        if (pages.length === 0) return null
        return (
          <li key={node.title}>
            <p className={groupLabelClass}>{node.title}</p>
            <ul>
              {pages.map((page) => (
                <li key={page.slug}>
                  <NavAnchor slug={page.slug!} title={page.title} currentSlug={currentSlug} menuLink={menuLink} />
                </li>
              ))}
            </ul>
          </li>
        )
      })}
    </>
  )
}

function GroupedContent({ nodes, currentSlug }: { nodes: NavNode[]; currentSlug: string }) {
  return (
    <ul className="max-h-[70vh] w-64 overflow-y-auto p-2">
      <NavNodeList nodes={nodes} currentSlug={currentSlug} menuLink />
    </ul>
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
                <ul className="mt-1 mb-2">
                  <NavNodeList nodes={section.nodes} currentSlug={currentSlug} />
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
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
        <div className="flex-1 min-w-0 px-4 md:px-8 py-8 pb-[15vh]">
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
