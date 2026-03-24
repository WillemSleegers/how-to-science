import React from "react"
import ReactMarkdown, { type Components } from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"
import { CitationDialog } from "./CitationDialog"
import { slugify } from "@/lib/headings"
import { preprocessCallouts } from "@/lib/callouts"

interface MarkdownContentProps {
  content: string
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

export function MarkdownContent({ content }: MarkdownContentProps) {
  return (
    <>
      <ReactMarkdown components={components} remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
        {preprocessCallouts(content)}
      </ReactMarkdown>
      <CitationDialog />
    </>
  )
}
