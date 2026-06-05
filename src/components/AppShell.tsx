"use client"

import { useState, useEffect, Suspense } from "react"
import { ChevronRightIcon } from "lucide-react"
import { MarkdownContent } from "@/components/MarkdownContent"
import type { Heading } from "@/lib/headings"

interface Crumb {
  title: string
  href?: string
}

// ── Breadcrumb ────────────────────────────────────────────────────────────────

function Breadcrumb({ trail }: { trail: Crumb[] }) {
  if (trail.length <= 1) return null
  return (
    <nav
      aria-label="Breadcrumb"
      className="mb-8 flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground"
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

function TocPanel({ headings }: { headings: Heading[] }) {
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

  return (
    <div className="sticky top-0 hidden max-h-screen w-56 shrink-0 self-start overflow-y-auto py-8 pr-6 lg:block">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        On this page
      </p>
      <TocLinks headings={headings} activeId={activeId} />
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
  trail: Crumb[]
}

export function AppShell({ content, title, slug, headings, tocDepth, trail }: AppShellProps) {
  const tocHeadings = headings.filter((h) => h.level <= tocDepth)

  return (
    <div className="flex min-h-screen">
      <div className="min-w-0 flex-1 px-6 py-8 pb-24 lg:px-8">
        <div className="mx-auto w-full max-w-none lg:max-w-3xl">
          <Breadcrumb trail={trail} />
          <div className="prose prose-neutral max-w-none dark:prose-invert">
            <h1>{title}</h1>
            {tocHeadings.length > 0 && <InlineToc headings={tocHeadings} />}
            <Suspense>
              <MarkdownContent content={content} slug={slug} />
            </Suspense>
          </div>
        </div>
      </div>
      {tocHeadings.length > 0 && <TocPanel headings={tocHeadings} />}
    </div>
  )
}
