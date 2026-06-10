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
  - [Cochran’s Q](#cochrans-q)
  - [Between-study variance (tau²)](#between-study-variance-tau²)
  - [I²](#i²)
- [The random effects model](#the-random-effects-model)

<details class="code-fold">
<summary>Code</summary>

``` r
library(tidyverse)
library(metafor)

theme_set(theme_minimal())

mu <- 0.5
set.seed(3)
```

</details>

Meta-analysis combines estimates from a related set of studies into a single summary, weighting each study by how precisely it estimated the effect. The sections below cover the basics of conducting a meta-analysis, including topics such as different types of models. We use the metafor package throughout to illustrate and verify the explanations.

## Modelling effect sizes

The core of meta-analysis is to take effect sizes from various studies and estimate an overall effect size.

The standard approach to this

A standard approximation treats each study’s estimate as normally distributed around the effect being estimated, with variance equal to the sampling variance. The sampling variance is the squared standard error of the estimate; larger studies have smaller sampling variances and more precise estimates.

Common effect sizes include Cohen’s d for standardized mean differences between groups, the log odds ratio for binary outcomes, and Fisher’s z for correlations. Each has a known sampling variance formula derived from the study’s sample size and design.

Several models can be used to pool effect sizes. The fixed effects model assumes all studies estimate the same effect; the random effects model allows the effect to vary across studies. The fixed effects model is the simpler case and is covered first.

## The fixed effects model

Under the fixed effects model, all studies are assumed to estimate the same underlying effect. The only source of variation between study estimates is sampling error; there is no between-study heterogeneity. Studies are weighted by their precision — the inverse of the sampling variance — and combined into a pooled estimate. The simulation below demonstrates how this works.

The simulation generates 20 studies, each comparing a control and treatment group of equal size, with the effect size (μ) set to 0.5. The effect size we calculate is a Cohen’s d, stored as `yi`, and its sampling variance is stored as `vi`. Per-group sample sizes are drawn at random from 20 to 200.

``` r
k <- 20
ns <- sample(20:200, k, replace = TRUE)

dat <- map(ns, \(n) {
  control <- rnorm(n, 0, 1)
  treatment <- rnorm(n, mu, 1)
  sp <- sqrt(((n - 1) * var(control) + (n - 1) * var(treatment)) / (2 * n - 2))
  d <- (mean(treatment) - mean(control)) / sp
  vi <- (n + n) / (n * n) + d^2 / (2 * (n + n))
  tibble(yi = d, vi = vi, n = n)
}) |>
  list_rbind() |>
  mutate(study = row_number(), .before = 1)

head(dat) |>
  knitr::kable(digits = 3)
```

| study |    yi |    vi |   n |
|------:|------:|------:|----:|
|     1 | 0.475 | 0.086 |  24 |
|     2 | 0.530 | 0.013 | 159 |
|     3 | 0.640 | 0.038 |  55 |
|     4 | 0.611 | 0.017 | 126 |
|     5 | 0.498 | 0.013 | 155 |
|     6 | 0.668 | 0.054 |  39 |

The effect sizes vary around 0.5, and larger studies have smaller sampling variances because more observations reduce estimation error.

### Pooling by precision

A plain average of the effect sizes treats a small study and a large one equally. Meta-analysis instead weights each study by the inverse of its sampling variance, so more precise studies count for more. The pooled estimate is the weighted mean of the effect sizes, and its standard error is the square root of the reciprocal of the total weight.

``` r
w <- 1 / dat$vi

pooled <- sum(w * dat$yi) / sum(w)
se <- sqrt(1 / sum(w))

c(estimate = pooled, se = se)
```

      estimate         se 
    0.49513582 0.02970813 

The output of `rma()` with `method = "FE"` matches the weighted mean calculation above.

``` r
fit_fe <- rma(yi, vi, data = dat, method = "FE")
fit_fe
```


    Fixed-Effects Model (k = 20)

    I^2 (total heterogeneity / total variability):   0.00%
    H^2 (total variability / sampling variability):  0.52

    Test for Heterogeneity:
    Q(df = 19) = 9.8177, p-val = 0.9573

    Model Results:

    estimate      se     zval    pval   ci.lb   ci.ub      
      0.4951  0.0297  16.6667  <.0001  0.4369  0.5534  *** 

    ---
    Signif. codes:  0 '***' 0.001 '**' 0.01 '*' 0.05 '.' 0.1 ' ' 1

The pooled estimate is close to `mu`, with a narrower confidence interval than any individual study.

## Heterogeneity

When studies differ in populations, procedures, or outcome measures, the effect varies across studies. When it does, the observed effect sizes vary more than sampling error alone would produce, and the fixed effects model is no longer appropriate.

The simulation below extends the previous one so that each study draws its own true effect from a normal distribution centered on `mu`. The spread of that distribution is the between-study variance, `tau2`. Three quantities describe how much of this extra variation is present.

``` r
tau2 <- 0.05
thetas <- rnorm(k, mu, sqrt(tau2))

dat_het <- map2(ns, thetas, \(n, theta) {
  control <- rnorm(n, 0, 1)
  treatment <- rnorm(n, theta, 1)
  sp <- sqrt(((n - 1) * var(control) + (n - 1) * var(treatment)) / (2 * n - 2))
  d <- (mean(treatment) - mean(control)) / sp
  vi <- (n + n) / (n * n) + d^2 / (2 * (n + n))
  tibble(yi = d, vi = vi, n = n)
}) |>
  list_rbind() |>
  mutate(study = row_number(), .before = 1)
```

### Cochran’s Q

The first quantity is the weighted sum of squared deviations of the observed effect sizes from the fixed-effect pooled mean, called Cochran’s Q. Under the assumption that a single effect underlies all studies, Q follows a chi-squared distribution with k − 1 degrees of freedom. A Q much larger than k − 1 indicates more spread than sampling error alone would produce.

``` r
w <- 1 / dat_het$vi
fe_mean <- sum(w * dat_het$yi) / sum(w)

Q <- sum(w * (dat_het$yi - fe_mean)^2)
Q
```

    [1] 74.03394

### Between-study variance (tau²)

tau² is the variance of effects across studies, in the same squared units as the effect size. The default estimation method is restricted maximum likelihood (REML): an iterative procedure that finds the value of tau² most consistent with the observed spread in effect sizes, while accounting for uncertainty in the mean at the same time.

``` r
fit_re <- rma(yi, vi, data = dat_het)
fit_re$tau2
```

    [1] 0.05150329

### I²

I² converts tau² into a proportion: the share of total variation in observed effect sizes attributable to between-study differences rather than sampling error. A value near zero means variation across studies is no larger than sampling error would produce; a large value means most of the spread comes from differences in the effects across studies.

``` r
fit_re$I2
```

    [1] 74.23921

The fixed effects model, fit to the same data, does not account for this between-study variance, so its confidence interval is too narrow.

``` r
rma(yi, vi, data = dat_het, method = "FE")
```


    Fixed-Effects Model (k = 20)

    I^2 (total heterogeneity / total variability):   74.34%
    H^2 (total variability / sampling variability):  3.90

    Test for Heterogeneity:
    Q(df = 19) = 74.0339, p-val < .0001

    Model Results:

    estimate      se     zval    pval   ci.lb   ci.ub      
      0.4460  0.0297  15.0043  <.0001  0.3878  0.5043  *** 

    ---
    Signif. codes:  0 '***' 0.001 '**' 0.01 '*' 0.05 '.' 0.1 ' ' 1

## The random effects model

Once tau² is estimated, it is added to each study’s sampling variance before computing weights. Where the fixed effects model uses weights of 1/vi, the random effects model uses 1/(vi + tau²). Adding the same tau² to each denominator reduces the variation in weights across studies: a study with a very small vi and one with a large vi receive more similar weights once tau² is added to both.

``` r
ws <- 1 / (dat_het$vi + fit_re$tau2)

re_pooled <- sum(ws * dat_het$yi) / sum(ws)
re_se <- sqrt(1 / sum(ws))

c(estimate = re_pooled, se = re_se)
```

      estimate         se 
    0.47701360 0.06075686 

These match the estimate and standard error from `fit_re`. The pooled estimate barely shifts, but the standard error is larger, because between-study variance contributes uncertainty beyond what sampling error alone would produce.

``` r
fit_re
```


    Random-Effects Model (k = 20; tau^2 estimator: REML)

    tau^2 (estimated amount of total heterogeneity): 0.0515 (SE = 0.0235)
    tau (square root of estimated tau^2 value):      0.2269
    I^2 (total heterogeneity / total variability):   74.24%
    H^2 (total variability / sampling variability):  3.88

    Test for Heterogeneity:
    Q(df = 19) = 74.0339, p-val < .0001

    Model Results:

    estimate      se    zval    pval   ci.lb   ci.ub      
      0.4770  0.0608  7.8512  <.0001  0.3579  0.5961  *** 

    ---
    Signif. codes:  0 '***' 0.001 '**' 0.01 '*' 0.05 '.' 0.1 ' ' 1

The random effects model estimates two parameters: μ, the mean effect across studies, and tau², the between-study variance. The confidence interval on μ describes how precisely the mean is estimated. The prediction interval describes where a new study’s effect is likely to fall; it is wider than the confidence interval because it accounts for tau² as well as uncertainty in μ.

``` r
predict(fit_re)
```


       pred     se  ci.lb  ci.ub  pi.lb  pi.ub 
     0.4770 0.0608 0.3579 0.5961 0.0165 0.9375 

A large I² and a narrow confidence interval on the mean can occur together when many studies contribute; in that case, the prediction interval will be wide, because it accounts for the full between-study variance.

The methods here assume each study contributes one independent effect size. When studies contribute multiple effect sizes that are not independent, such as from multiple outcomes or a shared control group, see [Dependent Effect Sizes](../dependent-effect-sizes/); when the within-study and between-study variation are themselves of interest, see [Multilevel Meta-Analysis](../multilevel/).
