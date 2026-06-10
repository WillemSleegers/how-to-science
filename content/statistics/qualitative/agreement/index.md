---
title: Measuring Rater Agreement
description: >-
  Quantifying how consistently raters or LLMs agree, and choosing the right
  metric
toc: true
order: 2
---


- [Percent agreement](#percent-agreement)
- [Cohen’s kappa](#cohens-kappa)
- [Weighted kappa](#weighted-kappa)
- [Fleiss’ kappa](#fleiss-kappa)
- [Krippendorff’s alpha](#krippendorffs-alpha)
- [The prevalence paradox](#the-prevalence-paradox)
- [Which metric to use](#which-metric-to-use)

> [!WARNING]
>
> This page is a work in progress.

``` r
library(tidyverse)
library(irr)
library(psych)
```

When two or more people code the same material — or when you compare human labels to LLM output — you need a way to quantify how consistently the labels agree. Several metrics exist, and the right choice depends on how many raters you have, the level of measurement (nominal, ordinal, continuous), and whether you care about correcting for chance.

This page covers the most common metrics, when each is appropriate, and how to compute them in R.

## Percent agreement

The simplest measure is the raw proportion of items where raters chose the same label:

$$\text{PA} = \frac{\text{agreements}}{\text{total items}}$$

``` r
set.seed(42)

# Two raters labeling 40 open-ended responses as "relevant" or "not relevant"
true_labels <- sample(
  c("relevant", "not relevant"),
  40,
  replace = TRUE,
  prob = c(0.75, 0.25)
)
rater_a <- ifelse(
  runif(40) < 0.88,
  true_labels,
  ifelse(true_labels == "relevant", "not relevant", "relevant")
)
rater_b <- ifelse(
  runif(40) < 0.88,
  true_labels,
  ifelse(true_labels == "relevant", "not relevant", "relevant")
)

ratings <- data.frame(rater_a, rater_b)
agree(ratings)
```

     Percentage agreement (Tolerance=0)

     Subjects = 40 
       Raters = 2 
      %-agree = 77.5 

A confidence interval for percent agreement follows from treating it as a proportion:

``` r
n_agree <- sum(rater_a == rater_b)
prop.test(n_agree, nrow(ratings))$conf.int
```

    [1] 0.6114495 0.8859920
    attr(,"conf.level")
    [1] 0.95

The problem with percent agreement is that raters will agree on some items by chance. Before interpreting percent agreement, check the label distribution — if one category dominates, a high agreement figure may be largely a product of that imbalance rather than genuine consistency.

``` r
# Label distribution across both raters
p_relevant <- mean(c(rater_a, rater_b) == "relevant")
p_not <- 1 - p_relevant

cat("Label distribution: relevant =", round(p_relevant, 2), "/ not relevant =", round(p_not, 2), "\n")
```

    Label distribution: relevant = 0.56 / not relevant = 0.44 

``` r
cat("Chance agreement baseline:", round(p_relevant^2 + p_not^2, 2), "\n")
```

    Chance agreement baseline: 0.51 

If the observed agreement is only modestly above the chance baseline, little of it reflects actual rater consistency. This is exactly what Cohen’s kappa corrects for.

## Cohen’s kappa

Cohen’s kappa adjusts for the chance agreement expected given the marginal distributions of each rater:

$$\kappa = \frac{p_o - p_e}{1 - p_e}$$

where $p_o$ is observed agreement and $p_e$ is expected agreement by chance. A kappa of 0 indicates no agreement beyond chance; 1 is perfect agreement. Negative values mean agreement worse than chance.

``` r
kappa2(ratings)
```

     Cohen's Kappa for 2 Raters (Weights: unweighted)

     Subjects = 40 
       Raters = 2 
        Kappa = 0.543 

            z = 3.44 
      p-value = 0.000583 

`kappa2` returns a z-statistic but not a CI directly. The SE is kappa / z, which gives the 95% CI:

``` r
result <- kappa2(ratings)
se <- result$value / result$statistic
result$value + c(-1.96, 1.96) * se
```

    [1] 0.2336435 0.8526509

Common benchmarks: kappa below 0.40 is poor, 0.40–0.60 moderate, 0.60–0.80 substantial, and above 0.80 almost perfect — but these are rough guides, not hard rules. What counts as acceptable depends on the consequences of errors in your application.

Cohen’s kappa assumes exactly two raters and nominal (unordered) categories.

## Weighted kappa

When categories are ordered (e.g., low / medium / high, or a 1–5 scale), disagreeing by one step is less serious than disagreeing by four. Weighted kappa assigns partial credit for near-misses using a weight matrix, so that larger disagreements count more against agreement than smaller ones.

``` r
set.seed(42)

# Two raters scoring argumentative quality on a 1–4 scale
rater_a_ord <- sample(1:4, 50, replace = TRUE)
rater_b_ord <- pmax(
  1,
  pmin(4, rater_a_ord + sample(c(-1, 0, 0, 0, 1), 50, replace = TRUE))
)

kappa2(data.frame(rater_a_ord, rater_b_ord), weight = "squared")
```

     Cohen's Kappa for 2 Raters (Weights: squared)

     Subjects = 50 
       Raters = 2 
        Kappa = 0.898 

            z = 6.39 
      p-value = 1.69e-10 

The CI is obtained the same way as for Cohen’s kappa:

``` r
result_w <- kappa2(data.frame(rater_a_ord, rater_b_ord), weight = "squared")
se_w <- result_w$value / result_w$statistic
result_w$value + c(-1.96, 1.96) * se_w
```

    [1] 0.6223211 1.1733749

Two common weight schemes: - **Linear** — disagreement penalty is proportional to the distance between categories. - **Quadratic** — penalty grows as the square of the distance; large disagreements are penalised much more than small ones.

Quadratic weights are standard for Likert-type scales. Use linear weights when one-step errors and multi-step errors should differ, but not dramatically.

## Fleiss’ kappa

When three or more raters code the same items, use Fleiss’ kappa. It generalises Cohen’s kappa to multiple raters by comparing the proportion of items assigned to each category with what chance predicts, averaged across all raters.

``` r
set.seed(42)

# Three raters coding 30 statements as "agree", "neutral", or "disagree"
n_items <- 30
true <- sample(
  c("agree", "neutral", "disagree"),
  n_items,
  replace = TRUE,
  prob = c(0.5, 0.3, 0.2)
)
add_error <- function(x, p = 0.12) {
  ifelse(
    runif(length(x)) < p,
    sample(c("agree", "neutral", "disagree"), length(x), replace = TRUE),
    x
  )
}

ratings_3 <- data.frame(
  r1 = add_error(true),
  r2 = add_error(true),
  r3 = add_error(true)
)

# kappam.fleiss expects a matrix with items in rows and raters in columns
kappam.fleiss(ratings_3)
```

     Fleiss' Kappa for m Raters

     Subjects = 30 
       Raters = 3 
        Kappa = 0.866 

            z = 11.6 
      p-value = 0 

Same SE extraction applies:

``` r
result_f <- kappam.fleiss(ratings_3)
se_f <- result_f$value / result_f$statistic
result_f$value + c(-1.96, 1.96) * se_f
```

    [1] 0.7188966 1.0123464

Fleiss’ kappa is for nominal categories only. For ordinal data with three or more raters, use Krippendorff’s alpha instead.

## Krippendorff’s alpha

Krippendorff’s alpha is the most flexible of the common agreement metrics. It handles: - Any number of raters (including pairs) - Missing data (raters who did not code every item) - All measurement levels: nominal, ordinal, interval, and ratio

The core idea is to compare the observed disagreement between all pairs of ratings against the disagreement expected if ratings were randomly distributed.

``` r
# Nominal data — equivalent to Fleiss' kappa territory, but handles missingness
ratings_matrix <- t(as.matrix(ratings_3)) # irr expects raters in rows, items in columns
kripp.alpha(ratings_matrix, method = "nominal")
```

    Warning in kripp.alpha(ratings_matrix, method = "nominal"): NAs introduced by
    coercion

     Krippendorff's alpha

     Subjects = 30 
       Raters = 3 
        alpha = 0.866 

``` r
# Ordinal data
ratings_ord_matrix <- t(as.matrix(data.frame(
  r1 = add_error(rater_a_ord, 0.15),
  r2 = add_error(rater_a_ord, 0.15),
  r3 = add_error(rater_a_ord, 0.15)
)))
kripp.alpha(ratings_ord_matrix, method = "ordinal")
```

    Warning in kripp.alpha(ratings_ord_matrix, method = "ordinal"): NAs introduced
    by coercion

     Krippendorff's alpha

     Subjects = 50 
       Raters = 3 
        alpha = 0.281 

`irr::kripp.alpha` does not compute a CI. Bootstrap it by resampling items (columns):

``` r
set.seed(42)
boot_alpha <- replicate(1000, {
  idx <- sample(ncol(ratings_matrix), replace = TRUE)
  kripp.alpha(ratings_matrix[, idx], method = "nominal")$value
})
```

    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion
    Warning in kripp.alpha(ratings_matrix[, idx], method = "nominal"): NAs
    introduced by coercion

``` r
quantile(boot_alpha, c(0.025, 0.975))
```

         2.5%     97.5% 
    0.7252891 0.9666915 

Alpha of 0 indicates chance-level agreement; 1 is perfect. Krippendorff recommends a threshold of 0.667 as a minimum for tentative conclusions, and 0.800 for reliable data.

## The prevalence paradox

Kappa has a known sensitivity to the prevalence of categories. When one category is much more common than others, kappa can be low even when percent agreement is high — not because raters disagree, but because most of the agreement falls on the dominant category, which the formula treats as cheap.

![Cohen’s kappa vs. percent agreement for two simulated datasets with the same observed agreement (90%) but different prevalence. When the positive category is rare (10% prevalence), kappa is near zero despite high accuracy — a consequence of the paradox, not poor raters.](index_files/figure-commonmark/prevalence-paradox-1.svg)

When your categories are heavily imbalanced, consider reporting Krippendorff’s alpha or Gwet’s AC1 (from the `irrCAC` package) alongside kappa. These are less sensitive to prevalence and give a more stable picture of true rater consistency.

## Which metric to use

| Situation | Metric |
|----|----|
| 2 raters, nominal categories | Cohen’s kappa |
| 2 raters, ordinal categories | Weighted kappa (quadratic weights) |
| 3+ raters, nominal | Fleiss’ kappa |
| 3+ raters, ordinal or continuous | Krippendorff’s alpha |
| Any setup, missing data | Krippendorff’s alpha |
| Heavily imbalanced categories | Krippendorff’s alpha or Gwet’s AC1 |
| LLM vs. ground truth | Accuracy + Cohen’s kappa (see [text categorization](../classification)) |

All chance-corrected metrics (kappa variants, alpha) agree: if you only report percent agreement without a chance correction, you will typically overstate how well raters agree, especially when categories are unequal in frequency.
