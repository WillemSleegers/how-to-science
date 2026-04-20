import React from "react"
import ReactMarkdown, { type Components } from "react-markdown"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import rehypeRaw from "rehype-raw"
import rehypeKatex from "rehype-katex"
import { CitationDialog } from "./CitationDialog"
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
        {preprocessCallouts(content)}
      </ReactMarkdown>
      <CitationDialog />
    </>
  )
}
