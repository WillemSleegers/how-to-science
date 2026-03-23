export interface NavPage {
  title: string
  slug: string
}

export interface NavSection {
  title: string
  pages: NavPage[]
}

export interface NavGroup {
  label: string
  slug: string // links to the index page
  sections: NavSection[]
}

export const nav: NavGroup[] = [
  {
    label: "Methodology",
    slug: "methodology",
    sections: [
      {
        title: "Survey Design",
        pages: [
          { title: "Overview", slug: "methodology/survey-design/index" },
          { title: "Acquiescence bias", slug: "methodology/survey-design/acquiescence" },
          { title: "Response options", slug: "methodology/survey-design/response-options" },
          { title: "Clarification features", slug: "methodology/survey-design/clarification-features" },
          { title: "Data quality checks", slug: "methodology/survey-design/data-quality-checks" },
        ],
      },
      {
        title: "Scale Development",
        pages: [
          { title: "Overview", slug: "methodology/scale-development/index" },
          { title: "Item development", slug: "methodology/scale-development/item-development" },
          { title: "Reliability & validity", slug: "methodology/scale-development/reliability-validity" },
          { title: "Recommended reading", slug: "methodology/scale-development/recommended-reading" },
        ],
      },
      {
        title: "Contingent Valuation",
        pages: [
          { title: "Overview", slug: "methodology/contingent-valuation/index" },
          { title: "Willingness to pay", slug: "methodology/contingent-valuation/wtp" },
        ],
      },
      {
        title: "AI in Research",
        pages: [
          { title: "Overview", slug: "methodology/ai/index" },
          { title: "Synthetic respondents", slug: "methodology/ai/synthetic-respondents" },
        ],
      },
    ],
  },
  {
    label: "Data Analysis",
    slug: "statistics",
    sections: [
      {
        title: "Regression",
        pages: [
          { title: "Collinearity", slug: "statistics/regression/collinearity" },
        ],
      },
      {
        title: "Group Differences",
        pages: [
          { title: "Confidence intervals", slug: "statistics/group-differences/confidence-intervals" },
          { title: "Pairwise comparisons", slug: "statistics/group-differences/pairwise-comparisons" },
          { title: "Sequential analyses", slug: "statistics/group-differences/sequential-analyses" },
        ],
      },
      {
        title: "Factor Analysis",
        pages: [
          { title: "Overview", slug: "statistics/factor-analysis/index" },
          { title: "EFA best practices", slug: "statistics/factor-analysis/EFA/EFA-best-practices" },
          { title: "EFA example", slug: "statistics/factor-analysis/EFA/EFA-example" },
          { title: "EFA glossary", slug: "statistics/factor-analysis/EFA/EFA-glossary" },
          { title: "EFA recommended reading", slug: "statistics/factor-analysis/EFA/EFA-recommended-reading" },
          { title: "CFA best practices", slug: "statistics/factor-analysis/CFA/CFA-best-practices" },
        ],
      },
    ],
  },
  {
    label: "Materials",
    slug: "materials",
    sections: [
      {
        title: "Scales",
        pages: [
          { title: "Overview", slug: "materials/scales/index" },
          { title: "AAS", slug: "materials/scales/AAS/AAS" },
          { title: "Speciesism", slug: "materials/scales/speciesism/speciesism" },
          { title: "NEP", slug: "materials/scales/NEP/NEP" },
          { title: "OUS", slug: "materials/scales/OUS/OUS" },
          { title: "TIPI", slug: "materials/scales/TIPI/TIPI" },
          { title: "BFI-2-XS", slug: "materials/scales/BFI-2-XS/BFI-2-XS" },
          { title: "SOP2", slug: "materials/scales/SOP2/SOP2" },
          { title: "DOSPERT", slug: "materials/scales/DOSPERT/dospert" },
        ],
      },
    ],
  },
]

export function getNavGroupForSlug(slug: string): NavGroup | undefined {
  return nav.find((group) =>
    group.sections.some((section) =>
      section.pages.some((page) => page.slug === slug)
    )
  )
}
