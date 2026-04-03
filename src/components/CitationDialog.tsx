import { useState, useEffect } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

interface CitationData {
  id: string
  quote: string
  page: string
  label: string
  refHtml: string
}

export function CitationDialog() {
  const [active, setActive] = useState<CitationData | null>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const el = (e.target as HTMLElement).closest<HTMLElement>(".cite-ref")
      if (!el) return
      e.preventDefault()

      const id = el.dataset.citeId ?? ""
      const quote = el.dataset.citeQuote ?? ""
      const refEl = document.getElementById("ref-" + id)

      setActive({
        id,
        quote,
        page: el.dataset.citePage ?? "",
        label: el.textContent ?? "",
        refHtml: refEl?.innerHTML ?? "",
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
            {active?.quote ? "Supporting quote" : "Reference"}
          </SheetTitle>
        </SheetHeader>
        {active && active.quote && (
          <div className="space-y-2 px-4">
            <blockquote className="border-l-2 pl-4 italic text-foreground">
              "{active.quote}"
            </blockquote>
            {active.page && (
              <p className="text-sm text-muted-foreground">p.&nbsp;{active.page}</p>
            )}
          </div>
        )}
        {active && active.refHtml && (
          <p
            className="px-4 text-sm text-foreground"
            dangerouslySetInnerHTML={{ __html: active.refHtml }}
          />
        )}
      </SheetContent>
    </Sheet>
  )
}
