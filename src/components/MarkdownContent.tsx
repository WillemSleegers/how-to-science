import React from "react"
import ReactMarkdown, { type Components } from "react-markdown"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import rehypeRaw from "rehype-raw"
import rehypeKatex from "rehype-katex"
import { CitationDialog } from "./CitationDialog"

function splitMultiCitations(content: string): string {
  return content.replace(
    /<span([^>]+)>\(([^<]*)\)<\/span>/g,
    (match, attrs: string, innerText: string) => {
      if (!attrs.includes('class="cite-ref"')) return match

      const idsMatch = attrs.match(/data-cite-ids="([^"]*)"/)
      if (!idsMatch) return match

      let ids: string[]
      try {
        ids = JSON.parse(idsMatch[1].replace(/&quot;/g, '"'))
      } catch {
        return match
      }

      if (ids.length <= 1) return match

      const segments = innerText.split('; ')
      if (segments.length !== ids.length) return match

      // Parse per-key quote map from {{< cites >}} shortcode
      let quoteMap: Record<string, string> = {}
      const quotesMatch = attrs.match(/data-cite-quotes="([^"]*)"/)
      if (quotesMatch) {
        try {
          quoteMap = JSON.parse(quotesMatch[1].replace(/&quot;/g, '"'))
        } catch { /* ignore */ }
      }

      // Sort keys by name prefix to match citeproc's alphabetical order
      const sortedIds = [...ids].sort((a, b) =>
        a.replace(/\d+.*$/, '').localeCompare(b.replace(/\d+.*$/, ''))
      )

      const spans = segments.map((seg, i) => {
        const id = sortedIds[i]
        const quote = quoteMap[id] ?? ''
        const quoteAttr = quote
          ? `[&quot;${quote.replace(/&/g, '&amp;').replace(/"/g, '&quot;')}&quot;]`
          : '[]'
        return `<span class="cite-ref" data-cite-id="${id}" data-cite-ids="[&quot;${id}&quot;]" data-cite-quote="${quoteAttr}" data-cite-page="">${seg}</span>`
      })

      return '(' + spans.join('; ') + ')'
    }
  )
}
import { slugify } from "@/lib/headings"
import { preprocessCallouts } from "@/lib/callouts"
import { createHighlighter } from "shiki"

const g = globalThis as typeof globalThis & { __shikiHighlighter?: ReturnType<typeof createHighlighter> }
if (!g.__shikiHighlighter) {
  g.__shikiHighlighter = createHighlighter({
    themes: ["github-light", "github-dark"],
    langs: ["r", "python", "javascript", "typescript", "bash", "sql", "json", "yaml"],
  })
}
const highlighterPromise = g.__shikiHighlighter

interface MarkdownContentProps {
  content: string
  slug: string
}

function nodeText(children: React.ReactNode): string {
  if (typeof children === "string") return children
  if (typeof children === "number") return String(children)
  if (Array.isArray(children)) return children.map(nodeText).join("")
  if (React.isValidElement<{ children?: React.ReactNode }>(children)) return nodeText(children.props.children)
  return ""
}

function CodeBlock({ children }: { children?: React.ReactNode }) {
  const highlighter = React.use(highlighterPromise)

  const codeEl = React.Children.toArray(children).find(
    (c): c is React.ReactElement<{ className?: string; children?: unknown }> =>
      React.isValidElement(c) && (c as React.ReactElement).type === "code"
  )

  const plain = (code: React.ReactNode) => (
    <pre className="not-prose rounded-lg bg-muted px-4 py-3 text-sm overflow-x-auto">
      <code>{code}</code>
    </pre>
  )

  const output = (code: React.ReactNode) => (
    <pre className="not-prose rounded-lg border border-border bg-background px-4 py-3 text-sm overflow-x-auto">
      <code>{code}</code>
    </pre>
  )

  if (!codeEl) return plain(children)

  const lang = (codeEl.props.className ?? "").replace("language-", "").trim()
  const raw = typeof codeEl.props.children === "string" ? codeEl.props.children : ""

  if (!lang) return output(raw)

  let html: string
  try {
    const full = highlighter.codeToHtml(raw, {
      lang,
      themes: { light: "github-light", dark: "github-dark" },
    })
    // Extract just the inner <code>...</code> from shiki's <pre><code>...</code></pre>
    const match = full.match(/<code>([\s\S]*)<\/code>/)
    html = match ? match[1] : ""
  } catch {
    return plain(raw)
  }

  return (
    <pre className="not-prose rounded-lg bg-muted px-4 py-3 text-sm overflow-x-auto">
      <code dangerouslySetInnerHTML={{ __html: html }} />
    </pre>
  )
}

const components: Components = {
  h2: ({ node: _node, children, ...props }) => (
    <h2 id={slugify(nodeText(children))} {...props}>{children}</h2>
  ),
  h3: ({ node: _node, children, ...props }) => (
    <h3 id={slugify(nodeText(children))} {...props}>{children}</h3>
  ),
  pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,
  table: ({ node: _node, children, ...props }) => (
    <div className="overflow-x-auto">
      <table {...props}>{children}</table>
    </div>
  ),
}

export function MarkdownContent({ content, slug }: MarkdownContentProps) {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "")
  const pageComponents: Components = {
    ...components,
    img: ({ src, alt }) => {
      const resolved = src && !src.startsWith("http") && !src.startsWith("/")
        ? `${base}/${slug}/${src}`
        : src
      return <img src={resolved} alt={alt ?? ""} />
    },
  }
  return (
    <>
      <ReactMarkdown components={pageComponents} remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeRaw, rehypeKatex]}>
        {splitMultiCitations(preprocessCallouts(content))}
      </ReactMarkdown>
      <CitationDialog />
    </>
  )
}
