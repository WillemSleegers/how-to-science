import React from "react"
import ReactMarkdown, { type Components } from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"
import { CitationDialog } from "./CitationDialog"
import { slugify } from "@/lib/headings"

interface QmdPageProps {
  content: string
}

const ALERT_TYPES = ["NOTE", "TIP", "IMPORTANT", "WARNING", "CAUTION"] as const
const ALERT_PATTERN = new RegExp(
  `^> \\[!(${ALERT_TYPES.join("|")})\\]\\n((?:>[ \\t]?.*\\n)*)`,
  "gm"
)

function preprocessMarkdown(content: string): string {
  return content.replace(ALERT_PATTERN, (_, type: string, body: string) => {
    const inner = body
      .split("\n")
      .map((line) => line.replace(/^>[ \t]?/, ""))
      .filter(Boolean)
      .join(" ")
      .trim()
    const label = type.charAt(0) + type.slice(1).toLowerCase()
    return `<div class="callout not-prose callout-${type.toLowerCase()}"><p class="callout-title">${label}</p><p>${inner}</p></div>\n\n`
  })
}

function nodeText(children: React.ReactNode): string {
  if (typeof children === "string") return children
  if (typeof children === "number") return String(children)
  if (Array.isArray(children)) return children.map(nodeText).join("")
  if (React.isValidElement<{ children?: React.ReactNode }>(children)) return nodeText(children.props.children)
  return ""
}

const components: Components = {
  h2: ({ node: _node, children, ...props }) => (
    <h2 id={slugify(nodeText(children))} {...props}>{children}</h2>
  ),
  h3: ({ node: _node, children, ...props }) => (
    <h3 id={slugify(nodeText(children))} {...props}>{children}</h3>
  ),
}

export function QmdPage({ content }: QmdPageProps) {
  return (
    <>
      <div className="prose prose-neutral max-w-none dark:prose-invert">
        <ReactMarkdown components={components} remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
          {preprocessMarkdown(content)}
        </ReactMarkdown>
      </div>
      <CitationDialog />
    </>
  )
}
