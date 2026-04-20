---
title: Controlling for covariates
description: "How to compute covariate-adjusted marginal means using emmeans and marginaleffects in R"
toc: true
code-fold: show
---


- [Setup](#setup)
- [Controlling for sex](#controlling-for-sex)
  - [emmeans](#emmeans)
  - [marginaleffects](#marginaleffects)
- [Using population weights](#using-population-weights)

<details open class="code-fold">
<summary>Code</summary>

``` r
library(tidyverse)
library(emmeans)
library(marginaleffects)
```

</details>

Suppose you want to estimate the mean of some outcome but sex also predicts it and is unevenly distributed in your sample. The raw sample mean will reflect both the true mean *and* the sex composition of your sample — these are confounded. Including sex in a regression and extracting a marginal mean disentangles them: it gives you an estimate that would hold in a sex-balanced sample.

This is not the same as estimating separate means for males and females. Stratifying by sex gives you two group-specific estimates. Controlling for sex gives you one overall estimate that doesn’t depend on how many of each sex are in the sample.

## Setup

We simulate data where females score one point higher than males on average, but our sample is 70% female.

<details open class="code-fold">
<summary>Code</summary>

``` r
set.seed(42)

n <- 500

sex <- sample(
  c("male", "female"),
  size = n,
  replace = TRUE,
  prob = c(0.3, 0.7)
)

y <- if_else(
  sex == "male",
  rnorm(n, mean = 3.0, sd = 1),
  rnorm(n, mean = 4.0, sd = 1)
)

data <- tibble(sex = factor(sex, levels = c("male", "female")), y = y)
```

</details>

The true population mean — assuming equal numbers of males and females — is 3.5, the average of 3.0 and 4.0. Let’s see what the raw sample mean gives us.

<details open class="code-fold">
<summary>Code</summary>

``` r
mean(data$y)
```

</details>

    [1] 3.703128

It’s pulled above 3.5 by the overrepresentation of females. We can confirm by looking at the group breakdown:

<details open class="code-fold">
<summary>Code</summary>

``` r
data |>
  group_by(sex) |>
  summarise(n = n(), mean_y = mean(y))
```

</details>

    # A tibble: 2 × 3
      sex        n mean_y
      <fct>  <int>  <dbl>
    1 male     148   2.98
    2 female   352   4.01

## Controlling for sex

To get a mean that controls for sex, we fit a regression with sex as a predictor.

<details open class="code-fold">
<summary>Code</summary>

``` r
model <- lm(y ~ sex, data = data)
```

</details>

### emmeans

`emmeans` extracts the marginal mean by averaging the predicted values for each sex level equally, regardless of how many observations each has.

<details open class="code-fold">
<summary>Code</summary>

``` r
emmeans(model, specs = ~1)
```

</details>

     1       emmean     SE  df lower.CL upper.CL
     overall   3.49 0.0504 498      3.4     3.59

    Results are averaged over the levels of: sex 
    Confidence level used: 0.95 

This is close to 3.5.

### marginaleffects

`avg_predictions` from `marginaleffects` gives the same result when you ask it to predict at each level of sex and then average:

<details open class="code-fold">
<summary>Code</summary>

``` r
avg_predictions(model, newdata = datagrid(sex = c("male", "female")))
```

</details>


     Estimate Std. Error    z Pr(>|z|)   S 2.5 % 97.5 %
         3.49     0.0504 69.3   <0.001 Inf   3.4   3.59

    Type: response

The key difference from `emmeans` is what happens when you don’t specify the grid. By default, `avg_predictions(model)` predicts for each row at its observed covariate values and averages — which for a linear model just recovers the raw mean:

<details open class="code-fold">
<summary>Code</summary>

``` r
avg_predictions(model)
```

</details>


     Estimate Std. Error    z Pr(>|z|)   S 2.5 % 97.5 %
          3.7      0.046 80.4   <0.001 Inf  3.61   3.79

    Type: response

This is the *average prediction in the sample as it is*, not controlling for sex. Whether this or the equal-weighted version is more appropriate depends on the question: do you want the mean for a balanced population, or the mean for this particular sample adjusted for model fit?

## Using population weights

If the goal is to estimate the mean for a specific target population with known sex proportions, both packages support explicit weighting. For example, to match the sample’s 30% male / 70% female composition, which should recover the raw mean from above:

With `emmeans`, pass a numeric weight vector matching the factor level order (`c("male", "female")`):

<details open class="code-fold">
<summary>Code</summary>

``` r
emmeans(model, ~1, weights = c(0.3, 0.7))
```

</details>

     1       emmean    SE  df lower.CL upper.CL
     overall    3.7 0.046 498     3.61     3.79

    Results are averaged over the levels of: sex 
    Confidence level used: 0.95 

With `marginaleffects`, use the `wts` argument:

<details open class="code-fold">
<summary>Code</summary>

``` r
avg_predictions(
  model,
  newdata = datagrid(sex = levels(data$sex)),
  wts = c(0.3, 0.7)
)
```

</details>


     Estimate Std. Error    z Pr(>|z|)   S 2.5 % 97.5 %
          3.7      0.046 80.4   <0.001 Inf  3.61   3.79

    Type: response

Both should match the raw sample mean computed at the top of the page.
