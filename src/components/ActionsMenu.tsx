import { DropdownMenu } from "radix-ui"
import { MoreVerticalIcon, MoonIcon, SunIcon, PanelRightIcon } from "lucide-react"

function toggleTheme() {
  const isDark = document.documentElement.classList.toggle("dark")
  localStorage.setItem("theme", isDark ? "dark" : "light")
}

const itemClass =
  "flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-foreground outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"

export function ActionsMenu({
  showTocToggle,
  tocOpen,
  onTocToggle,
}: {
  showTocToggle: boolean
  tocOpen: boolean
  onTocToggle: () => void
}) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        className="rounded-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Page actions"
      >
        <MoreVerticalIcon className="h-4 w-4" />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={6}
          className="z-50 min-w-44 rounded-md border bg-background p-1 shadow-md"
        >
          <DropdownMenu.Item className={itemClass} onSelect={toggleTheme}>
            <MoonIcon className="h-4 w-4 dark:hidden" />
            <SunIcon className="hidden h-4 w-4 dark:block" />
            <span className="dark:hidden">Dark mode</span>
            <span className="hidden dark:inline">Light mode</span>
          </DropdownMenu.Item>
          {showTocToggle && (
            <DropdownMenu.Item className={itemClass} onSelect={onTocToggle}>
              <PanelRightIcon className="h-4 w-4" />
              {tocOpen ? "Hide table of contents" : "Show table of contents"}
            </DropdownMenu.Item>
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
