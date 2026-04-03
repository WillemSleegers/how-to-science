---
title: Pairwise comparisons
---


``` r
# Load packages
library(MASS)
library(tidyverse)
library(viridis)
library(brms)
library(emmeans)

# Set the default ggplot theme
theme_set(theme_minimal())
```

This section is about different statistical techniques to analyze group differences.

## Bayesian

### Pairwise comparisons

In this scenario we simulate data from a study with 5 different groups. The conditions differ from each by a small amount and for simplicity’s sake each condition has a standard deviation of 1. The sample size per condition is 250.

``` r
# Set the simulation parameters
Ms <- c(0, 0.1, 0.2, 0.3, 0.4)
SDs <- 1
n <- 250

# Produce the variance-covariance matrix
Sigma <- matrix(
  nrow = length(Ms), 
  ncol = length(Ms), 
  data = c(
    SDs^2, 0, 0, 0, 0,
    0, SDs^2, 0, 0, 0,
    0, 0, SDs^2, 0, 0,
    0, 0, 0, SDs^2, 0,
    0, 0, 0, 0, SDs^2
  )
)

# Simulate the values
m <- mvrnorm(n = n, mu = Ms, Sigma = Sigma, empirical = TRUE)

# Prepare the data by converting it to a data frame and making it tidy
colnames(m) <- c("A", "B", "C", "D", "E")

data <- as_tibble(m)

data <- pivot_longer(
  data = data, 
  cols = everything(), 
  names_to = "condition", 
  values_to = "DV"
)

data <- mutate(data, id = 1:n(), .before = condition)
```

To perform the pairwise comparisons we first fit a model with `brms`. If we also want to calculate Bayes factors, we need to set a prior for the intercept. For technical reasons, this needs to be done by explicitly including the intercept in the formula. After that we need to set 3 priors: 1 for the intercept, 1 for all the other coefficients, and one for sigma. We’ll set some weak priors because we don’t have any additional information about this simulated data.

``` r
model <- brm(
  formula = DV ~ 0 + Intercept + condition, 
  data = data, 
  family = gaussian(), 
  prior = c(
    set_prior(coef = "Intercept", prior = "normal(0, 1)"),
    set_prior(class = "b", prior = "normal(0, 1)"),
    set_prior(class = "sigma", prior = "normal(1, 1)")
  ), 
  sample_prior = TRUE
)
```

    Compiling Stan program...

    Start sampling


    SAMPLING FOR MODEL 'anon_model' NOW (CHAIN 1).
    Chain 1: 
    Chain 1: Gradient evaluation took 2.5e-05 seconds
    Chain 1: 1000 transitions using 10 leapfrog steps per transition would take 0.25 seconds.
    Chain 1: Adjust your expectations accordingly!
    Chain 1: 
    Chain 1: 
    Chain 1: Iteration:    1 / 2000 [  0%]  (Warmup)
    Chain 1: Iteration:  200 / 2000 [ 10%]  (Warmup)
    Chain 1: Iteration:  400 / 2000 [ 20%]  (Warmup)
    Chain 1: Iteration:  600 / 2000 [ 30%]  (Warmup)
    Chain 1: Iteration:  800 / 2000 [ 40%]  (Warmup)
    Chain 1: Iteration: 1000 / 2000 [ 50%]  (Warmup)
    Chain 1: Iteration: 1001 / 2000 [ 50%]  (Sampling)
    Chain 1: Iteration: 1200 / 2000 [ 60%]  (Sampling)
    Chain 1: Iteration: 1400 / 2000 [ 70%]  (Sampling)
    Chain 1: Iteration: 1600 / 2000 [ 80%]  (Sampling)
    Chain 1: Iteration: 1800 / 2000 [ 90%]  (Sampling)
    Chain 1: Iteration: 2000 / 2000 [100%]  (Sampling)
    Chain 1: 
    Chain 1:  Elapsed Time: 0.073 seconds (Warm-up)
    Chain 1:                0.071 seconds (Sampling)
    Chain 1:                0.144 seconds (Total)
    Chain 1: 

    SAMPLING FOR MODEL 'anon_model' NOW (CHAIN 2).
    Chain 2: 
    Chain 2: Gradient evaluation took 7e-06 seconds
    Chain 2: 1000 transitions using 10 leapfrog steps per transition would take 0.07 seconds.
    Chain 2: Adjust your expectations accordingly!
    Chain 2: 
    Chain 2: 
    Chain 2: Iteration:    1 / 2000 [  0%]  (Warmup)
    Chain 2: Iteration:  200 / 2000 [ 10%]  (Warmup)
    Chain 2: Iteration:  400 / 2000 [ 20%]  (Warmup)
    Chain 2: Iteration:  600 / 2000 [ 30%]  (Warmup)
    Chain 2: Iteration:  800 / 2000 [ 40%]  (Warmup)
    Chain 2: Iteration: 1000 / 2000 [ 50%]  (Warmup)
    Chain 2: Iteration: 1001 / 2000 [ 50%]  (Sampling)
    Chain 2: Iteration: 1200 / 2000 [ 60%]  (Sampling)
    Chain 2: Iteration: 1400 / 2000 [ 70%]  (Sampling)
    Chain 2: Iteration: 1600 / 2000 [ 80%]  (Sampling)
    Chain 2: Iteration: 1800 / 2000 [ 90%]  (Sampling)
    Chain 2: Iteration: 2000 / 2000 [100%]  (Sampling)
    Chain 2: 
    Chain 2:  Elapsed Time: 0.082 seconds (Warm-up)
    Chain 2:                0.065 seconds (Sampling)
    Chain 2:                0.147 seconds (Total)
    Chain 2: 

    SAMPLING FOR MODEL 'anon_model' NOW (CHAIN 3).
    Chain 3: 
    Chain 3: Gradient evaluation took 7e-06 seconds
    Chain 3: 1000 transitions using 10 leapfrog steps per transition would take 0.07 seconds.
    Chain 3: Adjust your expectations accordingly!
    Chain 3: 
    Chain 3: 
    Chain 3: Iteration:    1 / 2000 [  0%]  (Warmup)
    Chain 3: Iteration:  200 / 2000 [ 10%]  (Warmup)
    Chain 3: Iteration:  400 / 2000 [ 20%]  (Warmup)
    Chain 3: Iteration:  600 / 2000 [ 30%]  (Warmup)
    Chain 3: Iteration:  800 / 2000 [ 40%]  (Warmup)
    Chain 3: Iteration: 1000 / 2000 [ 50%]  (Warmup)
    Chain 3: Iteration: 1001 / 2000 [ 50%]  (Sampling)
    Chain 3: Iteration: 1200 / 2000 [ 60%]  (Sampling)
    Chain 3: Iteration: 1400 / 2000 [ 70%]  (Sampling)
    Chain 3: Iteration: 1600 / 2000 [ 80%]  (Sampling)
    Chain 3: Iteration: 1800 / 2000 [ 90%]  (Sampling)
    Chain 3: Iteration: 2000 / 2000 [100%]  (Sampling)
    Chain 3: 
    Chain 3:  Elapsed Time: 0.078 seconds (Warm-up)
    Chain 3:                0.076 seconds (Sampling)
    Chain 3:                0.154 seconds (Total)
    Chain 3: 

    SAMPLING FOR MODEL 'anon_model' NOW (CHAIN 4).
    Chain 4: 
    Chain 4: Gradient evaluation took 7e-06 seconds
    Chain 4: 1000 transitions using 10 leapfrog steps per transition would take 0.07 seconds.
    Chain 4: Adjust your expectations accordingly!
    Chain 4: 
    Chain 4: 
    Chain 4: Iteration:    1 / 2000 [  0%]  (Warmup)
    Chain 4: Iteration:  200 / 2000 [ 10%]  (Warmup)
    Chain 4: Iteration:  400 / 2000 [ 20%]  (Warmup)
    Chain 4: Iteration:  600 / 2000 [ 30%]  (Warmup)
    Chain 4: Iteration:  800 / 2000 [ 40%]  (Warmup)
    Chain 4: Iteration: 1000 / 2000 [ 50%]  (Warmup)
    Chain 4: Iteration: 1001 / 2000 [ 50%]  (Sampling)
    Chain 4: Iteration: 1200 / 2000 [ 60%]  (Sampling)
    Chain 4: Iteration: 1400 / 2000 [ 70%]  (Sampling)
    Chain 4: Iteration: 1600 / 2000 [ 80%]  (Sampling)
    Chain 4: Iteration: 1800 / 2000 [ 90%]  (Sampling)
    Chain 4: Iteration: 2000 / 2000 [100%]  (Sampling)
    Chain 4: 
    Chain 4:  Elapsed Time: 0.078 seconds (Warm-up)
    Chain 4:                0.07 seconds (Sampling)
    Chain 4:                0.148 seconds (Total)
    Chain 4: 

``` r
model
```

     Family: gaussian 
      Links: mu = identity 
    Formula: DV ~ 0 + Intercept + condition 
       Data: data (Number of observations: 1250) 
      Draws: 4 chains, each with iter = 2000; warmup = 1000; thin = 1;
             total post-warmup draws = 4000

    Regression Coefficients:
               Estimate Est.Error l-95% CI u-95% CI Rhat Bulk_ESS Tail_ESS
    Intercept      0.00      0.06    -0.12     0.12 1.00     1438     2234
    conditionB     0.10      0.09    -0.08     0.27 1.00     1786     2513
    conditionC     0.20      0.09     0.02     0.37 1.00     1854     2733
    conditionD     0.30      0.09     0.13     0.47 1.00     1944     2811
    conditionE     0.40      0.09     0.23     0.57 1.00     1831     2446

    Further Distributional Parameters:
          Estimate Est.Error l-95% CI u-95% CI Rhat Bulk_ESS Tail_ESS
    sigma     1.00      0.02     0.96     1.04 1.00     2886     2801

    Draws were sampled using sampling(NUTS). For each parameter, Bulk_ESS
    and Tail_ESS are effective sample size measures, and Rhat is the potential
    scale reduction factor on split chains (at convergence, Rhat = 1).

The estimates range, as expected, from 0 for the intercept to 0.40 for condition E.

If we want pairwise comparisons, we can use the `emmeans` package to obtain them. We use the `emmeans()` function and set the `specs` argument to `pairwise ~ condition`. `pairwise` is a reserved term to use for exactly this purpose. The result is an object that contains estimated marginal means and contrasts. Since we’re interested in the pairwise comparisons we only print the contrasts.

``` r
emmeans <- emmeans(model, specs = pairwise ~ condition)

contrasts <- emmeans$contrasts
contrasts
```

     contrast estimate lower.HPD upper.HPD
     A - B      -0.101    -0.276    0.0704
     A - C      -0.197    -0.367   -0.0246
     A - D      -0.297    -0.479   -0.1368
     A - E      -0.396    -0.568   -0.2239
     B - C      -0.097    -0.268    0.0747
     B - D      -0.199    -0.370   -0.0265
     B - E      -0.298    -0.477   -0.1236
     C - D      -0.101    -0.273    0.0726
     C - E      -0.199    -0.377   -0.0220
     D - E      -0.101    -0.273    0.0724

    Point estimate displayed: median 
    HPD interval probability: 0.95 

This gives us the estimates as well as lower and upper bounds of a highest probability density intervals. We can also plot them using the following code.

``` r
contrasts <- as_tibble(contrasts)

ggplot(contrasts, aes(x = contrast, y = estimate)) +
  geom_pointrange(aes(ymin = lower.HPD, ymax = upper.HPD)) +
  labs(x = "Contrast", y = "Estimate with 95% HPD")
```

![Pairwise comparisons via `emmeans`](index_files/figure-commonmark/pairwise-comparisons-plot-1.svg)

Alternatively, we can also calculate specific contrasts using the `hypothesis()` function from `brms`. The added value of calculating contrasts this way is that it also provides us with a Bayes factor if we set priors for all parts of the model.

For example, we can get the contrast between condition A and B by subtracting the Intercept from the condition B coefficient. We can then get an evidence ratio for the test that this value is larger than 0. This value is simply the ratio of the number of samples larger (or smaller) than a value to the number of samples smaller (or larger) than the value.

``` r
contrast_A_B <- hypothesis(model, "conditionB - Intercept > 0")
contrast_A_B
```

    Hypothesis Tests for class b:
                    Hypothesis Estimate Est.Error CI.Lower CI.Upper Evid.Ratio
    1 (conditionB-Inter... > 0      0.1      0.14    -0.13     0.32       3.18
      Post.Prob Star
    1      0.76     
    ---
    'CI': 90%-CI for one-sided and 95%-CI for two-sided hypotheses.
    '*': For one-sided hypotheses, the posterior probability exceeds 95%;
    for two-sided hypotheses, the value tested against lies outside the 95%-CI.
    Posterior probabilities of point hypotheses assume equal prior probabilities.

``` r
# sum(contrast_A_B$samples$H1 > 0) / sum(contrast_A_B$samples$H1 < 0)
```

This gives us an estimate of 0.1 (as expected) and an evidence ratio of 3.1797283.

We can also test whether this contrast is equal to 0. This is a Bayes factor computed via the Savage-Dickey density ratio method. That is, the posterior density at a point of interest is divided by the prior density at the same point.

``` r
contrast_A_B_null <- hypothesis(model, "conditionB - Intercept = 0")
contrast_A_B_null
```

    Hypothesis Tests for class b:
                    Hypothesis Estimate Est.Error CI.Lower CI.Upper Evid.Ratio
    1 (conditionB-Inter... = 0      0.1      0.14    -0.18     0.36       7.18
      Post.Prob Star
    1      0.88     
    ---
    'CI': 90%-CI for one-sided and 95%-CI for two-sided hypotheses.
    '*': For one-sided hypotheses, the posterior probability exceeds 95%;
    for two-sided hypotheses, the value tested against lies outside the 95%-CI.
    Posterior probabilities of point hypotheses assume equal prior probabilities.

This gives us a Bayes factor of 7.1787155.

Alternatively, we can compare another contrast, say, D vs. B. We can get this contrast by subtracting the coefficient for condition B from the coefficient for condition D.

``` r
contrast_D_B <- hypothesis(model, "conditionD - conditionB > 0")
contrast_D_B
```

    Hypothesis Tests for class b:
                    Hypothesis Estimate Est.Error CI.Lower CI.Upper Evid.Ratio
    1 (conditionD-condi... > 0      0.2      0.09     0.05     0.34      75.92
      Post.Prob Star
    1      0.99    *
    ---
    'CI': 90%-CI for one-sided and 95%-CI for two-sided hypotheses.
    '*': For one-sided hypotheses, the posterior probability exceeds 95%;
    for two-sided hypotheses, the value tested against lies outside the 95%-CI.
    Posterior probabilities of point hypotheses assume equal prior probabilities.

As expected, we see an estimate of 0.2 (0.4 - 0.2). We also see an evidence ratio of 75.9230769 for the hypothesis that this is larger than 0.
