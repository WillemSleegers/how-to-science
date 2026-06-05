# Working notes — Dependent effect sizes (shared control groups)

Investigation log and verified findings behind `index.qmd`. **Not served** (not registered
in `_nav.yml`, and the render watcher only processes `.qmd`). Numbers come from simulations
run during development; re-run before quoting any in the page.

## Canonical simulation setup

- 30 studies; each has **4 treatment arms (n = 50 each)** compared to **one shared control (n = 100)**.
- Effect size: standardized mean difference (Hedges *g*) via `escalc(measure = "SMD")`.
- True SMD `delta = 0.5`, common within-group SD `sigma = 1`.
- Data generated at the **participant level** (per-group means/SDs/Ns), so the shared-control
  dependence emerges naturally: all 4 arms divide by the same sampled control mean/SD.
- Between-study heterogeneity `tau2`: 0 for the main (homogeneous) case; the heterogeneity
  subsection uses `tau2 = 0.01`.
- Larger control by design = the square-root (Dunnett) allocation rule: a shared control is
  reused across all *k* comparisons, so the efficient size is ≈ √k × arm size.

## The four strategies (framing) and how they map to code

| Strategy | Model | metafor |
|---|---|---|
| Compute the covariance | known V from group sizes | `vcalc()` → `rma.mv(yi, V)` |
| Assume the covariance | constant assumed correlation ρ (CHE) | `vcalc(rho=...)` → `rma.mv` |
| Estimate the covariance | study-level random effect | `rma.mv(yi, vi, random = ~1|study)` |
| Bypass the covariance | sandwich estimator | `robust(rma(yi, vi), cluster=study)` |

The within-study correlation from a shared control (equal arms) is `r = n_t/(n_t+n_c)`; with
50/100 that's ≈ 0.33. `vcalc` builds covariance = correlation × the two SEs; the correlation
comes from the group sizes (`w1`,`w2`); omitting them defaults to equal groups → ρ = 0.5.

## Verified coverage of the MEAN (1000 reps)

Homogeneous (`tau2 = 0`): naive 0.854 · known-V 0.955 · RVE 0.955.

Heterogeneous (`tau2 = 0.01`):

| naive | V only (fixed) | random-effect only | V + random | RVE |
|---|---|---|---|---|
| 0.766 | 0.871 | 0.938 | 0.937 | 0.945 |

Key results:

1. **Naive under-covers** (ignores the shared-control covariance). Bigger gap with more arms
   per study (design effect ≈ 1 + (m−1)·r): 2 arms ≈ 0.90, 4 arms ≈ 0.81, 6 arms (small
   control) ≈ 0.65.
2. **For the mean, a study random effect alone is essentially as good as V + random or RVE**
   (≈ 0.93–0.94). V is *not* needed for mean coverage. This held even with an irregular
   (two-controls-per-study, block) structure: random-effect-only ≈ V + random for the mean.
3. **V-only (fixed effects) under-covers once heterogeneity is present** (0.871), because it
   models the sampling covariance but has no term for between-study variance. Crossover with
   naive at `tau2 ≈ 3·cov_shared`; below that V-only beats naive, above it can be worse.

### Why the random effect suffices for the mean
A shared control is a single **per-study common shock** (added equally to all arms), which is
structurally identical to a study random effect. The estimated `sigma2` absorbs the *sum* of
true heterogeneity and the shared-control covariance, and the mean's SE depends only on that
total study-level variance. Conditions for this to work: dependence shaped like a per-study
nudge (compound-symmetric), and **enough studies** to estimate `sigma2` (≈20+); with few
studies `sigma2` is unstable / can hit 0, and then it reverts to ignoring the covariance and
under-covers — the regime where computed V wins for the mean too.

## Where V genuinely matters: heterogeneity and prediction intervals

**τ̂² is inflated without V** (random-effect-only mistakes shared-control noise for real
heterogeneity). Estimated `tau2` vs truth:

| true tau2 | random-effect only | V + random |
|---|---|---|
| 0.000 | 0.0076 | 0.0015 |
| 0.005 | 0.0126 | 0.0052 |
| 0.020 | 0.0275 | 0.0194 |

Bias ≈ +0.0075 (≈ the shared-control covariance). V + random recovers true `tau2`.

**RVE does NOT fix this.** Verified: `robust()` leaves `tau2` byte-for-byte unchanged
(0.0275 → 0.0275 without V; 0.0194 → 0.0194 with V). RVE robustifies the *mean's* SE only.
Consequence on intervals (`tau2 = 0.02`):

| | est tau2 | PI width | CI width |
|---|---|---|---|
| no V | 0.0275 | 0.654 | 0.133 |
| no V + RVE | 0.0275 | 0.683 | 0.133 |
| V | 0.0194 | 0.546 | 0.133 |
| V + RVE | 0.0194 | 0.570 | 0.138 |

Mean CI ≈ 0.13 everywhere (mean is robust to all of this). Prediction interval rides on τ̂²,
so omitting V leaves it ~20% too wide and **RVE can't pull it back**.

**Capstone conclusion (by estimand):** for the overall **mean**, RVE or a random effect is
robust and nearly foolproof — don't sweat the covariance. For **variation / prediction /
generalizability**, you must model the covariance (V / CHE) to get τ̂² right; RVE does nothing
for it. This is the reason V is not redundant, and matches the CHE+RVE recommendation.

### Caution: prediction-interval coverage is a confounded diagnostic
Standard PIs **under-cover by default**, independent of any dependence (plain RE, no
dependence, metafor PI = normal/plug-in):

| | k = 30 | k = 100 |
|---|---|---|
| tau2 0.02 (I² 35%) | 0.867 | 0.922 |
| tau2 0.05 (I² 59%) | 0.919 | 0.941 |
| tau2 0.15 (I² 81%) | 0.933 | 0.947 |
| tau2 0.40 (I² 92%) | 0.938 | 0.948 |

Worst at low I² / few studies; the `t(k−2)` correction barely helps. So **do not** demonstrate
"V matters" with a PI-coverage plot: the generic under-coverage dominates and the no-V model's
inflated τ̂² *widens* its PI, perversely making the wrong model look better calibrated. Use
τ̂² / PI **width** instead, with an honest small-k caveat.

## What's in the page now vs. parked

In the page: the four-strategy framing; the shared-control case study (compute V + RVE) with
coverage; the heterogeneity subsection (naive < V-only < V+random ≈ RVE); the one-line scope
note on the bypass bullet ("robust for the mean but silent on variation").

Parked / candidate future additions:
- **Multiple-outcomes case** (was drafted then dropped). Needs realistic *correlated sampling
  errors* (not just shared random effects); the **assume** strategy (CHE with constant ρ) is the
  natural fit and is currently listed in the framing but never demonstrated.
- **Prediction-interval section** — only if framed on inflated τ̂²/width (RVE doesn't fix it),
  never PI coverage. Include the small-k under-coverage caveat.
- **"Why not just RVE?" capstone** — average → RVE enough; variation/PI → need V.
- Tighten the **"Assume them"** bullet to name the mechanism (constant assumed ρ plugged into V).

## References (verified to exist)

- Harrer, Cuijpers, Furukawa & Ebert, *Doing Meta-Analysis with R* (free online,
  doing-meta.guide), multilevel/three-level + CHE chapter. States plainly that the standard
  multilevel model assumes the within-cluster sampling-error covariance is **zero**.
- Pustejovsky & Tipton (2022), "Meta-analysis with Robust Variance Estimation: Expanding the
  Range of Working Models," *Prevention Science* 23(3):425–438 — the **CHE** working model
  (assumed sampling correlation + hierarchical random effects + RVE).
- Hedges, Tipton & Johnson (2010), "Robust Variance Estimation in Meta-Regression with
  Dependent Effect Size Estimates," *Research Synthesis Methods* — foundational RVE.
- Gleser & Olkin, "Stochastically Dependent Effect Sizes," chapter in *The Handbook of Research
  Synthesis and Meta-Analysis* — design-based shared-control covariance formulas.
- "Synthesizing effects for multiple outcomes per study using robust variance estimation versus
  the three-level model," *Behavior Research Methods* — direct RVE-vs-multilevel comparison.

## Honesty caveats on these sims

The "V is redundant for the mean" finding is specific to: one shared control, equal arms,
~30 studies, **mean** as the estimand. It weakens with few studies, non-cluster-shaped
dependence, or estimands that live inside the within-study structure (e.g. within-study
moderator slopes — not tested here, deliberately set aside as too complex for the page).
