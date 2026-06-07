import { useState, useEffect } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

interface CitationData {
  quotes: string[]
  page: string
  label: string
  refHtmls: string[]
}

function parseQuotes(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : parsed ? [String(parsed)] : []
  } catch {
    return raw ? [raw] : []
  }
}

function parseIds(raw: string, fallback: string): string[] {
  try {
    const ids = JSON.parse(raw)
    return ids.length > 0 ? ids : [fallback]
  } catch {
    return [fallback]
  }
}

export function CitationDialog() {
  const [active, setActive] = useState<CitationData | null>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const el = (e.target as HTMLElement).closest<HTMLElement>(".cite-ref")
      if (!el) return
      e.preventDefault()

      const quotes = parseQuotes(el.dataset.citeQuote ?? "")
      const ids = parseIds(el.dataset.citeIds ?? "", el.dataset.citeId ?? "")

      const refHtmls = ids
        .map(id => document.getElementById("ref-" + id)?.innerHTML ?? "")
        .filter(Boolean)

      setActive({
        quotes,
        page: el.dataset.citePage ?? "",
        label: el.textContent ?? "",
        refHtmls,
      })
    }
    document.addEventListener("click", handleClick)
    return () => document.removeEventListener("click", handleClick)
  }, [])

  function close() {
    setActive(null)
  }

  return (
    <Sheet open={!!active} onOpenChange={close}>
      <SheetContent side="right" className="w-96 max-w-full">
        <SheetHeader>
          <SheetTitle className="text-sm font-medium text-muted-foreground">
            {active?.quotes.length ? "Supporting quote" : "Reference"}
          </SheetTitle>
        </SheetHeader>
        {active && active.quotes.length > 0 && (
          <div className="space-y-4 px-4">
            {active.quotes.map((q, i) => (
              <blockquote key={i} className="border-l-2 pl-4 italic text-foreground">
                "{q}"
              </blockquote>
            ))}
            {active.page && (
              <p className="text-sm text-muted-foreground">p.&nbsp;{active.page}</p>
            )}
          </div>
        )}
        {active && active.refHtmls.map((html, i) => (
          <p
            key={i}
            className="px-4 text-sm text-foreground"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ))}
      </SheetContent>
    </Sheet>
  )
}
