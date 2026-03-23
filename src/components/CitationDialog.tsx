import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface CitationData {
  id: string
  quote: string
  page: string
  label: string
}

export function CitationDialog() {
  const [active, setActive] = useState<CitationData | null>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const el = (e.target as HTMLElement).closest<HTMLElement>(".cite-ref")
      if (!el) return
      e.preventDefault()
      setActive({
        id: el.dataset.citeId ?? "",
        quote: el.dataset.citeQuote ?? "",
        page: el.dataset.citePage ?? "",
        label: el.textContent ?? "",
      })
    }
    document.addEventListener("click", handleClick)
    return () => document.removeEventListener("click", handleClick)
  }, [])

  return (
    <Dialog open={!!active} onOpenChange={() => setActive(null)}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-sm font-medium text-muted-foreground">
            Supporting quote
          </DialogTitle>
        </DialogHeader>
        {active && (
          <>
            <blockquote className="border-l-2 pl-4 italic text-foreground">
              "{active.quote}"
            </blockquote>
            {active.page && (
              <p className="text-sm text-muted-foreground">p.&nbsp;{active.page}</p>
            )}
            <a
              href={`#ref-${active.id}`}
              onClick={() => setActive(null)}
              className="text-sm text-primary underline underline-offset-2"
            >
              Go to reference
            </a>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
