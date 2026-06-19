"use client"

import { useState, useEffect, Suspense } from "react"
import { ChevronRightIcon } from "lucide-react"
import { MarkdownContent } from "@/components/MarkdownContent"
import { ActionsMenu } from "@/components/ActionsMenu"
import type { Heading } from "@/lib/headings"

interface Crumb {
  title: string
  href?: string
}

// ── TopBar ────────────────────────────────────────────────────────────────────

function TopBar({
  trail,
  showTocToggle,
  tocOpen,
  onTocToggle,
}: {
  trail: Crumb[]
  showTocToggle: boolean
  tocOpen: boolean
  onTocToggle: () => void
}) {
  return (
    <div className="mb-8 flex items-center">
      {trail.length > 1 && (
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground"
        >
          {trail.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRightIcon className="size-3.5 opacity-60" />}
              {crumb.href ? (
                <a href={crumb.href} className="transition-colors hover:text-foreground">
                  {crumb.title}
                </a>
              ) : (
                <span className={i === trail.length - 1 ? "text-foreground" : undefined}>
                  {crumb.title}
                </span>
              )}
            </span>
          ))}
        </nav>
      )}
      <div className="ml-auto flex items-center">
        <ActionsMenu
          showTocToggle={showTocToggle}
          tocOpen={tocOpen}
          onTocToggle={onTocToggle}
        />
      </div>
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
            className={`block text-sm transition-colors ${
              activeId === h.id
                ? "font-medium text-primary"
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

function useActiveHeading(headings: Heading[]) {
  const [activeId, setActiveId] = useState("")

  useEffect(() => {
    const onScroll = () => {
      const atBottom = window.innerHeight + window.scrollY >= document.body.scrollHeight - 4
      if (atBottom) { setActiveId(headings[headings.length - 1]?.id ?? ""); return }
      const threshold = window.innerHeight * 0.5
      let active = ""
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

  return activeId
}

function TocPanel({ headings, open }: { headings: Heading[]; open: boolean }) {
  const activeId = useActiveHeading(headings)

  return (
    <div
      className={`sticky top-0 hidden min-w-0 max-h-screen self-start overflow-hidden transition-opacity duration-300 ease-in-out min-[72rem]:block ${
        open ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="max-h-screen w-56 overflow-y-auto py-8 pr-6">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          On this page
        </p>
        <TocLinks headings={headings} activeId={activeId} />
      </div>
    </div>
  )
}

function InlineToc({ headings }: { headings: Heading[] }) {
  const activeId = useActiveHeading(headings)
  return (
    <nav className="not-prose mb-8 min-[72rem]:hidden">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        On this page
      </p>
      <TocLinks headings={headings} activeId={activeId} />
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
  trail: Crumb[]
}

export function AppShell({ content, title, slug, headings, tocDepth, trail }: AppShellProps) {
  const tocHeadings = headings.filter((h) => h.level <= tocDepth)
  const [tocOpen, setTocOpen] = useState(true)
  const showToc = tocHeadings.length > 0

  return (
    <div
      className={`mx-auto grid min-h-screen w-full max-w-6xl grid-cols-1 transition-[grid-template-columns,column-gap] duration-300 ease-in-out ${
        showToc && tocOpen
          ? "min-[72rem]:grid-cols-[minmax(0,1fr)_14rem] min-[72rem]:gap-x-12"
          : "min-[72rem]:grid-cols-[minmax(0,1fr)_0rem] min-[72rem]:gap-x-0"
      }`}
    >
      <div className="min-w-0 px-6 py-8 pb-24 lg:px-8">
        <div className="mx-auto w-full max-w-none lg:max-w-3xl">
          <TopBar
            trail={trail}
            showTocToggle={showToc}
            tocOpen={tocOpen}
            onTocToggle={() => setTocOpen((v) => !v)}
          />
          <div className="prose prose-neutral max-w-none dark:prose-invert">
            <h1>{title}</h1>
            {showToc && tocOpen && <InlineToc headings={tocHeadings} />}
            <Suspense>
              <MarkdownContent content={content} slug={slug} />
            </Suspense>
          </div>
        </div>
      </div>
      {showToc && <TocPanel headings={tocHeadings} open={tocOpen} />}
    </div>
  )
}
