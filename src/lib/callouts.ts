const ALERT_TYPES = ["NOTE", "TIP", "IMPORTANT", "WARNING", "CAUTION"] as const
const ALERT_PATTERN = new RegExp(
  `^> \\[!(${ALERT_TYPES.join("|")})\\]\\n((?:>[ \\t]?.*\\n)*)`,
  "gm"
)

export function preprocessCallouts(content: string): string {
  return content.replace(ALERT_PATTERN, (_, type: string, body: string) => {
    const stripped = body.split("\n").map((line) => line.replace(/^>[ \t]?/, ""))
    const paragraphs: string[] = []
    let current: string[] = []
    for (const line of stripped) {
      if (line.trim() === "") {
        if (current.length > 0) { paragraphs.push(current.join(" ").trim()); current = [] }
      } else {
        current.push(line)
      }
    }
    if (current.length > 0) paragraphs.push(current.join(" ").trim())
    const label = type.charAt(0) + type.slice(1).toLowerCase()
    const bodyHtml = paragraphs.map((p) => `<p>${p}</p>`).join("")
    return `<div class="callout not-prose callout-${type.toLowerCase()}"><p class="callout-title">${label}</p>${bodyHtml}</div>\n\n`
  })
}
