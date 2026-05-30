import { MoonIcon, SunIcon } from "lucide-react"

// Toggles the `.dark` class on <html> and persists the choice. The icon is
// driven purely by the `dark:` variant (both rendered, CSS picks one), so no
// React state is needed and there's no hydration mismatch with the no-flash
// init script in the page <head>.
export function ThemeToggle() {
  function toggle() {
    const isDark = document.documentElement.classList.toggle("dark")
    localStorage.setItem("theme", isDark ? "dark" : "light")
  }

  return (
    <button
      onClick={toggle}
      className="rounded-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      title="Toggle theme"
      aria-label="Toggle theme"
    >
      <MoonIcon className="h-4 w-4 dark:hidden" />
      <SunIcon className="hidden h-4 w-4 dark:block" />
      <span className="sr-only">Toggle theme</span>
    </button>
  )
}
