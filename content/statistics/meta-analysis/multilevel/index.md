---
title: Multilevel Meta-Analysis
description: >-
  Decomposing within-study and between-study variance when studies report
  multiple effect sizes
toc: true
order: 3
---


- [When to use a multilevel model](#when-to-use-a-multilevel-model)

<details class="code-fold">
<summary>Code</summary>

``` r
library(tidyverse)
library(metafor)

theme_set(theme_minimal())
```

</details>

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

| study | outcome |         yi |        vi |
|------:|--------:|-----------:|----------:|
|     1 |       1 |  0.2303028 | 0.0459829 |
|     2 |       1 |  0.2666697 | 0.0297487 |
|     2 |       2 |  0.4589876 | 0.0559602 |
|     2 |       3 |  0.2289368 | 0.0581285 |
|     2 |       4 | -0.3641139 | 0.0216762 |
|     2 |       5 | -0.3101167 | 0.0462249 |
|     3 |       1 |  0.6300283 | 0.0551817 |
|     4 |       1 |  0.2233404 | 0.0401737 |
|     5 |       1 | -0.1453271 | 0.0415754 |
|     5 |       2 |  0.2570207 | 0.0568693 |
|     6 |       1 |  0.6036687 | 0.0525241 |
|     6 |       2 |  0.7737984 | 0.0389910 |
|     6 |       3 |  0.1923827 | 0.0510702 |
|     6 |       4 |  0.2356827 | 0.0156859 |
|     7 |       1 | -0.1407908 | 0.0482254 |
|     7 |       2 |  0.4150243 | 0.0411807 |
|     8 |       1 |  0.1400013 | 0.0174223 |
|     8 |       2 |  0.4138625 | 0.0140132 |
|     9 |       1 |  0.4762093 | 0.0332035 |
|    10 |       1 |  0.5587759 | 0.0489684 |
|    10 |       2 |  0.1477684 | 0.0466764 |
|    10 |       3 |  0.4262388 | 0.0508615 |
|    10 |       4 | -0.1292522 | 0.0185081 |
|    11 |       1 |  0.1038852 | 0.0572360 |
|    12 |       1 |  0.0872731 | 0.0246812 |
|    12 |       2 | -0.3035519 | 0.0174536 |
|    12 |       3 |  0.3090307 | 0.0459689 |
|    12 |       4 |  0.3514997 | 0.0262043 |
|    12 |       5 |  0.2097357 | 0.0489405 |
|    13 |       1 |  0.4895408 | 0.0297221 |
|    13 |       2 |  0.1183238 | 0.0439296 |
|    13 |       3 | -0.0420703 | 0.0487913 |
|    13 |       4 |  0.4082045 | 0.0193935 |
|    14 |       1 |  0.0971517 | 0.0114543 |
|    14 |       2 |  0.6610253 | 0.0167857 |
|    15 |       1 |  0.1921384 | 0.0440082 |
|    15 |       2 |  0.4639120 | 0.0567411 |
|    16 |       1 |  0.3804813 | 0.0375247 |
|    16 |       2 |  0.1040403 | 0.0400883 |
|    16 |       3 |  0.6939319 | 0.0198497 |
|    17 |       1 |  0.4607248 | 0.0367618 |
|    18 |       1 |  0.3224402 | 0.0189778 |
|    19 |       1 |  0.3691377 | 0.0325943 |
|    19 |       2 |  0.4698222 | 0.0258527 |
|    19 |       3 |  0.3224582 | 0.0158087 |
|    20 |       1 | -0.4482725 | 0.0193051 |
|    20 |       2 |  0.3712207 | 0.0464865 |
|    20 |       3 |  0.2081913 | 0.0305936 |
|    20 |       4 |  0.3463076 | 0.0307025 |

Each row is one effect size; multiple rows share the same `study`. The multilevel model treats this nesting as a real feature of the data to be modeled, not a statistical nuisance to be corrected.
