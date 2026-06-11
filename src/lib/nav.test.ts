import { describe, it, expect, vi, beforeEach } from "vitest"
import { existsSync, readFileSync } from "node:fs"
import { buildNode, findTrail } from "./nav.js"

vi.mock("node:fs", () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
}))

const mockExistsSync = vi.mocked(existsSync)
const mockReadFileSync = vi.mocked(readFileSync)

describe("buildNode", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockExistsSync.mockReturnValue(false)
  })

  it("returns null when item has no path or title", () => {
    expect(buildNode({})).toBeNull()
  })

  it("builds a grouping node from title only (no slug)", () => {
    const node = buildNode({ title: "My Group" })
    expect(node).toEqual({ title: "My Group", children: [] })
    expect(node?.slug).toBeUndefined()
  })

  it("derives title from path when no file exists", () => {
    const node = buildNode({ path: "statistics/my-topic" })
    expect(node?.title).toBe("My Topic")
    expect(node?.slug).toBe("statistics/my-topic")
  })

  it("uses frontmatter title when file exists", () => {
    mockExistsSync.mockReturnValue(true)
    mockReadFileSync.mockImplementation(() => '---\ntitle: "Frontmatter Title"\n---\n')
    const node = buildNode({ path: "some/page" })
    expect(node?.title).toBe("Frontmatter Title")
  })

  it("prefers item.title over frontmatter title", () => {
    mockExistsSync.mockReturnValue(true)
    mockReadFileSync.mockImplementation(() => '---\ntitle: "FM Title"\n---\n')
    const node = buildNode({ path: "some/page", title: "Config Title" })
    expect(node?.title).toBe("Config Title")
  })

  it("prefers item.text over item.title and frontmatter", () => {
    mockExistsSync.mockReturnValue(true)
    mockReadFileSync.mockImplementation(() => '---\ntitle: "FM Title"\n---\n')
    const node = buildNode({ path: "some/page", title: "Config Title", text: "Override" })
    expect(node?.title).toBe("Override")
  })

  it("extracts description from frontmatter", () => {
    mockExistsSync.mockReturnValue(true)
    mockReadFileSync.mockImplementation(
      () => '---\ntitle: "Page"\ndescription: "A description"\n---\n'
    )
    const node = buildNode({ path: "some/page" })
    expect(node?.description).toBe("A description")
  })

  it("recursively builds children", () => {
    const node = buildNode({
      title: "Parent",
      items: [{ title: "Child A" }, { title: "Child B" }],
    })
    expect(node?.children).toHaveLength(2)
    expect(node?.children.map((c) => c.title)).toEqual(["Child A", "Child B"])
  })

  it("drops null children", () => {
    const node = buildNode({
      title: "Parent",
      items: [
        { title: "Valid" },
        {}, // no path or title → null
      ],
    })
    expect(node?.children).toHaveLength(1)
  })
})

describe("findTrail", () => {
  const sections = [
    {
      title: "Statistics",
      kind: "group" as const,
      nodes: [
        {
          title: "Regression",
          slug: "statistics/regression",
          children: [
            {
              title: "Overview",
              slug: "statistics/regression/overview",
              children: [],
            },
          ],
        },
      ],
    },
  ]

  it("returns just home for an unknown slug", () => {
    const trail = findTrail(sections, "unknown/page")
    expect(trail).toHaveLength(1)
    expect(trail[0].title).toBe("How to Science")
  })

  it("finds a top-level page in a section", () => {
    const trail = findTrail(sections, "statistics/regression")
    expect(trail.map((c) => c.title)).toEqual(["How to Science", "Statistics", "Regression"])
    expect(trail[2].href).toBeUndefined()
  })

  it("finds a nested child page", () => {
    const trail = findTrail(sections, "statistics/regression/overview")
    expect(trail.map((c) => c.title)).toEqual([
      "How to Science",
      "Statistics",
      "Regression",
      "Overview",
    ])
    expect(trail[3].href).toBeUndefined()
  })
})
