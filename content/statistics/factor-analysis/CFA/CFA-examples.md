---
title: CFA - Examples
order: 3
---


``` r
# Load packages
library(tidyverse)
```

    ── Attaching core tidyverse packages ──────────────────────── tidyverse 2.0.0 ──
    ✔ dplyr     1.2.0     ✔ readr     2.2.0
    ✔ forcats   1.0.1     ✔ stringr   1.6.0
    ✔ ggplot2   4.0.2     ✔ tibble    3.3.1
    ✔ lubridate 1.9.5     ✔ tidyr     1.3.2
    ✔ purrr     1.2.1     
    ── Conflicts ────────────────────────────────────────── tidyverse_conflicts() ──
    ✖ dplyr::filter() masks stats::filter()
    ✖ dplyr::lag()    masks stats::lag()
    ℹ Use the conflicted package (<http://conflicted.r-lib.org/>) to force all conflicts to become errors

``` r
library(lavaan)
```

    This is lavaan 0.6-21
    lavaan is FREE software! Please report any bugs.

``` r
library(dynamic)
```

    Beta version. Please report bugs: https://github.com/melissagwolf/dynamic/issues.

## Rosenberg Self-Esteem Scale

The Rosenberg self-esteem scale (Rosenberg, 1989) is a unidimensional scale to assess global self-esteem. It is one of the most commonly used scales in psychology and could therefore serve as a nice illustration of how to assess whether the data fits a single factor model.

It should be noted, however, that apparently there is some controversy whether the scale is actually unifactorial (Donnellan et al., 2016).

### The Data

``` r
# Load data
items <- read_csv("RSECSV.csv")
```

    Rows: 1127 Columns: 10
    ── Column specification ────────────────────────────────────────────────────────
    Delimiter: ","
    dbl (10): R1, R2, R3, R4, R5, R6, R7, R8, R9, R10

    ℹ Use `spec()` to retrieve the full column specification for this data.
    ℹ Specify the column types or set `show_col_types = FALSE` to quiet this message.

``` r
# Data preparation
# Replace all -9999 values with NA
items <- mutate(items, across(everything(), ~ na_if(.x, -9999)))
```

The data was taken from Donnellan et al. (2016), who conducted a study to assess the factorial structure of the RSE. The data consists of `nrow(items)` participants, who were college students at a public university in the Southwestern United States.

### The Model

``` r
model <- "
  self_esteem =~ R1 + R2 + R3 + R4 + R5 + R6 + R7 + R8 + R9 + R10
"

fit <- cfa(model = model, data = items, estimator = "MLR")
fitmeasures(fit, 
  fit.measures = c("pvalue", "pvalue.scaled", "srmr", "rmsea", "cfi"))
```

           pvalue pvalue.scaled          srmr         rmsea           cfi 
            0.000         0.000         0.082         0.165         0.802 

``` r
#fit_cutoffs <- cfaOne(fit)
```

## Marsh’s Self-Description Questionnaire

``` r
# Load data
marsh <- read_csv("marsh.csv")
```

    Rows: 15661 Columns: 13
    ── Column specification ────────────────────────────────────────────────────────
    Delimiter: ","
    dbl (13): Eng1, Eng2, Eng3, Eng4, Math1, Math2, Math3, Math4, Par1, Par2, Pa...

    ℹ Use `spec()` to retrieve the full column specification for this data.
    ℹ Specify the column types or set `show_col_types = FALSE` to quiet this message.

Data for this example is from 15,661 students in 10th grade who participated in the National Education Longitudinal Study of 1988. Items from this scale include:

Parents:

- My parents treat me fairly

- I do not like my parents very much

- I get along well with my parents

- My parents are usually unhappy or disappointed with what I do

- My parents understand me

English

- I learn things quickly in English classes

- English is one of my best subjects

- I get good marks in English

- I’m hopeless in English classes

Mathematics

- Mathematics is one of my best subjects

- I have always done well in mathematics

- I get good marks in mathematics

- I do badly in tests of mathematics

``` r
marsh_model <- "
  english =~ Eng1 + Eng2 + Eng3 + Eng4
  math    =~ Math1 + Math2 + Math3 + Math4
  parent  =~ Par1 + Par2 + Par3 + Par4 + Par5
"

marsh_fit <- cfa(model = marsh_model, data = marsh, estimator = "MLR")
fitmeasures(marsh_fit, 
  fit.measures = c("pvalue", "pvalue.scaled", "srmr", "rmsea", "cfi")
)
```

           pvalue pvalue.scaled          srmr         rmsea           cfi 
            0.000         0.000         0.051         0.083         0.935 

``` r
#marsh_fit_cutoffs <- cfaHB(marsh_fit)
```

<div id="refs" class="references csl-bib-body hanging-indent" entry-spacing="0" line-spacing="2">

<div id="ref-donnellan2016" class="csl-entry">

Donnellan, M. B., Ackerman, R. A., & Brecheen, C. (2016). Extending structural analyses of the Rosenberg self-esteem scale to consider criterion-related validity: Can composite self-esteem scores be good enough? *Journal of Personality Assessment*, *98*(2), 169–177. <https://doi.org/10.1080/00223891.2015.1058268>

</div>

</div>
