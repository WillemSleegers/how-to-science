---
title: Basics
description: A basic introduction to meta-analysis.
toc: true
order: 1
---


- [Modelling effect sizes](#modelling-effect-sizes)
- [The fixed effects model](#the-fixed-effects-model)
  - [Pooling by precision](#pooling-by-precision)
- [Heterogeneity](#heterogeneity)
  - [Between-study variance (tau²)](#between-study-variance-tau²)
  - [I²](#i²)
- [The random effects model](#the-random-effects-model)

<details class="code-fold">
<summary>Code</summary>

``` r
library(tidyverse)
library(metafor)

theme_set(theme_minimal())

color_primary <- "#2171b5"
color_secondary <- "#888888"
color_reference <- "gray50"

mu <- 0.5
set.seed(3)
```

</details>

Meta-analysis combines estimates from a related set of studies into a single estimate, weighting each study by how precisely it estimated the effect. Individual studies differ in sample size and design, so some carry more information about the effect than others. Combining them into a single weighted estimate makes better use of the available evidence than looking at any one study alone.

## Modelling effect sizes

Combining studies means first choosing how we think they relate to each other: whether they are all estimating one shared effect, or whether the effect varies from study to study. Different meta-analysis models make different assumptions here, and the simplest one assumes all studies are estimating the same effect.

Even with one shared effect, no single study recovers that value exactly. Each study estimates the effect from a limited number of participants, and individual participants vary in their responses for reasons that have nothing to do with the effect itself. A different set of participants, even under an otherwise identical study, would produce a somewhat different estimate: this is sampling error. What differs between studies is not the effect being estimated, but how far sampling error moves each study’s estimate away from it, an amount captured by that study’s sampling variance.

A study’s sampling variance comes from its sample size: with more participants, the estimate is based on more information and would vary less if the study were repeated, so larger studies have smaller sampling variances and more precise estimates.

Common effect sizes include Cohen’s d for standardized mean differences between groups, the log odds ratio for binary outcomes, and Fisher’s z for correlations. Each has a known sampling variance formula derived from the study’s sample size and design.

## The fixed effects model

Under the fixed effects model, the only source of variation between study estimates is sampling error; there is no between-study heterogeneity. Studies are weighted by their precision (the inverse of the sampling variance) and combined into a pooled estimate. The simulation below demonstrates how this works.

The simulation generates 5 studies, each comparing a control and treatment group of equal size, with the effect size (μ) set to 0.5. The effect size we calculate is a Cohen’s d, stored as `yi`, and its sampling variance is stored as `vi`, based on 5 different sample sizes.

``` r
k <- 5
ns <- c(10, 25, 50, 100, 250)

data <- map(ns, \(n) {
  treatment <- rnorm(n, mu, 1)
  control <- rnorm(n, 0, 1)

  tibble(
    m1i = mean(treatment),
    sd1i = sd(treatment),
    n1i = n,
    m2i = mean(control),
    sd2i = sd(control),
    n2i = n
  )
}) |>
  list_rbind() |>
  mutate(study = row_number(), .before = 1) |>
  escalc(
    measure = "SMD",
    m1i = m1i,
    sd1i = sd1i,
    n1i = n1i,
    m2i = m2i,
    sd2i = sd2i,
    n2i = n2i,
    data = _
  )

data
```

| study |       m1i |      sd1i | n1i |        m2i |      sd2i | n2i |        yi |        vi |
|------:|----------:|----------:|----:|-----------:|----------:|----:|----------:|----------:|
|     1 | 0.4328643 | 0.8657293 |  10 | -0.2672452 | 0.7212842 |  10 | 0.8414516 | 0.2177010 |
|     2 | 0.6119666 | 0.8908396 |  25 | -0.1353325 | 0.9917927 |  25 | 0.7802860 | 0.0860885 |
|     3 | 0.6257893 | 0.7535076 |  50 |  0.0766915 | 1.2044126 |  50 | 0.5423959 | 0.0414710 |
|     4 | 0.5289554 | 1.0773589 | 100 |  0.1170698 | 1.0521130 | 100 | 0.3853484 | 0.0203712 |
|     5 | 0.4390259 | 0.9970733 | 250 | -0.0228270 | 0.9800336 | 250 | 0.4664794 | 0.0082176 |

The effect sizes vary around 0.5, and larger studies have smaller sampling variances because more observations reduce estimation error.

### Pooling by precision

A plain average of the effect sizes treats a small study and a large one equally. Meta-analysis instead weights each study by the inverse of its sampling variance, so more precise studies count for more. The pooled estimate is the weighted mean of the effect sizes, and its standard error is the square root of the reciprocal of the total weight.

``` r
w <- 1 / data$vi

pooled <- sum(w * data$yi) / sum(w)
pooled
```

    [1] 0.4817117

The output of `rma()` with `method = "FE"` matches the weighted mean calculation above.

``` r
fit_fe <- rma(yi, vi, data = data, method = "FE")
fit_fe
```


    Fixed-Effects Model (k = 5)

    I^2 (total heterogeneity / total variability):   0.00%
    H^2 (total variability / sampling variability):  0.55

    Test for Heterogeneity:
    Q(df = 4) = 2.2028, p-val = 0.6985

    Model Results:

    estimate      se    zval    pval   ci.lb   ci.ub      
      0.4817  0.0688  6.9989  <.0001  0.3468  0.6166  *** 

    ---
    Signif. codes:  0 '***' 0.001 '**' 0.01 '*' 0.05 '.' 0.1 ' ' 1

## Heterogeneity

When studies differ in populations, procedures, or outcome measures, the effect varies across studies. When it does, the observed effect sizes vary more than sampling error alone would produce, and the fixed effects model is no longer appropriate.

The simulation below extends the previous one so that each study draws its own true effect from a normal distribution centered on `mu`. The spread of that distribution is the between-study variance, `tau2`. Three quantities describe how much of this extra variation is present.

``` r
k <- 5
ns <- c(10, 25, 50, 100, 250)

tau2 <- 0.05
thetas <- rnorm(k, mu, sqrt(tau2))

data <- map2(ns, thetas, \(n, theta) {
  treatment <- rnorm(n, theta, 1)
  control <- rnorm(n, 0, 1)

  tibble(
    m1i = mean(treatment),
    sd1i = sd(treatment),
    n1i = n,
    m2i = mean(control),
    sd2i = sd(control),
    n2i = n
  )
}) |>
  list_rbind() |>
  mutate(study = row_number(), .before = 1) |>
  escalc(
    measure = "SMD",
    m1i = m1i,
    sd1i = sd1i,
    n1i = n1i,
    m2i = m2i,
    sd2i = sd2i,
    n2i = n2i,
    data = _
  )

data
```

| study |       m1i |      sd1i | n1i |        m2i |      sd2i | n2i |        yi |        vi |
|------:|----------:|----------:|----:|-----------:|----------:|----:|----------:|----------:|
|     1 | 0.5510820 | 0.8819388 |  10 |  0.2768318 | 0.7186743 |  10 | 0.3264736 | 0.2026646 |
|     2 | 0.2136506 | 1.0045850 |  25 |  0.1638911 | 0.8382465 |  25 | 0.0529392 | 0.0800280 |
|     3 | 0.6258561 | 1.0403293 |  50 |  0.0239156 | 1.1603187 |  50 | 0.5420532 | 0.0414691 |
|     4 | 0.5141498 | 1.0781745 | 100 | -0.1032391 | 0.8466240 | 100 | 0.6345019 | 0.0210065 |
|     5 | 0.1988641 | 1.0006359 | 250 | -0.0420593 | 0.9819556 | 250 | 0.2426619 | 0.0080589 |

### Between-study variance (tau²)

tau² is the variance of effects across studies, in the same squared units as the effect size. The default estimation method is restricted maximum likelihood (REML): an iterative procedure that finds the value of tau² most consistent with the observed spread in effect sizes, while accounting for uncertainty in the mean at the same time.

``` r
fit_re <- rma(yi, vi, data = data)
fit_re
```


    Random-Effects Model (k = 5; tau^2 estimator: REML)

    tau^2 (estimated amount of total heterogeneity): 0.0277 (SE = 0.0445)
    tau (square root of estimated tau^2 value):      0.1666
    I^2 (total heterogeneity / total variability):   46.80%
    H^2 (total variability / sampling variability):  1.88

    Test for Heterogeneity:
    Q(df = 4) = 7.2727, p-val = 0.1222

    Model Results:

    estimate      se    zval    pval   ci.lb   ci.ub      
      0.3860  0.1143  3.3764  0.0007  0.1619  0.6101  *** 

    ---
    Signif. codes:  0 '***' 0.001 '**' 0.01 '*' 0.05 '.' 0.1 ' ' 1

### I²

I² converts tau² into a proportion: the share of total variation in observed effect sizes attributable to between-study differences rather than sampling error. A value near zero means variation across studies is no larger than sampling error would produce; a large value means most of the spread comes from differences in the effects across studies.

``` r
fit_re$I2
```

    [1] 46.79671

The fixed effects model, fit to the same data, does not account for this between-study variance, so its confidence interval is too narrow.

``` r
rma(yi, vi, data = data, method = "FE")
```


    Fixed-Effects Model (k = 5)

    I^2 (total heterogeneity / total variability):   45.00%
    H^2 (total variability / sampling variability):  1.82

    Test for Heterogeneity:
    Q(df = 4) = 7.2727, p-val = 0.1222

    Model Results:

    estimate      se    zval    pval   ci.lb   ci.ub      
      0.3548  0.0685  5.1813  <.0001  0.2206  0.4890  *** 

    ---
    Signif. codes:  0 '***' 0.001 '**' 0.01 '*' 0.05 '.' 0.1 ' ' 1

## The random effects model

Once tau² is estimated, it is added to each study’s sampling variance before computing weights. Where the fixed effects model uses weights of 1/vi, the random effects model uses 1/(vi + tau²). Adding the same tau² to each denominator reduces the variation in weights across studies: a study with a very small vi and one with a large vi receive more similar weights once tau² is added to both.

``` r
ws <- 1 / (data$vi + fit_re$tau2)

re_pooled <- sum(ws * data$yi) / sum(ws)
re_se <- sqrt(1 / sum(ws))

c(estimate = re_pooled, se = re_se)
```

     estimate        se 
    0.3859972 0.1143219 

These match the estimate and standard error from `fit_re`. The pooled estimate barely shifts, but the standard error is larger, because between-study variance contributes uncertainty beyond what sampling error alone would produce.

``` r
fit_re
```


    Random-Effects Model (k = 5; tau^2 estimator: REML)

    tau^2 (estimated amount of total heterogeneity): 0.0277 (SE = 0.0445)
    tau (square root of estimated tau^2 value):      0.1666
    I^2 (total heterogeneity / total variability):   46.80%
    H^2 (total variability / sampling variability):  1.88

    Test for Heterogeneity:
    Q(df = 4) = 7.2727, p-val = 0.1222

    Model Results:

    estimate      se    zval    pval   ci.lb   ci.ub      
      0.3860  0.1143  3.3764  0.0007  0.1619  0.6101  *** 

    ---
    Signif. codes:  0 '***' 0.001 '**' 0.01 '*' 0.05 '.' 0.1 ' ' 1

The random effects model estimates two parameters: μ, the mean effect across studies, and tau², the between-study variance. The confidence interval on μ describes how precisely the mean is estimated. The prediction interval describes where a new study’s effect is likely to fall; it is wider than the confidence interval because it accounts for tau² as well as uncertainty in μ.

``` r
predict(fit_re)
```


       pred     se  ci.lb  ci.ub   pi.lb  pi.ub 
     0.3860 0.1143 0.1619 0.6101 -0.0099 0.7819 

A large I² and a narrow confidence interval on the mean can occur together when many studies contribute; in that case, the prediction interval will be wide, because it accounts for the full between-study variance.

The methods here assume each study contributes one independent effect size. When studies contribute multiple effect sizes that are not independent, such as from multiple outcomes or a shared control group, see [Dependent Effect Sizes](../dependent-effect-sizes/); when the within-study and between-study variation are themselves of interest, see [Multilevel Meta-Analysis](../multilevel/).
