---
title: Multilevel Meta-Analysis
description: >-
  Decomposing within-study and between-study variance when studies report
  multiple effect sizes
toc: true
order: 3
---


- [When to use a multilevel model](#when-to-use-a-multilevel-model)

``` r
library(tidyverse)
library(metafor)

theme_set(theme_minimal())
```

## When to use a multilevel model

In a typical meta-analysis, each study contributes one effect size and all variance is treated as a single quantity: how much do studies differ from each other? When studies contribute multiple effect sizes — from different outcomes, subgroups, or time points — there are actually two distinct sources of variance:

- **Within-study variance** — effect sizes vary across outcomes within the same study
- **Between-study variance** — average effects vary from study to study

These are separate phenomena with different explanations. Within-study variance might reflect that some outcomes are more sensitive to a treatment than others. Between-study variance might reflect differences in sample characteristics, context, or methodology across labs. A multilevel model estimates them separately; a standard model conflates them into one heterogeneity estimate.

Once variance is decomposed this way, you can model each source with predictors at the appropriate level — outcome-level variables to explain within-study variance, study-level variables to explain between-study variance. In a standard model, any moderator analysis is ambiguous about which level it’s really operating at.

A typical dataset has multiple rows per study:

``` r
set.seed(42)

n_studies <- 20
effects_per_study <- sample(1:5, n_studies, replace = TRUE)

dat <- tibble(
  study = rep(1:n_studies, times = effects_per_study),
  outcome = sequence(effects_per_study),
  yi = rnorm(sum(effects_per_study), mean = 0.3, sd = 0.25),
  vi = runif(sum(effects_per_study), 0.01, 0.06)
)

dat
```

    # A tibble: 49 × 4
       study outcome     yi     vi
       <int>   <int>  <dbl>  <dbl>
     1     1       1  0.230 0.0460
     2     2       1  0.267 0.0297
     3     2       2  0.459 0.0560
     4     2       3  0.229 0.0581
     5     2       4 -0.364 0.0217
     6     2       5 -0.310 0.0462
     7     3       1  0.630 0.0552
     8     4       1  0.223 0.0402
     9     5       1 -0.145 0.0416
    10     5       2  0.257 0.0569
    # ℹ 39 more rows

Each row is one effect size; multiple rows share the same `study`. The multilevel model treats this nesting as a real feature of the data to be modeled, not a statistical nuisance to be corrected.
