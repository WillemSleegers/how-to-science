---
title: Dependent Effect Sizes
description: >-
  Correcting standard errors for non-independent effect sizes, from known
  covariance matrices to robust variance estimation
toc: true
toc-depth: 3
order: 2
---


- [Handling the covariance](#handling-the-covariance)
- [Case study: Shared control groups](#case-study-shared-control-groups)
  - [Known covariance](#known-covariance)
  - [Robust variance estimation](#robust-variance-estimation)
  - [Comparing the models](#comparing-the-models)
  - [Adding between-study heterogeneity](#adding-between-study-heterogeneity)
  - [Heterogeneity estimation](#heterogeneity-estimation)

<details class="code-fold">
<summary>Code</summary>

``` r
library(tidyverse)
library(metafor)
library(knitr)

theme_set(theme_minimal())

set.seed(436)
```

</details>

Meta-analysis combines effect sizes from multiple sources to estimate an overall effect. Conventionally, each study contributes one effect size and studies are treated as independent observations. That assumption breaks when a single study contributes multiple effect sizes, whether from different outcomes, time points, or subgroups sharing a common control group. Those effect sizes are not independent draws from the population of studies, and treating them as if they were leads to incorrect inferences.

Dependence affects the output of a meta-analytic model unevenly. It leaves the point estimate of the overall effect largely intact but distorts the uncertainty around it, often shrinking it. Effect sizes from the same study overlap in the information they carry, so together they provide less information than their number suggests. Treating them as independent ignores that overlap and credits each effect more than it should, making the evidence look stronger than it is. The standard error comes out too small and the confidence interval too narrow.

## Handling the covariance

The independence assumption can be seen in the variance-covariance matrix. Standard meta-analysis uses only the sampling variance of each effect size, the diagonal of this matrix. The off-diagonal terms are the covariances between pairs of effect sizes, and assuming independence sets them all to zero. Dependence is exactly the case where they are not zero, so correcting for it is a matter of dealing with those off-diagonal terms. There are four ways to do that:

- **Compute them.** In certain cases you can use the study design to determine what the covariances are. They can be calculated directly from the data and handed to the model.
- **Assume them.** Alternatively, you can assume the covariances based on conservative assumptions or empirical data about likely covariances.
- **Estimate them.** A model with a study-level random effect makes every effect size within a study share a common component, which induces a covariance between them. Fitting the model estimates that covariance.
- **Bypass them.** Robust variance estimation never specifies the off-diagonal terms at all. It estimates the standard error empirically from how much whole studies vary, leaving the covariance structure unmodeled. That makes it robust for the meta-analytic estimate but silent on how much the effect truly varies across studies.

The first question to ask when determining which method to use is whether the covariance can be computed from the design. When it can, that is the option to take: it relies on no assumptions and stays valid even with few studies. When it cannot, the fallback is to assume, estimate, or bypass the covariance, and which of those is best depends on other things, including whether the variance components are of interest, how many studies there are, and how much you are willing to assume.

The case study below works through a common design: multiple treatment conditions compared against a shared control group.

## Case study: Shared control groups

A common design compares several treatments against a single shared control group. For example, with four treatment conditions and one control condition, a study yields four effect sizes. Because all four are computed against the same control group, they are not independent: any sampling fluctuation in the control group shifts all four effect sizes in the same direction. That covariance is determined entirely by the group sizes, which means in this case the covariances can be computed, without estimation or assumptions.

We can illustrate this using a simulation. Below we simulate 30 studies, each with four treatment groups of 50 participants and a shared control group of 100, and a true standardized mean difference of 0.5 for every treatment. Every study shares that same true effect, so there is no between-study heterogeneity, leaving the shared control as the only source of dependence.

``` r
n_studies <- 30
delta <- 0.5 # true standardized mean difference
sigma <- 1 # common within-group SD
n_conditions <- 4
n_control <- 100
n_treatment <- 50
```

Rather than start from effect sizes, the simulation generates participant scores for each group and reduces them to the mean, standard deviation, and sample size that authors would report. The control group is drawn once per study and reused for all four treatment contrasts. Each study contributes four effect sizes, one per treatment condition.

``` r
simulate_study <- function(study) {
  control <- rnorm(n_control, mean = 0, sd = sigma)
  treatments <- map(
    seq_len(n_conditions),
    \(a) rnorm(n_treatment, mean = delta * sigma, sd = sigma)
  )

  tibble(
    study = study,
    treatment = LETTERS[seq_len(n_conditions)],
    m1i = map_dbl(treatments, mean),
    sd1i = map_dbl(treatments, sd),
    n1i = n_treatment,
    m2i = mean(control),
    sd2i = sd(control),
    n2i = n_control
  )
}

simulate_shared_data <- function() {
  map(seq_len(n_studies), simulate_study) |>
    list_rbind()
}

data_shared <- simulate_shared_data()
head(data_shared, 8) |>
  kable()
```

| study | treatment |       m1i |      sd1i | n1i |        m2i |      sd2i | n2i |
|------:|:----------|----------:|----------:|----:|-----------:|----------:|----:|
|     1 | A         | 0.5584744 | 1.2703962 |  50 | -0.0572681 | 1.0382770 | 100 |
|     1 | B         | 0.5863768 | 1.0192185 |  50 | -0.0572681 | 1.0382770 | 100 |
|     1 | C         | 0.4888245 | 1.0316215 |  50 | -0.0572681 | 1.0382770 | 100 |
|     1 | D         | 0.6783239 | 1.0082329 |  50 | -0.0572681 | 1.0382770 | 100 |
|     2 | A         | 0.5841636 | 0.9994624 |  50 |  0.1652506 | 0.9526829 | 100 |
|     2 | B         | 0.4432520 | 1.0424934 |  50 |  0.1652506 | 0.9526829 | 100 |
|     2 | C         | 0.4694546 | 1.0908066 |  50 |  0.1652506 | 0.9526829 | 100 |
|     2 | D         | 0.6020801 | 1.0299267 |  50 |  0.1652506 | 0.9526829 | 100 |

The treatment columns (`m1i`, `sd1i`, `n1i`) differ between treatment conditions, but the control columns (`m2i`, `sd2i`, `n2i`) are identical within a study.

`escalc()` converts the group summaries into effect sizes. With `measure = "SMD"` it returns Hedges’ g and its sampling variance as `yi` and `vi`.

``` r
data_shared <- escalc(
  measure = "SMD",
  m1i = m1i,
  sd1i = sd1i,
  n1i = n1i,
  m2i = m2i,
  sd2i = sd2i,
  n2i = n2i,
  data = data_shared
)

data_shared |>
  head(8) |>
  kable()
```

| study | treatment | m1i | sd1i | n1i | m2i | sd2i | n2i | yi | vi |
|---:|:---|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | A | 0.5584744 | 1.2703962 | 50 | -0.0572681 | 1.0382770 | 100 | 0.5467518 | 0.0309965 |
| 1 | B | 0.5863768 | 1.0192185 | 50 | -0.0572681 | 1.0382770 | 100 | 0.6205165 | 0.0312835 |
| 1 | C | 0.4888245 | 1.0316215 | 50 | -0.0572681 | 1.0382770 | 100 | 0.5244004 | 0.0309167 |
| 1 | D | 0.6783239 | 1.0082329 | 50 | -0.0572681 | 1.0382770 | 100 | 0.7116275 | 0.0316880 |
| 2 | A | 0.5841636 | 0.9994624 | 50 | 0.1652506 | 0.9526829 | 100 | 0.4303769 | 0.0306174 |
| 2 | B | 0.4432520 | 1.0424934 | 50 | 0.1652506 | 0.9526829 | 100 | 0.2812799 | 0.0302637 |
| 2 | C | 0.4694546 | 1.0908066 | 50 | 0.1652506 | 0.9526829 | 100 | 0.3025000 | 0.0303050 |
| 2 | D | 0.6020801 | 1.0299267 | 50 | 0.1652506 | 0.9526829 | 100 | 0.4439649 | 0.0306570 |

Each row now has an effect size (`yi`) and its sampling variance (`vi`). A naive model with 30 studies of four effect sizes each treats all 120 as independent, so the confidence interval it reports is narrower than the evidence warrants.

``` r
fit_naive_shared <- rma(yi, vi, data = data_shared)
fit_naive_shared
```


    Random-Effects Model (k = 120; tau^2 estimator: REML)

    tau^2 (estimated amount of total heterogeneity): 0 (SE = 0.0040)
    tau (square root of estimated tau^2 value):      0
    I^2 (total heterogeneity / total variability):   0.00%
    H^2 (total variability / sampling variability):  1.00

    Test for Heterogeneity:
    Q(df = 119) = 100.1746, p-val = 0.8939

    Model Results:

    estimate      se     zval    pval   ci.lb   ci.ub      
      0.4605  0.0160  28.7446  <.0001  0.4291  0.4919  *** 

    ---
    Signif. codes:  0 '***' 0.001 '**' 0.01 '*' 0.05 '.' 0.1 ' ' 1

### Known covariance

The compute strategy fills in the missing covariances. A covariance is a correlation times the two standard errors, and the variances are already in `vi`, so for each off-diagonal term the only thing missing is the correlation between the pair. For a shared control, that correlation is fixed by the group sizes, reflecting how much of each effect size’s sampling variance comes from the common control. It works out to `n_treatment / (n_treatment + n_control)`, or 0.33 with these sample sizes.

To turn that into the full variance-covariance matrix `V`, we use `vcalc()`. It needs to know which groups each effect size compares. The data has no such labels yet, so we add them first: a distinct id for each treatment and a single shared id for the control. `vcalc()` reads the treatment id as `grp1` and the control id as `grp2`, recognizes that the rows in a study share the control, and combines that with the group sizes passed as `w1` and `w2`. Without them `vcalc()` would assume equally large groups and a correlation of 0.5, too high here since the treatments (50) are smaller than the control (100). Finally, `rma.mv()` takes `V` in place of `vi`.

``` r
data_shared <- mutate(
  data_shared,
  id_treatment = match(treatment, LETTERS) + 1L,
  id_control = 1L
)

V <- vcalc(
  vi,
  cluster = study,
  grp1 = id_treatment,
  grp2 = id_control,
  w1 = n1i,
  w2 = n2i,
  data = data_shared
)

fit_corr_shared <- rma.mv(yi, V, data = data_shared)
```

### Robust variance estimation

Computing the covariance is not the only option to address the dependence. We can also bypass the problem using **robust variance estimation (RVE)**. Instead of deriving the standard error from an assumed variance structure, it estimates it empirically from the residuals, clustered by study, so the variance of the effect comes from how much whole studies vary. This gives the right standard error regardless of the within-study covariance, without ever specifying it. The limitation is that it needs enough studies to be stable. It is applied by passing the fitted model to `robust()` with a cluster variable.

``` r
fit_rve_shared <- robust(fit_naive_shared, cluster = data_shared$study)
```

### Comparing the models

In the table below, we compare the three models.

<details class="code-fold">
<summary>Code</summary>

``` r
model_summary <- function(fit) {
  tibble(
    Estimate = fit$beta[[1]],
    SE = fit$se,
    `CI lower` = fit$ci.lb,
    `CI upper` = fit$ci.ub
  )
}

bind_rows(
  Naive = model_summary(fit_naive_shared),
  `Known covariance` = model_summary(fit_corr_shared),
  RVE = model_summary(fit_rve_shared),
  .id = "Model"
) |>
  knitr::kable(digits = 3)
```

</details>

| Model            | Estimate |    SE | CI lower | CI upper |
|:-----------------|---------:|------:|---------:|---------:|
| Naive            |    0.460 | 0.016 |    0.429 |    0.492 |
| Known covariance |    0.459 | 0.023 |    0.415 |    0.504 |
| RVE              |    0.460 | 0.020 |    0.419 |    0.502 |

The point estimates are similar, but the naive model reports a smaller standard error and narrower confidence interval than either corrected model.

A narrower interval is not automatically the wrong one, though. The naive model might be right and the corrections overcautious, or the naive model might be overconfident. The table above cannot settle the question, because a single dataset shows only whether each interval contained the true effect or not, and one hit or miss says little about how often the model’s intervals contain the true effect in the long run.

To assess this, we use coverage: the fraction of a model’s confidence intervals, across many repeated samples, that contain the true value. A valid 95% interval should have coverage of 95%. An interval that is too narrow, claiming more precision than the data support, has coverage below that; one that is too wide has coverage above it. Because the data are simulated, we can measure coverage directly. The check below generates 1,000 datasets, fits all three models to each, and records how often each model’s 95% interval contains 0.5.

``` r
simulate_once_shared <- function() {
  dat <- escalc(
    measure = "SMD",
    m1i = m1i,
    sd1i = sd1i,
    n1i = n1i,
    m2i = m2i,
    sd2i = sd2i,
    n2i = n2i,
    data = simulate_shared_data()
  ) |>
    mutate(
      grp_treatment = match(treatment, LETTERS) + 1L,
      grp_control = 1L
    )

  V <- vcalc(
    vi,
    cluster = study,
    grp1 = grp_treatment,
    grp2 = grp_control,
    w1 = n1i,
    w2 = n2i,
    data = dat
  )

  fit_naive <- rma(yi, vi, data = dat)
  fit_corr <- rma.mv(yi, V, data = dat)
  fit_rve <- robust(fit_naive, cluster = dat$study)

  tibble(
    naive = delta > fit_naive$ci.lb & delta < fit_naive$ci.ub,
    corrected = delta > fit_corr$ci.lb & delta < fit_corr$ci.ub,
    rve = delta > fit_rve$ci.lb & delta < fit_rve$ci.ub
  )
}

results_shared <- map(seq_len(1000), \(i) simulate_once_shared()) |>
  list_rbind()

results_shared |>
  summarise(across(everything(), mean)) |>
  pivot_longer(everything(), names_to = "model", values_to = "coverage") |>
  mutate(
    model = factor(
      model,
      levels = c("naive", "corrected", "rve"),
      labels = c("Naive", "Known covariance", "Robust (RVE)")
    )
  ) |>
  ggplot(aes(x = model, y = coverage)) +
  geom_col(fill = "steelblue", width = 0.5) +
  geom_hline(yintercept = 0.95, linetype = "dashed") +
  scale_y_continuous(limits = c(0, 1), labels = scales::percent) +
  labs(x = NULL, y = "Coverage")
```

![](index_files/figure-commonmark/simulation-shared-1.svg)

The naive model falls short of 95%, while both corrections are well calibrated. Computing the covariance is the better choice here, though: it uses the covariance implied by the group sizes rather than estimating the standard error, so it is more efficient and stays valid even with few studies.

### Adding between-study heterogeneity

So far every simulated study has shared the same true effect of 0.5, which kept the shared control as the only source of dependence. Real studies differ in their populations, interventions, and measures, so their true effects vary. That variation, between-study heterogeneity, adds a second kind of dependence within each study: the four effects now share not only a control group but a common true effect. Now we test whether the known-covariance model and RVE still cover correctly once both are present.

The simulation gains one step. Each study draws its own true effect from a normal distribution centered on 0.5, and its treatment groups are generated around that study-specific value. The spread of those true effects is set by `tau2_between`.

``` r
tau2_between <- 0.01 # variance of true effects across studies

simulate_hetero_study <- function(study) {
  study_effect <- rnorm(1, delta, sqrt(tau2_between))
  control <- rnorm(n_control, mean = 0, sd = sigma)
  treatments <- map(
    seq_len(n_conditions),
    \(a) rnorm(n_treatment, mean = study_effect * sigma, sd = sigma)
  )

  tibble(
    study = study,
    treatment = LETTERS[seq_len(n_conditions)],
    m1i = map_dbl(treatments, mean),
    sd1i = map_dbl(treatments, sd),
    n1i = n_treatment,
    m2i = mean(control),
    sd2i = sd(control),
    n2i = n_control
  )
}

simulate_hetero_data <- function() {
  map(seq_len(n_studies), simulate_hetero_study) |>
    list_rbind()
}
```

The only change from the previous simulation is that each study first draws its own true effect from a normal distribution before generating treatment group scores; the rest is identical.

The coverage check now fits four models to 1,000 datasets: the naive model, the known-covariance model, the known-covariance model with a study-level random effect added, and RVE.

``` r
simulate_once_hetero <- function() {
  dat <- escalc(
    measure = "SMD",
    m1i = m1i,
    sd1i = sd1i,
    n1i = n1i,
    m2i = m2i,
    sd2i = sd2i,
    n2i = n2i,
    data = simulate_hetero_data()
  ) |>
    mutate(
      grp_treatment = match(treatment, LETTERS) + 1L,
      grp_control = 1L
    )

  V <- vcalc(
    vi,
    cluster = study,
    grp1 = grp_treatment,
    grp2 = grp_control,
    w1 = n1i,
    w2 = n2i,
    data = dat
  )

  fit_naive <- rma(yi, vi, data = dat)
  fit_corr <- rma.mv(yi, V, data = dat)
  fit_re <- rma.mv(yi, vi, random = ~ 1 | study, data = dat)
  fit_corr_re <- rma.mv(yi, V, random = ~ 1 | study, data = dat)
  fit_rve <- robust(fit_naive, cluster = dat$study)

  tibble(
    naive = delta > fit_naive$ci.lb & delta < fit_naive$ci.ub,
    corrected = delta > fit_corr$ci.lb & delta < fit_corr$ci.ub,
    corrected_re = delta > fit_corr_re$ci.lb & delta < fit_corr_re$ci.ub,
    rve = delta > fit_rve$ci.lb & delta < fit_rve$ci.ub,
    re = delta > fit_re$ci.lb & delta < fit_re$ci.ub,
    tau2_re = fit_re$sigma2[1],
    tau2_corr_re = fit_corr_re$sigma2[1]
  )
}

results_hetero <- map(seq_len(1000), \(i) simulate_once_hetero()) |>
  list_rbind()

results_hetero |>
  select(naive, corrected, corrected_re, rve) |>
  summarise(across(everything(), mean)) |>
  pivot_longer(everything(), names_to = "model", values_to = "coverage") |>
  mutate(
    model = factor(
      model,
      levels = c("naive", "corrected", "corrected_re", "rve"),
      labels = c(
        "Naive",
        "Known covariance",
        "Known covariance\n+ random effect",
        "Robust (RVE)"
      )
    )
  ) |>
  ggplot(aes(x = model, y = coverage)) +
  geom_col(fill = "steelblue", width = 0.5) +
  geom_hline(yintercept = 0.95, linetype = "dashed") +
  scale_y_continuous(limits = c(0, 1), labels = scales::percent) +
  labs(x = NULL, y = "Coverage")
```

![](index_files/figure-commonmark/simulation-hetero-1.svg)

The naive and known-covariance models both fall short, but not equally. Modeling the shared control through `V` closes much of the gap. It still misses 95%, though, because `V` represents only the covariance the shared control creates. The shared true effect is a different kind of dependence, one a fixed-effects model has no term for, so the uncertainty in the mean stays understated.

What the known-covariance model is missing is a term for that shared true effect. A study-level random effect supplies it, and on its own restores coverage to near 95%. The model shown in the plot, `rma.mv(yi, V, random = ~ 1 | study)`, includes `V` as well, not because coverage needs it but because `V` matters for the heterogeneity estimate discussed next. RVE is equally well calibrated here: clustering by study captures whatever dependence exists within a study’s effect sizes, whether it comes from a shared control group or shared true effects, without modeling either source explicitly.

### Heterogeneity estimation

Coverage answers only one of two questions a meta-analysis typically asks. The other is how much the true effect varies between studies, quantified as `τ²`. Knowing `τ²` matters because it shapes how well the overall effect estimate generalizes: a large `τ²` means the mean effect is a poor guide to any single new study, and the prediction interval for a new study will be wide. All models above recover the overall effect equally well, but they give different answers on `τ²`. The table below compares what a random effect alone and the same model with `V` estimate for `τ²`, against the true simulated value of 0.01.

``` r
tibble(
  Model = c("Random effect only", "V + random effect"),
  `Mean coverage` = c(
    mean(results_hetero$re),
    mean(results_hetero$corrected_re)
  ),
  `Estimated τ²` = c(
    mean(results_hetero$tau2_re),
    mean(results_hetero$tau2_corr_re)
  )
) |>
  knitr::kable(digits = 3)
```

| Model              | Mean coverage | Estimated τ² |
|:-------------------|--------------:|-------------:|
| Random effect only |         0.935 |        0.017 |
| V + random effect  |         0.932 |        0.010 |

Both cover the mean equally well, but their `τ²` estimates differ. Without `V`, the model has no term for the shared control, so it folds that sampling covariance into between-study variation and overstates `τ²`; with `V`, it recovers the simulated value. RVE offers no fix here: it corrects the mean’s standard error and leaves the variance components exactly as the underlying model estimated them.

Model specification depends on what is being estimated. For the overall effect, a random effect or RVE is enough, and the dependence never has to be modeled exactly. For the between-study variance, and the prediction interval built on it, you need `V` to separate genuine heterogeneity from the shared-control noise.
